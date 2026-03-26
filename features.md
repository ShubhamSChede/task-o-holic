# Task-o-holic — Implemented Features

This document lists the **features currently implemented** in the Task-o-holic project (Next.js + Supabase + Tailwind).

## Authentication & onboarding

- **Email/password authentication** via Supabase Auth
- **Register / login flows**
- **Auth callback handling** (post-auth redirect/status handling)
- **Route protection** for dashboard areas (redirects to login when unauthenticated)
- **Avatar selection onboarding**: users are prompted to choose an avatar when missing

## Profile & account

- **Profile view** (“My profile”)
- **Edit profile**: update full name
- **Avatar management**
  - Avatars are served from `public/avatars/`
  - Database stores **only the avatar filename** (not a full URL)
  - UI renders avatars by prepending `/avatars/` to the stored filename
- **Unified save**: profile + avatar selection saved via a single “Save changes” action
- **Account settings panel** (informational UI for password change + delete account placeholder UI)

## Tasks (Todos)

- **Create task**
- **View task list**
- **Edit task**
- **Complete / incomplete status**
- **Due date support**
- **Priority support** (low/medium/high)
- **Tags support** (array-style tags)
- **Filtering on tasks list**
  - Status filter (complete/incomplete)
  - Priority filter
  - Tag filter (populated from existing tags)

## Organizations

- **Create organization**
- **Join organization**
- **Organizations list**
- **Organization details page**
  - Two-column layout on desktop:
    - **Left**: organization tasks (scrollable area that sizes with the right column)
    - **Right**: members + frequent task templates
- **Organization membership & roles**
  - Member listing UI
  - Creator/admin capabilities reflected in UI (e.g., org edit visibility)

## Organization tasks

- **Organization-scoped tasks** (todos associated with an organization)
- **Organization tasks filters**
  - Status filter (complete/incomplete)
  - Priority filter
  - Tag filter
  - Applied filter chips + clear actions

## Frequent task templates

- **Create frequent task template** (per organization)
- **View frequent task templates list**
- **Edit frequent task template**
- **Use template to create a task**

## Statistics

- **Statistics page** with charts/visualizations (task completion + breakdowns)

## UI/UX system & consistency

- **Unified dark “glass” design system** across dashboard pages and components
- **Consistent typography & spacing**
- **Custom error display + error boundary**
- **Custom 404 page** styled to match the theme
- **Responsive layout**
  - Sidebar + mobile sheet behavior
  - Cards and grids adapt across breakpoints

