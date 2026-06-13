// client/src/constants/selectOptions.js

export const productCategoryOptions = [
  { value: "", label: "Kategorie auswählen" },
  { value: "Tiefkühlware", label: "Tiefkühlware" },
  { value: "Kühlware", label: "Kühlware" },
  { value: "Vorrat", label: "Vorrat" },
  { value: "Konserve", label: "Konserve" },
  { value: "Trockenware", label: "Trockenware" },
  { value: "Getränk", label: "Getränk" },
  { value: "Obst und Gemüse", label: "Obst und Gemüse" },
  { value: "Gewürz", label: "Gewürz" },
  { value: "Backware", label: "Backware" },
  { value: "Süßware", label: "Süßware" },
  { value: "Haushalt", label: "Haushalt" },
  { value: "Sonstiges", label: "Sonstiges" },
];

export const productSortOptions = [
  { value: "name_asc", label: "Produktname A–Z" },
  { value: "name_desc", label: "Produktname Z–A" },
  { value: "id_desc", label: "Zuletzt angelegt zuerst" },
  { value: "id_asc", label: "Älteste zuerst" },
  { value: "category_asc", label: "Kategorie A–Z" },
  { value: "country_asc", label: "Land A–Z" },
  { value: "store_asc", label: "Geschäft A–Z" },
  { value: "rating_desc", label: "Beste Bewertung zuerst" },
];

export const buyAgainStatusOptions = [
  { value: "neutral", label: "Neutral" },
  { value: "wieder_kaufen", label: "Wieder kaufen" },
  { value: "nicht_wieder_kaufen", label: "Nicht wieder kaufen" },
  { value: "testen", label: "Erst testen" },
];

export const ratingOptions = [
  { value: "", label: "Keine Bewertung" },
  { value: "1", label: "1/5" },
  { value: "2", label: "2/5" },
  { value: "3", label: "3/5" },
  { value: "4", label: "4/5" },
  { value: "5", label: "5/5" },
];

export const quantityUnitOptions = [
  { value: "g", label: "g" },
  { value: "kg", label: "kg" },
  { value: "ml", label: "ml" },
  { value: "l", label: "l" },
  { value: "Stück", label: "Stück" },
  { value: "Packung", label: "Packung" },
  { value: "Becher", label: "Becher" },
  { value: "Dose", label: "Dose" },
  { value: "Glas", label: "Glas" },
  { value: "Flasche", label: "Flasche" },
  { value: "Beutel", label: "Beutel" },
  { value: "Bund", label: "Bund" },
  { value: "Portion", label: "Portion" },
];

export const remainingFractionOptions = [
  { value: "", label: "Kein Anteil" },
  { value: "1/1", label: "voll" },
  { value: "3/4", label: "3/4" },
  { value: "1/2", label: "1/2" },
  { value: "1/4", label: "1/4" },
];

export const packageStateOptions = [
  { value: "ungeoeffnet", label: "Ungeöffnet" },
  { value: "angebrochen", label: "Angebrochen" },
  { value: "portioniert", label: "Portioniert" },
];

export const internalExtensionMonthOptions = [
  { value: "3", label: "+ 3 Monate" },
  { value: "6", label: "+ 6 Monate" },
  { value: "12", label: "+ 12 Monate" },
];

export const inventoryStatusFilterOptions = [
  { value: "all", label: "Alle" },
  { value: "ok", label: "OK" },
  { value: "soon", label: "Bald fällig" },
  { value: "expired", label: "Abgelaufen" },
  { value: "no_date", label: "Ohne Datum" },
];

export const inventorySortOptions = [
  { value: "label_desc", label: "Etikett-ID absteigend" },
  { value: "label_asc", label: "Etikett-ID aufsteigend" },
  { value: "date_asc", label: "MHD / Frist zuerst" },
  { value: "product_asc", label: "Produktname A–Z" },
  { value: "storage_asc", label: "Lagerort A–Z" },
];

export const removalReasonOptions = [
  { value: "verbraucht", label: "Verbraucht" },
  { value: "abgelaufen", label: "Abgelaufen" },
  { value: "entsorgt", label: "Entsorgt" },
  { value: "falsch_erfasst", label: "Falsch erfasst" },
  { value: "verschenkt", label: "Verschenkt" },
  { value: "sonstiges", label: "Sonstiges" },
];

export const historyRemovalReasonFilterOptions = [
  { value: "all", label: "Alle Gründe" },
  { value: "verbraucht", label: "Verbraucht" },
  { value: "abgelaufen", label: "Abgelaufen" },
  { value: "entsorgt", label: "Entsorgt" },
  { value: "verschenkt", label: "Verschenkt" },
  { value: "sonstiges", label: "Sonstiges" },
];

export const removalProductStatusOptions = [
  { value: "unverändert", label: "Unverändert" },
  { value: "wieder_kaufen", label: "Wieder kaufen" },
  { value: "nicht_wieder_kaufen", label: "Nicht wieder kaufen" },
  { value: "testen", label: "Erst testen" },
];

export const historyBuyAgainFilterOptions = [
  { value: "all", label: "Alle Bewertungen" },
  { value: "neutral", label: "Neutral" },
  { value: "wieder_kaufen", label: "Wieder kaufen" },
  { value: "nicht_wieder_kaufen", label: "Nicht wieder kaufen" },
  { value: "testen", label: "Erst testen" },
];

export const experienceReasonOptions = [
  { value: "keine", label: "Keine besondere Erkenntnis" },
  { value: "zu_viel_gekauft", label: "Zu viel gekauft" },
  { value: "kein_bedarf", label: "Kein Bedarf" },
  { value: "vergessen_uebersehen", label: "Vergessen / übersehen" },
  { value: "lagerort_unguenstig", label: "Lagerort ungünstig" },
  { value: "qualitaet_schlecht", label: "Qualität schlecht" },
  {
    value: "rezeptur_geschmack_veraendert",
    label: "Rezeptur / Geschmack verändert",
  },
  { value: "preis_leistung_schlecht", label: "Preis-Leistung schlecht" },
  { value: "sonstiges", label: "Sonstiges" },
];

export const historyEditRemovalReasonOptions = [
  { value: "verbraucht", label: "Verbraucht" },
  { value: "abgelaufen", label: "Abgelaufen" },
  { value: "entsorgt", label: "Entsorgt" },
  { value: "verschenkt", label: "Verschenkt" },
  { value: "sonstiges", label: "Sonstiges" },
];

export const batchQuantityModeOptions = [
  {
    value: "same",
    label: "Gleiche Menge je Einheit",
  },
  {
    value: "manual",
    label: "Individuelle Mengen je Einheit",
  },
];

export const labelSheetModeOptions = [
  {
    value: "pool",
    label: "Pool-Bogen automatisch",
  },
  {
    value: "manual",
    label: "Manueller Bogen",
  },
];

export const shoppingListCategorySuggestionOptions =
  productCategoryOptions.filter((option) => option.value);

export const shoppingListPriorityOptions = [
  { value: "niedrig", label: "niedrig" },
  { value: "normal", label: "normal" },
  { value: "hoch", label: "hoch" },
];