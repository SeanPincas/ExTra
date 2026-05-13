# Data Rules — ExTra

## Purpose

This file defines data ownership rules between the backend and frontend.

These rules are especially important for statistics, analytics, charts, filters, and summaries.

## Core Rule

The backend is responsible for aggregation and filtering.

The frontend is responsible for rendering, interaction, and lightweight presentation transformation.

## Backend Responsibilities

The backend should handle:

- authentication
- user lookup
- finance entry CRUD
- finance filtering
- summary totals
- category totals
- top income categories
- top expense categories
- trend data
- daily totals
- heatmap metadata
- notification generation
- reminder priority sorting

## Frontend Responsibilities

The frontend should handle:

- displaying backend data
- local UI state
- modal state
- selected filter state
- chart rendering
- formatting labels and currency
- sorting already-aggregated display data when needed
- slicing top N items for preview
- calculating visual percentages for charts

## Frontend Must Not

The frontend must not:

- aggregate raw finance entries for analytics
- independently filter chart datasets
- recompute backend totals
- hardcode chart values
- duplicate backend business logic

## Stats Data Flow

```txt
User selects filter
        ->
Frontend updates range state
        ->
Request sent to backend stats endpoint
        ->
Backend returns filtered aggregates
        ->
Frontend transforms data for display
        ->
Charts update simultaneously
```

## Dashboard Stats Endpoint

Current route:

```txt
GET /api/stats/dashboard
```

Expected stats response includes:

```json
{
  "totals": {},
  "topExpenseCategories": [],
  "topIncomeCategories": [],
  "trend": [],
  "dailyTotals": [],
  "heatmapMeta": {}
}
```

## Analytics Rule

All analytics should use one synchronized backend stats response whenever possible.

Charts must not disagree because of separate frontend calculations.

## Allowed UI Transformations

These are allowed because they are presentation-level operations:

- sort aggregated category totals by amount
- slice top 5 categories
- compute heightPercent for bar height
- compute display percentage for progress visuals
- format currency
- map category names to emoji
- derive CSS class names from finance type

## Not Allowed

These are not allowed:

- summing raw transactions in the frontend to create chart data
- filtering raw finance entries separately for each chart
- creating fake placeholder chart data
- hardcoding totals for visual testing in production code
