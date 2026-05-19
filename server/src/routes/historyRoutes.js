const express = require('express');
const db = require('../db');

const router = express.Router();

const allowedRemovalReasons = [
  'verbraucht',
  'abgelaufen',
  'entsorgt',
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

function selectHistoryItemById(id) {
  return db.prepare(`
    SELECT
      inventory_history.id,
      inventory_history.product_id,
      inventory_history.product_name,
      inventory_history.product_brand,
      inventory_history.product_category,
      inventory_history.product_country,
      inventory_history.product_store,
      inventory_history.label_code,
      inventory_history.removed_at,
      inventory_history.removal_reason,
      inventory_history.product_buy_again_status_after_removal,
      inventory_history.experience_reason,
      inventory_history.experience_note,
      inventory_history.notes,
      inventory_history.created_at,
      products.favorite AS product_favorite
    FROM inventory_history
    LEFT JOIN products
      ON products.id = inventory_history.product_id
    WHERE inventory_history.id = ?
  `).get(id);
}

router.get('/', (req, res) => {
  try {
    const historyItems = db.prepare(`
      SELECT
        inventory_history.id,
        inventory_history.product_id,
        inventory_history.product_name,
        inventory_history.product_brand,
        inventory_history.product_category,
        inventory_history.product_country,
        inventory_history.product_store,
        inventory_history.label_code,
        inventory_history.removed_at,
        inventory_history.removal_reason,
        inventory_history.product_buy_again_status_after_removal,
        inventory_history.experience_reason,
        inventory_history.experience_note,
        inventory_history.notes,
        inventory_history.created_at,
        products.favorite AS product_favorite
      FROM inventory_history
      LEFT JOIN products
        ON products.id = inventory_history.product_id
      ORDER BY
        inventory_history.removed_at DESC,
        inventory_history.id DESC
    `).all();

    res.json(historyItems);
  } catch (error) {
    console.error('Error loading inventory history:', error);
    res.status(500).json({
      error: 'Produkthistorie konnte nicht geladen werden.',
    });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const {
      removalReason = 'sonstiges',
      productBuyAgainStatus = null,
      experienceReason = 'keine',
      experienceNote = null,
      notes = null,
    } = req.body || {};

    const existingHistoryItem = selectHistoryItemById(id);

    if (!existingHistoryItem) {
      return res.status(404).json({
        error: 'Historieneintrag wurde nicht gefunden.',
      });
    }

    const safeRemovalReason = allowedRemovalReasons.includes(removalReason)
      ? removalReason
      : 'sonstiges';

    const safeProductBuyAgainStatus =
      productBuyAgainStatus &&
      allowedBuyAgainStatuses.includes(productBuyAgainStatus)
        ? productBuyAgainStatus
        : null;

    const safeExperienceReason = allowedExperienceReasons.includes(
      experienceReason,
    )
      ? experienceReason
      : 'sonstiges';

    const safeExperienceNote =
      typeof experienceNote === 'string' && experienceNote.trim()
        ? experienceNote.trim()
        : null;

    const safeNotes =
      typeof notes === 'string' && notes.trim() ? notes.trim() : null;

    db.prepare(`
      UPDATE inventory_history
      SET
        removal_reason = ?,
        product_buy_again_status_after_removal = ?,
        experience_reason = ?,
        experience_note = ?,
        notes = ?
      WHERE id = ?
    `).run(
      safeRemovalReason,
      safeProductBuyAgainStatus,
      safeExperienceReason,
      safeExperienceNote,
      safeNotes,
      id,
    );

    const updatedHistoryItem = selectHistoryItemById(id);

    res.json(updatedHistoryItem);
  } catch (error) {
    console.error('Error updating inventory history:', error);
    res.status(500).json({
      error: 'Historieneintrag konnte nicht gespeichert werden.',
    });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const existingHistoryItem = selectHistoryItemById(id);

    if (!existingHistoryItem) {
      return res.status(404).json({
        error: 'Historieneintrag wurde nicht gefunden.',
      });
    }

    db.prepare(`
      DELETE FROM inventory_history
      WHERE id = ?
    `).run(id);

    res.json({
      message: 'Historieneintrag wurde gelöscht.',
      deletedHistoryItemId: Number(id),
    });
  } catch (error) {
    console.error('Error deleting inventory history:', error);
    res.status(500).json({
      error: 'Historieneintrag konnte nicht gelöscht werden.',
    });
  }
});

module.exports = router;