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

router.get('/inactive', (req, res) => {
  try {
    const locations = db.prepare(`
      SELECT *
      FROM storage_locations
      WHERE status = 'inactive'
      ORDER BY updated_at DESC, name
    `).all();

    const units = db.prepare(`
      SELECT
        storage_units.*,
        storage_locations.name AS location_name,
        storage_locations.status AS location_status
      FROM storage_units
      JOIN storage_locations
        ON storage_locations.id = storage_units.location_id
      WHERE storage_units.status = 'inactive'
      ORDER BY storage_units.updated_at DESC, storage_units.name
    `).all();

    const compartments = db.prepare(`
      SELECT
        storage_compartments.*,
        storage_units.name AS unit_name,
        storage_units.status AS unit_status,
        storage_locations.name AS location_name,
        storage_locations.status AS location_status
      FROM storage_compartments
      JOIN storage_units
        ON storage_units.id = storage_compartments.unit_id
      JOIN storage_locations
        ON storage_locations.id = storage_units.location_id
      WHERE storage_compartments.status = 'inactive'
      ORDER BY storage_compartments.updated_at DESC, storage_compartments.name
    `).all();

    res.json({
      locations,
      units,
      compartments,
    });
  } catch (error) {
    console.error('Error loading inactive storage items:', error);
    res.status(500).json({
      error: 'Inaktive Lagerstruktur konnte nicht geladen werden.',
    });
  }
});

router.post('/locations', (req, res) => {
  try {
    const { name, description = '', sortOrder = 0 } = req.body;

    const trimmedName = String(name || '').trim();
    const trimmedDescription = String(description || '').trim();

    if (!trimmedName) {
      return res.status(400).json({
        error: 'Der Standortname darf nicht leer sein.',
      });
    }

    const existingLocation = db
      .prepare(`
        SELECT id
        FROM storage_locations
        WHERE lower(name) = lower(?)
      `)
      .get(trimmedName);

    if (existingLocation) {
      return res.status(409).json({
        error: 'Ein Standort mit diesem Namen existiert bereits.',
      });
    }

    const result = db
      .prepare(`
        INSERT INTO storage_locations (name, description, sort_order)
        VALUES (?, ?, ?)
      `)
      .run(trimmedName, trimmedDescription, sortOrder);

    const createdLocation = db
      .prepare(`
        SELECT *
        FROM storage_locations
        WHERE id = ?
      `)
      .get(result.lastInsertRowid);

    res.status(201).json(createdLocation);
  } catch (error) {
    console.error('Error creating storage location:', error);
    res.status(500).json({
      error: 'Standort konnte nicht angelegt werden.',
    });
  }
});

router.delete('/locations/:locationId', (req, res) => {
  try {
    const { locationId } = req.params;
    const numericLocationId = Number(locationId);

    if (!numericLocationId) {
      return res.status(400).json({
        error: 'Standort ist erforderlich.',
      });
    }

    const existingLocation = db
      .prepare(`
        SELECT id, name, status
        FROM storage_locations
        WHERE id = ?
      `)
      .get(numericLocationId);

    if (!existingLocation) {
      return res.status(404).json({
        error: 'Der ausgewählte Standort wurde nicht gefunden.',
      });
    }

    const activeUnits = db
      .prepare(`
        SELECT COUNT(*) AS count
        FROM storage_units
        WHERE location_id = ?
          AND status = 'active'
      `)
      .get(numericLocationId);

    if (activeUnits.count > 0) {
      return res.status(409).json({
        error:
          'Der Standort kann nicht deaktiviert werden, solange dort aktive Lagergeräte vorhanden sind.',
      });
    }

    db.prepare(`
      UPDATE storage_locations
      SET status = 'inactive',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(numericLocationId);

    res.json({
      message: 'Standort wurde deaktiviert.',
      id: numericLocationId,
      name: existingLocation.name,
    });
  } catch (error) {
    console.error('Error deactivating storage location:', error);
    res.status(500).json({
      error: 'Standort konnte nicht deaktiviert werden.',
    });
  }
});

router.patch('/locations/:locationId/reactivate', (req, res) => {
  try {
    const { locationId } = req.params;
    const numericLocationId = Number(locationId);

    if (!numericLocationId) {
      return res.status(400).json({
        error: 'Standort ist erforderlich.',
      });
    }

    const existingLocation = db
      .prepare(`
        SELECT id, name
        FROM storage_locations
        WHERE id = ?
      `)
      .get(numericLocationId);

    if (!existingLocation) {
      return res.status(404).json({
        error: 'Der ausgewählte Standort wurde nicht gefunden.',
      });
    }

    db.prepare(`
      UPDATE storage_locations
      SET status = 'active',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(numericLocationId);

    res.json({
      message: 'Standort wurde reaktiviert.',
      id: numericLocationId,
      name: existingLocation.name,
    });
  } catch (error) {
    console.error('Error reactivating storage location:', error);
    res.status(500).json({
      error: 'Standort konnte nicht reaktiviert werden.',
    });
  }
});

router.post('/units', (req, res) => {
  try {
    const {
      locationId,
      name,
      type,
      temperatureZone = null,
      manufacturer = null,
      model = null,
      notes = null,
      sortOrder = 0,
    } = req.body;

    const numericLocationId = Number(locationId);
    const trimmedName = String(name || '').trim();
    const trimmedType = String(type || '').trim();
    const trimmedTemperatureZone = temperatureZone
      ? String(temperatureZone).trim()
      : null;
    const trimmedManufacturer = manufacturer
      ? String(manufacturer).trim()
      : null;
    const trimmedModel = model ? String(model).trim() : null;
    const trimmedNotes = notes ? String(notes).trim() : null;

    if (!numericLocationId || !trimmedName || !trimmedType) {
      return res.status(400).json({
        error: 'Standort, Gerätename und Gerätetyp sind erforderlich.',
      });
    }

    const existingLocation = db
      .prepare(`
        SELECT id
        FROM storage_locations
        WHERE id = ?
          AND status = 'active'
      `)
      .get(numericLocationId);

    if (!existingLocation) {
      return res.status(404).json({
        error: 'Der ausgewählte Standort wurde nicht gefunden.',
      });
    }

    const existingUnit = db
      .prepare(`
        SELECT id
        FROM storage_units
        WHERE location_id = ?
          AND lower(name) = lower(?)
      `)
      .get(numericLocationId, trimmedName);

    if (existingUnit) {
      return res.status(409).json({
        error: 'An diesem Standort existiert bereits ein Lagergerät mit diesem Namen.',
      });
    }

    const result = db
      .prepare(`
        INSERT INTO storage_units
        (location_id, name, type, temperature_zone, manufacturer, model, notes, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        numericLocationId,
        trimmedName,
        trimmedType,
        trimmedTemperatureZone,
        trimmedManufacturer,
        trimmedModel,
        trimmedNotes,
        sortOrder,
      );

    const createdUnit = db
      .prepare(`
        SELECT *
        FROM storage_units
        WHERE id = ?
      `)
      .get(result.lastInsertRowid);

    res.status(201).json(createdUnit);
  } catch (error) {
    console.error('Error creating storage unit:', error);
    res.status(500).json({
      error: 'Lagergerät konnte nicht angelegt werden.',
    });
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

    const numericUnitId = Number(unitId);
    const numericCount = Number(count);
    const numericStartAt = Number(startAt);
    const trimmedType = String(type || '').trim();
    const trimmedPrefix = String(prefix || '').trim();

    if (!numericUnitId || !trimmedType || !trimmedPrefix) {
      return res.status(400).json({
        error: 'Lagergerät, Fachtyp und Bezeichnung sind erforderlich.',
      });
    }

    if (!numericCount || numericCount < 1 || numericCount > 50) {
      return res.status(400).json({
        error: 'Die Anzahl muss zwischen 1 und 50 liegen.',
      });
    }

    if (!numericStartAt || numericStartAt < 1) {
      return res.status(400).json({
        error: 'Startnummer muss mindestens 1 sein.',
      });
    }

    const existingUnit = db
      .prepare(`
        SELECT id
        FROM storage_units
        WHERE id = ?
          AND status = 'active'
      `)
      .get(numericUnitId);

    if (!existingUnit) {
      return res.status(404).json({
        error: 'Das ausgewählte Lagergerät wurde nicht gefunden.',
      });
    }

    const insert = db.prepare(`
      INSERT OR IGNORE INTO storage_compartments
      (unit_id, name, type, level_number, sort_order)
      VALUES (?, ?, ?, ?, ?)
    `);

    const createdCompartments = [];

    const transaction = db.transaction(() => {
      for (let i = 0; i < numericCount; i += 1) {
        const level = numericStartAt + i;
        const compartmentName = `${trimmedPrefix} ${level}`;

        const result = insert.run(
          numericUnitId,
          compartmentName,
          trimmedType,
          level,
          level,
        );

        if (result.changes > 0) {
          createdCompartments.push({
            name: compartmentName,
            type: trimmedType,
            levelNumber: level,
          });
        }
      }
    });

    transaction();

    res.status(201).json({
      message: 'Fächer wurden erzeugt.',
      createdCount: createdCompartments.length,
      compartments: createdCompartments,
    });
  } catch (error) {
    console.error('Error generating compartments:', error);
    res.status(500).json({
      error: 'Fächer konnten nicht erzeugt werden.',
    });
  }
});

router.post('/units/:unitId/compartments', (req, res) => {
  try {
    const { unitId } = req.params;
    const {
      name,
      type = 'Fach',
      levelNumber = null,
      sortOrder = 0,
    } = req.body;

    const numericUnitId = Number(unitId);
    const trimmedName = String(name || '').trim();
    const trimmedType = String(type || '').trim();

    if (!numericUnitId || !trimmedName || !trimmedType) {
      return res.status(400).json({
        error: 'Lagergerät, Fachname und Fachtyp sind erforderlich.',
      });
    }

    const existingUnit = db
      .prepare(`
        SELECT id
        FROM storage_units
        WHERE id = ?
          AND status = 'active'
      `)
      .get(numericUnitId);

    if (!existingUnit) {
      return res.status(404).json({
        error: 'Das ausgewählte Lagergerät wurde nicht gefunden.',
      });
    }

    const existingCompartment = db
      .prepare(`
        SELECT id
        FROM storage_compartments
        WHERE unit_id = ?
          AND lower(name) = lower(?)
      `)
      .get(numericUnitId, trimmedName);

    if (existingCompartment) {
      return res.status(409).json({
        error: 'In diesem Lagergerät existiert bereits ein Fach mit diesem Namen.',
      });
    }

    const result = db
      .prepare(`
        INSERT INTO storage_compartments
        (unit_id, name, type, level_number, sort_order)
        VALUES (?, ?, ?, ?, ?)
      `)
      .run(
        numericUnitId,
        trimmedName,
        trimmedType,
        levelNumber ? Number(levelNumber) : null,
        sortOrder,
      );

    const createdCompartment = db
      .prepare(`
        SELECT *
        FROM storage_compartments
        WHERE id = ?
      `)
      .get(result.lastInsertRowid);

    res.status(201).json(createdCompartment);
  } catch (error) {
    console.error('Error creating compartment:', error);
    res.status(500).json({
      error: 'Fach konnte nicht angelegt werden.',
    });
  }
});

router.patch('/compartments/:compartmentId/reactivate', (req, res) => {
  try {
    const { compartmentId } = req.params;
    const numericCompartmentId = Number(compartmentId);

    if (!numericCompartmentId) {
      return res.status(400).json({
        error: 'Fach ist erforderlich.',
      });
    }

    const existingCompartment = db
      .prepare(`
        SELECT
          storage_compartments.id,
          storage_compartments.name,
          storage_units.status AS unit_status,
          storage_locations.status AS location_status
        FROM storage_compartments
        JOIN storage_units
          ON storage_units.id = storage_compartments.unit_id
        JOIN storage_locations
          ON storage_locations.id = storage_units.location_id
        WHERE storage_compartments.id = ?
      `)
      .get(numericCompartmentId);

    if (!existingCompartment) {
      return res.status(404).json({
        error: 'Das ausgewählte Fach wurde nicht gefunden.',
      });
    }

    if (existingCompartment.location_status !== 'active') {
      return res.status(409).json({
        error:
          'Das Fach kann erst reaktiviert werden, wenn der zugehörige Standort aktiv ist.',
      });
    }

    if (existingCompartment.unit_status !== 'active') {
      return res.status(409).json({
        error:
          'Das Fach kann erst reaktiviert werden, wenn das zugehörige Lagergerät aktiv ist.',
      });
    }

    db.prepare(`
      UPDATE storage_compartments
      SET status = 'active',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(numericCompartmentId);

    res.json({
      message: 'Fach wurde reaktiviert.',
      id: numericCompartmentId,
      name: existingCompartment.name,
    });
  } catch (error) {
    console.error('Error reactivating storage compartment:', error);
    res.status(500).json({
      error: 'Fach konnte nicht reaktiviert werden.',
    });
  }
});

router.delete('/compartments/:compartmentId', (req, res) => {
  try {
    const { compartmentId } = req.params;
    const numericCompartmentId = Number(compartmentId);

    if (!numericCompartmentId) {
      return res.status(400).json({
        error: 'Fach ist erforderlich.',
      });
    }

    const existingCompartment = db
      .prepare(`
        SELECT id, name, status
        FROM storage_compartments
        WHERE id = ?
      `)
      .get(numericCompartmentId);

    if (!existingCompartment) {
      return res.status(404).json({
        error: 'Das ausgewählte Fach wurde nicht gefunden.',
      });
    }

    const activeInventoryItems = db
      .prepare(`
        SELECT COUNT(*) AS count
        FROM inventory_items
        WHERE storage_compartment_id = ?
          AND status = 'available'
      `)
      .get(numericCompartmentId);

    if (activeInventoryItems.count > 0) {
      return res.status(409).json({
        error:
          'Das Fach kann nicht deaktiviert werden, solange dort aktive Bestandseinträge vorhanden sind.',
      });
    }

    db.prepare(`
      UPDATE storage_compartments
      SET status = 'inactive',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(numericCompartmentId);

    res.json({
      message: 'Fach wurde deaktiviert.',
      id: numericCompartmentId,
      name: existingCompartment.name,
    });
  } catch (error) {
    console.error('Error deactivating storage compartment:', error);
    res.status(500).json({
      error: 'Fach konnte nicht deaktiviert werden.',
    });
  }
});

router.patch('/units/:unitId/reactivate', (req, res) => {
  try {
    const { unitId } = req.params;
    const numericUnitId = Number(unitId);

    if (!numericUnitId) {
      return res.status(400).json({
        error: 'Lagergerät ist erforderlich.',
      });
    }

    const existingUnit = db
      .prepare(`
        SELECT storage_units.id, storage_units.name, storage_locations.status AS location_status
        FROM storage_units
        JOIN storage_locations
          ON storage_locations.id = storage_units.location_id
        WHERE storage_units.id = ?
      `)
      .get(numericUnitId);

    if (!existingUnit) {
      return res.status(404).json({
        error: 'Das ausgewählte Lagergerät wurde nicht gefunden.',
      });
    }

    if (existingUnit.location_status !== 'active') {
      return res.status(409).json({
        error:
          'Das Lagergerät kann erst reaktiviert werden, wenn der zugehörige Standort aktiv ist.',
      });
    }

    db.prepare(`
      UPDATE storage_units
      SET status = 'active',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(numericUnitId);

    res.json({
      message: 'Lagergerät wurde reaktiviert.',
      id: numericUnitId,
      name: existingUnit.name,
    });
  } catch (error) {
    console.error('Error reactivating storage unit:', error);
    res.status(500).json({
      error: 'Lagergerät konnte nicht reaktiviert werden.',
    });
  }
});

router.delete('/units/:unitId', (req, res) => {
  try {
    const { unitId } = req.params;
    const numericUnitId = Number(unitId);

    if (!numericUnitId) {
      return res.status(400).json({
        error: 'Lagergerät ist erforderlich.',
      });
    }

    const existingUnit = db
      .prepare(`
        SELECT id, name, status
        FROM storage_units
        WHERE id = ?
      `)
      .get(numericUnitId);

    if (!existingUnit) {
      return res.status(404).json({
        error: 'Das ausgewählte Lagergerät wurde nicht gefunden.',
      });
    }

    const activeInventoryItems = db
      .prepare(`
        SELECT COUNT(*) AS count
        FROM inventory_items
        WHERE storage_unit_id = ?
          AND status = 'available'
      `)
      .get(numericUnitId);

    if (activeInventoryItems.count > 0) {
      return res.status(409).json({
        error:
          'Das Lagergerät kann nicht deaktiviert werden, solange dort aktive Bestandseinträge vorhanden sind.',
      });
    }

    db.prepare(`
      UPDATE storage_units
      SET status = 'inactive',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(numericUnitId);

    db.prepare(`
      UPDATE storage_compartments
      SET status = 'inactive',
          updated_at = CURRENT_TIMESTAMP
      WHERE unit_id = ?
    `).run(numericUnitId);

    res.json({
      message: 'Lagergerät wurde deaktiviert.',
      id: numericUnitId,
      name: existingUnit.name,
    });
  } catch (error) {
    console.error('Error deactivating storage unit:', error);
    res.status(500).json({
      error: 'Lagergerät konnte nicht deaktiviert werden.',
    });
  }
});

module.exports = router;