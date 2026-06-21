// client/src/utils/shoppingListUtils.js

export {
  SHOPPING_HISTORY_TRANSFER_STATUS,
  SHOPPING_HISTORY_TRANSFER_TARGET,
  createShoppingListHistoryTransferDecision,
  getShoppingListHistoryTransferStatus,
  getShoppingListHistoryTransferStatusText,
  getShoppingListHistoryTransferTargetText,
  hasShoppingListItemProductReference,
  hasShoppingListItemQuantityInformation,
  isShoppingListItemCompleted,
} from "./shoppingHistoryDecisionUtils";

export const EMPTY_SHOPPING_LIST_FORM = Object.freeze({
  customName: "",
  quantity: "",
  unit: "",
  category: "",
  priority: "normal",
  note: "",
  isForeignPurchase: false,
});

export function getShoppingListPayloadValidationMessage(payload) {
  const hasProductId = Boolean(payload.productId);
  const hasCustomName = String(payload.customName || "").trim().length > 0;

  if (!hasProductId && !hasCustomName) {
    return "Bitte einen Artikelnamen eingeben.";
  }

  return "";
}

export function getShoppingListActionErrorMessage(error, fallbackMessage) {
  const errorMessage = String(error?.message || "").trim();

  if (errorMessage) {
    return errorMessage;
  }

  return fallbackMessage;
}

export function getShoppingListItemTitle(item) {
  return item.product_name || item.custom_name || "Unbenannter Artikel";
}

export function formatShoppingListQuantity(item) {
  const quantity = item.quantity ?? "";
  const unit = item.unit || "";

  if (!quantity && !unit) {
    return "";
  }

  return `${quantity} ${unit}`.trim();
}

export function getShoppingListItemExportLine(item) {
  const title = getShoppingListItemTitle(item);
  const quantityText = formatShoppingListQuantity(item);

  const parts = [
    title,
    quantityText,
    item.category,
    item.is_foreign_purchase === 1 ? "Ausland" : "",
    item.priority && item.priority !== "normal"
      ? `Priorität: ${item.priority}`
      : "",
    item.note ? `Notiz: ${item.note}` : "",
  ].filter(Boolean);

  return `- ${parts.join(" · ")}`;
}

export function createShoppingListExportText(items, foreignPurchaseFilter) {
  const filterLabel =
    foreignPurchaseFilter === "foreign"
      ? "Auslandseinkauf"
      : foreignPurchaseFilter === "domestic"
        ? "Normaler Einkauf"
        : "Alle offenen Einträge";

  if (items.length === 0) {
    return `Einkaufsliste – ${filterLabel}\n\nKeine offenen Einträge vorhanden.`;
  }

  const groupedItems = groupShoppingListItemsByCategory(items);
  const categoryNames = Object.keys(groupedItems).sort(compareText);

  const categoryBlocks = categoryNames.map((categoryName) => {
    const lines = groupedItems[categoryName].map(getShoppingListItemExportLine);

    return [`${categoryName}:`, ...lines].join("\n");
  });

  return [`Einkaufsliste – ${filterLabel}`, ...categoryBlocks].join("\n\n");
}

export function compareText(firstValue, secondValue) {
  return String(firstValue || "").localeCompare(
    String(secondValue || ""),
    "de",
    {
      sensitivity: "base",
      numeric: true,
    },
  );
}

export function getPriorityWeight(priority) {
  if (priority === "hoch") {
    return 0;
  }

  if (priority === "normal") {
    return 1;
  }

  return 2;
}

export function sortShoppingListItems(items) {
  return [...items].sort((firstItem, secondItem) => {
    const firstPriorityWeight = getPriorityWeight(firstItem.priority);
    const secondPriorityWeight = getPriorityWeight(secondItem.priority);

    if (firstPriorityWeight !== secondPriorityWeight) {
      return firstPriorityWeight - secondPriorityWeight;
    }

    return (
      compareText(firstItem.category, secondItem.category) ||
      compareText(
        getShoppingListItemTitle(firstItem),
        getShoppingListItemTitle(secondItem),
      ) ||
      Number(firstItem.id || 0) - Number(secondItem.id || 0)
    );
  });
}

export function groupShoppingListItemsByCategory(items) {
  return items.reduce((groups, item) => {
    const category = item.category || "Ohne Kategorie";

    if (!groups[category]) {
      groups[category] = [];
    }

    groups[category].push(item);

    return groups;
  }, {});
}

export function filterShoppingListItemsByForeignPurchase(
  items,
  foreignPurchaseFilter,
) {
  if (foreignPurchaseFilter === "foreign") {
    return items.filter((item) => item.is_foreign_purchase === 1);
  }

  if (foreignPurchaseFilter === "domestic") {
    return items.filter((item) => item.is_foreign_purchase !== 1);
  }

  return items;
}

export function createEditStateFromItem(item) {
  return {
    customName: item.custom_name || "",
    quantity: item.quantity ?? "",
    unit: item.unit || "",
    category: item.category || "",
    priority: item.priority || "normal",
    note: item.note || "",
    isForeignPurchase: item.is_foreign_purchase === 1,
  };
}

export function createShoppingListCreatePayload({
  customName,
  quantity,
  unit,
  category,
  priority,
  note,
  isForeignPurchase,
}) {
  return {
    customName,
    quantity,
    unit,
    category,
    priority,
    note,
    isForeignPurchase,
  };
}

export function createShoppingListUpdatePayload(item, editState) {
  return {
    productId: item.product_id,
    customName: editState.customName,
    quantity: editState.quantity,
    unit: editState.unit,
    category: editState.category,
    priority: editState.priority,
    note: editState.note,
    isForeignPurchase: editState.isForeignPurchase,
    status: item.status,
  };
}
