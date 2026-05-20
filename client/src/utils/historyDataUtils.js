// historyDataUtils.js
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

export function createInitialHistoryEditState() {
  return {
    historyEditReason: "sonstiges",
    historyEditBuyAgainStatus: "neutral",
    historyEditExperienceReason: "keine",
    historyEditExperienceNote: "",
    historyEditNotes: "",
  };
}

export function createHistoryEditStateFromItem(item) {
  return {
    historyEditReason: item.removal_reason || "sonstiges",
    historyEditBuyAgainStatus:
      item.product_buy_again_status_after_removal || "neutral",
    historyEditExperienceReason: item.experience_reason || "keine",
    historyEditExperienceNote: item.experience_note || "",
    historyEditNotes: item.notes || "",
  };
}