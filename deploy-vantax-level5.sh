#!/bin/bash

# Vanta X-Trade Spend Level 5 Enterprise Deployment Script
# Advanced Trade Promotion Management System
# For Ubuntu 20.04/22.04/24.04 LTS

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="vantax-level5"
APP_DIR="/opt/vantax-level5"
APP_USER="vantax"
NODE_VERSION="20"
BACKEND_PORT="4000"
FRONTEND_PORT="80"

# Progress tracking
TOTAL_STEPS=12
CURRENT_STEP=0

# Functions
print_header() {
    echo -e "${PURPLE}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║     Vanta X-Trade Spend Level 5 Enterprise Deployment      ║"
    echo "║           Advanced Trade Promotion Management              ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_progress() {
    CURRENT_STEP=$((CURRENT_STEP + 1))
    PERCENTAGE=$((CURRENT_STEP * 100 / TOTAL_STEPS))
    echo -e "${YELLOW}[PROGRESS] Step $CURRENT_STEP/$TOTAL_STEPS ($PERCENTAGE%) - $1${NC}"
}

print_success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}"
}

print_error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

print_info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root (use sudo)"
   exit 1
fi

print_header

# Step 1: System Update
print_progress "Updating system packages"
apt-get update -qq
apt-get upgrade -y -qq
print_success "System updated"

# Step 2: Install Dependencies
print_progress "Installing system dependencies"
apt-get install -y -qq \
    curl \
    wget \
    git \
    build-essential \
    nginx \
    redis-server \
    postgresql \
    postgresql-contrib \
    ufw \
    certbot \
    python3-certbot-nginx \
    jq \
    htop \
    iotop

print_success "Dependencies installed"

# Step 3: Install Node.js
print_progress "Installing Node.js $NODE_VERSION"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    apt-get install -y nodejs
fi

NODE_INSTALLED=$(node -v)
NPM_INSTALLED=$(npm -v)
print_success "Node.js $NODE_INSTALLED and npm $NPM_INSTALLED installed"

# Step 4: Configure PostgreSQL
print_progress "Configuring PostgreSQL database"

# Start PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE vantax_level5;
CREATE USER vantax_user WITH ENCRYPTED PASSWORD 'VantaX2025!';
GRANT ALL PRIVILEGES ON DATABASE vantax_level5 TO vantax_user;
EOF

print_success "PostgreSQL configured"

# Step 5: Configure Redis
print_progress "Configuring Redis cache"

# Configure Redis for production
cat > /etc/redis/redis.conf << EOF
bind 127.0.0.1
protected-mode yes
port 6379
tcp-backlog 511
timeout 0
tcp-keepalive 300
daemonize yes
supervised systemd
pidfile /var/run/redis/redis-server.pid
loglevel notice
logfile /var/log/redis/redis-server.log
databases 16
save 900 1
save 300 10
save 60 10000
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
dbfilename dump.rdb
dir /var/lib/redis
maxmemory 512mb
maxmemory-policy allkeys-lru
EOF

systemctl restart redis-server
systemctl enable redis-server

print_success "Redis configured"

# Step 6: Create application user
print_progress "Setting up application user"
if ! id "$APP_USER" &>/dev/null; then
    useradd -r -s /bin/false $APP_USER
    print_success "Created user: $APP_USER"
else
    print_info "User $APP_USER already exists"
fi

# Step 7: Create application directory structure
print_progress "Creating application directory structure"
mkdir -p $APP_DIR/{logs,data,uploads,backups,config}
mkdir -p /var/www/$APP_NAME

# Step 8: Download application files
print_progress "Downloading Level 5 application files"

cd $APP_DIR
wget -q https://raw.githubusercontent.com/Reshigan/enterprise-trade-marketing-platform/main/vantax-level5-backend.js
wget -q https://raw.githubusercontent.com/Reshigan/enterprise-trade-marketing-platform/main/vantax-level5-frontend.html
wget -q https://raw.githubusercontent.com/Reshigan/enterprise-trade-marketing-platform/main/vantax-level5-app.js

# Copy frontend files
cp vantax-level5-frontend.html /var/www/$APP_NAME/index.html
cp vantax-level5-app.js /var/www/$APP_NAME/

# Create package.json with all dependencies
cat > package.json << 'EOF'
{
  "name": "vantax-level5",
  "version": "5.0.0",
  "description": "Vanta X-Trade Spend Level 5 Enterprise TPM Platform",
  "main": "vantax-level5-backend.js",
  "scripts": {
    "start": "node vantax-level5-backend.js",
    "dev": "NODE_ENV=development nodemon vantax-level5-backend.js",
    "test": "jest",
    "migrate": "node scripts/migrate.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.1",
    "xlsx": "^0.18.5",
    "dotenv": "^16.3.1",
    "pg": "^8.11.3",
    "redis": "^4.6.10",
    "node-cron": "^3.0.2",
    "winston": "^3.11.0",
    "compression": "^1.7.4",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.4",
    "socket.io": "^4.6.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.7.0"
  }
}
EOF

# Install npm packages
print_info "Installing npm packages..."
npm install --production --silent

# Create environment configuration
cat > .env << EOF
NODE_ENV=production
PORT=$BACKEND_PORT
JWT_SECRET=$(openssl rand -base64 32)
APP_NAME=$APP_NAME

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vantax_level5
DB_USER=vantax_user
DB_PASSWORD=VantaX2025!

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Security
SESSION_SECRET=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -base64 32)

# Features
ENABLE_AI=true
ENABLE_REALTIME=true
ENABLE_ADVANCED_ANALYTICS=true
EOF

# Create PWA manifest
cat > /var/www/$APP_NAME/manifest.json << 'EOF'
{
  "name": "Vanta X-Trade Spend Level 5",
  "short_name": "Vanta X L5",
  "description": "Advanced Trade Promotion Management Platform",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#1e3a8a",
  "background_color": "#ffffff",
  "orientation": "any",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": ["business", "productivity"],
  "screenshots": [
    {
      "src": "/screenshot1.png",
      "sizes": "1280x720",
      "type": "image/png"
    }
  ]
}
EOF

print_success "Application files installed"

# Step 9: Create systemd service
print_progress "Configuring systemd service"

cat > /etc/systemd/system/$APP_NAME.service << EOF
[Unit]
Description=Vanta X-Trade Spend Level 5 Enterprise Backend
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=$APP_USER
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/node $APP_DIR/vantax-level5-backend.js
Restart=always
RestartSec=10
StandardOutput=append:$APP_DIR/logs/backend.log
StandardError=append:$APP_DIR/logs/backend-error.log
Environment=NODE_ENV=production
Environment=PORT=$BACKEND_PORT

# Performance tuning
LimitNOFILE=65536
LimitNPROC=4096

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$APP_DIR/data $APP_DIR/logs $APP_DIR/uploads

[Install]
WantedBy=multi-user.target
EOF

# Set permissions
chown -R $APP_USER:$APP_USER $APP_DIR
chmod -R 755 $APP_DIR
chmod 600 $APP_DIR/.env

# Enable and start service
systemctl daemon-reload
systemctl enable $APP_NAME.service
systemctl start $APP_NAME.service

print_success "Systemd service configured and started"

# Step 10: Configure Nginx with advanced features
print_progress "Configuring Nginx with advanced features"

# Create Nginx configuration
cat > /etc/nginx/sites-available/$APP_NAME << EOF
# Rate limiting
limit_req_zone \$binary_remote_addr zone=api_limit:10m rate=100r/s;
limit_req_zone \$binary_remote_addr zone=auth_limit:10m rate=5r/s;

# Upstream backend
upstream vantax_backend {
    server localhost:$BACKEND_PORT;
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;
    server_name _;
    
    root /var/www/$APP_NAME;
    index index.html;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval' wss:;" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
    
    # Enable HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Frontend routes
    location / {
        try_files \$uri \$uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API proxy with rate limiting
    location /api {
        # Apply rate limiting
        limit_req zone=api_limit burst=50 nodelay;
        
        # Special rate limit for auth endpoints
        location ~ ^/api/auth {
            limit_req zone=auth_limit burst=10 nodelay;
            proxy_pass http://vantax_backend;
        }
        
        proxy_pass http://vantax_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Timeouts for long-running requests
        proxy_connect_timeout 60s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
        
        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
    }
    
    # WebSocket support for real-time features
    location /socket.io {
        proxy_pass http://vantax_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        proxy_pass http://vantax_backend/api/health;
    }
    
    # File upload size
    client_max_body_size 100M;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json application/vnd.ms-fontobject application/x-font-ttf font/opentype image/svg+xml image/x-icon;
    
    # Brotli compression (if module available)
    brotli on;
    brotli_comp_level 6;
    brotli_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json application/vnd.ms-fontobject application/x-font-ttf font/opentype image/svg+xml image/x-icon;
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
nginx -t
systemctl reload nginx

print_success "Nginx configured with advanced features"

# Step 11: Configure firewall and security
print_progress "Configuring firewall and security"

# Configure UFW
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw reload

# Configure fail2ban for additional security
apt-get install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban

# Create backup script
cat > /usr/local/bin/vantax-backup << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/vantax-level5/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup database
pg_dump -U vantax_user vantax_level5 > $BACKUP_DIR/db_backup_$DATE.sql

# Backup application data
tar -czf $BACKUP_DIR/data_backup_$DATE.tar.gz /opt/vantax-level5/data

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x /usr/local/bin/vantax-backup

# Schedule daily backups
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/vantax-backup") | crontab -

print_success "Security and backup configured"

# Step 12: Create management scripts
print_progress "Creating management scripts"

# Status check script
cat > /usr/local/bin/vantax-status << 'EOF'
#!/bin/bash
echo -e "\033[0;35m"
echo "=== Vanta X Level 5 System Status ==="
echo -e "\033[0m"
echo ""
echo "Backend Service:"
systemctl status vantax-level5 --no-pager | grep -E "Active:|Main PID:"
echo ""
echo "Database:"
sudo -u postgres psql -c "SELECT version();" 2>/dev/null | head -n 3
echo ""
echo "Redis:"
redis-cli ping
echo ""
echo "Nginx:"
systemctl status nginx --no-pager | grep "Active:"
echo ""
echo "System Resources:"
echo "CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)% used"
echo "Memory: $(free -m | awk 'NR==2{printf "%.1f%%", $3*100/$2}')"
echo "Disk: $(df -h / | awk 'NR==2{print $5}') used"
echo ""
echo "API Health:"
curl -s http://localhost:4000/api/health | jq . 2>/dev/null || echo "API not responding"
EOF

chmod +x /usr/local/bin/vantax-status

# Performance monitoring script
cat > /usr/local/bin/vantax-monitor << 'EOF'
#!/bin/bash
echo "=== Vanta X Level 5 Performance Monitor ==="
echo "Press Ctrl+C to exit"
echo ""
watch -n 2 '
echo "=== System Metrics ==="
echo "CPU Usage: $(top -bn1 | grep "Cpu(s)" | awk "{print \$2}" | cut -d"%" -f1)%"
echo "Memory: $(free -m | awk "NR==2{printf \"Used: %sMB (%.1f%%)\", \$3, \$3*100/\$2}")"
echo "Connections: $(netstat -an | grep :4000 | wc -l) active"
echo ""
echo "=== Application Metrics ==="
curl -s http://localhost:4000/api/health 2>/dev/null | jq -r ".metrics" 2>/dev/null || echo "Metrics unavailable"
'
EOF

chmod +x /usr/local/bin/vantax-monitor

# Logs viewer
cat > /usr/local/bin/vantax-logs << 'EOF'
#!/bin/bash
echo "=== Vanta X Level 5 Logs ==="
echo "1) Backend logs"
echo "2) Error logs"
echo "3) Nginx access logs"
echo "4) Nginx error logs"
echo "5) All logs (tail -f)"
echo ""
read -p "Select option: " option

case $option in
    1) tail -f /opt/vantax-level5/logs/backend.log ;;
    2) tail -f /opt/vantax-level5/logs/backend-error.log ;;
    3) tail -f /var/log/nginx/access.log ;;
    4) tail -f /var/log/nginx/error.log ;;
    5) tail -f /opt/vantax-level5/logs/*.log /var/log/nginx/*.log ;;
    *) echo "Invalid option" ;;
esac
EOF

chmod +x /usr/local/bin/vantax-logs

print_success "Management scripts created"

# Final status check
print_info "Performing final system check..."
sleep 5

if systemctl is-active --quiet $APP_NAME; then
    print_success "Backend service is running"
else
    print_error "Backend service failed to start"
    journalctl -u $APP_NAME -n 50 --no-pager
fi

if systemctl is-active --quiet nginx; then
    print_success "Nginx is running"
else
    print_error "Nginx failed to start"
fi

if systemctl is-active --quiet postgresql; then
    print_success "PostgreSQL is running"
else
    print_error "PostgreSQL failed to start"
fi

if systemctl is-active --quiet redis; then
    print_success "Redis is running"
else
    print_error "Redis failed to start"
fi

# Get server IP
SERVER_IP=$(curl -s http://checkip.amazonaws.com 2>/dev/null || hostname -I | awk '{print $1}')

# Print completion message
echo ""
echo -e "${PURPLE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║     Level 5 Deployment Completed Successfully! 🚀          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo -e "${BLUE}Access your Vanta X Level 5 Platform:${NC}"
echo -e "  Frontend URL: ${GREEN}http://$SERVER_IP${NC}"
echo -e "  API URL: ${GREEN}http://$SERVER_IP/api${NC}"
echo ""
echo -e "${BLUE}Default Login Credentials:${NC}"
echo -e "  Admin: ${GREEN}john.smith@diplomat.co.za / Demo123!${NC}"
echo -e "  KAM: ${GREEN}michael.brown@diplomat.co.za / Demo123!${NC}"
echo -e "  TMM: ${GREEN}emma.martinez@diplomat.co.za / Demo123!${NC}"
echo ""
echo -e "${BLUE}Management Commands:${NC}"
echo -e "  System status: ${GREEN}vantax-status${NC}"
echo -e "  Performance monitor: ${GREEN}vantax-monitor${NC}"
echo -e "  View logs: ${GREEN}vantax-logs${NC}"
echo -e "  Backup data: ${GREEN}vantax-backup${NC}"
echo ""
echo -e "${BLUE}Level 5 Features:${NC}"
echo -e "  ✅ Activity Planning Grid"
echo -e "  ✅ Advanced Pricing Engine"
echo -e "  ✅ Scenario Planning"
echo -e "  ✅ Settlement Engine"
echo -e "  ✅ 8 AI/ML Models"
echo -e "  ✅ Real-time Insights"
echo -e "  ✅ NLP Chatbot"
echo -e "  ✅ Multi-company Support"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Configure DNS to point to this server"
echo "2. Set up SSL: sudo certbot --nginx"
echo "3. Configure Microsoft 365 SSO in Azure AD"
echo "4. Connect to your SAP systems"
echo "5. Import your master data"
echo ""
echo -e "${PURPLE}Thank you for choosing Vanta X Level 5!${NC}"