#!/bin/bash
# TypeScript 型チェック — tsc --noEmit でコンパイルエラーを検出する

set -e

PROJECT_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$PROJECT_ROOT"

echo "[typecheck] Running tsc --noEmit..."
npx tsc --noEmit

echo "[typecheck] Done."
