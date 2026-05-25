// client/src/components/inventory/InventoryLabelActions.jsx

import { useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

import {
  createInventoryLabelQrPayload,
  createInventoryLabelQrText,
} from "../../utils/labelQrUtils";

import { openInventoryLabelPrintWindow } from "../../utils/labelPrintUtils";

export function InventoryLabelActions({ item, onUpdateLabelPrintStatus }) {
  const [showQrCode, setShowQrCode] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");
  const qrContainerRef = useRef(null);

  if (!item.label_code) {
    return (
      <div className="inventory-label-actions">
        <span className="muted">Noch keine Etiketten-ID vergeben.</span>
      </div>
    );
  }

  const qrPayload = createInventoryLabelQrPayload(item);
  const qrText = createInventoryLabelQrText(item);
  const needsReprint = item.label_print_status === "reprint_needed";

  function printLabel() {
    const qrSvgMarkup = qrContainerRef.current?.innerHTML || "";

    openInventoryLabelPrintWindow({
      item,
      qrSvgMarkup,
      qrText,
    });
  }

  async function copyQrLink() {
    try {
      await navigator.clipboard.writeText(qrText);
      setCopyMessage("QR-Link kopiert.");
    } catch (error) {
      console.error(error);
      setCopyMessage("QR-Link konnte nicht kopiert werden.");
    }

    window.setTimeout(() => {
      setCopyMessage("");
    }, 2500);
  }

  return (
    <div className="inventory-label-actions">
      <span className="label-code">Etikett {item.label_code}</span>

      {needsReprint && (
        <span className="label-code warning-label">Nachdruck erforderlich</span>
      )}

      <button
        type="button"
        className="secondary-button"
        onClick={() => setShowQrCode((currentValue) => !currentValue)}
      >
        {showQrCode ? "QR-Code ausblenden" : "QR-Code anzeigen"}
      </button>

      <button type="button" className="secondary-button" onClick={printLabel}>
        Etikett drucken
      </button>

      {!needsReprint && (
        <button
          type="button"
          className="secondary-button"
          onClick={() => onUpdateLabelPrintStatus(item, "reprint_needed")}
        >
          Etikett unlesbar
        </button>
      )}

      {needsReprint && (
        <button
          type="button"
          className="secondary-button"
          onClick={() => onUpdateLabelPrintStatus(item, "printed")}
        >
          Druck ist in Ordnung
        </button>
      )}

      <button type="button" className="secondary-button" onClick={copyQrLink}>
        QR-Link kopieren
      </button>

      {copyMessage && (
        <span className="inventory-label-copy-message">{copyMessage}</span>
      )}

      {showQrCode && (
        <div className="inventory-qr-preview">
          <div ref={qrContainerRef}>
            <QRCodeSVG value={qrText} size={128} level="M" includeMargin />
          </div>

          <div className="inventory-qr-details">
            <strong>QR-Code für Etikett {item.label_code}</strong>
            <span>{qrText}</span>
            <small>{qrPayload}</small>
          </div>
        </div>
      )}

      {!showQrCode && (
        <span ref={qrContainerRef} hidden>
          <QRCodeSVG value={qrText} size={128} level="M" includeMargin />
        </span>
      )}
    </div>
  );
}
