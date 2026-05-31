// client/src/utils/formattersUtils.js

export function getBuyAgainLabel(status) {
  switch (status) {
    case "wieder_kaufen":
      return "Wieder kaufen";
    case "nicht_wieder_kaufen":
      return "Nicht wieder kaufen";
    case "testen":
      return "Erst testen";
    default:
      return "Neutral";
  }
}

export function getPackageStateLabel(state) {
  switch (state) {
    case "angebrochen":
      return "Angebrochen";
    case "portioniert":
      return "Portioniert";
    default:
      return "Ungeöffnet";
  }
}

export function formatQuantity(item) {
  const parts = [];

  if (item.remaining_quantity && item.remaining_unit) {
    parts.push(
      `${item.quantity_estimated ? "ca. " : ""}${item.remaining_quantity} ${item.remaining_unit}`,
    );
  }

  if (
    item.remaining_fraction_numerator &&
    item.remaining_fraction_denominator
  ) {
    parts.push(
      `${item.remaining_fraction_numerator}/${item.remaining_fraction_denominator}`,
    );
  }

  if (parts.length > 0) {
    return parts.join(" · ");
  }

  if (item.original_quantity && item.original_unit) {
    return `${item.original_quantity} ${item.original_unit}`;
  }

  return "Menge nicht angegeben";
}

export function formatDateGerman(dateString) {
  if (!dateString) {
    return "";
  }

  const [year, month, day] = dateString.split("-");

  if (!year || !month || !day) {
    return dateString;
  }

  return `${day}.${month}.${year}`;
}

export function getInventoryEffectiveDate(item) {
  return (
    item.effective_use_date ||
    item.internal_use_until_date ||
    item.best_before_date ||
    ""
  );
}

export function getInventoryDateStatus(item) {
  const effectiveDate = getInventoryEffectiveDate(item);

  if (!effectiveDate) {
    return "no_date";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(`${effectiveDate}T00:00:00`);

  if (Number.isNaN(targetDate.getTime())) {
    return "no_date";
  }

  const differenceInMs = targetDate.getTime() - today.getTime();
  const differenceInDays = Math.ceil(differenceInMs / (1000 * 60 * 60 * 24));

  if (differenceInDays < 0) {
    return "expired";
  }

  if (differenceInDays <= 30) {
    return "soon";
  }

  return "ok";
}

export function getInventoryDateStatusLabel(status) {
  switch (status) {
    case "expired":
      return "Abgelaufen";
    case "soon":
      return "Bald fällig";
    case "ok":
      return "OK";
    default:
      return "Ohne Datum";
  }
}

export function getRemovalReasonLabel(reason) {
  switch (reason) {
    case "verbraucht":
      return "Verbraucht";
    case "abgelaufen":
      return "Abgelaufen";
    case "entsorgt":
      return "Entsorgt";
    case "falsch_erfasst":
      return "Falsch erfasst";
    case "verschenkt":
      return "Verschenkt";
    case "sonstiges":
      return "Sonstiges";
    default:
      return "Unbekannt";
  }
}

export function getExperienceReasonLabel(reason) {
  switch (reason) {
    case "zu_viel_gekauft":
      return "Zu viel gekauft";
    case "kein_bedarf":
      return "Kein Bedarf";
    case "vergessen_uebersehen":
      return "Vergessen / übersehen";
    case "lagerort_unguenstig":
      return "Lagerort ungünstig";
    case "qualitaet_schlecht":
      return "Qualität schlecht";
    case "rezeptur_geschmack_veraendert":
      return "Rezeptur / Geschmack verändert";
    case "preis_leistung_schlecht":
      return "Preis-Leistung schlecht";
    case "sonstiges":
      return "Sonstiges";
    case "keine":
    default:
      return "Keine besondere Erkenntnis";
  }
}