const db = require('./db');
const { runMigrations } = require('./migrations');

runMigrations();

function seed() {
  const insertLocation = db.prepare(`
    INSERT OR IGNORE INTO storage_locations
    (id, name, description, sort_order)
    VALUES (?, ?, ?, ?)
  `);

  insertLocation.run(1, 'Wohnzimmer', 'Standort im Wohnzimmer', 1);
  insertLocation.run(2, 'Küche', 'Standort in der Küche', 2);
  insertLocation.run(3, 'Vorratskammer', 'Standort Vorratskammer', 3);

  const insertUnit = db.prepare(`
    INSERT OR IGNORE INTO storage_units
    (id, location_id, name, type, status, sort_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertUnit.run(1, 1, 'Gefrierschrank Wohnzimmer', 'Gefrierschrank', 'active', 1);
  insertUnit.run(2, 2, 'Gefrierschrank Küche', 'Gefrierschrank', 'active', 1);
  insertUnit.run(3, 2, 'Kühlschrank Küche', 'Kühlschrank', 'active', 2);
  insertUnit.run(4, 3, 'Regal Vorratskammer', 'Regal', 'active', 1);

  const insertCompartment = db.prepare(`
    INSERT OR IGNORE INTO storage_compartments
    (unit_id, name, type, level_number, sort_order)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (let i = 1; i <= 8; i += 1) {
    insertCompartment.run(1, `Schublade ${i}`, 'Schublade', i, i);
  }

  for (let i = 1; i <= 3; i += 1) {
    insertCompartment.run(2, `Schublade ${i}`, 'Schublade', i, i);
  }

  insertCompartment.run(3, 'Fach oben', 'Fach', 1, 1);
  insertCompartment.run(3, 'Fach mitte', 'Fach', 2, 2);
  insertCompartment.run(3, 'Fach unten', 'Fach', 3, 3);
  insertCompartment.run(3, 'Gemüsefach', 'Fach', 4, 4);
  insertCompartment.run(3, 'Türfach', 'Türfach', 5, 5);

  for (let i = 1; i <= 5; i += 1) {
    insertCompartment.run(4, `Regalboden ${i}`, 'Regalboden', i, i);
  }

  console.log('Testdaten wurden angelegt.');
}

seed();