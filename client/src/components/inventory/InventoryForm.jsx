// client/src/components/inventory/InventoryForm.jsx

import {
  internalExtensionMonthOptions,
  packageStateOptions,
  quantityUnitOptions,
  remainingFractionOptions,
} from "../../constants/selectOptions";

import { renderSelectOptions } from "../form/FormSelectOptions";

import {
  getBuyAgainLabel,
  getExperienceReasonLabel,
  getRemovalReasonLabel,
} from "../../utils/formattersUtils";

import {
  getAllStorageUnits,
  getCompartmentsForSelectedUnit,
} from "../../utils/inventoryDataUtils";

export function InventoryForm({
  inventoryForm,
  products,
  storageTree,
  selectedInventoryProductHistorySummary,
  savingInventoryItem,
  onCreateInventoryItem,
  onInventoryProductChange,
  onUpdateInventoryForm,
  title = "Bestand erfassen",
  submitLabel = "Bestand erfassen",
  productSelectionDisabled = false,
}) {
  return (
    <form className="inventory-form" onSubmit={onCreateInventoryItem}>
      <h3>{title}</h3>

      <div className="form-grid">
        <label>
          Produkt *
          <select
            value={inventoryForm.productId}
            disabled={productSelectionDisabled}
            onChange={(event) => onInventoryProductChange(event.target.value)}
          >
            <option value="">Produkt auswählen</option>
            {products.map((product) => (
              <option value={product.id} key={product.id}>
                {product.name}
                {product.brand ? ` · ${product.brand}` : ""}
              </option>
            ))}
          </select>
        </label>

        {selectedInventoryProductHistorySummary?.count > 0 && (
          <div className="inventory-history-hint">
            <strong>
              {selectedInventoryProductHistorySummary.count} gespeicherte{" "}
              {selectedInventoryProductHistorySummary.count === 1
                ? "Erfahrung"
                : "Erfahrungen"}
            </strong>

            {selectedInventoryProductHistorySummary.latestItem && (
              <span>
                Letzte Erfahrung:{" "}
                {getRemovalReasonLabel(
                  selectedInventoryProductHistorySummary.latestItem
                    .removal_reason,
                )}
                {selectedInventoryProductHistorySummary.latestItem
                  .product_buy_again_status_after_removal
                  ? ` · ${getBuyAgainLabel(
                      selectedInventoryProductHistorySummary.latestItem
                        .product_buy_again_status_after_removal,
                    )}`
                  : ""}
                {selectedInventoryProductHistorySummary.latestItem
                  .experience_reason
                  ? ` · ${getExperienceReasonLabel(
                      selectedInventoryProductHistorySummary.latestItem
                        .experience_reason,
                    )}`
                  : ""}
              </span>
            )}
          </div>
        )}

        <label>
          Lagergerät *
          <select
            value={inventoryForm.storageUnitId}
            onChange={(event) => {
              onUpdateInventoryForm("storageUnitId", event.target.value);
              onUpdateInventoryForm("storageCompartmentId", "");
            }}
          >
            <option value="">Lagergerät auswählen</option>
            {getAllStorageUnits(storageTree).map((unit) => (
              <option value={unit.id} key={unit.id}>
                {unit.locationName} · {unit.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Fach / Schublade
          <select
            value={inventoryForm.storageCompartmentId}
            onChange={(event) =>
              onUpdateInventoryForm("storageCompartmentId", event.target.value)
            }
          >
            <option value="">Kein Fach ausgewählt</option>
            {getCompartmentsForSelectedUnit(
              storageTree,
              inventoryForm.storageUnitId,
            ).map((compartment) => (
              <option value={compartment.id} key={compartment.id}>
                {compartment.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          MHD
          <input
            type="date"
            value={inventoryForm.bestBeforeDate}
            onChange={(event) =>
              onUpdateInventoryForm("bestBeforeDate", event.target.value)
            }
          />
        </label>

        <label>
          Originalmenge
          <input
            type="number"
            min="0"
            step="0.01"
            value={inventoryForm.originalQuantity}
            onChange={(event) =>
              onUpdateInventoryForm("originalQuantity", event.target.value)
            }
            placeholder="z. B. 1000"
          />
        </label>

        <label>
          Original-Einheit
          <select
            value={inventoryForm.originalUnit}
            onChange={(event) =>
              onUpdateInventoryForm("originalUnit", event.target.value)
            }
          >
            {renderSelectOptions(quantityUnitOptions)}
          </select>
        </label>

        <label>
          Restmenge
          <input
            type="number"
            min="0"
            step="0.01"
            value={inventoryForm.remainingQuantity}
            onChange={(event) =>
              onUpdateInventoryForm("remainingQuantity", event.target.value)
            }
            placeholder="z. B. 350"
          />
        </label>

        <label>
          Rest-Einheit
          <select
            value={inventoryForm.remainingUnit}
            onChange={(event) =>
              onUpdateInventoryForm("remainingUnit", event.target.value)
            }
          >
            {renderSelectOptions(quantityUnitOptions)}
          </select>
        </label>

        <label>
          Restanteil
          <select
            value={inventoryForm.remainingFraction}
            onChange={(event) =>
              onUpdateInventoryForm("remainingFraction", event.target.value)
            }
          >
            {renderSelectOptions(remainingFractionOptions)}
          </select>
        </label>

        <label>
          Packungszustand
          <select
            value={inventoryForm.packageState}
            onChange={(event) =>
              onUpdateInventoryForm("packageState", event.target.value)
            }
          >
            {renderSelectOptions(packageStateOptions)}
          </select>
        </label>

        <label>
          Eingefroren am
          <input
            type="date"
            value={inventoryForm.frozenDate}
            onChange={(event) =>
              onUpdateInventoryForm("frozenDate", event.target.value)
            }
          />
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={inventoryForm.isFrozenChilledFood}
            onChange={(event) =>
              onUpdateInventoryForm("isFrozenChilledFood", event.target.checked)
            }
          />
          Kühlware eingefroren
        </label>

        <label>
          Interne Frist
          <select
            value={inventoryForm.internalExtensionMonths}
            onChange={(event) =>
              onUpdateInventoryForm(
                "internalExtensionMonths",
                event.target.value,
              )
            }
            disabled={!inventoryForm.isFrozenChilledFood}
          >
            {renderSelectOptions(internalExtensionMonthOptions)}
          </select>
        </label>

        <label>
          Geöffnet am
          <input
            type="date"
            value={inventoryForm.openedDate}
            onChange={(event) =>
              onUpdateInventoryForm("openedDate", event.target.value)
            }
          />
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={inventoryForm.quantityEstimated}
            onChange={(event) =>
              onUpdateInventoryForm("quantityEstimated", event.target.checked)
            }
          />
          Restmenge geschätzt
        </label>
      </div>

      <label>
        Notiz
        <textarea
          value={inventoryForm.notes}
          onChange={(event) =>
            onUpdateInventoryForm("notes", event.target.value)
          }
          placeholder="z. B. angebrochene Tüte, zuerst verbrauchen"
          rows="3"
        />
      </label>

      <div className="form-actions">
        <button type="submit" disabled={savingInventoryItem}>
          {savingInventoryItem ? "Speichern..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
