// client/src/api/inventoryApi.js

// Kompatibilitätsdatei für ältere Imports.
// Neue Komponenten sollen direkt aus den Fach-APIs importieren,
// z. B. productApi.js, storageApi.js, labelApi.js,
// inventoryItemsApi.js, historyApi.js oder shoppingListApi.js.

export {
  deleteHistoryItemById,
  loadHistoryItems,
  updateHistoryItemById,
} from "./historyApi";

export {
  createInventoryItem,
  loadInventoryItems,
  removeInventoryItemById,
  updateInventoryItemById,
} from "./inventoryItemsApi";

export {
  loadLabelSlots,
  markLabelCodesAsPrinted,
  releaseFreeLabelCodes,
  resetFreeLabelCodes,
  updateLabelPrintStatus,
} from "./labelApi";

export {
  deactivateProductById,
  loadProducts,
  saveProduct,
  uploadProductPhoto,
} from "./productApi";

export {
  createShoppingListItem,
  completeShoppingListItemById,
  deleteShoppingListItemById,
  loadShoppingListItems,
  reopenShoppingListItemById,
  updateShoppingListItemById,
} from "./shoppingListApi";

export {
  createStorageCompartment,
  createStorageLocation,
  createStorageUnit,
  deactivateStorageCompartmentById,
  deactivateStorageLocationById,
  deactivateStorageUnitById,
  generateStorageCompartments,
  loadInactiveStorageItems,
  loadStorageTree,
  reactivateStorageCompartmentById,
  reactivateStorageLocationById,
  reactivateStorageUnitById,
} from "./storageApi";
