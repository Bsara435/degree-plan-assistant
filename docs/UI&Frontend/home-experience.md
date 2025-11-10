# Authenticated Home Experience

This document explains the authenticated mobile-first experience built on November 10, 2025. It covers the new routes, shared layout, navigation behaviour, resource placeholders, and how the login/sign-up flows now hand off to the experience.

---

## Overview

- Introduced a **bottom navigation layout** that anchors a four-tab experience (Home, Resources, Chat, Settings) for authenticated users.
- Delivered redesigned screen content that mirrors the provided mobile mock-up.
- Updated authentication helpers and flow logic so successful login or sign-up takes users directly into the new experience.
- Seeded placeholder documents under `public/resources/**` for future replacement with official academic materials.

---

## Route & Layout Structure

| Route | Purpose | Key Files |
|-------|---------|-----------|
| `/home` | Landing experience with welcome card, “Start A Conversation” call-to-action, and resource shortcuts. | `app/(main)/home/page.tsx` |
| `/resources` | Document hub segmented into flowcharts, catalogues, and degree-plan templates. | `app/(main)/resources/page.tsx` |
| `/chat` | Messaging overview showing sample advisor conversations plus entry point for new chat workflow. | `app/(main)/chat/page.tsx` |
| `/chat/new` | Temporary placeholder describing upcoming conversation intake form. | `app/(main)/chat/new/page.tsx` |
| `/settings` | Profile snapshot, support info, and logout control. | `app/(main)/settings/page.tsx` |

All pages share `app/(main)/layout.tsx`, which wraps screen content in the `BottomNav` component.

---

## Bottom Navigation

- Component: `components/layout/BottomNav.tsx`
- Renders four items: Home (`/home`), Resources (`/resources`), Chat (`/chat`), Profile (`/settings`).
- Uses `usePathname()` to highlight the active tab. Paths beginning with `/chat/…` or `/resources/…` remain active for the parent tab.
- Styled for mobile bottom-bar usage with translucent navy background and white icons.

---

## Authentication Flow Adjustments

- `lib/auth.ts` now routes every recognized role (`student`, `mentor`, `fye-teacher`) to `/home`.
- `app/login/page.tsx`: if a token exists on mount, the user is redirected to `/home`.
- `app/login/verify/page.tsx`: post-verification redirect uses `getRoleDestination`, leading to `/home`.
- `app/signup/complete-profile/page.tsx`: after successful profile completion, the router replaces the URL with `/home`.
- `app/dashboard/page.tsx`: retained as a compatibility redirect. If an old link hits `/dashboard`, it now forwards the session to `/home`.

> **Tip:** Any future dashboards for specific roles can extend `roleDestinations` accordingly without touching the form flows.

---

## Resource Document Placeholders

To match the UI links, the following HTML placeholders live under `public/resources/**`. Replace them with official PDFs, images, or embedded viewers when content is ready.

| Category | File |
|----------|------|
| Flowcharts | `public/resources/flowcharts/{cs,sba,engineering}.html` |
| Catalogues | `public/resources/catalogue/{undergraduate,graduate}.html` |
| Degree Plan Templates | `public/resources/degree-plan/{blank,sample}.html` |

Each file includes guidance text reminding contributors where to drop final assets.

---

## Home Screen Details

- Greets users by first name (from `user.firstName` or first token of `user.fullName`) if available in `localStorage`.
- “Start A Conversation” card links to `/chat`, mirroring the mock-up.
- Horizontal scroll card stack exposes quick links anchored to resource sections (`/resources#…`).
- Header pulls brand colors defined in `globals.css`.

---

## Chat Experience Stub

- `app/(main)/chat/page.tsx` seeds three example conversation cards to visualize layout.
- Each card includes advisor name, topic, snippet, timestamp, and unread indicator.
- `Start a new conversation` button navigates to `/chat/new`, which currently communicates forthcoming functionality.
- While no API integration exists yet, the page is structured to swap static data with future fetch logic.

---

## Settings Screen

- Reads the stored `user` object (if present) and shows name, email, and role label.
- Provides a single `Log out` button that clears local storage and returns to `/login`.
- Includes placeholders for notification preferences and support messaging.

---

## Styling Notes

- All new screens use the existing CSS variables shipping in `app/globals.css`.
- Layout containers use light background `#F4F6FF` to create contrast against cards.
- Buttons and interactive elements follow the primary blue accent `var(--primary-blue)`.

---

## Testing & Verification

1. `cd frontend && npm run dev`
2. Complete login or sign-up flow; verify automatic redirect to `/home`.
3. Navigate across bottom navigation tabs; confirm active state persists on nested routes (e.g., `/chat/new` keeps “Chat” highlighted).
4. Replace placeholder resource files with production assets and reload `/resources` to ensure links resolve.

---

## Follow-Up Opportunities

- Hook up real chat data and conversation creation flow.
- Replace placeholder HTML documents with official PDFs/downloads.
- Implement role-specific quick actions (e.g., mentors seeing mentee reminders on the Home tab).
- Add analytics or logging for tab navigation to inform UX iterations.

---

**Last updated:** November 10, 2025  
**Author:** Frontend Team  
**Scope:** Authenticated mobile home experience & bottom navigation



