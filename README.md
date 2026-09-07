# Fiscale Cockpit MVP

Dit is een lokaal prototype voor een boekhoudarme fiscale cockpit.

Het uitgangspunt:

- Bankmutaties zijn de basis voor werkelijke geldstromen.
- Facturen en bonnetjes zijn de bewijslaag.
- AI/OCR doet fiscale classificatie: zakelijk, prive, investering, btw-code en periode.
- De ondernemer ziet alleen uitzonderingen, open posten en aangifte-impact.
- Een klassieke boekhouding kan op de achtergrond worden gegenereerd als export of auditspoor.

## Lokale start

Open `index.html` direct in de browser of start een eenvoudige server:

```bash
python3 -m http.server 4173
```

Daarna staat de app op `http://localhost:4173`.

## Eerste echte bouwblokken

1. Documentopslag per klant
   - Afgesloten bucket/map per onderneming.
   - Versleuteling, bewaartermijnen en auditlog.

2. Extractie
   - PDF tekstextractie voor digitale facturen.
   - OCR voor scans en foto's.
   - Normalisatie naar factuurregels, totalen en btw-bedragen.

3. Fiscale classificatie
   - Leverancier/Klant herkenning.
   - Grootboekachtige fiscale categorie.
   - Btw-code.
   - Periode/datum.
   - Confidence score en reden bij twijfel.

4. Bankmatching
   - Match op bedrag, IBAN, naam, factuurnummer en datum.
   - Openstaand als factuur nog niet betaald is.
   - Onverklaarde bankmutatie als betaling geen bewijs heeft.

5. Aangifte-output
   - Btw rubrieken.
   - Winstberekening.
   - Investeringen en afschrijvingen.
   - Prive/opname/storting.
   - Export naar accountant of boekhoudpakket.

## Minimale datavelden

```json
{
  "document_id": "doc_123",
  "tenant_id": "company_123",
  "source_type": "purchase_invoice",
  "counterparty": "KPN Mobiel BV",
  "invoice_number": "F2026-001",
  "invoice_date": "2026-07-14",
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

## Productlijn

De eerste productversie moet niet proberen om alle boekhoudscenario's op te lossen. Begin met Nederlandse zzp'ers en kleine BV's met normale factuurstromen, bankkoppeling, btw 21/9/0, verlegd, investeringen en privecorrecties.
