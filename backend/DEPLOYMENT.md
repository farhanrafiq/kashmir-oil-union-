# Kashmir Oil Union Backend - Deployment Guide

## Prerequisites

- Ubuntu 20.04+ or similar Linux distribution
- Root or sudo access
- Domain name (optional, for production)

## Option 1: Docker Deployment (Recommended)

### Step 1: Install Docker and Docker Compose

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

### Step 2: Clone and Configure

```bash
# Clone your repository
git clone <your-repo-url>
cd kashmir-oil-union-/backend

# Create environment file
cp .env.example .env
nano .env  # Edit with production values
```

### Step 3: Configure Environment Variables

```bash
# .env file - IMPORTANT: Use strong, unique values!
NODE_ENV=production
PORT=5000

DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=<strong-random-password>
DB_NAME=kashmir_oil_union

JWT_SECRET=<strong-random-secret-64-chars>
JWT_REFRESH_SECRET=<different-strong-random-secret-64-chars>

CORS_ORIGIN=https://yourdomain.com
```

### Step 4: Deploy

```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### Step 5: Setup Reverse Proxy (Nginx)

```bash
# Install Nginx
sudo apt install nginx -y

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/kashmir-oil-api
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/kashmir-oil-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 6: Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal test
sudo certbot renew --dry-run
```

## Option 2: Manual Deployment (Without Docker)

### Step 1: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL 16
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt update
sudo apt install -y postgresql-16

# Install PM2 (Process Manager)
sudo npm install -g pm2
```

### Step 2: Setup Database

```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL shell:
CREATE DATABASE kashmir_oil_union;
CREATE USER kashmir_user WITH ENCRYPTED PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE kashmir_oil_union TO kashmir_user;
\q

# Import schema
sudo -u postgres psql kashmir_oil_union < database/schema.sql
sudo -u postgres psql kashmir_oil_union < database/seed.sql
```

### Step 3: Setup Application

```bash
# Clone repository
git clone <your-repo-url>
cd kashmir-oil-union-/backend

# Install dependencies
npm ci --only=production

# Create environment file
cp .env.example .env
nano .env  # Edit with your values

# Build TypeScript
npm run build
```

### Step 4: Start with PM2

```bash
# Start application
pm2 start dist/server.js --name kashmir-oil-api

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Run the command that PM2 outputs

# Monitor
pm2 monit

# View logs
pm2 logs kashmir-oil-api
```

### Step 5: Setup Nginx (Same as Docker option)

Follow Step 5 and 6 from Docker deployment above.

## Monitoring and Maintenance

### View Application Logs

**Docker:**
```bash
docker-compose logs -f api
```

**PM2:**
```bash
pm2 logs kashmir-oil-api
```

### Restart Application

**Docker:**
```bash
docker-compose restart api
```

**PM2:**
```bash
pm2 restart kashmir-oil-api
```

### Database Backup

```bash
# Backup database
docker-compose exec postgres pg_dump -U postgres kashmir_oil_union > backup_$(date +%Y%m%d).sql

# Or without Docker:
pg_dump -U kashmir_user kashmir_oil_union > backup_$(date +%Y%m%d).sql
```

### Update Application

**Docker:**
```bash
git pull
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

**PM2:**
```bash
git pull
npm ci --only=production
npm run build
pm2 restart kashmir-oil-api
```

## Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secrets (64+ characters)
- [ ] Enable firewall (ufw)
- [ ] Setup SSL/TLS certificates
- [ ] Configure proper CORS origins
- [ ] Regular security updates
- [ ] Database backups scheduled
- [ ] Monitor logs regularly
- [ ] Use environment variables for secrets
- [ ] Restrict database access
- [ ] Enable fail2ban for SSH protection
- [ ] Setup monitoring (optional: Prometheus, Grafana)

## Firewall Configuration

```bash
# Install UFW
sudo apt install ufw -y

# Default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH
sudo ufw allow ssh

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
sudo ufw status
```

## Troubleshooting

### Check Application Status

```bash
# Docker
docker-compose ps
docker-compose logs --tail=100 api

# PM2
pm2 status
pm2 logs --lines 100
```

### Check Database Connection

```bash
# Docker
docker-compose exec postgres psql -U postgres -c "SELECT NOW();"

# Manual
psql -U kashmir_user -d kashmir_oil_union -c "SELECT NOW();"
```

### Check Nginx Status

```bash
sudo systemctl status nginx
sudo nginx -t
```

### Common Issues

1. **Port already in use**: Change PORT in .env
2. **Database connection failed**: Check DB credentials
3. **502 Bad Gateway**: Application not running
4. **CORS errors**: Update CORS_ORIGIN in .env

## Performance Optimization

1. **Database Indexing**: Already included in schema
2. **Connection Pooling**: Configured (20 connections default)
3. **Compression**: Enabled in app.ts
4. **Rate Limiting**: Configured (100 req/15min)
5. **PM2 Cluster Mode**: 
   ```bash
   pm2 start dist/server.js -i max --name kashmir-oil-api
   ```

## Monitoring Setup (Optional)

### Setup Prometheus & Grafana

```bash
# Add to docker-compose.yml
# See documentation for full setup
```

### Setup Log Rotation

```bash
# Create logrotate config
sudo nano /etc/logrotate.d/kashmir-oil

/path/to/app/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 node node
    sharedscripts
}
```

## Support

For issues during deployment, check:
1. Application logs
2. Database logs
3. Nginx error logs: `/var/log/nginx/error.log`
4. System logs: `sudo journalctl -xe`
