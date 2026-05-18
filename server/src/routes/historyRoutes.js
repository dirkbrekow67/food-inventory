const express = require('express');
const db = require('../db');

const router = express.Router();

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

module.exports = router;