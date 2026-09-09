import { getFiscalCategory } from "../countries/nl/fiscalCategories.js";
import { getVatCode } from "../countries/nl/vatCodes.js";

export function calculateFiscalSummary(documents) {
  const outputVat = documents
    .filter((doc) => getVatCode(doc.vatCode).direction === "output")
    .reduce((sum, doc) => sum + doc.vatAmount, 0);

  const inputVat = documents
    .filter((doc) => getVatCode(doc.vatCode).direction === "input")
    .reduce((sum, doc) => sum + doc.vatAmount, 0);

  const revenue = documents
    .filter((doc) => getFiscalCategory(doc.fiscalCategory).profitTreatment === "revenue")
    .reduce((sum, doc) => sum + (doc.amountIncludingVat - doc.vatAmount), 0);

  const directCosts = documents
    .filter((doc) => {
      const category = getFiscalCategory(doc.fiscalCategory);
      return category.profitTreatment === "direct_cost" || category.profitTreatment === "limited_deductible_cost";
    })
    .reduce((sum, doc) => sum + Math.abs(doc.amountIncludingVat) - doc.vatAmount, 0);

  const autoCount = documents.filter((doc) => doc.status === "auto").length;

  return {
    vatPayable: outputVat - inputVat,
    profitImpact: revenue - directCosts,
    automationRate: Math.round((autoCount / documents.length) * 100),
    needsReview: documents.filter((doc) => doc.status === "review").length
  };
}
