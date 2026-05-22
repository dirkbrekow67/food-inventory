// client/src/utils/labelPrintUtils.js

export function openInventoryLabelPrintWindow({ item, qrSvgMarkup, qrText }) {
  if (!item?.label_code || !qrSvgMarkup) {
    return;
  }

  const printWindow = window.open("", "_blank", "width=420,height=520");

  if (!printWindow) {
    window.alert("Druckfenster konnte nicht geöffnet werden. Popup-Blocker prüfen.");
    return;
  }

  const productName = item.product_name || "Unbekanntes Produkt";
  const storageName = [item.storage_unit_name, item.storage_compartment_name]
    .filter(Boolean)
    .join(" · ");

  printWindow.document.write(`
    <!doctype html>
    <html lang="de">
      <head>
        <meta charset="utf-8" />
        <title>Etikett ${item.label_code}</title>
        <style>
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            padding: 24px;
            font-family: Arial, sans-serif;
            color: #111827;
            background: #ffffff;
          }

          .label {
            width: 320px;
            min-height: 220px;
            border: 2px solid #111827;
            border-radius: 12px;
            padding: 16px;
          }

          .label-header {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            align-items: flex-start;
            margin-bottom: 12px;
          }

          .label-code {
            font-size: 20px;
            font-weight: 800;
          }

          .product-name {
            margin: 0 0 6px;
            font-size: 18px;
            font-weight: 800;
          }

          .meta {
            margin: 0 0 12px;
            font-size: 13px;
            color: #374151;
          }

          .qr {
            display: flex;
            justify-content: center;
            margin: 12px 0;
          }

          .qr svg {
            width: 128px;
            height: 128px;
          }

          .qr-text {
            margin-top: 10px;
            font-size: 10px;
            color: #4b5563;
            overflow-wrap: anywhere;
          }

          .print-actions {
            margin-top: 18px;
          }

          button {
            border: none;
            border-radius: 10px;
            padding: 10px 14px;
            background: #2563eb;
            color: #ffffff;
            font-weight: 700;
            cursor: pointer;
          }

          @media print {
            body {
              padding: 0;
            }

            .print-actions {
              display: none;
            }

            .label {
              border-color: #000000;
            }
          }
        </style>
      </head>
      <body>
        <div class="label">
          <div class="label-header">
            <div>
              <p class="product-name">${escapeHtml(productName)}</p>
              <p class="meta">${escapeHtml(storageName || "Kein Lagerort")}</p>
            </div>
            <div class="label-code">${escapeHtml(item.label_code)}</div>
          </div>

          <div class="qr">
            ${qrSvgMarkup}
          </div>

          <div class="qr-text">${escapeHtml(qrText)}</div>
        </div>

        <div class="print-actions">
          <button type="button" onclick="window.print()">Etikett drucken</button>
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}