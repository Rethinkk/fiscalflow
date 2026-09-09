import { getDepreciationRule } from "../countries/nl/depreciationRules.js";
import { getFiscalCategory } from "../countries/nl/fiscalCategories.js";

function createFixedAssetProposal(documentItem) {
  const netAmount = Math.abs(documentItem.amountIncludingVat) - documentItem.vatAmount;
  const rule = getDepreciationRule("hardware");
  const annualDepreciation = rule.usefulLifeYears ? netAmount / rule.usefulLifeYears : null;

  return {
    id: `balance-${documentItem.id}`,
    type: "fixed_asset_addition",
    status: documentItem.confidence >= 0.8 ? "proposed" : "review_required",
    sourceId: documentItem.id,
    title: `Add fixed asset for ${documentItem.source}`,
    description: `${rule.assetCategory} purchase with ${rule.method.replace("_", "-")} depreciation`,
    amount: netAmount,
    date: documentItem.date,
    balanceImpact: `Add fixed asset: ${formatNumber(netAmount)}`,
    profitImpact: annualDepreciation
      ? `Depreciate ${formatNumber(annualDepreciation)} per year`
      : "Depreciation needs review",
    taxImpact: "VAT can be handled now; profit impact moves through depreciation",
    confidence: documentItem.confidence
  };
}

function createOwnerEquityProposal(transaction) {
  return {
    id: `balance-${transaction.id}`,
    type: "owner_equity_movement",
    status: "review_required",
    sourceId: transaction.id,
    title: `Classify ${transaction.name}`,
    description: "Unmatched cash movement may affect owner equity instead of profit",
    amount: Math.abs(transaction.amount),
    date: transaction.date,
    balanceImpact: "Post to owner equity after confirmation",
    profitImpact: "No profit impact if confirmed as owner movement",
    taxImpact: "Outside VAT scope",
    confidence: 0.66
  };
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR" }).format(value);
}

export function createBalanceAdjustmentProposals(state) {
  const fixedAssetProposals = state.documents
    .filter((documentItem) => getFiscalCategory(documentItem.fiscalCategory).capitalized)
    .map(createFixedAssetProposal);

  const ownerMovementProposals = state.transactions
    .filter((transaction) => !transaction.matched && transaction.amount < 0)
    .map(createOwnerEquityProposal);

  return [...fixedAssetProposals, ...ownerMovementProposals];
}
