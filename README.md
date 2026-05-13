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

## Savings Progress Tracker (SPT) — Feature Plan

The Savings Progress Tracker (SPT) is a dashboard feature that tracks the user’s progress toward a savings target.

The important rule is that the tracker should not store progress separately. The target goal is stored in the user preferences, but the actual progress comes from real finance entries.

In other words:

```text
Savings goal target = user.preference.savingsGoal
Savings progress = total of finance entries where:
type = income
category = Savings
```

This keeps the feature clean because every savings progress update is still a normal finance entry. It will automatically appear in the entry list, charts, statistics, heatmap, and dashboard totals.

### Core Purpose

The SPT answers:

```text
How close am I to reaching my savings goal?
```

It should show:

- current savings progress
- target savings goal
- percentage completed
- remaining amount
- progress line
- action button

Example:

```text
Savings Progress
₱12,000 / ₱50,000
24%

[ horizontal progress line ]

₱38,000 remaining
[ Add Savings Progress ]
```

### Data Flow

#### 1. Savings Goal Target

The target goal comes from the user model preference:

```text
user.preference?.savingsGoal
```

Example:

```json
{
  "preference": {
    "savingsGoal": 50000
  }
}
```

This value represents the user’s current savings target.

The goal should be:

- `null / missing / 0` = no active goal
- positive number = active goal

#### 2. Savings Progress Source

Progress is calculated from finance entries.

Only entries that match this rule count toward the tracker:

```ts
entry.type === "income"
entry.category === "Savings"
```

Example entry:

```json
{
  "type": "income",
  "category": "Savings",
  "amount": 1000,
  "date": "2026-05-11"
}
```

This means that adding savings progress through the SPT should automatically create a real finance entry.

### Calculation Logic

#### Current Progress

```text
currentSavingsProgress = sum of all finance entries where:
type === "income"
category === "Savings"
```

#### Progress Percentage

```text
progressPercent = (currentSavingsProgress / savingsGoal) * 100
```

#### Visual Progress

The visual progress line should be clamped between `0` and `100`.

```text
visualProgress = Math.min(Math.max(progressPercent, 0), 100)
```

This means if the user exceeds the goal, the progress line stays full instead of overflowing.

#### Remaining Amount

```text
remainingAmount = savingsGoal - currentSavingsProgress
```

For display, remaining should not go below zero:

```text
displayRemaining = Math.max(remainingAmount, 0)
```

### UI States

The SPT has three main states.

#### State 1 — No Goal Yet

Condition:

```text
!savingsGoal || savingsGoal <= 0
```

Display:

```text
Savings Progress Tracker
No savings goal set yet.

[ New Goal ]
```

The button label should be:

```text
New Goal
```

This button opens the goal setup flow.

#### State 2 — Active Goal

Condition:

```text
savingsGoal > 0 && currentSavingsProgress < savingsGoal
```

Display:

```text
Savings Progress
₱12,000 / ₱50,000
24%

[ horizontal progress line ]

₱38,000 remaining

[ Add Savings Progress ]
```

The main button should be:

```text
Add Savings Progress
```

This button allows the user to add a new savings progress entry.

#### State 3 — Goal Completed

Condition:

```text
savingsGoal > 0 && currentSavingsProgress >= savingsGoal
```

Display:

```text
Savings Goal Completed
₱50,000 / ₱50,000
100%

[ full horizontal progress line ]

Goal reached

[ New Goal ]
```

The button label should still be:

```text
New Goal
```

The wording stays vague and reusable. It works whether the user is setting their first goal or starting another goal after completion.

### Button Logic

The primary SPT action button should follow this logic:

```ts
const hasGoal = savingsGoal != null && savingsGoal > 0
const isGoalCompleted = hasGoal && currentSavingsProgress >= savingsGoal

if (!hasGoal) {
  show "New Goal"
}

if (hasGoal && !isGoalCompleted) {
  show "Add Savings Progress"
}

if (isGoalCompleted) {
  show "New Goal"
}
```

Summary:

- No goal → `New Goal`
- Active goal → `Add Savings Progress`
- Completed goal → `New Goal`

### New Goal Flow

When the user clicks `New Goal`, the app should allow them to set or replace the current savings goal.

The flow can be:

```text
Click New Goal
→ open compact input/modal
→ user enters target amount
→ save to user.preference.savingsGoal
→ tracker recalculates and displays active goal state
```

Example payload through user profile update:

```json
{
  "preference": {
    "savingsGoal": 50000
  }
}
```

The goal should be saved through the existing user profile/preferences backend flow if available.

Recommended backend route:

```text
PUT /api/users/me
```

No separate savings route is necessary unless the existing user route cannot safely update preferences.

### Add Savings Progress Flow

When the user clicks `Add Savings Progress`, the app should allow them to add a savings-only finance entry.

The flow:

```text
Click Add Savings Progress
→ open compact input/modal
→ user enters amount
→ optional note/date
→ create finance entry
→ update finance context/list
→ SPT recalculates progress
```

The finance entry should be automatically created as:

```json
{
  "type": "income",
  "category": "Savings",
  "amount": "userEnteredAmount",
  "date": "selectedDate || today",
  "note": "Savings progress"
}
```

This is important because the SPT progress depends on actual finance entries, not separate manual tracker data.

### Backend Responsibilities

The backend should support two things:

#### 1. Store the Target Goal

The user model should support:

```text
preference: {
  savingsGoal: Number | null
}
```

Recommended behavior:

- default = `null`
- must be a non-negative number if provided

The existing user profile endpoint should return and update this value.

#### 2. Create Savings Progress Entries

The existing finance entry creation endpoint should be used.

```text
POST /api/finance
```

The SPT should create an entry with:

```json
{
  "type": "income",
  "category": "Savings"
}
```

This keeps savings progress integrated with the rest of the finance system.

### Frontend Responsibilities

The frontend should:

- fetch `user.preference.savingsGoal`
- fetch finance entries
- calculate current savings progress from Savings income entries
- render the correct SPT state
- allow setting a new goal
- allow adding savings progress
- refresh/update finance data after adding progress

The SPT should update automatically when finance entries change.

Examples:

- Adding a Savings income entry → increases SPT progress
- Deleting a Savings income entry → decreases SPT progress
- Editing a Savings income entry amount → recalculates SPT progress
- Changing the savings goal → recalculates percentage and remaining amount

### Visual Design

The SPT container should visually stand out from normal black cards, but still match the ExTra theme.

Requested container style:

```text
green and dark green gradient center
```

Recommended feel:

- premium dark green financial growth card
- matte texture
- compact progress display
- green income/savings accent
- gold highlight only if needed

Possible background direction:

```css
background:
  radial-gradient(circle at center, rgba(34, 197, 94, 0.22), transparent 58%),
  linear-gradient(145deg, rgba(9, 42, 28, 0.96), rgba(4, 18, 13, 0.98));
```

The card should include:

- title
- current / goal amount
- percentage
- horizontal progress line
- remaining amount
- main action button

### Progress Line Design

The tracker should use a long horizontal progress line.

The line should show the current progress percentage.

Structure:

```text
[ filled green progress ][ remaining dark track ]
```

Requirements:

- full-width or near full-width
- thin but visible
- rounded pill shape
- green filled section
- dark green/black track
- percentage shown clearly
- smooth transition when progress changes

Example:

```text
₱12,000 / ₱50,000
24%

██████░░░░░░░░░░░░░░░░
```

### Important Architecture Rule

The SPT should not become a separate finance system.

Do not store progress like this:

```text
savingsProgress: 12000
```

Instead:

- `savingsGoal` = stored in user preference
- `savingsProgress` = calculated from finance entries

This keeps the system consistent.

Correct model:

- Target = User Preference
- Progress = Finance Entries

### Integration With Existing App

Because progress entries are normal finance entries, they should automatically affect:

- Center Panel entry list
- income totals
- dashboard stats
- bar chart category totals
- line chart income trend
- multi-ring category distribution
- calendar heatmap
- daily insight modal

This is useful because savings is treated as part of the financial data, not isolated tracker-only data.

### Edge Cases

#### No Goal

Show setup state and the `New Goal` button.

#### Goal Exists But No Savings Entries

Show active goal with:

- `₱0 / target`
- `0%`
- full remaining amount

#### Goal Completed

Show completed state and `New Goal`.

#### Progress Exceeds Goal

Display actual progress, but cap the visual bar at `100%`.

Example:

```text
₱55,000 / ₱50,000
110%

Progress line visually = 100%
Remaining = ₱0
```

#### Invalid Goal

If goal is negative, `NaN`, or invalid:

- treat as no goal
- show `New Goal`

#### Amount Input Invalid

Do not allow:

- empty amount
- negative amount
- zero amount
- non-number amount

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
