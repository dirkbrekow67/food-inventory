// client/src/components/dialogs/RemovalDialog.jsx

import {
  experienceReasonOptions,
  removalProductStatusOptions,
  removalReasonOptions,
} from "../../constants/selectOptions";

import { renderSelectOptions } from "../form/FormSelectOptions";

export function RemovalDialog({
  removalDialogItem,
  removalReason,
  removalProductStatus,
  saveRemovalToHistory,
  experienceReason,
  experienceNote,
  removingInventoryItem,
  onCloseRemovalDialog,
  onConfirmRemoveInventoryItem,
  onRemovalReasonChange,
  onRemovalProductStatusChange,
  onSaveRemovalToHistoryChange,
  onExperienceReasonChange,
  onExperienceNoteChange,
}) {
  if (!removalDialogItem) {
    return null;
  }

  return (
    <div className="dialog-backdrop" role="presentation">
      <div
        className="dialog-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="removal-dialog-title"
      >
        <h3 id="removal-dialog-title">Bestand entfernen</h3>

        <p className="muted">
          {removalDialogItem.product_name}
          {removalDialogItem.label_code
            ? ` · Etikett ${removalDialogItem.label_code}`
            : ""}
        </p>

        {removalDialogItem.product_favorite === 1 && (
          <p className="muted">★ Standardartikel</p>
        )}

        <p className="dialog-warning">
          Der Bestandseintrag wird entfernt. Eine vorhandene Etiketten-ID wird
          wieder freigegeben und kann später erneut verwendet werden.
        </p>

        <div className="dialog-form">
          <label>
            Grund
            <select
              value={removalReason}
              onChange={(event) => onRemovalReasonChange(event.target.value)}
              disabled={removingInventoryItem}
            >
              {renderSelectOptions(removalReasonOptions)}
            </select>
          </label>

          <label>
            Produktbewertung
            <select
              value={removalProductStatus}
              onChange={(event) =>
                onRemovalProductStatusChange(event.target.value)
              }
              disabled={
                removingInventoryItem || removalReason === "falsch_erfasst"
              }
            >
              {renderSelectOptions(removalProductStatusOptions)}
            </select>
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={saveRemovalToHistory}
              onChange={(event) =>
                onSaveRemovalToHistoryChange(event.target.checked)
              }
              disabled={
                removingInventoryItem || removalReason === "falsch_erfasst"
              }
            />
            In Produkthistorie speichern
          </label>

          {saveRemovalToHistory && (
            <>
              <label>
                Erkenntnis
                <select
                  value={experienceReason}
                  onChange={(event) =>
                    onExperienceReasonChange(event.target.value)
                  }
                  disabled={removingInventoryItem}
                >
                  {renderSelectOptions(experienceReasonOptions)}
                </select>
              </label>

              <label>
                Notiz zur Produkterfahrung
                <textarea
                  value={experienceNote}
                  onChange={(event) =>
                    onExperienceNoteChange(event.target.value)
                  }
                  disabled={removingInventoryItem}
                  placeholder="z. B. lag lange herum, wurde vergessen, schmeckt anders als früher"
                  rows="3"
                />
              </label>
            </>
          )}
        </div>

        <div className="dialog-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={onCloseRemovalDialog}
            disabled={removingInventoryItem}
          >
            Abbrechen
          </button>

          <button
            type="button"
            className="danger-confirm-button"
            onClick={onConfirmRemoveInventoryItem}
            disabled={removingInventoryItem}
          >
            {removingInventoryItem ? "Entfernen..." : "Bestand entfernen"}
          </button>
        </div>
      </div>
    </div>
  );
}
