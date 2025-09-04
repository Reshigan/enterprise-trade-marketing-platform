#!/bin/bash

# Vanta X Server Cleanup Script
# Removes all PM2 and old demo installations

echo "=================================================="
echo "Vanta X Server Cleanup Script"
echo "=================================================="
echo ""

# Function to print colored output
print_status() {
    case $1 in
        "info") echo -e "\033[36m[INFO]\033[0m $2" ;;
        "success") echo -e "\033[32m[SUCCESS]\033[0m $2" ;;
        "error") echo -e "\033[31m[ERROR]\033[0m $2" ;;
        "warning") echo -e "\033[33m[WARNING]\033[0m $2" ;;
    esac
}

# Stop all PM2 processes
print_status "info" "Stopping PM2 processes..."
sudo pm2 kill 2>/dev/null || true
sudo systemctl stop pm2-vantax-demo 2>/dev/null || true
sudo systemctl stop pm2-root 2>/dev/null || true

# Disable PM2 services
print_status "info" "Disabling PM2 services..."
sudo systemctl disable pm2-vantax-demo 2>/dev/null || true
sudo systemctl disable pm2-root 2>/dev/null || true

# Remove PM2 service files
print_status "info" "Removing PM2 service files..."
sudo rm -f /etc/systemd/system/pm2-*.service
sudo rm -f /lib/systemd/system/pm2-*.service

# Stop any Node.js processes on ports 4000 and 3000
print_status "info" "Stopping Node.js processes..."
sudo lsof -ti:4000 | xargs sudo kill -9 2>/dev/null || true
sudo lsof -ti:3000 | xargs sudo kill -9 2>/dev/null || true

# Remove old application files
print_status "info" "Removing old application files..."
sudo rm -rf /opt/vantax-demo
sudo rm -rf /var/www/vantax-demo
sudo rm -rf ~/vantax-demo-*
sudo rm -rf ~/deploy-vantax-demo.sh
sudo rm -rf ~/test-vantax-demo.sh

# Remove PM2 logs
print_status "info" "Cleaning PM2 logs..."
sudo rm -rf ~/.pm2/logs/*
sudo rm -rf /root/.pm2/logs/*

# Remove nginx sites
print_status "info" "Cleaning nginx configuration..."
sudo rm -f /etc/nginx/sites-enabled/vantax-demo
sudo rm -f /etc/nginx/sites-available/vantax-demo

# Reload systemd and nginx
print_status "info" "Reloading services..."
sudo systemctl daemon-reload
sudo nginx -t && sudo systemctl reload nginx

# Clean npm cache
print_status "info" "Cleaning npm cache..."
npm cache clean --force 2>/dev/null || true

print_status "success" "Server cleanup completed!"
echo ""
echo "The server has been cleaned of all PM2 and old Vanta X installations."
echo "You can now install the new version."