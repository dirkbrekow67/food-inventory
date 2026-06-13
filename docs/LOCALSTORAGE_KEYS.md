<!-- docs/LOCALSTORAGE_KEYS.md -->

# localStorage-Keys – Food Inventory

Stand: 2026-06-13 – nach Block 227

## Zweck dieses Dokuments

Dieses Dokument erfasst die tatsächlich im Code verwendeten localStorage-Keys der Anwendung.

Es ergänzt `docs/LOKALE_BROWSERDATEN.md`.

Dort ist allgemein beschrieben, welche lokalen Browserdaten es gibt. Dieses Dokument listet die konkreten technischen Keys, Speicherorte und Löschbarkeit.

## Technische Grundlage

Die lokalen Daten werden im Browser über `window.localStorage` gespeichert.

Die Daten liegen nicht in der SQLite-Datenbank und werden nicht über das Datenbank-Backup gesichert.

## Tatsächlich verwendete localStorage-Keys

| Key                                          | Datei                                                | Zweck                                                                    | Gespeicherter Inhalt                                                                      | Kann gelöscht werden                                                 |
| -------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `food-inventory.printedLabelCodes`           | `client/src/utils/printedLabelStorageUtils.js`       | Merkt lokal, welche Etikettencodes bereits als gedruckt markiert wurden. | JSON-Array mit normalisierten Etikettencodes.                                             | Ja, dann gehen lokale Druck-Markierungen verloren.                   |
| `food-inventory.productFilters`              | `client/src/components/products/ProductsSection.jsx` | Speichert die zuletzt genutzten Produktfilter.                           | JSON-Objekt mit Suchtext, Kategorie, Land, Geschäft, Wieder-kaufen-Filter und Sortierung. | Ja, dann werden Produktfilter auf Standardwerte zurückgesetzt.       |
| `food-inventory.showProductsInInventoryView` | `client/src/App.jsx`                                 | Speichert, ob Produkte in der Bestandsansicht angezeigt werden.          | String `true` oder `false`.                                                               | Ja, dann wird wieder der Standardwert `true` genutzt.                |
| `food-inventory.productFormDraft`            | `client/src/App.jsx`                                 | Speichert einen lokalen Produktformular-Entwurf.                         | JSON-Objekt auf Basis von `emptyProductForm`.                                             | Ja, dann geht ein nicht gespeicherter Produktentwurf verloren.       |
| `food-inventory.inventoryFormDraft`          | `client/src/App.jsx`                                 | Speichert einen lokalen Bestandsformular-Entwurf.                        | JSON-Objekt auf Basis von `emptyInventoryForm`.                                           | Ja, dann geht ein nicht gespeicherter Bestandsentwurf verloren.      |
| `food-inventory.inventoryFilters`            | `client/src/App.jsx`                                 | Speichert die zuletzt genutzten Bestandsfilter.                          | JSON-Objekt auf Basis von `createInitialInventoryFilterState()`.                          | Ja, dann werden Bestandsfilter auf Standardwerte zurückgesetzt.      |
| `food-inventory.historyFilters`              | `client/src/App.jsx`                                 | Speichert die zuletzt genutzten Historienfilter.                         | JSON-Objekt auf Basis von `createInitialHistoryFilterState()`.                            | Ja, dann werden Historienfilter auf Standardwerte zurückgesetzt.     |
| `food-inventory.activeSection`               | `client/src/App.jsx`                                 | Speichert den zuletzt geöffneten Hauptbereich der App.                   | String mit dem Bereichsnamen, z. B. `inventory`.                                          | Ja, dann startet die App wieder mit dem Standardbereich `inventory`. |

## Fundstellen im Code

### Etiketten-Druckstatus

Datei: `client/src/utils/printedLabelStorageUtils.js`

Key: `food-inventory.printedLabelCodes`

Verwendete Funktionen:

- `loadPrintedLabelCodes()`
- `savePrintedLabelCodes(labelCodes)`
- `addPrintedLabelCodes(existingLabelCodes, nextLabelCodes)`
- `removePrintedLabelCodes(existingLabelCodes, labelCodesToRemove)`
- `clearPrintedLabelCodes()`

### Produktfilter

Datei: `client/src/components/products/ProductsSection.jsx`

Key: `food-inventory.productFilters`

Verwendete Funktionen:

- `loadProductFilterState()`
- `saveProductFilterState(nextFilterState)`

Standardwerte:

- `productSearchTerm`: leer
- `productCategoryFilter`: `all`
- `productCountryFilter`: `all`
- `productStoreFilter`: `all`
- `productBuyAgainFilter`: `all`
- `productSortMode`: `name_asc`

### Bestandsansicht Produktanzeige

Datei: `client/src/App.jsx`

Key: `food-inventory.showProductsInInventoryView`

Verwendete Funktionen:

- `loadShowProductsInInventoryView()`
- `saveShowProductsInInventoryView(nextValue)`

Standardwert: `true`

### Bestandsfilter

Datei: `client/src/App.jsx`

Key: `food-inventory.inventoryFilters`

Verwendete Funktionen:

- `loadInventoryFilterState()`
- `saveInventoryFilterState(nextFilterState)`

Standardwerte kommen aus `createInitialInventoryFilterState()`.

### Historienfilter

Datei: `client/src/App.jsx`

Key: `food-inventory.historyFilters`

Verwendete Funktionen:

- `loadHistoryFilterState()`
- `saveHistoryFilterState(nextFilterState)`

Standardwerte kommen aus `createInitialHistoryFilterState()`.

### Aktiver Hauptbereich

Datei: `client/src/App.jsx`

Key: `food-inventory.activeSection`

Verwendete Funktionen:

- `loadActiveSection()`
- `saveActiveSection(nextActiveSection)`

Standardwert: `inventory`

### Produktformular-Entwurf

Datei: `client/src/App.jsx`

Key: `food-inventory.productFormDraft`

Verwendete Funktionen:

- `loadProductFormDraft()`
- `saveProductFormDraft(nextProductForm)`
- `clearProductFormDraft()`

Standardwerte kommen aus `emptyProductForm`.

### Bestandsformular-Entwurf

Datei: `client/src/App.jsx`

Key: `food-inventory.inventoryFormDraft`

Verwendete Funktionen:

- `loadInventoryFormDraft()`
- `saveInventoryFormDraft(nextInventoryForm)`
- `clearInventoryFormDraft()`

Standardwerte kommen aus `emptyInventoryForm`.

## Löschbarkeit und Folgen

Alle aktuell erfassten localStorage-Keys enthalten Komfortdaten oder Entwürfe.

Das Löschen dieser Keys beschädigt nicht die SQLite-Datenbank.

Mögliche Folgen beim Löschen:

- Filter werden zurückgesetzt
- zuletzt geöffneter Bereich wird vergessen
- Anzeigeoptionen werden zurückgesetzt
- lokale Formularentwürfe gehen verloren
- lokale Druck-Markierungen für Etiketten gehen verloren

## Wichtiger Hinweis zu Entwürfen

Produkt- und Bestandsentwürfe sind noch keine gespeicherten Datensätze.

Erst nach dem Speichern werden Daten über die API in der SQLite-Datenbank abgelegt.

Betroffene Keys:

- `food-inventory.productFormDraft`
- `food-inventory.inventoryFormDraft`

## Wichtiger Hinweis zu Etiketten

Der Key `food-inventory.printedLabelCodes` speichert lokale Druckinformationen.

Die eigentlichen Etikettenplätze liegen dagegen in der SQLite-Tabelle `label_slots`.

Dadurch können lokale Druckinformationen und Datenbankstatus auseinanderlaufen, wenn Browserdaten gelöscht oder ein anderer Browser verwendet wird.

## Aktueller Prüfstand

Gefundene localStorage-Fundstellen wurden geprüft mit:

- `grep -RIn "localStorage" client/src server --exclude-dir=node_modules`
- `grep -RIn "localStorage\.getItem\|localStorage\.setItem\|localStorage\.removeItem" client/src server --exclude-dir=node_modules`

Gefundene Dateien:

- `client/src/utils/printedLabelStorageUtils.js`
- `client/src/components/products/ProductsSection.jsx`
- `client/src/App.jsx`

Im Server wurde keine localStorage-Nutzung gefunden.

## Offene Prüfpunkte

Spätere sinnvolle Arbeiten:

- Reset-Funktion für lokale Browserdaten planen
- einzelne lokale Entwürfe gezielt löschbar machen
- prüfen, ob lokale Etiketten-Druckmarkierungen dauerhaft in die Datenbank gehören
- prüfen, ob Einkaufsliste-Filter künftig lokal gespeichert werden sollen
- prüfen, ob alte Keys bei Umbenennungen automatisch migriert oder gelöscht werden sollen
- bei neuen localStorage-Keys dieses Dokument aktualisieren
