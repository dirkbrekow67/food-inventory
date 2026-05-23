const PRINTED_LABEL_CODES_STORAGE_KEY = "food-inventory.printedLabelCodes";

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

    return parsedValue.filter(Boolean);
  } catch (error) {
    console.error(error);
    return [];
  }
}

export function savePrintedLabelCodes(labelCodes) {
  const uniqueLabelCodes = Array.from(new Set(labelCodes.filter(Boolean)));

  window.localStorage.setItem(
    PRINTED_LABEL_CODES_STORAGE_KEY,
    JSON.stringify(uniqueLabelCodes),
  );

  return uniqueLabelCodes;
}

export function addPrintedLabelCodes(existingLabelCodes, nextLabelCodes) {
  return savePrintedLabelCodes([...existingLabelCodes, ...nextLabelCodes]);
}
