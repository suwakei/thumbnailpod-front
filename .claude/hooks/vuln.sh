#!/bin/bash
# npm audit — 依存ライブラリの既知脆弱性をスキャンする

set -e

PROJECT_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$PROJECT_ROOT"

echo "[vuln] Running npm audit..."
npm audit --audit-level=high || {
  echo "[vuln] High/Critical vulnerabilities found. Review with: npm audit"
  exit 1
}

echo "[vuln] Done."
