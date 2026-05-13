# UI Density Standards — ExTra

## Purpose

This document defines the official density measurements for ExTra.

These values are the implementation baseline for UI scaling decisions. They replace subjective spacing choices with explicit, measurable standards.

## Global Tokens

Use these tokens as the default system scale:

```css
--font-ui-xs: 11px;
--font-ui-sm: 12px;
--font-ui-md: 13px;
--font-ui-lg: 15px;

--space-1: 4px;
--space-2: 6px;
--space-3: 8px;
--space-4: 10px;
--space-5: 12px;

--control-h-sm: 24px;
--control-h-md: 30px;
--control-h-lg: 34px;
```

## Layout Measurements

Use these ranges for dashboard shell dimensions:

- Header height: `52px` to `60px`
- Footer height: `24px` to `30px`
- Outer shell padding: `8px` to `12px`
- Main grid gap: `8px` to `12px`
- Left panel width: `250px` to `280px`
- Right panel width: `300px` to `340px`

## Component Heights

Use these ranges for primary blocks:

- Summary block: `120px` to `145px`
- Calendar heatmap block: `185px` to `225px`
- Statistics section block: `170px` to `220px`
- Bar chart block: `105px` to `125px`
- Entry row: `50px` to `58px`
- Filter bar: `40px` to `48px`

## Calendar Standards

Calendar sizing rules:

- Cell size: `24px` to `28px`
- Cell gap: `4px`
- Calendar header height: `28px` to `34px`

These ranges should preserve readability while increasing visible weeks/content on laptop displays.

## Bar Chart Standards

Bar chart wafer measurements:

- Chart height: `105px` to `125px`
- Bar max height: `50px` to `58px`
- Bar width: `28px` to `36px`
- Label font size: `10px` to `11px`

Additional behavior constraints:

- default top-5 mode must fit without horizontal scroll
- expanded mode may scroll horizontally
- bar widths must remain consistent across modes

## Responsive Density Mode

For reduced viewport scenarios, enable compact adjustments:

```css
@media (max-width: 1440px), (max-height: 850px) {
  /* reduce heights, spacing, and padding */
}
```

Inside this mode, lower dimensions within defined ranges rather than introducing new arbitrary values.

## Rule of Deviation

These values are the default standard.

Any deviation must be justified with one of the following:

- a clear accessibility requirement
- a critical content-overflow requirement
- a component-specific functional constraint

When deviating, document:

- the affected component
- old value
- new value
- reason for exception
