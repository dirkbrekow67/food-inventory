// client/src/api/inventoryItemsApi.js

import {
  API_METHOD,
  createJsonRequest,
  fetchJson,
} from "./apiClient";

import { API_PATH } from "./apiPaths";

import { createInventoryItemPath } from "./inventoryApiPaths";

export function loadInventoryItems() {
  return fetchJson(API_PATH.INVENTORY, "Bestand konnte nicht geladen werden.");
}

export function createInventoryItem(payload) {
  return fetchJson(
    API_PATH.INVENTORY,
    "Bestand konnte nicht gespeichert werden.",
    createJsonRequest(API_METHOD.POST, payload),
  );
}

export function updateInventoryItemById(inventoryItemId, payload) {
  return fetchJson(
    createInventoryItemPath(inventoryItemId),
    "Bestandseintrag konnte nicht gespeichert werden.",
    createJsonRequest(API_METHOD.PUT, payload),
  );
}

export function removeInventoryItemById(inventoryItemId, payload) {
  return fetchJson(
    createInventoryItemPath(inventoryItemId),
    "Bestand konnte nicht entfernt werden.",
    createJsonRequest(API_METHOD.DELETE, payload),
  );
}
