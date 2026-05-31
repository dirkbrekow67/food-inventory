// client/src/utils/inventoryFormUtils.js

import { parseRemainingFraction } from "./inventoryDataUtils";

function normalizeInventoryBatchUnits(batchUnits = []) {
  if (!Array.isArray(batchUnits)) {
    return [];
  }

  return batchUnits
    .map((unit) => ({
      storageUnitId: unit.storageUnitId ? Number(unit.storageUnitId) : null,
      storageCompartmentId: unit.storageCompartmentId
        ? Number(unit.storageCompartmentId)
        : null,
      originalQuantity: unit.originalQuantity
        ? Number(unit.originalQuantity)
        : null,
      originalUnit: unit.originalUnit || null,
      remainingQuantity: unit.remainingQuantity
        ? Number(unit.remainingQuantity)
        : unit.originalQuantity
          ? Number(unit.originalQuantity)
          : null,
      remainingUnit: unit.remainingUnit || unit.originalUnit || null,
      quantityEstimated: unit.quantityEstimated ? 1 : 0,
      batchNote: unit.batchNote?.trim() || null,
    }))
    .filter((unit) => unit.storageUnitId);
}

export function createInventoryPayload(inventoryForm) {
  const fraction = parseRemainingFraction(inventoryForm.remainingFraction);

  return {
    productId: Number(inventoryForm.productId),
    storageUnitId: Number(inventoryForm.storageUnitId),
    storageCompartmentId: inventoryForm.storageCompartmentId
      ? Number(inventoryForm.storageCompartmentId)
      : null,

    originalQuantity: inventoryForm.originalQuantity
      ? Number(inventoryForm.originalQuantity)
      : null,
    originalUnit: inventoryForm.originalUnit || null,
    remainingQuantity: inventoryForm.remainingQuantity
      ? Number(inventoryForm.remainingQuantity)
      : null,
    remainingUnit: inventoryForm.remainingUnit || null,
    remainingFractionNumerator: fraction.numerator,
    remainingFractionDenominator: fraction.denominator,
    quantityEstimated: inventoryForm.quantityEstimated ? 1 : 0,

    packageState: inventoryForm.packageState,
    bestBeforeDate: inventoryForm.bestBeforeDate || null,
    frozenDate: inventoryForm.frozenDate || null,
    openedDate: inventoryForm.openedDate || null,
    isFrozenChilledFood: inventoryForm.isFrozenChilledFood ? 1 : 0,
    internalExtensionMonths: inventoryForm.internalExtensionMonths
      ? Number(inventoryForm.internalExtensionMonths)
      : 6,
    notes: inventoryForm.notes.trim() || null,

    inventoryBatchCode: inventoryForm.inventoryBatchCode?.trim() || null,
    batchPosition: inventoryForm.batchPosition
      ? Number(inventoryForm.batchPosition)
      : null,
    batchTotal: inventoryForm.batchTotal ? Number(inventoryForm.batchTotal) : null,
    batchNote: inventoryForm.batchNote?.trim() || null,

    createMultipleItems: inventoryForm.createMultipleItems ? 1 : 0,
    batchUnits: inventoryForm.createMultipleItems
      ? normalizeInventoryBatchUnits(inventoryForm.batchUnits)
      : [],
  };
}

export function createInventoryEditStateFromItem(item) {
  const remainingFraction =
    item.remaining_fraction_numerator && item.remaining_fraction_denominator
      ? `${item.remaining_fraction_numerator}/${item.remaining_fraction_denominator}`
      : "";

  return {
    productId: item.product_id ? String(item.product_id) : "",
    storageUnitId: item.storage_unit_id ? String(item.storage_unit_id) : "",
    storageCompartmentId: item.storage_compartment_id
      ? String(item.storage_compartment_id)
      : "",

    originalQuantity:
      item.original_quantity !== null && item.original_quantity !== undefined
        ? String(item.original_quantity)
        : "",
    originalUnit: item.original_unit || "g",

    remainingQuantity:
      item.remaining_quantity !== null && item.remaining_quantity !== undefined
        ? String(item.remaining_quantity)
        : "",
    remainingUnit: item.remaining_unit || item.original_unit || "g",
    remainingFraction,
    quantityEstimated: item.quantity_estimated === 1,

    packageState: item.package_state || "ungeoeffnet",
    bestBeforeDate: item.best_before_date || "",
    frozenDate: item.frozen_date || "",
    openedDate: item.opened_date || "",
    isFrozenChilledFood: item.is_frozen_chilled_food === 1,
    internalExtensionMonths: item.internal_extension_months
      ? String(item.internal_extension_months)
      : "6",
    notes: item.notes || "",

    inventoryBatchCode: item.inventory_batch_code || "",
    batchPosition:
      item.batch_position !== null && item.batch_position !== undefined
        ? String(item.batch_position)
        : "",
    batchTotal:
      item.batch_total !== null && item.batch_total !== undefined
        ? String(item.batch_total)
        : "",
    batchNote: item.batch_note || "",

    createMultipleItems: false,
    batchUnits: [],
  };
}
