# ExTra

ExTra is a personal finance and expense tracking dashboard built with a React + TypeScript frontend and a Node.js + Express + MongoDB backend.

The project is currently in an active build phase. The authentication flow is working, the dashboard shell is in place, the left panel is wired to live stats, the center panel already supports live finance entry workflows, and the account settings page is now functional. The right panel is still a lighter support area compared to the rest of the dashboard.

## Current Status

### Working now

- User registration connected to the backend
- User login connected to the backend
- JWT-based auth bootstrap through frontend context
- Protected dashboard rendering after successful auth
- Intro animation and transition shell
- Global dashboard background and matte textured theme
- Header with centered capsule logo and authenticated user action button
- Left panel modular structure with live summary totals
- Center panel finance list with responsive filtering, date navigation, add/edit/delete flows, and batch delete mode
- Floating date navigator with custom calendar modal, month picker, and year wheel picker
- Account settings page with profile, preferences, avatar upload/reposition, logout, and account deletion confirmation
- Quote rotation system fetched from the backend based on user preference
- Reusable filter component
- Docker setup for frontend and backend

### Already present in the backend

- Auth routes
- User profile routes
- Finance CRUD routes
- Quote routes
- Dashboard stats route
- Reminder routes
- Notification route

### Still in progress on the frontend

- Right panel real content
- Deeper analytics widgets and calendar insight workflows
- Additional center-panel refinement and hotfix work
- Extended account settings features such as password change and richer avatar handling

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- CSS Modules
- Framer Motion
- Axios
- Lucide React

### Backend

- Node.js
- Express 5
- MongoDB with Mongoose
- JWT authentication
- Helmet
- CORS
- Morgan
- Express rate limit

### Dev / Runtime

- Docker Compose

## Design System

The current UI direction is based on:

- matte black base surfaces
- brown leather accent panels
- soft textured dashboard cards
- gold highlight accents
- green and red finance colors
- fluid responsive layout using `clamp()`, `vw`, grid, and minimal breakpoints

Typography currently uses:

- `Cormorant Garamond` for display headings
- `Inter` for body and UI text

## Project Structure

```text
ExTra/
  backend/
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      services/
      utils/
    server.js
  frontend/
    src/
      api/
      assets/
      components/
      context/
      layout/
      pages/
      types/
      utils/
```

## Frontend Overview

### App flow

The frontend starts inside `AuthProvider`, then decides whether to show:

- the auth pages (`RegisterPage` or `LoginPage`), or
- the dashboard shell once a valid token and user are available

Main entry files:

- [frontend/src/main.tsx](C:\Users\ACER\Desktop\WebProjects\ExTra\frontend\src\main.tsx)
- [frontend/src/App.tsx](C:\Users\ACER\Desktop\WebProjects\ExTra\frontend\src\App.tsx)
- [frontend/src/index.css](C:\Users\ACER\Desktop\WebProjects\ExTra\frontend\src\index.css)

### Auth pages

Current auth UI includes:

- register page
- login page
- responsive auth shell
- top-centered capsule logo
- leather-themed brand panel
- warning cloud UX for validation/server messages
- password reveal interaction
- legal modal support for privacy policy and terms

Files:

- [frontend/src/pages/RegisterPage/RegisterPage.tsx](C:\Users\ACER\Desktop\WebProjects\ExTra\frontend\src\pages\RegisterPage\RegisterPage.tsx)
- [frontend/src/pages/LoginPage/LoginPage.tsx](C:\Users\ACER\Desktop\WebProjects\ExTra\frontend\src\pages\LoginPage\LoginPage.tsx)
- [frontend/src/context/AuthContext.tsx](C:\Users\ACER\Desktop\WebProjects\ExTra\frontend\src\context\AuthContext.tsx)

### API layer

The frontend currently uses a centralized Axios instance and auth/user API helpers.

Files:

- [frontend/src/api/axios.ts](C:\Users\ACER\Desktop\WebProjects\ExTra\frontend\src\api\axios.ts)
- [frontend/src/api/authAPI.ts](C:\Users\ACER\Desktop\WebProjects\ExTra\frontend\src\api\authAPI.ts)
- [frontend/src/api/userAPI.ts](C:\Users\ACER\Desktop\WebProjects\ExTra\frontend\src\api\userAPI.ts)

### Dashboard layout

The current dashboard shell is composed of:

- Header
- Main 3-column grid
- Footer

The left column is already broken into modular components:

- ProfileArea
- SummaryArea
- NotificationArea
- ReminderArea

Files:

- [frontend/src/components/Header/Header.tsx](C:\Users\ACER\Desktop\WebProjects\ExTra\frontend\src\components\Header\Header.tsx)
- [frontend/src/layout/MainLayout/MainLayout.tsx](C:\Users\ACER\Desktop\WebProjects\ExTra\frontend\src\layout\MainLayout\MainLayout.tsx)
- [frontend/src/components/LeftPanel/LeftPanel.tsx](C:\Users\ACER\Desktop\WebProjects\ExTra\frontend\src\components\LeftPanel\LeftPanel.tsx)

Reusable UI utilities currently include:

- button utility classes
- reusable filter component
- centralized icon library
- auth validation helpers

### Account settings

The settings page currently includes:

- profile picture preview and avatar reposition modal
- username and phone number editing
- read-only connected email display
- finance preference controls
- quote rotation preference
- sensitive actions area for logout and delete account
- delete-account verification modal requiring username and password

Files:

- [frontend/src/pages/SettingsPage/SettingsPage.tsx](C:\Users\ACER\Desktop\WebProjects\ExTra\frontend\src\pages\SettingsPage\SettingsPage.tsx)
- [frontend/src/components/Settings/AvatarPositionModal/AvatarPositionModal.tsx](C:\Users\ACER\Desktop\WebProjects\ExTra\frontend\src\components\Settings\AvatarPositionModal\AvatarPositionModal.tsx)
- [frontend/src/components/Settings/DeleteAccountModal/DeleteAccountModal.tsx](C:\Users\ACER\Desktop\WebProjects\ExTra\frontend\src\components\Settings\DeleteAccountModal\DeleteAccountModal.tsx)

### Center panel

The center panel currently includes:

- live finance entry fetching
- responsive range and category filters
- floating date navigator
- custom calendar modal
- add entry modal
- edit entry modal
- single-entry delete and batch delete mode
- responsive entry list interactions

Core files:

- [frontend/src/components/CenterPanel/CenterPanel.tsx](C:\Users\ACER\Desktop\WebProjects\ExTra\frontend\src\components\CenterPanel\CenterPanel.tsx)
- [frontend/src/components/CenterPanel/EntryFilterBar/EntryFilterBar.tsx](C:\Users\ACER\Desktop\WebProjects\ExTra\frontend\src\components\CenterPanel\EntryFilterBar\EntryFilterBar.tsx)
- [frontend/src/components/CenterPanel/EntryListArea/EntryListArea.tsx](C:\Users\ACER\Desktop\WebProjects\ExTra\frontend\src\components\CenterPanel\EntryListArea\EntryListArea.tsx)
- [frontend/src/components/CenterPanel/DateNavigator/DateNavigator.tsx](C:\Users\ACER\Desktop\WebProjects\ExTra\frontend\src\components\CenterPanel\DateNavigator\DateNavigator.tsx)
- [frontend/src/context/FinanceContext.tsx](C:\Users\ACER\Desktop\WebProjects\ExTra\frontend\src\context\FinanceContext.tsx)

## Backend Overview

### Server boot

The backend boots from:

- [backend/server.js](C:\Users\ACER\Desktop\WebProjects\ExTra\backend\server.js)
- [backend/src/app.js](C:\Users\ACER\Desktop\WebProjects\ExTra\backend\src\app.js)

The API currently includes:

- JSON parsing
- Helmet security headers
- CORS for `http://localhost:5173`
- rate limiting on `/api`
- request sanitization
- morgan logging

### Current routes

#### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`

#### User

- `GET /api/users/me`
- `PUT /api/users/me`
- `DELETE /api/users/me`

#### Finance

- `POST /api/finance`
- `GET /api/finance`
- `PUT /api/finance/:id`
- `DELETE /api/finance/:id`

#### Quotes

- `GET /api/quotes/current`
- `GET /api/quotes/library`

#### Stats

- `GET /api/stats/dashboard`

#### Reminders

- `POST /api/reminders`
- `GET /api/reminders`
- `PUT /api/reminders/:id`
- `DELETE /api/reminders/:id`

#### Notifications

- `GET /api/notifications`

## Running the Project

### Docker

From the project root:

```powershell
docker compose up --build
```

Expected local URLs:

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:3501](http://localhost:3501)

### Local dev without Docker

Backend:

```powershell
cd backend
npm run server
```

Frontend:

```powershell
cd frontend
npm run dev
```

## Auth Flow

Current auth flow:

1. User registers or logs in from the frontend
2. Backend returns a JWT token
3. Frontend stores the token in local storage
4. `AuthContext` fetches the current user from `/api/users/me`
5. Dashboard renders only when both `token` and `user` are available

## Validation Rules

Current auth validation rules documented in the codebase:

### Username

- required
- 3 to 24 characters
- letters and numbers only

### Email

- required
- must follow valid email format

### Password

- required
- 8 to 16 characters
- must include uppercase, lowercase, and number
- no spaces

## Current Next Plan

- continue center-panel refinements and hotfixes
- improve responsive behavior across tablet and phone breakpoints
- expand right-panel insights and connected analytics
- continue polishing account settings and profile tooling

## Known Notes

- The right panel is still less complete than the left and center panels.
- Some backend capability still exists ahead of the matching final frontend UX.
- This README documents the current repository state, even if parts of that functionality were originally generated or scaffolded with ChatGPT, as long as they already exist in the project.

## Git Workflow Note

Branch naming conventions are currently documented in:

- [GIT_CONVENTIONS.md](C:\Users\ACER\Desktop\WebProjects\ExTra\GIT_CONVENTIONS.md)

Recommended naming pattern:

```text
type/short-description
```

Current branch prefixes:

- `hotfix/` for CSS and UI/UX work
- `bugfix/` for actual bug fixes
- `feature/` for new functionality
- `refactor/` for restructuring without intended feature changes
- `chore/` for maintenance and project upkeep
- `docs/` for documentation-only work
- `test/` for test-related work
