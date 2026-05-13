# UI Rules — ExTra

## Purpose

This file defines the long-term visual rules for the ExTra dashboard.

These rules exist so UI work stays consistent across sessions and AI-assisted changes.

## Core Visual Philosophy

ExTra should feel compact, dense, and efficient.

The interface should not look oversized, bulky, or overly spaced out.

The intended feel is closer to a compact productivity dashboard than a large modern SaaS landing page.

Important keywords:

- compact
- dense
- efficient
- readable
- low wasted space
- small but clear
- rectangular instead of tall

## Density Rule

Vertical space is expensive.

Avoid unnecessary height in:

- headers
- footers
- cards
- panels
- chart blocks
- list rows
- buttons
- filters
- modals

Components should use only the space they need.

## Spacing Rules

Prefer small spacing values.

Recommended ranges:

```css
gap: 4px to 10px;
padding: 6px to 12px;
margin: 4px to 10px;
```

Avoid using large values unless there is a clear reason:

```css
gap: 20px;
gap: 24px;
padding: 20px;
padding: 24px;
margin: 24px;
min-height: 300px;
```

Large spacing often causes the dashboard to feel bulky.

## Typography Rules

Text should be readable but compact.

Avoid oversized UI text.

Suggested scale:

```css
--text-xs: 0.68rem;
--text-sm: 0.78rem;
--text-md: 0.88rem;
--text-lg: 1rem;
--text-xl: 1.15rem;
```

Use larger typography only for true display moments, not normal dashboard controls.

## Dashboard Shell Rules

The dashboard should use more of the viewport.

Avoid excessive outer spacing around the whole app.

Audit:

- page padding
- dashboard wrapper margin
- dashboard max-width
- top spacing
- bottom spacing
- left/right empty frame
- header/footer height

The dashboard should not feel zoomed-in on laptop screens.

## Header and Footer Rules

The header and footer should be slim and functional.

Avoid large vertical height.

Reduce:

- logo size
- icon size
- button height
- footer padding
- header padding
- title size

## Panel Rules

Main dashboard panels should be compact.

Audit:

- panel padding
- internal gaps
- section spacing
- card border radius
- fixed heights
- min-heights

Avoid square blocks when a short rectangular block is enough.

## Chart Block Rules

Chart blocks should be compact and rectangular.

Avoid tall chart containers unless the visualization truly needs height.

Each chart block may have a slim top border or divider.

Spacing between chart blocks should be small.

## Bar Chart Wafer Style

The bar chart should be especially compact.

It should feel like a small financial signal strip, similar to a biscuit or long wafer.

Rules:

- short height
- wide rectangle
- minimal padding
- minimal vertical gaps
- bars aligned to a baseline
- labels tightly stacked
- no large empty chart area

## Responsive Rules

For laptop-sized screens, use compact mode when needed:

```css
@media (max-height: 850px), (max-width: 1440px) {
  /* compact dashboard adjustments */
}
```

Inside compact mode, reduce:

- header height
- footer height
- panel padding
- card gaps
- list row heights
- chart heights
- calendar cell sizes

## Acceptance Criteria

A good ExTra UI change should:

- reduce wasted space
- preserve readability
- make more content visible
- keep the dark/gold visual identity
- avoid generic oversized dashboard styling
- feel intentional and compact

## UI Reform Source of Truth

For full UI redesign and density decisions, read:

- docs/UI_REFORM_PLAN.md
- docs/UI_DENSITY_STANDARDS.md
- docs/UI_CHANGE_SAFETY.md

These files define the official UI system, measurements, and safe modification rules.

All UI changes must follow these documents.
