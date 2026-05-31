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
  editingInventoryItemId = null,
  onCancelInventoryEdit,
}) {
  const isEditingInventoryItem = Boolean(editingInventoryItemId);
  const effectiveTitle = isEditingInventoryItem ? "Bestand bearbeiten" : title;
  const effectiveSubmitLabel = isEditingInventoryItem
    ? "Änderungen speichern"
    : submitLabel;
  const effectiveProductSelectionDisabled =
    productSelectionDisabled || isEditingInventoryItem;

  const getDefaultBatchUnit = (index, total) => ({
    storageUnitId: inventoryForm.storageUnitId || "",
    storageCompartmentId: inventoryForm.storageCompartmentId || "",
    originalQuantity: inventoryForm.originalQuantity || "",
    originalUnit: inventoryForm.originalUnit || "g",
    remainingQuantity: inventoryForm.remainingQuantity || "",
    remainingUnit:
      inventoryForm.remainingUnit || inventoryForm.originalUnit || "g",
    quantityEstimated: inventoryForm.quantityEstimated || false,
    batchNote: `${index + 1} von ${total}`,
  });

  const toggleCreateMultipleItems = (checked) => {
    const nextBatchUnits =
      checked &&
      (!inventoryForm.batchUnits || inventoryForm.batchUnits.length === 0)
        ? [getDefaultBatchUnit(0, 2), getDefaultBatchUnit(1, 2)]
        : inventoryForm.batchUnits || [];

    onUpdateInventoryForm("createMultipleItems", checked);
    onUpdateInventoryForm("batchUnits", nextBatchUnits);

    if (checked) {
      onUpdateInventoryForm("packageState", "portioniert");
    }
  };

  const setBatchUnitCount = (value) => {
    const nextCount = Math.max(2, Number(value) || 2);
    const currentUnits = inventoryForm.batchUnits || [];

    const nextBatchUnits = Array.from({ length: nextCount }, (_, index) => {
      const existingUnit = currentUnits[index];

      return existingUnit || getDefaultBatchUnit(index, nextCount);
    }).map((unit, index) => ({
      ...unit,
      batchNote: `${index + 1} von ${nextCount}`,
    }));

    onUpdateInventoryForm("batchUnits", nextBatchUnits);
  };

  const updateBatchUnit = (index, field, value) => {
    const nextBatchUnits = [...(inventoryForm.batchUnits || [])];

    nextBatchUnits[index] = {
      ...nextBatchUnits[index],
      [field]: value,
    };

    if (field === "originalQuantity") {
      nextBatchUnits[index].remainingQuantity = value;
    }

    if (field === "originalUnit") {
      nextBatchUnits[index].remainingUnit = value;
    }

    if (field === "storageUnitId") {
      nextBatchUnits[index].storageCompartmentId = "";
    }

    onUpdateInventoryForm("batchUnits", nextBatchUnits);
  };

  const removeBatchUnit = (index) => {
    const currentUnits = inventoryForm.batchUnits || [];

    if (currentUnits.length <= 2) {
      return;
    }

    const nextBatchUnits = currentUnits
      .filter((_, unitIndex) => unitIndex !== index)
      .map((unit, unitIndex, allUnits) => ({
        ...unit,
        batchNote: `${unitIndex + 1} von ${allUnits.length}`,
      }));

    onUpdateInventoryForm("batchUnits", nextBatchUnits);
  };

  const addBatchUnit = () => {
    const currentUnits = inventoryForm.batchUnits || [];
    const nextCount = currentUnits.length + 1;

    const nextBatchUnits = [
      ...currentUnits,
      getDefaultBatchUnit(currentUnits.length, nextCount),
    ].map((unit, index) => ({
      ...unit,
      batchNote: `${index + 1} von ${nextCount}`,
    }));

    onUpdateInventoryForm("batchUnits", nextBatchUnits);
  };

  const handleSubmit = (event) => {
    if (inventoryForm.createMultipleItems) {
      const validBatchUnits = (inventoryForm.batchUnits || []).filter(
        (unit) => unit.storageUnitId,
      );

      if (validBatchUnits.length !== (inventoryForm.batchUnits || []).length) {
        event.preventDefault();
        alert("Bitte für jede Einheit eine Lagereinrichtung auswählen.");
        return;
      }

      if (validBatchUnits.length < 2) {
        event.preventDefault();
        alert(
          "Für die Mehrfachanlage sind mindestens zwei Einheiten erforderlich.",
        );
        return;
      }
    }

    onCreateInventoryItem(event);
  };

  return (
    <form className="inventory-form" onSubmit={handleSubmit}>
      <div className="form-title-row">
        <h3>{effectiveTitle}</h3>

        {isEditingInventoryItem && (
          <button
            type="button"
            className="secondary-button"
            onClick={onCancelInventoryEdit}
            disabled={savingInventoryItem}
          >
            Bearbeitung abbrechen
          </button>
        )}
      </div>

      <div className="form-grid">
        <label>
          Produkt *
          <select
            value={inventoryForm.productId}
            disabled={effectiveProductSelectionDisabled}
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

      <div className="form-section">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={inventoryForm.createMultipleItems}
            disabled={isEditingInventoryItem}
            onChange={(event) =>
              toggleCreateMultipleItems(event.target.checked)
            }
          />
          Mehrere Einheiten aus gleicher Packung / Charge erfassen
        </label>

        {inventoryForm.createMultipleItems ? (
          <div className="batch-units-box">
            <div className="form-row">
              <label>
                Anzahl Einheiten
                <input
                  type="number"
                  min="2"
                  value={inventoryForm.batchUnits?.length || 2}
                  onChange={(event) => setBatchUnitCount(event.target.value)}
                />
              </label>

              <button
                type="button"
                className="secondary-button"
                onClick={addBatchUnit}
              >
                Einheit hinzufügen
              </button>
            </div>

            <p className="form-hint">
              Gemeinsame Daten wie Produkt, MHD, Einfrierdatum und interne Frist
              werden aus dem Hauptformular übernommen. Menge und Lagerort können
              je Einheit abweichen.
            </p>

            <div className="batch-units-list">
              {(inventoryForm.batchUnits || []).map((unit, index) => {
                const availableCompartments = getCompartmentsForSelectedUnit(
                  storageTree,
                  unit.storageUnitId,
                );

                return (
                  <div className="batch-unit-card" key={`batch-unit-${index}`}>
                    <div className="batch-unit-header">
                      <strong>Einheit {index + 1}</strong>

                      <button
                        type="button"
                        className="secondary-button danger-button"
                        disabled={(inventoryForm.batchUnits || []).length <= 2}
                        onClick={() => removeBatchUnit(index)}
                      >
                        Entfernen
                      </button>
                    </div>

                    <div className="form-row">
                      <label>
                        Menge
                        <input
                          type="number"
                          min="0"
                          step="0.001"
                          value={unit.originalQuantity || ""}
                          onChange={(event) =>
                            updateBatchUnit(
                              index,
                              "originalQuantity",
                              event.target.value,
                            )
                          }
                        />
                      </label>

                      <label>
                        Einheit
                        <select
                          value={unit.originalUnit || "g"}
                          onChange={(event) =>
                            updateBatchUnit(
                              index,
                              "originalUnit",
                              event.target.value,
                            )
                          }
                        >
                          {renderSelectOptions(quantityUnitOptions)}
                        </select>
                      </label>
                    </div>

                    <div className="form-row">
                      <label>
                        Lagereinrichtung *
                        <select
                          value={unit.storageUnitId || ""}
                          onChange={(event) =>
                            updateBatchUnit(
                              index,
                              "storageUnitId",
                              event.target.value,
                            )
                          }
                          required
                        >
                          <option value="">Lagergerät auswählen</option>
                          {getAllStorageUnits(storageTree).map(
                            (storageUnit) => (
                              <option
                                key={storageUnit.id}
                                value={storageUnit.id}
                              >
                                {storageUnit.locationName} · {storageUnit.name}
                              </option>
                            ),
                          )}
                        </select>
                      </label>

                      <label>
                        Fach / Schublade
                        <select
                          value={unit.storageCompartmentId || ""}
                          onChange={(event) =>
                            updateBatchUnit(
                              index,
                              "storageCompartmentId",
                              event.target.value,
                            )
                          }
                        >
                          <option value="">Kein Fach ausgewählt</option>
                          {availableCompartments.map((compartment) => (
                            <option key={compartment.id} value={compartment.id}>
                              {compartment.name}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <label>
                      Einzelnotiz
                      <input
                        type="text"
                        value={unit.batchNote || ""}
                        onChange={(event) =>
                          updateBatchUnit(
                            index,
                            "batchNote",
                            event.target.value,
                          )
                        }
                        placeholder={`${index + 1} von ${
                          inventoryForm.batchUnits.length
                        }`}
                      />
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
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
          {savingInventoryItem ? "Speichern..." : effectiveSubmitLabel}
        </button>
      </div>
    </form>
  );
}
