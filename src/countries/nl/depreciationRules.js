export const nlDepreciationRules = {
  hardware: {
    assetCategory: "Hardware",
    method: "straight_line",
    usefulLifeYears: 5,
    residualValueRate: 0
  }
};

export function getDepreciationRule(assetCategory) {
  return nlDepreciationRules[assetCategory] ?? {
    assetCategory,
    method: "review_required",
    usefulLifeYears: null,
    residualValueRate: null
  };
}
