#!/bin/bash

# InvoiceShelf Quick Start Script
# Use this to start the application on an already configured server

set -e

echo "🚀 Starting InvoiceShelf..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please run deploy.sh first."
    exit 1
fi

# Start services
echo "🔄 Starting services..."
sudo systemctl start mysql
sudo systemctl start nginx
sudo systemctl start php8.1-fpm

# Run migrations (in case of updates)
echo "🗃️  Running migrations..."
php artisan migrate --force

# Clear caches
echo "🧹 Clearing caches..."
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Optimize for production
echo "⚡ Optimizing..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Start queue worker
echo "👷 Starting queue worker..."
sudo systemctl start invoiceshelf-worker

# Check status
echo "📊 Service Status:"
sudo systemctl is-active mysql && echo "✅ MySQL: Running" || echo "❌ MySQL: Stopped"
sudo systemctl is-active nginx && echo "✅ Nginx: Running" || echo "❌ Nginx: Stopped"
sudo systemctl is-active php8.1-fpm && echo "✅ PHP-FPM: Running" || echo "❌ PHP-FPM: Stopped"
sudo systemctl is-active invoiceshelf-worker && echo "✅ Queue Worker: Running" || echo "❌ Queue Worker: Stopped"

echo "✅ InvoiceShelf is now running!"
echo "🌍 Access your application at: http://$(hostname -I | awk '{print $1}')"