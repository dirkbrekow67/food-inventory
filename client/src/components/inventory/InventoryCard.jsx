// client/src/components/inventory/InventoryCard.jsx

import {
  formatDateGerman,
  formatQuantity,
  getInventoryDateStatus,
  getInventoryDateStatusLabel,
  getPackageStateLabel,
} from "../../utils/formattersUtils";

export function InventoryCard({ item, onOpenRemovalDialog }) {
  return (
    <article className="inventory-card">
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

        <span>{formatQuantity(item)}</span>

        {item.best_before_date && (
          <span>MHD: {formatDateGerman(item.best_before_date)}</span>
        )}

        {item.internal_use_until_date && (
          <span>
            Intern bis: {formatDateGerman(item.internal_use_until_date)}
          </span>
        )}
      </div>

      {item.notes && <p className="product-notes">{item.notes}</p>}

      <div className="product-actions">
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
