# Step 4 — Collaboration Suite

## Goal

Deliver the coordination capabilities shared by condominiums, residential communities, and associations: announcements, discussions, calendar, polls, tasks, directory, documents, and issue reporting.

## Dependencies and user outcomes

Depends on Steps 2–3. Members can coordinate work, receive targeted information, participate in discussions and polls, share events/documents, and report issues. Moderators and managers can publish, approve, assign, and moderate according to organization policy.

## Shared publication model

Content that targets members uses a common audience contract:

```text
Audience {
  organizationId,
  everyone: boolean,
  groupIds: UUID[],
  unitIds: UUID[],
  roleIds: UUID[],
  personIds: UUID[]
}
```

Recipients are resolved at publication time for delivery/audit and at read time for current access. A member must match at least one selector. Authors cannot target an audience broader than their permission allows.

Common content states are `DRAFT`, `PENDING_APPROVAL`, `PUBLISHED`, `ARCHIVED`, and `REJECTED`. Scheduled publication uses organization time zone and records the resulting UTC instant. Published revisions retain author, timestamp, and change summary.

## Features

### Announcements

- Rich but sanitized content, attachments, priority, audience, scheduled publication, expiry, acknowledgement request, and pinning.
- Administrators can require approval by capability or role.
- Read and acknowledgement receipts are available only to authorized publishers and honor privacy policy.

### Discussions and comments

- Organization/group discussion threads with comments, replies one level deep, attachments, mentions, reactions, locking, reporting, and moderation.
- Edits preserve revision metadata. Deletion becomes a tombstone when replies or audit requirements exist.
- Moderators may hide content with a reason; the author can see moderation status without seeing private moderator notes.

### Shared calendar

- Events with local start/end, IANA time zone, location, virtual link, audience, capacity, RSVP, reminders, and attachments.
- Recurrence uses an RFC 5545-compatible rule plus explicit occurrence exceptions.
- Editing one occurrence, this and future occurrences, or the entire series has distinct commands.
- Calendar export uses authenticated, revocable iCalendar feed tokens; import is deferred.

### Polls and voting

- Polls support single choice, multiple choice, and yes/no; open/close instants; audience; anonymity; result visibility; and quorum metadata.
- Anonymous polls keep voter eligibility/participation separate from selected choices. The system must not claim legally binding condominium voting in the first release.
- Published votes cannot be edited after close. Poll creators cannot change choices after the first vote.

### Tasks

- Tasks have title, description, status, due date, priority, assignees, watchers, checklist, labels, attachments, and links to issues/events.
- Initial workflow: `OPEN`, `IN_PROGRESS`, `BLOCKED`, `DONE`, `CANCELLED`.
- Assignees must be active members or explicitly authorized supplier contacts.

### Issue reporting

- Member reports contain category, description, location/unit visibility, priority, attachments, and reporter privacy.
- Workflow: `NEW`, `TRIAGED`, `IN_PROGRESS`, `WAITING`, `RESOLVED`, `CLOSED`, `REJECTED`.
- Comments may be public to the issue audience or internal to staff. Status changes require reason where configured.
- Issues can create tasks but do not yet create maintenance assets or supplier invoices automatically.

### Member directory and documents

- Directory displays only contact fields that the person and organization policy permit.
- Document library basics include folders/categories, audience, attachment metadata, version, and download authorization. Advanced expiry, reporting, and delivery appear in Step 10.

## Public API and UI

Provide organization-scoped resources for announcements, discussions/comments, calendar events/occurrences, polls/votes, tasks, issues, directory, and documents. Mutations are command-oriented where state transitions matter (`publish`, `approve`, `vote`, `resolve`) rather than generic status updates.

Angular provides capability-driven sections, a unified activity view, list/detail/create flows, calendar month/list views, moderation queue, task board/list, issue tracker, and accessible poll voting. Deep links must survive organization switching and redirect unauthorized users without leaking titles.

## Notifications

Features emit semantic events such as `AnnouncementPublished`, `MemberMentioned`, `EventReminderDue`, `TaskAssigned`, `IssueStatusChanged`, and `PollClosingSoon`. Step 10 maps these to in-app, push, and email delivery. Until then, an in-app event inbox is sufficient.

## Offline behavior

- Cached content is readable offline subject to the last known authorization.
- Drafts, comments, votes, RSVPs, task updates, and issue reports can be queued offline.
- A vote synced after poll close is rejected with a recoverable outcome; the UI keeps the local attempt for explanation but does not count it.
- Concurrent comment additions merge. Concurrent edits to the same content version require review.
- Attachments are staged locally and uploaded through resumable operations before their parent command is finalized.

## Permissions and moderation

Each feature separates view, create, publish/manage, approve, and moderate permissions where relevant. Internal issue comments require staff permission. Anonymous poll identities are accessible only for abuse/security audit and never through normal product APIs.

## Tests

- Audience combinations, membership changes, and unauthorized deep links.
- Scheduled/expired announcements and organization-time-zone transitions.
- Recurrence exceptions across daylight-saving changes in applicable zones.
- Poll eligibility, anonymity, close races, duplicate offline votes, and quorum calculations.
- Task assignment to inactive members and issue public/internal comment visibility.
- HTML sanitization, attachment authorization, moderation history, mentions, and notification event emission.
- Offline creation, retries, merges, rejected transitions, and local explanation states.

## Acceptance criteria

- A residential community can coordinate members entirely through the PWA without enabling accounting.
- Every published item has a traceable author, audience, state history, and revision metadata.
- Members see only content matching their organization membership and audience.
- Poll anonymity is preserved by the normal API and UI.
- All core creation workflows remain usable offline and communicate synchronization outcomes clearly.
