#!/usr/bin/env bash
# Docker-only build + git-commit of the Storybook screenshot gallery into the
# docs/ folder on the current branch. No GitHub Actions minutes are consumed —
# Pages serves the committed artefact directly.
#
# Usage:
#   scripts/deploy-ghpages.sh               # build + commit + push
#   scripts/deploy-ghpages.sh --build-only  # build only, skip commit/push
#
# Environment (all optional):
#   STORYBOOK_BASE   — URL base path for the deploy, default "/<repo>/"
#                      inferred from the origin remote. Override with "/" for
#                      user/org pages or a custom-domain CNAME setup.
#   DOCS_DIR         — target folder inside the repo (default: docs)
#   GHPAGES_REMOTE   — remote to push to (default: origin)
#   PLAYWRIGHT_IMAGE — pinned playwright image (default matches package.json)
#
# Host requirements: docker, git, bash.
#
# One-time setup on GitHub:
#   Settings → Pages → Source: "Deploy from a branch"
#                    Branch:  main / /docs
#
# Target layout on the current branch:
#   docs/               ← mirror of storybook-static/
#   docs/.nojekyll      ← disables Jekyll so _-prefixed paths work
#   docs/CNAME          ← copied from scripts/CNAME if present

set -euo pipefail

REPO_ROOT=$(cd "$(dirname "$0")/.." && pwd)
cd "$REPO_ROOT"

BUILD_ONLY=0
for arg in "$@"; do
  case "$arg" in
    --build-only) BUILD_ONLY=1 ;;
    *) echo "unknown arg: $arg" >&2; exit 64 ;;
  esac
done

DOCS_DIR="${DOCS_DIR:-docs}"
GHPAGES_REMOTE="${GHPAGES_REMOTE:-origin}"

# Keep the image tag aligned with @playwright/test in package.json.
PLAYWRIGHT_IMAGE="${PLAYWRIGHT_IMAGE:-mcr.microsoft.com/playwright:v1.48.2-jammy}"

# Infer STORYBOOK_BASE from the remote URL if the caller didn't set it.
# chevp/storybook-screenshot-gallery → /storybook-screenshot-gallery/
REMOTE_URL=$(git config --get "remote.${GHPAGES_REMOTE}.url" || true)
if [[ -z "${STORYBOOK_BASE:-}" ]]; then
  if [[ "$REMOTE_URL" =~ github\.com[:/][^/]+/([^/]+)$ ]]; then
    repo="${BASH_REMATCH[1]%.git}"
    STORYBOOK_BASE="/${repo}/"
  else
    echo "✗ Could not infer repo name from remote '$REMOTE_URL'." >&2
    echo "  Set STORYBOOK_BASE explicitly (e.g. STORYBOOK_BASE=/my-gallery/)." >&2
    exit 2
  fi
fi
# Normalise: must start and end with "/"
[[ "$STORYBOOK_BASE" == /* ]] || STORYBOOK_BASE="/$STORYBOOK_BASE"
[[ "$STORYBOOK_BASE" == */ ]] || STORYBOOK_BASE="$STORYBOOK_BASE/"

echo "▶ Building storybook-static inside $PLAYWRIGHT_IMAGE (base=$STORYBOOK_BASE)"
# Clean the screenshots dir FIRST so we never ship stale PNGs from a previous
# run — a partial Playwright failure must be visible, not masked by leftovers.
rm -rf "$REPO_ROOT/e2e/screenshots/scenarios"

docker run --rm \
  -v "$REPO_ROOT:/work" \
  -w /work \
  -e CI=true \
  -e STORYBOOK_BASE="$STORYBOOK_BASE" \
  "$PLAYWRIGHT_IMAGE" \
  bash -ec '
    npm ci
    # Tolerate per-test failures — we still ship whatever screenshots succeeded.
    npx playwright test e2e/scenarios/ || echo "⚠ some playwright scenarios failed — gallery will ship only the screenshots that were produced"
    shot_count=$(find e2e/screenshots/scenarios -name "*.png" 2>/dev/null | wc -l | tr -d " ")
    echo "▶ playwright produced $shot_count screenshot(s)"
    if [ "$shot_count" -eq 0 ]; then
      echo "✗ no screenshots produced — aborting before we publish an empty gallery" >&2
      exit 3
    fi
    npm run storybook:build
    touch storybook-static/.nojekyll
    cp scripts/robots.txt storybook-static/ 2>/dev/null || true
    cp scripts/CNAME      storybook-static/ 2>/dev/null || true
  '

ARTIFACT_DIR="$REPO_ROOT/storybook-static"
if [[ ! -d "$ARTIFACT_DIR" ]]; then
  echo "✗ storybook-static was not produced at $ARTIFACT_DIR" >&2
  exit 1
fi

if [[ "$BUILD_ONLY" -eq 1 ]]; then
  echo "✓ Build done (storybook-static/). Skipping commit/push (--build-only)."
  exit 0
fi

# --- Publish into docs/ on the current branch ----------------------------
# Replace docs/ atomically: wipe it, then mirror storybook-static/. Leaving
# stale files behind would silently serve old assets on Pages.

TARGET="$REPO_ROOT/$DOCS_DIR"
echo "▶ Mirroring storybook-static/ → $DOCS_DIR/"
rm -rf "$TARGET"
mkdir -p "$TARGET"
cp -R "$ARTIFACT_DIR"/. "$TARGET"/

git add "$DOCS_DIR"
if git diff --cached --quiet -- "$DOCS_DIR"; then
  echo "✓ No changes in $DOCS_DIR/ — already up-to-date."
  exit 0
fi

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
git commit -m "deploy: $(date -u +%Y-%m-%dT%H:%M:%SZ) gallery build" -- "$DOCS_DIR"
git push "$GHPAGES_REMOTE" "$CURRENT_BRANCH"

if [[ "$REMOTE_URL" =~ github\.com[:/]([^/]+)/([^/]+)$ ]]; then
  OWNER="${BASH_REMATCH[1]}"
  REPO="${BASH_REMATCH[2]%.git}"
  echo "✓ Pushed ${CURRENT_BRANCH}. Gallery will be live at:"
  echo "  https://${OWNER}.github.io${STORYBOOK_BASE}"
else
  echo "✓ Pushed ${CURRENT_BRANCH}."
fi
