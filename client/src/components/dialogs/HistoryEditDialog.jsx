// client/src/components/dialogs/HistoryEditDialog.jsx

import {
  buyAgainStatusOptions,
  experienceReasonOptions,
  historyEditRemovalReasonOptions,
} from "../../constants/selectOptions";

import { renderSelectOptions } from "../form/FormSelectOptions";

export function HistoryEditDialog({
  historyDialogItem,
  historyEditReason,
  historyEditBuyAgainStatus,
  historyEditExperienceReason,
  historyEditExperienceNote,
  historyEditNotes,
  savingHistoryItem,
  onCloseHistoryDialog,
  onConfirmSaveHistoryItem,
  onHistoryEditReasonChange,
  onHistoryEditBuyAgainStatusChange,
  onHistoryEditExperienceReasonChange,
  onHistoryEditExperienceNoteChange,
  onHistoryEditNotesChange,
}) {
  if (!historyDialogItem) {
    return null;
  }

  return (
    <div className="dialog-backdrop" role="presentation">
      <div
        className="dialog-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-dialog-title"
      >
        <h3 id="history-dialog-title">Historieneintrag bearbeiten</h3>

        <p className="muted">
          {historyDialogItem.product_name}
          {historyDialogItem.label_code
            ? ` · Etikett ${historyDialogItem.label_code}`
            : ""}
        </p>

        <p className="dialog-warning">
          Hier wird nur die Produkthistorie nachbearbeitet. Bestand, Produkt-ID
          und Etikettenfreigabe bleiben unverändert.
        </p>

        <div className="dialog-form">
          <label>
            Grund
            <select
              value={historyEditReason}
              onChange={(event) =>
                onHistoryEditReasonChange(event.target.value)
              }
              disabled={savingHistoryItem}
            >
              {renderSelectOptions(historyEditRemovalReasonOptions)}
            </select>
          </label>

          <label>
            Bewertung danach
            <select
              value={historyEditBuyAgainStatus}
              onChange={(event) =>
                onHistoryEditBuyAgainStatusChange(event.target.value)
              }
              disabled={savingHistoryItem}
            >
              {renderSelectOptions(buyAgainStatusOptions)}
            </select>
          </label>

          <label>
            Erkenntnis
            <select
              value={historyEditExperienceReason}
              onChange={(event) =>
                onHistoryEditExperienceReasonChange(event.target.value)
              }
              disabled={savingHistoryItem}
            >
              {renderSelectOptions(experienceReasonOptions)}
            </select>
          </label>

          <label>
            Notiz zur Produkterfahrung
            <textarea
              value={historyEditExperienceNote}
              onChange={(event) =>
                onHistoryEditExperienceNoteChange(event.target.value)
              }
              disabled={savingHistoryItem}
              placeholder="z. B. lag lange herum, wurde vergessen, schmeckt anders als früher"
              rows="3"
            />
          </label>

          <label>
            Interne Notiz
            <textarea
              value={historyEditNotes}
              onChange={(event) => onHistoryEditNotesChange(event.target.value)}
              disabled={savingHistoryItem}
              placeholder="z. B. ursprüngliche technische Notiz oder Ergänzung"
              rows="3"
            />
          </label>
        </div>

        <div className="dialog-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={onCloseHistoryDialog}
            disabled={savingHistoryItem}
          >
            Abbrechen
          </button>

          <button
            type="button"
            className="primary-confirm-button"
            onClick={onConfirmSaveHistoryItem}
            disabled={savingHistoryItem}
          >
            {savingHistoryItem ? "Speichern..." : "Historie speichern"}
          </button>
        </div>
      </div>
    </div>
  );
}
