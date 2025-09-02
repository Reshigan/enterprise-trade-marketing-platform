#!/bin/bash

# Fix PM2 Startup Issue for Vanta X Enterprise Platform
# This script fixes the PM2 daemon startup issue on Ubuntu 24.04

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVICE_USER="vantax"
INSTALL_DIR="/opt/vantax-enterprise"
BACKEND_PORT=4000

echo -e "${BLUE}[INFO]${NC} Fixing PM2 startup configuration..."

# Stop any existing PM2 processes
echo -e "${BLUE}[INFO]${NC} Stopping existing PM2 processes..."
sudo -u $SERVICE_USER bash -c "cd $INSTALL_DIR && pm2 kill" || true
pm2 kill || true

# Create PM2 ecosystem file if it doesn't exist
if [ ! -f "$INSTALL_DIR/ecosystem.config.js" ]; then
    echo -e "${BLUE}[INFO]${NC} Creating PM2 ecosystem file..."
    cat > $INSTALL_DIR/ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'vantax-enterprise-backend',
    script: 'enterprise-backend.js',
    cwd: '$INSTALL_DIR',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: $BACKEND_PORT
    },
    log_file: '/var/log/vantax-enterprise/pm2.log',
    out_file: '/var/log/vantax-enterprise/backend-out.log',
    error_file: '/var/log/vantax-enterprise/backend-error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    watch: false,
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
EOF
    chown $SERVICE_USER:$SERVICE_USER $INSTALL_DIR/ecosystem.config.js
fi

# Method 1: Start PM2 as the service user directly
echo -e "${BLUE}[INFO]${NC} Starting PM2 as service user..."
sudo -u $SERVICE_USER bash -c "cd $INSTALL_DIR && PM2_HOME=/opt/vantax-enterprise/.pm2 pm2 start ecosystem.config.js"

# Save PM2 process list
echo -e "${BLUE}[INFO]${NC} Saving PM2 process list..."
sudo -u $SERVICE_USER bash -c "cd $INSTALL_DIR && PM2_HOME=/opt/vantax-enterprise/.pm2 pm2 save"

# Create systemd service for PM2
echo -e "${BLUE}[INFO]${NC} Creating systemd service..."
cat > /etc/systemd/system/pm2-vantax.service << EOF
[Unit]
Description=PM2 process manager for Vanta X Enterprise
Documentation=https://pm2.keymetrics.io/
After=network.target

[Service]
Type=forking
User=$SERVICE_USER
LimitNOFILE=infinity
LimitNPROC=infinity
LimitCORE=infinity
Environment="PM2_HOME=/opt/vantax-enterprise/.pm2"
Environment="PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin:/usr/local/bin:/usr/bin"
Environment="NODE_ENV=production"

PIDFile=/opt/vantax-enterprise/.pm2/pm2.pid
Restart=on-failure

ExecStart=/usr/bin/pm2 resurrect
ExecReload=/usr/bin/pm2 reload all
ExecStop=/usr/bin/pm2 kill

StandardOutput=journal
StandardError=journal
SyslogIdentifier=pm2-vantax

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and enable service
echo -e "${BLUE}[INFO]${NC} Enabling PM2 service..."
systemctl daemon-reload
systemctl enable pm2-vantax
systemctl start pm2-vantax

# Wait for service to start
sleep 5

# Check status
echo -e "${BLUE}[INFO]${NC} Checking PM2 status..."
sudo -u $SERVICE_USER bash -c "cd $INSTALL_DIR && PM2_HOME=/opt/vantax-enterprise/.pm2 pm2 status"

# Test backend health
echo -e "${BLUE}[INFO]${NC} Testing backend health..."
if curl -f -s http://localhost:$BACKEND_PORT/health > /dev/null; then
    echo -e "${GREEN}[SUCCESS]${NC} Backend is running and healthy!"
    
    # Show health check response
    echo -e "${BLUE}[INFO]${NC} Health check response:"
    curl -s http://localhost:$BACKEND_PORT/health | jq . 2>/dev/null || curl -s http://localhost:$BACKEND_PORT/health
else
    echo -e "${RED}[ERROR]${NC} Backend health check failed"
    echo -e "${YELLOW}[WARNING]${NC} Checking logs..."
    sudo -u $SERVICE_USER bash -c "cd $INSTALL_DIR && PM2_HOME=/opt/vantax-enterprise/.pm2 pm2 logs --lines 20"
fi

echo ""
echo -e "${GREEN}✅ PM2 startup issue fixed!${NC}"
echo ""
echo -e "${BLUE}Management commands:${NC}"
echo -e "  View status:  ${YELLOW}sudo -u vantax bash -c 'cd /opt/vantax-enterprise && PM2_HOME=/opt/vantax-enterprise/.pm2 pm2 status'${NC}"
echo -e "  View logs:    ${YELLOW}sudo -u vantax bash -c 'cd /opt/vantax-enterprise && PM2_HOME=/opt/vantax-enterprise/.pm2 pm2 logs'${NC}"
echo -e "  Restart:      ${YELLOW}sudo -u vantax bash -c 'cd /opt/vantax-enterprise && PM2_HOME=/opt/vantax-enterprise/.pm2 pm2 restart all'${NC}"
echo -e "  Stop:         ${YELLOW}sudo -u vantax bash -c 'cd /opt/vantax-enterprise && PM2_HOME=/opt/vantax-enterprise/.pm2 pm2 stop all'${NC}"
echo ""
echo -e "${BLUE}Or use the management script:${NC}"
echo -e "  ${YELLOW}vantax-enterprise status${NC}"
echo -e "  ${YELLOW}vantax-enterprise restart${NC}"
echo ""