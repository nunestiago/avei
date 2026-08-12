# Community Platform Rewrite Roadmap

This folder is the implementation roadmap for a fresh-start community platform. It does not prescribe a migration from the existing Laravel application.

The product is one installable Angular PWA with two experiences:

- **Condominium mode** for buildings, units, residents, budgets, dues, suppliers, and formal operational accounting.
- **Community mode** for residential communities and associations using announcements, calendars, discussions, polls, tasks, documents, and shared expenses.

Both modes use the same identity, membership, permission, document, notification, synchronization, audit, and accounting foundations. Organization capabilities determine the available navigation and workflows; the frontend is not forked into separate products.

## Technology baseline

- Angular PWA with TypeScript, standalone components, signals, Angular Router, and IndexedDB.
- Java 21 with Spring Boot, Spring Modulith, Spring Security, Spring Data JPA, Flyway, and Bean Validation.
- PostgreSQL as the only relational database.
- REST API under `/api/v1`, documented with OpenAPI.
- S3-compatible object storage with a filesystem adapter for simple self-hosted deployments.
- Docker images and Docker Compose for self-hosting; stateless application nodes for cloud deployment.
- Brazilian Portuguese as the default language, BRL as the default currency, UTC storage, and organization-level time zones.

## Delivery sequence

| Step | Document | Depends on | Main outcome |
|---|---|---|---|
| 1 | [Foundation and architecture](01-foundation-and-architecture.md) | — | Running frontend/backend skeleton and enforceable module boundaries |
| 2 | [Identity, tenancy, and security](02-identity-tenancy-and-security.md) | 1 | Secure multi-organization access |
| 3 | [Organizations, members, and properties](03-organizations-members-and-properties.md) | 2 | Community and condominium master data |
| 4 | [Collaboration suite](04-collaboration-suite.md) | 3 | Coordination workflows for members |
| 5 | [PWA offline and synchronization](05-pwa-offline-and-sync.md) | 2–4 | Full offline command capture and deterministic synchronization |
| 6 | [Shared expenses and settlements](06-shared-expenses-and-settlements.md) | 3, 5 | Flexible expense sharing and balances |
| 7 | [Accounting core](07-accounting-core.md) | 2, 3, 5 | Immutable double-entry ledger |
| 8 | [Budgets, dues, and receivables](08-budgets-dues-and-receivables.md) | 6, 7 | Condominium/community revenue cycle |
| 9 | [Suppliers, invoices, and payments](09-suppliers-invoices-and-payments.md) | 7 | Accounts payable and manual Pix-aware payments |
| 10 | [Documents, notifications, and reporting](10-documents-notifications-and-reporting.md) | 4, 7–9 | Operational visibility and communication |
| 11 | [Hardening, deployment, and release](11-hardening-deployment-and-release.md) | 1–10 | Production-ready first release |
| 12 | [Future community expansion](12-future-community-expansion.md) | 11 | Governed post-release backlog |

Steps are dependency ordered. Steps 4 and 5 may overlap after the shared command contracts exist; steps 8 and 9 may be developed in parallel after the accounting posting API is stable.

## Shared domain language

- **Organization:** tenant boundary and owner of business data.
- **Organization type:** `CONDOMINIUM`, `RESIDENTIAL_COMMUNITY`, or `ASSOCIATION`.
- **Capability:** organization feature switch such as `ACCOUNTING`, `PROPERTY_STRUCTURE`, `POLLS`, or `SHARED_EXPENSES`.
- **Membership:** a user's time-bounded relationship with an organization and its roles.
- **Household:** optional grouping of people who participate together.
- **Unit:** a condominium property or community lot/home.
- **Command:** an idempotent request to change domain state, online or offline.
- **Posting:** a balanced immutable accounting entry accepted by the server.

## Global engineering rules

1. Every tenant-owned row contains `organization_id`; authorization derives organization context from authenticated membership, never from a trusted client claim alone.
2. Public IDs are UUIDs. Database sequences may exist only as private implementation details.
3. Money is represented by currency plus integer minor units. Financial code must not use floating point.
4. Posted accounting data is append-only. Corrections use explicit reversal or adjustment entries.
5. Every mutating API accepts an idempotency/operation ID and participates in audit logging.
6. All stored timestamps are UTC instants. Calendar-only dates and local times remain explicit local types with an IANA time zone.
7. API failures use RFC 7807 Problem Details with stable machine-readable error codes.
8. Accessibility target is WCAG 2.2 AA. The UI is mobile-first and keyboard operable.
9. Portuguese strings are never embedded in domain code. Backend messages expose codes; the PWA localizes user-facing text.
10. No phase is complete without tenant-isolation, authorization, accessibility, offline behavior, and automated test coverage relevant to that phase.

## First-release exclusions

- Importing data from the Laravel application.
- Brazilian tax filings or government submission integrations.
- Payment-provider Pix or boleto collection.
- Native iOS/Android applications.
- Public social-network discovery or advertising.
- Microservices; extraction is considered only after measured operational need.

## Global definition of done

A roadmap step is complete when its schema migrations, domain behavior, OpenAPI contract, Angular flows, permissions, offline policy, audit events, automated tests, operational documentation, and acceptance scenarios are implemented and reviewed. A feature hidden behind a capability must be unavailable in both navigation and backend authorization when disabled.

