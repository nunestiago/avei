# Step 11 — Hardening, Deployment, and Release

## Goal

Make the first complete release secure, operable, recoverable, accessible, and deployable both by self-hosters and a managed cloud service.

## Dependencies and user outcomes

Depends on completion of Steps 1–10. Installers can deploy, configure, upgrade, back up, restore, and diagnose the product from versioned artifacts. Pilot users receive a Portuguese, accessible, monitored release whose collaboration and financial workflows have been reconciled in production-like conditions.

## Quality gates

### Automated test pyramid

- Java unit tests for domain rules and posting calculations.
- PostgreSQL/Testcontainers integration tests for repositories, Flyway, locking, isolation, jobs, and projections.
- Module tests for public application interfaces and domain events.
- OpenAPI contract tests and generated Angular client compilation.
- Angular component tests for state/validation/accessibility and browser E2E tests for critical journeys.
- PWA/offline test suite covering install, upgrade, reconnect, outbox, conflicts, revocation, and storage limits.
- Security tests for authentication, authorization, tenant isolation, upload/download, injection, and common OWASP risks.
- Performance tests for high-risk lists, sync batches, report generation, installment allocation, and posting concurrency.

CI rejects a change when architecture rules, migrations, contracts, tests, formatting checks, dependency vulnerability policy, secret scan, or container scan fail. Coverage thresholds are guardrails, not substitutes for required domain scenario tests.

## Deployment artifacts

### Self-hosted profile

- Versioned backend and frontend/reverse-proxy containers.
- Docker Compose with PostgreSQL and optional local S3-compatible storage/mail relay.
- Environment-variable/secret-file configuration with documented minimum resources.
- One-command database migration executed as an explicit release job before application rollout.
- Administrator runbook for initial organization/user creation, SMTP, web push keys, storage, backup, upgrade, and rollback.

### Cloud profile

- Same immutable containers; backend remains stateless apart from PostgreSQL/object storage.
- Managed PostgreSQL, S3-compatible object storage, external secret manager, load balancer/TLS, and horizontally scalable app nodes.
- Jobs use database leasing so multiple nodes do not duplicate execution.
- Organization data remains logically isolated in shared infrastructure; dedicated database deployments are a future enterprise option.

## Configuration and secrets

Validate typed settings at startup. Secrets never appear in images, repositories, logs, actuator output, or frontend bundles. Rotate signing, SMTP, storage, and web-push credentials through documented procedures. CORS origins, cookie domain/security, public base URL, storage limits, retention defaults, and feature policies are explicit environment settings.

## Observability

- Structured JSON logs with timestamp, severity, service version, correlation ID, organization ID where safe, user/session pseudonymous ID, module, and error code.
- Metrics for HTTP latency/errors, authentication failures, DB pool, job backlog/failures, notification delivery, object-storage errors, sync outcomes/conflicts, projection lag, report duration, and financial posting rejection.
- Distributed tracing at HTTP, database, job, and external adapter boundaries; never attach sensitive payloads.
- Readiness checks database and required storage; liveness only checks process health to avoid restart storms.
- Alerts include actionable thresholds and links to runbooks.

## Backup and disaster recovery

- Automated PostgreSQL full backups plus point-in-time recovery where deployment supports it.
- Object-storage versioning/backup aligned with document database records.
- Encrypted backup storage, access auditing, retention, and restore credentials isolated from application credentials.
- Scheduled restore drills into an isolated environment verify database, document checksums, projections, authentication reset process, and report access.
- Define release targets before launch: managed cloud RPO ≤ 15 minutes and RTO ≤ 4 hours; self-hosted defaults depend on configured backup frequency and are stated honestly.

## Database and release policy

- Flyway migrations are forward-only, reviewed, and safe for supported rolling deployment where applicable.
- Use expand/migrate/contract for breaking schema changes. Destructive cleanup occurs only after at least one compatible release.
- Application rollback is permitted only while its schema compatibility window remains valid. Data correction uses audited scripts/tools, never manual undocumented edits.
- Semantic product versions and release notes list schema version, required configuration, offline database migration, and known compatibility constraints.
- PWA deployment detects a new version; forced activation waits until outbox safety checks complete.

## Security and privacy release review

- Threat model identity, cross-tenant access, offline storage, document sharing, financial posting, Pix/bank data, and administrator abuse.
- Independent penetration test or structured external review before broad production use.
- LGPD inventory identifies purpose/legal basis, data owner, retention, export/correction flow, incident response, and subprocessors.
- Dependency SBOM is produced for frontend/backend images.
- Incident response includes severity, containment, tenant communication, evidence preservation, credential rotation, and postmortem.

## Accessibility and localization

- WCAG 2.2 AA review for keyboard, focus, semantics, contrast, zoom, screen readers, validation, tables, dialogs, calendars, and financial charts.
- Complete `pt-BR` translation, Brazilian dates/numbers/currency, and organization-time-zone review.
- Pseudolocalization catches embedded strings and layout assumptions before adding other locales.

## Pilot and launch sequence

1. Internal demo organization with generated non-sensitive data.
2. Community pilot focused on collaboration, offline sync, and shared expenses.
3. Condominium pilot focused on property relationships, accounting, dues, invoices, and reports.
4. Resolve critical/high defects and reconcile pilot accounting independently.
5. Release self-hosted installation and managed cloud onboarding with the same acceptance checklist.

No legacy Laravel data migration is supplied. Pilot organizations start fresh or use documented generic CSV onboarding templates for non-financial master data only.

## Acceptance criteria

- A clean environment can deploy and upgrade using only versioned artifacts and documentation.
- Backup restoration is demonstrated, timed, and checksum-verified.
- Tenant-isolation, accounting-invariant, offline-retry, and authorization test suites pass in production-like infrastructure.
- Critical user journeys meet accessibility and Portuguese-localization review.
- Operators can detect and diagnose failed synchronization, jobs, notifications, reports, storage, and postings using dashboards/runbooks.
- Pilot financial balances independently reconcile to source documents and journal entries before general availability.
