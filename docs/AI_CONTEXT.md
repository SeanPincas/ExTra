# AI Context — ExTra

## Purpose

This file stores long-term AI development context for the ExTra project.

AI coding agents do not reliably remember previous sessions, design decisions, or architectural preferences. Because of that, important project rules must live in documentation files and be referenced before implementation work.

Before making changes, AI agents should read this file together with the relevant domain-specific files in `/docs`.

## Project Identity

ExTra is a personal finance and expense tracking dashboard.

The project is currently in active development. The application already has working authentication, a dashboard shell, live finance entry workflows, account settings, reminders, notifications, and backend stats support.

The right panel and analytics features are the current major focus area.

## Development Philosophy

The project should be built incrementally.

Prefer small, testable changes over large rewrites.

When modifying existing files:

- preserve working behavior
- avoid unnecessary rewrites
- keep logic modular
- keep TypeScript types clear
- prefer readable beginner-friendly code
- avoid clever abstractions unless they clearly reduce complexity

## AI Editing Rules

When acting as an AI coding agent:

- Modify files in-place when tool access exists.
- Do not print full code unless requested.
- Prefer focused diffs over full rewrites.
- Scope changes to relevant files only.
- Do not scan or modify unrelated areas unless needed.
- Ask if structure is unclear.
- Do not guess file architecture.
- Stop when the requested task is complete.

## Output Style

Default output should be concise.

Use:

- short status updates
- changed file list
- brief explanation only when needed

Avoid:

- filler
- repeated context
- unnecessary long explanations
- dumping full files unless requested

## User Prompt Structure

The preferred task format is:

```txt
Context: [project / stack / situation]
Goal: [what should be done]
Constraints: [rules, limits, preferences]
Output: [format: code / bullets / diff / explanation]
Task: [first action]
```

## Important Rule

If a task touches UI, charts, layout, or data behavior, read the matching docs first:

- UI work: UI_RULES.md
- Chart or analytics work: CHART_RULES.md
- Backend/frontend data flow: DATA_RULES.md
- Current repository state: PROJECT_STATUS.md
