#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

export NEXT_TELEMETRY_DISABLED=1
export NO_UPDATE_NOTIFIER=1
export npm_config_update_notifier=false
unset npm_config_http_proxy || true

echo "Verify: running lint"
npm run lint

echo "Verify: running build"
npm run build
