import { parseRemainingFraction } from "./inventoryDataUtils";

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
  };
}

