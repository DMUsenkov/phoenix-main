#!/usr/bin/env bash
set -e

mkdir -p results

BASE_URL="http://127.0.0.1:3000"
USER_EMAIL="ghokih@yandex.ru"
USER_PASSWORD="12345678"
QR_CODE="powbPI4B"

echo "=== QR TEST ==="
BASE_URL="$BASE_URL" QR_CODE="$QR_CODE" RATE=20 DURATION=3m \
k6 run --summary-export results/qr_summary.json load-tests/qr_test.js \
2>&1 | tee results/qr_console.txt

echo "=== LOGIN TEST ==="
BASE_URL="$BASE_URL" USER_EMAIL="$USER_EMAIL" USER_PASSWORD="$USER_PASSWORD" RATE=10 DURATION=3m \
k6 run --summary-export results/login_summary.json load-tests/login_test.js \
2>&1 | tee results/login_console.txt

echo "=== CREATE PAGE TEST ==="
BASE_URL="$BASE_URL" USER_EMAIL="$USER_EMAIL" USER_PASSWORD="$USER_PASSWORD" RATE=2 DURATION=3m \
k6 run --summary-export results/create_page_summary.json load-tests/create_page_test.js \
2>&1 | tee results/create_page_console.txt

echo "=== DONE ==="
echo "Результаты лежат в папке results/"
