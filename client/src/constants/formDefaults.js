// client/src/constants/formDefaults.js

export const emptyProductForm = {
  name: "",
  brand: "",
  category: "",
  country: "",
  store: "",
  buyAgainStatus: "neutral",
  rating: "",
  notes: "",
  favorite: false,

  // Produktfotos gehören zum Produktstamm, nicht zum einzelnen Bestandseintrag.
  // Aktuell werden Fotos als Data-URL in der SQLite-Datenbank gespeichert.
  // imageFront ist das Hauptfoto, imageBack ist für ein späteres Rückseitenfoto vorbereitet.
  imageFront: "",
  imageBack: "",
};

export const emptyInventoryForm = {
  productId: "",
  storageUnitId: "",
  storageCompartmentId: "",
  originalQuantity: "",
  originalUnit: "g",
  remainingQuantity: "",
  remainingUnit: "g",
  remainingFraction: "",
  quantityEstimated: false,
  packageState: "ungeoeffnet",
  bestBeforeDate: "",
  frozenDate: "",
  openedDate: "",
  isFrozenChilledFood: false,
  internalExtensionMonths: "6",
  notes: "",
};