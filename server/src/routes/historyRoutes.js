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
      id,
      product_id,
      product_name,
      product_brand,
      product_category,
      product_country,
      product_store,
      label_code,
      removed_at,
      removal_reason,
      product_buy_again_status_after_removal,
      experience_reason,
      experience_note,
      notes,
      created_at
    FROM inventory_history
    WHERE id = ?
  `).get(id);
}

router.get('/', (req, res) => {
  try {
    const historyItems = db.prepare(`
      SELECT
        id,
        product_id,
        product_name,
        product_brand,
        product_category,
        product_country,
        product_store,
        label_code,
        removed_at,
        removal_reason,
        product_buy_again_status_after_removal,
        experience_reason,
        experience_note,
        notes,
        created_at
      FROM inventory_history
      ORDER BY
        removed_at DESC,
        id DESC
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