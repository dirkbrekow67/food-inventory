// client/src/components/dialogs/HistoryDeleteDialog.jsx

export function HistoryDeleteDialog({
  historyDeleteDialogItem,
  deletingHistoryItem,
  onCloseHistoryDeleteDialog,
  onConfirmDeleteHistoryItem,
}) {
  if (!historyDeleteDialogItem) {
    return null;
  }

  return (
    <div className="dialog-backdrop" role="presentation">
      <div
        className="dialog-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-delete-dialog-title"
      >
        <h3 id="history-delete-dialog-title">Historieneintrag löschen</h3>

        <p className="muted">
          {historyDeleteDialogItem.product_name}
          {historyDeleteDialogItem.label_code
            ? ` · Etikett ${historyDeleteDialogItem.label_code}`
            : ""}
        </p>

        <p className="dialog-warning">
          Dieser Historieneintrag wird dauerhaft aus der Produkthistorie
          entfernt. Produkt, Bestand und Etikettenfreigabe bleiben unverändert.
        </p>

        <div className="dialog-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={onCloseHistoryDeleteDialog}
            disabled={deletingHistoryItem}
          >
            Abbrechen
          </button>

          <button
            type="button"
            className="danger-confirm-button"
            onClick={onConfirmDeleteHistoryItem}
            disabled={deletingHistoryItem}
          >
            {deletingHistoryItem ? "Löschen..." : "Historie löschen"}
          </button>
        </div>
      </div>
    </div>
  );
}
