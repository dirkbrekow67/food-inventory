// client/src/components/inventory/InventoryCard.jsx

import {
  formatDateGerman,
  getInventoryDateStatus,
  getInventoryDateStatusLabel,
  getPackageStateLabel,
} from "../../utils/formattersUtils";

import { InventoryLabelActions } from "./InventoryLabelActions";

function formatInventoryQuantity(quantity, unit) {
  if (quantity === null || quantity === undefined || quantity === "") {
    return null;
  }

  const numericQuantity = Number(quantity);

  if (Number.isNaN(numericQuantity)) {
    return null;
  }

  const formattedQuantity = Number.isInteger(numericQuantity)
    ? String(numericQuantity)
    : String(numericQuantity).replace(".", ",");

  return unit ? `${formattedQuantity} ${unit}` : formattedQuantity;
}

function getInventoryQuantityLabel(item) {
  const remainingQuantityLabel = formatInventoryQuantity(
    item.remaining_quantity,
    item.remaining_unit,
  );

  if (remainingQuantityLabel) {
    return remainingQuantityLabel;
  }

  return formatInventoryQuantity(item.original_quantity, item.original_unit);
}

function getBatchPositionLabel(item) {
  if (!item.batch_position || !item.batch_total) {
    return null;
  }

  return `${item.batch_position} von ${item.batch_total}`;
}

export function InventoryCard({
  item,
  isHighlighted,
  onOpenRemovalDialog,
  onOpenInventoryEditDialog,
  onUpdateLabelPrintStatus,
}) {
  const quantityLabel = getInventoryQuantityLabel(item);
  const batchPositionLabel = getBatchPositionLabel(item);

  return (
    <article
      className={`inventory-card${isHighlighted ? " inventory-card-highlighted" : ""}`}
      id={`inventory-item-${item.id}`}
    >
      <div className="inventory-card-header">
        <div>
          <h3>{item.product_name}</h3>
          <p className="muted">
            {[item.product_brand, item.product_category]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>

        <div className="inventory-status-group">
          {item.label_code && (
            <span className="label-code">{item.label_code}</span>
          )}

          {batchPositionLabel && (
            <span className="package-state">{batchPositionLabel}</span>
          )}

          {item.product_favorite === 1 && (
            <span className="favorite-badge">★ Standardartikel</span>
          )}

          <span className={`package-state package-state-${item.package_state}`}>
            {getPackageStateLabel(item.package_state)}
          </span>

          <span
            className={`date-status date-status-${getInventoryDateStatus(
              item,
            )}`}
          >
            {getInventoryDateStatusLabel(getInventoryDateStatus(item))}
          </span>
        </div>
      </div>

      <div className="inventory-meta">
        <span>{item.storage_unit_name}</span>

        {item.storage_compartment_name && (
          <span>{item.storage_compartment_name}</span>
        )}

        <span>{quantityLabel || "Menge nicht angegeben"}</span>

        {item.best_before_date && (
          <span>MHD: {formatDateGerman(item.best_before_date)}</span>
        )}

        {item.internal_use_until_date && (
          <span>
            Intern bis: {formatDateGerman(item.internal_use_until_date)}
          </span>
        )}
      </div>

      <InventoryLabelActions
        item={item}
        onUpdateLabelPrintStatus={onUpdateLabelPrintStatus}
      />

      {item.batch_note && <p className="product-notes">{item.batch_note}</p>}

      {item.notes && <p className="product-notes">{item.notes}</p>}

      <div className="product-actions">
        <button
          type="button"
          className="secondary-button"
          onClick={() => onOpenInventoryEditDialog(item)}
        >
          Bearbeiten
        </button>

        <button
          type="button"
          className="danger-button"
          onClick={() => onOpenRemovalDialog(item)}
        >
          Entfernen
        </button>
      </div>
    </article>
  );
}
