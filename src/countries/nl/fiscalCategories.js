export const nlFiscalCategories = {
  telecom_costs: {
    label: "Telecom costs",
    profitTreatment: "direct_cost",
    capitalized: false
  },
  service_revenue_standard_rate: {
    label: "Service revenue 21%",
    profitTreatment: "revenue",
    capitalized: false
  },
  hardware_capital_expenditure: {
    label: "Hardware capital expenditure",
    profitTreatment: "capital_expenditure",
    capitalized: true
  },
  representation_costs_limited_deductible: {
    label: "Representation costs limited deductible",
    profitTreatment: "limited_deductible_cost",
    capitalized: false
  },
  software_costs: {
    label: "Software costs",
    profitTreatment: "direct_cost",
    capitalized: false
  }
};

export function getFiscalCategory(categoryCode) {
  return nlFiscalCategories[categoryCode] ?? {
    label: categoryCode,
    profitTreatment: "review",
    capitalized: false
  };
}
