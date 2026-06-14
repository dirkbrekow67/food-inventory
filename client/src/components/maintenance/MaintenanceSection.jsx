// client/src/components/maintenance/MaintenanceSection.jsx

import { useState } from "react";

import {
  clearAllFoodInventoryLocalStorage,
  clearFilterAndViewStorage,
  clearFormDraftStorage,
  clearPrintedLabelStorage,
} from "../../utils/localStorageResetUtils";

function createResetMessage(removedKeys) {
  if (removedKeys.length === 0) {
    return "Es wurden keine lokalen Browserdaten gelöscht.";
  }

  return `${removedKeys.length} lokale Speicherwerte wurden gelöscht. Gespeicherte Daten in der SQLite-Datenbank bleiben unverändert.`;
}

export function MaintenanceSection({
  onResetFilterAndViewState,
  onResetFormDraftState,
  onResetAllLocalState,
}) {
  const [resetMessage, setResetMessage] = useState("");

  function confirmAndReset(confirmMessage, resetFunction, afterReset) {
    const confirmed = window.confirm(confirmMessage);

    if (!confirmed) {
      return;
    }

    const removedKeys = resetFunction();

    if (afterReset) {
      afterReset();
    }

    setResetMessage(createResetMessage(removedKeys));
  }

  function resetFilterAndViewStorage() {
    confirmAndReset(
      "Filter und Anzeigeoptionen werden zurückgesetzt. Gespeicherte Daten bleiben erhalten.",
      clearFilterAndViewStorage,
      onResetFilterAndViewState,
    );
  }

  function resetFormDraftStorage() {
    confirmAndReset(
      "Nicht gespeicherte Produkt- und Bestandsentwürfe werden gelöscht. Gespeicherte Daten bleiben erhalten.",
      clearFormDraftStorage,
      onResetFormDraftState,
    );
  }

  function resetPrintedLabelStorage() {
    confirmAndReset(
      "Lokale Etiketten-Druckmarkierungen werden gelöscht. Die Etikettenplätze in der Datenbank bleiben unverändert.",
      clearPrintedLabelStorage,
    );
  }

  function resetAllLocalStorage() {
    confirmAndReset(
      "Alle lokalen Browserdaten dieser App werden gelöscht. Die SQLite-Datenbank bleibt erhalten. Nicht gespeicherte Entwürfe gehen verloren.",
      clearAllFoodInventoryLocalStorage,
      onResetAllLocalState,
    );
  }

  return (
    <section className="card">
      <div className="section-header">
        <div>
          <p className="eyebrow">Wartung</p>
          <h2>Lokale Browserdaten zurücksetzen</h2>
          <p>
            Hier können lokale Komfortdaten dieser App im Browser gelöscht
            werden. Die SQLite-Datenbank wird dadurch nicht verändert.
          </p>
        </div>
      </div>

      {resetMessage && <p className="success">{resetMessage}</p>}

      <div className="form-grid maintenance-reset-grid">
        <div className="maintenance-reset-card">
          <h3>Filter und Anzeige</h3>
          <p>
            Setzt Produktfilter, Bestandsfilter, Historienfilter,
            Anzeigeoptionen und den zuletzt geöffneten Hauptbereich zurück.
          </p>
          <button
            type="button"
            className="secondary-button"
            onClick={resetFilterAndViewStorage}
          >
            Filter und Anzeige zurücksetzen
          </button>
        </div>

        <div className="maintenance-reset-card">
          <h3>Formularentwürfe</h3>
          <p>
            Löscht lokale, noch nicht gespeicherte Entwürfe für Produkte und
            Bestandseinträge.
          </p>
          <button
            type="button"
            className="secondary-button"
            onClick={resetFormDraftStorage}
          >
            Formularentwürfe löschen
          </button>
        </div>

        <div className="maintenance-reset-card">
          <h3>Etiketten-Druckmarkierungen</h3>
          <p>
            Löscht lokal gemerkte Druckmarkierungen. Die Etikettenplätze in der
            Datenbank bleiben erhalten.
          </p>
          <button
            type="button"
            className="secondary-button"
            onClick={resetPrintedLabelStorage}
          >
            lokale Druckmarkierungen löschen
          </button>
        </div>

        <div className="maintenance-reset-card">
          <h3>Alle lokalen Browserdaten</h3>
          <p>
            Löscht alle bekannten lokalen Browserdaten dieser App. Gespeicherte
            Daten in der SQLite-Datenbank bleiben erhalten.
          </p>
          <button
            type="button"
            className="danger-button"
            onClick={resetAllLocalStorage}
          >
            alle lokalen Browserdaten löschen
          </button>
        </div>
      </div>
    </section>
  );
}
