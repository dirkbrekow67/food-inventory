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


export function getShoppingListInventoryReviewCandidateName(item) {
  return item?.product_name || item?.custom_name || "Unbenannter Einkaufslisteneintrag";
}

export function createShoppingListInventoryReviewCandidate(item) {
  const decision = createShoppingListHistoryTransferDecision(item);

  if (!decision.canBeReviewedManually) {
    return null;
  }

  return {
    shoppingListItemId: item?.id ?? null,
    productId: item?.product_id ?? null,
    name: getShoppingListInventoryReviewCandidateName(item),
    quantity: item?.quantity ?? null,
    unit: item?.unit || null,
    status: decision.status,
    statusText: decision.statusText,
    target: decision.target,
    targetText: decision.targetText,
    automaticTransferAllowed: false,
    canBeReviewedManually: decision.canBeReviewedManually,
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

export function getShoppingListHistoryTransferDecisionSummaryText(items) {
  const counts = getShoppingListHistoryTransferDecisionCounts(items);

  if (counts.total === 0) {
    return "Keine erledigten Einkaufslisteneinträge zur Prüfung vorhanden.";
  }

  if (counts.reviewable === 0) {
    return "Keine Einkaufslisteneinträge für eine manuelle Bestandsprüfung vorbereitet.";
  }

  if (counts.reviewable === 1) {
    return "1 Einkaufslisteneintrag ist für eine manuelle Bestandsprüfung vorbereitet.";
  }

  return `${counts.reviewable} Einkaufslisteneinträge sind für eine manuelle Bestandsprüfung vorbereitet.`;
}

export function getShoppingListHistoryTransferReviewableDecisions(items) {
  return createShoppingListHistoryTransferDecisions(items).filter(
    (decision) => decision.canBeReviewedManually,
  );
}

export function getShoppingListHistoryTransferReviewableItemIds(items) {
  return getShoppingListHistoryTransferReviewableDecisions(items)
    .map((decision) => decision.itemId)
    .filter((itemId) => itemId !== null);
}

export function hasShoppingListHistoryTransferReviewableItems(items) {
  return getShoppingListHistoryTransferReviewableDecisions(items).length > 0;
}
