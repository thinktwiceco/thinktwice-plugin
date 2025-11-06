#!/bin/bash

# Tag format validation script
# Validates that tag matches semantic versioning pattern: v0.0.1

if [ -z "$1" ]; then
  echo "Usage: $0 <tag-name>"
  echo "Example: $0 v0.0.1"
  exit 1
fi

TAG_NAME="$1"

# Validate tag format: v{major}.{minor}.{patch}
if [[ ! $TAG_NAME =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Error: Invalid tag format '$TAG_NAME'"
  echo "Tag must match pattern: v0.0.1 (semantic versioning)"
  echo "Example: v1.0.0, v0.1.0, v0.0.1"
  exit 1
fi

echo "Tag format is valid: $TAG_NAME"
exit 0

