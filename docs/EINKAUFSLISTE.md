<!-- docs/EINKAUFSLISTE.md -->

# Einkaufsliste – Planung

Stand: 2026-06-07 – Block 201

## Ziel der Einkaufsliste

Die Einkaufsliste soll Produkte und freie Artikel erfassen, die später eingekauft werden sollen.

Sie soll im Alltag schnell nutzbar sein, insbesondere auf dem Handy im Laden.

Die Einkaufsliste soll später auch für Auslandseinkäufe genutzt werden können.

## Grundidee

Ein Einkaufslisteneintrag kann entweder:

- mit einem vorhandenen Produkt verknüpft sein
- oder als freier Artikel ohne Produktbezug angelegt werden

Beispiele:

```text
Produktbezug: Sokołów Kiełbasa biała
Freier Artikel: Spülmittel
```

## Geplante Tabelle

Geplante SQLite-Tabelle:

```text
shopping_list_items
```

## Geplante Felder

### Technische Felder

```text
id
created_at
updated_at
completed_at
```

Bedeutung:

- `id` ist die eindeutige interne ID.
- `created_at` speichert das Erstellungsdatum.
- `updated_at` speichert die letzte Änderung.
- `completed_at` wird gesetzt, wenn der Eintrag erledigt wurde.

### Produktbezug

```text
product_id
```

Bedeutung:

- optionaler Bezug zu einem vorhandenen Produkt
- darf leer sein, wenn es sich um einen freien Artikel handelt

Beispiel:

```text
product_id = 17
```

### Freier Artikelname

```text
custom_name
```

Bedeutung:

- Name für Artikel ohne Produktbezug
- kann auch als zusätzlicher Anzeigetext genutzt werden
- erforderlich, wenn kein `product_id` vorhanden ist

Beispiele:

```text
Milch
Butter
Spülmittel
Kiełbasa biała
```

### Menge und Einheit

```text
quantity
unit
```

Bedeutung:

- `quantity` speichert die gewünschte Menge.
- `unit` speichert die Einheit.

Beispiele:

```text
quantity = 2
unit = Packungen
```

```text
quantity = 500
unit = g
```

### Notiz

```text
note
```

Bedeutung:

- zusätzliche Information für den Einkauf
- optional

Beispiele:

```text
nur wenn im Angebot
für Polen mitnehmen
nicht die scharfe Variante
```

### Kategorie

```text
category
```

Bedeutung:

- optionale Gruppierung für bessere Übersicht im Laden
- zunächst als einfacher Text geplant

Beispiele:

```text
Kühlung
Tiefkühl
Vorrat
Drogerie
Ausland
Sonstiges
```

### Auslandseinkauf

```text
is_foreign_purchase
```

Bedeutung:

- Kennzeichen, ob der Artikel speziell für Auslandseinkäufe relevant ist

Werte:

```text
0 = nein
1 = ja
```

### Priorität

```text
priority
```

Bedeutung:

- einfache Priorisierung für wichtige Einträge

Geplante Werte:

```text
normal
hoch
niedrig
```

Startwert:

```text
normal
```

### Status

```text
status
```

Bedeutung:

- aktueller Zustand des Einkaufslisteneintrags

Geplante Werte:

```text
open
completed
```

Bedeutung:

- `open` = noch einkaufen
- `completed` = erledigt / abgehakt

## Mindestanforderung für einen gültigen Eintrag

Ein Einkaufslisteneintrag ist gültig, wenn mindestens eines der folgenden Felder gesetzt ist:

```text
product_id
custom_name
```

Es muss also entweder ein Produktbezug oder ein freier Artikelname vorhanden sein.

## Erste geplante Datenbankstruktur

Voraussichtliche Struktur für Block 202:

```sql
CREATE TABLE IF NOT EXISTS shopping_list_items (
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
  FOREIGN KEY (product_id) REFERENCES products(id)
);
```

## Erste API-Funktionen

Geplante Serverfunktionen ab Block 203:

```text
GET    /api/shopping-list
POST   /api/shopping-list
PUT    /api/shopping-list/:id
PATCH  /api/shopping-list/:id/complete
PATCH  /api/shopping-list/:id/reopen
DELETE /api/shopping-list/:id
```

## Erste Client-Funktionen

Geplante Client-Funktionen ab Block 204:

- Einkaufsliste anzeigen
- freien Artikel hinzufügen
- Produkt zur Einkaufsliste hinzufügen
- Menge und Einheit erfassen
- Notiz erfassen
- Artikel abhaken
- erledigte Artikel anzeigen oder ausblenden
- Artikel löschen

## Mobile Nutzung

Die Einkaufsliste soll auf dem Handy besonders einfach nutzbar sein.

Wichtig:

- große Schaltflächen
- schnelles Abhaken
- gute Lesbarkeit
- offene Artikel zuerst
- erledigte Artikel einklappbar oder ausblendbar

## Spätere Erweiterungen

Mögliche spätere Funktionen:

- Sortierung nach Kategorie
- Gruppierung nach Geschäft
- Export als Text
- Teilen über Messenger
- Offline-Kopie im Browser
- automatische Vorschläge aus Produkten mit Bewertung „wieder kaufen“
- Einkauf aus Historie oder Verbrauch ableiten
- Filter für Auslandseinkäufe

## Nicht Bestandteil von Block 201

Noch nicht umgesetzt werden:

- Datenbankmigration
- API-Routen
- React-Komponente
- Produktkarten-Button
- Offline-Funktion
- Benutzerkonto
- externe Nutzung außerhalb des WLANs

Diese Punkte folgen in späteren Blöcken.
