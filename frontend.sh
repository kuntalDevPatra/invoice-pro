#!/bin/bash
set -e

# echo "==> frontend.sh: starting frontend workflow"

# cd frontend || { echo "frontend folder not found"; exit 1; }

# echo "Installing frontend dependencies..."

# Optionally skip install (useful in CI when caching node_modules)
# if [ "$SKIP_INSTALL" = "1" ] || [ "$SKIP_INSTALL" = "true" ]; then
# 	echo "SKIP_INSTALL is set, skipping npm install"
# else
# 	# Quick permission check: ensure current user can write to workspace
# 	WORKDIR=$(pwd)
# 	if [ ! -w "$WORKDIR" ]; then
# 		echo "Warning: no write permission to $WORKDIR"
# 		echo "Try running: sudo chown -R \\$(whoami) $WORKDIR"
# 	fi

# 	# Prefer npm ci when a lockfile exists for reproducible installs
# 	if [ -f package-lock.json ] || [ -f npm-shrinkwrap.json ]; then
# 		echo "Lockfile found, running: npm ci --unsafe-perm --no-audit --no-fund"
# 		npm ci --unsafe-perm --no-audit --no-fund
# 	else
# 		echo "No lockfile found, running: npm install --unsafe-perm --no-audit --no-fund"
# 		npm install --unsafe-perm --no-audit --no-fund
# 	fi
# fi

# echo "Starting frontend dev server (npm run dev)"
# # run in foreground so caller can manage backgrounding
npm run dev
