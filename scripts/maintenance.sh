#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

export NEXT_TELEMETRY_DISABLED=1
export NO_UPDATE_NOTIFIER=1
export npm_config_update_notifier=false
unset npm_config_http_proxy || true

echo "Maintenance: syncing dependencies and lint"
bash scripts/setup.sh

echo "Maintenance: running typecheck"
npm run typecheck

echo "Maintenance: running build"
npm run build
