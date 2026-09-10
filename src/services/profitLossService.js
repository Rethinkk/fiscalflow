import { getFiscalCategory } from "../countries/nl/fiscalCategories.js";
import { createBalanceAdjustmentProposals } from "./balanceAdjustmentService.js";
import { createPayrollExpenseLines } from "./payrollService.js";

function signedNetAmount(documentItem) {
  const amount = Math.abs(documentItem.amountIncludingVat) - documentItem.vatAmount;
  return documentItem.amountIncludingVat >= 0 ? amount : -amount;
}

function groupLines(documents, profitTreatment) {
  const grouped = new Map();

  documents
    .filter((documentItem) => getFiscalCategory(documentItem.fiscalCategory).profitTreatment === profitTreatment)
    .forEach((documentItem) => {
      const category = getFiscalCategory(documentItem.fiscalCategory);
      const current = grouped.get(documentItem.fiscalCategory) ?? {
        code: documentItem.fiscalCategory,
        label: category.label,
        amount: 0
      };

      current.amount += Math.abs(signedNetAmount(documentItem));
      grouped.set(documentItem.fiscalCategory, current);
    });

  return [...grouped.values()].map((line) => ({
    ...line,
    amount: roundMoney(line.amount)
  }));
}

function quarterEndDate(taxPeriod) {
  const [yearPart, quarterPart] = taxPeriod.split("-Q");
  const year = Number(yearPart);
  const quarter = Number(quarterPart);
  const monthIndex = quarter * 3;
  return new Date(Date.UTC(year, monthIndex, 0));
}

function depreciableMonthsInPeriod(assetDate, taxPeriod) {
  const purchaseDate = new Date(assetDate);
  const periodEnd = quarterEndDate(taxPeriod);
  if (purchaseDate > periodEnd) return 0;

  const months =
    (periodEnd.getUTCFullYear() - purchaseDate.getUTCFullYear()) * 12 +
    (periodEnd.getUTCMonth() - purchaseDate.getUTCMonth()) +
    1;

  return Math.max(0, Math.min(3, months));
}

function createDepreciationLines(state) {
  return createBalanceAdjustmentProposals(state)
    .filter((proposal) => proposal.type === "fixed_asset_addition")
    .map((proposal) => {
      const usefulLifeYears = 5;
      const months = depreciableMonthsInPeriod(proposal.date, state.businessEntity.taxPeriod);
      const amount = (proposal.amount / usefulLifeYears / 12) * months;

      return {
        code: proposal.id,
        label: proposal.title.replace("Add fixed asset for ", "Depreciation - "),
        amount: roundMoney(amount)
      };
    })
    .filter((line) => line.amount > 0);
}

function total(lines) {
  return roundMoney(lines.reduce((sum, line) => sum + line.amount, 0));
}

function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function createProfitLossStatement(state) {
  const revenueLines = groupLines(state.documents, "revenue");
  const directCostLines = [
    ...groupLines(state.documents, "direct_cost"),
    ...groupLines(state.documents, "limited_deductible_cost"),
    ...createPayrollExpenseLines(state.transactions)
  ];
  const depreciationLines = createDepreciationLines(state);

  const revenueTotal = total(revenueLines);
  const expenseTotal = total(directCostLines);
  const depreciationTotal = total(depreciationLines);

  return {
    period: state.businessEntity.taxPeriod,
    generatedAt: new Date().toISOString(),
    revenue: {
      title: "Revenue",
      lines: revenueLines,
      total: revenueTotal
    },
    expenses: {
      title: "Operating expenses",
      lines: directCostLines,
      total: expenseTotal
    },
    depreciation: {
      title: "Depreciation",
      lines: depreciationLines,
      total: depreciationTotal
    },
    netProfit: roundMoney(revenueTotal - expenseTotal - depreciationTotal)
  };
}
