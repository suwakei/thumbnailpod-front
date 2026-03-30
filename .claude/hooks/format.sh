#!/bin/bash
# Prettier — プロジェクト全体をフォーマット

set -e

PROJECT_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$PROJECT_ROOT"

if ! command -v npx &> /dev/null; then
  echo "[format] npx not found. Skipping."
  exit 0
fi

if ! npx prettier --version &> /dev/null 2>&1; then
  echo "[format] prettier not found. Skipping. (install: npm install -D prettier)"
  exit 0
fi

echo "[format] Running prettier --write..."
npx prettier --write "**/*.{ts,tsx,js,jsx,json,css,md}" --ignore-path .gitignore

echo "[format] Done."
