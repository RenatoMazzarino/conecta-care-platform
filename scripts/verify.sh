#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "Verify: running lint"
npm run lint

echo "Verify: running build"
npm run build
