# Project Status — ExTra

## Purpose

This file tracks the current implementation state of ExTra.

It should help developers and AI agents understand what already exists, what is in progress, and what should not be accidentally rebuilt.

## Current Build Phase

ExTra is currently in active development.

The authentication flow is working.

The dashboard shell is in place.

The left panel is wired to live stats.

The center panel supports live finance entry workflows.

The account settings page is functional.

The right panel is still a lighter support area compared to the rest of the dashboard.

## Working Now

- User registration connected to the backend
- User login connected to the backend
- JWT-based auth bootstrap through frontend context
- Protected dashboard rendering after successful auth
- Intro animation and transition shell
- Global dashboard background and matte textured theme
- Header with centered capsule logo and authenticated user action button
- Left panel modular structure:
  - profile card and avatar preview
  - summary totals with persisted range filter
  - notifications fetched from backend
  - reminders with due date calendar picker and priority sorting
- Center panel finance list:
  - live finance entry fetching
  - responsive filtering
  - date navigation
  - add/edit/delete flows
  - batch delete mode UX
- Floating date navigator:
  - custom calendar modal
  - month picker
  - year wheel picker
- Account settings page:
  - profile editing
  - preferences
  - avatar upload and reposition
  - logout
  - account deletion confirmation
- Quote rotation system fetched from backend based on user preference
- Reusable filter component
- Docker setup for frontend and backend

## Already Present in Backend

- Auth routes
- User profile routes
- Finance CRUD routes
- Quote routes
- Dashboard stats route
- Reminder routes
- Notification route

## Still In Progress on Frontend

- Right panel real content
- Deeper analytics widgets
- Calendar insight workflows
- Additional center-panel refinement
- Hotfix work
- Password change
- Richer avatar handling

## Current Next Plan

- Continue center-panel refinements and hotfixes
- Improve responsive behavior across tablet and phone breakpoints
- Expand right-panel insights and connected analytics
- Continue polishing account settings and profile tooling

## Known Notes

- The right panel is less complete than the left and center panels.
- Some backend capability exists ahead of the matching final frontend UX.
- Do not rebuild already-working systems unless the task explicitly asks for it.
