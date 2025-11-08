# Versioning Workflow - Simple Guide

## Manual Release Workflow (Recommended)

When you're ready to create a new release, follow these steps:

### Step 1: Make Changes & Commit

```bash
git add .
git commit -m "feat: add new feature"    # Use conventional commits
```

**Commit types:**

- `feat:` → Minor version bump (0.0.1 → 0.1.0)
- `fix:` → Patch version bump (0.0.1 → 0.0.2)
- `feat!:` → Major version bump (0.0.1 → 1.0.0)

### Step 2: Create Release (Locally)

```bash
npm run release
```

**What this does:**

- ✅ Analyzes commit messages since last release
- ✅ Determines next version (patch/minor/major)
- ✅ Updates `package.json` version
- ✅ Updates `CHANGELOG.md`
- ✅ Creates a git commit with changes
- ✅ Creates a git tag (e.g., `v0.1.0`)

### Step 3: Push to Master

```bash
git push --follow-tags origin master
```

**What happens:**

- ✅ Pushes your commits and tag to master
- ✅ GitHub Actions validates the tag format
- ✅ GitHub Actions verifies version matches package.json
- ✅ Done!

---

## Complete Example

```bash
# 1. Make changes
git add .
git commit -m "feat: add dark mode"
git commit -m "fix: resolve button styling"

# 2. Create release (will bump to 0.1.0 because of "feat")
npm run release
# Output:
# ✔ bumping version in package.json from 0.0.1 to 0.1.0
# ✔ outputting changes to CHANGELOG.md
# ✔ created tag v0.1.0

# 3. Push everything
git push --follow-tags origin master
```

---

## Force Specific Version

If you want to force a specific version bump:

```bash
npm run release:patch   # 0.0.1 → 0.0.2
npm run release:minor   # 0.0.1 → 0.1.0
npm run release:major   # 0.0.1 → 1.0.0

# Then push
git push --follow-tags origin master
```

---

## How It Works

1. **You make changes** with conventional commit messages
2. **You run `npm run release`** when ready to create a new version
3. **`standard-version` analyzes** your commits and determines the version
4. **You push** the tag and changes to master
5. **GitHub Actions validates** the tag format and version consistency

**You control when releases happen!**

---

## Summary

**Three simple steps:**

1. `git commit -m "feat: new feature"`
2. `npm run release`
3. `git push --follow-tags origin master`

That's it!
