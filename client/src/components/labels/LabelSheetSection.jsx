// client/src/components/labels/LabelSheetSection.jsx

import { useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

import { createInventoryLabelQrTextFromCode } from "../../utils/labelQrUtils";

import {
  createManualLabelSheetCodes,
  createNextLabelSheetCodes,
  getReusableFreeLabelCodes,
  getUsedLabelCodes,
} from "../../utils/labelPoolUtils";

import {
  addPrintedLabelCodes,
  clearPrintedLabelCodes,
  parseLabelCodeSelection,
  removePrintedLabelCodes,
} from "../../utils/printedLabelStorageUtils";

export function LabelSheetSection({
  inventoryItems,
  printedLabelCodes = [],
  onPrintedLabelCodesChange,
}) {
  const [startNumber, setStartNumber] = useState(1);
  const [labelSheetMode, setLabelSheetMode] = useState("pool");
  const [printStatusMessage, setPrintStatusMessage] = useState("");
  const [printedLabelCorrectionInput, setPrintedLabelCorrectionInput] =
    useState("");

  const [showLabelSheetPreview, setShowLabelSheetPreview] = useState(true);

  const manualLabelCodes = useMemo(
    () => createManualLabelSheetCodes(startNumber),
    [startNumber],
  );

  const nextPoolLabelCodes = useMemo(
    () => createNextLabelSheetCodes(inventoryItems, printedLabelCodes),
    [inventoryItems, printedLabelCodes],
  );

  const usedLabelCodes = useMemo(
    () => getUsedLabelCodes(inventoryItems),
    [inventoryItems],
  );

  const reusableFreeLabelCodes = useMemo(
    () => getReusableFreeLabelCodes(inventoryItems, printedLabelCodes),
    [inventoryItems, printedLabelCodes],
  );

  const activeLabelCodes =
    labelSheetMode === "pool" ? nextPoolLabelCodes : manualLabelCodes;

  const sheetTitle =
    labelSheetMode === "pool"
      ? "Nächster Pool-Bogen"
      : "Manueller Etikettenbogen";

  const reusableFreeLabelCodeSet = new Set(reusableFreeLabelCodes);

  const reusedActiveLabelCodes = activeLabelCodes.filter((labelCode) =>
    reusableFreeLabelCodeSet.has(labelCode),
  );

  const newActiveLabelCodes = activeLabelCodes.filter(
    (labelCode) => !reusableFreeLabelCodeSet.has(labelCode),
  );

  const hasReusedLabels = reusedActiveLabelCodes.length > 0;

  const newLabelRangeText =
    newActiveLabelCodes.length > 0
      ? `${newActiveLabelCodes[0]}–${
          newActiveLabelCodes[newActiveLabelCodes.length - 1]
        }`
      : "keine";

  const reusedLabelText = hasReusedLabels
    ? reusedActiveLabelCodes.join(", ")
    : "keine";

  function updatePrintedLabelCodes(nextPrintedLabelCodes) {
    onPrintedLabelCodesChange(nextPrintedLabelCodes);
  }

  function printLabelSheet() {
    setShowLabelSheetPreview(true);
    setPrintStatusMessage(
      "Druckdialog geöffnet. Erst nach erfolgreichem Ausdruck als gedruckt markieren.",
    );

    window.setTimeout(() => {
      window.print();
    }, 0);
  }

  function markCurrentSheetAsPrinted() {
    const confirmed = window.confirm(
      "Diesen Etikettenbogen wirklich als gedruckt / im Umlauf markieren? Nur bestätigen, wenn der Ausdruck erfolgreich war.",
    );

    if (!confirmed) {
      return;
    }

    const updatedPrintedLabelCodes = addPrintedLabelCodes(
      printedLabelCodes,
      activeLabelCodes,
    );

    updatePrintedLabelCodes(updatedPrintedLabelCodes);
    setPrintStatusMessage(
      "Etikettenbogen wurde als gedruckt / im Umlauf markiert.",
    );
  }

  function removeCurrentSheetFromPrintedLabels() {
    const confirmed = window.confirm(
      "Aktuellen Etikettenbogen wirklich aus gedruckt / im Umlauf entfernen? Das ist sinnvoll bei Fehldruck oder versehentlicher Markierung.",
    );

    if (!confirmed) {
      return;
    }

    const updatedPrintedLabelCodes = removePrintedLabelCodes(
      printedLabelCodes,
      activeLabelCodes,
    );

    updatePrintedLabelCodes(updatedPrintedLabelCodes);
    setPrintStatusMessage(
      "Aktueller Etikettenbogen wurde aus gedruckt / im Umlauf entfernt.",
    );
  }

  function removeSelectedPrintedLabels() {
    const labelCodesToRemove = parseLabelCodeSelection(
      printedLabelCorrectionInput,
    );

    if (labelCodesToRemove.length === 0) {
      setPrintStatusMessage(
        "Keine gültigen Etiketten gefunden. Beispiel: F038, F039 oder F038-F041.",
      );
      return;
    }

    const activeUsedLabelCodes = usedLabelCodes.filter((labelCode) =>
      labelCodesToRemove.includes(labelCode),
    );

    if (activeUsedLabelCodes.length > 0) {
      const confirmedActiveRelease = window.confirm(
        `Achtung: Diese Etiketten sind aktuell noch einem Bestand zugeordnet: ${activeUsedLabelCodes.join(
          ", ",
        )}. Trotzdem aus gedruckt / im Umlauf entfernen?`,
      );

      if (!confirmedActiveRelease) {
        setPrintStatusMessage(
          `Freigabe abgebrochen. Aktive Etiketten wurden nicht verändert: ${activeUsedLabelCodes.join(
            ", ",
          )}.`,
        );
        return;
      }
    }

    const confirmed = window.confirm(
      `Diese Etiketten wirklich aus gedruckt / im Umlauf entfernen: ${labelCodesToRemove.join(
        ", ",
      )}?`,
    );

    if (!confirmed) {
      return;
    }

    const updatedPrintedLabelCodes = removePrintedLabelCodes(
      printedLabelCodes,
      labelCodesToRemove,
    );

    updatePrintedLabelCodes(updatedPrintedLabelCodes);
    setPrintedLabelCorrectionInput("");
    setPrintStatusMessage(
      `Etiketten wurden aus gedruckt / im Umlauf entfernt: ${labelCodesToRemove.join(
        ", ",
      )}.`,
    );
  }

  function resetPrintedLabels() {
    const confirmed = window.confirm(
      "Alle gedruckten / im Umlauf befindlichen Etiketten zurücksetzen? Nur verwenden, wenn der lokale Druckstatus vollständig neu aufgebaut werden soll.",
    );

    if (!confirmed) {
      return;
    }

    const updatedPrintedLabelCodes = clearPrintedLabelCodes();

    updatePrintedLabelCodes(updatedPrintedLabelCodes);
    setPrintStatusMessage(
      "Der lokale Druckstatus wurde vollständig zurückgesetzt.",
    );
  }

  return (
    <section className="card label-sheet-section">
      <div className="section-header">
        <div>
          <h2>Etikettenbogen</h2>
          <p>
            Druckbogen für Printation Papieretiketten 45 mm × 30 mm, Art.
            1548812-GP, 4 Spalten × 9 Zeilen.
          </p>
        </div>
      </div>

      <div className="label-sheet-toolbar">
        <label>
          Druckmodus
          <select
            value={labelSheetMode}
            onChange={(event) => setLabelSheetMode(event.target.value)}
          >
            <option value="pool">Pool-Bogen automatisch</option>
            <option value="manual">Manueller Bogen</option>
          </select>
        </label>

        <label>
          Startnummer
          <input
            type="number"
            min="1"
            value={startNumber}
            onChange={(event) => setStartNumber(event.target.value)}
            disabled={labelSheetMode === "pool"}
          />
        </label>

        <div className="label-sheet-toolbar-info">
          <strong>
            {activeLabelCodes[0]}–
            {activeLabelCodes[activeLabelCodes.length - 1]}
          </strong>
          <span>{sheetTitle}, 36 Etiketten</span>
        </div>

        <div className="label-sheet-toolbar-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={printLabelSheet}
          >
            Etikettenbogen drucken
          </button>

          <button
            type="button"
            className="secondary-button"
            onClick={markCurrentSheetAsPrinted}
          >
            Als gedruckt markieren
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={removeCurrentSheetFromPrintedLabels}
            disabled={printedLabelCodes.length === 0}
          >
            Aktuellen Bogen freigeben
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              setShowLabelSheetPreview(
                (currentShowLabelSheetPreview) => !currentShowLabelSheetPreview,
              )
            }
          >
            {showLabelSheetPreview
              ? "Vorschau ausblenden"
              : "Vorschau anzeigen"}
          </button>
        </div>
      </div>

      {printStatusMessage && (
        <p className="label-sheet-status-message">{printStatusMessage}</p>
      )}

      <div className="label-sheet-pool-info">
        <span>Aktiv belegte Etiketten: {usedLabelCodes.length}</span>
        <span>Gedruckt / im Umlauf: {printedLabelCodes.length}</span>
        <span>
          Wiederverwendbare freie Etiketten: {reusableFreeLabelCodes.length}
        </span>
      </div>

      <div className="label-sheet-composition">
        <div>
          <strong>Aktueller Bogen</strong>
          <span>
            Neue Etiketten: {newActiveLabelCodes.length} · Wiederverwendete
            Etiketten: {reusedActiveLabelCodes.length}
          </span>
        </div>

        <div>
          <strong>Fortlaufender Bereich</strong>
          <span>{newLabelRangeText}</span>
        </div>

        <div>
          <strong>Wiederverwendet</strong>
          <span>{reusedLabelText}</span>
        </div>
      </div>

      <div className="label-sheet-correction">
        <label>
          Einzelne Etiketten freigeben
          <input
            type="text"
            value={printedLabelCorrectionInput}
            onChange={(event) =>
              setPrintedLabelCorrectionInput(event.target.value)
            }
            placeholder="z. B. F038, F039 oder F038-F041"
          />
        </label>

        <button
          type="button"
          className="secondary-button"
          onClick={removeSelectedPrintedLabels}
          disabled={printedLabelCodes.length === 0}
        >
          Auswahl freigeben
        </button>

        <button
          type="button"
          className="secondary-button danger-outline-button"
          onClick={resetPrintedLabels}
          disabled={printedLabelCodes.length === 0}
        >
          Druckstatus zurücksetzen
        </button>
      </div>

      {showLabelSheetPreview ? (
        <div className="label-sheet-print-area">
          <div className="label-sheet">
            {activeLabelCodes.map((labelCode) => {
              const qrText = createInventoryLabelQrTextFromCode(labelCode);
              const isReusableFreeLabel =
                reusableFreeLabelCodes.includes(labelCode);

              return (
                <div
                  className={`label-sheet-item${
                    isReusableFreeLabel ? " label-sheet-item-reused" : ""
                  }`}
                  key={labelCode}
                >
                  <div className="label-sheet-qr">
                    <QRCodeSVG
                      value={qrText}
                      size={54}
                      level="M"
                      includeMargin
                    />
                  </div>

                  <div className="label-sheet-text">
                    <strong>{labelCode}</strong>
                    <span>
                      {isReusableFreeLabel ? "wieder frei" : "Food Inventory"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="label-sheet-preview-hidden">
          <strong>Etikettenvorschau ausgeblendet</strong>
          <span>
            Der aktuelle Bogen ist weiterhin druckbereit. Zum Prüfen der
            Positionen die Vorschau wieder anzeigen.
          </span>
        </div>
      )}
    </section>
  );
}
