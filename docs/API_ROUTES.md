<!-- docs/API_ROUTES.md -->

# API-Routen – Food Inventory

Stand: 2026-06-13 – nach Block 292

## Zweck dieses Dokuments

Dieses Dokument beschreibt die aktuell vom Frontend genutzten API-Routen der Food-Inventory-App.

Es dient als technische Übersicht für Entwicklung, Debugging, Raspberry-Pi-Betrieb und spätere Erweiterungen.

Grundlage:

- `client/src/api/apiClient.js` – gemeinsame Fetch-, Request- und Fehlerbehandlung
- `client/src/api/apiPathHelpers.js` – gemeinsame Pfad-Hilfsfunktionen
- `client/src/api/apiPaths.js` – zentrale API-Pfadkonstanten
- `client/src/api/inventoryApiPaths.js` – konkrete Pfad-Erzeuger für dynamische Routen
- `client/src/api/productApi.js` – Produkt-API
- `client/src/api/storageApi.js` – Lagerstruktur-API
- `client/src/api/labelApi.js` – Etiketten-API
- `client/src/api/inventoryItemsApi.js` – Bestands-API
- `client/src/api/historyApi.js` – Historien-API
- `client/src/api/shoppingListApi.js` – Einkaufslisten-API
- `client/src/api/inventoryApi.js` – Kompatibilitätsdatei für ältere Imports, keine eigene Fetch- oder Fachlogik

Basis-Pfad im Frontend:

- `/api`

Der Server läuft lokal standardmäßig auf:

- `http://localhost:3101`

## Übersicht der aktuell genutzten Frontend-Aufrufe

| Bereich | Methode | Pfad | Zweck |
|---|---:|---|---|
| Lagerstruktur | GET | `/api/storage/tree` | aktive Lagerstruktur laden |
| Lagerstruktur | GET | `/api/storage/inactive` | inaktive Lagerstruktur laden |
| Lagerstruktur | POST | `/api/storage/locations` | Lagerort anlegen |
| Lagerstruktur | DELETE | `/api/storage/locations/:locationId` | Lagerort deaktivieren |
| Lagerstruktur | PATCH | `/api/storage/locations/:locationId/reactivate` | Lagerort reaktivieren |
| Lagerstruktur | POST | `/api/storage/units` | Lagergerät anlegen |
| Lagerstruktur | DELETE | `/api/storage/units/:unitId` | Lagergerät deaktivieren |
| Lagerstruktur | PATCH | `/api/storage/units/:unitId/reactivate` | Lagergerät reaktivieren |
| Lagerstruktur | POST | `/api/storage/units/:unitId/compartments` | Lagerfach anlegen |
| Lagerstruktur | POST | `/api/storage/units/:unitId/compartments/generate` | mehrere Lagerfächer erzeugen |
| Lagerstruktur | DELETE | `/api/storage/compartments/:compartmentId` | Lagerfach deaktivieren |
| Lagerstruktur | PATCH | `/api/storage/compartments/:compartmentId/reactivate` | Lagerfach reaktivieren |
| Produkte | GET | `/api/products` | Produktliste laden |
| Produkte | POST | `/api/products` | Produkt anlegen |
| Produkte | PUT | `/api/products/:productId` | Produkt bearbeiten |
| Produkte | DELETE | `/api/products/:productId` | Produkt deaktivieren |
| Produkte | POST | `/api/products/photos` | Produktfoto speichern |
| Bestand | GET | `/api/inventory` | Bestand laden |
| Bestand | POST | `/api/inventory` | Bestandseintrag anlegen |
| Bestand | PUT | `/api/inventory/:inventoryItemId` | Bestandseintrag bearbeiten |
| Bestand | DELETE | `/api/inventory/:inventoryItemId` | Bestand entfernen |
| Historie | GET | `/api/history` | Historieneinträge laden |
| Historie | PUT | `/api/history/:historyItemId` | Historieneintrag bearbeiten |
| Historie | DELETE | `/api/history/:historyItemId` | Historieneintrag löschen |
| Etiketten | GET | `/api/labels` | Etikettenpool laden |
| Etiketten | POST | `/api/labels/mark-printed` | Etiketten als gedruckt markieren |
| Etiketten | PATCH | `/api/labels/:labelCode/print-status` | Druckstatus eines Etiketts ändern |
| Etiketten | DELETE | `/api/labels/free` | freie Etikettencodes entfernen |
| Etiketten | DELETE | `/api/labels/free/all` | alle freien Etikettencodes zurücksetzen |
| Einkaufsliste | GET | `/api/shopping-list` | Einkaufsliste laden |
| Einkaufsliste | POST | `/api/shopping-list` | Einkaufslisteneintrag anlegen |
| Einkaufsliste | PUT | `/api/shopping-list/:itemId` | Einkaufslisteneintrag bearbeiten |
| Einkaufsliste | PATCH | `/api/shopping-list/:itemId/complete` | Einkaufslisteneintrag als erledigt markieren |
| Einkaufsliste | PATCH | `/api/shopping-list/:itemId/reopen` | Einkaufslisteneintrag wieder öffnen |
| Einkaufsliste | DELETE | `/api/shopping-list/:itemId` | Einkaufslisteneintrag löschen |

## Lagerstruktur

### GET `/api/storage/tree`

Lädt die aktive Lagerstruktur.

Verwendet durch:

- `loadStorageTree()`

### GET `/api/storage/inactive`

Lädt deaktivierte Lagerorte, Lagergeräte oder Lagerfächer.

Verwendet durch:

- `loadInactiveStorageItems()`

### POST `/api/storage/locations`

Legt einen Lagerort an.

Verwendet durch:

- `createStorageLocation(name)`

### DELETE `/api/storage/locations/:locationId`

Deaktiviert einen Lagerort.

Verwendet durch:

- `deactivateStorageLocationById(locationId)`

### PATCH `/api/storage/locations/:locationId/reactivate`

Reaktiviert einen Lagerort.

Verwendet durch:

- `reactivateStorageLocationById(locationId)`

### POST `/api/storage/units`

Legt ein Lagergerät an.

Verwendet durch:

- `createStorageUnit(payload)`

### DELETE `/api/storage/units/:unitId`

Deaktiviert ein Lagergerät.

Verwendet durch:

- `deactivateStorageUnitById(unitId)`

### PATCH `/api/storage/units/:unitId/reactivate`

Reaktiviert ein Lagergerät.

Verwendet durch:

- `reactivateStorageUnitById(unitId)`

### POST `/api/storage/units/:unitId/compartments`

Legt ein Lagerfach in einem Lagergerät an.

Verwendet durch:

- `createStorageCompartment(unitId, payload)`

### POST `/api/storage/units/:unitId/compartments/generate`

Erzeugt mehrere Lagerfächer für ein Lagergerät.

Verwendet durch:

- `generateStorageCompartments(unitId, payload)`

### DELETE `/api/storage/compartments/:compartmentId`

Deaktiviert ein Lagerfach.

Verwendet durch:

- `deactivateStorageCompartmentById(compartmentId)`

### PATCH `/api/storage/compartments/:compartmentId/reactivate`

Reaktiviert ein Lagerfach.

Verwendet durch:

- `reactivateStorageCompartmentById(compartmentId)`

Zugehörige Tabellen:

- `storage_locations`
- `storage_units`
- `storage_compartments`

## Produkte

### GET `/api/products`

Lädt die Produktliste.

Verwendet durch:

- `loadProducts()`

### POST `/api/products`

Legt ein neues Produkt an.

Verwendet durch:

- `saveProduct(productId, payload)` ohne `productId`

### PUT `/api/products/:productId`

Bearbeitet ein bestehendes Produkt.

Verwendet durch:

- `saveProduct(productId, payload)` mit `productId`

### DELETE `/api/products/:productId`

Deaktiviert ein Produkt.

Verwendet durch:

- `deactivateProductById(productId)`

### POST `/api/products/photos`

Speichert ein Produktfoto.

Verwendet durch:

- `uploadProductPhoto({ productId, side, imageDataUrl })`

Zugehörige Tabelle:

- `products`

Zusätzlicher Dateibereich:

- `server/uploads/products/`

## Bestand

### GET `/api/inventory`

Lädt alle Bestandseinträge.

Verwendet durch:

- `loadInventoryItems()`

### POST `/api/inventory`

Legt einen oder mehrere Bestandseinträge an.

Verwendet durch:

- `createInventoryItem(payload)`

### PUT `/api/inventory/:inventoryItemId`

Bearbeitet einen Bestandseintrag.

Verwendet durch:

- `updateInventoryItemById(inventoryItemId, payload)`

### DELETE `/api/inventory/:inventoryItemId`

Entfernt einen Bestandseintrag.

Verwendet durch:

- `removeInventoryItemById(inventoryItemId, payload)`

Je nach Payload können Historieneinträge angelegt und Etikettenplätze freigegeben werden.

Zugehörige Tabellen:

- `inventory_items`
- `inventory_history`
- `label_slots`

## Historie

### GET `/api/history`

Lädt Historieneinträge.

Verwendet durch:

- `loadHistoryItems()`

### PUT `/api/history/:historyItemId`

Bearbeitet einen Historieneintrag.

Verwendet durch:

- `updateHistoryItemById(historyItemId, payload)`

### DELETE `/api/history/:historyItemId`

Löscht einen Historieneintrag.

Verwendet durch:

- `deleteHistoryItemById(historyItemId)`

Zugehörige Tabelle:

- `inventory_history`

## Etiketten

### GET `/api/labels`

Lädt den Etikettenpool.

Verwendet durch:

- `loadLabelSlots()`

### POST `/api/labels/mark-printed`

Markiert mehrere Etiketten als gedruckt.

Verwendet durch:

- `markLabelCodesAsPrinted(labelCodes)`

### PATCH `/api/labels/:labelCode/print-status`

Ändert den Druckstatus eines Etiketts.

Verwendet durch:

- `updateLabelPrintStatus(labelCode, printStatus)`

### DELETE `/api/labels/free`

Entfernt freie Etikettencodes.

Verwendet durch:

- `releaseFreeLabelCodes(labelCodes)`

### DELETE `/api/labels/free/all`

Setzt alle freien Etikettencodes zurück.

Verwendet durch:

- `resetFreeLabelCodes()`

Zugehörige Tabelle:

- `label_slots`

## Einkaufsliste

### GET `/api/shopping-list`

Lädt Einkaufslisteneinträge.

Verwendet durch:

- `loadShoppingListItems(includeCompleted)`

Bekannter Query-Parameter:

- `includeCompleted=1`

### POST `/api/shopping-list`

Legt einen Einkaufslisteneintrag an.

Verwendet durch:

- `createShoppingListItem(payload)`

### PUT `/api/shopping-list/:itemId`

Bearbeitet einen Einkaufslisteneintrag.

Verwendet durch:

- `updateShoppingListItemById(itemId, payload)`

### PATCH `/api/shopping-list/:itemId/complete`

Markiert einen Einkaufslisteneintrag als erledigt.

Verwendet durch:

- `completeShoppingListItemById(itemId)`

### PATCH `/api/shopping-list/:itemId/reopen`

Öffnet einen erledigten Einkaufslisteneintrag wieder.

Verwendet durch:

- `reopenShoppingListItemById(itemId)`

### DELETE `/api/shopping-list/:itemId`

Löscht einen Einkaufslisteneintrag.

Verwendet durch:

- `deleteShoppingListItemById(itemId)`

Zugehörige Tabelle:

- `shopping_list_items`

## Offene Ergänzungen

Später sinnvoll:

- Server-Dateien je Route ergänzen
- Request-Body je Route genauer dokumentieren
- Response-Format je Route dokumentieren
- typische Fehlerfälle je Route dokumentieren
- API-Dokumentation mit `docs/DATENBANK.md` abgleichen
- prüfen, ob `GET /api/health` im aktuellen Frontend oder nur in der Diagnose-Konfiguration genutzt wird
