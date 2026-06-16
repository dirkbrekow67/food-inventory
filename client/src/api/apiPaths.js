// client/src/api/apiPaths.js

export const API_QUERY_PARAM = Object.freeze({
  INCLUDE_COMPLETED: "includeCompleted",
});

export const API_PATH = Object.freeze({
  HISTORY: "/history",
  INVENTORY: "/inventory",
  LABELS: "/labels",
  PRODUCTS: "/products",
  SHOPPING_LIST: "/shopping-list",
  STORAGE: "/storage",
});

export const SHOPPING_LIST_ACTION = Object.freeze({
  COMPLETE: "complete",
  REOPEN: "reopen",
});

export const LABEL_PATH_SEGMENT = Object.freeze({
  ALL: "all",
  FREE: "free",
  MARK_PRINTED: "mark-printed",
  PRINT_STATUS: "print-status",
});

export const PRODUCT_PATH_SEGMENT = Object.freeze({
  PHOTOS: "photos",
});

export const STORAGE_PATH_SEGMENT = Object.freeze({
  COMPARTMENTS: "compartments",
  GENERATE: "generate",
  INACTIVE: "inactive",
  LOCATIONS: "locations",
  REACTIVATE: "reactivate",
  TREE: "tree",
  UNITS: "units",
});