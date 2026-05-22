// client/src/components/inventory/InventoryLabelScanner.jsx

export function InventoryLabelScanner({
  labelScanInput,
  labelScanMessage,
  onLabelScanInputChange,
  onLabelScanSubmit,
  onResetLabelScan,
}) {
  return (
    <form className="inventory-label-scanner" onSubmit={onLabelScanSubmit}>
      <label>
        QR-Code / Etikett suchen
        <input
          type="search"
          value={labelScanInput}
          onChange={(event) => onLabelScanInputChange(event.target.value)}
          placeholder="z. B. F002 oder food-inventory://label/F002"
        />
      </label>

      <div className="inventory-label-scanner-actions">
        <button type="submit" className="secondary-button">
          Etikett öffnen
        </button>

        <button
          type="button"
          className="secondary-button"
          onClick={onResetLabelScan}
          disabled={!labelScanInput && !labelScanMessage}
        >
          Scan zurücksetzen
        </button>
      </div>

      {labelScanMessage && (
        <p className="inventory-label-scan-message">{labelScanMessage}</p>
      )}
    </form>
  );
}
