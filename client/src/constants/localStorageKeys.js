// client/src/constants/localStorageKeys.js

export const PRINTED_LABEL_CODES_STORAGE_KEY =
  "food-inventory.printedLabelCodes";

export const PRODUCT_FILTER_STORAGE_KEY = "food-inventory.productFilters";

export const INVENTORY_PRODUCTS_VISIBILITY_STORAGE_KEY =
  "food-inventory.showProductsInInventoryView";

export const PRODUCT_FORM_DRAFT_STORAGE_KEY =
  "food-inventory.productFormDraft";

export const INVENTORY_FORM_DRAFT_STORAGE_KEY =
  "food-inventory.inventoryFormDraft";

export const INVENTORY_FILTER_STORAGE_KEY =
  "food-inventory.inventoryFilters";

export const HISTORY_FILTER_STORAGE_KEY = "food-inventory.historyFilters";

export const ACTIVE_SECTION_STORAGE_KEY = "food-inventory.activeSection";

export const FILTER_AND_VIEW_STORAGE_KEYS = [
  PRODUCT_FILTER_STORAGE_KEY,
  INVENTORY_FILTER_STORAGE_KEY,
  HISTORY_FILTER_STORAGE_KEY,
  INVENTORY_PRODUCTS_VISIBILITY_STORAGE_KEY,
  ACTIVE_SECTION_STORAGE_KEY,
];

export const FORM_DRAFT_STORAGE_KEYS = [
  PRODUCT_FORM_DRAFT_STORAGE_KEY,
  INVENTORY_FORM_DRAFT_STORAGE_KEY,
];

export const PRINTED_LABEL_STORAGE_KEYS = [PRINTED_LABEL_CODES_STORAGE_KEY];

export const ALL_FOOD_INVENTORY_LOCAL_STORAGE_KEYS = [
  ...FILTER_AND_VIEW_STORAGE_KEYS,
  ...FORM_DRAFT_STORAGE_KEYS,
  ...PRINTED_LABEL_STORAGE_KEYS,
];
