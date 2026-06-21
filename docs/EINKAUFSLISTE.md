<!-- docs/EINKAUFSLISTE.md -->

# Einkaufsliste – Planung und aktueller Stand

Stand: 2026-06-20 – Block 330

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
- das Einheitenfeld ist als freies Textfeld umgesetzt
- zusätzlich werden Vorschläge aus den gemeinsamen Einheiten angeboten

Die Einkaufsliste nutzt dafür die vorhandene Liste:

```text
quantityUnitOptions
```

Beispiele:

```text
quantity = 2
unit = Becher
```

```text
quantity = 500
unit = g
```

```text
quantity = 1
unit = Stück
```

Aktuelle Einheit-Vorschläge:

```text
g
kg
ml
l
Stück
Packung
Becher
Dose
Glas
Flasche
Beutel
Bund
Portion
```

Freie Einheiten bleiben weiterhin möglich, z. B. `Karton`, `Schale`, `Tube` oder `Rolle`.

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
Tiefkühlware
Kühlware
Vorrat
Konserve
Trockenware
Getränk
Obst und Gemüse
Gewürz
Backware
Süßware
Haushalt
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
- wird für die Sortierung der offenen Einkaufslisteneinträge genutzt
- Prioritäten werden zentral über `shoppingListPriorityOptions` gepflegt

Werte:

```text
niedrig
normal
hoch
```

Startwert:

```text
normal
```

Sortierlogik:

```text
hoch
normal
niedrig
```

Dadurch erscheinen wichtige Einträge innerhalb der Einkaufsliste vor normalen und niedrig priorisierten Einträgen.

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
- Kategorie-Vorschläge aus den gemeinsamen Produktkategorien nutzen
- Einheit-Vorschläge aus den gemeinsamen Einheiten nutzen
- Priorität-Optionen aus zentralen Auswahlwerten nutzen
- Einkaufsliste nach `Alle`, `Ausland` und `Normal` filtern
- aktuell gefilterte offene Einkaufsliste als Text kopieren
- Exporttext anzeigen und manuell kopieren
- offene Einträge einzeln auswählen
- ausgewählte offene Einträge gemeinsam erledigen
- ausgewählte offene Einträge gemeinsam löschen
- Sammellöschen mit Sicherheitsabfrage absichern
- doppelte Löschabfrage beim Sammellöschen vermeiden
- Auswahlzähler mit korrektem Singular und Plural anzeigen
- Sammelaktionsleiste mit Hinweis auf sichtbare offene Einträge anzeigen
- Auswahl bei Filterwechsel zurücksetzen

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

## Gemeinsame Kategorien

Für Produktkategorien und Einkaufslisten-Kategorien wird dieselbe Grundlage genutzt.

Die Einkaufsliste verwendet dafür:

```text
shoppingListCategorySuggestionOptions
```

Diese Liste wird aus den Produktkategorien abgeleitet:

```text
productCategoryOptions
```

Der Platzhalter `Kategorie auswählen` wird für die Einkaufsliste herausgefiltert. Dadurch stehen nur echte Kategorien als Vorschlag zur Verfügung.

Vorteil:

- keine doppelte Pflege fast gleicher Kategorien
- weniger Abweichungen zwischen Produkt- und Einkaufskategorien
- bessere Grundlage für spätere Übernahme von Einkaufslisteneinträgen in Produkte
- bessere Grundlage für spätere automatische Einkaufsvorschläge aus Produkten

Die Kategorie bleibt trotzdem ein freies Textfeld. Neue oder abweichende Kategorien können weiterhin manuell eingetragen werden.

## Gemeinsame Einheiten

Für Mengenangaben in Produkten, Beständen und Einkaufslisteneinträgen wird dieselbe Grundlage genutzt.

Die Einkaufsliste verwendet dafür:

```text
quantityUnitOptions
```

Die Einheiten werden als Vorschläge im Feld `unit` angezeigt. Das Feld bleibt trotzdem frei beschreibbar.

Vorteil:

- keine doppelte Pflege ähnlicher Einheiten
- einheitlichere Schreibweise bei Produkten, Beständen und Einkaufsliste
- bessere Grundlage für spätere Übernahme von Einkaufslisteneinträgen in Produkte
- bessere Grundlage für spätere Auswertungen und automatische Vorschläge

Typische Beispiele:

```text
g
kg
ml
l
Stück
Packung
Becher
Dose
Glas
Flasche
Beutel
Bund
Portion
```

## Gemeinsame Prioritäten

Die Prioritäten der Einkaufsliste werden zentral in der Auswahlwert-Datei gepflegt.

Die Einkaufsliste verwendet dafür:

```text
shoppingListPriorityOptions
```

Aktuelle Werte:

```text
niedrig
normal
hoch
```

Die Priorität wird in neuen und zu bearbeitenden Einkaufslisteneinträgen über dieselbe Optionsliste angezeigt.

Vorteil:

- keine doppelte Pflege der Prioritätswerte im Formular
- einheitliche Auswahlwerte für neue und bestehende Einträge
- bessere Wartbarkeit bei späteren Änderungen
- klare Grundlage für Sortierung und Anzeige

Die Sortierung der offenen Einträge erfolgt weiterhin nach fachlicher Gewichtung:

```text
hoch vor normal vor niedrig
```

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

### Block 217 – Kategorie-Vorschläge für Einkaufsliste ergänzen

Abgeschlossen. Die Einkaufsliste nutzt Kategorie-Vorschläge aus den gemeinsamen Produktkategorien. Dafür wird `shoppingListCategorySuggestionOptions` aus `productCategoryOptions` abgeleitet.

### Block 218 – Dokumentation Kategorie-Vorschläge aktualisieren

Abgeschlossen. Die Dokumentation wurde um gemeinsame Kategorien, Kategorie-Vorschläge und die Abgrenzung zum Auslandseinkauf ergänzt.

### Block 219 – Einheit-Vorschläge für Einkaufsliste ergänzen

Abgeschlossen. Die Einkaufsliste nutzt Einheit-Vorschläge aus den gemeinsamen Einheiten. Dafür wird `quantityUnitOptions` in den Feldern für neue und zu bearbeitende Einkaufslisteneinträge verwendet.

### Block 220 – Dokumentation Einheit-Vorschläge aktualisieren

Abgeschlossen. Die Dokumentation wurde um gemeinsame Einheiten und Einheit-Vorschläge für die Einkaufsliste ergänzt.

### Block 221 – Priorität-Optionen der Einkaufsliste auslagern

Abgeschlossen. Die Priorität-Optionen der Einkaufsliste wurden aus der Komponente ausgelagert und werden zentral über `shoppingListPriorityOptions` in `selectOptions.js` gepflegt.

### Block 222 – Dokumentation Priorität-Optionen aktualisieren

Abgeschlossen. Die Dokumentation wurde um die zentrale Pflege der Priorität-Optionen und die Sortierlogik ergänzt.

### Block 311 – Sammelaktionen für Einkaufsliste fachlich planen

Abgeschlossen. Die fachlichen Grundregeln für spätere Sammelaktionen wurden dokumentiert. Zunächst sollen offene Einkaufslisteneinträge auswählbar werden. Als erste risikoarme Sammelaktion ist `Ausgewählte erledigen` vorgesehen. Das Löschen mehrerer Einträge soll nur mit zusätzlicher Sicherheitsabfrage umgesetzt werden.

### Block 312 – Auswahlzustand für Einkaufslisteneinträge vorbereiten

Abgeschlossen. Der State `selectedShoppingListItemIds` wurde vorbereitet. Zusätzlich wurden abgeleitete Werte für ausgewählte offene Einträge und eine erste Auswahlleiste mit `Auswahl aufheben` ergänzt.

### Block 313 – Checkboxen für offene Einkaufslisteneinträge einbauen

Abgeschlossen. Offene Einkaufslisteneinträge können über Checkboxen ausgewählt werden. Erledigte Einträge bleiben ohne Auswahlmöglichkeit.

### Block 314 – Auswahl bei Filterwechsel und Listenänderungen bereinigen

Abgeschlossen. Beim Wechsel zwischen `Alle`, `Ausland` und `Normal` wird die Auswahl zurückgesetzt. Zusätzlich werden nur aktuell sichtbare offene Einträge für Auswahlstatus und Auswahlzähler berücksichtigt.

### Block 315 – Sammelaktionsleiste vorbereiten

Abgeschlossen. Die Auswahlleiste wurde zur Sammelaktionsleiste erweitert. Sie zeigt die Anzahl ausgewählter Einträge und bereitet die Aktion `Ausgewählte erledigen` vor.

### Block 316 – Sammelaktion „Ausgewählte erledigen“ vorbereiten

Abgeschlossen. Die technische Funktion `completeSelectedShoppingListItems` wurde ergänzt und mit dem Button verbunden. Der Button blieb in diesem Block noch deaktiviert.

### Block 317 – Sammelaktion „Ausgewählte erledigen“ produktiv aktivieren

Abgeschlossen. Ausgewählte offene Einkaufslisteneinträge können gemeinsam erledigt werden. Die Einträge werden nacheinander über die vorhandene Einzelaktion verarbeitet und die Auswahl wird danach zurückgesetzt.

### Block 318 – Sammelaktionsmeldung verbessern

Abgeschlossen. Nach der Sammelaktion wird eine zusammenfassende Erfolgsmeldung angezeigt. Sammelaktionsmeldungen bleiben länger sichtbar als reine Kopiermeldungen.

### Block 319 – lokale Einkaufslistenmeldung neutral benennen

Abgeschlossen. Die lokale Meldungslogik wurde von `shoppingListCopyMessage` auf `shoppingListLocalMessage` umbenannt, weil dieselbe Meldungszeile inzwischen für Kopiermeldungen und Sammelaktionsmeldungen genutzt wird.

### Block 321 – Sammellöschen fachlich planen

Abgeschlossen. Die fachlichen Regeln für `Ausgewählte löschen` wurden ergänzt. Sammellöschen soll zunächst nur für offene ausgewählte Einträge gelten, immer eine Sicherheitsabfrage mit Anzahl der betroffenen Einträge nutzen und bei Abbruch keine Änderung ausführen.

### Block 322 – Sammellöschen-Schaltfläche vorbereiten

Abgeschlossen. Die Schaltfläche `Ausgewählte löschen` wurde in der Sammelaktionsleiste ergänzt und zunächst deaktiviert vorbereitet.

### Block 323 – Sicherheitsabfrage für Sammellöschen vorbereiten

Abgeschlossen. Die Bestätigungsabfrage für `Ausgewählte löschen` wurde vorbereitet. Die Abfrage nennt die Anzahl der ausgewählten offenen Einträge.

### Block 324 – Sammellöschen technisch vorbereiten

Abgeschlossen. Die technische Funktion zum Löschen ausgewählter offener Einkaufslisteneinträge wurde ergänzt und mit der Sammelaktionsschaltfläche verbunden.

### Block 325 – doppelte Löschabfrage beim Sammellöschen vermeiden

Abgeschlossen. Beim Sammellöschen wird nur noch die Sammelabfrage angezeigt. Das Einzellöschen behält weiterhin seine eigene Sicherheitsabfrage.

### Block 326 – Auswahlzähler sprachlich korrigieren

Abgeschlossen. Der Auswahlzähler zeigt Singular und Plural korrekt an, z. B. `1 Einkaufslisteneintrag ausgewählt` und `2 Einkaufslisteneinträge ausgewählt`.

### Block 329 – Sammelaktionsleiste optisch und sprachlich glätten

Abgeschlossen. Die Sammelaktionsleiste wurde sprachlich gekürzt und um den Hinweis `Gilt nur für aktuell sichtbare offene Einträge.` ergänzt. Die Gefahraktion `Auswahl löschen` wurde leicht stärker hervorgehoben.

### Block 330 – nächste Arbeitsblöcke planen

Abgeschlossen. Die nächsten Blöcke 331 bis 338 wurden in `docs/PROJEKTSTAND.md` geplant.

## Planung Sammelaktionen ab Block 311

Die Einkaufsliste soll künftig Sammelaktionen unterstützen. Ziel ist, mehrere Einkaufslisteneinträge gemeinsam zu bearbeiten, ohne jeden Eintrag einzeln anklicken zu müssen.

### Grundregeln

Sammelaktionen sollen zunächst nur für offene Einkaufslisteneinträge umgesetzt werden.

Erledigte Einträge bleiben vorerst von der Mehrfachauswahl ausgenommen. Dadurch bleibt die Bedienung einfacher und das Risiko versehentlicher Änderungen an bereits erledigten Einträgen geringer.

Die Mehrfachauswahl soll sich immer auf den aktuell sichtbaren Filter beziehen:

- Alle
- Ausland
- Normal

Wenn der Filter gewechselt wird, soll die aktuelle Auswahl zurückgesetzt werden. Dadurch wird vermieden, dass nicht mehr sichtbare Einträge unbeabsichtigt mitbearbeitet werden.

### Auswahl von Einträgen

Offene Einkaufslisteneinträge haben eine Auswahlmöglichkeit.

Umgesetzt ist:

- Checkbox pro offenem Eintrag
- Anzeige der Anzahl ausgewählter Einträge
- Hinweis, dass Sammelaktionen nur für aktuell sichtbare offene Einträge gelten
- Möglichkeit, die Auswahl wieder aufzuheben
- Deaktivierung von Sammelaktionen, wenn keine Einträge ausgewählt sind

Die Auswahl liegt rein im Frontend-State und wird nicht in der Datenbank gespeichert.

### Erste Sammelaktion: mehrere Einträge erledigen

Die produktive Sammelaktion `Ausgewählte erledigen` ist umgesetzt.

Diese Aktion ist fachlich risikoarm, weil erledigte Einträge wieder geöffnet werden können.

Aktueller Ablauf:

1. Nutzer wählt mehrere offene Einträge aus.
2. Die Sammelaktionsleiste zeigt die Anzahl der ausgewählten Einträge.
3. Nutzer klickt `Ausgewählte erledigen`.
4. Die ausgewählten Einträge werden nacheinander über die vorhandene Einzelaktion erledigt.
5. Nach Abschluss wird die Auswahl zurückgesetzt.
6. Eine zusammenfassende Erfolgsmeldung informiert über die erledigten Einträge.

### Zweite Sammelaktion: mehrere Einträge löschen

Die produktive Sammelaktion `Ausgewählte löschen` ist umgesetzt.

Das Löschen mehrerer Einträge ist risikoreicher, weil gelöschte Einträge nicht ohne Weiteres wiederhergestellt werden können.

Daher wird die Sammelaktion `Ausgewählte löschen` nur mit zusätzlicher Absicherung genutzt.

Fachliche Regeln:

- Sammellöschen gilt zunächst nur für offene Einkaufslisteneinträge.
- Erledigte Einträge bleiben weiter ohne Auswahlmöglichkeit.
- Die Aktion bezieht sich nur auf die aktuell ausgewählten offenen Einträge.
- Nicht sichtbare oder durch Filterwechsel ausgeblendete Einträge dürfen nicht unbeabsichtigt mitgelöscht werden.
- Beim Wechsel zwischen `Alle`, `Ausland` und `Normal` wird die Auswahl zurückgesetzt.
- Die Schaltfläche `Ausgewählte löschen` ist nur nutzbar, wenn mindestens ein offener Eintrag ausgewählt ist.
- Vor dem Löschen ist immer eine Sicherheitsabfrage erforderlich.
- Die Sicherheitsabfrage nennt die Anzahl der betroffenen Einträge.
- Wird die Sicherheitsabfrage abgebrochen, wird kein Eintrag gelöscht.
- Beim Sammellöschen erscheint nur die Sammelabfrage.
- Die zusätzliche Einzelabfrage wird beim Sammellöschen übersprungen.
- Beim Einzellöschen bleibt die eigene Sicherheitsabfrage erhalten.
- Nach erfolgreichem Löschen wird die Auswahl zurückgesetzt.
- Nach erfolgreichem Löschen wird eine zusammenfassende Meldung angezeigt.

Geplante Schutzmaßnahmen:

- eigene Schaltfläche `Ausgewählte löschen`
- optisch als Lösch- oder Gefahraktion erkennbar
- Sicherheitsabfrage vor dem Löschen
- Hinweis auf die Anzahl der betroffenen Einträge
- Löschen nur nach ausdrücklicher Bestätigung
- Abbruch ohne Änderung möglich
- Erfolgsmeldung nach Abschluss

Beispiele für Sicherheitsabfragen:

```text
1 ausgewählten Einkaufslisteneintrag wirklich löschen?
3 ausgewählte Einkaufslisteneinträge wirklich löschen?
```

Geplanter Ablauf:

1. Nutzer wählt einen oder mehrere offene Einträge aus.
2. Die Sammelaktionsleiste zeigt die Anzahl der ausgewählten Einträge.
3. Nutzer klickt `Ausgewählte löschen`.
4. Eine Sicherheitsabfrage mit Anzahl der betroffenen Einträge erscheint.
5. Bei Abbruch bleibt die Einkaufsliste unverändert.
6. Bei Bestätigung werden die ausgewählten offenen Einträge nacheinander gelöscht.
7. Die Einzel-Löschabfrage wird dabei übersprungen, damit keine doppelte Abfrage erscheint.
8. Nach Abschluss wird die Auswahl zurückgesetzt.
9. Eine zusammenfassende Erfolgsmeldung informiert über die gelöschten Einträge.

### Verhalten bei laufenden Aktionen

Während eine Sammelaktion läuft, sollen relevante Einzel- und Sammelaktionsbuttons deaktiviert werden.

Dadurch sollen doppelte Klicks, parallele Aktionen und unklare Zwischenzustände vermieden werden.

### Technische Richtung

Die Mehrfachauswahl soll in `ShoppingListSection.jsx` vorbereitet werden.

Voraussichtliche technische Bausteine:

- `selectedShoppingListItemIds`
- `toggleShoppingListItemSelection`
- `clearShoppingListItemSelection`
- `hasSelectedShoppingListItems`
- `selectedShoppingListItemsCount`

Die bestehenden Einzelaktionen sollen zunächst weiterverwendet werden. Dadurch müssen keine neuen API-Endpunkte eingeführt werden.

Für spätere Optimierung kann geprüft werden, ob eigene Sammel-API-Routen sinnvoll sind.


## Spätere Erweiterungen

Mögliche spätere Funktionen:

- Exporttext weiter anpassen oder formatieren
- Teilen über Messenger, soweit vom Browser unterstützt
- Offline-Kopie im Browser
- automatische Vorschläge aus Produkten mit Bewertung `wieder_kaufen`
- Einkauf aus Historie oder Verbrauch ableiten
- Gruppierung nach Geschäft
- gemeinsame Produkt- und Einkaufskategorien verwalten
- gemeinsame Einheiten verwalten und erweitern
- Prioritäten bei Bedarf erweitern oder umbenennen
- Mengen aus Beständen oder Verbrauch ableiten
- Sammelaktion `Ausgewählte löschen` weiter beobachten und bei Bedarf optisch stärker absichern
- Sammelaktionslogik bei Bedarf später in eigene API-Route auslagern

## Nicht Bestandteil des aktuellen Stands

Noch nicht umgesetzt sind:

- Offline-Funktion
- Benutzerkonto
- externe Nutzung außerhalb des WLANs
- automatische Bedarfsermittlung
- automatische Vorschlagsliste aus Verbrauch oder Historie
- direkte Messenger-Teilen-Funktion

## Stabilisierung der Einkaufsliste nach Block 301 bis 308

Die Einkaufsliste wurde in den Blöcken 301 bis 308 weiter stabilisiert und für spätere Sammelaktionen vorbereitet.

### Validierung und Fehlermeldungen

Die Validierung von Einkaufslisten-Payloads erfolgt zentral über `getShoppingListPayloadValidationMessage` in `client/src/utils/shoppingListUtils.js`.

Ein Einkaufslisteneintrag muss weiterhin entweder einen Produktbezug oder einen freien Artikelnamen enthalten. Fehlt beides, wird im Frontend eine verständliche Meldung angezeigt.

Fehlermeldungen aus API-Antworten werden bei Einkaufslistenaktionen bevorzugt angezeigt. Wenn keine konkrete API-Meldung vorhanden ist, wird eine fachliche Standardmeldung genutzt.

### Erfolgsmeldungen und Rückmeldung im UI

Erfolgreiche Aktionen in der Einkaufsliste werden sichtbar bestätigt, z. B.:

- Einkaufslisteneintrag wurde angelegt
- Produkt wurde zur Einkaufsliste hinzugefügt
- Einkaufslisteneintrag wurde aktualisiert
- Einkaufslisteneintrag wurde erledigt
- Einkaufslisteneintrag wurde wieder geöffnet
- Einkaufslisteneintrag wurde gelöscht

Die Meldungsanzeige der Einkaufsliste ist vereinheitlicht. Aktionsmeldungen und Kopiermeldungen nutzen dieselbe sichtbare Meldungszeile.

Die Meldungs-Timeouts sind abgesichert. Wenn mehrere Aktionen kurz hintereinander ausgeführt werden, löscht ein alter Timeout keine neuere Meldung zu früh.

### Bedienlogik und Aktionssperren

Während laufender Speicher- oder Änderungsaktionen werden relevante Einkaufslistenbuttons deaktiviert. Dadurch werden versehentliche Mehrfachaktionen reduziert.

Dies betrifft insbesondere:

- Bearbeiten / Speichern
- Erledigt
- Wieder öffnen
- Löschen

### Vorbereitung späterer Sammelaktionen

Für die Toolbar der Einkaufsliste werden abgeleitete Zustände genutzt:

```text
hasOpenShoppingListItems
hasCompletedShoppingListItems
```

Damit können Toolbar-Aktionen fachlich korrekt aktiviert oder deaktiviert werden.

Aktuell gilt:

- `Liste kopieren` ist deaktiviert, wenn keine offenen Einträge vorhanden sind
- `Text anzeigen` ist deaktiviert, wenn keine offenen Einträge vorhanden sind
- `Erledigte anzeigen` ist deaktiviert, wenn keine erledigten Einträge vorhanden sind

Diese Struktur ist die Grundlage für spätere Sammelaktionen, z. B. mehrere Einträge gemeinsam erledigen, löschen oder exportieren.
