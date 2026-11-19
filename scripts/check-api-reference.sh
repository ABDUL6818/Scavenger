#!/usr/bin/env bash
# Verify that docs/API_REFERENCE.md documents every route registered in the backend app,
# that the published OpenAPI document (docs/api/openapi.json) exists, parses as JSON,
# and contains a path entry for every registered route, and that the removed duplicate
# API docs are not referenced anywhere.
# Usage: scripts/check-api-reference.sh
set -eu

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
REF="docs/API_REFERENCE.md"
MAIN="backend/src/main.rs"
OPENAPI="docs/api/openapi.json"
failures=0

# Every literal path passed to .route("...") in the app setup.
routes="$(grep -oE '\.route\("[^"]+"' "$MAIN" | sed -E 's/\.route\("//; s/"$//' | sort -u)"
count=0
while IFS= read -r route; do
  [ -z "$route" ] && continue
  count=$((count + 1))
  if ! grep -qF -- "$route" "$REF"; then
    echo "UNDOCUMENTED: $route is registered in $MAIN but not in $REF"
    failures=$((failures + 1))
  fi
done <<< "$routes"

# The published OpenAPI document must exist, parse as JSON, and cover every route.
if [ ! -f "$OPENAPI" ]; then
  echo "MISSING: $OPENAPI not found. Run the OpenAPI generator to publish the API reference."
  failures=$((failures + 1))
else
  if ! command -v python3 >/dev/null 2>&1; then
    echo "SKIP: python3 not available; cannot validate $OPENAPI as JSON."
  else
    if ! python3 -c 'import json,sys; json.load(open(sys.argv[1]))' "$OPENAPI" 2>/dev/null; then
      echo "INVALID JSON: $OPENAPI does not parse. Run the OpenAPI generator to regenerate it."
      failures=$((failures + 1))
    else
      while IFS= read -r route; do
        [ -z "$route" ] && continue
        if ! python3 -c '
import json, sys
spec = json.load(open(sys.argv[1]))
paths = spec.get("paths", {}) if isinstance(spec, dict) else {}
sys.exit(0 if sys.argv[2] in paths else 1)
' "$OPENAPI" "$route" 2>/dev/null; then
          echo "MISSING PATH: $route is registered in $MAIN but absent from $OPENAPI. Run the OpenAPI generator to regenerate it."
          failures=$((failures + 1))
        fi
      done <<< "$routes"
    fi
  fi
fi

# The duplicates were merged into $REF; nothing should point at them any more.
if git grep -n -E '(^|[^A-Za-z0-9_-])(api-reference\.md|API_REFERENCE_GUIDE|API_DOCUMENTATION\.md)' -- . ':!docs/CHANGELOG*' ':!scripts/check-api-reference.sh' 2>/dev/null; then
  echo "STALE LINK: references to removed API docs found (see above)"
  failures=$((failures + 1))
fi

if [ "$failures" -eq 0 ]; then
  echo "API reference check passed: $count registered routes documented in $REF and $OPENAPI."
fi
exit "$failures"