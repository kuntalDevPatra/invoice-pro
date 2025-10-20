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