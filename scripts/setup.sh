#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

export NO_UPDATE_NOTIFIER=1
export npm_config_update_notifier=false
unset npm_config_http_proxy || true

echo "Setup: installing dependencies (npm ci)"
npm ci --prefer-offline --no-audit --no-fund

echo "Setup: running lint"
npm run lint
