const db = require('./db');

function columnExists(tableName, columnName) {
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
  return columns.some((column) => column.name === columnName);
}

function addColumnIfMissing(tableName, columnName, columnDefinition) {
  if (!columnExists(tableName, columnName)) {
    db.prepare(
      `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`
    ).run();

    console.log(`Spalte ergänzt: ${tableName}.${columnName}`);
  }
}

function createStorageLocationsTable() {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS storage_locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
}

function createStorageUnitsTable() {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS storage_units (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      location_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      manufacturer TEXT,
      model TEXT,
      serial_number TEXT,
      purchase_date TEXT,
      warranty_until TEXT,
      usable_volume_liters REAL,
      status TEXT NOT NULL DEFAULT 'active',
      notes TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (location_id) REFERENCES storage_locations(id) ON DELETE RESTRICT
    )
  `).run();

  addColumnIfMissing('storage_units', 'temperature_zone', 'TEXT');
  addColumnIfMissing('storage_units', 'qr_print_enabled', 'INTEGER NOT NULL DEFAULT 1');
}

function createStorageCompartmentsTable() {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS storage_compartments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      unit_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      level_number INTEGER,
      status TEXT NOT NULL DEFAULT 'active',
      notes TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (unit_id) REFERENCES storage_units(id) ON DELETE RESTRICT,
      UNIQUE(unit_id, name)
    )
  `).run();
}

function createProductsTable() {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      brand TEXT,
      category TEXT,
      country TEXT,
      store TEXT,
      barcode TEXT,
      buy_again_status TEXT NOT NULL DEFAULT 'neutral',
      rating INTEGER,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  addColumnIfMissing('products', 'image_front', 'TEXT');
  addColumnIfMissing('products', 'image_back', 'TEXT');
  addColumnIfMissing('products', 'favorite', 'INTEGER NOT NULL DEFAULT 0');
}

function createInventoryItemsTable() {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS inventory_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      storage_unit_id INTEGER NOT NULL,
      storage_compartment_id INTEGER,

      original_quantity REAL,
      original_unit TEXT,
      remaining_quantity REAL,
      remaining_unit TEXT,
      remaining_fraction_numerator INTEGER,
      remaining_fraction_denominator INTEGER,
      quantity_estimated INTEGER NOT NULL DEFAULT 0,

      package_state TEXT NOT NULL DEFAULT 'ungeoeffnet',
      best_before_date TEXT,
      frozen_date TEXT,
      opened_date TEXT,

      status TEXT NOT NULL DEFAULT 'available',
      notes TEXT,

      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
      FOREIGN KEY (storage_unit_id) REFERENCES storage_units(id) ON DELETE RESTRICT,
      FOREIGN KEY (storage_compartment_id) REFERENCES storage_compartments(id) ON DELETE RESTRICT
    )
  `).run();

  addColumnIfMissing('inventory_items', 'qr_code', 'TEXT');
  addColumnIfMissing('inventory_items', 'image', 'TEXT');
}

function runMigrations() {
  createStorageLocationsTable();
  createStorageUnitsTable();
  createStorageCompartmentsTable();
  createProductsTable();
  createInventoryItemsTable();

  console.log('Datenbank-Migrationen abgeschlossen.');
}


module.exports = {
  runMigrations,
};