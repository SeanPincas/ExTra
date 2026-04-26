# UI Change Safety — ExTra

## Purpose

This file defines guardrails for safe UI density reform.

Its job is to reduce visual bulk without breaking working layout structure, interaction flow, or component alignment.

## Core Rule

Do not break existing working layout while improving density.

Density reform should be controlled, incremental, and reversible.

## Do Not Modify (By Default)

Unless the task explicitly requires a structural layout rewrite, do not change:

- `display`
- `position`
- `grid-template-columns`
- `flex-direction`
- `justify-content`
- `align-items`
- `z-index`
- `transform`

These properties are high-risk and can cascade breakage across dashboard regions.

## Safe Properties to Modify

Primary density tuning should focus on:

- `font-size`
- `padding`
- `gap`
- `margin`
- `height`
- `min-height`
- `max-height`
- `border-radius`

These are lower-risk controls for compactness.

## Workflow Rule

Change one component group at a time.

Required sequence per group:

1. Identify exact problem area.
2. Apply minimal safe-property changes.
3. Verify layout and interaction behavior.
4. Stop if regressions appear.
5. Commit changes scoped to that group.

## Safety Principle

Reduce size first. Do not rewrite layout unless necessary.

If compactness cannot be achieved with safe properties, escalate with a clearly documented structural-change proposal before touching high-risk layout properties.

## Validation Checklist

Before finalizing each UI density change, verify:

- key controls remain clickable
- no text clipping in normal states
- no overlap between panels/sections
- no unexpected horizontal overflow in default states
- no broken alignment in header/footer/grid rows
- chart and heatmap interactions still function

## Rollback Strategy

If regressions are found:

- revert the last component-group change only
- preserve previous stable groups
- retry with smaller value adjustments

This prevents broad instability during reform.
