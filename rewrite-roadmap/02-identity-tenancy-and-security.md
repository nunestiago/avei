# Step 2 — Identity, Tenancy, and Security

## Goal

Provide secure identity and strict organization isolation for users who may hold different roles in multiple organizations.

## Dependencies and user outcomes

Depends on Step 1. Users can create or recover an account, protect it with MFA, accept invitations, switch organizations, inspect active sessions, and sign out devices. Organization administrators can invite, suspend, and authorize members without gaining permissions they cannot delegate.

## Domain model

- `User`: global identity with email, display name, locale, status, security timestamps, and no organization ownership.
- `Credential`: password hash and password-change metadata; isolated so an OIDC identity can replace it later.
- `ExternalIdentity`: provider plus immutable provider subject, reserved for future OIDC login.
- `Organization`: tenant root with type, status, default locale, currency, time zone, and enabled capabilities.
- `Membership`: user/organization relationship with `INVITED`, `ACTIVE`, `SUSPENDED`, or `ENDED` status and effective dates.
- `Role`: organization-scoped named bundle of permissions. System role templates may be copied but not mutated globally.
- `MembershipRole`: time-bounded role assignment.
- `Invitation`: single-use, expiring token tied to organization, email, and proposed roles.
- `Session`: refresh-token family, device metadata, expiry, rotation state, and revocation reason.
- `MfaMethod` and recovery codes.

All tenant-owned records include `organization_id`. Repositories require an explicit organization context. Tests must prove that a guessed UUID from another organization is indistinguishable from a missing resource unless disclosure is explicitly safe.

## Authentication flows

### Local sign-in

1. User submits email/password and optional device label.
2. Rate limits apply to normalized email and source address without revealing account existence.
3. If MFA is enabled, issue a short-lived challenge rather than an application session.
4. After verification, issue a short-lived access token and a rotating refresh token in `Secure`, `HttpOnly`, `SameSite=Lax` cookies.
5. The access token contains user/session identity, not authoritative organization permissions. Membership is checked server-side.

Refresh-token reuse revokes the token family and all access derived from it. Password reset and explicit “sign out all devices” also revoke relevant sessions.

### Invitation and onboarding

- An administrator enters email and roles for an organization.
- Existing users accept into their account; new users create credentials and verify email first.
- Tokens are hashed at rest, expire, and are invalid after one acceptance or revocation.
- Invitations cannot elevate the inviter beyond permissions they can assign.

### Organization switching

The selected organization is client context, sent as a route segment or header. The backend confirms active membership on every tenant request and loads current permissions. Switching clears organization-specific in-memory state and activates the corresponding IndexedDB partition without deleting other authorized offline partitions.

## Permission model

Define stable permissions by action, including:

```text
ORGANIZATION_VIEW, ORGANIZATION_MANAGE
MEMBERS_VIEW, MEMBERS_INVITE, MEMBERS_MANAGE, ROLES_MANAGE
PROPERTY_VIEW, PROPERTY_MANAGE
ANNOUNCEMENTS_VIEW, ANNOUNCEMENTS_PUBLISH, ANNOUNCEMENTS_MODERATE
CALENDAR_VIEW, CALENDAR_MANAGE
DOCUMENTS_VIEW, DOCUMENTS_MANAGE
EXPENSES_VIEW, EXPENSES_CREATE, EXPENSES_APPROVE, EXPENSES_SETTLE
ACCOUNTING_VIEW, ACCOUNTING_POST, ACCOUNTING_CLOSE_PERIOD
RECEIVABLES_VIEW, RECEIVABLES_MANAGE
PAYABLES_VIEW, PAYABLES_APPROVE, PAYABLES_PAY
REPORTS_VIEW, AUDIT_VIEW
```

Default role templates are `ORGANIZATION_ADMIN`, `MANAGER`, `TREASURER`, `MODERATOR`, `MEMBER`, `RESIDENT`, `SUPPLIER_CONTACT`, and `READ_ONLY`. Organization type determines which templates are offered. The backend checks permissions and capabilities separately.

## Public API

- `/api/v1/auth/register`, `/login`, `/mfa/challenge`, `/refresh`, `/logout`, `/password/*`, `/sessions`.
- `/api/v1/me` returns profile and active memberships without secret security metadata.
- `/api/v1/organizations/{organizationId}/memberships`, `/invitations`, `/roles`, and `/permissions`.
- Membership responses include effective roles, computed permissions, version, and synchronization revocation marker.

Authentication endpoints must not be queued for offline synchronization.

## Offline and revoked access

- A signed-in user may open already cached authorized data and create drafts while offline.
- Synchronization requires a valid refreshed session. If the session expired, preserve the outbox and request authentication.
- On membership suspension/end, the next authenticated sync returns a revocation tombstone; the client deletes that organization's cached data and queued unauthorized commands.
- Manual logout deletes local access material and cached tenant data from that device. Unsynchronized data requires explicit warning and confirmation before deletion.
- Sensitive credentials, MFA secrets, complete Pix keys, and private document URLs are never stored in IndexedDB.

## Security and LGPD baseline

- Argon2id password hashing with parameters configurable and rehashed on login when outdated.
- TOTP MFA plus one-time hashed recovery codes; WebAuthn is a later compatible addition.
- CSRF protection for cookie-authenticated mutations, strict CORS allowlist, CSP, HSTS, MIME sniffing protection, and sanitized filenames.
- Audit successful and failed administrative/security operations without recording passwords, tokens, or MFA codes.
- Support profile export, correction, consent history where consent is the legal basis, and account anonymization requests. Financial/audit records subject to legal retention are restricted rather than deleted.
- Encrypt secrets and especially sensitive fields at the application or storage layer; TLS is mandatory outside local development.

## Tests

- Login, MFA, recovery code, reset, rotation, reuse detection, expiry, and session revocation.
- Invitation acceptance for new/existing users, token replay, expiry, wrong email, and unauthorized role assignment.
- Cross-organization reads and writes for every repository pattern.
- Permission removal takes effect without requiring a new login.
- Offline session expiry preserves commands; membership revocation purges the correct partition.
- CSRF, CORS, rate-limit, user enumeration, cookie flags, and audit redaction tests.

## Acceptance criteria

- One user can switch among several organizations and receive different capabilities and permissions in each.
- A suspended membership cannot read, mutate, sync, or download that organization's data.
- Administrators can define roles only from permissions they are authorized to delegate.
- MFA and recovery flows are complete and accessible in Brazilian Portuguese.
- Security-sensitive activity is traceable without exposing secrets.
