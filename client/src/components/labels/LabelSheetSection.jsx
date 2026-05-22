// client/src/components/labels/LabelSheetSection.jsx

import { useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

import { createInventoryLabelQrTextFromCode } from "../../utils/labelQrUtils";

const LABELS_PER_SHEET = 36;

function createLabelCode(number) {
  return `F${String(number).padStart(3, "0")}`;
}

function createLabelSheetCodes(startNumber) {
  return Array.from({ length: LABELS_PER_SHEET }, (_, index) =>
    createLabelCode(startNumber + index),
  );
}

export function LabelSheetSection() {
  const [startNumber, setStartNumber] = useState(1);

  const labelCodes = useMemo(
    () => createLabelSheetCodes(Number(startNumber) || 1),
    [startNumber],
  );

  function printLabelSheet() {
    window.print();
  }

  return (
    <section className="card label-sheet-section">
      <div className="section-header">
        <div>
          <h2>Etikettenbogen</h2>
          <p>
            Druckbogen für Printation Papieretiketten 45 mm × 30 mm,
            Art. 1548812-GP, 4 Spalten × 9 Zeilen.
          </p>
        </div>
      </div>

      <div className="label-sheet-toolbar">
        <label>
          Startnummer
          <input
            type="number"
            min="1"
            value={startNumber}
            onChange={(event) => setStartNumber(event.target.value)}
          />
        </label>

        <div className="label-sheet-toolbar-info">
          <strong>
            {labelCodes[0]}–{labelCodes[labelCodes.length - 1]}
          </strong>
          <span>36 Etiketten</span>
        </div>

        <button type="button" className="secondary-button" onClick={printLabelSheet}>
          Etikettenbogen drucken
        </button>
      </div>

      <div className="label-sheet-print-area">
        <div className="label-sheet">
          {labelCodes.map((labelCode) => {
            const qrText = createInventoryLabelQrTextFromCode(labelCode);

            return (
              <div className="label-sheet-item" key={labelCode}>
                <div className="label-sheet-qr">
                  <QRCodeSVG value={qrText} size={62} level="M" includeMargin />
                </div>

                <div className="label-sheet-text">
                  <strong>{labelCode}</strong>
                  <span>Food Inventory</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
