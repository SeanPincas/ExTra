# ExTra

ExTra is a personal finance and expense tracking dashboard built with a React + TypeScript frontend and a Node.js + Express + MongoDB backend.

It provides users with a compact, financial-focused dashboard to manage income, expenses, reminders, and analytics in a single interface.

## Current Status

ExTra is in active development. The core dashboard shell is already in place, and the right panel plus analytics systems are the current major focus areas.

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- CSS Modules
- Framer Motion
- Axios

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- JWT Auth

### Dev

- Docker Compose

## Project Structure

```text
ExTra/
  backend/
  frontend/
  docs/
```

- `backend/`: API server, routes, controllers, models, services, and backend utilities
- `frontend/`: React application, UI components, pages, contexts, and frontend utilities
- `docs/`: long-term system context, UI standards, chart/data rules, and project status

## Running the Project

### Docker

```powershell
docker compose up --build
```

### Local Dev

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

## Core Features

- Authentication (register/login, JWT-based session bootstrap)
- Finance entry management (add, edit, delete, filtering, date navigation)
- Dashboard layout with left, center, and right panel workflows
- Reminders with due-date support and priority behavior
- Notifications generated from backend-driven signals
- Analytics system synchronized by global range filter
- Calendar heatmap for daily financial activity insight

## Dashboard Overview

- Left Panel: profile, summary totals, reminders, notifications
- Center Panel: finance entry list and primary CRUD workflows
- Right Panel: analytics, calendar heatmap, and statistics

## Analytics System (Short Version)

- Bar chart: category breakdown
- Line chart: spending trend
- Circular chart: category distribution
- All analytics are controlled by one global filter

See full details: [docs/CHART_RULES.md](./docs/CHART_RULES.md)

## Data Flow (Short Version)

User selects filter -> request sent to backend stats endpoint -> backend returns filtered stats -> UI updates all analytics views.

See: [docs/DATA_RULES.md](./docs/DATA_RULES.md)

## UI System

The UI is being reformed toward a compact, dense dashboard experience focused on reducing wasted space and improving visible information per viewport.

- [docs/UI_RULES.md](./docs/UI_RULES.md)
- [docs/UI_REFORM_PLAN.md](./docs/UI_REFORM_PLAN.md)
- [docs/UI_DENSITY_STANDARDS.md](./docs/UI_DENSITY_STANDARDS.md)
- [docs/UI_CHANGE_SAFETY.md](./docs/UI_CHANGE_SAFETY.md)

## AI Development Context

ExTra uses structured AI development context so implementation decisions remain consistent across sessions. Long-term AI guidance is maintained in `/docs`.

- [docs/AI_CONTEXT.md](./docs/AI_CONTEXT.md)

## Project Status Link

See current build status: [docs/PROJECT_STATUS.md](./docs/PROJECT_STATUS.md)

## Git Workflow

Branch naming follows:

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
