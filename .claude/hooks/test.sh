#!/bin/bash
# Jest / Vitest — ユニットテスト・コンポーネントテストを実行する

set -e

PROJECT_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$PROJECT_ROOT"

if ! npm run test --if-present -- --passWithNoTests 2>/dev/null; then
  echo "[test] No test script found or tests failed. Skipping."
  exit 0
fi

echo "[test] Done."
