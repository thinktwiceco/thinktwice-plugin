---
description: AGENT STEPS TO COMMIT CHANGES
---

Commit the current changes following Conventional Commits specification.

## Actions

1. Check git status to see what files have changed
2. Analyze the changes to determine:
   - Type: feat, fix, docs, style, refactor, perf, test, chore, ci, build
   - Scope: ui, storage, services, notifications, background, content, popup, hooks, managers, docs, build, workflows
   - Subject: concise description of the change
3. Check if changes contain breaking changes (API changes, signature changes, etc.)
4. Generate commit message in format: `<type>(<scope>): <subject>`
5. Add `!` after scope if breaking change detected
6. Include body if change needs explanation (ensure each body line is ≤100 characters)
7. Execute: `git add -A`
8. Execute: `git commit -m "<message>"`

## Rules

- Use lowercase for type and scope
- Subject should be imperative mood, no period at end
- Maximum 72 characters for subject line
- Maximum 100 characters per line in commit body (wrap long lines with proper indentation)
- If breaking change, add `!` after scope or include `BREAKING CHANGE:` in footer
- Scope is optional but recommended

## Linting, testing and formatting

- Before committing execute linting, testing and formatting checks:
  - `npm run lint` or `npm run lint:fix`
  - `npm run format:check` or `npm run format`
  - `npm run test:e2e`

## CRITICAL

- DO NOT EXCEED THE CHARACTER LIMIT
