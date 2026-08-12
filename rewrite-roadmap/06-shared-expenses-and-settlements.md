# Step 6 — Shared Expenses and Settlements

## Goal

Support practical expense sharing for communities and associations while using the same financial source of truth that later supports formal condominium accounting.

## Dependencies and user outcomes

Depends on Steps 3 and 5 and reaches production posting only after Step 7. Members can record who paid, split an expense transparently, see balances, and settle manually with Pix references. Treasurers can approve, reverse, and audit expenses without spreadsheet reconciliation.

## Domain model

- `SharedExpense`: description, expense date, payer, merchant/supplier reference, currency, total minor units, category, participants, evidence documents, status, and recurrence source.
- `ExpenseSplit`: participant plus exact allocated minor units and the rule inputs that produced it.
- `SplitRule`: `EQUAL`, `EXACT_AMOUNT`, `PERCENTAGE`, `SHARES`, `ALLOCATION_WEIGHT`, or `CUSTOM_GROUP`.
- `Settlement`: transfer between participants or between participant and organization, method, date, amount, Pix metadata, evidence, and status.
- `ParticipantBalance`: read model derived from accepted expenses, payments, reimbursements, credits, reversals, and settlements.
- `RecurringExpenseTemplate`: schedule and default split configuration; each occurrence creates an independent draft.

Participants may be people, households, units, or the organization. A single expense uses one participant type for allocation unless a deliberately configured custom allocation expands groups into final liable participants.

## Expense lifecycle

```text
DRAFT → SUBMITTED → APPROVED → POSTED
                  ↘ REJECTED
POSTED → REVERSED
```

Organizations may configure approval as optional. Without approval, a permitted creator may submit directly for server validation and posting. `POSTED` expenses are immutable; correction creates a complete reversal and replacement expense linked to the original.

## Split calculation

- Equal splits distribute remainder cents deterministically using ascending participant UUID order.
- Exact amounts must sum to the expense total.
- Percentages use decimal percentages whose total is exactly 100; computed remainder cents use deterministic ordering.
- Shares must be positive integers/decimals; zero-share participants receive zero and are retained only for explanation.
- Allocation weights use an effective-dated snapshot from Step 3. Later weight changes do not rewrite posted splits.
- Custom groups resolve to final participants before approval and store the resolution snapshot.

Every response includes the total, rule inputs, calculated allocations, rounding adjustments, and a proof that allocated minor units equal total minor units.

## Payer and balance semantics

The payer records who funded the expense. Each participant owes its allocated share; the payer receives credit for the amount paid. If the organization paid, participants owe the organization. If a participant paid personally, other participants owe through the organization-supported settlement model.

The initial settlement suggestion minimizes transfers for display, but it is not accounting truth. Actual accepted settlement records determine balances. Suggestions remain reproducible from current balances and are never posted automatically.

## Pix support

Store optional payment method, masked Pix key details, end-to-end/reference identifiers, copy-and-paste payload, payer note, and evidence. Generate a static Pix QR payload only when the receiving participant/organization has valid configured details. The first release does not contact a bank, confirm payment automatically, issue dynamic charges, or generate boletos.

Sensitive Pix keys are encrypted and shown only to intended payers and authorized finance roles. Audit creation, reveal, and change operations.

## Accounting integration

Shared expenses call the public accounting posting interface from Step 7. Organizations with simplified finance receive an automatically managed chart and member-balance accounts. Organizations with advanced accounting map expense categories and payment sources to configured accounts.

No separate mutable “who owes whom” ledger exists. `ParticipantBalance` is a projection of postings and settlement facts. Before Step 7 is delivered, expense records may remain approved but cannot reach `POSTED` in production.

## Public API and UI

Provide organization-scoped endpoints for expense drafts, split previews, submit/approve/reject/post/reverse commands, recurring templates, settlements, balance projections, and settlement suggestions.

Angular screens include expense list/detail, mobile receipt capture, split editor with live proof, approval queue, balances by participant, suggested settlements, Pix QR/share flow, recurrence manager, and reversal/replacement wizard.

## Offline behavior

- Create/edit drafts, capture receipts, calculate splits, and record pending settlements offline.
- The client calculation provides immediate feedback, but the server recalculates from canonical rule inputs before posting.
- Weight-based drafts retain the referenced local weight version; stale weights cause review rather than silent recalculation.
- Approval, posting, and settlement commands can be queued, but the UI shows balances as pending until accepted.
- Duplicate settlement commands are idempotent. Conflicting edits to submitted/posted expenses are rejected.

## Permissions

Separate expense view, create, approve, settle, reverse, configure category mappings, and reveal-payment-detail permissions. Members can see only expenses and balances in audiences for which organization policy grants access. Finance administrators may see full organization projections.

## Tests

- Every split method, negative/zero input rejection, precision, deterministic remainder, one participant, and large participant sets.
- Payer included/excluded as participant, organization payer, reimbursements, credits, partial settlement, and over-settlement rejection.
- Lifecycle transitions, approval segregation, reversal/replacement, recurring idempotency, and accounting posting integration.
- Pix payload validation, masking, access audit, and no automatic confirmation assumption.
- Offline stale weights, duplicate submissions, attachment completion, and pending-balance display.
- Property-based tests generate random totals/rules and prove allocations always reconcile exactly.

## Acceptance criteria

- A community can create, approve, explain, and settle a shared expense using any supported allocation method.
- Every expense allocation reconciles to the cent and remains reproducible after source data changes.
- Posted expenses and settlements are immutable and traceable to balanced accounting entries.
- Offline work cannot create duplicate expenses or settlements after retries.
- Pix functionality is useful for manual payment without representing unverified transfers as confirmed.
