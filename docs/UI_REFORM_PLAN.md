# UI Reform Plan — ExTra

## Purpose

This document defines the complete UI reform strategy for ExTra and must be read before any UI modification work starts.

It establishes design intent, reform priorities, measurable outcomes, and execution order so density improvements are deliberate and safe.

## Product Identity

ExTra is a financial dashboard with a business-oriented visual language.

Core identity attributes:

- matte black surfaces
- compact and dense layout behavior
- efficient information delivery
- low-scroll, viewport-aware composition

## Visual Direction

The reform direction is:

- matte black
- business style
- financial dashboard clarity
- compact controls and blocks
- slim containers
- dense content arrangement
- low-scroll behavior
- viewport-efficient structure

## Core Problem

The current UI feels bulky because of accumulated spacing and oversized component sizing:

- large padding and margin values
- excessive inter-section spacing
- oversized header/footer height
- tall chart and heatmap blocks
- overgrown row and control heights

This creates unnecessary vertical scrolling, especially on laptop screens.

## Core Principle

Maximize visible data. Minimize wasted space.

Every UI change should increase information density without harming readability.

## Density Philosophy

Compact does not mean cramped.

Reform rules:

- reduce component size, not legibility
- shrink height before width where possible
- reduce vertical stacking depth
- preserve clear visual hierarchy
- keep interaction targets usable

## Shape Language

Preferred forms:

- rectangular blocks
- slim containers
- compact rows

Avoid:

- tall cards
- large empty sections
- over-rounded oversized blocks

## Global Layout Reform

Global shell reform goals:

- reduce outer margins and frame padding
- reduce header and footer height
- reduce panel internal padding
- reduce dashboard grid gaps
- increase visible rows/charts per viewport

## Section-by-Section Reform Plan

### Header Reform

- reduce header vertical height
- reduce top/bottom padding
- reduce logo/icon scale
- keep controls aligned without adding secondary rows

### Footer Reform

- keep footer minimal and functional
- reduce padding to lower visual weight
- avoid tall action bars

### Left Panel Reform

- compress summary card height
- tighten notification rows
- tighten reminder rows and internal card spacing

### Center Panel Reform

- reduce list row height
- reduce filter bar height
- tighten date/navigation controls
- keep list readability while increasing visible rows

### Right Panel Reform

- reduce heatmap block height
- reduce statistics block height
- tighten chart stack spacing

### Calendar Heatmap Reform

- use smaller cells
- use tighter grid spacing
- reduce title/header vertical overhead

### Statistics Reform

- compact rectangular chart blocks
- remove tall placeholder-like empty zones
- keep chart headers as slim label rows

### Bar Chart Reform

- enforce wafer-style strip layout
- keep chart short and wide
- show top 5 by default
- allow horizontal scroll only on expanded view

## Reform Workflow

Follow this order strictly:

1. Global shell
2. Header + footer
3. Main grid
4. Left panel
5. Center panel
6. Right panel
7. Charts
8. Modals
9. Responsive refinement
10. Final audit

## Component-Based Work Rule

Every UI task must include these fields:

- Component/Block
- Current problem
- Do not touch
- Allowed changes
- Target measurements
- Files involved
- Acceptance criteria

This format prevents broad edits and keeps changes auditable.

## Acceptance Criteria

A successful reform should produce:

- less vertical waste
- more visible data
- compact layout consistency
- reduced scrolling on laptop screens
- consistent spacing scale across components
- preserved dark business theme identity
