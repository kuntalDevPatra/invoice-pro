# IDURAR ERP-CRM Deployment Guide

## Sub-path Deployment Configuration

This project is configured to run under a sub-path (e.g., `/invoice`) for nginx deployment.

### Environment Configuration

#### Backend (.env)
```bash
APP_PATH=/invoice
PUBLIC_SERVER_FILE="https://yourdomain.com/invoice/"
FRONTEND_URL="https://yourdomain.com/invoice"
```

#### Frontend (.env)
```bash
VITE_APP_PATH=/invoice
VITE_FILE_BASE_URL='https://yourdomain.com/invoice/'
VITE_BACKEND_SERVER="https://yourdomain.com/invoice/api/"
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend static files
    location /invoice/ {
        alias /path/to/frontend/dist/;
        try_files $uri $uri/ /invoice/index.html;
    }

    # Backend API
    location /invoice/api/ {
        proxy_pass http://localhost:8888/invoice/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend file downloads
    location /invoice/download/ {
        proxy_pass http://localhost:8888/invoice/download/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend public files
    location /invoice/public/ {
        proxy_pass http://localhost:8888/invoice/public/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SSO endpoint
    location /invoice/sso {
        proxy_pass http://localhost:8888/invoice/sso;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Deployment Steps

1. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Copy Frontend Build**
   ```bash
   cp -r frontend/dist/* /var/www/html/invoice/
   ```

3. **Start Backend**
   ```bash
   cd backend
   NODE_ENV=production npm start
   ```

4. **Configure Process Manager (PM2)**
   ```bash
   pm2 start src/server.js --name "idurar-erp-crm"
   pm2 save
   pm2 startup
   ```

### Testing the Deployment

- Frontend: `https://yourdomain.com/invoice/`
- API: `https://yourdomain.com/invoice/api/`
- SSO: `https://yourdomain.com/invoice/sso?token=YOUR_TOKEN`

### Changing the Sub-path

To change from `/invoice` to another path (e.g., `/erp`):

1. Update `APP_PATH=/erp` in both backend and frontend `.env` files
2. Update `VITE_APP_PATH=/erp` in frontend `.env`
3. Update nginx configuration to use `/erp/` instead of `/invoice/`
4. Rebuild and redeploy

### Development vs Production

- **Development**: Uses `localhost:3000` and `localhost:8888` with APP_PATH
- **Production**: Uses your domain with APP_PATH prefix for all routes