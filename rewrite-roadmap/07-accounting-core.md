# Step 7 — Accounting Core

## Goal

Create an immutable, auditable double-entry ledger for operational Brazilian community and condominium accounting. Tax filing and statutory accountant replacement are explicitly excluded.

## Dependencies and user outcomes

Depends on Steps 1–3 and the idempotent command conventions from Step 5. Treasurers can configure accounts, post/reverse authorized transactions, close periods, and explain balances. Other modules receive one safe posting interface rather than implementing their own financial ledgers.

## Accounting model

- `AccountingBook`: one operational book per organization and currency in the first release.
- `FiscalPeriod`: organization period with `OPEN`, `SOFT_CLOSED`, or `CLOSED` status.
- `Account`: code, name, normal balance, type, optional parent, posting flag, system purpose, and active interval.
- `JournalEntry`: public UUID, organization/book/period, effective date, posting instant, source type/id, description, status, reversal links, operation ID, actor, and version.
- `JournalLine`: account, debit minor units, credit minor units, participant/unit/supplier/cost-center dimensions, and description.
- `PostingRequest`: module-neutral command containing balanced proposed lines and source metadata.
- `AccountBalance`: read model derived from posted lines, never directly mutated by business modules.
- `BankCashAccount`: mapping between operational bank/cash/fund record and ledger account.

Account types are `ASSET`, `LIABILITY`, `EQUITY`, `INCOME`, and `EXPENSE`. Lines have either positive debit or positive credit, never both. Every entry must contain at least two lines and total debits must equal total credits in minor units.

## Chart of accounts

- Provide versioned templates for simplified communities and advanced condominiums.
- Creating an organization copies a selected template so later template evolution does not mutate existing charts.
- System-purpose accounts such as cash, bank, member receivables, supplier payables, expense clearing, opening balance, and retained result are explicit mappings, not account-code assumptions.
- Accounts with posted lines cannot be deleted or converted between posting/non-posting semantics; they can be deactivated.
- Parent/child accounts cannot form cycles, and postings are allowed only to posting accounts.

## Posting lifecycle and API

Draft business documents are owned by source modules. The accounting module accepts only `PostingRequest` through a public application interface:

```text
post(sourceType, sourceId, organizationId, operationId,
     effectiveDate, description, lines, dimensions) -> PostingResult
reverse(entryId, operationId, effectiveDate, reason) -> PostingResult
```

Posting validates current membership/system authority, capability, account mappings, period, dimensions, currency, source uniqueness, and balance. It persists the immutable entry and transactional outbox/audit event in one transaction.

`sourceType + sourceId + postingPurpose` and `operationId` are unique within an organization. Retry returns the existing posting. Source modules store the returned entry ID but never update ledger lines.

## Reversals and periods

- A reversal creates a new entry with debits/credits swapped and explicit link/reason.
- An already fully reversed entry cannot be reversed again.
- If the original period is open, default reversal date is the requested correction date in that period. If closed, reversal must post in the current open period and retain original-period metadata.
- `SOFT_CLOSED` blocks ordinary posting but permits authorized adjustments with reason.
- `CLOSED` blocks all entries with effective dates in the period. Reopening requires dedicated permission, reason, and audit event; production policy may disable reopening.

## Initial posting rules

- Shared expense paid by organization: debit expense/category, credit bank/cash/payable as configured.
- Participant-funded shared expense: debit expense/category and credit participant reimbursement liability; participant allocations debit participant receivable/clearing and credit expense recovery according to the simplified chart design.
- Participant settlement: debit bank/cash or participant settlement clearing, credit participant receivable; exact lines are selected by settlement direction.
- Opening balances: one balanced entry against opening-balance equity.

Steps 8 and 9 add receivable/payable rules. Every rule has a named posting purpose and a written debit/credit example before implementation.

## Read models and queries

Build asynchronous-after-commit or transactional projections for account balances, trial balance, general ledger, source posting status, participant/unit subledger, and daily cash position. Projections can be rebuilt from journal entries. API responses state projection sequence/as-of instant so users know freshness.

## Concurrency and offline behavior

- Server posting is the only authority. Offline financial commands remain pending drafts until accepted.
- Acquire deterministic database locks for period and affected source aggregate where required.
- Optimistic version protects source document transitions; unique operation/source keys prevent double posting.
- A client cannot submit raw arbitrary lines unless it has a dedicated manual-journal permission. Normal modules submit typed commands that produce server-side lines.
- Manual journal drafts may be created offline; posting requires online server validation and two-person approval if organization policy enables it.

## Audit and security

Record creator, approver if applicable, posting actor/system, operation/correlation IDs, source document, timestamps, reversal reason, and account-mapping versions. Audit history cannot expose sensitive supplier/member details to users lacking source permissions, even when they can see summarized accounting data.

## Tests

- Balanced/unbalanced lines, currency mismatch, invalid account, parent account posting, inactive mapping, duplicate source, and duplicate operation.
- Period boundary, soft close, hard close, authorized adjustment, reopen policy, and cross-period reversal.
- Concurrent identical/different postings and simulated response loss.
- Every source posting rule with exact expected debits and credits.
- Projection rebuild equals live projections and trial balance always nets to zero.
- Tenant isolation and dimension authorization.
- Property-based tests generate entry sets and prove balance and reversal invariants.

## Acceptance criteria

- No API or module can mutate a posted journal entry or derived balance directly.
- Every accepted financial source produces exactly one balanced posting per purpose.
- Reversal preserves full traceability and restores balances mathematically.
- Trial balance and rebuilt projections match the journal for any tested as-of sequence.
- Closed-period and idempotency rules hold under concurrency and offline retries.
