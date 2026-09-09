import { getVatCode } from "./vatCodes.js";

export function createNlVatReturnLines(documents) {
  const outputVat = documents
    .filter((doc) => getVatCode(doc.vatCode).direction === "output")
    .reduce((sum, doc) => sum + doc.vatAmount, 0);

  const inputVat = documents
    .filter((doc) => getVatCode(doc.vatCode).direction === "input")
    .reduce((sum, doc) => sum + doc.vatAmount, 0);

  const reviewVat = documents
    .filter((doc) => getVatCode(doc.vatCode).direction === "mixed")
    .reduce((sum, doc) => sum + doc.vatAmount, 0);

  return [
    { code: "1a", label: "Supplies high rate", amount: outputVat },
    { code: "5b", label: "Input VAT", amount: -inputVat },
    { code: "review", label: "VAT under review", amount: reviewVat },
    { code: "balance", label: "Draft balance", amount: outputVat - inputVat }
  ];
}
