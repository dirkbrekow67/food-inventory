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

## Fachliche Zuordnung der Tabellen

### storage_locations

Speichert die Lagerorte.

Beispiele:

- Wohnung
- Küche
- Wohnzimmer
- Vorratskammer

Wichtige Bedeutung:

- oberste Ebene der Lagerstruktur
- enthält mehrere Lagergeräte oder Lagerbereiche über `storage_units`

### storage_units

Speichert Lagergeräte oder Lagerbereiche innerhalb eines Lagerortes.

Beispiele:

- Gefrierschrank
- Kühlschrank
- Regal
- Vorratsbereich

Wichtige Bedeutung:

- gehört über `location_id` zu `storage_locations`
- kann mehrere Lagerfächer über `storage_compartments` enthalten
- enthält technische Zusatzinformationen wie Typ, Hersteller, Modell, Temperaturzone und QR-Druckfreigabe

### storage_compartments

Speichert Fächer oder Unterteilungen eines Lagergeräts.

Beispiele:

- Schublade 1
- Schublade 2
- Fach oben
- Regalboden 3

Wichtige Bedeutung:

- gehört über `unit_id` zu `storage_units`
- Kombination aus `unit_id` und `name` ist eindeutig
- wird von Bestandseinträgen optional genutzt

### products

Speichert die Produktstammdaten.

Typische Inhalte:

- Produktname
- Marke
- Kategorie
- Land
- Geschäft
- Barcode
- Wieder-kaufen-Bewertung
- Bewertung
- Notizen
- Produktbilder für Vorder- und Rückseite
- Favoritenkennzeichen

Wichtige Bedeutung:

- Grundlage für Bestandseinträge
- Grundlage für die Einkaufsliste mit Produktbezug
- Produkte können deaktiviert werden, bleiben aber als Stammdaten erhalten

### inventory_items

Speichert konkrete vorhandene Bestände.

Typische Inhalte:

- Produktbezug
- Lagergerät
- Lagerfach
- ursprüngliche Menge
- Restmenge
- Einheit
- Packungszustand
- Mindesthaltbarkeitsdatum
- Einfrierdatum
- Öffnungsdatum
- interne Verbrauchsfrist
- QR-Code
- Etikettenbezug
- Chargeninformationen

Wichtige Beziehungen:

- `product_id` verweist auf `products`
- `storage_unit_id` verweist auf `storage_units`
- `storage_compartment_id` verweist optional auf `storage_compartments`
- `label_slot_id` verknüpft Bestandseinträge fachlich mit Etikettenplätzen

### label_slots

Speichert QR-Etikettenplätze und deren Druck- oder Nutzungsstatus.

Typische Inhalte:

- Etikettencode
- Status frei oder belegt
- aktueller Bestandseintrag
- Druckstatus
- letzter Nutzungszeitpunkt
- Notizen

Wichtige Bedeutung:

- Grundlage für Etikettenpool und Nachdrucklogik
- Etiketten können wieder freigegeben und erneut verwendet werden
- `current_inventory_item_id` verweist fachlich auf einen aktuellen Bestandseintrag

### inventory_history

Speichert Historieneinträge zu entfernten oder verbrauchten Beständen.

Typische Inhalte:

- Produktdaten zum Zeitpunkt der Entfernung
- Etikettencode
- Entfernungsdatum
- Entfernungsgrund
- Wieder-kaufen-Bewertung nach Entfernung
- Erfahrungsgrund
- Erfahrungsnotiz

Wichtige Bedeutung:

- dokumentiert Verbrauch, Entsorgung, Ablauf oder sonstige Entfernung
- enthält Snapshot-Daten zum Produkt, damit die Historie auch später nachvollziehbar bleibt
- kann für spätere Auswertungen und Einkaufsvorschläge genutzt werden

### shopping_list_items

Speichert offene und erledigte Einkaufslisteneinträge.

Typische Inhalte:

- Produktbezug oder freier Artikelname
- Menge
- Einheit
- Notiz
- Kategorie
- Auslandseinkauf-Kennzeichen
- Priorität
- Status offen oder erledigt
- Erstellungs-, Änderungs- und Erledigungsdatum

Wichtige Beziehungen:

- `product_id` verweist optional auf `products`
- bei gelöschtem Produkt wird der Produktbezug auf `NULL` gesetzt
- freie Einkaufslisteneinträge nutzen `custom_name`

## Wichtige Datenbeziehungen

### Lagerstruktur

```text
storage_locations
└─ storage_units
   └─ storage_compartments
```

### Bestand

```text
products
└─ inventory_items
```

Zusätzlich wird jeder Bestandseintrag einem Lagergerät und optional einem Lagerfach zugeordnet.

```text
storage_units
└─ inventory_items

storage_compartments
└─ inventory_items
```

### Etiketten

```text
label_slots
└─ inventory_items
```

Die Beziehung ist fachlich vorhanden. In der aktuellen Datenbankstruktur ist `label_slot_id` in `inventory_items` vorhanden. Für `label_slots.current_inventory_item_id` sollte später geprüft werden, ob ein expliziter Fremdschlüssel sinnvoll ergänzt wird.

### Historie

```text
inventory_items
└─ inventory_history
```

Die Historie speichert entfernte Bestände nicht nur als technische Referenz, sondern zusätzlich mit Produkt-Snapshot-Daten. Dadurch bleibt die Historie auch dann verständlich, wenn sich Produktstammdaten später ändern.

### Einkaufsliste

```text
products
└─ shopping_list_items
```

Ein Einkaufslisteneintrag kann einen Produktbezug haben oder als freier Artikel ohne Produktbezug angelegt werden.

## Wichtige technische Regeln

### Datenbankpfad

SQLite-Befehle aus dem Projektroot sollen diesen Pfad verwenden:

```text
server/database/food_inventory.db
```

Beispiel:

```bash
sqlite3 server/database/food_inventory.db ".tables"
```

### Datenbank ist nicht in Git

Die Datei:

```text
server/database/food_inventory.db
```

wird nicht in Git versioniert.

### Backups

Die Datenbank wird über folgendes Skript gesichert:

```text
scripts/backup-database.sh
```

### Restore

Eine Datenbank-Wiederherstellung erfolgt über:

```text
scripts/restore-database.sh
```

Das Restore-Skript sichert die aktuelle Datenbank vor dem Zurückspielen eines Backups zusätzlich ab.

### Produktbilder

Produktbilder sind nicht Bestandteil der SQLite-Datenbank.

Sie liegen separat unter:

```text
server/uploads/products/
```

Für eine vollständige Sicherung werden daher benötigt:

```text
server/database/food_inventory.db
server/uploads/products/
```

## Offene Prüfpunkte

Spätere sinnvolle Ergänzungen:

- Migrationslogik zusätzlich dokumentieren
- API-Routen je Tabelle zuordnen
- Fremdschlüssel fachlich genauer beschreiben
- vollständige Sicherung aus Datenbank und Upload-Ordner planen
- Aufräumlogik für nicht mehr verwendete Produktbilder planen
- prüfen, ob für `label_slots.current_inventory_item_id` später ein expliziter Fremdschlüssel ergänzt werden soll
- prüfen, ob Historieneinträge langfristig zusätzliche Snapshot-Felder benötigen
