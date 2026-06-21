// client/src/utils/shoppingHistoryDecisionUtils.js

export const SHOPPING_HISTORY_TRANSFER_STATUS = Object.freeze({
  NOT_APPLICABLE: "not_applicable",
  NEEDS_PRODUCT: "needs_product",
  NEEDS_QUANTITY_REVIEW: "needs_quantity_review",
  READY_FOR_MANUAL_REVIEW: "ready_for_manual_review",
});

export const SHOPPING_HISTORY_TRANSFER_TARGET = Object.freeze({
  NONE: "none",
  MANUAL_INVENTORY_REVIEW: "manual_inventory_review",
});

export function isShoppingListItemCompleted(item) {
  return item?.status === "completed";
}

export function hasShoppingListItemProductReference(item) {
  return Boolean(item?.product_id);
}

export function hasShoppingListItemQuantityInformation(item) {
  return Boolean(item?.quantity || item?.unit);
}

export function getShoppingListHistoryTransferStatus(item) {
  if (!isShoppingListItemCompleted(item)) {
    return SHOPPING_HISTORY_TRANSFER_STATUS.NOT_APPLICABLE;
  }

  if (!hasShoppingListItemProductReference(item)) {
    return SHOPPING_HISTORY_TRANSFER_STATUS.NEEDS_PRODUCT;
  }

  if (!hasShoppingListItemQuantityInformation(item)) {
    return SHOPPING_HISTORY_TRANSFER_STATUS.NEEDS_QUANTITY_REVIEW;
  }

  return SHOPPING_HISTORY_TRANSFER_STATUS.READY_FOR_MANUAL_REVIEW;
}

export function getShoppingListHistoryTransferStatusText(status) {
  if (status === SHOPPING_HISTORY_TRANSFER_STATUS.NEEDS_PRODUCT) {
    return "Produktzuordnung erforderlich";
  }

  if (status === SHOPPING_HISTORY_TRANSFER_STATUS.NEEDS_QUANTITY_REVIEW) {
    return "Menge manuell prüfen";
  }

  if (status === SHOPPING_HISTORY_TRANSFER_STATUS.READY_FOR_MANUAL_REVIEW) {
    return "Bereit für manuelle Bestandsprüfung";
  }

  return "Keine Übernahme vorgesehen";
}

export function getShoppingListHistoryTransferTargetText(target) {
  if (target === SHOPPING_HISTORY_TRANSFER_TARGET.MANUAL_INVENTORY_REVIEW) {
    return "Manuelle Bestandsprüfung";
  }

  return "Keine automatische Übernahme";
}

export function createShoppingListHistoryTransferDecision(item) {
  const status = getShoppingListHistoryTransferStatus(item);
  const canBeReviewedManually =
    status === SHOPPING_HISTORY_TRANSFER_STATUS.NEEDS_QUANTITY_REVIEW ||
    status === SHOPPING_HISTORY_TRANSFER_STATUS.READY_FOR_MANUAL_REVIEW;
  const target = canBeReviewedManually
    ? SHOPPING_HISTORY_TRANSFER_TARGET.MANUAL_INVENTORY_REVIEW
    : SHOPPING_HISTORY_TRANSFER_TARGET.NONE;

  return {
    itemId: item?.id ?? null,
    status,
    statusText: getShoppingListHistoryTransferStatusText(status),
    automaticTransferAllowed: false,
    target,
    targetText: getShoppingListHistoryTransferTargetText(target),
    canBeReviewedManually,
  };
}

export function createShoppingListHistoryTransferDecisions(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map(createShoppingListHistoryTransferDecision);
}

export function getShoppingListHistoryTransferDecisionCounts(items) {
  const decisions = createShoppingListHistoryTransferDecisions(items);

  return decisions.reduce(
    (counts, decision) => ({
      ...counts,
      total: counts.total + 1,
      reviewable: decision.canBeReviewedManually
        ? counts.reviewable + 1
        : counts.reviewable,
      [decision.status]: (counts[decision.status] || 0) + 1,
    }),
    {
      total: 0,
      reviewable: 0,
      [SHOPPING_HISTORY_TRANSFER_STATUS.NOT_APPLICABLE]: 0,
      [SHOPPING_HISTORY_TRANSFER_STATUS.NEEDS_PRODUCT]: 0,
      [SHOPPING_HISTORY_TRANSFER_STATUS.NEEDS_QUANTITY_REVIEW]: 0,
      [SHOPPING_HISTORY_TRANSFER_STATUS.READY_FOR_MANUAL_REVIEW]: 0,
    },
  );
}

export function hasShoppingListHistoryTransferReviewableItems(items) {
  return createShoppingListHistoryTransferDecisions(items).some(
    (decision) => decision.canBeReviewedManually,
  );
}
