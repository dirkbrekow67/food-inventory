// server/src/routes/inventoryRoutes.js

const express = require('express');
const db = require('../db');

const router = express.Router();

function formatDateLocal(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function addMonthsToDate(dateString, monthsToAdd) {
  if (!dateString || !monthsToAdd) {
    return null;
  }

  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const originalDay = date.getDate();

  date.setMonth(date.getMonth() + Number(monthsToAdd));

  if (date.getDate() !== originalDay) {
    date.setDate(0);
  }

  return formatDateLocal(date);
}

function calculateInternalUseUntilDate({
  isFrozenChilledFood,
  frozenDate,
  bestBeforeDate,
  internalExtensionMonths,
}) {
  if (!isFrozenChilledFood) {
    return null;
  }

  const baseDate = frozenDate || bestBeforeDate;

  return addMonthsToDate(baseDate, internalExtensionMonths);
}

function selectInventoryItemById(id) {
  return db.prepare(`
    SELECT
      inventory_items.*,

      products.name AS product_name,
      products.brand AS product_brand,
      products.category AS product_category,
      products.buy_again_status AS product_buy_again_status,
      products.favorite AS product_favorite,

      storage_units.name AS storage_unit_name,
      storage_units.type AS storage_unit_type,

      storage_compartments.name AS storage_compartment_name,
      storage_compartments.type AS storage_compartment_type,

      label_slots.label_code AS label_code,
      label_slots.status AS label_status,
      label_slots.print_status AS label_print_status,

      COALESCE(
        inventory_items.internal_use_until_date,
        inventory_items.best_before_date
      ) AS effective_use_date

    FROM inventory_items
    JOIN products ON products.id = inventory_items.product_id
    JOIN storage_units ON storage_units.id = inventory_items.storage_unit_id
    LEFT JOIN storage_compartments
      ON storage_compartments.id = inventory_items.storage_compartment_id
    LEFT JOIN label_slots
      ON label_slots.id = inventory_items.label_slot_id
    WHERE inventory_items.id = ?
  `).get(id);
}

router.get('/', (req, res) => {
  try {
    const items = db.prepare(`
      SELECT
        inventory_items.*,

        products.name AS product_name,
        products.brand AS product_brand,
        products.category AS product_category,
        products.buy_again_status AS product_buy_again_status,
        products.favorite AS product_favorite,

        storage_units.name AS storage_unit_name,
        storage_units.type AS storage_unit_type,

        storage_compartments.name AS storage_compartment_name,
        storage_compartments.type AS storage_compartment_type,

        label_slots.label_code AS label_code,
        label_slots.status AS label_status,
        label_slots.print_status AS label_print_status,

        COALESCE(
          inventory_items.internal_use_until_date,
          inventory_items.best_before_date
        ) AS effective_use_date

      FROM inventory_items
      JOIN products ON products.id = inventory_items.product_id
      JOIN storage_units ON storage_units.id = inventory_items.storage_unit_id
      LEFT JOIN storage_compartments
        ON storage_compartments.id = inventory_items.storage_compartment_id
      LEFT JOIN label_slots
        ON label_slots.id = inventory_items.label_slot_id
      WHERE inventory_items.status = 'available'
      ORDER BY
        effective_use_date IS NULL,
        effective_use_date,
        products.name COLLATE NOCASE
    `).all();

    res.json(items);
  } catch (error) {
    console.error('Error loading inventory items:', error);
    res.status(500).json({ error: 'Bestand konnte nicht geladen werden.' });
  }
});

router.post('/', (req, res) => {
  try {
    const {
      productId,
      storageUnitId,
      storageCompartmentId = null,

      originalQuantity = null,
      originalUnit = null,
      remainingQuantity = null,
      remainingUnit = null,
      remainingFractionNumerator = null,
      remainingFractionDenominator = null,
      quantityEstimated = 0,

      packageState = 'ungeoeffnet',
      bestBeforeDate = null,
      frozenDate = null,
      openedDate = null,
      notes = null,
      isFrozenChilledFood = 0,
      internalExtensionMonths = 6,
    } = req.body;

    if (!productId || !storageUnitId) {
      return res.status(400).json({
        error: 'Produkt und Lagergerät sind erforderlich.',
      });
    }

    const allowedPackageStates = [
      'ungeoeffnet',
      'angebrochen',
      'portioniert',
    ];

    const safePackageState = allowedPackageStates.includes(packageState)
      ? packageState
      : 'ungeoeffnet';

    const safeInternalExtensionMonths = internalExtensionMonths
      ? Number(internalExtensionMonths)
      : 6;

    const internalUseUntilDate = calculateInternalUseUntilDate({
      isFrozenChilledFood,
      frozenDate,
      bestBeforeDate,
      internalExtensionMonths: safeInternalExtensionMonths,
    });

    const createInventoryItem = db.transaction(() => {
      const freeLabelSlot = db.prepare(`
        SELECT *
        FROM label_slots
        WHERE status = 'free'
          AND print_status = 'printed'
        ORDER BY label_code
        LIMIT 1
      `).get();

      if (!freeLabelSlot) {
        const error = new Error('Keine freie Etiketten-ID verfügbar.');
        error.statusCode = 409;
        throw error;
      }

      const result = db.prepare(`
        INSERT INTO inventory_items
        (
          product_id,
          storage_unit_id,
          storage_compartment_id,
          original_quantity,
          original_unit,
          remaining_quantity,
          remaining_unit,
          remaining_fraction_numerator,
          remaining_fraction_denominator,
          quantity_estimated,
          package_state,
          best_before_date,
          frozen_date,
          opened_date,
          is_frozen_chilled_food,
          internal_extension_months,
          internal_use_until_date,
          label_slot_id,
          notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        productId,
        storageUnitId,
        storageCompartmentId || null,
        originalQuantity,
        originalUnit,
        remainingQuantity,
        remainingUnit,
        remainingFractionNumerator,
        remainingFractionDenominator,
        quantityEstimated ? 1 : 0,
        safePackageState,
        bestBeforeDate,
        frozenDate,
        openedDate,
        isFrozenChilledFood ? 1 : 0,
        safeInternalExtensionMonths,
        internalUseUntilDate,
        freeLabelSlot.id,
        notes
      );

      db.prepare(`
        UPDATE label_slots
        SET
          status = 'used',
          current_inventory_item_id = ?,
          last_used_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(result.lastInsertRowid, freeLabelSlot.id);

      return result.lastInsertRowid;
    });

    const newInventoryItemId = createInventoryItem();
    const item = selectInventoryItemById(newInventoryItemId);

    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating inventory item:', error);

    if (error.statusCode === 409) {
      return res.status(409).json({ error: error.message });
    }

    res.status(500).json({ error: 'Bestand konnte nicht angelegt werden.' });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const {
      storageUnitId,
      storageCompartmentId = null,

      originalQuantity = null,
      originalUnit = null,
      remainingQuantity = null,
      remainingUnit = null,
      remainingFractionNumerator = null,
      remainingFractionDenominator = null,
      quantityEstimated = 0,

      packageState = 'ungeoeffnet',
      bestBeforeDate = null,
      frozenDate = null,
      openedDate = null,
      notes = null,
      isFrozenChilledFood = 0,
      internalExtensionMonths = 6,
    } = req.body;

    if (!storageUnitId) {
      return res.status(400).json({
        error: 'Lagergerät ist erforderlich.',
      });
    }

    const existingItem = db.prepare(`
      SELECT *
      FROM inventory_items
      WHERE id = ?
        AND status = 'available'
    `).get(id);

    if (!existingItem) {
      return res.status(404).json({
        error: 'Bestandseintrag wurde nicht gefunden.',
      });
    }

    const allowedPackageStates = [
      'ungeoeffnet',
      'angebrochen',
      'portioniert',
    ];

    const safePackageState = allowedPackageStates.includes(packageState)
      ? packageState
      : 'ungeoeffnet';

    const safeInternalExtensionMonths = internalExtensionMonths
      ? Number(internalExtensionMonths)
      : 6;

    const internalUseUntilDate = calculateInternalUseUntilDate({
      isFrozenChilledFood,
      frozenDate,
      bestBeforeDate,
      internalExtensionMonths: safeInternalExtensionMonths,
    });

    db.prepare(`
      UPDATE inventory_items
      SET
        storage_unit_id = ?,
        storage_compartment_id = ?,
        original_quantity = ?,
        original_unit = ?,
        remaining_quantity = ?,
        remaining_unit = ?,
        remaining_fraction_numerator = ?,
        remaining_fraction_denominator = ?,
        quantity_estimated = ?,
        package_state = ?,
        best_before_date = ?,
        frozen_date = ?,
        opened_date = ?,
        is_frozen_chilled_food = ?,
        internal_extension_months = ?,
        internal_use_until_date = ?,
        notes = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      storageUnitId,
      storageCompartmentId || null,
      originalQuantity,
      originalUnit,
      remainingQuantity,
      remainingUnit,
      remainingFractionNumerator,
      remainingFractionDenominator,
      quantityEstimated ? 1 : 0,
      safePackageState,
      bestBeforeDate,
      frozenDate,
      openedDate,
      isFrozenChilledFood ? 1 : 0,
      safeInternalExtensionMonths,
      internalUseUntilDate,
      notes,
      id
    );

    const updatedItem = selectInventoryItemById(id);

    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating inventory item:', error);
    res.status(500).json({
      error: 'Bestandseintrag konnte nicht gespeichert werden.',
    });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const {
      removalReason = 'verbraucht',
      productBuyAgainStatus = null,
      saveToHistory = false,
      experienceReason = 'keine',
      experienceNote = null,
    } = req.body || {};

    const allowedRemovalReasons = [
      'verbraucht',
      'abgelaufen',
      'entsorgt',
      'falsch_erfasst',
      'verschenkt',
      'sonstiges',
    ];

    const allowedBuyAgainStatuses = [
      'neutral',
      'wieder_kaufen',
      'nicht_wieder_kaufen',
      'testen',
    ];

    const allowedExperienceReasons = [
      'keine',
      'zu_viel_gekauft',
      'kein_bedarf',
      'vergessen_uebersehen',
      'lagerort_unguenstig',
      'qualitaet_schlecht',
      'rezeptur_geschmack_veraendert',
      'preis_leistung_schlecht',
      'sonstiges',
    ];

    const safeExperienceReason = allowedExperienceReasons.includes(experienceReason)
      ? experienceReason
      : 'sonstiges';

    const safeExperienceNote =
      typeof experienceNote === 'string' && experienceNote.trim()
        ? experienceNote.trim()
        : null;

    const shouldSaveToHistory =
      saveToHistory === true || saveToHistory === 1 || saveToHistory === 'true';

    const safeRemovalReason = allowedRemovalReasons.includes(removalReason)
      ? removalReason
      : 'sonstiges';

    const safeProductBuyAgainStatus =
      productBuyAgainStatus &&
      allowedBuyAgainStatuses.includes(productBuyAgainStatus)
        ? productBuyAgainStatus
        : null;

    const effectiveShouldSaveToHistory =
      safeRemovalReason === 'falsch_erfasst' ? false : shouldSaveToHistory;

    const effectiveProductBuyAgainStatus =
      safeRemovalReason === 'falsch_erfasst' ? null : safeProductBuyAgainStatus;

    const effectiveExperienceReason =
      safeRemovalReason === 'falsch_erfasst' ? 'keine' : safeExperienceReason;

    const effectiveExperienceNote =
      safeRemovalReason === 'falsch_erfasst' ? null : safeExperienceNote;

    const removeInventoryItem = db.transaction(() => {
      const existingItem = db.prepare(`
          SELECT
            inventory_items.*,

            products.name AS product_name,
            products.brand AS product_brand,
            products.category AS product_category,
            products.country AS product_country,
            products.store AS product_store,
            products.buy_again_status AS product_buy_again_status,
            products.favorite AS product_favorite,

            label_slots.label_code AS label_code
          FROM inventory_items
          JOIN products ON products.id = inventory_items.product_id
          LEFT JOIN label_slots
            ON label_slots.id = inventory_items.label_slot_id
          WHERE inventory_items.id = ?
          AND inventory_items.status = 'available'
        `).get(id);

      if (!existingItem) {
        const error = new Error('Bestandseintrag wurde nicht gefunden.');
        error.statusCode = 404;
        throw error;
      }

      db.prepare(`
        UPDATE inventory_items
        SET
          status = 'removed',
          notes = CASE
            WHEN notes IS NULL OR notes = ''
              THEN ?
            ELSE notes || ' | ' || ?
          END,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        `Entfernt: ${safeRemovalReason}`,
        `Entfernt: ${safeRemovalReason}`,
        id
      );

      if (existingItem.label_slot_id) {
        db.prepare(`
          UPDATE label_slots
          SET
            status = 'free',
            print_status = 'printed',
            current_inventory_item_id = NULL,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(existingItem.label_slot_id);
      }

      let updatedProduct = null;

      if (effectiveProductBuyAgainStatus) {
        db.prepare(`
          UPDATE products
          SET
            buy_again_status = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(effectiveProductBuyAgainStatus, existingItem.product_id);

        updatedProduct = db.prepare(`
          SELECT *
          FROM products
          WHERE id = ?
        `).get(existingItem.product_id);
      }

      const historyProductBuyAgainStatus =
        effectiveProductBuyAgainStatus || existingItem.product_buy_again_status;

      if (effectiveShouldSaveToHistory) {
        db.prepare(`
          INSERT INTO inventory_history
          (
            product_id,
            product_name,
            product_brand,
            product_category,
            product_country,
            product_store,
            label_code,
            removal_reason,
            product_buy_again_status_after_removal,
            experience_reason,
            experience_note,
            notes
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          existingItem.product_id,
          existingItem.product_name,
          existingItem.product_brand,
          existingItem.product_category,
          existingItem.product_country,
          existingItem.product_store,
          existingItem.label_code,
          safeRemovalReason,
          historyProductBuyAgainStatus,
          effectiveExperienceReason,
          effectiveExperienceNote,
          existingItem.notes
        );
      }

      return {
        releasedLabelSlotId: existingItem.label_slot_id || null,
        product: updatedProduct,
      };
    });

    const result = removeInventoryItem();

    res.json({
      message: 'Bestandseintrag wurde entfernt.',
      removalReason: safeRemovalReason,
      savedToHistory: effectiveShouldSaveToHistory,
      releasedLabelSlotId: result.releasedLabelSlotId,
      product: result.product,
    });
  } catch (error) {
    console.error('Error removing inventory item:', error);

    if (error.statusCode === 404) {
      return res.status(404).json({
        error: error.message,
      });
    }

    res.status(500).json({
      error: 'Bestandseintrag konnte nicht entfernt werden.',
    });
  }
});

module.exports = router;