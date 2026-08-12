# Step 1 — Foundation and Architecture

## Goal

Establish a deployable monorepo and architecture that can support both product modes without splitting the codebase or prematurely introducing microservices.

## Dependencies and user outcomes

This is the root dependency for every later step. Its direct users are developers and operators: a developer can start, test, and extend the platform consistently, while an operator receives reproducible containers and health signals. No end-user business workflow is delivered in this step.

## Deliverables

### Repository layout

Use a single repository with these top-level concerns:

```text
frontend/       Angular PWA
backend/        Spring Boot modular monolith
infra/          local containers and deployment examples
docs/           product and engineering documentation
```

The backend is one deployable application. Spring Modulith verifies that business modules depend only on public module interfaces. Initial modules are `identity`, `organizations`, `people`, `property`, `collaboration`, `calendar`, `documents`, `sync`, `expenses`, `accounting`, `receivables`, `payables`, `notifications`, `reporting`, and `audit`.

The Angular application is organized by feature area with lazy routes. Shared UI primitives, API clients, authentication state, localization, and offline infrastructure live in platform libraries; business features must not import internal files from one another.

### Backend baseline

- Java 21 and a compatible Spring Boot 3.x release.
- Maven Wrapper with reproducible builds.
- Spring Web, Security, Validation, Data JPA, Modulith, Actuator, and springdoc-openapi.
- Flyway owns all PostgreSQL schema changes; Hibernate schema generation is validation-only outside tests.
- Testcontainers supplies PostgreSQL and S3-compatible integration dependencies.
- Package-by-feature and explicit module APIs; controllers never call another module's repositories.
- Domain events are transactional application events. External brokers are deferred until an actual asynchronous scaling requirement exists.

### Frontend baseline

- Angular standalone APIs, strict TypeScript, strict templates, signals for local state, and RxJS at asynchronous boundaries.
- Angular Router with lazy feature routes and route-level capability/permission guards.
- Angular service worker for application assets; IndexedDB for business data and the outbox.
- Generated typed API client from the committed OpenAPI contract.
- Responsive design tokens and accessible primitives shared by both organization modes.
- Runtime locale loading, with `pt-BR` complete before other locales are accepted.

### Runtime infrastructure

- PostgreSQL is mandatory. Do not add vendor-specific SQL for another database.
- Object storage uses an application port with S3 and local-filesystem adapters. Database records own metadata; binary objects never live in PostgreSQL.
- Email, web push, and object storage are adapters that may be disabled in local development.
- Redis is not a baseline dependency. Add it only for demonstrated distributed caching, locking, or queue needs.
- Local Docker Compose runs PostgreSQL, object storage, mail catcher, backend, and frontend/reverse proxy.
- The production container runs as a non-root user and exposes liveness and readiness probes.

## Public conventions

### API

- Root path: `/api/v1`.
- JSON fields use `camelCase`; enum values use stable `UPPER_SNAKE_CASE` identifiers.
- Collection endpoints use cursor pagination where ordering changes frequently and page/size pagination for stable administrative lists.
- Mutations require `Idempotency-Key`; offline commands additionally include `operationId` in their envelope.
- Validation and domain errors use `application/problem+json` with `type`, `title`, `status`, `code`, `detail`, `instance`, and optional `fieldErrors`.
- Concurrency-controlled resources expose a numeric `version`; updates include that version or an HTTP conditional header.

### Shared scalar contracts

```text
Money       { currency: "BRL", minorUnits: 12345 }
Instant     ISO-8601 UTC timestamp
LocalDate   ISO-8601 calendar date
LocalTime   ISO-8601 local time
Page        { items, nextCursor? } or { items, page, size, totalItems }
Public ID   UUID string
```

The database stores money in `BIGINT`, currency in `CHAR(3)`, instants in `TIMESTAMPTZ`, and local calendar values in matching date/time columns.

## Cross-cutting behavior

- Every request receives a correlation ID and emits structured logs without secrets or sensitive document contents.
- Audit-worthy domain changes publish an internal event consumed by the audit module after successful persistence.
- Feature capabilities are evaluated by both backend policy and frontend navigation. Frontend guards are convenience, never security.
- Database transactions remain inside one business module. Cross-module workflows use public application services and domain events.
- Background work uses a database-backed job/outbox abstraction initially, with retry count, next-attempt timestamp, and dead-letter state.

## Failure handling

- Startup fails if Flyway cannot validate migrations or required secrets are absent.
- Object-storage and email outages do not roll back unrelated persisted business state; the associated background job retries.
- API clients treat unknown response fields as forward-compatible and unknown enum values as unsupported states, not silent defaults.
- PWA update activation is user-visible when unsynchronized operations exist; an update must never discard the outbox.

## Tests

- Architecture tests enforce backend module boundaries and frontend import boundaries.
- OpenAPI generation is deterministic and fails CI on uncommitted changes.
- Testcontainers validates migrations against PostgreSQL.
- Smoke test starts the complete Compose stack and verifies frontend, API, database, and object storage health.
- Money serialization, UTC conversion, Problem Details, correlation IDs, and idempotency middleware have contract tests.

## Acceptance criteria

- A developer can clone the fresh repository and start all services with one documented command.
- CI builds frontend/backend, runs unit and integration tests, checks formatting without rewriting files, validates architecture, and produces containers.
- An empty organization-neutral shell installs as a PWA and calls a versioned health/API metadata endpoint.
- The generated OpenAPI client compiles in strict TypeScript mode.
- No business module bypasses module APIs to access another module's persistence layer.

## Out of scope

Business screens, user authentication, tenant data, message brokers, Kubernetes manifests, and production autoscaling are handled in later steps.
