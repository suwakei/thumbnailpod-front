#!/bin/bash
# ESLint — Next.js プロジェクト全体を静的解析

set -e

PROJECT_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$PROJECT_ROOT"

echo "[lint] Running ESLint..."
npm run lint

echo "[lint] Done."
