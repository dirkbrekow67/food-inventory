//removalDataUtils.js
export function createRemovalPayload({
  removalReason,
  removalProductStatus,
  saveRemovalToHistory,
  experienceReason,
  experienceNote,
}) {
  return {
    removalReason,
    productBuyAgainStatus:
      removalProductStatus === "unverändert" ? null : removalProductStatus,
    saveToHistory: saveRemovalToHistory,
    experienceReason,
    experienceNote,
  };
}

export function createInitialRemovalState() {
  return {
    removalReason: "verbraucht",
    removalProductStatus: "unverändert",
    saveRemovalToHistory: false,
    experienceReason: "keine",
    experienceNote: "",
  };
}