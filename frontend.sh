#!/bin/bash
set -e

echo "==> frontend.sh: starting frontend workflow"

cd frontend || { echo "frontend folder not found"; exit 1; }

echo "Installing frontend dependencies..."
npm install

echo "Starting frontend dev server (npm run dev)"
# run in foreground so caller can manage backgrounding
npm run dev
