// client/src/components/inventory/InventoryLabelActions.jsx

export function InventoryLabelActions({ item }) {
  if (!item.label_code) {
    return (
      <div className="inventory-label-actions">
        <span className="muted">Noch keine Etiketten-ID vergeben.</span>
      </div>
    );
  }

  return (
    <div className="inventory-label-actions">
      <span className="label-code">Etikett {item.label_code}</span>

      <button
        type="button"
        className="secondary-button"
        onClick={() => {
          window.alert(
            `QR-Code-Erstellung für Etikett ${item.label_code} folgt in Block 70/71.`,
          );
        }}
      >
        QR-Code anzeigen
      </button>
    </div>
  );
}
