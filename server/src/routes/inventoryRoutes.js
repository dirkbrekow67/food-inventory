const express = require('express');
const db = require('../db');

const router = express.Router();

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

  return date.toISOString().slice(0, 10);
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

        storage_units.name AS storage_unit_name,
        storage_units.type AS storage_unit_type,

        storage_compartments.name AS storage_compartment_name,
        storage_compartments.type AS storage_compartment_type

      FROM inventory_items
      JOIN products ON products.id = inventory_items.product_id
      JOIN storage_units ON storage_units.id = inventory_items.storage_unit_id
      LEFT JOIN storage_compartments
        ON storage_compartments.id = inventory_items.storage_compartment_id
      WHERE inventory_items.status = 'available'
      ORDER BY
        best_before_date IS NULL,
        best_before_date,
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

const internalUseUntilDate = isFrozenChilledFood
  ? addMonthsToDate(frozenDate, safeInternalExtensionMonths)
  : null;

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
    notes
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    notes
    );

    const item = db.prepare(`
      SELECT
        inventory_items.*,

        products.name AS product_name,
        products.brand AS product_brand,
        products.category AS product_category,
        products.buy_again_status AS product_buy_again_status,

        storage_units.name AS storage_unit_name,
        storage_units.type AS storage_unit_type,

        storage_compartments.name AS storage_compartment_name,
        storage_compartments.type AS storage_compartment_type

      FROM inventory_items
      JOIN products ON products.id = inventory_items.product_id
      JOIN storage_units ON storage_units.id = inventory_items.storage_unit_id
      LEFT JOIN storage_compartments
        ON storage_compartments.id = inventory_items.storage_compartment_id
      WHERE inventory_items.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating inventory item:', error);
    res.status(500).json({ error: 'Bestand konnte nicht angelegt werden.' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const existingItem = db.prepare(`
      SELECT *
      FROM inventory_items
      WHERE id = ?
      AND status = 'available'
    `).get(id);

    if (!existingItem) {
      return res.status(404).json({ error: 'Bestandseintrag wurde nicht gefunden.' });
    }

    db.prepare(`
      UPDATE inventory_items
      SET
        status = 'removed',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(id);

    res.json({ message: 'Bestandseintrag wurde entfernt.' });
  } catch (error) {
    console.error('Error removing inventory item:', error);
    res.status(500).json({ error: 'Bestandseintrag konnte nicht entfernt werden.' });
  }
});

module.exports = router;