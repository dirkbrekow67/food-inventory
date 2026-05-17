const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const products = db.prepare(`
      SELECT *
      FROM products
      WHERE status = 'active'
      ORDER BY name COLLATE NOCASE
    `).all();

    res.json(products);
  } catch (error) {
    console.error('Error loading products:', error);
    res.status(500).json({ error: 'Produkte konnten nicht geladen werden.' });
  }
});

router.post('/', (req, res) => {
  try {
    const {
      name,
      brand = null,
      category = null,
      country = null,
      store = null,
      barcode = null,
      buyAgainStatus = 'neutral',
      rating = null,
      notes = null,
      favorite = 0,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Produktname ist erforderlich.' });
    }

    const allowedBuyAgainStatuses = [
      'wieder_kaufen',
      'neutral',
      'nicht_wieder_kaufen',
      'testen',
    ];

    const safeBuyAgainStatus = allowedBuyAgainStatuses.includes(buyAgainStatus)
      ? buyAgainStatus
      : 'neutral';

    const result = db.prepare(`
      INSERT INTO products
      (
        name,
        brand,
        category,
        country,
        store,
        barcode,
        buy_again_status,
        rating,
        notes,
        favorite
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      name.trim(),
      brand,
      category,
      country,
      store,
      barcode,
      safeBuyAgainStatus,
      rating,
      notes,
      favorite ? 1 : 0
    );

    const product = db.prepare(`
      SELECT *
      FROM products
      WHERE id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Produkt konnte nicht angelegt werden.' });
  }
});

module.exports = router;