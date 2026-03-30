#!/bin/bash
# next build — ビルドエラーを即時検出する

set -e

PROJECT_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$PROJECT_ROOT"

echo "[build] Running next build..."
npm run build

echo "[build] Done."
