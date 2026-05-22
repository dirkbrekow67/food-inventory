// client/src/components/inventory/InventoryLabelActions.jsx

import {
  createInventoryLabelQrPayload,
  createInventoryLabelQrText,
} from "../../utils/labelQrUtils";

export function InventoryLabelActions({ item }) {
  if (!item.label_code) {
    return (
      <div className="inventory-label-actions">
        <span className="muted">Noch keine Etiketten-ID vergeben.</span>
      </div>
    );
  }

  const qrPayload = createInventoryLabelQrPayload(item);
  const qrText = createInventoryLabelQrText(item);

  return (
    <div className="inventory-label-actions">
      <span className="label-code">Etikett {item.label_code}</span>

      <button
        type="button"
        className="secondary-button"
        onClick={() => {
          window.alert(`QR-Inhalt:\n${qrText}\n\nDaten:\n${qrPayload}`);
        }}
      >
        QR-Code anzeigen
      </button>
    </div>
  );
}
