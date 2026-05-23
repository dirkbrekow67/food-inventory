// client/src/utils/labelPoolUtils.js

export const LABEL_PREFIX = "F";
export const LABEL_CODE_LENGTH = 3;
export const LABELS_PER_SHEET = 36;

export function createLabelCode(number) {
  const normalizedNumber = Number(number);

  if (!Number.isFinite(normalizedNumber) || normalizedNumber < 1) {
    return "";
  }

  return `${LABEL_PREFIX}${String(Math.trunc(normalizedNumber)).padStart(
    LABEL_CODE_LENGTH,
    "0",
  )}`;
}

export function parseLabelNumber(labelCode) {
  const match = String(labelCode || "")
    .trim()
    .toUpperCase()
    .match(/^F(\d+)$/);

  if (!match) {
    return null;
  }

  const labelNumber = Number(match[1]);

  if (!Number.isFinite(labelNumber) || labelNumber < 1) {
    return null;
  }

  return labelNumber;
}

export function normalizeLabelCode(labelCode) {
  const labelNumber = parseLabelNumber(labelCode);

  if (!labelNumber) {
    return "";
  }

  return createLabelCode(labelNumber);
}

export function getUsedLabelCodes(inventoryItems) {
  return Array.from(
    new Set(
      inventoryItems
        .map((item) => normalizeLabelCode(item.label_code))
        .filter(Boolean),
    ),
  ).sort(compareLabelCodes);
}

export function getBlockedLabelCodes(inventoryItems, printedLabelCodes = []) {
  return Array.from(
    new Set([
      ...getUsedLabelCodes(inventoryItems),
      ...printedLabelCodes.map(normalizeLabelCode).filter(Boolean),
    ]),
  ).sort(compareLabelCodes);
}

export function getHighestUsedLabelNumber(inventoryItems, printedLabelCodes = []) {
  return getBlockedLabelCodes(inventoryItems, printedLabelCodes).reduce(
    (highestNumber, labelCode) => {
      const labelNumber = parseLabelNumber(labelCode);

      if (!labelNumber) {
        return highestNumber;
      }

      return Math.max(highestNumber, labelNumber);
    },
    0,
  );
}

export function getReusableFreeLabelCodes(inventoryItems, printedLabelCodes = []) {
  const blockedLabelCodes = new Set(
    getBlockedLabelCodes(inventoryItems, printedLabelCodes),
  );
  const usedLabelCodes = new Set(getUsedLabelCodes(inventoryItems));
  const highestBlockedLabelNumber = getHighestUsedLabelNumber(
    inventoryItems,
    printedLabelCodes,
  );

  if (highestBlockedLabelNumber === 0) {
    return [];
  }

  return Array.from({ length: highestBlockedLabelNumber }, (_, index) =>
    createLabelCode(index + 1),
  ).filter(
    (labelCode) =>
      !blockedLabelCodes.has(labelCode) && !usedLabelCodes.has(labelCode),
  );
}

export function createNextNewLabelCodes(
  inventoryItems,
  count,
  printedLabelCodes = [],
) {
  const highestUsedLabelNumber = getHighestUsedLabelNumber(
    inventoryItems,
    printedLabelCodes,
  );

  return Array.from({ length: count }, (_, index) =>
    createLabelCode(highestUsedLabelNumber + index + 1),
  );
}

export function createNextLabelSheetCodes(inventoryItems, printedLabelCodes = []) {
  const reusableFreeLabelCodes = getReusableFreeLabelCodes(
    inventoryItems,
    printedLabelCodes,
  );
  const reusableCodesForSheet = reusableFreeLabelCodes.slice(0, LABELS_PER_SHEET);
  const missingCodeCount = LABELS_PER_SHEET - reusableCodesForSheet.length;

  return [
    ...reusableCodesForSheet,
    ...createNextNewLabelCodes(inventoryItems, missingCodeCount, printedLabelCodes),
  ];
}

export function createManualLabelSheetCodes(startNumber) {
  const normalizedStartNumber = Number(startNumber) || 1;

  return Array.from({ length: LABELS_PER_SHEET }, (_, index) =>
    createLabelCode(normalizedStartNumber + index),
  );
}

export function compareLabelCodes(firstLabelCode, secondLabelCode) {
  const firstNumber = parseLabelNumber(firstLabelCode) || 0;
  const secondNumber = parseLabelNumber(secondLabelCode) || 0;

  return firstNumber - secondNumber;
}
