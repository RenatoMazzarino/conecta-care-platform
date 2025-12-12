#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

test_script="$(npm pkg get scripts.test | tr -d '\r\n')"

if [ "$test_script" = "{}" ]; then
  echo "Test: no tests configured (scripts.test missing)"
  exit 0
fi

if [ "$test_script" = "\"bash scripts/test.sh\"" ] || [ "$test_script" = "\"bash ./scripts/test.sh\"" ]; then
  echo "Test: scripts.test points to scripts/test.sh (refusing recursion)"
  exit 1
fi

echo "Test: running npm test"
npm test

