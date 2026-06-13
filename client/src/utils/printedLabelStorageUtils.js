import {
  compareLabelCodes,
  createLabelCode,
  normalizeLabelCode,
  parseLabelNumber,
} from "./labelPoolUtils";

import { PRINTED_LABEL_CODES_STORAGE_KEY } from "../constants/localStorageKeys";

export function loadPrintedLabelCodes() {
  try {
    const storedValue = window.localStorage.getItem(
      PRINTED_LABEL_CODES_STORAGE_KEY,
    );

    if (!storedValue) {
      return [];
    }

    const parsedValue = JSON.parse(storedValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return normalizePrintedLabelCodes(parsedValue);
  } catch (error) {
    console.error(error);
    return [];
  }
}

export function savePrintedLabelCodes(labelCodes) {
  const uniqueLabelCodes = normalizePrintedLabelCodes(labelCodes);

  window.localStorage.setItem(
    PRINTED_LABEL_CODES_STORAGE_KEY,
    JSON.stringify(uniqueLabelCodes),
  );

  return uniqueLabelCodes;
}

export function addPrintedLabelCodes(existingLabelCodes, nextLabelCodes) {
  return savePrintedLabelCodes([...existingLabelCodes, ...nextLabelCodes]);
}

export function removePrintedLabelCodes(existingLabelCodes, labelCodesToRemove) {
  const normalizedLabelCodesToRemove = new Set(
    normalizePrintedLabelCodes(labelCodesToRemove),
  );

  return savePrintedLabelCodes(
    existingLabelCodes.filter(
      (labelCode) => !normalizedLabelCodesToRemove.has(normalizeLabelCode(labelCode)),
    ),
  );
}

export function clearPrintedLabelCodes() {
  window.localStorage.removeItem(PRINTED_LABEL_CODES_STORAGE_KEY);

  return [];
}

export function parseLabelCodeSelection(inputValue) {
  return String(inputValue || "")
    .split(/[\s,;]+/)
    .flatMap(parseLabelCodeSelectionPart)
    .filter(Boolean)
    .sort(compareLabelCodes);
}

function parseLabelCodeSelectionPart(inputPart) {
  const normalizedInputPart = String(inputPart || "").trim().toUpperCase();

  if (!normalizedInputPart) {
    return [];
  }

  if (normalizedInputPart.includes("-")) {
    return parseLabelCodeRange(normalizedInputPart);
  }

  const normalizedLabelCode = normalizeLabelCode(normalizedInputPart);

  return normalizedLabelCode ? [normalizedLabelCode] : [];
}

function parseLabelCodeRange(inputPart) {
  const [rawStartCode, rawEndCode] = inputPart
    .split("-")
    .map((part) => part.trim());

  const startNumber = parseLabelNumber(rawStartCode);
  const endNumber = parseLabelNumber(rawEndCode);

  if (!startNumber || !endNumber) {
    return [];
  }

  const firstNumber = Math.min(startNumber, endNumber);
  const lastNumber = Math.max(startNumber, endNumber);

  return Array.from(
    { length: lastNumber - firstNumber + 1 },
    (_, index) => createLabelCode(firstNumber + index),
  );
}

function normalizePrintedLabelCodes(labelCodes) {
  return Array.from(
    new Set(labelCodes.map(normalizeLabelCode).filter(Boolean)),
  ).sort(compareLabelCodes);
}