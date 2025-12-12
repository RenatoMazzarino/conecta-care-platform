#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "Setup: installing dependencies (npm ci)"
npm ci --prefer-offline --no-audit --no-fund

echo "Setup: running lint"
npm run lint

