# Plan 05 — Navigation: MK Login & User Menu

## Goal
Add an MK login entry point in the header, and replace it with a profile menu when an MK is logged in.

---

## Current State
- `Header.tsx` is a `'use client'` component with no auth awareness.
- Auth is handled via Supabase; session is only readable server-side via `supabase.auth.getUser()`.
- MK user data lives in `mk_users` table: `{ id, user_id, mk_id, party_id, role }`.
- Routes: `/auth/login`, `/mk/dashboard`, `/mks/[id]` (MK public page).

---

## Changes Required

### 1. Pass auth state to the Header (server → client)
Since `Header.tsx` is a client component, auth must be resolved server-side and passed as props (or via a server component wrapper).

- Create a thin `HeaderWrapper` server component that:
  1. Calls `supabase.auth.getUser()`.
  2. If logged in, fetches the `mk_users` row for that `user_id`.
  3. Fetches the MK's profile image URL from the `mks` table via `mk_id`.
  4. Passes `{ mkUser, profileImageUrl } | null` as props to `Header`.

- Update the layout to render `<HeaderWrapper />` instead of `<Header />` directly.

### 2. "כניסת ח"כים" login link (unauthenticated)
- In the right-side actions area of `Header`, add a login link when no user is logged in.
- Style: ghost button or text link, label **"כניסת ח"כים"**, links to `/auth/login`.
- Position: between the search icon and the mobile menu button.

### 3. User profile menu (authenticated)
When an MK user is logged in, replace the login link with a profile avatar + dropdown menu.

**Avatar trigger:**
- Show the MK's profile image (circular, 32×32 px) using `next/image`.
- Fallback: initials or a generic user icon if no image.
- Clicking the avatar opens a dropdown (use shadcn `DropdownMenu` or a custom Framer Motion panel).

**Dropdown menu items:**
| Label | Destination |
|---|---|
| הפרופיל שלי | `/mks/[mk_id]` |
| הבריפים שלי | `/mk/dashboard` (filtered to user's briefs) |
| לוח הבקרה | `/mk/dashboard` |
| התנתקות | calls `supabase.auth.signOut()` then redirects to `/` |

**Logout action:**
- Create a server action `signOut()` in `src/app/auth/actions.ts` (or extend existing).
- The action calls `supabase.auth.signOut()` and redirects to `/`.

### 4. Mobile menu
- Add the same login link / avatar menu to the mobile slide-down nav.
- Place it at the bottom of the mobile nav list.
- On logout, close the mobile menu before redirecting.

---

## File Checklist

- [ ] `src/components/layout/HeaderWrapper.tsx` — new server component
- [ ] `src/components/layout/Header.tsx` — accept `mkUser` prop, add login link + profile menu
- [ ] `src/components/layout/MkUserMenu.tsx` — avatar + dropdown (extract for clarity)
- [ ] `src/app/auth/actions.ts` — add / verify `signOut` server action
- [ ] `src/app/layout.tsx` — replace `<Header />` with `<HeaderWrapper />`

---

## Notes
- Keep `Header.tsx` as `'use client'`; pass auth data as serializable props from the server wrapper.
- Profile image should be lazy-loaded; use a placeholder to avoid layout shift.
- The dropdown must be accessible (keyboard navigable, closes on Escape / outside click).
- RTL layout: avatar/login button sits on the **left** side of the header (end in LTR = start in RTL).
