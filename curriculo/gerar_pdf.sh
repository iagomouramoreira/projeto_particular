#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
OUT="$ROOT/CV_Iago_Moura.pdf"
HTML="file://$ROOT/CV_Iago_Moura.html"
USER_DIR="${TMPDIR:-/tmp}/chrome-cv-print"

mkdir -p "$USER_DIR"
timeout 25 google-chrome \
  --headless=new \
  --disable-gpu \
  --no-sandbox \
  --disable-dev-shm-usage \
  --no-first-run \
  --no-default-browser-check \
  --disable-extensions \
  --disable-background-networking \
  --user-data-dir="$USER_DIR" \
  --no-pdf-header-footer \
  --virtual-time-budget=4000 \
  --print-to-pdf="$OUT" \
  "$HTML"

echo "PDF gerado: $OUT"
