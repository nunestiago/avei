# Step 9 — Suppliers, Invoices, and Payments

## Goal

Complete operational accounts payable with supplier invoices, approvals, manual Pix-aware payments, reversals, and bank/cash reconciliation.

## Dependencies and user outcomes

Depends on the supplier master data from Step 3 and accounting from Step 7. Staff can register and approve invoices, prepare/pay authorized obligations, reconcile bank movements, and reverse mistakes. Approvers can verify beneficiary and source evidence before funds are recorded as paid.

## Domain model

- `SupplierInvoice`: supplier, document type, supplier number, issue/due dates, competency period, currency, totals, status, notes, and documents.
- `InvoiceLine`: description, expense/account mapping, cost center, allocation dimensions, quantity/display metadata, and exact minor units.
- `Approval`: decision, actor, role, timestamp, and reason for invoice/payment workflow.
- `SupplierPayment`: supplier, payment date/value date, method, source bank/cash account, totals, status, Pix/bank metadata, evidence, and immutable beneficiary snapshot.
- `PaymentAllocation`: exact amount applied to an invoice/credit note.
- `BankStatementLine`: manually imported or entered transaction used for reconciliation.
- `ReconciliationMatch`: one or more statement lines matched to one or more posted receipts/payments/transfers.

Document types initially are `INVOICE`, `CREDIT_NOTE`, and `OTHER_PAYABLE`. Brazilian tax withholding fields may be recorded as informational metadata only; calculation and filing workflows are deferred.

## Invoice lifecycle

```text
DRAFT → SUBMITTED → APPROVED → POSTED → PARTIALLY_PAID → PAID
                  ↘ REJECTED
POSTED/PARTIALLY_PAID/PAID → REVERSED through corrective workflow
```

Invoice line totals plus explicit adjustments must equal the document total. Duplicate detection considers supplier, normalized document number, issue date, and total and requires authorized override with reason rather than silently blocking legitimate duplicates.

Approval policy is organization-configurable by amount and role. An actor cannot approve their own invoice/payment when segregation of duties is enabled.

## Payment lifecycle

- Build payment from one or more approved open invoices for one supplier, including partial allocations and netting available credit notes.
- Validate supplier beneficiary snapshot and source-account funds warning. The system may warn but does not claim bank balance authority before reconciliation.
- Methods include Pix, bank transfer, cash, cheque, and other.
- `SUBMITTED` payment may await approval; `POSTED` payment is immutable.
- A rejected/failed real-world transfer that was already posted is corrected by payment reversal with mandatory reason and evidence, never status rewriting.
- The first release records Pix identifiers/payload and proof manually; no provider API confirms or initiates payment.

## Accounting postings

- Invoice: debit expense/asset accounts from lines, credit supplier payable.
- Credit note: inverse signed effect linked to supplier and optionally original invoice.
- Payment: debit supplier payable, credit bank/cash; bank fee is a separate configured line when entered.
- Unallocated supplier advance: debit supplier advance asset, credit bank/cash; later application transfers advance to payable.
- Reversal calls the accounting reversal interface and reopens derived payable balances as appropriate.

Payment status and invoice outstanding amount are derived from postings/allocations, not manually editable flags.

## Reconciliation

- Accept manual entry and a documented CSV template in the first release.
- Normalize dates, amount, description, bank reference, and source account; preserve original row payload/checksum for audit.
- Suggest matches by amount, date window, reference, and counterparty but require confirmation.
- Support one-to-one, one-to-many, and many-to-one matching where totals reconcile exactly.
- A statement line cannot be reconciled beyond its amount. Unmatching records an audit event and restores availability.
- OFX/CNAB/Open Finance connectors are future adapters, not first-release requirements.

## Public API and UI

Expose invoice drafts/lines/documents, submit/approve/reject/post/reverse commands, open payables, payment creation/allocation/approval/post/reverse, statement import/preview, match suggestions, confirm/unmatch, and supplier statement.

Angular screens include invoice capture, duplicate warning, approval queues, payable aging, payment builder, beneficiary confirmation, Pix/manual payment details, payment slip/summary, bank import preview, and reconciliation workspace.

## Offline behavior

- Invoice drafts, receipt capture, line allocation, and payment drafts work offline.
- Approval/post/payment commands queue but are authoritative only after server validation.
- Beneficiary data in an offline draft is masked and versioned. If it changes before sync, payment submission requires explicit online review.
- Open balances and match suggestions may be stale; server returns conflicts rather than over-allocating.
- CSV import and final reconciliation confirmation require connectivity.

## Security and audit

Changing supplier bank/Pix data generates a high-severity audit event and invalidates pending payment confirmation snapshots. Permissions separate invoice creation, invoice approval, payment creation, payment approval, payment posting, beneficiary reveal/change, reconciliation, reversal, and report view.

## Tests

- Invoice arithmetic, duplicates/override, credit notes, document permissions, approval thresholds, and self-approval prevention.
- Partial/multiple invoice allocations, netting, supplier advances, fees, over-allocation rejection, and reversal.
- Exact ledger postings and derived statuses for all payable/payment paths.
- Beneficiary-change invalidation, Pix masking, duplicate operation, and concurrent payment attempts.
- CSV parse/preview, suggested/confirmed matches, one-to-many totals, duplicate import checksum, and unmatch.
- Offline stale invoice/payment data and closed-period outcomes.

## Acceptance criteria

- Supplier liabilities can be registered, approved, paid, reversed, and reconciled with full source-to-ledger traceability.
- No invoice or payment can be allocated beyond its remaining amount under concurrency.
- Beneficiary changes cannot silently affect a payment awaiting approval.
- Manual Pix and bank workflows never imply external confirmation that did not occur.
- Payables and bank/cash balances are reproducible from immutable postings.
