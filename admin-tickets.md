# Admin Dashboard Tickets (Angular)

## Ticket 1: Admin Dashboard Setup
**Description:** Set up routing and base components in the Angular app. Install dependencies for API calls, charts (for reports), and auth.

**Acceptance Criteria:**
- Routes for dashboard, users, duties, bills.
- Base layout with navigation.
- API service configured.
- App builds and runs.

**Dependencies:** None (parallel with backend).

## Ticket 2: Authentication in Admin
**Description:** Implement admin login and JWT handling. Secure routes for admin role.

**Acceptance Criteria:**
- Login form for admins.
- Token management.
- Route guards for admin access.
- Redirect on unauthorized.

**Dependencies:** Backend Ticket 2, Admin Ticket 1.

## Ticket 3: User Management
**Description:** Build components for viewing/editing users (members/admins). Integrate with backend User API.

**Acceptance Criteria:**
- User list and edit forms.
- CRUD operations.
- Role assignment.
- Tests for components.

**Dependencies:** Backend Ticket 1, Admin Ticket 1, Admin Ticket 2.

## Ticket 4: Duties Oversight
**Description:** Create components for managing duties: view all, assign, rotate manually. Display reports.

**Acceptance Criteria:**
- Duties dashboard with list.
- Assign/rotate actions.
- Charts for completion rates.
- Integration with backend.

**Dependencies:** Backend Ticket 3, Admin Ticket 1, Admin Ticket 2.

## Ticket 5: Bills Administration
**Description:** Develop components for overseeing bills: view all, edit splits, track payments. Include reports.

**Acceptance Criteria:**
- Bills list and detail views.
- Edit payment statuses.
- Reports on outstanding payments.
- API integration.

**Dependencies:** Backend Ticket 4, Admin Ticket 1, Admin Ticket 2.

## Ticket 6: System Reports
**Description:** Add dashboard overview with stats on users, duties, bills, chat activity. Use charts.

**Acceptance Criteria:**
- Main dashboard with KPIs.
- Charts for trends (e.g., duty completions).
- Real-time data from backend.
- Responsive design.

**Dependencies:** All Backend Tickets, All Admin Tickets 3-5.