// client/src/components/inventory/InventoryLabelActions.jsx

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

import {
  createInventoryLabelQrPayload,
  createInventoryLabelQrText,
} from "../../utils/labelQrUtils";

export function InventoryLabelActions({ item }) {
  const [showQrCode, setShowQrCode] = useState(false);

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
        onClick={() => setShowQrCode((currentValue) => !currentValue)}
      >
        {showQrCode ? "QR-Code ausblenden" : "QR-Code anzeigen"}
      </button>

      {showQrCode && (
        <div className="inventory-qr-preview">
          <QRCodeSVG value={qrText} size={128} level="M" includeMargin />

          <div className="inventory-qr-details">
            <strong>QR-Code für Etikett {item.label_code}</strong>
            <span>{qrText}</span>
            <small>{qrPayload}</small>
          </div>
        </div>
      )}
    </div>
  );
}
