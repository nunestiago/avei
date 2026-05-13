# Mobile Tickets (React Native)

## Ticket 1: Mobile App Setup
**Description:** Set up navigation and base screens in the Expo Router app. Install additional dependencies for auth, API calls, and offline storage (AsyncStorage).

**Acceptance Criteria:**
- Navigation structure defined (tabs for duties, bills, chat, calendar).
- Base screens created.
- AsyncStorage configured for offline queue.
- App runs without errors.

**Dependencies:** None (parallel with backend setup).

## Ticket 2: Authentication in Mobile
**Description:** Implement login/register screens and JWT token management. Integrate with backend auth APIs.

**Acceptance Criteria:**
- Login/register forms.
- Token stored securely.
- Redirect to main app on auth.
- Error handling for invalid credentials.

**Dependencies:** Backend Ticket 2.

## Ticket 3: Duties Feature in Mobile
**Description:** Build screens for viewing assigned duties, marking complete, and viewing rotation history. Fetch from backend API.

**Acceptance Criteria:**
- Duties list screen.
- Mark complete action.
- Offline queue for completions.
- Sync on reconnect.

**Dependencies:** Backend Ticket 3, Mobile Ticket 1, Mobile Ticket 2.

## Ticket 4: Bills Feature in Mobile
**Description:** Create screens for viewing bills, paying shares, and tracking payments. Integrate with backend.

**Acceptance Criteria:**
- Bills list and detail screens.
- Pay share functionality.
- Offline queue for payments.
- Sync mechanism.

**Dependencies:** Backend Ticket 4, Mobile Ticket 1, Mobile Ticket 2.

## Ticket 5: Chat in Mobile
**Description:** Implement chat interface with WebSocket for real-time messages. Display message history.

**Acceptance Criteria:**
- Chat screen with message list.
- Send/receive messages.
- Offline queue for sends.
- Fallback to polling if WebSocket fails.

**Dependencies:** Backend Ticket 5, Mobile Ticket 1, Mobile Ticket 2.

## Ticket 6: Calendar in Mobile
**Description:** Add calendar view for events and duty schedules. Allow viewing events.

**Acceptance Criteria:**
- Calendar screen with events.
- Integration with duties schedules.
- Offline caching of events.
- Sync on load.

**Dependencies:** Backend Ticket 6, Mobile Ticket 1, Mobile Ticket 2.

## Ticket 7: Offline Support Implementation
**Description:** Fully implement queuing for all actions (duties, bills, chat) using AsyncStorage. Add sync logic on app start/network reconnect.

**Acceptance Criteria:**
- Queue persists offline.
- Sync retries failed actions.
- UI indicators for offline/online.
- Manual sync button.

**Dependencies:** All Mobile Tickets 3-6.