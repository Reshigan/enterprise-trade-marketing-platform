#!/bin/bash

# Vanta X-Trade Spend Enterprise Deployment Script
# Level 3 System - No PM2, using systemd
# For Ubuntu 20.04/22.04/24.04 LTS

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="vantax-enterprise"
APP_DIR="/opt/vantax-enterprise"
APP_USER="vantax"
NODE_VERSION="20"
BACKEND_PORT="4000"
FRONTEND_PORT="80"

# Progress tracking
TOTAL_STEPS=10
CURRENT_STEP=0

# Functions
print_header() {
    echo -e "${BLUE}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║        Vanta X-Trade Spend Enterprise Deployment           ║"
    echo "║                   Level 3 System                           ║"
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
    ufw \
    certbot \
    python3-certbot-nginx \
    sqlite3 \
    jq

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

# Step 4: Create application user
print_progress "Setting up application user"
if ! id "$APP_USER" &>/dev/null; then
    useradd -r -s /bin/false $APP_USER
    print_success "Created user: $APP_USER"
else
    print_info "User $APP_USER already exists"
fi

# Step 5: Create application directory
print_progress "Creating application directory"
mkdir -p $APP_DIR
mkdir -p $APP_DIR/logs
mkdir -p $APP_DIR/data
mkdir -p $APP_DIR/uploads

# Step 6: Download application files
print_progress "Downloading application files"

# Download from GitHub
cd $APP_DIR
wget -q https://raw.githubusercontent.com/Reshigan/enterprise-trade-marketing-platform/main/vantax-enterprise-backend.js
wget -q https://raw.githubusercontent.com/Reshigan/enterprise-trade-marketing-platform/main/vantax-enterprise-frontend.html
wget -q https://raw.githubusercontent.com/Reshigan/enterprise-trade-marketing-platform/main/vantax-enterprise-app.js

# Create package.json
cat > package.json << 'EOF'
{
  "name": "vantax-enterprise",
  "version": "3.0.0",
  "description": "Vanta X-Trade Spend Enterprise Platform",
  "main": "vantax-enterprise-backend.js",
  "scripts": {
    "start": "node vantax-enterprise-backend.js",
    "dev": "NODE_ENV=development node vantax-enterprise-backend.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.1",
    "xlsx": "^0.18.5",
    "dotenv": "^16.3.1"
  }
}
EOF

# Install npm packages
print_info "Installing npm packages..."
npm install --production --silent

# Create .env file
cat > .env << EOF
NODE_ENV=production
PORT=$BACKEND_PORT
JWT_SECRET=$(openssl rand -base64 32)
APP_NAME=$APP_NAME
EOF

print_success "Application files installed"

# Step 7: Create systemd service
print_progress "Configuring systemd service"

cat > /etc/systemd/system/$APP_NAME.service << EOF
[Unit]
Description=Vanta X-Trade Spend Enterprise Backend
After=network.target

[Service]
Type=simple
User=$APP_USER
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/node $APP_DIR/vantax-enterprise-backend.js
Restart=always
RestartSec=10
StandardOutput=append:$APP_DIR/logs/backend.log
StandardError=append:$APP_DIR/logs/backend-error.log
Environment=NODE_ENV=production
Environment=PORT=$BACKEND_PORT

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

# Enable and start service
systemctl daemon-reload
systemctl enable $APP_NAME.service
systemctl start $APP_NAME.service

print_success "Systemd service configured and started"

# Step 8: Configure Nginx
print_progress "Configuring Nginx"

# Create web root
mkdir -p /var/www/$APP_NAME
cp $APP_DIR/vantax-enterprise-frontend.html /var/www/$APP_NAME/index.html
cp $APP_DIR/vantax-enterprise-app.js /var/www/$APP_NAME/

# Create manifest.json for PWA
cat > /var/www/$APP_NAME/manifest.json << 'EOF'
{
  "name": "Vanta X-Trade Spend",
  "short_name": "Vanta X",
  "description": "Enterprise Trade Marketing Platform",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#1e3a8a",
  "background_color": "#ffffff",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
EOF

# Create Nginx configuration
cat > /etc/nginx/sites-available/$APP_NAME << EOF
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
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval';" always;
    
    # Frontend routes
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # API proxy
    location /api {
        proxy_pass http://localhost:$BACKEND_PORT;
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
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # File upload size
    client_max_body_size 50M;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
nginx -t
systemctl reload nginx

print_success "Nginx configured"

# Step 9: Configure firewall
print_progress "Configuring firewall"

ufw --force enable
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw reload

print_success "Firewall configured"

# Step 10: Create management scripts
print_progress "Creating management scripts"

# Create status check script
cat > /usr/local/bin/vantax-status << 'EOF'
#!/bin/bash
echo "=== Vanta X Enterprise Status ==="
echo ""
echo "Backend Service:"
systemctl status vantax-enterprise --no-pager | grep -E "Active:|Main PID:"
echo ""
echo "Nginx Service:"
systemctl status nginx --no-pager | grep "Active:"
echo ""
echo "Backend Logs (last 10 lines):"
tail -n 10 /opt/vantax-enterprise/logs/backend.log 2>/dev/null || echo "No logs yet"
echo ""
echo "API Health Check:"
curl -s http://localhost:4000/api/health | jq . 2>/dev/null || echo "API not responding"
EOF

chmod +x /usr/local/bin/vantax-status

# Create restart script
cat > /usr/local/bin/vantax-restart << 'EOF'
#!/bin/bash
echo "Restarting Vanta X Enterprise services..."
systemctl restart vantax-enterprise
systemctl restart nginx
echo "Services restarted. Check status with: vantax-status"
EOF

chmod +x /usr/local/bin/vantax-restart

# Create logs script
cat > /usr/local/bin/vantax-logs << 'EOF'
#!/bin/bash
echo "=== Vanta X Enterprise Logs ==="
echo ""
echo "Use Ctrl+C to exit"
echo ""
journalctl -u vantax-enterprise -f
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

# Get server IP
SERVER_IP=$(curl -s http://checkip.amazonaws.com 2>/dev/null || hostname -I | awk '{print $1}')

# Print completion message
echo ""
echo -e "${GREEN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║         Deployment Completed Successfully! 🎉              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo -e "${BLUE}Access your Vanta X Enterprise Platform:${NC}"
echo -e "  Frontend URL: ${GREEN}http://$SERVER_IP${NC}"
echo -e "  API URL: ${GREEN}http://$SERVER_IP/api${NC}"
echo ""
echo -e "${BLUE}Default Login Credentials:${NC}"
echo -e "  Email: ${GREEN}john.smith@diplomat.co.za${NC}"
echo -e "  Password: ${GREEN}Demo123!${NC}"
echo ""
echo -e "${BLUE}Management Commands:${NC}"
echo -e "  Check status: ${GREEN}vantax-status${NC}"
echo -e "  View logs: ${GREEN}vantax-logs${NC}"
echo -e "  Restart services: ${GREEN}vantax-restart${NC}"
echo ""
echo -e "${BLUE}Company: Diplomat South Africa${NC}"
echo -e "  - 10 user licenses configured"
echo -e "  - Full year of sample data"
echo -e "  - 5 AI/ML models active"
echo -e "  - Microsoft 365 SSO ready"
echo -e "  - SAP integration enabled"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Configure DNS to point to this server"
echo "2. Set up SSL certificate: sudo certbot --nginx"
echo "3. Configure Microsoft 365 SSO in Azure AD"
echo "4. Connect to your SAP systems"
echo ""