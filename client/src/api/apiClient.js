// client/src/api/apiClient.js

import { API_BASE_URL } from "../config/apiConfig";

export const API_METHOD = Object.freeze({
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATCH: "PATCH",
  DELETE: "DELETE",
});

const API_HEADER = Object.freeze({
  ACCEPT: "Accept",
  CONTENT_TYPE: "Content-Type",
});

const API_CONTENT_TYPE = Object.freeze({
  JSON: "application/json",
});

const API_ERROR_FALLBACK_MESSAGE = "API-Anfrage fehlgeschlagen.";

const API_ERROR_FIELD_NAMES = Object.freeze(["error", "message", "detail"]);

const API_STATUS = Object.freeze({
  NO_CONTENT: 204,
});

function createHeaders(extraHeaders = {}) {
  return {
    [API_HEADER.ACCEPT]: API_CONTENT_TYPE.JSON,
    ...extraHeaders,
  };
}

function createBaseHeaders() {
  return createHeaders();
}

function createJsonHeaders() {
  return createHeaders({
    [API_HEADER.CONTENT_TYPE]: API_CONTENT_TYPE.JSON,
  });
}

export function createRequest(method) {
  return {
    method,
    headers: createBaseHeaders(),
  };
}

export function createJsonRequest(method, payload) {
  return {
    method,
    headers: createJsonHeaders(),
    body: JSON.stringify(payload),
  };
}

function createApiUrl(path) {
  return `${API_BASE_URL}${path}`;
}

function parseJsonText(responseText) {
  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText);
  } catch (error) {
    console.error(error);
    return null;
  }
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function getFirstNonEmptyString(...values) {
  return values.find(isNonEmptyString);
}

function getApiErrorFieldValue(responseData, fieldName) {
  if (!responseData || typeof responseData !== "object") {
    return undefined;
  }

  return responseData[fieldName];
}

function createApiErrorMessage(responseData, fallbackMessage) {
  const responseMessages = API_ERROR_FIELD_NAMES.map((fieldName) =>
    getApiErrorFieldValue(responseData, fieldName),
  );

  return (
    getFirstNonEmptyString(...responseMessages, fallbackMessage) ||
    API_ERROR_FALLBACK_MESSAGE
  );
}

function createNetworkError(errorMessage, error) {
  return new Error(errorMessage, { cause: error });
}

function createApiHttpError(responseData, errorMessage) {
  return new Error(createApiErrorMessage(responseData, errorMessage));
}

async function readResponseText(response) {
  return response.text();
}

function isNoContentResponse(response) {
  return response.status === API_STATUS.NO_CONTENT;
}

function hasEmptyResponseText(responseText) {
  return !responseText;
}

function isEmptyResponse(response, responseText) {
  return isNoContentResponse(response) || hasEmptyResponseText(responseText);
}

export async function fetchJson(
  path,
  errorMessage,
  options = createRequest(API_METHOD.GET),
) {
  let response;

  try {
    response = await fetch(createApiUrl(path), options);
  } catch (error) {
    console.error(error);
    throw createNetworkError(errorMessage, error);
  }

  const responseText = await readResponseText(response);
  const responseData = parseJsonText(responseText);

  if (!response.ok) {
    throw createApiHttpError(responseData, errorMessage);
  }

  if (isEmptyResponse(response, responseText)) {
    return null;
  }

  return responseData;
}
