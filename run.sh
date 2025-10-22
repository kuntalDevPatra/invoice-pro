#!/bin/bash
# Install Backend Dependencies
echo "Installing backend dependencies..."
cd backend
npm install

# Run Setup Script
echo "Running setup script..."
npm run setup

# Start Backend Server in background
echo "Starting backend server..."
## If something is already listening on port 8888, attempt to kill it to avoid EADDRINUSE.
## Prefer lsof; fall back to ss if lsof isn't available.
get_listening_pids() {
	if command -v lsof >/dev/null 2>&1; then
		lsof -t -i :8888 2>/dev/null || true
	elif command -v ss >/dev/null 2>&1; then
		ss -ltnp 2>/dev/null | awk -F"," '/:8888/ { gsub(/.*pid=/, "", $2); gsub(/,.*/, "", $2); print $2 }' || true
	else
		echo "" 
	fi
}

EXISTING_PIDS=$(get_listening_pids)
if [ -n "$EXISTING_PIDS" ]; then
	echo "Found existing process(es) listening on port 8888: $EXISTING_PIDS"
	# Try graceful kill first
	kill $EXISTING_PIDS 2>/dev/null || true
	sleep 1
	# If still present, force kill
	STILL_PIDS=$(get_listening_pids)
	if [ -n "$STILL_PIDS" ]; then
		echo "Process(es) still present, force killing: $STILL_PIDS"
		kill -9 $STILL_PIDS 2>/dev/null || true
		sleep 1
	fi
fi
npm run dev &
BACKEND_PID=$!

# Install Frontend Dependency
echo "Installing frontend dependencies..."
cd ../frontend
npm install

# Start Frontend Server
echo "Starting frontend server..."
npm run dev &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "Both servers are running. Press Ctrl+C to stop both servers."

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait