<!-- docs/EINKAUFSLISTE.md -->

# Einkaufsliste – Planung und aktueller Stand

Stand: 2026-06-13 – Block 216

## Ziel der Einkaufsliste

Die Einkaufsliste erfasst Produkte und freie Artikel, die später eingekauft werden sollen.

Sie soll im Alltag schnell nutzbar sein, insbesondere auf dem Handy im Laden.

Die Einkaufsliste wird zusätzlich für Auslandseinkäufe genutzt. Dafür können einzelne Einträge als Auslandseinkauf markiert und gefiltert werden.

## Grundidee

Ein Einkaufslisteneintrag kann entweder:

- mit einem vorhandenen Produkt verknüpft sein
- oder als freier Artikel ohne Produktbezug angelegt werden

Beispiele:

```text
Produktbezug: Sokołów Kiełbasa biała
Freier Artikel: Spülmittel
```

## Datenbanktabelle

Die Einkaufsliste wird in folgender SQLite-Tabelle gespeichert:

```text
shopping_list_items
```

## Felder

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
- aktuell als einfacher Text umgesetzt

Beispiele:

```text
Kühlung
Tiefkühlware
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

Werte:

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

Werte:

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

## Aktuelle Datenbankstruktur

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
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);
```

## API-Funktionen

Folgende API-Endpunkte sind umgesetzt:

```text
GET    /api/shopping-list
POST   /api/shopping-list
PUT    /api/shopping-list/:id
PATCH  /api/shopping-list/:id/complete
PATCH  /api/shopping-list/:id/reopen
DELETE /api/shopping-list/:id
```

Zusätzlich unterstützt `GET /api/shopping-list` den Parameter:

```text
includeCompleted=1
```

Damit können erledigte Einträge mitgeladen werden.

## Aktuelle Client-Funktionen

Umgesetzt sind:

- Einkaufsliste als eigener Bereich in der App
- freie Einkaufslisteneinträge anlegen
- Produkte direkt aus der Produktübersicht zur Einkaufsliste hinzufügen
- Menge, Einheit, Kategorie, Priorität und Notiz pflegen
- Einträge bearbeiten
- Einträge als erledigt markieren
- erledigte Einträge wieder öffnen
- Einträge löschen
- erledigte Einträge anzeigen oder ausblenden
- offene Einträge nach Priorität, Kategorie und Name sortieren
- offene Einträge nach Kategorie gruppieren
- Einkauf als Auslandseinkauf markieren
- Einkaufsliste nach `Alle`, `Ausland` und `Normal` filtern
- aktuell gefilterte offene Einkaufsliste als Text kopieren
- Exporttext anzeigen und manuell kopieren

## Textkopie / Export

Die aktuell gefilterte offene Einkaufsliste kann als Text kopiert werden.

Der Export berücksichtigt den gewählten Filter:

```text
Alle
Ausland
Normal
```

Beispiel:

```text
Einkaufsliste – Alle offenen Einträge

Kühlung:
- Sahne · 2 Becher · Kühlung · Ausland

Tiefkühlware:
- Bratwurst · Tiefkühlware · Priorität: niedrig
```

Beispiel Auslandseinkauf:

```text
Einkaufsliste – Auslandseinkauf

Kühlung:
- Sahne · 2 Becher · Kühlung · Ausland
```

Die Kopierfunktion nutzt die Clipboard-API des Browsers. Für Browser oder Umgebungen ohne direkte Clipboard-Unterstützung ist ein Fallback über ein temporäres Textfeld umgesetzt.

Zusätzlich kann der Exporttext über die Schaltfläche `Text anzeigen` direkt in der Anwendung angezeigt werden. Der Text erscheint in einem schreibgeschützten Textfeld und kann dort bei Bedarf manuell markiert und kopiert werden.

Diese Funktion dient als zusätzliche Absicherung, falls das automatische Kopieren auf einem Gerät, Browser oder im lokalen Netzwerk nicht zuverlässig funktioniert.

## Mobile Nutzung

Die Einkaufsliste ist für die Nutzung auf dem Handy vorbereitet.

Wichtig umgesetzt:

- große Schaltflächen
- schnelles Abhaken
- gute Lesbarkeit
- offene Artikel zuerst
- erledigte Artikel optional einblendbar
- mobile Darstellung mit einspaltigem Layout
- Filterbuttons für `Alle`, `Ausland` und `Normal`
- Textkopie für Notizen, TextEdit oder Messenger
- manuelle Textanzeige als Alternative zur Zwischenablage

## Abgeschlossene Blöcke

### Block 201 – Einkaufsliste planen

Abgeschlossen. Grundidee, Datenmodell, Felder und erste API-/Client-Funktionen geplant.

### Block 202 – Datenbanktabelle Einkaufsliste anlegen

Abgeschlossen. Tabelle `shopping_list_items` wurde angelegt.

### Block 203 – API-Routen Einkaufsliste ergänzen

Abgeschlossen. API-Endpunkte für Laden, Anlegen, Bearbeiten, Erledigen, Wiederöffnen und Löschen wurden umgesetzt.

### Block 204 – Einkaufsliste im Frontend anzeigen

Abgeschlossen. Erste React-Komponente für die Einkaufsliste wurde eingebunden.

### Block 205 – Produkte zur Einkaufsliste hinzufügen

Abgeschlossen. Produkte können direkt aus der Produktübersicht auf die Einkaufsliste übernommen werden.

### Block 206 – Produktfilter nach Wiederkaufen ergänzen

Abgeschlossen. Produkte können nach Wiederkaufen-Status gefiltert werden.

### Block 207 – Einkaufslistendetails bearbeiten

Abgeschlossen. Menge, Einheit, Kategorie, Priorität und Notiz können bearbeitet werden.

### Block 208 – Mobile Ansicht Einkaufsliste optimieren

Abgeschlossen. Darstellung und Bedienung der Einkaufsliste wurden für mobile Nutzung verbessert.

### Block 209 – Einkaufsliste sortieren und gruppieren

Abgeschlossen. Offene Einträge werden nach Priorität, Kategorie und Name sortiert und nach Kategorie gruppiert.

### Block 210 – Projektstand Einkaufsliste aktualisieren

Abgeschlossen. Projektstand wurde dokumentiert.

### Block 211 – Einkaufsliste für Auslandseinkäufe vorbereiten

Abgeschlossen. Einkaufslisteneinträge können als Auslandseinkauf markiert werden. Die Markierung wird gespeichert und als Chip `Ausland` angezeigt.

### Block 212 – Einkaufsliste nach Auslandseinkauf filtern

Abgeschlossen. Die Einkaufsliste kann nach `Alle`, `Ausland` und `Normal` gefiltert werden. Die Zähler zeigen die offenen Einträge je Filter an.

### Block 213 – Einkaufsliste als Text kopieren/exportieren

Abgeschlossen. Die aktuell gefilterte offene Einkaufsliste kann als Text in die Zwischenablage kopiert werden. Für Browser ohne direkte Clipboard-Unterstützung ist ein Fallback vorhanden.

### Block 214 – Dokumentation Einkaufsliste aktualisieren

Abgeschlossen. Die Datei `docs/EINKAUFSLISTE.md` wurde von der ursprünglichen Planung auf den aktuellen Umsetzungsstand gebracht.

### Block 215 – Exporttext anzeigen und manuell kopieren

Abgeschlossen. Der aktuell gefilterte Exporttext kann zusätzlich in der Anwendung angezeigt werden. Der Text wird in einem schreibgeschützten Textfeld dargestellt und kann dort manuell markiert und kopiert werden.

### Block 216 – Dokumentation Exporttext-Anzeige aktualisieren

Abgeschlossen. Die Dokumentation wurde um die Funktion `Text anzeigen` und die manuelle Kopiermöglichkeit ergänzt.

## Spätere Erweiterungen

Mögliche spätere Funktionen:

- Exporttext weiter anpassen oder formatieren
- Teilen über Messenger, soweit vom Browser unterstützt
- Offline-Kopie im Browser
- automatische Vorschläge aus Produkten mit Bewertung `wieder_kaufen`
- Einkauf aus Historie oder Verbrauch ableiten
- Gruppierung nach Geschäft
- Standardkategorien verwalten
- Mengen aus Beständen oder Verbrauch ableiten

## Nicht Bestandteil des aktuellen Stands

Noch nicht umgesetzt sind:

- Offline-Funktion
- Benutzerkonto
- externe Nutzung außerhalb des WLANs
- automatische Bedarfsermittlung
- automatische Vorschlagsliste aus Verbrauch oder Historie
- direkte Messenger-Teilen-Funktion
