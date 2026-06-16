// client/src/api/historyApi.js

import {
  API_METHOD,
  createJsonRequest,
  createRequest,
  fetchJson,
} from "./apiClient";

import { API_PATH } from "./apiPaths";

import { createHistoryItemPath } from "./inventoryApiPaths";

export function loadHistoryItems() {
  return fetchJson(API_PATH.HISTORY, "Produkthistorie konnte nicht geladen werden.");
}

export function updateHistoryItemById(historyItemId, payload) {
  return fetchJson(
    createHistoryItemPath(historyItemId),
    "Historieneintrag konnte nicht gespeichert werden.",
    createJsonRequest(API_METHOD.PUT, payload),
  );
}

export function deleteHistoryItemById(historyItemId) {
  return fetchJson(
    createHistoryItemPath(historyItemId),
    "Historieneintrag konnte nicht gelöscht werden.",
    createRequest(API_METHOD.DELETE),
  );
}
