# Git Conventions

This file stores the branch naming rules we want to keep using in ExTra.

## Naming Pattern

Use this general structure:

```text
type/short-description
```

Rules:

- use lowercase only
- use hyphens instead of spaces
- keep the name short but descriptive
- one branch should represent one main purpose

## Branch Prefixes

- `hotfix/`
  Use this for CSS, styling, and UI/UX adjustments.

- `bugfix/`
  Use this for actual bug fixes in behavior, logic, integration, or broken features.

- `feature/`
  Use this for new features or new user-facing functionality.

- `refactor/`
  Use this for code restructuring or cleanup without intentionally changing the feature behavior.

- `chore/`
  Use this for maintenance work, project cleanup, dependency updates, or non-feature supporting tasks.

- `docs/`
  Use this for documentation-only changes.

- `test/`
  Use this for adding or improving tests.

## Examples

- `hotfix/register-mobile-layout`
- `hotfix/header-user-button-spacing`
- `bugfix/auth-register-request`
- `bugfix/reminder-checkbox-state`
- `feature/auth-register-login`
- `feature/dashboard-left-panel`
- `refactor/left-panel-structure`
- `chore/docker-cleanup`
- `docs/project-readme`
- `test/auth-validation`
