<!-- docs/LOCALSTORAGE_RESET_PLAN.md -->

# Reset-Funktion für lokale Browserdaten – Planung

## Umsetzungsstand

Der Reset lokaler Browserdaten ist umgesetzt.

Stand nach Block 235:

- zentrale localStorage-Keys in `client/src/constants/localStorageKeys.js`
- Reset-Hilfsfunktionen in `client/src/utils/localStorageResetUtils.js`
- Wartungsbereich in `client/src/components/maintenance/MaintenanceSection.jsx`
- Hauptnavigationseintrag `Wartung` in `client/src/App.jsx`
- Sicherheitsabfragen vor jedem Reset per Browser-Dialog
- Statusmeldung nach dem Löschen lokaler Browserdaten
- direkte App-State-Synchronisierung für ausgewählte Zustände nach dem Reset

Umgesetzte Reset-Gruppen:

- Filter und Anzeige
- Formularentwürfe
- lokale Etiketten-Druckmarkierungen
- alle bekannten lokalen Browserdaten dieser App

Die SQLite-Datenbank wird durch diese Wartungsfunktion nicht verändert.

Hinweis: Die ursprüngliche Planung ist historisch erhalten. Die technische Umsetzung erfolgte in den Blöcken 231 bis 235.

Stand: 2026-06-13 – nach Block 228

## Zweck dieses Dokuments

Dieses Dokument plant eine spätere Reset-Funktion für lokale Browserdaten der Anwendung.

Die Reset-Funktion soll lokale Komfortdaten und Entwürfe im Browser gezielt löschen können, ohne die eigentlichen Daten in der SQLite-Datenbank zu verändern.

Grundlage ist:

- `docs/LOKALE_BROWSERDATEN.md`
- `docs/LOCALSTORAGE_KEYS.md`

## Abgrenzung

### Nicht betroffen

Die Reset-Funktion darf keine Daten in der SQLite-Datenbank löschen.

Nicht betroffen sind:

- Produkte
- Bestandseinträge
- Lagerorte
- Lagergeräte
- Lagerfächer
- Historieneinträge
- Etikettenplätze
- Einkaufslisteneinträge

Datenbankpfad:

- `server/database/food_inventory.db`

### Betroffen

Betroffen sind nur lokale Browserdaten unter `window.localStorage`.

Diese Daten liegen nur im jeweiligen Browser und auf dem jeweiligen Gerät.

## Aktuell bekannte localStorage-Keys

Aktuell dokumentierte Keys:

- `food-inventory.printedLabelCodes`
- `food-inventory.productFilters`
- `food-inventory.showProductsInInventoryView`
- `food-inventory.productFormDraft`
- `food-inventory.inventoryFormDraft`
- `food-inventory.inventoryFilters`
- `food-inventory.historyFilters`
- `food-inventory.activeSection`

## Sinnvolle Reset-Gruppen

### 1. Nur Filter und Anzeigeoptionen zurücksetzen

Diese Option löscht nur Komforteinstellungen.

Betroffene Keys:

- `food-inventory.productFilters`
- `food-inventory.inventoryFilters`
- `food-inventory.historyFilters`
- `food-inventory.showProductsInInventoryView`
- `food-inventory.activeSection`

Folgen:

- Produktfilter werden zurückgesetzt
- Bestandsfilter werden zurückgesetzt
- Historienfilter werden zurückgesetzt
- Anzeigeoptionen werden zurückgesetzt
- App startet wieder im Standardbereich

Diese Option ist unkritisch.

### 2. Formularentwürfe löschen

Diese Option löscht nicht gespeicherte lokale Entwürfe.

Betroffene Keys:

- `food-inventory.productFormDraft`
- `food-inventory.inventoryFormDraft`

Folgen:

- nicht gespeicherter Produktentwurf geht verloren
- nicht gespeicherter Bestandsentwurf geht verloren
- gespeicherte Produkte und Bestände bleiben erhalten

Diese Option sollte eine kurze Warnung anzeigen.

### 3. Lokale Etiketten-Druckmarkierungen löschen

Diese Option löscht lokale Druckinformationen.

Betroffener Key:

- `food-inventory.printedLabelCodes`

Folgen:

- lokal gemerkte gedruckte Etikettencodes werden vergessen
- Datenbanktabelle `label_slots` bleibt unverändert
- Druckstatus in der Datenbank kann weiterhin vorhanden sein
- lokale Ansicht und Datenbankstatus können dadurch unterschiedlich wirken

Diese Option sollte deutlich erklärt werden.

### 4. Alle lokalen Browserdaten der App löschen

Diese Option löscht alle bekannten localStorage-Keys der App.

Betroffene Keys:

- `food-inventory.printedLabelCodes`
- `food-inventory.productFilters`
- `food-inventory.showProductsInInventoryView`
- `food-inventory.productFormDraft`
- `food-inventory.inventoryFormDraft`
- `food-inventory.inventoryFilters`
- `food-inventory.historyFilters`
- `food-inventory.activeSection`

Folgen:

- Filter und Anzeigeoptionen werden zurückgesetzt
- aktive Ansicht wird vergessen
- lokale Formularentwürfe werden gelöscht
- lokale Etiketten-Druckmarkierungen werden gelöscht
- SQLite-Datenbank bleibt unverändert

Diese Option sollte nur nach Bestätigung ausgeführt werden.

## Vorgeschlagene Bedienung in der App

Die Reset-Funktion sollte später in einem Bereich „Einstellungen“ oder „Wartung“ liegen.

Mögliche Schaltflächen:

- Filter und Anzeige zurücksetzen
- Formularentwürfe löschen
- lokale Etiketten-Druckmarkierungen löschen
- alle lokalen Browserdaten dieser App löschen

## Vorgeschlagene Sicherheitsabfragen

### Für Filter und Anzeige

Kurzer Hinweis reicht aus:

- „Filter und Anzeigeoptionen werden zurückgesetzt. Gespeicherte Daten bleiben erhalten.“

### Für Formularentwürfe

Bestätigung sinnvoll:

- „Nicht gespeicherte Produkt- und Bestandsentwürfe werden gelöscht. Gespeicherte Daten bleiben erhalten.“

### Für Etiketten-Druckmarkierungen

Deutliche Erklärung sinnvoll:

- „Lokale Druckmarkierungen werden gelöscht. Die Etikettenplätze in der Datenbank bleiben unverändert.“

### Für vollständigen lokalen Reset

Deutliche Bestätigung sinnvoll:

- „Alle lokalen Browserdaten dieser App werden gelöscht. Die SQLite-Datenbank bleibt erhalten. Nicht gespeicherte Entwürfe gehen verloren.“

## Technische Umsetzungsrichtung

Sinnvoll wäre eine zentrale Datei für lokale Speicher-Keys.

Mögliche Datei:

- `client/src/constants/localStorageKeys.js`

Dort könnten alle Keys zentral gepflegt werden.

Vorteile:

- keine verstreuten String-Konstanten
- Reset-Funktion kann Keys zuverlässig verwenden
- neue Keys werden leichter dokumentiert
- weniger Risiko durch Tippfehler

## Mögliche Funktionsstruktur

Mögliche spätere Hilfsdatei:

- `client/src/utils/localStorageResetUtils.js`

Mögliche Funktionen:

- `clearFilterStorage()`
- `clearDraftStorage()`
- `clearPrintedLabelStorage()`
- `clearAllFoodInventoryLocalStorage()`

## Wichtige technische Regel

Die Reset-Funktion darf nur Keys löschen, die mit dem App-Präfix beginnen:

- `food-inventory.`

Sie darf keine fremden Browserdaten löschen.

## Testfälle für spätere Umsetzung

Vor Umsetzung sollten folgende Fälle geprüft werden:

- Produktfilter setzen, Reset ausführen, Produktfilter prüfen
- Bestandsfilter setzen, Reset ausführen, Bestandsfilter prüfen
- Historienfilter setzen, Reset ausführen, Historienfilter prüfen
- Produktentwurf beginnen, Reset Entwürfe ausführen, Formular prüfen
- Bestandsentwurf beginnen, Reset Entwürfe ausführen, Formular prüfen
- Etiketten als gedruckt markieren, lokalen Druckstatus löschen, Anzeige prüfen
- vollständigen lokalen Reset ausführen, App neu laden, Standardzustand prüfen
- prüfen, dass SQLite-Daten unverändert bleiben

## Offene Prüfpunkte

Spätere sinnvolle Arbeiten:

- entscheiden, ob ein eigener Einstellungsbereich angelegt wird
- entscheiden, ob Reset direkt im UI oder nur als Wartungsfunktion angeboten wird
- lokale Speicher-Keys zentralisieren
- Reset-Hilfsfunktionen erstellen
- Warntexte in einfacher Sprache formulieren
- nach Umsetzung `docs/LOCALSTORAGE_KEYS.md` aktualisieren
- nach Umsetzung `docs/PROJEKTSTAND.md` aktualisieren
