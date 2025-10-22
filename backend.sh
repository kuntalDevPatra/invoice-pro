#!/bin/bash
set -e

echo "==> backend.sh: starting backend workflow"

cd backend || { echo "backend folder not found"; exit 1; }

echo "Installing backend dependencies..."
npm install

echo "Running setup script..."
npm run setup || true

# Port and helper to find PIDs listening on the port
PORT=8888
get_listening_pids() {
  if command -v lsof >/dev/null 2>&1; then
    lsof -t -i :${PORT} 2>/dev/null || true
  elif command -v ss >/dev/null 2>&1; then
    ss -ltnp 2>/dev/null | awk -F"," "/:${PORT}/ { gsub(/.*pid=/, \"\", \$2); gsub(/,.*/, \"\", \$2); print \$2 }" || true
  else
    echo ""
  fi
}

EXISTING_PIDS=$(get_listening_pids)
if [ -n "$EXISTING_PIDS" ]; then
  echo "Found existing process(es) listening on port ${PORT}: $EXISTING_PIDS"
  kill $EXISTING_PIDS 2>/dev/null || true
  sleep 1
  STILL_PIDS=$(get_listening_pids)
  if [ -n "$STILL_PIDS" ]; then
    echo "Process(es) still present, force killing: $STILL_PIDS"
    kill -9 $STILL_PIDS 2>/dev/null || true
    sleep 1
  fi
fi

echo "Starting backend server (npm run dev)"
# run in foreground so caller can manage backgrounding
npm run dev