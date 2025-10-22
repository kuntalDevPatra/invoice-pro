#!/bin/bash
set -e

echo "==> frontend.sh: starting frontend workflow"

cd frontend || { echo "frontend folder not found"; exit 1; }

echo "Working directory: $(pwd)"

# Decide whether to run install
RUN_INSTALL=1
if [ "$SKIP_INSTALL" = "1" ] || [ "$SKIP_INSTALL" = "true" ]; then
	echo "SKIP_INSTALL is set, skipping npm install"
	RUN_INSTALL=0
fi

# If running under PM2 and node_modules exists, skip install to avoid repeated installs on restarts
if [ -n "$PM2_HOME" ] && [ -d node_modules ] && [ "$(ls -A node_modules)" ]; then
	echo "Detected PM2 environment and existing node_modules; skipping install"
	RUN_INSTALL=0
fi

if [ $RUN_INSTALL -eq 1 ]; then
	echo "Installing frontend dependencies..."
	# Quick permission check
	WORKDIR=$(pwd)
	if [ ! -w "$WORKDIR" ]; then
		echo "Warning: no write permission to $WORKDIR"
		echo "Try running: sudo chown -R \\$(whoami) $WORKDIR"
	fi

	if [ -f package-lock.json ] || [ -f npm-shrinkwrap.json ]; then
		echo "Lockfile found, running: npm ci --unsafe-perm --no-audit --no-fund"
		npm ci --unsafe-perm --no-audit --no-fund
	else
		echo "No lockfile found, running: npm install --unsafe-perm --no-audit --no-fund"
		npm install --unsafe-perm --no-audit --no-fund
	fi
fi

echo "Starting frontend dev server (npm run dev)"
# run in foreground so caller can manage backgrounding
npm run dev
