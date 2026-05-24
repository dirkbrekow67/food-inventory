// server/src/Routes/productRoutes.js

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
      imageFront = null,
      imageBack = null,
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
        favorite,
        image_front,
        image_back
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      favorite ? 1 : 0,
      imageFront,
      imageBack
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

router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const existingProduct = db.prepare(`
      SELECT *
      FROM products
      WHERE id = ?
      AND status = 'active'
    `).get(id);

    if (!existingProduct) {
      return res.status(404).json({ error: 'Produkt wurde nicht gefunden.' });
    }

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
      imageFront = null,
      imageBack = null,
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

    db.prepare(`
      UPDATE products
      SET
        name = ?,
        brand = ?,
        category = ?,
        country = ?,
        store = ?,
        barcode = ?,
        buy_again_status = ?,
        rating = ?,
        notes = ?,
        favorite = ?,
        image_front = ?,
        image_back = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
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
      favorite ? 1 : 0,
      imageFront,
      imageBack,
      id
    );

    const updatedProduct = db.prepare(`
      SELECT *
      FROM products
      WHERE id = ?
    `).get(id);

    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Produkt konnte nicht aktualisiert werden.' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const existingProduct = db.prepare(`
      SELECT *
      FROM products
      WHERE id = ?
      AND status = 'active'
    `).get(id);

    if (!existingProduct) {
      return res.status(404).json({ error: 'Produkt wurde nicht gefunden.' });
    }

    db.prepare(`
      UPDATE products
      SET
        status = 'inactive',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(id);

    res.json({ message: 'Produkt wurde deaktiviert.' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Produkt konnte nicht deaktiviert werden.' });
  }
});

module.exports = router;