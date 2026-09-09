export const nlVatCodes = {
  input_vat_21: {
    label: "Input VAT 21%",
    direction: "input",
    rate: 0.21,
    returnBox: "5b"
  },
  output_vat_21: {
    label: "Output VAT 21%",
    direction: "output",
    rate: 0.21,
    returnBox: "1a"
  },
  mixed_vat: {
    label: "Mixed VAT",
    direction: "mixed",
    rate: null,
    returnBox: "review"
  }
};

export function getVatCode(code) {
  return nlVatCodes[code] ?? {
    label: code,
    direction: "review",
    rate: null,
    returnBox: "review"
  };
}
