<!-- docs/DATENBANK.md -->

# Datenbankstruktur – Food Inventory

Stand: 2026-06-13 – nach Block 223

## Tabellenübersicht

```text
inventory_history     products              storage_locations   
inventory_items       shopping_list_items   storage_units       
label_slots           storage_compartments
```

## Vollständiges SQLite-Schema

```sql
CREATE TABLE storage_locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
CREATE TABLE sqlite_sequence(name,seq);
CREATE TABLE storage_units (
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
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, temperature_zone TEXT, qr_print_enabled INTEGER NOT NULL DEFAULT 1,

      FOREIGN KEY (location_id) REFERENCES storage_locations(id) ON DELETE RESTRICT
    );
CREATE TABLE storage_compartments (
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
    );
CREATE TABLE products (
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
    , image_front TEXT, image_back TEXT, favorite INTEGER NOT NULL DEFAULT 0);
CREATE TABLE inventory_items (
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
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, qr_code TEXT, image TEXT, is_frozen_chilled_food INTEGER NOT NULL DEFAULT 0, internal_use_until_date TEXT, internal_extension_months INTEGER NOT NULL DEFAULT 6, label_slot_id INTEGER, inventory_batch_code TEXT, batch_position INTEGER, batch_total INTEGER, batch_note TEXT,

      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
      FOREIGN KEY (storage_unit_id) REFERENCES storage_units(id) ON DELETE RESTRICT,
      FOREIGN KEY (storage_compartment_id) REFERENCES storage_compartments(id) ON DELETE RESTRICT
    );
CREATE TABLE label_slots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      label_code TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'free',
      current_inventory_item_id INTEGER,
      notes TEXT,
      last_used_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    , print_status TEXT NOT NULL DEFAULT 'not_printed');
CREATE TABLE inventory_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      product_id INTEGER,
      product_name TEXT NOT NULL,
      product_brand TEXT,
      product_category TEXT,
      product_country TEXT,
      product_store TEXT,

      label_code TEXT,

      removed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      removal_reason TEXT NOT NULL,
      product_buy_again_status_after_removal TEXT,
      notes TEXT,

      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    , experience_reason TEXT, experience_note TEXT);
CREATE TABLE shopping_list_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER,
      custom_name TEXT,
      quantity REAL,
      unit TEXT,
      note TEXT,
      category TEXT,
      is_foreign_purchase INTEGER NOT NULL DEFAULT 0,
      priority TEXT NOT NULL DEFAULT 'normal',
      status TEXT NOT NULL DEFAULT 'open',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      completed_at TEXT,

      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
    );
```
