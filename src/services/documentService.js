const uploadClassificationPatterns = [
  {
    sourceType: "purchase_invoice",
    displayType: "purchase invoice",
    fiscalCategory: "software_costs",
    vatCode: "input_vat_21",
    amountIncludingVat: -119.79,
    vatAmount: 20.79,
    confidence: 0.88
  },
  {
    sourceType: "sales_invoice",
    displayType: "sales invoice",
    fiscalCategory: "service_revenue_standard_rate",
    vatCode: "output_vat_21",
    amountIncludingVat: 605,
    vatAmount: 105,
    confidence: 0.93
  },
  {
    sourceType: "receipt",
    displayType: "receipt",
    fiscalCategory: "representation_costs_limited_deductible",
    vatCode: "mixed_vat",
    amountIncludingVat: -72.5,
    vatAmount: 5.99,
    confidence: 0.58
  }
];

export function classifyUploadedFile(file, index) {
  const pattern = uploadClassificationPatterns[index % uploadClassificationPatterns.length];
  const confidenceStatus = pattern.confidence >= 0.85 ? "auto" : "review";

  return {
    id: `upload-${Date.now()}-${index}`,
    source: file.name.replace(/\.[^.]+$/, ""),
    date: new Date().toISOString().slice(0, 10),
    status: confidenceStatus,
    reviewReason: confidenceStatus === "review" ? "New counterparty or insufficient evidence" : "",
    matchedBankTransactionId: null,
    ...pattern
  };
}
