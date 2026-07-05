#!/bin/bash
# SessionStart hook: install this project's dependencies so Claude Code (web)
# can run `npm run check`, `npm run build`, and `npm run dev` immediately.
#
# Runs synchronously by default so the session doesn't start before deps exist.
# Idempotent: `npm install` is a no-op when node_modules already matches the
# lockfile, and the container image is cached after the hook succeeds.
set -euo pipefail

# Only needed in the remote (web) environment; locally the developer manages
# their own dependencies.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-.}"

echo "[session-start] Installing npm dependencies..."
npm install --no-audit --no-fund
echo "[session-start] Dependencies ready."
