# Chart Rules — ExTra

## Purpose

This file defines the analytics and visualization rules for ExTra.

Charts must stay synchronized with backend-provided stats and the global dashboard filter.

## Core Analytics Principle

All analytics data is controlled by a single source of truth: the global filter.

```txt
Filter -> Backend Stats API -> Processed Data -> All Charts
```

No chart should perform independent filtering or backend-style aggregation.

All values must be derived from the same filtered dataset returned by the backend.

## Global Filter

Location:

```txt
Right Panel -> summarySection -> filterWrapper
```

Available options:

- Today
- Week
- Month
- All

Behavior:

- Changing the filter updates all charts simultaneously.
- The filter determines the dataset returned by the backend.
- All analytics remain synchronized.

## Bar Chart — Category Breakdown

### Purpose

The bar chart shows category breakdown.

It answers:

Where does the user's money come from or go?

It supports both:

- income categories
- expense categories

### Data Representation

```txt
Category -> Total Amount
```

### Default Behavior

- Default selected type: Expense
- Display top 5 categories
- No horizontal scrollbar in default top 5 view
- Top 5 bars must fit inside the container

### Expanded Behavior

The bar chart has a See more button.

When clicked:

- show all categories
- allow horizontal scrolling
- do not wrap bars into multiple rows
- keep the same bar width
- button may change to Show less

### Sorting

For display only:

- categories should appear highest to lowest by total amount

This is allowed because it is UI presentation, not backend aggregation.

### Data Rules

The frontend must not aggregate raw finance entries.

Allowed frontend transformations:

- sorting already-aggregated category totals
- slicing top 5 for preview
- calculating visual height percentage
- formatting labels and amounts

Not allowed:

- filtering raw transactions
- recomputing totals from entries
- independent chart filtering
- hardcoded category values

### Wafer-Style UI Requirement

The bar chart is not a traditional large chart.

It must be a compact financial signal strip.

Design intent:

small, wide, rectangular, dense, biscuit-sized, wafer-style

### Required Layout

The bar chart block must follow this structure:

```txt
[ Header Row ]
[ Switch Row ]
[ Chart Area ]
```

Header row:

- left: CATEGORY BREAKDOWN
- right: See more
- same row
- space-between alignment
- no wrapping
- minimal height

Switch row:

- compact income/expense pill toggle
- default expense selected
- must not push chart downward too much

Chart area:

- short and wide
- bars aligned to bottom baseline
- visible horizontal baseline at the foot of the bars
- no large empty vertical space

### Bar Styling

Each bar must:

- be vertical
- be narrow enough to fit 5 default bars
- sit on the baseline
- use selected finance type color:
  - expense = red accent
  - income = green accent

### Emoji Rule

Each bar should show the category emoji.

The emoji must be:

- inside the bar
- centered horizontally
- near the top of the bar
- not floating above the bar

Use category emoji helpers from financeConstants.ts.

### Label Rule

Below each bar:

- Category Name
- Category Value

Rules:

- very tight spacing
- no obvious visual gap between name and value
- small font size
- centered text
- truncate long category names if needed

### Bar Chart Acceptance Criteria

A correct bar chart implementation:

- shows exactly top 5 categories by default when at least 5 exist
- has no scrollbar in default mode
- shows all categories with horizontal scroll in expanded mode
- has a visible baseline at the bottom of bars
- places emojis inside bars
- uses red for expenses and green for income
- keeps category name and value compact
- stays short and rectangular, not square or tall

## Line Chart — Spending Trend

### Purpose

Shows how spending changes over time.

### Data Representation

```txt
Time -> Total Spending
```

### Behavior

The line chart dynamically adjusts based on selected filter:

- Today -> short interval data
- Week -> last 7 days
- Month -> last 30 days
- All -> full history

### Insight Value

The line chart helps:

- identify spending patterns
- detect spikes
- detect unusual activity

## Multi-Circular Progress — Category Distribution

### Purpose

Visualizes how much each category contributes to total spending.

### Data Representation

```txt
Category -> Percentage of Total
```

### Rules

- displays top 3 to 5 categories
- remaining categories may be grouped as Others
- each category is represented as a circular progress indicator
- percentages are calculated only from the filtered dataset

## Calendar Heatmap System

### Overview

The Calendar Heatmap provides a daily visual representation of financial activity.

Each day is represented as a grid cell.

Color intensity reflects the magnitude of financial activity.

### Core Purpose

The heatmap should:

- visualize daily income and expense intensity
- identify high spending or high saving days
- provide quick insights at a glance
- enable deeper inspection via hover interaction

### Heatmap Color Logic

Each cell is color-coded based on daily totals.

Income:

- higher income = darker green
- lower income = lighter green

Expense:

- higher expense = darker red
- lower expense = lighter red

### Color Decision Rule

- If income > expense -> GREEN scale
- If expense > income -> RED scale
- If equal or no data -> neutral gray

### Intensity Scaling

Color intensity is relative, not absolute.

```txt
shade = day total / max total in selected range
```

This ensures meaningful comparison within the current filter.

### Heatmap Data Source

Derived from backend stats:

```json
{
  "dailyTotals": [
    {
      "date": "2026-04-01",
      "income": 1000,
      "expense": 500
    }
  ]
}
```

### Filter Dependency

The heatmap is controlled by the global filter.

Changing the filter updates:

- visible date range
- color intensity scaling
- daily totals

### Hover Interaction

Hovering a calendar cell reveals a detailed daily breakdown panel.

Hover content includes:

- Multi-ring donut chart
- Income vs expense summary
- Top 5 categories

Example summary:

```txt
Income:  1000
Expense: 500
Net:     +500
```

### Backend Requirement

Heatmap endpoint:

```txt
GET /api/stats/dashboard?range=month&month=2026-04
```

Expected response shape:

```json
{
  "dailyTotals": [
    {
      "date": "2026-04-01",
      "income": 1000,
      "expense": 500,
      "dominantType": "income",
      "intensityRatio": 0.8,
      "intensityPercent": 80,
      "intensityLevel": 4
    }
  ],
  "heatmapMeta": {
    "maxIncome": 5000,
    "maxExpense": 4000
  }
}
```

Per-day deep insight endpoint:

```txt
GET /api/stats/dashboard/heatmap/day?date=2026-04-01
```

Expected response shape:

```json
{
  "date": "2026-04-01",
  "income": 1000,
  "expense": 500,
  "netBalance": 500,
  "savings": 300,
  "topCategories": [
    { "category": "Food", "amount": 300, "type": "expense" },
    { "category": "Transport", "amount": 200, "type": "expense" },
    { "category": "Savings", "amount": 300, "type": "saving" },
    { "category": "Salary", "amount": 1000, "type": "income" }
  ],
  "topEntries": {
    "income": [
      { "title": "Salary", "amount": 1000 },
      { "title": "Bonus", "amount": 200 }
    ],
    "expense": [
      { "title": "Groceries", "amount": 300 },
      { "title": "Transport", "amount": 200 },
      { "title": "Snacks", "amount": 50 }
    ],
    "savings": [
      { "title": "Piggy Bank", "amount": 300 }
    ]
  }
}
```

### Definitions

- netBalance: income minus expense
- savings: sum of entries where category is Savings or type is saving
- savings is intentionally separated from netBalance
