# Step 5 — PWA Offline and Synchronization

## Goal

Make the PWA fully usable for reads and command capture without connectivity while preserving server authority, tenant security, and financial integrity.

## Dependencies and user outcomes

Depends on Steps 1–4, although its command contract should be introduced before Step 4 is completed. Users can continue reading authorized data and performing supported work during outages, then understand whether each operation synchronized, failed validation, or needs conflict review.

## Offline architecture

The service worker caches versioned application assets and safe static resources. Business data is stored explicitly in IndexedDB; API responses are not blindly cached by URL.

IndexedDB is partitioned by user and organization and contains:

- normalized read models and their server versions;
- a pull cursor per organization;
- local drafts and attachment blobs;
- an append-only command outbox;
- synchronization outcomes and unresolved conflicts;
- non-sensitive reference data needed for validation.

The client generates UUIDs for new aggregates and UUID `operationId` values for every mutation before sending or queuing it.

## Command envelope

```json
{
  "operationId": "uuid",
  "organizationId": "uuid",
  "aggregateType": "TASK",
  "aggregateId": "uuid",
  "baseVersion": 4,
  "commandType": "TASK_UPDATE",
  "occurredAtClient": "2026-08-11T20:00:00Z",
  "payload": {}
}
```

The server authenticates the current user, derives authorization from current membership, validates `organizationId`, and stores command outcome keyed by user/organization/operation. Replaying an operation returns the original outcome without repeating side effects.

## Synchronization API

### Push

`POST /api/v1/sync/push` accepts a bounded ordered batch. Each result is one of:

- `APPLIED` with new aggregate version and generated events;
- `DUPLICATE` with the original successful result;
- `CONFLICT` with current server projection and stable conflict code;
- `REJECTED` with validation/authorization/business-rule Problem Details;
- `DEPENDENCY_PENDING` when a referenced local aggregate has not synchronized.

Commands preserve causal order per aggregate. A failed command blocks later commands for the same aggregate but not unrelated aggregates.

### Pull

`GET /api/v1/sync/pull?organizationId={id}&cursor={cursor}&limit={n}` returns ordered projection changes, tombstones, membership/capability changes, and a next cursor. A cursor identifies a committed server sequence, not a timestamp. Pull is repeatable and at-least-once; applying a change is idempotent.

If the cursor has expired, the server instructs a scoped resnapshot. The client preserves unsynchronized commands, replaces read models, then rebases/retries compatible commands.

## Conflict policy

- Independent new aggregates and append-only comments merge naturally.
- Last-writer-wins is allowed only for explicitly designated low-risk preference fields.
- Same-field updates to versioned master/content data produce review conflicts.
- Membership, permission, capability, accounting-period, and workflow-state validation always uses current server state.
- Financial commands never merge amounts automatically. A stale financial draft is revalidated and either posted exactly once or returned for review.
- Deletion versus edit retains a tombstone and requires review unless the edit is safely discardable by explicit rule.

The conflict center shows local intent, current server state, reason, and allowed actions: discard local operation, retry against current version, or create a new replacement command. It never offers arbitrary force overwrite for posted finance or security data.

## Financial offline semantics

Users may create expenses, receipts, invoices, payments, and accounting drafts offline. The UI labels them `LOCAL_DRAFT` or `PENDING_SYNC`. They do not affect authoritative balances, reports, or other users until server validation and posting succeeds.

Once posted, a financial command cannot be edited offline or online. A correction is a new reversal/adjustment command. Duplicate taps and network retries reuse the same operation ID.

## Attachments

1. Store local blob and checksum.
2. Request an upload session when online.
3. Upload chunks/resume as supported by the storage adapter.
4. Finalize and receive a document ID after server checksum and malware/type checks.
5. Submit or unblock the parent command referencing that ID.

The client applies storage quotas, warns before large offline capture, and supports deleting unreferenced local blobs.

## Security and lifecycle

- IndexedDB must not contain password/session secrets, MFA data, unmasked government identifiers, private storage URLs, or unrestricted bank data.
- Cached data is available only after local application unlock/session bootstrap. Browser storage is not represented as encrypted-at-rest security.
- Logout warns about pending work, then removes all local data after confirmation.
- Membership revocation or device/session revocation purges affected partitions at the next authenticated contact.
- Service-worker upgrades preserve database/outbox data and include explicit IndexedDB migrations with rollback-safe backups for schema upgrades.

## UX states

Expose global connectivity plus per-operation states: saved locally, waiting for attachment, syncing, accepted, needs review, rejected, and retry scheduled. Users can inspect pending work by organization. Background sync is an optimization; opening the app always triggers controlled synchronization.

## Tests

- Browser E2E tests with network disabled before, during, and after mutations.
- Duplicate push, response loss, server restart, out-of-order delivery, and partial-batch failure.
- Cursor replay, expiration/resnapshot, tombstones, and membership revocation.
- Concurrent edits on two devices and explicit conflict resolution.
- Financial duplicate submission, stale period, closed period, changed allocation, and reversal behavior.
- Attachment interruption, checksum mismatch, quota exhaustion, and orphan cleanup.
- PWA upgrade while pending commands exist and logout with unsynchronized work.

## Acceptance criteria

- After one successful sync, all authorized primary screens open offline.
- Users can complete core create/edit workflows offline with durable local confirmation.
- Repeated delivery never creates duplicate domain or accounting effects.
- Conflicts are deterministic, visible, and resolvable without data loss.
- Authoritative financial reports contain only server-accepted postings.
- Revoked users cannot synchronize and cached tenant data is removed at the next authenticated contact.
