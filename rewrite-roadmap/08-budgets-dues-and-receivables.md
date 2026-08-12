# Step 8 — Budgets, Dues, and Receivables

## Goal

Deliver budgeting and the complete member/resident revenue cycle: allocations, assessments, installments, receipts, credits, arrears, and statements.

## Dependencies and user outcomes

Depends on Steps 6–7 and property relationships from Step 3. Managers can approve budgets, allocate charges, issue installments, record receipts, and follow arrears. Members can understand what they owe, why it was allocated to them, what they paid, and their current balance.

## Domain model

- `Budget`: organization, fiscal period, version, status, approval metadata, and totals.
- `BudgetLine`: account/category, cost center, description, planned minor units, recurrence/period distribution, and allocation rule.
- `AllocationRule`: target participant type, effective weights, responsibility policy, exclusions, and rounding policy.
- `Assessment`: approved charge campaign created from budget, special expense, or manual authorized charge.
- `Charge`: immutable participant/unit obligation with source, amount, due date, status, and accounting posting.
- `InstallmentPlan`: schedule that partitions an assessment while preserving participant totals.
- `Receipt`: actual incoming payment with method, date, amount, payer, destination account, reference, evidence, and allocation status.
- `ReceiptAllocation`: amount applied to a charge.
- `CreditBalance`: derived unapplied/overpaid member credit.

Participant responsibility can target person, household, or unit. Condominium policies may resolve an operational responsible party from effective owner/tenant relationships, but the charge stores the resolution snapshot and explanation.

## Budget lifecycle

```text
DRAFT → UNDER_REVIEW → APPROVED → ACTIVE → CLOSED
                       ↘ REJECTED
```

Approved budgets are versioned snapshots. Changes require a new version or supplemental assessment; they do not rewrite charges already issued. Budget lines must map to valid accounting accounts and allocation rules before approval.

## Allocation and installments

- Allocation methods reuse equal, exact, percentage, shares, groups, and effective property weights from Step 6.
- Exclusions and responsibility overrides are explicit and effective-dated.
- Generate a preview containing source totals, participant allocations, installment dates, and rounding adjustments.
- Two-dimensional rounding reconciles both each participant total and each installment total to the cent. Deterministic remainder rules are persisted.
- Approval freezes source, weights, relationships, and generated calculation metadata.
- Issuance creates charges and accounting receivables idempotently.

## Receipts and allocation

- Methods: Pix (manual reference), bank transfer, cash, card/manual, cheque, and other.
- A receipt may be allocated automatically oldest-due-first or manually across open charges.
- Partial payments update derived status; overpayment becomes unapplied credit and is never silently consumed beyond configured rules.
- A receipt correction uses reversal followed by replacement. Allocations attached to a reversed receipt reverse with it.
- Payment evidence is not confirmation by itself; an authorized user records/approves the receipt according to policy.
- Pix reference IDs are duplicate-checked but do not imply bank verification.

## Accounting postings

- Charge issuance: debit member/unit receivable, credit assessment income/recovery account.
- Receipt: debit bank/cash, credit member/unit receivable for applied amounts; unapplied amount credits member advance/credit liability.
- Credit application: debit member advance liability, credit member/unit receivable.
- Reversal produces exact inverse entries through the accounting interface.

Mappings are organization-configurable and validated before activation. Charges, allocations, and receipts store resulting posting IDs.

## Arrears and statements

Read models provide open/overdue amounts, aging buckets, collection status, participant/unit balance, installment progress, and payment history. Optional late fee/interest rules produce previewed adjustment charges and are disabled by default until organization policy and Brazilian legal review are configured.

Statements show opening balance, charges, receipts, credits, reversals, running balance, source descriptions, and as-of timestamp. Access follows responsible-party and finance permissions.

## Public API and UI

Expose budgets, versions/lines, allocation preview, approval, assessments, installment generation, issuance, charges, receipts, allocations, reversals, credits, aging, and statements. State transitions are command endpoints with idempotency keys.

Angular screens include budget editor, allocation-rule builder, preview/proof table, installment calendar, issuance confirmation, receivables dashboard, receipt registration/allocation, arrears list, and member/unit statement.

## Offline behavior

- Draft budgets, rules, receipt capture, and manual allocations can be prepared offline.
- Budget approval, assessment issuance, and receipt posting may be queued but remain pending until server validation.
- Allocation previews computed locally are advisory; the authoritative server preview hash must match at approval/issuance.
- Stale relationships, weights, open-charge balances, closed periods, or duplicate references produce review outcomes.

## Tests

- Every allocation method, exclusions, responsibility snapshots, participant moves, and cent reconciliation.
- Multi-installment rounding, schedule dates, version replacement, supplemental assessments, and duplicate issuance.
- Partial/multiple/over payments, credit application, manual/automatic allocations, reversal, and duplicate Pix references.
- Exact debit/credit assertions for issue, receipt, credit, and reversal.
- Aging as-of date, statement running balance, and authorization by member/unit relationship.
- Offline stale preview, concurrent receipts against one charge, and retry idempotency.

## Acceptance criteria

- An approved amount is allocated and scheduled without losing or creating one cent.
- Issuing the same assessment operation twice creates no duplicate charges or postings.
- Receipts, credits, partial payments, and reversals produce explainable participant balances.
- A resident/member can view only their authorized current and historical statements.
- Finance administrators can trace every statement line to its source and ledger posting.
