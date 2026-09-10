export type CountryCode = "NL";

export type SourceType = "purchase_invoice" | "sales_invoice" | "receipt";

export type ProposalStatus = "auto" | "review";

export type OpenItemType =
  | "accounts_receivable"
  | "accounts_payable"
  | "capital_expenditure";

export type BalanceProposalType =
  | "fixed_asset_addition"
  | "owner_equity_movement";

export type BalanceProposalStatus = "proposed" | "review_required";

export interface BusinessEntity {
  id: string;
  name: string;
  country: CountryCode;
  taxPeriod: string;
}

export interface FiscalDocument {
  id: string;
  source: string;
  sourceType: SourceType;
  displayType: string;
  date: string;
  amountIncludingVat: number;
  vatAmount: number;
  fiscalCategory: string;
  vatCode: string;
  confidence: number;
  status: ProposalStatus;
  reviewReason?: string;
  matchedBankTransactionId: string | null;
}

export interface BankTransaction {
  id: string;
  date: string;
  name: string;
  amount: number;
  matched: boolean;
}

export interface OpenItem {
  id: string;
  name: string;
  type: OpenItemType;
  displayType: string;
  amount: number;
  date: string;
}

export interface VatReturnLine {
  code: string;
  label: string;
  amount: number;
}

export interface BalanceAdjustmentProposal {
  id: string;
  type: BalanceProposalType;
  status: BalanceProposalStatus;
  sourceId: string;
  title: string;
  description: string;
  amount: number;
  date: string;
  balanceImpact: string;
  profitImpact: string;
  taxImpact: string;
  confidence: number;
}

export interface FiscalSummary {
  vatPayable: number;
  profitImpact: number;
  automationRate: number;
  needsReview: number;
}

export interface ProfitLossLine {
  code: string;
  label: string;
  amount: number;
}

export interface ProfitLossSection {
  title: string;
  lines: ProfitLossLine[];
  total: number;
}

export interface ProfitLossStatement {
  period: string;
  generatedAt: string;
  revenue: ProfitLossSection;
  expenses: ProfitLossSection;
  depreciation: ProfitLossSection;
  netProfit: number;
}

export interface AppState {
  businessEntity: BusinessEntity;
  filter: "all" | ProposalStatus;
  documents: FiscalDocument[];
  transactions: BankTransaction[];
  openItems: OpenItem[];
}
