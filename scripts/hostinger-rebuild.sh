#!/usr/bin/env bash
# Clean rebuild for Hostinger Node.js (evomi.shop frontend)
# Run this ON the Hostinger server in the frontend repo folder.
#
# Production start (`npm start`) uses --max-old-space-size=1024 so the Node
# process fits shared Hostinger RAM better than 2048. Prefer building locally
# or in CI and uploading `.next` when the server is near its memory limit.
# In hPanel: stop unused Node apps and set the start command to `npm start`.
set -euo pipefail

echo "==> Checking git status"
git fetch origin main
git checkout main
git reset --hard origin/main

echo "==> Removing old Next build (prevents mixed/missing chunks)"
rm -rf .next

echo "==> Installing dependencies"
if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

echo "==> Building production bundle"
npm run build

if [ ! -f .next/BUILD_ID ]; then
  echo "ERROR: .next/BUILD_ID missing — build failed"
  exit 1
fi

echo "==> Build OK. BUILD_ID=$(cat .next/BUILD_ID)"
echo ""
echo "Restart the Node app now, for example:"
echo "  pm2 restart evomi-frontend"
echo "  # or use Hostinger Node.js panel → Restart"
echo ""
echo "Then verify in browser (incognito):"
echo "  https://evomi.shop/"
echo "Open DevTools → Network: /_next/static/chunks/*.css must be 200 (not 404)."
