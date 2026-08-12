# Step 3 — Organizations, Members, and Properties

## Goal

Build the canonical master data shared by community and condominium workflows while keeping property-specific concepts optional.

## Dependencies and user outcomes

Depends on Steps 1–2. Administrators can onboard an organization, configure its product capabilities, build its directory/property structure, and invite people. Members can maintain permitted profile information and see the organization, groups, household, and units relevant to them.

## Organization configuration

`Organization` contains name, legal/display identifiers, type, status, locale, currency, time zone, address, branding, fiscal-year defaults, and capabilities. Supported types are:

- `CONDOMINIUM`: enables property structure and operational accounting by default.
- `RESIDENTIAL_COMMUNITY`: enables households, units/lots, collaboration, and shared expenses.
- `ASSOCIATION`: enables members, groups, collaboration, and shared expenses; property structure is optional.

Capabilities are stable identifiers, not arbitrary UI flags. Initial capabilities include `PROPERTY_STRUCTURE`, `SUPPLIERS`, `COLLABORATION`, `POLLS`, `TASKS`, `DOCUMENTS`, `SHARED_EXPENSES`, `ACCOUNTING`, `RECEIVABLES`, and `PAYABLES`. Type sets defaults, but an administrator may enable only compatible capabilities. Disabling a populated capability hides new operations but preserves authorized read/export access until an explicit archival workflow is completed.

## People and membership model

- `Person`: organization-owned natural or legal person record. It may exist without a login.
- `UserLink`: optional association between a global `User` and an organization `Person`.
- `Membership`: access relationship defined in Step 2; it references a person when the user participates as a known member/resident.
- `Household`: named group of people sharing participation or responsibility.
- `Group`: committee, working group, interest group, or audience segment with members and moderators.
- `ContactPoint`: typed email, phone, messaging handle, or address with visibility level.
- `EmergencyContact`: restricted contact relationship visible only to authorized roles.

A person can have several roles and property relationships over time. Do not encode owner, tenant, treasurer, or committee member as columns on `Person`.

Brazilian CPF/CNPJ fields are optional, access-controlled, normalized, validated when present, encrypted where appropriate, and never returned in list projections unless explicitly required. Duplicate detection warns authorized operators but does not merge records automatically.

## Property model

- `PropertyComplex`: condominium/site root used when an organization manages more than one physical complex.
- `Building`: building, block, tower, or sector within a complex.
- `Unit`: apartment, house, lot, commercial unit, parking space, storage room, or other independently tracked property.
- `UnitLink`: parent/related-unit association for parking and storage dependencies.
- `OccupancyRelationship`: person/household to unit relationship with type, effective interval, responsibility percentages, and contact visibility.
- `AllocationWeight`: effective-dated weight/fraction used by later expense-allocation rules.

Relationship types initially include `OWNER`, `CO_OWNER`, `TENANT`, `OCCUPANT`, `USUFRUCTUARY`, and `RESPONSIBLE_PARTY`. The allocation engine uses configured responsibility rules; it must not infer legal liability from display labels.

Historical relationships are ended, not overwritten. No two active relationships violating organization-configured ownership or occupancy constraints may be saved.

## Suppliers

Create a reusable `Supplier` master record with organization ownership, legal name, trade name, CPF/CNPJ, categories, contacts, addresses, status, notes, and payment details. Bank and Pix data are protected fields with restricted list projections and audit events on change. Supplier invoices and payments are introduced in Step 9.

## Main workflows

### Organization onboarding

1. User creates organization and becomes `ORGANIZATION_ADMIN`.
2. Select organization type, locale, time zone, and enabled optional capabilities.
3. Configure organization profile and privacy defaults.
4. For property organizations, create complex/building/unit structure manually or through a validated CSV template.
5. Add people/households, create effective relationships, then invite selected people to user accounts.

### Member lifecycle

- Person records can be created before invitations.
- Linking an invited user requires matching the invitation and explicit confirmation; email similarity alone is insufficient.
- Ending a membership removes access but preserves the person and historical relationships.
- Moving residents closes old occupancy relationships and opens new ones atomically.

## Public API and UI

Expose organization-scoped resources under `/api/v1/organizations/{organizationId}` for profile, capabilities, people, households, groups, complexes, buildings, units, relationships, allocation weights, and suppliers.

Lists provide search, status filters, effective-date filters, and stable projections. Sensitive details require detail endpoints and explicit permissions. CSV import is a three-step API: upload/parse, validate/preview, then idempotent commit.

Angular routes use `/o/:organizationId/...`. Navigation derives from capabilities and permissions. Core screens include organization setup, organization switcher, directory, person detail, groups, property tree, unit detail/timeline, suppliers, and import preview.

## Offline behavior

- Master-data reads are available from IndexedDB after first synchronization.
- New people, units, groups, and draft relationships can be created offline with UUIDs.
- Commands that violate uniqueness or effective-date constraints enter review after sync; the server never silently chooses a winner.
- Sensitive identifiers and full payment data are excluded from normal offline projections.
- CSV import and capability disable/archive workflows require connectivity.

## Permissions

Separate view/manage permissions for organization profile, members, private contact data, property structure, groups, suppliers, sensitive identifiers, and imports. Members may edit their permitted profile/contact fields but cannot alter legal/property relationships.

## Tests

- Organization type defaults and incompatible capability combinations.
- Multi-organization person/user links and tenant isolation.
- Effective-dated property relationships, moves, overlap rejection, and historical reads.
- CPF/CNPJ normalization, masking, restricted projections, and audit events.
- Import preview errors, duplicate rows, idempotent commit, and rollback on invalid batches.
- Offline UUID creation, concurrent updates, and uniqueness conflict review.

## Acceptance criteria

- Administrators can onboard each supported organization type without encountering irrelevant mandatory fields.
- One user can represent different person records and roles in different organizations.
- A condominium can model buildings, units, ownership/occupancy history, and allocation weights.
- An association can operate with members and groups and no property structure.
- Sensitive identity and supplier-payment details are permission-protected and audited.
