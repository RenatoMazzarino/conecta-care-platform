#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "Maintenance: syncing dependencies and lint"
bash scripts/setup.sh

echo "Maintenance: running build"
npm run build

