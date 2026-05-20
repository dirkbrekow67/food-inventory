export function shouldSuggestHistory(reason, productStatus) {
  if (reason === "falsch_erfasst") {
    return false;
  }

  if (reason === "abgelaufen" || reason === "entsorgt") {
    return true;
  }

  return productStatus !== "unverändert";
}

export function createHistoryUpdatePayload({
  historyEditReason,
  historyEditBuyAgainStatus,
  historyEditExperienceReason,
  historyEditExperienceNote,
  historyEditNotes,
}) {
  return {
    removalReason: historyEditReason,
    productBuyAgainStatus: historyEditBuyAgainStatus,
    experienceReason: historyEditExperienceReason,
    experienceNote: historyEditExperienceNote,
    notes: historyEditNotes,
  };
}