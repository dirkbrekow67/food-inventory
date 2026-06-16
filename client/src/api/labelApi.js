// client/src/api/labelApi.js

import {
  API_METHOD,
  createJsonRequest,
  createRequest,
  fetchJson,
} from "./apiClient";

import { API_PATH } from "./apiPaths";

import {
  createFreeLabelsPath,
  createLabelMarkPrintedPath,
  createLabelPrintStatusPath,
  createResetFreeLabelsPath,
} from "./inventoryApiPaths";

export function loadLabelSlots() {
  return fetchJson(API_PATH.LABELS, "Etikettenpool konnte nicht geladen werden.");
}

export function markLabelCodesAsPrinted(labelCodes) {
  return fetchJson(
    createLabelMarkPrintedPath(),
    "Etikettenbogen konnte nicht als gedruckt markiert werden.",
    createJsonRequest(API_METHOD.POST, { labelCodes }),
  );
}

export function updateLabelPrintStatus(labelCode, printStatus) {
  return fetchJson(
    createLabelPrintStatusPath(labelCode),
    "Druckstatus konnte nicht aktualisiert werden.",
    createJsonRequest(API_METHOD.PATCH, { printStatus }),
  );
}

export function releaseFreeLabelCodes(labelCodes) {
  return fetchJson(
    createFreeLabelsPath(),
    "Freie Etiketten konnten nicht entfernt werden.",
    createJsonRequest(API_METHOD.DELETE, { labelCodes }),
  );
}

export function resetFreeLabelCodes() {
  return fetchJson(
    createResetFreeLabelsPath(),
    "Freie Etiketten konnten nicht zurückgesetzt werden.",
    createRequest(API_METHOD.DELETE),
  );
}