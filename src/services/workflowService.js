export function approveProposal(state, documentId) {
  const documentItem = state.documents.find((doc) => doc.id === documentId);
  if (!documentItem) return state;

  documentItem.status = "auto";
  documentItem.confidence = Math.max(documentItem.confidence, 0.9);
  documentItem.reviewReason = "";
  return state;
}

export function syncBankFeed(state) {
  state.transactions = [
    {
      id: `bank-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      name: "New bank transaction",
      amount: -49.95,
      matched: false,
      cashCategory: "unclassified"
    },
    ...state.transactions
  ];

  return state;
}
