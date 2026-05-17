const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/tree', (req, res) => {
  try {
    const locations = db.prepare(`
      SELECT *
      FROM storage_locations
      WHERE status = 'active'
      ORDER BY sort_order, name
    `).all();

    const units = db.prepare(`
      SELECT *
      FROM storage_units
      WHERE status = 'active'
      ORDER BY sort_order, name
    `).all();

    const compartments = db.prepare(`
      SELECT *
      FROM storage_compartments
      WHERE status = 'active'
      ORDER BY sort_order, level_number, name
    `).all();

    const tree = locations.map((location) => ({
      ...location,
      units: units
        .filter((unit) => unit.location_id === location.id)
        .map((unit) => ({
          ...unit,
          compartments: compartments.filter(
            (compartment) => compartment.unit_id === unit.id
          ),
        })),
    }));

    res.json(tree);
  } catch (error) {
    console.error('Error loading storage tree:', error);
    res.status(500).json({ error: 'Lagerstruktur konnte nicht geladen werden.' });
  }
});

router.post('/locations', (req, res) => {
  try {
    const { name, description = '', sortOrder = 0 } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name ist erforderlich.' });
    }

    const result = db.prepare(`
      INSERT INTO storage_locations (name, description, sort_order)
      VALUES (?, ?, ?)
    `).run(name.trim(), description.trim(), sortOrder);

    res.status(201).json({ id: result.lastInsertRowid });
  } catch (error) {
    console.error('Error creating storage location:', error);
    res.status(500).json({ error: 'Standort konnte nicht angelegt werden.' });
  }
});

router.post('/units', (req, res) => {
  try {
    const {
      locationId,
      name,
      type,
      manufacturer = null,
      model = null,
      notes = null,
      sortOrder = 0,
    } = req.body;

    if (!locationId || !name || !type) {
      return res.status(400).json({
        error: 'locationId, name und type sind erforderlich.',
      });
    }

    const result = db.prepare(`
      INSERT INTO storage_units
      (location_id, name, type, manufacturer, model, notes, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      locationId,
      name.trim(),
      type.trim(),
      manufacturer,
      model,
      notes,
      sortOrder
    );

    res.status(201).json({ id: result.lastInsertRowid });
  } catch (error) {
    console.error('Error creating storage unit:', error);
    res.status(500).json({ error: 'Lagergerät konnte nicht angelegt werden.' });
  }
});

router.post('/units/:unitId/compartments/generate', (req, res) => {
  try {
    const { unitId } = req.params;
    const {
      type = 'Schublade',
      prefix = 'Schublade',
      count,
      startAt = 1,
    } = req.body;

    if (!count || Number(count) < 1) {
      return res.status(400).json({ error: 'count muss mindestens 1 sein.' });
    }

    const insert = db.prepare(`
      INSERT OR IGNORE INTO storage_compartments
      (unit_id, name, type, level_number, sort_order)
      VALUES (?, ?, ?, ?, ?)
    `);

    const transaction = db.transaction(() => {
      for (let i = 0; i < Number(count); i += 1) {
        const level = Number(startAt) + i;
        insert.run(
          Number(unitId),
          `${prefix} ${level}`,
          type,
          level,
          level
        );
      }
    });

    transaction();

    res.status(201).json({ message: 'Fächer wurden erzeugt.' });
  } catch (error) {
    console.error('Error generating compartments:', error);
    res.status(500).json({ error: 'Fächer konnten nicht erzeugt werden.' });
  }
});

module.exports = router;