// client/src/components/inventory/InventoryOverview.jsx

import {
  formatDateGerman,
  formatQuantity,
  getInventoryDateStatus,
  getInventoryDateStatusLabel,
  getPackageStateLabel,
} from "../../utils/formattersUtils";

import { inventoryStatusFilterOptions } from "../../constants/selectOptions";

import { renderSelectOptions } from "../form/FormSelectOptions";

export function InventoryOverview({
  inventoryItems,
  filteredInventoryItems,
  inventorySearchTerm,
  inventoryStatusFilter,
  inventoryStorageFilter,
  inventoryStorageFilterOptions,
  hasActiveInventoryFilters,
  loadingInventory,
  onInventorySearchTermChange,
  onInventoryStatusFilterChange,
  onInventoryStorageFilterChange,
  onResetInventoryFilters,
  onOpenRemovalDialog,
}) {
  return (
    <>
      <div className="inventory-overview-header">
        <div>
          <h3>Bestandsübersicht</h3>
          <p className="muted">
            Suche und Filter für vorhandene Packungen, Dosen und Gebinde.
          </p>
        </div>

        <span className="result-count">
          {filteredInventoryItems.length} von {inventoryItems.length} Einträgen
        </span>
      </div>

      <div className="inventory-toolbar">
        <label className="inventory-search">
          Bestand suchen
          <input
            type="search"
            value={inventorySearchTerm}
            onChange={(event) =>
              onInventorySearchTermChange(event.target.value)
            }
            placeholder="z. B. Pommes, Coop, Wohnzimmer, Schublade 2"
          />
        </label>

        <div className="inventory-filter-row">
          <label>
            Status
            <select
              value={inventoryStatusFilter}
              onChange={(event) =>
                onInventoryStatusFilterChange(event.target.value)
              }
            >
              {renderSelectOptions(inventoryStatusFilterOptions)}
            </select>
          </label>

          <label>
            Lagergerät
            <select
              value={inventoryStorageFilter}
              onChange={(event) =>
                onInventoryStorageFilterChange(event.target.value)
              }
            >
              <option value="all">Alle Lagergeräte</option>
              {inventoryStorageFilterOptions.map((option) => (
                <option value={option.id} key={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="secondary-button"
            onClick={onResetInventoryFilters}
            disabled={!hasActiveInventoryFilters}
          >
            Filter zurücksetzen
          </button>
        </div>
      </div>

      {loadingInventory && <p className="muted">Bestand wird geladen...</p>}

      {!loadingInventory && inventoryItems.length === 0 && (
        <p className="muted">Noch kein Bestand vorhanden.</p>
      )}

      {!loadingInventory &&
        inventoryItems.length > 0 &&
        filteredInventoryItems.length === 0 && (
          <p className="muted">Keine passenden Bestandseinträge gefunden.</p>
        )}

      <div className="inventory-list">
        {filteredInventoryItems.map((item) => (
          <article className="inventory-card" key={item.id}>
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

                <span
                  className={`package-state package-state-${item.package_state}`}
                >
                  {getPackageStateLabel(item.package_state)}
                </span>

                <span
                  className={`date-status date-status-${getInventoryDateStatus(item)}`}
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
        ))}
      </div>
    </>
  );
}
