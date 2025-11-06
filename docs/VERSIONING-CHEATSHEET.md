# Versioning System Cheatsheet

Quick reference guide for managing versions in the Maurice plugin project.

## Quick Commands

```bash
# Auto-determine version from commit messages
npm run release

# Force specific version bump
npm run release:patch   # 0.0.1 → 0.0.2
npm run release:minor   # 0.0.1 → 0.1.0
npm run release:major   # 0.0.1 → 1.0.0

# Validate tag format manually
npm run version:validate v0.1.0
```

## Conventional Commit Format

Use these prefixes in your commit messages to trigger automatic version bumps:

### Version Bump Triggers

| Commit Type | Version Bump | Example |
|------------|--------------|---------|
| `feat:` | **Minor** (0.0.1 → 0.1.0) | `feat: add notification system` |
| `fix:` | **Patch** (0.0.1 → 0.0.2) | `fix: resolve timing bug` |
| `feat!:` or `fix!:` | **Major** (0.0.1 → 1.0.0) | `feat!: breaking API change` |
| `perf:` | **Patch** | `perf: optimize rendering` |
| `refactor:` | **Patch** | `refactor: simplify state management` |
| `chore:` | **None** (unless forced) | `chore: update dependencies` |
| `docs:` | **None** (unless forced) | `docs: update README` |
| `style:` | **None** | `style: format code` |
| `test:` | **None** | `test: add unit tests` |
| `build:` | **None** | `build: update webpack config` |
| `ci:` | **None** | `ci: add GitHub Actions workflow` |

### Commit Message Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Examples:**
```bash
feat(notifications): add celebration notification
fix(amazon): resolve product extraction failure
feat!: change storage API structure
perf(ui): optimize component rendering
chore: update dependencies
```

## Release Workflow

### Standard Workflow (Recommended)

1. **Make your changes and commit:**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

2. **Create release:**
   ```bash
   npm run release
   ```
   This will:
   - Analyze commit messages since last release
   - Determine next version (patch/minor/major)
   - Update `package.json` version
   - Update `CHANGELOG.md`
   - Create git commit with changes
   - Create git tag (e.g., `v0.1.0`)

3. **Push tag to master:**
   ```bash
   git push --follow-tags origin master
   ```

4. **GitHub Actions automatically:**
   - Validates tag format
   - Verifies tag is on master branch
   - Updates version in package.json (safety net)
   - Commits and pushes changes

### Manual Version Bump

If you want to force a specific version bump regardless of commit messages:

```bash
# Force patch bump
npm run release:patch

# Force minor bump
npm run release:minor

# Force major bump
npm run release:major
```

## Version Bump Rules

### Automatic Version Detection

`standard-version` analyzes commits since the last tag:

- **Major bump** (1.0.0): If any commit has `!` after type (e.g., `feat!:`)
- **Minor bump** (0.1.0): If any commit type is `feat:`
- **Patch bump** (0.0.1): If any commit type is `fix:`, `perf:`, or `refactor:`
- **No bump**: For `chore:`, `docs:`, `style:`, `test:`, `build:`, `ci:`

### Examples

**Scenario 1: Feature addition**
```bash
git commit -m "feat: add dark mode"
npm run release
# Result: 0.0.1 → 0.1.0
```

**Scenario 2: Bug fix**
```bash
git commit -m "fix: resolve memory leak"
npm run release
# Result: 0.0.1 → 0.0.2
```

**Scenario 3: Breaking change**
```bash
git commit -m "feat!: change API structure"
npm run release
# Result: 0.0.1 → 1.0.0
```

**Scenario 4: Multiple commits**
```bash
git commit -m "feat: add feature A"
git commit -m "fix: fix bug B"
npm run release
# Result: 0.0.1 → 0.1.0 (highest bump wins)
```

## Tag Format

All tags must follow semantic versioning format:

```
v{major}.{minor}.{patch}
```

**Valid examples:**
- `v0.0.1`
- `v0.1.0`
- `v1.0.0`
- `v2.5.3`

**Invalid examples:**
- `0.0.1` (missing `v` prefix)
- `v0.0.1-beta` (no pre-release tags)
- `v1.0` (missing patch version)

## CHANGELOG.md

The `CHANGELOG.md` is automatically maintained by `standard-version`. It groups changes by:

- **Features** - New functionality
- **Bug Fixes** - Bug resolutions
- **Performance Improvements** - Performance optimizations
- **Code Refactoring** - Code improvements
- **Documentation** - Documentation updates
- **Miscellaneous Chores** - Maintenance tasks
- **Build System** - Build configuration changes
- **Continuous Integration** - CI/CD changes

## GitHub Actions Integration

When you push a tag to master, the workflow (`.github/workflows/update-version.yml`) automatically:

1. ✅ Validates tag format (`v0.0.1`)
2. ✅ Verifies tag is on master branch
3. ✅ Extracts version number
4. ✅ Updates `package.json` version
5. ✅ Commits and pushes changes

**Note:** Since `standard-version` already updates the version locally, this workflow acts as a safety net to ensure consistency.

## Branch Protection

Both `development` and `master` branches are protected with:

- ✅ Require pull request reviews
- ✅ Require review from CODEOWNERS
- ✅ Dismiss stale reviews when new commits are pushed

**CODEOWNERS** (`.github/CODEOWNERS`):
- `@vertefra`
- `@emypeeler`

## Troubleshooting

### Tag validation fails

```bash
# Validate tag format manually
npm run version:validate v0.1.0
```

### Release creates wrong version

```bash
# Check what commits will trigger which version
git log --oneline $(git describe --tags --abbrev=0)..HEAD

# Force specific version if needed
npm run release:patch  # or :minor, :major
```

### CHANGELOG not updating

Make sure your commits follow conventional commit format. Check `.versionrc.json` for supported types.

### GitHub Actions workflow fails

- Ensure tag format is correct: `v0.0.1`
- Verify tag is pushed to master branch
- Check workflow logs in GitHub Actions tab

## File Structure

```
plugin-3/
├── .github/
│   ├── CODEOWNERS              # Code owners for branch protection
│   └── workflows/
│       └── update-version.yml  # Auto-version update on tag push
├── scripts/
│   └── validate-tag.sh         # Tag format validation
├── .versionrc.json             # standard-version configuration
├── CHANGELOG.md                # Auto-generated changelog
└── package.json                # Contains version and release scripts
```

## Quick Reference Table

| Action | Command |
|--------|---------|
| Create release (auto) | `npm run release` |
| Create patch release | `npm run release:patch` |
| Create minor release | `npm run release:minor` |
| Create major release | `npm run release:major` |
| Validate tag | `npm run version:validate v0.1.0` |
| Push tag | `git push --follow-tags origin master` |
| View changelog | `cat CHANGELOG.md` |
| Check current version | `cat package.json | grep version` |

## Best Practices

1. ✅ **Always use conventional commits** - Makes versioning automatic
2. ✅ **Run `npm run release` before pushing tags** - Ensures version is updated
3. ✅ **Review CHANGELOG.md** - Verify changes are correctly categorized
4. ✅ **Push tags to master only** - GitHub Actions validates this
5. ✅ **Use `--follow-tags`** - Pushes both commits and tags together
6. ❌ **Don't manually edit version in package.json** - Let tools handle it
7. ❌ **Don't create tags manually** - Use `npm run release` instead

## Examples

### Complete Release Example

```bash
# 1. Make changes and commit
git add .
git commit -m "feat: add notification system"
git commit -m "fix: resolve timing issue"

# 2. Create release (will bump to 0.1.0 because of feat)
npm run release

# 3. Review changes
git log --oneline -3
cat CHANGELOG.md

# 4. Push tag to master
git push --follow-tags origin master

# 5. GitHub Actions automatically validates and updates
```

### Breaking Change Example

```bash
# 1. Make breaking change
git commit -m "feat!: change storage API"

# 2. Create release (will bump to 1.0.0)
npm run release

# 3. Push tag
git push --follow-tags origin master
```

### Patch Release Example

```bash
# 1. Make bug fix
git commit -m "fix: resolve memory leak"

# 2. Create release (will bump to 0.0.2)
npm run release

# 3. Push tag
git push --follow-tags origin master
```

---

**Last Updated:** 2025-01-07

