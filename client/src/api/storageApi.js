// client/src/api/storageApi.js

import {
  API_METHOD,
  createJsonRequest,
  createRequest,
  fetchJson,
} from "./apiClient";

import {
  createInactiveStoragePath,
  createStorageCompartmentItemPath,
  createStorageCompartmentReactivatePath,
  createStorageLocationItemPath,
  createStorageLocationReactivatePath,
  createStorageLocationsPath,
  createStorageTreePath,
  createStorageUnitCompartmentsPath,
  createStorageUnitGenerateCompartmentsPath,
  createStorageUnitItemPath,
  createStorageUnitReactivatePath,
  createStorageUnitsPath,
} from "./inventoryApiPaths";

export function loadStorageTree() {
  return fetchJson(createStorageTreePath(), "Lagerstruktur konnte nicht geladen werden.");
}

export function loadInactiveStorageItems() {
  return fetchJson(
    createInactiveStoragePath(),
    "Inaktive Lagerstruktur konnte nicht geladen werden.",
  );
}

export function createStorageLocation(name) {
  return fetchJson(
    createStorageLocationsPath(),
    "Standort konnte nicht gespeichert werden.",
    createJsonRequest(API_METHOD.POST, { name }),
  );
}

export function deactivateStorageLocationById(locationId) {
  return fetchJson(
    createStorageLocationItemPath(locationId),
    "Standort konnte nicht deaktiviert werden.",
    createRequest(API_METHOD.DELETE),
  );
}

export function reactivateStorageLocationById(locationId) {
  return fetchJson(
    createStorageLocationReactivatePath(locationId),
    "Standort konnte nicht reaktiviert werden.",
    createRequest(API_METHOD.PATCH),
  );
}

export function createStorageUnit(payload) {
  return fetchJson(
    createStorageUnitsPath(),
    "Lagergerät konnte nicht gespeichert werden.",
    createJsonRequest(API_METHOD.POST, payload),
  );
}

export function generateStorageCompartments(unitId, payload) {
  return fetchJson(
    createStorageUnitGenerateCompartmentsPath(unitId),
    "Fächer konnten nicht gespeichert werden.",
    createJsonRequest(API_METHOD.POST, payload),
  );
}

export function createStorageCompartment(unitId, payload) {
  return fetchJson(
    createStorageUnitCompartmentsPath(unitId),
    "Fach konnte nicht gespeichert werden.",
    createJsonRequest(API_METHOD.POST, payload),
  );
}

export function deactivateStorageUnitById(unitId) {
  return fetchJson(
    createStorageUnitItemPath(unitId),
    "Lagergerät konnte nicht deaktiviert werden.",
    createRequest(API_METHOD.DELETE),
  );
}

export function reactivateStorageUnitById(unitId) {
  return fetchJson(
    createStorageUnitReactivatePath(unitId),
    "Lagergerät konnte nicht reaktiviert werden.",
    createRequest(API_METHOD.PATCH),
  );
}

export function deactivateStorageCompartmentById(compartmentId) {
  return fetchJson(
    createStorageCompartmentItemPath(compartmentId),
    "Fach konnte nicht deaktiviert werden.",
    createRequest(API_METHOD.DELETE),
  );
}

export function reactivateStorageCompartmentById(compartmentId) {
  return fetchJson(
    createStorageCompartmentReactivatePath(compartmentId),
    "Fach konnte nicht reaktiviert werden.",
    createRequest(API_METHOD.PATCH),
  );
}
