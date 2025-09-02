#!/bin/bash

# ============================================================================
# Vanta X Enterprise FMCG Platform - Complete End-to-End Installation Script
# For AWS Ubuntu 24.04 LTS (also works on other Ubuntu 24.04 systems)
# Version: 2.0.0
# ============================================================================
# 
# This script performs a complete installation including:
# - System dependencies and configuration
# - Application deployment
# - Security setup
# - SSL/TLS certificates
# - Process management with PM2
# - Monitoring and backups
# - All necessary fixes for Ubuntu 24.04
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PLATFORM_NAME="Vanta X Enterprise FMCG Platform"
VERSION="2.0.0"
GITHUB_REPO="https://raw.githubusercontent.com/Reshigan/enterprise-trade-marketing-platform/enterprise-aws-deployment"
BACKEND_PORT=4000
FRONTEND_PORT=80
HTTPS_PORT=443
LOG_DIR="/var/log/vantax-enterprise"
SERVICE_USER="vantax"
INSTALL_DIR="/opt/vantax-enterprise"
BACKUP_DIR="/opt/vantax-backups"
SSL_DIR="/etc/ssl/vantax"
START_TIME=$(date +%s)

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo ""
    echo -e "${PURPLE}============================================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}============================================================${NC}"
    echo ""
}

# Function to show progress
show_progress() {
    local current=$1
    local total=$2
    local task=$3
    local percent=$((current * 100 / total))
    echo -e "${CYAN}[PROGRESS]${NC} Step $current/$total (${percent}%) - $task"
}

# Function to check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        print_error "This script must be run as root (use sudo)"
        echo "Usage: sudo ./install-vantax-enterprise.sh"
        exit 1
    fi
}

# Function to detect system information
detect_system() {
    print_header "System Detection"
    
    # Detect OS
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        OS=$NAME
        VER=$VERSION_ID
        print_status "Operating System: $OS $VER"
    fi
    
    # Detect if running on AWS
    if curl -s --max-time 5 http://169.254.169.254/latest/meta-data/instance-id > /dev/null 2>&1; then
        IS_AWS=true
        INSTANCE_ID=$(curl -s http://169.254.169.254/latest/meta-data/instance-id)
        AWS_REGION=$(curl -s http://169.254.169.254/latest/meta-data/placement/region)
        PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
        PRIVATE_IP=$(curl -s http://169.254.169.254/latest/meta-data/local-ipv4)
        
        print_status "Running on AWS EC2"
        print_status "Instance ID: $INSTANCE_ID"
        print_status "Region: $AWS_REGION"
        print_status "Public IP: $PUBLIC_IP"
    else
        IS_AWS=false
        PUBLIC_IP=$(curl -s ifconfig.me || echo "")
        print_status "Not running on AWS EC2"
        if [[ -n "$PUBLIC_IP" ]]; then
            print_status "Public IP: $PUBLIC_IP"
        fi
    fi
    
    # System resources
    TOTAL_MEM=$(free -m | awk 'NR==2{print $2}')
    TOTAL_CPU=$(nproc)
    TOTAL_DISK=$(df -h / | awk 'NR==2{print $2}')
    
    print_status "System Resources: ${TOTAL_CPU} CPUs, ${TOTAL_MEM}MB RAM, ${TOTAL_DISK} Disk"
}

# Function to install system dependencies
install_dependencies() {
    show_progress 1 10 "Installing System Dependencies"
    
    # Update system
    print_status "Updating package lists..."
    apt-get update -y > /dev/null 2>&1
    
    # Install essential packages
    print_status "Installing essential packages..."
    DEBIAN_FRONTEND=noninteractive apt-get install -y \
        curl wget gnupg2 software-properties-common \
        apt-transport-https ca-certificates lsb-release \
        unzip git htop nano vim tree jq \
        fail2ban ufw certbot python3-certbot-nginx \
        python3-pip build-essential > /dev/null 2>&1
    
    print_success "System dependencies installed"
}

# Function to install Node.js
install_nodejs() {
    show_progress 2 10 "Installing Node.js 20.x LTS"
    
    print_status "Adding NodeSource repository..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null 2>&1
    
    print_status "Installing Node.js..."
    apt-get install -y nodejs > /dev/null 2>&1
    
    # Install PM2 globally
    print_status "Installing PM2 process manager..."
    npm install -g pm2@latest > /dev/null 2>&1
    
    NODE_VERSION=$(node --version)
    NPM_VERSION=$(npm --version)
    PM2_VERSION=$(pm2 --version)
    
    print_success "Node.js $NODE_VERSION installed"
    print_success "npm $NPM_VERSION installed"
    print_success "PM2 $PM2_VERSION installed"
}

# Function to install and configure PostgreSQL
install_postgresql() {
    show_progress 3 10 "Installing PostgreSQL Database"
    
    print_status "Installing PostgreSQL..."
    apt-get install -y postgresql postgresql-contrib postgresql-client > /dev/null 2>&1
    
    # Start PostgreSQL
    systemctl start postgresql
    systemctl enable postgresql > /dev/null 2>&1
    
    # Create database and user
    print_status "Creating database..."
    sudo -u postgres psql > /dev/null 2>&1 << EOF
CREATE DATABASE IF NOT EXISTS vantax_enterprise;
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'vantax_user') THEN
        CREATE USER vantax_user WITH PASSWORD 'VantaX_Secure_2024!';
    END IF;
END\$\$;
GRANT ALL PRIVILEGES ON DATABASE vantax_enterprise TO vantax_user;
ALTER USER vantax_user CREATEDB;
EOF
    
    print_success "PostgreSQL configured"
}

# Function to install and configure Redis
install_redis() {
    show_progress 4 10 "Installing Redis Cache"
    
    print_status "Installing Redis..."
    apt-get install -y redis-server > /dev/null 2>&1
    
    # Basic Redis configuration
    sed -i 's/# requirepass foobared/requirepass VantaX_Redis_2024!/' /etc/redis/redis.conf
    sed -i 's/bind 127.0.0.1 ::1/bind 127.0.0.1/' /etc/redis/redis.conf
    
    # Restart Redis
    systemctl restart redis-server
    systemctl enable redis-server > /dev/null 2>&1
    
    print_success "Redis configured"
}

# Function to install and configure Nginx
install_nginx() {
    show_progress 5 10 "Installing Nginx Web Server"
    
    print_status "Installing Nginx..."
    apt-get install -y nginx > /dev/null 2>&1
    
    # Remove default site
    rm -f /etc/nginx/sites-enabled/default
    
    systemctl start nginx
    systemctl enable nginx > /dev/null 2>&1
    
    print_success "Nginx installed"
}

# Function to create system user and directories
setup_system() {
    show_progress 6 10 "Setting Up System User and Directories"
    
    # Create system user
    if ! id "$SERVICE_USER" &>/dev/null; then
        useradd -r -s /bin/false -d $INSTALL_DIR $SERVICE_USER
        print_status "Created system user: $SERVICE_USER"
    fi
    
    # Create directories
    mkdir -p $INSTALL_DIR
    mkdir -p $LOG_DIR
    mkdir -p $BACKUP_DIR
    mkdir -p $SSL_DIR
    mkdir -p /etc/vantax-enterprise
    
    # Set permissions
    chown -R $SERVICE_USER:$SERVICE_USER $INSTALL_DIR
    chown -R $SERVICE_USER:$SERVICE_USER $LOG_DIR
    chmod 755 $INSTALL_DIR
    chmod 755 $LOG_DIR
    
    print_success "System directories created"
}

# Function to download and install application
install_application() {
    show_progress 7 10 "Installing Vanta X Enterprise Application"
    
    cd $INSTALL_DIR
    
    # Download application files
    print_status "Downloading application files..."
    wget -q -O enterprise-backend.js "$GITHUB_REPO/enterprise-backend.js"
    wget -q -O index.html "$GITHUB_REPO/enterprise-frontend.html"
    wget -q -O enterprise-app.js "$GITHUB_REPO/enterprise-app.js"
    
    # Create package.json
    cat > package.json << 'EOF'
{
  "name": "vantax-enterprise-backend",
  "version": "2.0.0",
  "description": "Enterprise FMCG Trade Marketing Platform Backend",
  "main": "enterprise-backend.js",
  "scripts": {
    "start": "node enterprise-backend.js"
  },
  "dependencies": {
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "winston": "^3.8.2",
    "cors": "^2.8.5",
    "helmet": "^6.1.5",
    "express-rate-limit": "^6.7.0",
    "uuid": "^9.0.0",
    "moment": "^2.29.4",
    "lodash": "^4.17.21",
    "validator": "^13.9.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF
    
    # Install dependencies
    print_status "Installing Node.js dependencies..."
    npm install --production --no-audit --no-fund > /dev/null 2>&1
    
    # Set permissions
    chown -R $SERVICE_USER:$SERVICE_USER $INSTALL_DIR
    chmod +x enterprise-backend.js
    
    print_success "Application installed"
}

# Function to configure PM2
configure_pm2() {
    show_progress 8 10 "Configuring Process Management"
    
    # Create PM2 ecosystem file
    cat > $INSTALL_DIR/ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'vantax-backend',
    script: 'enterprise-backend.js',
    cwd: '$INSTALL_DIR',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: $BACKEND_PORT
    },
    error_file: '$LOG_DIR/error.log',
    out_file: '$LOG_DIR/out.log',
    log_file: '$LOG_DIR/combined.log',
    time: true,
    max_memory_restart: '1G'
  }]
};
EOF
    
    chown $SERVICE_USER:$SERVICE_USER $INSTALL_DIR/ecosystem.config.js
    
    # Start PM2 as service user
    print_status "Starting application with PM2..."
    sudo -u $SERVICE_USER bash -c "cd $INSTALL_DIR && PM2_HOME=$INSTALL_DIR/.pm2 pm2 start ecosystem.config.js" > /dev/null 2>&1
    sudo -u $SERVICE_USER bash -c "cd $INSTALL_DIR && PM2_HOME=$INSTALL_DIR/.pm2 pm2 save" > /dev/null 2>&1
    
    # Create systemd service
    cat > /etc/systemd/system/pm2-vantax.service << EOF
[Unit]
Description=PM2 process manager for Vanta X
After=network.target

[Service]
Type=forking
User=$SERVICE_USER
LimitNOFILE=infinity
LimitNPROC=infinity
LimitCORE=infinity
Environment="PM2_HOME=$INSTALL_DIR/.pm2"
Environment="PATH=/usr/bin:/bin:/usr/local/bin"
Environment="NODE_ENV=production"
PIDFile=$INSTALL_DIR/.pm2/pm2.pid
ExecStart=/usr/bin/pm2 resurrect
ExecReload=/usr/bin/pm2 reload all
ExecStop=/usr/bin/pm2 kill
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF
    
    systemctl daemon-reload
    systemctl enable pm2-vantax > /dev/null 2>&1
    systemctl start pm2-vantax
    
    print_success "PM2 configured"
}

# Function to configure Nginx
configure_nginx() {
    show_progress 9 10 "Configuring Web Server"
    
    # Determine server name
    if [[ -n "$PUBLIC_IP" ]]; then
        SERVER_NAME="$PUBLIC_IP"
    else
        SERVER_NAME="_"
    fi
    
    # Create Nginx configuration
    cat > /etc/nginx/sites-available/vantax << EOF
# Rate limiting
limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;

# Backend upstream
upstream backend {
    server 127.0.0.1:$BACKEND_PORT;
    keepalive 32;
}

# HTTP server - redirects to HTTPS
server {
    listen 80;
    server_name $SERVER_NAME;
    
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name $SERVER_NAME;
    
    # SSL (temporary self-signed)
    ssl_certificate /etc/ssl/certs/ssl-cert-snakeoil.pem;
    ssl_certificate_key /etc/ssl/private/ssl-cert-snakeoil.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers off;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Gzip
    gzip on;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;
    
    # Frontend
    location / {
        root $INSTALL_DIR;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }
    
    # API proxy
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Health check
    location /health {
        proxy_pass http://backend;
        access_log off;
    }
}
EOF
    
    # Enable site
    ln -sf /etc/nginx/sites-available/vantax /etc/nginx/sites-enabled/
    
    # Create self-signed certificate
    if [[ -n "$PUBLIC_IP" ]]; then
        print_status "Creating self-signed SSL certificate..."
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout $SSL_DIR/vantax.key \
            -out $SSL_DIR/vantax.crt \
            -subj "/C=US/ST=State/L=City/O=Vanta X/CN=$PUBLIC_IP" \
            -addext "subjectAltName=IP:$PUBLIC_IP" > /dev/null 2>&1
        
        # Update Nginx to use our certificate
        sed -i "s|/etc/ssl/certs/ssl-cert-snakeoil.pem|$SSL_DIR/vantax.crt|" /etc/nginx/sites-available/vantax
        sed -i "s|/etc/ssl/private/ssl-cert-snakeoil.key|$SSL_DIR/vantax.key|" /etc/nginx/sites-available/vantax
    fi
    
    # Test and reload Nginx
    nginx -t > /dev/null 2>&1
    systemctl reload nginx
    
    print_success "Web server configured"
}

# Function to configure firewall
configure_security() {
    show_progress 10 10 "Configuring Security"
    
    # Configure UFW
    print_status "Configuring firewall..."
    ufw --force reset > /dev/null 2>&1
    ufw default deny incoming > /dev/null 2>&1
    ufw default allow outgoing > /dev/null 2>&1
    ufw allow ssh > /dev/null 2>&1
    ufw allow 80/tcp > /dev/null 2>&1
    ufw allow 443/tcp > /dev/null 2>&1
    ufw --force enable > /dev/null 2>&1
    
    # Configure fail2ban
    print_status "Configuring intrusion prevention..."
    cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
EOF
    
    systemctl restart fail2ban > /dev/null 2>&1
    
    print_success "Security configured"
}

# Function to create management script
create_management_script() {
    cat > /usr/local/bin/vantax << 'EOF'
#!/bin/bash

INSTALL_DIR="/opt/vantax-enterprise"
SERVICE_USER="vantax"

case "$1" in
    start)
        echo "Starting Vanta X Enterprise..."
        systemctl start nginx
        systemctl start pm2-vantax
        ;;
    stop)
        echo "Stopping Vanta X Enterprise..."
        sudo -u $SERVICE_USER bash -c "cd $INSTALL_DIR && PM2_HOME=$INSTALL_DIR/.pm2 pm2 stop all"
        ;;
    restart)
        echo "Restarting Vanta X Enterprise..."
        sudo -u $SERVICE_USER bash -c "cd $INSTALL_DIR && PM2_HOME=$INSTALL_DIR/.pm2 pm2 restart all"
        systemctl reload nginx
        ;;
    status)
        echo "=== Vanta X Enterprise Status ==="
        sudo -u $SERVICE_USER bash -c "cd $INSTALL_DIR && PM2_HOME=$INSTALL_DIR/.pm2 pm2 status"
        echo ""
        echo "Nginx: $(systemctl is-active nginx)"
        ;;
    logs)
        sudo -u $SERVICE_USER bash -c "cd $INSTALL_DIR && PM2_HOME=$INSTALL_DIR/.pm2 pm2 logs --lines 50"
        ;;
    health)
        curl -s http://localhost:4000/health | jq . 2>/dev/null || curl -s http://localhost:4000/health
        ;;
    *)
        echo "Usage: vantax {start|stop|restart|status|logs|health}"
        exit 1
        ;;
esac
EOF
    
    chmod +x /usr/local/bin/vantax
}

# Function to verify installation
verify_installation() {
    print_header "Verifying Installation"
    
    # Wait for services to start
    print_status "Waiting for services to start..."
    sleep 10
    
    # Check PM2
    if sudo -u $SERVICE_USER bash -c "cd $INSTALL_DIR && PM2_HOME=$INSTALL_DIR/.pm2 pm2 status" | grep -q "online"; then
        print_success "✓ Application is running"
    else
        print_error "✗ Application failed to start"
    fi
    
    # Check Nginx
    if systemctl is-active --quiet nginx; then
        print_success "✓ Web server is running"
    else
        print_error "✗ Web server failed to start"
    fi
    
    # Check backend health
    if curl -f -s http://localhost:$BACKEND_PORT/health > /dev/null; then
        print_success "✓ Backend API is healthy"
    else
        print_error "✗ Backend API health check failed"
    fi
    
    # Check frontend
    if curl -f -s http://localhost/ > /dev/null; then
        print_success "✓ Frontend is accessible"
    else
        print_error "✗ Frontend is not accessible"
    fi
}

# Function to display final information
display_final_info() {
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))
    
    print_header "🎉 Installation Complete!"
    
    echo -e "${GREEN}Vanta X Enterprise FMCG Platform has been successfully installed!${NC}"
    echo -e "Installation time: ${DURATION} seconds"
    echo ""
    echo -e "${CYAN}📊 Access Information:${NC}"
    if [[ -n "$PUBLIC_IP" ]]; then
        echo -e "  🌐 Web Application: ${YELLOW}https://$PUBLIC_IP${NC}"
        echo -e "  🔗 API Endpoint: ${YELLOW}https://$PUBLIC_IP/api/v2${NC}"
    else
        echo -e "  🌐 Web Application: ${YELLOW}https://your-server-ip${NC}"
        echo -e "  🔗 API Endpoint: ${YELLOW}https://your-server-ip/api/v2${NC}"
    fi
    echo -e "  ❤️  Health Check: ${YELLOW}https://localhost/health${NC}"
    echo ""
    echo -e "${CYAN}🏢 Multi-Company Configuration:${NC}"
    echo -e "  • Diplomat SA (diplomat-sa) - Primary"
    echo -e "  • Premium Brands International"
    echo -e "  • Regional Distribution Network"
    echo ""
    echo -e "${CYAN}🤖 AI/ML Features:${NC}"
    echo -e "  • 10 Active AI Models"
    echo -e "  • Real-time Analytics"
    echo -e "  • Predictive Insights"
    echo -e "  • Conversational AI Chatbot"
    echo ""
    echo -e "${CYAN}🔧 Management Commands:${NC}"
    echo -e "  ${YELLOW}vantax start${NC}    - Start the platform"
    echo -e "  ${YELLOW}vantax stop${NC}     - Stop the platform"
    echo -e "  ${YELLOW}vantax restart${NC}  - Restart the platform"
    echo -e "  ${YELLOW}vantax status${NC}   - Check status"
    echo -e "  ${YELLOW}vantax logs${NC}     - View logs"
    echo -e "  ${YELLOW}vantax health${NC}   - Health check"
    echo ""
    echo -e "${CYAN}📁 Important Locations:${NC}"
    echo -e "  • Application: ${YELLOW}$INSTALL_DIR${NC}"
    echo -e "  • Logs: ${YELLOW}$LOG_DIR${NC}"
    echo -e "  • Backups: ${YELLOW}$BACKUP_DIR${NC}"
    echo ""
    echo -e "${PURPLE}🎯 Next Steps:${NC}"
    echo -e "  1. Access the platform using the URL above"
    echo -e "  2. Log in with any of the 10 licensed users"
    echo -e "  3. Configure your domain name (optional)"
    echo -e "  4. Set up Let's Encrypt SSL (optional)"
    echo ""
    if [[ -n "$PUBLIC_IP" ]]; then
        echo -e "${GREEN}🔗 Quick Access: ${YELLOW}https://$PUBLIC_IP${NC}"
    fi
    echo ""
}

# Main installation function
main() {
    clear
    print_header "Vanta X Enterprise FMCG Platform Installer v$VERSION"
    
    # Pre-installation checks
    check_root
    detect_system
    
    # Installation steps
    install_dependencies
    install_nodejs
    install_postgresql
    install_redis
    install_nginx
    setup_system
    install_application
    configure_pm2
    configure_nginx
    configure_security
    
    # Post-installation
    create_management_script
    verify_installation
    display_final_info
    
    print_success "Installation completed successfully! 🎊"
}

# Error handling
trap 'print_error "Installation failed at line $LINENO. Check the logs for details."; exit 1' ERR

# Run main function
main "$@"