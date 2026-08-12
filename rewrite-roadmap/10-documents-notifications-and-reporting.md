# Step 10 — Documents, Notifications, and Reporting

## Goal

Turn operational data into secure documents, reliable notifications, actionable dashboards, and traceable reports for administrators and members.

## Dependencies and user outcomes

Depends on Steps 4 and 7–9 and extends the basic document/event foundations introduced earlier. Members receive relevant information and downloadable statements; managers get actionable dashboards, delivery diagnostics, secure document workflows, and reports whose totals trace to source postings.

## Document management

### Model

- `Document`: organization, owner/source reference, title, category, audience, status, current version, retention metadata, and optional expiry.
- `DocumentVersion`: immutable metadata for object key, original/safe filename, content type, size, checksum, creator, scan state, and creation instant.
- `DocumentCategory`: organization-defined hierarchy with permission and retention defaults.
- `DocumentAccessEvent`: upload, version, download, reveal, archive, restore, and delete-request audit.

Binary access uses short-lived signed URLs issued only after authorization. Upload flow uses pre-authorized upload sessions, size/type limits, checksum verification, malware scan adapter, and finalization. Until scanning finishes, documents are quarantined and unavailable to normal users.

Versions are append-only. “Replace” adds a version and keeps source history. Archival hides normal lists. Physical deletion occurs only after retention policy, legal holds, source references, and queued jobs permit it.

### Features

- Categories/folders, tags, source attachments, audience, expiry/renewal reminders, version history, preview where safe, bulk metadata actions, and ZIP export job.
- Search metadata and extracted text only when an enabled extractor supports the type; authorization filters every result.
- Organization branding, administrator signature image, and legal/footer text for generated PDFs.
- Sensitive categories can forbid offline binary caching while still caching metadata.

## Notification system

Domain modules emit semantic events; they never send email or push directly. Notification policies convert events into recipient-specific notifications.

Channels are:

- in-app inbox, always available for applicable events;
- web push for subscribed devices;
- email through configurable SMTP/sendmail adapter.

Users set per-event/channel preferences except mandatory security, access-revocation, and legally required operational messages. Organization policies may establish defaults without overriding mandatory opt-out rights where applicable.

Delivery records include template/version, recipient, channel, scheduled/sent/delivered/failed timestamps, retry count, provider message ID, and redacted error. Templates are localized, rendered from typed variables, and previewable. Retries use exponential backoff and dead-letter status; administrators can retry safe failures.

Digest mode groups eligible low-priority events daily/weekly in the user's time zone. Reminders use deduplication keys so scheduler retries do not create duplicates.

## Dashboards and action inbox

### Organization dashboard

- Upcoming events and tasks.
- Unread announcements and unresolved issues.
- Pending approvals and offline-sync conflicts for the current user.
- Cash position, upcoming receivables/payables, overdue dues, and budget-versus-actual when accounting is enabled.
- Shared-expense balances and pending settlements when that capability is enabled.

### Action inbox

Create actionable items from domain conditions rather than duplicating domain state. Items link to source, priority, due date, assignees/eligible roles, resolution condition, and completion metadata. Examples include invoice approval, overdue charge review, document expiry, unresolved issue, reconciliation mismatch, and poll close.

Completing a source workflow automatically resolves its action item. Dismissing requires reason and does not mutate the source.

## Reports

Initial report catalog:

- budget versus actual;
- trial balance and general ledger;
- cash/bank/fund statement;
- receivables aging and delinquency;
- payables aging and supplier statement;
- member/unit account statement;
- shared-expense allocation and settlement statement;
- assessment/installment schedule;
- reconciliation report;
- audit activity export.

Reports accept organization, authorized scope, as-of instant/date, period, and relevant filters. Financial figures include drill-down source/posting references and projection sequence. PDF and CSV are generated from the same typed report dataset so totals cannot diverge by format.

Large reports are asynchronous jobs with status, progress, expiry, and authorized download. Generated files store report type, normalized parameters, data sequence/as-of, template version, checksum, creator, and locale so they are reproducible.

## Public API and UI

Expose document metadata/version/upload-session/download endpoints; notification inbox/preferences/subscriptions; dashboard/action-inbox projections; report catalog/parameter schema/jobs/downloads; and administrative delivery logs.

Angular screens include document library/detail/versioning, notification center/preferences, dashboard widgets by capability, action inbox, report launcher/history, drill-down tables, and accessible PDF/CSV download status.

## Offline behavior

- Cache permitted document metadata, in-app notifications, dashboards, and recent report metadata.
- Cache binaries only when category policy permits and provide explicit “available offline” control and storage usage.
- Document uploads and metadata edits use the attachment workflow from Step 5.
- Read markers and safe notification preferences queue offline.
- Financial report generation requires connectivity; previously explicitly downloaded permitted reports may remain offline.

## Security, privacy, and accessibility

- Authorize source, document, search result, report parameters, and download separately.
- Signed URLs are short-lived, non-guessable, and never logged in full.
- Email/push content defaults to minimal sensitive detail and directs the user to authenticated views.
- PDF templates include language, page numbers, generated/as-of timestamps, organization identity, and accessibility-friendly structure where the renderer supports it.
- Notification controls and dashboard status must not rely on color alone.

## Tests

- Upload finalization, checksum/type mismatch, malware quarantine, signed URL expiry, source authorization, retention, versioning, and offline-cache restrictions.
- Recipient/audience resolution, preference exceptions, template variables, localization, retry/dead-letter, digest/reminder deduplication, and revoked push subscription.
- Dashboard capability/permission filtering and action-item automatic resolution.
- Every financial report total reconciles to ledger/read-model fixtures and drill-down lines.
- PDF/CSV totals match, report parameters are authorized, and historical generated metadata is reproducible.
- Cross-tenant search/download attempts and notification leakage tests.

## Acceptance criteria

- Users can securely upload, version, find, download, and audit documents they are authorized to access.
- Notifications are reliable, localized, preference-aware, retryable, and free of sensitive leakage.
- Dashboards show only capability-relevant, permission-safe data with a visible as-of state.
- Every financial report amount is traceable to source records and immutable journal entries.
- Generated PDF and CSV versions of the same report agree exactly.
