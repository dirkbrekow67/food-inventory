// client/src/api/inventoryApiPaths.js

import {
  API_PATH,
  API_QUERY_PARAM,
  LABEL_PATH_SEGMENT,
  PRODUCT_PATH_SEGMENT,
  SHOPPING_LIST_ACTION,
  STORAGE_PATH_SEGMENT,
} from "./apiPaths";

import {
  createBooleanQueryString,
  createPathWithId,
  createPathWithSegments,
} from "./apiPathHelpers";

function createShoppingListQuery(includeCompleted) {
  return createBooleanQueryString(
    API_QUERY_PARAM.INCLUDE_COMPLETED,
    includeCompleted,
  );
}

export function createLabelMarkPrintedPath() {
  return createPathWithSegments(API_PATH.LABELS, LABEL_PATH_SEGMENT.MARK_PRINTED);
}

export function createLabelPrintStatusPath(labelCode) {
  return createPathWithSegments(
    API_PATH.LABELS,
    labelCode,
    LABEL_PATH_SEGMENT.PRINT_STATUS,
  );
}

export function createFreeLabelsPath() {
  return createPathWithSegments(API_PATH.LABELS, LABEL_PATH_SEGMENT.FREE);
}

export function createResetFreeLabelsPath() {
  return createPathWithSegments(
    API_PATH.LABELS,
    LABEL_PATH_SEGMENT.FREE,
    LABEL_PATH_SEGMENT.ALL,
  );
}

export function createProductItemPath(productId) {
  return createPathWithId(API_PATH.PRODUCTS, productId);
}

export function createProductPhotosPath() {
  return createPathWithSegments(API_PATH.PRODUCTS, PRODUCT_PATH_SEGMENT.PHOTOS);
}

export function createInventoryItemPath(inventoryItemId) {
  return createPathWithId(API_PATH.INVENTORY, inventoryItemId);
}

export function createHistoryItemPath(historyItemId) {
  return createPathWithId(API_PATH.HISTORY, historyItemId);
}

export function createStorageTreePath() {
  return createPathWithSegments(API_PATH.STORAGE, STORAGE_PATH_SEGMENT.TREE);
}

export function createInactiveStoragePath() {
  return createPathWithSegments(API_PATH.STORAGE, STORAGE_PATH_SEGMENT.INACTIVE);
}

export function createStorageLocationsPath() {
  return createPathWithSegments(API_PATH.STORAGE, STORAGE_PATH_SEGMENT.LOCATIONS);
}

export function createStorageLocationItemPath(locationId) {
  return createPathWithId(createStorageLocationsPath(), locationId);
}

export function createStorageLocationReactivatePath(locationId) {
  return createPathWithSegments(
    createStorageLocationItemPath(locationId),
    STORAGE_PATH_SEGMENT.REACTIVATE,
  );
}

export function createStorageUnitsPath() {
  return createPathWithSegments(API_PATH.STORAGE, STORAGE_PATH_SEGMENT.UNITS);
}

export function createStorageUnitItemPath(unitId) {
  return createPathWithId(createStorageUnitsPath(), unitId);
}

export function createStorageUnitReactivatePath(unitId) {
  return createPathWithSegments(
    createStorageUnitItemPath(unitId),
    STORAGE_PATH_SEGMENT.REACTIVATE,
  );
}

export function createStorageUnitCompartmentsPath(unitId) {
  return createPathWithSegments(
    createStorageUnitItemPath(unitId),
    STORAGE_PATH_SEGMENT.COMPARTMENTS,
  );
}

export function createStorageUnitGenerateCompartmentsPath(unitId) {
  return createPathWithSegments(
    createStorageUnitCompartmentsPath(unitId),
    STORAGE_PATH_SEGMENT.GENERATE,
  );
}

export function createStorageCompartmentsPath() {
  return createPathWithSegments(
    API_PATH.STORAGE,
    STORAGE_PATH_SEGMENT.COMPARTMENTS,
  );
}

export function createStorageCompartmentItemPath(compartmentId) {
  return createPathWithId(createStorageCompartmentsPath(), compartmentId);
}

export function createStorageCompartmentReactivatePath(compartmentId) {
  return createPathWithSegments(
    createStorageCompartmentItemPath(compartmentId),
    STORAGE_PATH_SEGMENT.REACTIVATE,
  );
}

export function createShoppingListPath(includeCompleted) {
  return `${API_PATH.SHOPPING_LIST}${createShoppingListQuery(includeCompleted)}`;
}

export function createShoppingListItemPath(itemId) {
  return createPathWithId(API_PATH.SHOPPING_LIST, itemId);
}

export function createShoppingListActionPath(itemId, action) {
  return `${createShoppingListItemPath(itemId)}/${action}`;
}

export function createShoppingListCompletePath(itemId) {
  return createShoppingListActionPath(itemId, SHOPPING_LIST_ACTION.COMPLETE);
}

export function createShoppingListReopenPath(itemId) {
  return createShoppingListActionPath(itemId, SHOPPING_LIST_ACTION.REOPEN);
}