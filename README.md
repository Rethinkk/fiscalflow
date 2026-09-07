# FiscalFlow MVP

FiscalFlow is a local prototype for a bookkeeping-light fiscal cockpit.

The core idea:

- Bank transactions are the anchor for real cash movement.
- Invoices and receipts are the evidence layer.
- AI/OCR performs fiscal classification: business, private, capital expenditure, VAT code and period.
- The entrepreneur only sees exceptions, open items and tax return impact.
- A traditional ledger can still be generated in the background for export, audit or accountant workflows.

## Local Start

Open `index.html` directly in a browser or start a simple local server:

```bash
python3 -m http.server 4173
```

The app will be available at `http://localhost:4173`.

## First Real Building Blocks

1. Document storage per customer
   - Isolated bucket or folder per business entity.
   - Encryption, retention rules and audit logs.

2. Extraction
   - PDF text extraction for digital invoices.
   - OCR for scans and photos.
   - Normalization into invoice lines, totals and VAT amounts.

3. Fiscal classification
   - Counterparty recognition.
   - Fiscal category.
   - VAT code.
   - Tax period and document date.
   - Confidence score and review reason.

4. Bank matching
   - Match on amount, IBAN, name, invoice number and date.
   - Open item when an invoice has not been paid yet.
   - Unexplained bank transaction when payment has no evidence.

5. Tax return output
   - VAT return boxes.
   - Profit calculation.
   - Capital expenditure and depreciation.
   - Owner withdrawals and contributions.
   - Export to accountant or accounting software.

## Minimum Data Shape

```json
{
  "document_id": "doc_123",
  "tenant_id": "company_123",
  "country": "NL",
  "source_type": "purchase_invoice",
  "counterparty": "KPN Mobile BV",
  "invoice_number": "F2026-001",
  "invoice_date": "2026-07-14",
  "tax_period": "2026-Q3",
  "amount_including_vat": -84.7,
  "amount_excluding_vat": -70.0,
  "vat_amount": 14.7,
  "vat_code": "input_vat_21",
  "fiscal_category": "telecom_costs",
  "bank_transaction_id": "bank_123",
  "confidence": 0.96,
  "status": "auto_approved"
}
```

## Internationalization Principle

Build the core platform in English and make countries adapters, not forks.

Suggested structure for future implementation:

```text
core/
  documents/
  bank-transactions/
  evidence/
  classification/
  reviews/
  tax-returns/
countries/
  nl/
  de/
  be/
  uk/
```

The Dutch layer should define local rules and labels, for example VAT return boxes, Dutch VAT codes, IB/VPB-specific logic and local audit wording. The core data model should stay English.

## Product Scope

The first product version should not try to solve every accounting scenario. Start with Dutch freelancers and small limited companies with normal invoice flows, bank matching, VAT 21/9/0, reverse charge, capital expenditure and owner transactions.
