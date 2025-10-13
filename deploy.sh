#!/bin/bash

# InvoiceShelf Server Deployment Script
# This script sets up and runs InvoiceShelf on a server with MySQL

set -e

echo "🚀 Starting InvoiceShelf deployment..."

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo "⚠️  Please don't run this script as root"
    exit 1
fi

# Install dependencies
echo "📦 Installing system dependencies..."
sudo apt update
sudo apt install -y php8.1 php8.1-fpm php8.1-mysql php8.1-xml php8.1-gd php8.1-curl php8.1-zip php8.1-mbstring php8.1-bcmath php8.1-intl nginx mysql-server composer nodejs npm

# Setup MySQL
echo "🗄️  Setting up MySQL database..."
sudo mysql -e "CREATE DATABASE IF NOT EXISTS invoiceshelf;"
sudo mysql -e "CREATE USER IF NOT EXISTS 'invoiceshelf'@'localhost' IDENTIFIED BY 'invoiceshelf123';"
sudo mysql -e "GRANT ALL PRIVILEGES ON invoiceshelf.* TO 'invoiceshelf'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

# Setup environment
echo "⚙️  Setting up environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file"
fi

# Update .env for production
sed -i 's/APP_ENV=local/APP_ENV=production/' .env
sed -i 's/APP_DEBUG=true/APP_DEBUG=false/' .env
sed -i 's/DB_DATABASE=.*/DB_DATABASE=invoiceshelf/' .env
sed -i 's/DB_USERNAME=.*/DB_USERNAME=invoiceshelf/' .env
sed -i 's/DB_PASSWORD=.*/DB_PASSWORD=invoiceshelf123/' .env

# Install PHP dependencies
echo "📚 Installing PHP dependencies..."
composer install --optimize-autoloader --no-dev

# Generate application key
echo "🔑 Generating application key..."
php artisan key:generate

# Install and build frontend assets
echo "🎨 Building frontend assets..."
npm install
npm run build

# Set permissions
echo "🔒 Setting file permissions..."
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache

# Run migrations and seeders
echo "🗃️  Running database migrations..."
php artisan migrate --force
php artisan db:seed --force

# Clear and cache config
echo "🧹 Optimizing application..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Setup Nginx
echo "🌐 Setting up Nginx..."
sudo tee /etc/nginx/sites-available/invoiceshelf > /dev/null <<EOF
server {
    listen 80;
    server_name _;
    root $(pwd)/public;
    index index.php;

    location / {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME \$realpath_root\$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.ht {
        deny all;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/invoiceshelf /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl restart php8.1-fpm

# Setup systemd service for queue worker
echo "⚡ Setting up queue worker..."
sudo tee /etc/systemd/system/invoiceshelf-worker.service > /dev/null <<EOF
[Unit]
Description=InvoiceShelf Queue Worker
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=$(pwd)
ExecStart=/usr/bin/php $(pwd)/artisan queue:work --sleep=3 --tries=3
Restart=always

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable invoiceshelf-worker
sudo systemctl start invoiceshelf-worker

# Setup cron for scheduled tasks
echo "⏰ Setting up scheduled tasks..."
(crontab -l 2>/dev/null; echo "* * * * * cd $(pwd) && php artisan schedule:run >> /dev/null 2>&1") | crontab -

echo "✅ InvoiceShelf deployment completed!"
echo "🌍 Your application is now running at: http://$(hostname -I | awk '{print $1}')"
echo "📊 Default admin credentials will be created during first setup"
echo "🔧 Queue worker status: sudo systemctl status invoiceshelf-worker"