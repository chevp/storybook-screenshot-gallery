#!/usr/bin/env bash
# Docker-only build + FTPS-deploy of the Storybook screenshot gallery.
#
# Usage:
#   scripts/deploy.sh               # build + deploy
#   scripts/deploy.sh --build-only  # build only, skip FTPS upload
#
# Credentials are read from scripts/.env (gitignored) or the environment:
#   FTP_HOST       — FTPS hostname
#   FTP_USERNAME   — FTPS user
#   FTP_PASSWORD   — FTPS password
#   FTP_PORT       — FTPS port (default: 21)
#   DEPLOY_PATH    — remote subpath, e.g. "my-gallery" (default: "gallery")
#
# Requirements on the host:
#   - docker
#
# Target layout on the remote:
#   /<DEPLOY_PATH>/**  ← storybook-static/

set -euo pipefail

REPO_ROOT=$(cd "$(dirname "$0")/.." && pwd)
ENV_FILE="$REPO_ROOT/scripts/.env"
if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  . "$ENV_FILE"
  set +a
fi

BUILD_ONLY=0
for arg in "$@"; do
  case "$arg" in
    --build-only) BUILD_ONLY=1 ;;
    *) echo "unknown arg: $arg" >&2; exit 64 ;;
  esac
done

# Keep the image tag aligned with the @playwright/test version in package.json.
# Bump both together.
PLAYWRIGHT_IMAGE="${PLAYWRIGHT_IMAGE:-mcr.microsoft.com/playwright:v1.48.2-jammy}"

echo "▶ Building storybook-static inside $PLAYWRIGHT_IMAGE"
# Clean the screenshots dir FIRST so we never ship stale PNGs from a previous
# run — a partial Playwright failure must be visible, not masked by leftovers.
rm -rf "$REPO_ROOT/e2e/screenshots/scenarios"

docker run --rm \
  -v "$REPO_ROOT:/work" \
  -w /work \
  -e CI=true \
  "$PLAYWRIGHT_IMAGE" \
  bash -ec '
    npm ci
    # Tolerate per-test failures — we still ship whatever screenshots succeeded.
    npx playwright test e2e/scenarios/ || echo "⚠ some playwright scenarios failed — gallery will ship only the screenshots that were produced"
    shot_count=$(find e2e/screenshots/scenarios -name "*.png" 2>/dev/null | wc -l | tr -d " ")
    echo "▶ playwright produced $shot_count screenshot(s)"
    if [ "$shot_count" -eq 0 ]; then
      echo "✗ no screenshots produced — aborting before we upload an empty gallery" >&2
      exit 3
    fi
    npm run storybook:build
    cp scripts/.htaccess  storybook-static/ 2>/dev/null || true
    cp scripts/robots.txt storybook-static/ 2>/dev/null || true
  '

ARTIFACT_DIR="$REPO_ROOT/storybook-static"
if [[ ! -d "$ARTIFACT_DIR" ]]; then
  echo "✗ storybook-static was not produced at $ARTIFACT_DIR" >&2
  exit 1
fi

if [[ "$BUILD_ONLY" -eq 1 ]]; then
  echo "✓ Build done (storybook-static/). Skipping upload (--build-only)."
  exit 0
fi

: "${FTP_HOST:?FTP_HOST not set (export it or put it in scripts/.env)}"
: "${FTP_USERNAME:?FTP_USERNAME not set}"
: "${FTP_PASSWORD:?FTP_PASSWORD not set}"
export FTP_PORT="${FTP_PORT:-21}"
export DEPLOY_PATH="${DEPLOY_PATH:-gallery}"
export FTP_HOST FTP_USERNAME FTP_PASSWORD

echo "▶ Pre-flight: TCP connect to $FTP_HOST:$FTP_PORT"
if ! docker run --rm \
  -e FTP_HOST -e FTP_PORT \
  alpine:3.20 sh -ec '
    apk add -q busybox-extras >/dev/null
    nc -z -w 5 "$FTP_HOST" "$FTP_PORT"
  '; then
  echo "✗ Cannot reach $FTP_HOST:$FTP_PORT (TCP connect failed)." >&2
  echo "  Check FTP_HOST/FTP_PORT in scripts/.env." >&2
  exit 2
fi

echo "▶ Uploading to ftps://$FTP_HOST:$FTP_PORT → /$DEPLOY_PATH/"
docker run --rm \
  -v "$ARTIFACT_DIR:/data:ro" \
  -e FTP_HOST -e FTP_PORT -e FTP_USERNAME -e FTP_PASSWORD -e DEPLOY_PATH \
  alpine:3.20 sh -ec '
    apk add -q lftp
    lftp <<LFTP
      set ftp:ssl-force true
      set ftp:ssl-protect-data true
      set ssl:verify-certificate no
      set net:max-retries 3
      set net:reconnect-interval-base 5
      open -u "$FTP_USERNAME","$FTP_PASSWORD" -p "$FTP_PORT" "$FTP_HOST"
      mirror -R --parallel=4 --verbose /data/ "/$DEPLOY_PATH/"
      bye
LFTP
  '

echo "✓ Deployed. Gallery live at https://$FTP_HOST/$DEPLOY_PATH/"