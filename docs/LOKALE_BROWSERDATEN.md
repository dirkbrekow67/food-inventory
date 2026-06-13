<!-- docs/LOKALE_BROWSERDATEN.md -->

# Lokale Browserdaten – Food Inventory

Stand: 2026-06-13 – nach Block 240

## Zweck dieses Dokuments

Dieses Dokument beschreibt, welche Daten die Anwendung lokal im Browser speichert.

Die Speicherung erfolgt über:

```text
localStorage
```

Die lokalen Browserdaten gehören nicht zur SQLite-Datenbank und werden nicht über die Datenbank-Backups gesichert.

Dieses Dokument dient als Wiederaufnahme- und Chatverlust-Dokument sowie als Grundlage für spätere Aufräum- oder Migrationsarbeiten.

## Grundprinzip

Die App speichert bestimmte Einstellungen und Entwürfe lokal im Browser, damit die Bedienung angenehmer wird.

Typische Beispiele:

- zuletzt geöffnete Hauptseite
- Filtereinstellungen
- Anzeigeoptionen
- Formularentwürfe
- Zwischenspeicherungen für nicht abgeschlossene Eingaben

Wichtig:

- Die Daten liegen nur im jeweiligen Browser.
- Andere Geräte sehen diese Daten nicht.
- Beim Löschen der Browserdaten gehen diese lokalen Einstellungen verloren.
- Die eigentlichen Produkt-, Bestands-, Historien-, Lager-, Etiketten- und Einkaufslistendaten liegen in der SQLite-Datenbank.

## Abgrenzung zur SQLite-Datenbank

### In SQLite gespeichert

In der SQLite-Datenbank liegen die eigentlichen Anwendungsdaten.

Beispiele:

- Produkte
- Bestandseinträge
- Lagerorte
- Lagergeräte
- Lagerfächer
- Historieneinträge
- Etikettenplätze
- Einkaufslisteneinträge

Datenbankpfad:

```text
server/database/food_inventory.db
```

### Im Browser gespeichert

Im Browser liegen nur lokale Bedien- und Komfortdaten.

Beispiele:

- aktive Ansicht
- Filter
- Anzeigeoptionen
- Entwürfe

Diese Daten sind geräte- und browserabhängig.

## Bekannte lokale Datenbereiche

### Aktive Hauptseite

Die zuletzt genutzte Hauptseite kann lokal gespeichert werden.

Zweck:

- App öffnet beim nächsten Start wieder im zuletzt genutzten Bereich
- erleichtert die tägliche Nutzung

Mögliche Bereiche:

- Produkte
- Bestand
- Historie
- Lagerstruktur
- Einkaufsliste
- Etiketten / QR

### Produktfilter

Produktfilter können lokal gespeichert werden.

Typische Filter:

- Suchtext
- Kategorie
- Land
- Geschäft
- Wieder-kaufen-Status
- Sortierung

### Bestandsfilter

Bestandsfilter können lokal gespeichert werden.

Typische Filter:

- Lagerort
- Lagergerät
- Lagerfach
- MHD-Status
- Produktname
- Sortierung

### Historienfilter

Historienfilter können lokal gespeichert werden.

Typische Filter:

- Suchtext
- Entfernungsgrund
- Wieder-kaufen-Bewertung
- Zeitraum
- Sortierung

### Anzeigeoptionen

Bestimmte Anzeigeoptionen können lokal gespeichert werden.

Beispiele:

- erledigte Einträge anzeigen oder ausblenden
- Detailbereiche ein- oder ausklappen
- zuletzt genutzte Ansichten

### Produktentwürfe

Produktentwürfe können lokal gespeichert werden.

Typische Inhalte:

- Produktname
- Marke
- Kategorie
- Land
- Geschäft
- Bewertung
- Notizen

Wichtig:

- Entwürfe sind keine gespeicherten Produkte.
- Erst nach dem Speichern liegen Produktdaten in der SQLite-Datenbank.

### Bestandsentwürfe

Bestandsentwürfe können lokal gespeichert werden.

Typische Inhalte:

- Produktauswahl
- Lagergerät
- Lagerfach
- Menge
- Einheit
- MHD
- Einfrierdatum
- Öffnungsdatum
- Packungszustand

Wichtig:

- Entwürfe sind keine gespeicherten Bestandseinträge.
- Erst nach dem Speichern liegen Bestandseinträge in der SQLite-Datenbank.

## Einkaufsliste und lokale Daten

Die Einkaufslisteneinträge selbst liegen in der SQLite-Datenbank.

Das betrifft:

- freie Einkaufslisteneinträge
- produktbezogene Einkaufslisteneinträge
- Menge
- Einheit
- Kategorie
- Priorität
- Auslandseinkauf-Kennzeichen
- Status offen oder erledigt

Lokal im Browser können dagegen Bedienzustände gespeichert werden.

Beispiele:

- ob erledigte Einträge angezeigt werden
- welcher Filter zuletzt genutzt wurde
- ob ein bestimmter Exporttext angezeigt wurde

Diese lokalen Zustände sind Komfortdaten und nicht die eigentliche Einkaufsliste.

## Risiken und Grenzen

### Browserdaten können gelöscht werden

Wenn Browserdaten gelöscht werden, gehen lokale Einstellungen und Entwürfe verloren.

Die Datenbank bleibt davon unberührt.

### Browserdaten sind geräteabhängig

Lokale Browserdaten gelten nur für den jeweiligen Browser auf dem jeweiligen Gerät.

Beispiele:

- Mac Safari hat eigene lokale Daten
- Mac Chrome hat eigene lokale Daten
- Handy-Browser hat eigene lokale Daten

### Keine Sicherung über Datenbank-Backup

Das Datenbank-Backup sichert nicht den Browser-`localStorage`.

Gesichert wird nur:

```text
server/database/food_inventory.db
```

Produktbilder liegen zusätzlich separat unter:

```text
server/uploads/products/
```

## Wichtige Regel für spätere Entwicklung

Neue `localStorage`-Keys sollen künftig dokumentiert werden.

Empfohlene Dokumentation je Key:

```text
Key-Name
Zweck
Inhalt
Lebensdauer
Kann gefahrlos gelöscht werden: ja/nein
```

## Offene Prüfpunkte

Spätere sinnvolle Arbeiten:

- tatsächliche `localStorage`-Keys im Code systematisch erfassen
- alte oder nicht mehr verwendete Keys identifizieren
- optional prüfen, ob weitere lokale UI-Zustände außerhalb der bisherigen Reset-Gruppen direkt live synchronisiert werden sollen
- lokale Daten von echten Datenbankdaten klarer in der UI abgrenzen
- prüfen, ob Einkaufsliste-Filter dauerhaft lokal gespeichert werden sollen
- prüfen, ob Entwürfe automatisch verfallen oder manuell gelöscht werden sollen

## Wartungsbereich / Zurücksetzen lokaler Browserdaten

Die App besitzt seit Block 233 einen eigenen Wartungsbereich in der Hauptnavigation.

Navigation: Wartung

Im Wartungsbereich können lokale Browserdaten dieser App gezielt zurückgesetzt werden.

Verfügbare Aktionen:

- Filter und Anzeige zurücksetzen
- Formularentwürfe löschen
- lokale Druckmarkierungen löschen
- alle lokalen Browserdaten löschen

Vor jeder Aktion erscheint eine Sicherheitsabfrage. Nach bestätigtem Reset zeigt die App eine Statusmeldung an.

Wichtig:

- Die SQLite-Datenbank bleibt unverändert.
- Gespeicherte Produkte, Bestände, Lagerorte, Historie und Einkaufslisteneinträge bleiben erhalten.
- Nicht gespeicherte Formularentwürfe können gelöscht werden.
- Bestandsfilter, Historienfilter, Anzeigeoptionen, Anzeige erledigter Einkaufslisteneinträge, Formularentwürfe, Etikettenscan und Produktfilter werden nach dem Reset direkt im laufenden UI synchronisiert.
- Einzelne spätere Komponentenzustände außerhalb der bisherigen Reset-Gruppen können bei Bedarf noch ergänzt werden.

