// server/src/routes/shoppingListRoutes.js

const express = require('express');
const db = require('../db');

const router = express.Router();

const ALLOWED_PRIORITIES = ['niedrig', 'normal', 'hoch'];
const ALLOWED_STATUSES = ['open', 'completed'];

function normalizeText(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmedValue = value.trim();

  return trimmedValue || null;
}

function normalizeNumber(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : null;
}

function normalizeBooleanToInteger(value) {
  return value ? 1 : 0;
}

function selectShoppingListItemById(id) {
  return db.prepare(`
    SELECT
      shopping_list_items.*,

      products.name AS product_name,
      products.brand AS product_brand,
      products.category AS product_category,
      products.country AS product_country,
      products.store AS product_store,
      products.buy_again_status AS product_buy_again_status,
      products.favorite AS product_favorite

    FROM shopping_list_items
    LEFT JOIN products
      ON products.id = shopping_list_items.product_id
    WHERE shopping_list_items.id = ?
  `).get(id);
}

router.get('/', (req, res) => {
  try {
    const includeCompleted = req.query.includeCompleted === '1';

    const items = db.prepare(`
      SELECT
        shopping_list_items.*,

        products.name AS product_name,
        products.brand AS product_brand,
        products.category AS product_category,
        products.country AS product_country,
        products.store AS product_store,
        products.buy_again_status AS product_buy_again_status,
        products.favorite AS product_favorite

      FROM shopping_list_items
      LEFT JOIN products
        ON products.id = shopping_list_items.product_id
      WHERE (? = 1 OR shopping_list_items.status = 'open')
      ORDER BY
        shopping_list_items.status = 'completed',
        shopping_list_items.is_foreign_purchase DESC,
        shopping_list_items.priority = 'hoch' DESC,
        shopping_list_items.category COLLATE NOCASE,
        COALESCE(products.name, shopping_list_items.custom_name) COLLATE NOCASE,
        shopping_list_items.created_at DESC
    `).all(includeCompleted ? 1 : 0);

    res.json(items);
  } catch (error) {
    console.error('Error loading shopping list:', error);
    res.status(500).json({ error: 'Einkaufsliste konnte nicht geladen werden.' });
  }
});

router.post('/', (req, res) => {
  try {
    const {
      productId = null,
      customName = null,
      quantity = null,
      unit = null,
      note = null,
      category = null,
      isForeignPurchase = 0,
      priority = 'normal',
    } = req.body;

    const safeProductId = normalizeNumber(productId);
    const safeCustomName = normalizeText(customName);
    const safeQuantity = normalizeNumber(quantity);
    const safeUnit = normalizeText(unit);
    const safeNote = normalizeText(note);
    const safeCategory = normalizeText(category);
    const safePriority = ALLOWED_PRIORITIES.includes(priority) ? priority : 'normal';

    if (!safeProductId && !safeCustomName) {
      return res.status(400).json({
        error: 'Produkt oder freier Artikelname ist erforderlich.',
      });
    }

    if (safeProductId) {
      const product = db.prepare(`
        SELECT id
        FROM products
        WHERE id = ?
        AND status = 'active'
      `).get(safeProductId);

      if (!product) {
        return res.status(404).json({ error: 'Produkt wurde nicht gefunden.' });
      }
    }

    const result = db.prepare(`
      INSERT INTO shopping_list_items
      (
        product_id,
        custom_name,
        quantity,
        unit,
        note,
        category,
        is_foreign_purchase,
        priority,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'open')
    `).run(
      safeProductId,
      safeCustomName,
      safeQuantity,
      safeUnit,
      safeNote,
      safeCategory,
      normalizeBooleanToInteger(isForeignPurchase),
      safePriority
    );

    const item = selectShoppingListItemById(result.lastInsertRowid);

    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating shopping list item:', error);
    res.status(500).json({ error: 'Einkaufslisteneintrag konnte nicht angelegt werden.' });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const existingItem = db.prepare(`
      SELECT *
      FROM shopping_list_items
      WHERE id = ?
    `).get(id);

    if (!existingItem) {
      return res.status(404).json({ error: 'Einkaufslisteneintrag wurde nicht gefunden.' });
    }

    const {
      productId = null,
      customName = null,
      quantity = null,
      unit = null,
      note = null,
      category = null,
      isForeignPurchase = 0,
      priority = 'normal',
      status = 'open',
    } = req.body;

    const safeProductId = normalizeNumber(productId);
    const safeCustomName = normalizeText(customName);
    const safeQuantity = normalizeNumber(quantity);
    const safeUnit = normalizeText(unit);
    const safeNote = normalizeText(note);
    const safeCategory = normalizeText(category);
    const safePriority = ALLOWED_PRIORITIES.includes(priority) ? priority : 'normal';
    const safeStatus = ALLOWED_STATUSES.includes(status) ? status : 'open';

    if (!safeProductId && !safeCustomName) {
      return res.status(400).json({
        error: 'Produkt oder freier Artikelname ist erforderlich.',
      });
    }

    if (safeProductId) {
      const product = db.prepare(`
        SELECT id
        FROM products
        WHERE id = ?
        AND status = 'active'
      `).get(safeProductId);

      if (!product) {
        return res.status(404).json({ error: 'Produkt wurde nicht gefunden.' });
      }
    }

    db.prepare(`
      UPDATE shopping_list_items
      SET
        product_id = ?,
        custom_name = ?,
        quantity = ?,
        unit = ?,
        note = ?,
        category = ?,
        is_foreign_purchase = ?,
        priority = ?,
        status = ?,
        updated_at = CURRENT_TIMESTAMP,
        completed_at = CASE
          WHEN ? = 'completed' AND completed_at IS NULL THEN CURRENT_TIMESTAMP
          WHEN ? = 'open' THEN NULL
          ELSE completed_at
        END
      WHERE id = ?
    `).run(
      safeProductId,
      safeCustomName,
      safeQuantity,
      safeUnit,
      safeNote,
      safeCategory,
      normalizeBooleanToInteger(isForeignPurchase),
      safePriority,
      safeStatus,
      safeStatus,
      safeStatus,
      id
    );

    const updatedItem = selectShoppingListItemById(id);

    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating shopping list item:', error);
    res.status(500).json({ error: 'Einkaufslisteneintrag konnte nicht aktualisiert werden.' });
  }
});

router.patch('/:id/complete', (req, res) => {
  try {
    const { id } = req.params;

    const existingItem = db.prepare(`
      SELECT *
      FROM shopping_list_items
      WHERE id = ?
    `).get(id);

    if (!existingItem) {
      return res.status(404).json({ error: 'Einkaufslisteneintrag wurde nicht gefunden.' });
    }

    db.prepare(`
      UPDATE shopping_list_items
      SET
        status = 'completed',
        completed_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(id);

    const updatedItem = selectShoppingListItemById(id);

    res.json(updatedItem);
  } catch (error) {
    console.error('Error completing shopping list item:', error);
    res.status(500).json({ error: 'Einkaufslisteneintrag konnte nicht erledigt werden.' });
  }
});

router.patch('/:id/reopen', (req, res) => {
  try {
    const { id } = req.params;

    const existingItem = db.prepare(`
      SELECT *
      FROM shopping_list_items
      WHERE id = ?
    `).get(id);

    if (!existingItem) {
      return res.status(404).json({ error: 'Einkaufslisteneintrag wurde nicht gefunden.' });
    }

    db.prepare(`
      UPDATE shopping_list_items
      SET
        status = 'open',
        completed_at = NULL,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(id);

    const updatedItem = selectShoppingListItemById(id);

    res.json(updatedItem);
  } catch (error) {
    console.error('Error reopening shopping list item:', error);
    res.status(500).json({ error: 'Einkaufslisteneintrag konnte nicht wieder geöffnet werden.' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const existingItem = db.prepare(`
      SELECT *
      FROM shopping_list_items
      WHERE id = ?
    `).get(id);

    if (!existingItem) {
      return res.status(404).json({ error: 'Einkaufslisteneintrag wurde nicht gefunden.' });
    }

    db.prepare(`
      DELETE FROM shopping_list_items
      WHERE id = ?
    `).run(id);

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting shopping list item:', error);
    res.status(500).json({ error: 'Einkaufslisteneintrag konnte nicht gelöscht werden.' });
  }
});

module.exports = router;