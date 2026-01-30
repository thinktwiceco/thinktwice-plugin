---
description: CREATE PULL REQUEST
---

Analyze current changes and create a GitHub PR with appropriate description and labels.

## Actions

1. Check current branch name
2. Get git diff to analyze changes
3. Determine PR type from changes:
   - `type:feature` - New functionality
   - `type:bugfix` - Bug fixes
   - `type:breaking` - Breaking changes
   - `type:documentation` - Docs only
   - `type:refactor` - Code refactoring
   - `type:performance` - Performance improvements
   - `type:chore` - Maintenance
4. Determine area labels from changed files:
   - `area:ui`, `area:storage`, `area:services`, `area:notifications`, `area:background`, `area:content`, `area:popup`, `area:hooks`, `area:managers`, `area:docs`, `area:build`, `area:workflows`
5. Generate PR description with:
   - Summary of changes
   - List of modified files
   - Breaking changes (if any)
   - Testing notes
6. Create PR using GitHub CLI or API:
   - Title: Follow conventional commit format
   - Body: Generated description
   - Labels: Type and area labels
   - Base branch: master (or development for ongoing work)
7. Output PR URL

## Rules

- PR title should follow conventional commit format
- Include clear description of what changed and why
- List breaking changes prominently if present
- Add appropriate labels for changelog generation
- Set base branch to `master` for releases, `development` for ongoing work
- Ensure CODEOWNERS (@vertefra, @emypeeler) are notified for review
