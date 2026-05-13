# Backend Tickets (Spring Boot)

## Ticket 1: Backend Setup
**Description:** Enhance the existing Spring Boot project by adding dependencies for JPA (PostgreSQL), WebSocket, Spring Security, and Actuator. Configure database connection and create base entities/repositories for User, Duty, Bill, Message, and Event.

**Acceptance Criteria:**
- build.gradle.kts updated with required dependencies.
- application.properties configured for PostgreSQL.
- Base entities (User, Duty, Bill, Message, Event) and repositories created.
- Project builds without errors.

**Dependencies:** None.

## Ticket 2: Authentication System
**Description:** Implement JWT-based authentication with Spring Security. Add user registration/login endpoints, role-based access (member/admin), and token validation.

**Acceptance Criteria:**
- JWT tokens issued on login.
- Endpoints secured with roles.
- Password hashing implemented.
- Unit tests for auth flow.

**Dependencies:** Ticket 1.

## Ticket 3: Duties Management API
**Description:** Develop REST APIs for CRUD operations on duties (create, assign, complete). Implement rotation logic (e.g., weekly reassignment via scheduled task).

**Acceptance Criteria:**
- Endpoints: GET/POST/PUT duties, assign to user, mark complete.
- Rotation runs automatically (e.g., @Scheduled).
- Integration with User entity.
- Tests for duty lifecycle.

**Dependencies:** Ticket 1, Ticket 2.

## Ticket 4: Bills and Payments API
**Description:** Build APIs for creating bills, splitting costs (default equal), and tracking payments. Allow updating payment status.

**Acceptance Criteria:**
- Endpoints: Create bill, split shares, record payments.
- Bill entity links to users.
- Payment tracking per user.
- Tests for bill splitting and payments.

**Dependencies:** Ticket 1, Ticket 2.

## Ticket 5: Chat System
**Description:** Implement WebSocket for real-time messaging. Persist messages in DB. Support group chats.

**Acceptance Criteria:**
- WebSocket endpoint for sending/receiving messages.
- Messages stored in DB.
- Basic group chat functionality.
- Tests for message persistence.

**Dependencies:** Ticket 1, Ticket 2.

## Ticket 6: Calendar API
**Description:** Create APIs for managing events and duty schedules. Integrate with duties for schedule views.

**Acceptance Criteria:**
- Endpoints: CRUD events, view duty schedules.
- Event entity with dates.
- Integration with Duty rotation.
- Tests for event management.

**Dependencies:** Ticket 1, Ticket 2, Ticket 3.