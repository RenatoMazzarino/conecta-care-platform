#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "Typecheck: running tsc --noEmit"
npm exec -- tsc --noEmit

