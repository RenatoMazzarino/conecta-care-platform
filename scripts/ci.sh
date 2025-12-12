#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "CI: syncing dependencies, lint, and build"
bash scripts/maintenance.sh

