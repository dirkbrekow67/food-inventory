// client/src/components/inventory/InventoryLabelScanner.jsx

export function InventoryLabelScanner({
  labelScanInput,
  onLabelScanInputChange,
  onLabelScanSubmit,
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

      <button type="submit" className="secondary-button">
        Etikett öffnen
      </button>
    </form>
  );
}
