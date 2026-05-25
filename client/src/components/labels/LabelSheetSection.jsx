// client/src/components/labels/LabelSheetSection.jsx

import { useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

import { createInventoryLabelQrTextFromCode } from "../../utils/labelQrUtils";

import {
  createLabelCode,
  createManualLabelSheetCodes,
  getUsedLabelCodes,
  LABELS_PER_SHEET,
  normalizeLabelCode,
} from "../../utils/labelPoolUtils";

import { parseLabelCodeSelection } from "../../utils/printedLabelStorageUtils";

import {
  markLabelCodesAsPrinted,
  releaseFreeLabelCodes,
  resetFreeLabelCodes,
} from "../../api/inventoryApi";

function createNextUnprintedLabelCodes({
  count,
  printedLabelCodes,
  usedLabelCodes,
}) {
  const blockedLabelCodeSet = new Set([
    ...printedLabelCodes,
    ...usedLabelCodes,
  ]);
  const nextLabelCodes = [];

  let nextNumber = 1;

  while (nextLabelCodes.length < count) {
    const nextLabelCode = createLabelCode(nextNumber);

    if (!blockedLabelCodeSet.has(nextLabelCode)) {
      nextLabelCodes.push(nextLabelCode);
    }

    nextNumber += 1;
  }

  return nextLabelCodes;
}

export function LabelSheetSection({
  inventoryItems,
  labelSlots = [],
  onLabelSlotsChange,
}) {
  const [startNumber, setStartNumber] = useState(1);
  const [labelSheetMode, setLabelSheetMode] = useState("pool");
  const [printStatusMessage, setPrintStatusMessage] = useState("");
  const [savingLabelPool, setSavingLabelPool] = useState(false);
  const [printedLabelCorrectionInput, setPrintedLabelCorrectionInput] =
    useState("");

  const [showLabelSheetPreview, setShowLabelSheetPreview] = useState(true);
  const [showCalibrationSheet, setShowCalibrationSheet] = useState(false);

  const manualLabelCodes = useMemo(
    () => createManualLabelSheetCodes(startNumber),
    [startNumber],
  );

  const printedLabelCodes = useMemo(
    () =>
      Array.from(
        new Set(
          labelSlots
            .filter((labelSlot) => labelSlot.print_status === "printed")
            .map((labelSlot) => normalizeLabelCode(labelSlot.label_code))
            .filter(Boolean),
        ),
      ),
    [labelSlots],
  );

  const readyFreeLabelCodes = useMemo(
    () =>
      labelSlots
        .filter(
          (labelSlot) =>
            labelSlot.status === "free" && labelSlot.print_status === "printed",
        )
        .map((labelSlot) => normalizeLabelCode(labelSlot.label_code))
        .filter(Boolean),
    [labelSlots],
  );

  const reusableUnprintedLabelCodes = useMemo(
    () =>
      labelSlots
        .filter(
          (labelSlot) =>
            labelSlot.status === "free" &&
            labelSlot.print_status === "not_printed",
        )
        .map((labelSlot) => normalizeLabelCode(labelSlot.label_code))
        .filter(Boolean),
    [labelSlots],
  );

  const usedLabelCodes = useMemo(
    () => getUsedLabelCodes(inventoryItems),
    [inventoryItems],
  );

  const nextPoolLabelCodes = useMemo(() => {
    const reusableCodesForSheet = reusableUnprintedLabelCodes.slice(
      0,
      LABELS_PER_SHEET,
    );
    const missingCodeCount = LABELS_PER_SHEET - reusableCodesForSheet.length;

    return [
      ...reusableCodesForSheet,
      ...createNextUnprintedLabelCodes({
        count: missingCodeCount,
        printedLabelCodes,
        usedLabelCodes,
      }),
    ];
  }, [printedLabelCodes, reusableUnprintedLabelCodes, usedLabelCodes]);

  const activeLabelCodes =
    labelSheetMode === "pool" ? nextPoolLabelCodes : manualLabelCodes;

  const sheetTitle =
    labelSheetMode === "pool"
      ? "Nächster Pool-Bogen"
      : "Manueller Etikettenbogen";

  const reusableFreeLabelCodeSet = new Set(reusableUnprintedLabelCodes);

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

  function updateLabelSlots(nextLabelSlots) {
    onLabelSlotsChange(nextLabelSlots);
  }

  function printLabelSheet() {
    setShowLabelSheetPreview(true);
    setShowCalibrationSheet(false);
    setPrintStatusMessage(
      "Druckdialog geöffnet. Erst nach erfolgreichem Ausdruck als gedruckt markieren.",
    );

    window.setTimeout(() => {
      window.print();
    }, 0);
  }

  function printCalibrationSheet() {
    setShowLabelSheetPreview(true);
    setShowCalibrationSheet(true);
    setPrintStatusMessage(
      "Kalibrierungsbogen geöffnet. Dieser Testdruck wird nicht als gedruckt / im Umlauf markiert.",
    );

    window.setTimeout(() => {
      window.print();
    }, 0);
  }

  async function markCurrentSheetAsPrinted() {
    const confirmed = window.confirm(
      "Diesen Etikettenbogen wirklich als gedruckt / im Umlauf markieren? Nur bestätigen, wenn der Ausdruck erfolgreich war.",
    );

    if (!confirmed) {
      return;
    }

    try {
      setSavingLabelPool(true);

      const result = await markLabelCodesAsPrinted(activeLabelCodes);

      updateLabelSlots(result.labelSlots || []);
      setPrintStatusMessage(
        "Etikettenbogen wurde als gedruckt / im Umlauf markiert.",
      );
    } catch (error) {
      console.error(error);
      setPrintStatusMessage(
        error.message ||
          "Etikettenbogen konnte nicht als gedruckt markiert werden.",
      );
    } finally {
      setSavingLabelPool(false);
    }
  }

  async function removeCurrentSheetFromPrintedLabels() {
    const confirmed = window.confirm(
      "Aktuellen Etikettenbogen wirklich aus gedruckt / im Umlauf entfernen? Es werden nur freie, keinem Bestand zugeordnete Etiketten entfernt.",
    );

    if (!confirmed) {
      return;
    }

    try {
      setSavingLabelPool(true);

      const result = await releaseFreeLabelCodes(activeLabelCodes);

      updateLabelSlots(result.labelSlots || []);
      setPrintStatusMessage(
        "Freie Etiketten des aktuellen Bogens wurden aus gedruckt / im Umlauf entfernt.",
      );
    } catch (error) {
      console.error(error);
      setPrintStatusMessage(
        error.message || "Freie Etiketten konnten nicht entfernt werden.",
      );
    } finally {
      setSavingLabelPool(false);
    }
  }

  async function removeSelectedPrintedLabels() {
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
      setPrintStatusMessage(
        `Aktive Etiketten können nicht entfernt werden: ${activeUsedLabelCodes.join(
          ", ",
        )}. Erst den zugehörigen Bestand entfernen.`,
      );
      return;
    }

    const confirmed = window.confirm(
      `Diese freien Etiketten wirklich aus gedruckt / im Umlauf entfernen: ${labelCodesToRemove.join(
        ", ",
      )}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setSavingLabelPool(true);

      const result = await releaseFreeLabelCodes(labelCodesToRemove);

      updateLabelSlots(result.labelSlots || []);
      setPrintedLabelCorrectionInput("");
      setPrintStatusMessage(
        `Freie Etiketten wurden aus gedruckt / im Umlauf entfernt: ${labelCodesToRemove.join(
          ", ",
        )}.`,
      );
    } catch (error) {
      console.error(error);
      setPrintStatusMessage(
        error.message || "Freie Etiketten konnten nicht entfernt werden.",
      );
    } finally {
      setSavingLabelPool(false);
    }
  }

  async function resetPrintedLabels() {
    const confirmed = window.confirm(
      "Alle freien gedruckten / im Umlauf befindlichen Etiketten zurücksetzen? Aktuell belegte Etiketten bleiben erhalten.",
    );

    if (!confirmed) {
      return;
    }

    try {
      setSavingLabelPool(true);

      const result = await resetFreeLabelCodes();

      updateLabelSlots(result.labelSlots || []);
      setPrintStatusMessage(
        "Freie gedruckte Etiketten wurden zurückgesetzt. Aktive Etiketten bleiben erhalten.",
      );
    } catch (error) {
      console.error(error);
      setPrintStatusMessage(
        error.message || "Freie Etiketten konnten nicht zurückgesetzt werden.",
      );
    } finally {
      setSavingLabelPool(false);
    }
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
            disabled={savingLabelPool}
            onClick={printLabelSheet}
          >
            Etikettenbogen drucken
          </button>

          <button
            type="button"
            className="secondary-button"
            disabled={savingLabelPool}
            onClick={printCalibrationSheet}
          >
            Kalibrierungsbogen drucken
          </button>

          <button
            type="button"
            className="secondary-button"
            disabled={savingLabelPool}
            onClick={markCurrentSheetAsPrinted}
          >
            Als gedruckt markieren
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={removeCurrentSheetFromPrintedLabels}
            disabled={printedLabelCodes.length === 0 || savingLabelPool}
          >
            Aktuellen Bogen freigeben
          </button>
          <button
            type="button"
            className="secondary-button"
            disabled={savingLabelPool}
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
        <span>Gedruckt und frei verfügbar: {readyFreeLabelCodes.length}</span>
        <span>
          Nachdruck / Wiederverwendung offen:{" "}
          {reusableUnprintedLabelCodes.length}
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
          disabled={printedLabelCodes.length === 0 || savingLabelPool}
        >
          Auswahl freigeben
        </button>

        <button
          type="button"
          className="secondary-button danger-outline-button"
          onClick={resetPrintedLabels}
          disabled={printedLabelCodes.length === 0 || savingLabelPool}
        >
          Druckstatus zurücksetzen
        </button>
      </div>

      {showLabelSheetPreview ? (
        <div className="label-sheet-print-area">
          <div className="label-sheet">
            {activeLabelCodes.map((labelCode, index) => {
              const qrText = createInventoryLabelQrTextFromCode(labelCode);
              const isReusableFreeLabel =
                reusableUnprintedLabelCodes.includes(labelCode);
              const calibrationNumber = index + 1;

              if (showCalibrationSheet) {
                return (
                  <div
                    className="label-sheet-item label-sheet-calibration-item"
                    key={labelCode}
                  >
                    <span className="label-sheet-calibration-corner label-sheet-calibration-corner-top-left" />
                    <span className="label-sheet-calibration-corner label-sheet-calibration-corner-top-right" />
                    <span className="label-sheet-calibration-corner label-sheet-calibration-corner-bottom-left" />
                    <span className="label-sheet-calibration-corner label-sheet-calibration-corner-bottom-right" />

                    <div className="label-sheet-calibration-content">
                      <strong>{calibrationNumber}</strong>
                      <span>{labelCode}</span>
                    </div>
                  </div>
                );
              }

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
