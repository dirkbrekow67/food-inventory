// server/src/routes/labelRoutes.js

const express = require('express');
const db = require('../db');

const router = express.Router();

function normalizeLabelCode(labelCode) {
  const match = String(labelCode || '')
    .trim()
    .toUpperCase()
    .match(/^F(\d+)$/);

  if (!match) {
    return '';
  }

  const labelNumber = Number(match[1]);

  if (!Number.isFinite(labelNumber) || labelNumber < 1) {
    return '';
  }

  return `F${String(Math.trunc(labelNumber)).padStart(3, '0')}`;
}

function normalizeLabelCodes(labelCodes) {
  if (!Array.isArray(labelCodes)) {
    return [];
  }

  return Array.from(
    new Set(labelCodes.map(normalizeLabelCode).filter(Boolean))
  ).sort((firstCode, secondCode) => {
    const firstNumber = Number(firstCode.slice(1));
    const secondNumber = Number(secondCode.slice(1));

    return firstNumber - secondNumber;
  });
}

function selectLabelSlots() {
  return db.prepare(`
    SELECT *
    FROM label_slots
    ORDER BY label_code
  `).all();
}

router.get('/', (req, res) => {
  try {
    res.json(selectLabelSlots());
  } catch (error) {
    console.error('Error loading label slots:', error);
    res.status(500).json({
      error: 'Etikettenpool konnte nicht geladen werden.',
    });
  }
});

router.post('/mark-printed', (req, res) => {
  try {
    const labelCodes = normalizeLabelCodes(req.body?.labelCodes);

    if (labelCodes.length === 0) {
      return res.status(400).json({
        error: 'Keine gültigen Etiketten-IDs übergeben.',
      });
    }

    const insertLabelSlot = db.prepare(`
        INSERT INTO label_slots (label_code, status, print_status)
        VALUES (?, 'free', 'printed')
        ON CONFLICT(label_code) DO UPDATE SET
            print_status = 'printed',
            updated_at = CURRENT_TIMESTAMP
    `);

    const transaction = db.transaction(() => {
      labelCodes.forEach((labelCode) => {
        insertLabelSlot.run(labelCode);
      });
    });

    transaction();

    res.status(201).json({
      message: 'Etikettenbogen wurde als gedruckt markiert.',
      labelSlots: selectLabelSlots(),
    });
  } catch (error) {
    console.error('Error marking label sheet as printed:', error);
    res.status(500).json({
      error: 'Etikettenbogen konnte nicht als gedruckt markiert werden.',
    });
  }
});

router.patch('/:labelCode/print-status', (req, res) => {
  try {
    const labelCode = normalizeLabelCode(req.params.labelCode);
    const { printStatus } = req.body || {};

    const allowedPrintStatuses = [
      'not_printed',
      'printed',
      'reprint_needed',
    ];

    if (!labelCode) {
      return res.status(400).json({
        error: 'Keine gültige Etiketten-ID übergeben.',
      });
    }

    if (!allowedPrintStatuses.includes(printStatus)) {
      return res.status(400).json({
        error: 'Ungültiger Druckstatus.',
      });
    }

    const existingLabelSlot = db.prepare(`
      SELECT *
      FROM label_slots
      WHERE label_code = ?
    `).get(labelCode);

    if (!existingLabelSlot) {
      return res.status(404).json({
        error: 'Etikett wurde nicht gefunden.',
      });
    }

    db.prepare(`
      UPDATE label_slots
      SET print_status = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE label_code = ?
    `).run(printStatus, labelCode);

    res.json({
      message: 'Druckstatus wurde aktualisiert.',
      labelSlots: selectLabelSlots(),
    });
  } catch (error) {
    console.error('Error updating label print status:', error);
    res.status(500).json({
      error: 'Druckstatus konnte nicht aktualisiert werden.',
    });
  }
});

router.delete('/free', (req, res) => {
  try {
    const labelCodes = normalizeLabelCodes(req.body?.labelCodes);

    if (labelCodes.length === 0) {
      return res.status(400).json({
        error: 'Keine gültigen Etiketten-IDs übergeben.',
      });
    }

    const deleteFreeLabelSlot = db.prepare(`
        UPDATE label_slots
        SET print_status = 'not_printed',
            updated_at = CURRENT_TIMESTAMP
        WHERE label_code = ?
            AND status = 'free'
            AND current_inventory_item_id IS NULL
    `);

    const transaction = db.transaction(() => {
      labelCodes.forEach((labelCode) => {
        deleteFreeLabelSlot.run(labelCode);
      });
    });

    transaction();

    res.json({
      message: 'Freie Etiketten wurden aus dem Pool entfernt.',
      labelSlots: selectLabelSlots(),
    });
  } catch (error) {
    console.error('Error releasing free label codes:', error);
    res.status(500).json({
      error: 'Freie Etiketten konnten nicht entfernt werden.',
    });
  }
});

router.delete('/free/all', (req, res) => {
  try {
    db.prepare(`
        UPDATE label_slots
        SET print_status = 'not_printed',
            updated_at = CURRENT_TIMESTAMP
        WHERE status = 'free'
            AND current_inventory_item_id IS NULL
    `).run();

    res.json({
      message: 'Freie Etiketten wurden aus dem Pool entfernt.',
      labelSlots: selectLabelSlots(),
    });
  } catch (error) {
    console.error('Error resetting free label slots:', error);
    res.status(500).json({
      error: 'Freie Etiketten konnten nicht zurückgesetzt werden.',
    });
  }
});

module.exports = router;