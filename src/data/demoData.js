export const initialState = {
  businessEntity: {
    id: "company_demo",
    name: "Demo Business NL",
    country: "NL",
    taxPeriod: "2026-Q3"
  },
  filter: "all",
  documents: [
    {
      id: "doc-1",
      source: "KPN Mobile BV",
      sourceType: "purchase_invoice",
      displayType: "purchase invoice",
      date: "2026-07-14",
      amountIncludingVat: -84.7,
      vatAmount: 14.7,
      fiscalCategory: "telecom_costs",
      vatCode: "input_vat_21",
      confidence: 0.96,
      status: "auto",
      matchedBankTransactionId: "bank-1"
    },
    {
      id: "doc-2",
      source: "Studio North",
      sourceType: "sales_invoice",
      displayType: "sales invoice",
      date: "2026-08-03",
      amountIncludingVat: 1815,
      vatAmount: 315,
      fiscalCategory: "service_revenue_standard_rate",
      vatCode: "output_vat_21",
      confidence: 0.98,
      status: "auto",
      matchedBankTransactionId: "bank-2"
    },
    {
      id: "doc-3",
      source: "Apple Store",
      sourceType: "purchase_invoice",
      displayType: "purchase invoice",
      date: "2026-08-18",
      amountIncludingVat: -1451.99,
      vatAmount: 252,
      fiscalCategory: "hardware_capital_expenditure",
      vatCode: "input_vat_21",
      confidence: 0.74,
      status: "review",
      reviewReason: "Possible capital expenditure instead of direct cost",
      matchedBankTransactionId: "bank-3"
    },
    {
      id: "doc-4",
      source: "Market Restaurant",
      sourceType: "receipt",
      displayType: "receipt",
      date: "2026-09-01",
      amountIncludingVat: -126.4,
      vatAmount: 10.44,
      fiscalCategory: "representation_costs_limited_deductible",
      vatCode: "mixed_vat",
      confidence: 0.61,
      status: "review",
      reviewReason: "Business purpose is missing",
      matchedBankTransactionId: "bank-4"
    }
  ],
  transactions: [
    { id: "bank-1", date: "2026-07-16", name: "KPN Mobile", amount: -84.7, matched: true },
    { id: "bank-2", date: "2026-08-09", name: "Studio North payment", amount: 1815, matched: true },
    { id: "bank-3", date: "2026-08-18", name: "Apple Store Amsterdam", amount: -1451.99, matched: true },
    { id: "bank-4", date: "2026-09-01", name: "Market Restaurant", amount: -126.4, matched: true },
    { id: "bank-5", date: "2026-09-02", name: "Owner withdrawal", amount: -300, matched: false }
  ],
  openItems: [
    {
      id: "open-1",
      name: "Invoice S-2026-083 to Delta Legal",
      type: "accounts_receivable",
      displayType: "Accounts receivable",
      amount: 2420,
      date: "2026-09-04"
    },
    {
      id: "open-2",
      name: "Exact Online subscription",
      type: "accounts_payable",
      displayType: "Accounts payable",
      amount: -58.08,
      date: "2026-09-05"
    },
    {
      id: "open-3",
      name: "MacBook Pro 2026",
      type: "capital_expenditure",
      displayType: "Capital expenditure",
      amount: -1451.99,
      date: "2026-08-18"
    }
  ]
};
