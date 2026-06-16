// client/src/api/inventoryApi.js

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
