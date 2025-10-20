#!/bin/bash

# Server Setup Script for IDURAR ERP CRM
echo "Starting server setup..."

# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js (using NodeSource repository for latest LTS)
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Clone the repository (if not already present)
if [ ! -d "idurar-erp-crm" ]; then
    git clone https://github.com/idurar/idurar-erp-crm.git
fi

cd idurar-erp-crm

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install

# Update environment variables for production
cat > .env << EOF
DATABASE="mongodb+srv://invoice_db_user:invoice_db_password@cluster0.rpsij4r.mongodb.net/invoice_saas?retryWrites=true&w=majority&appName=Cluster0"
JWT_SECRET="django-insecure-j8op9)1q8$1&@^s&p*_0%d#pr@w9qj@lo=3#@d=a(^@9@zd@%j"
NODE_ENV="production"
OPENSSL_CONF='/dev/null'
PUBLIC_SERVER_FILE="http://209.38.125.184:8888/"
FRONTEND_URL="http://209.38.125.184:3005"
APP_PATH=/invoice
EOF

# Run setup script
npm run setup

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd ../frontend
npm install

# Build frontend for production
npm run build

# Create PM2 ecosystem file
cd ..
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'idurar-backend',
      cwd: './backend',
      script: 'npm',
      args: 'run dev',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'idurar-frontend',
      cwd: './frontend',
      script: 'npm',
      args: 'run dev',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
EOF

# Start applications with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo "Setup complete! Applications are running with PM2."
echo "Backend: http://209.38.125.184:8888"
echo "Frontend: http://209.38.125.184:3005"
echo ""
echo "PM2 Commands:"
echo "pm2 status - Check application status"
echo "pm2 logs - View logs"
echo "pm2 restart all - Restart applications"
echo "pm2 stop all - Stop applications"