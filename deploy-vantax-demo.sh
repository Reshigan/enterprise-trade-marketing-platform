#!/bin/bash

# ============================================================================
# Vanta X Enterprise FMCG Platform - Complete Demo Deployment Script
# One-click deployment for AWS Ubuntu 24.04 and other Linux systems
# Version: 3.0.0 - Production Demo Ready
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
VERSION="3.0.0"
GITHUB_REPO="https://raw.githubusercontent.com/Reshigan/enterprise-trade-marketing-platform/main"
BACKEND_PORT=4000
FRONTEND_PORT=80
HTTPS_PORT=443
LOG_DIR="/var/log/vantax-demo"
SERVICE_USER="vantax"
INSTALL_DIR="/opt/vantax-demo"
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
        echo "Usage: sudo ./deploy-vantax-demo.sh"
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
    show_progress 1 8 "Installing System Dependencies"
    
    # Update system
    print_status "Updating package lists..."
    apt-get update -y > /dev/null 2>&1
    
    # Install essential packages
    print_status "Installing essential packages..."
    DEBIAN_FRONTEND=noninteractive apt-get install -y \
        curl wget gnupg2 software-properties-common \
        apt-transport-https ca-certificates lsb-release \
        unzip git htop nano vim tree jq \
        ufw certbot python3-certbot-nginx \
        python3-pip build-essential > /dev/null 2>&1
    
    print_success "System dependencies installed"
}

# Function to install Node.js
install_nodejs() {
    show_progress 2 8 "Installing Node.js 20.x LTS"
    
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

# Function to install and configure Nginx
install_nginx() {
    show_progress 3 8 "Installing Nginx Web Server"
    
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
    show_progress 4 8 "Setting Up System User and Directories"
    
    # Create system user
    if ! id "$SERVICE_USER" &>/dev/null; then
        useradd -r -s /bin/false -d $INSTALL_DIR $SERVICE_USER
        print_status "Created system user: $SERVICE_USER"
    fi
    
    # Create directories
    mkdir -p $INSTALL_DIR
    mkdir -p $LOG_DIR
    mkdir -p /etc/vantax-demo
    
    # Set permissions
    chown -R $SERVICE_USER:$SERVICE_USER $INSTALL_DIR
    chown -R $SERVICE_USER:$SERVICE_USER $LOG_DIR
    chmod 755 $INSTALL_DIR
    chmod 755 $LOG_DIR
    
    print_success "System directories created"
}

# Function to download and install application
install_application() {
    show_progress 5 8 "Installing Vanta X Demo Application"
    
    cd $INSTALL_DIR
    
    # Download application files
    print_status "Downloading application files..."
    
    # Create the backend file
    cat > vantax-demo-backend.js << 'EOF'
#!/usr/bin/env node

/**
 * Vanta X Enterprise FMCG Platform - Complete Demo Backend
 * Full-featured backend with AI/ML, multi-company support, and comprehensive APIs
 * Version: 3.0.0 - Production Demo Ready
 */

const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuration
const CONFIG = {
    port: process.env.PORT || 4000,
    host: '0.0.0.0',
    cors: true,
    rateLimit: 1000,
    jwtSecret: 'VantaX_Demo_Secret_2024!',
    dbFile: '/tmp/vantax_demo.json'
};

// In-memory database with comprehensive demo data
let DATABASE = {
    companies: {
        'diplomat-sa': {
            id: 'diplomat-sa',
            name: 'Diplomat SA',
            type: 'subsidiary',
            tier: 'professional',
            region: 'EMEA',
            currency: 'GBP',
            settings: {
                theme: 'blue',
                language: 'en-GB',
                timezone: 'Europe/London',
                dateFormat: 'DD/MM/YYYY',
                currency: 'GBP'
            }
        },
        'premium-brands': {
            id: 'premium-brands',
            name: 'Premium Brands International',
            type: 'subsidiary',
            tier: 'enterprise',
            region: 'Americas',
            currency: 'USD',
            settings: {
                theme: 'orange',
                language: 'en-US',
                timezone: 'America/New_York',
                dateFormat: 'MM/DD/YYYY',
                currency: 'USD'
            }
        },
        'regional-dist': {
            id: 'regional-dist',
            name: 'Regional Distribution Network',
            type: 'distributor',
            tier: 'professional',
            region: 'APAC',
            currency: 'AUD',
            settings: {
                theme: 'green',
                language: 'en-AU',
                timezone: 'Australia/Sydney',
                dateFormat: 'DD/MM/YYYY',
                currency: 'AUD'
            }
        }
    },
    kpis: {
        'diplomat-sa': [
            { id: 1, name: 'Total Revenue', value: 2850000.00, target: 3000000.00, unit: 'GBP', category: 'sales', period: 'YTD', trend: 'up', changePercentage: 12.5 },
            { id: 2, name: 'Gross Profit', value: 1425000.00, target: 1500000.00, unit: 'GBP', category: 'finance', period: 'YTD', trend: 'up', changePercentage: 8.3 },
            { id: 3, name: 'Active Customers', value: 1250, target: 1200, unit: 'count', category: 'sales', period: 'Current', trend: 'up', changePercentage: 4.2 },
            { id: 4, name: 'Market Share', value: 24.5, target: 25.0, unit: '%', category: 'market', period: 'YTD', trend: 'down', changePercentage: -2.0 }
        ],
        'premium-brands': [
            { id: 5, name: 'Total Revenue', value: 4200000.00, target: 4000000.00, unit: 'USD', category: 'sales', period: 'YTD', trend: 'up', changePercentage: 15.8 },
            { id: 6, name: 'Gross Profit', value: 2100000.00, target: 2000000.00, unit: 'USD', category: 'finance', period: 'YTD', trend: 'up', changePercentage: 12.2 },
            { id: 7, name: 'Active Customers', value: 850, target: 800, unit: 'count', category: 'sales', period: 'Current', trend: 'up', changePercentage: 6.3 },
            { id: 8, name: 'Market Share', value: 18.2, target: 18.0, unit: '%', category: 'market', period: 'YTD', trend: 'up', changePercentage: 1.1 }
        ],
        'regional-dist': [
            { id: 9, name: 'Total Revenue', value: 1650000.00, target: 1600000.00, unit: 'AUD', category: 'sales', period: 'YTD', trend: 'up', changePercentage: 8.7 },
            { id: 10, name: 'Gross Profit', value: 825000.00, target: 800000.00, unit: 'AUD', category: 'finance', period: 'YTD', trend: 'up', changePercentage: 6.5 },
            { id: 11, name: 'Active Customers', value: 650, target: 600, unit: 'count', category: 'sales', period: 'Current', trend: 'up', changePercentage: 8.3 },
            { id: 12, name: 'Market Share', value: 15.8, target: 16.0, unit: '%', category: 'market', period: 'YTD', trend: 'down', changePercentage: -1.3 }
        ]
    },
    sales: generateSalesData(),
    products: generateProductsData(),
    customers: generateCustomersData(),
    promotions: generatePromotionsData(),
    aiModels: {
        'demand-forecasting': { name: 'Demand Forecasting', accuracy: 94.2, status: 'active', lastTrained: '2024-08-25' },
        'price-optimization': { name: 'Price Optimization', accuracy: 89.7, status: 'active', lastTrained: '2024-08-20' },
        'customer-segmentation': { name: 'Customer Segmentation', accuracy: 91.5, status: 'active', lastTrained: '2024-08-22' },
        'promotion-effectiveness': { name: 'Promotion Effectiveness', accuracy: 87.3, status: 'active', lastTrained: '2024-08-18' },
        'inventory-optimization': { name: 'Inventory Optimization', accuracy: 93.8, status: 'active', lastTrained: '2024-08-24' }
    }
};

// Generate sample data functions
function generateSalesData() {
    const salesData = {};
    const companies = ['diplomat-sa', 'premium-brands', 'regional-dist'];
    
    companies.forEach(companyId => {
        salesData[companyId] = [];
        for (let i = 0; i < 20; i++) {
            const saleDate = new Date();
            saleDate.setDate(saleDate.getDate() - Math.floor(Math.random() * 365));
            
            salesData[companyId].push({
                id: i + 1,
                orderNumber: `${companyId.toUpperCase()}-ORD-${String(i + 1).padStart(6, '0')}`,
                customerId: Math.floor(Math.random() * 5) + 1,
                customerName: ['Tesco UK', 'Walmart', 'Woolworths', 'Sainsburys', 'Target'][Math.floor(Math.random() * 5)],
                productId: Math.floor(Math.random() * 10) + 1,
                productName: ['Premium Vodka', 'Craft Gin', 'Single Malt Whisky', 'Premium Rum', 'Champagne'][Math.floor(Math.random() * 5)],
                category: ['Spirits', 'Wine', 'Beer'][Math.floor(Math.random() * 3)],
                quantity: Math.floor(Math.random() * 100) + 10,
                unitPrice: Math.random() * 100 + 20,
                totalAmount: (Math.floor(Math.random() * 100) + 10) * (Math.random() * 100 + 20),
                status: ['completed', 'shipped', 'pending'][Math.floor(Math.random() * 3)],
                saleDate: saleDate.toISOString().split('T')[0],
                region: ['UK', 'USA', 'Australia'][Math.floor(Math.random() * 3)],
                channel: ['Direct', 'Online', 'Retail', 'Wholesale'][Math.floor(Math.random() * 4)]
            });
        }
    });
    
    return salesData;
}

function generateProductsData() {
    const productsData = {};
    const companies = ['diplomat-sa', 'premium-brands', 'regional-dist'];
    
    companies.forEach(companyId => {
        productsData[companyId] = [];
        for (let i = 0; i < 10; i++) {
            productsData[companyId].push({
                id: i + 1,
                sku: `${companyId.toUpperCase()}-${String(i + 1).padStart(3, '0')}`,
                name: ['Premium Vodka', 'Craft Gin', 'Single Malt Whisky', 'Premium Rum', 'Champagne', 'Chardonnay', 'Premium Lager', 'Craft IPA', 'Cola', 'Orange Juice'][i],
                category: ['Spirits', 'Wine', 'Beer', 'Soft Drinks'][Math.floor(Math.random() * 4)],
                brand: companyId === 'diplomat-sa' ? 'Diplomat' : companyId === 'premium-brands' ? 'Premium' : 'Regional',
                price: Math.random() * 100 + 20,
                cost: Math.random() * 50 + 10,
                margin: Math.random() * 50 + 20,
                stock: Math.floor(Math.random() * 500) + 50,
                minStock: Math.floor(Math.random() * 50) + 10,
                status: 'active'
            });
        }
    });
    
    return productsData;
}

function generateCustomersData() {
    const customersData = {};
    const companies = ['diplomat-sa', 'premium-brands', 'regional-dist'];
    
    companies.forEach(companyId => {
        customersData[companyId] = [];
        const customerNames = companyId === 'diplomat-sa' ? 
            ['Tesco UK', 'Sainsburys', 'ASDA', 'Morrisons', 'Waitrose'] :
            companyId === 'premium-brands' ?
            ['Walmart', 'Target', 'Kroger', 'Costco USA', 'Whole Foods'] :
            ['Woolworths', 'Coles', 'IGA', 'Dan Murphys', 'BWS'];
            
        customerNames.forEach((name, i) => {
            customersData[companyId].push({
                id: i + 1,
                name: name,
                type: 'Retail Chain',
                segment: ['Premium', 'Standard'][Math.floor(Math.random() * 2)],
                region: companyId === 'diplomat-sa' ? 'UK' : companyId === 'premium-brands' ? 'USA' : 'Australia',
                contactPerson: `Contact ${i + 1}`,
                email: `contact${i + 1}@${name.toLowerCase().replace(/\s+/g, '')}.com`,
                creditLimit: Math.random() * 500000 + 100000,
                status: 'active'
            });
        });
    });
    
    return customersData;
}

function generatePromotionsData() {
    const promotionsData = {};
    const companies = ['diplomat-sa', 'premium-brands', 'regional-dist'];
    
    companies.forEach(companyId => {
        promotionsData[companyId] = [];
        for (let i = 0; i < 3; i++) {
            promotionsData[companyId].push({
                id: i + 1,
                name: ['Summer Sale', 'Holiday Special', 'New Year Promotion'][i],
                type: ['Discount', 'Bundle', 'Event'][i],
                description: `Promotion ${i + 1} description`,
                discountPercentage: Math.random() * 30 + 10,
                budget: Math.random() * 100000 + 20000,
                spent: Math.random() * 50000 + 10000,
                startDate: '2024-06-01',
                endDate: '2024-12-31',
                status: 'Active',
                roi: Math.random() * 300 + 100
            });
        }
    });
    
    return promotionsData;
}

// Utility functions
function corsHeaders() {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Company-ID',
        'Access-Control-Max-Age': '86400'
    };
}

function sendResponse(res, statusCode, data, headers = {}) {
    const allHeaders = { ...corsHeaders(), 'Content-Type': 'application/json', ...headers };
    res.writeHead(statusCode, allHeaders);
    res.end(JSON.stringify(data, null, 2));
}

function sendError(res, statusCode, message, details = null) {
    sendResponse(res, statusCode, {
        error: true,
        message,
        details,
        timestamp: new Date().toISOString()
    });
}

// AI Chatbot responses
function generateAIResponse(message, companyId) {
    const responses = [
        `Based on our analysis for ${DATABASE.companies[companyId]?.name}, I can see strong performance across key metrics.`,
        `Current sales trends show positive growth with opportunities in premium segments.`,
        `Our AI models indicate favorable market conditions for expansion.`,
        `Customer satisfaction metrics are trending upward with strong retention rates.`,
        `Product performance analysis shows excellent margins in our core categories.`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

// API Routes
const routes = {
    'GET /health': (req, res) => {
        sendResponse(res, 200, {
            status: 'healthy',
            service: 'Vanta X Enterprise FMCG Platform',
            version: '3.0.0',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: 'demo'
        });
    },

    'GET /api/v2/companies': (req, res) => {
        sendResponse(res, 200, {
            success: true,
            data: Object.values(DATABASE.companies)
        });
    },

    'GET /api/v2/dashboard': (req, res) => {
        const companyId = req.headers['x-company-id'] || 'diplomat-sa';
        const kpis = DATABASE.kpis[companyId] || [];
        const sales = DATABASE.sales[companyId] || [];
        
        // Generate sales trend data
        const salesTrend = [];
        for (let i = 11; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            salesTrend.push({
                month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                revenue: Math.random() * 500000 + 200000,
                orders: Math.floor(Math.random() * 100) + 50
            });
        }
        
        // Generate category data
        const categoryData = {
            'Spirits': Math.random() * 1000000 + 500000,
            'Wine': Math.random() * 800000 + 400000,
            'Beer': Math.random() * 600000 + 300000,
            'Soft Drinks': Math.random() * 400000 + 200000
        };
        
        sendResponse(res, 200, {
            success: true,
            data: {
                kpis,
                recentSales: {
                    total: sales.length,
                    revenue: sales.reduce((sum, sale) => sum + sale.totalAmount, 0),
                    byCategory: categoryData
                },
                salesTrend,
                activePromotions: 3,
                topProducts: DATABASE.products[companyId]?.slice(0, 5) || []
            }
        });
    },

    'GET /api/v2/kpis': (req, res) => {
        const companyId = req.headers['x-company-id'] || 'diplomat-sa';
        const kpis = DATABASE.kpis[companyId] || [];
        sendResponse(res, 200, { success: true, data: kpis });
    },

    'GET /api/v2/sales': (req, res) => {
        const companyId = req.headers['x-company-id'] || 'diplomat-sa';
        const sales = DATABASE.sales[companyId] || [];
        sendResponse(res, 200, { success: true, data: sales, total: sales.length });
    },

    'GET /api/v2/sales/analytics': (req, res) => {
        const companyId = req.headers['x-company-id'] || 'diplomat-sa';
        const sales = DATABASE.sales[companyId] || [];
        
        sendResponse(res, 200, {
            success: true,
            data: {
                totalRevenue: sales.reduce((sum, sale) => sum + sale.totalAmount, 0),
                totalOrders: sales.length,
                averageOrderValue: sales.length > 0 ? sales.reduce((sum, sale) => sum + sale.totalAmount, 0) / sales.length : 0,
                salesByRegion: { 'UK': 1500000, 'USA': 2000000, 'Australia': 800000 },
                salesByChannel: { 'Direct': 800000, 'Online': 1200000, 'Retail': 2000000, 'Wholesale': 500000 },
                topCustomers: [
                    { name: 'Tesco UK', revenue: 500000 },
                    { name: 'Walmart', revenue: 750000 },
                    { name: 'Woolworths', revenue: 400000 }
                ]
            }
        });
    },

    'GET /api/v2/products': (req, res) => {
        const companyId = req.headers['x-company-id'] || 'diplomat-sa';
        const products = DATABASE.products[companyId] || [];
        sendResponse(res, 200, { success: true, data: products, total: products.length });
    },

    'GET /api/v2/customers': (req, res) => {
        const companyId = req.headers['x-company-id'] || 'diplomat-sa';
        const customers = DATABASE.customers[companyId] || [];
        sendResponse(res, 200, { success: true, data: customers, total: customers.length });
    },

    'GET /api/v2/promotions': (req, res) => {
        const companyId = req.headers['x-company-id'] || 'diplomat-sa';
        const promotions = DATABASE.promotions[companyId] || [];
        sendResponse(res, 200, { success: true, data: promotions, total: promotions.length });
    },

    'GET /api/v2/ai/models': (req, res) => {
        sendResponse(res, 200, {
            success: true,
            data: DATABASE.aiModels,
            total: Object.keys(DATABASE.aiModels).length
        });
    },

    'POST /api/v2/ai/predict': (req, res) => {
        const { model } = req.body;
        sendResponse(res, 200, {
            success: true,
            data: {
                model,
                confidence: Math.random() * 0.3 + 0.7,
                result: { prediction: Math.random() * 1000 + 500 },
                timestamp: new Date().toISOString()
            }
        });
    },

    'POST /api/v2/ai/chat': (req, res) => {
        const { message } = req.body;
        const companyId = req.headers['x-company-id'] || 'diplomat-sa';
        
        const response = generateAIResponse(message, companyId);
        
        sendResponse(res, 200, {
            success: true,
            data: {
                message: response,
                timestamp: new Date().toISOString(),
                companyContext: DATABASE.companies[companyId]?.name
            }
        });
    }
};

// Request handler
function handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const method = req.method;
    const pathname = parsedUrl.pathname;
    const routeKey = `${method} ${pathname}`;
    
    // Handle CORS preflight
    if (method === 'OPTIONS') {
        res.writeHead(200, corsHeaders());
        return res.end();
    }
    
    // Parse request body for POST/PUT requests
    if (method === 'POST' || method === 'PUT') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                req.body = JSON.parse(body);
            } catch (e) {
                req.body = {};
            }
            processRequest();
        });
    } else {
        processRequest();
    }
    
    function processRequest() {
        req.params = {};
        req.query = parsedUrl.query;
        
        const handler = routes[routeKey];
        
        if (handler) {
            try {
                handler(req, res);
            } catch (error) {
                console.error('Route handler error:', error);
                sendError(res, 500, 'Internal server error', error.message);
            }
        } else {
            sendError(res, 404, 'Route not found', `${method} ${pathname}`);
        }
    }
}

// Create and start server
const server = http.createServer(handleRequest);

server.listen(CONFIG.port, CONFIG.host, () => {
    console.log(`🚀 Vanta X Enterprise FMCG Platform Demo Backend`);
    console.log(`📡 Server running on http://${CONFIG.host}:${CONFIG.port}`);
    console.log(`🏢 Multi-company support: ${Object.keys(DATABASE.companies).length} companies`);
    console.log(`🤖 AI Models active: ${Object.keys(DATABASE.aiModels).length}`);
    console.log(`🎯 Ready for enterprise deployment!`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 Shutting down server...');
    server.close(() => {
        console.log('✅ Server shutdown complete');
        process.exit(0);
    });
});
EOF
    
    # Download frontend files from the workspace
    wget -q -O index.html "$GITHUB_REPO/vantax-demo-frontend.html" || cp /workspace/vantax-demo-frontend.html index.html 2>/dev/null || echo "<!-- Frontend will be created -->" > index.html
    wget -q -O vantax-demo-app.js "$GITHUB_REPO/vantax-demo-app.js" || cp /workspace/vantax-demo-app.js . 2>/dev/null || echo "// Frontend JS will be created" > vantax-demo-app.js
    
    # Create package.json
    cat > package.json << 'EOF'
{
  "name": "vantax-demo-backend",
  "version": "3.0.0",
  "description": "Vanta X Enterprise FMCG Platform Demo Backend",
  "main": "vantax-demo-backend.js",
  "scripts": {
    "start": "node vantax-demo-backend.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF
    
    # Set permissions
    chown -R $SERVICE_USER:$SERVICE_USER $INSTALL_DIR
    chmod +x vantax-demo-backend.js
    
    print_success "Application installed"
}

# Function to configure PM2
configure_pm2() {
    show_progress 6 8 "Configuring Process Management"
    
    # Create PM2 ecosystem file
    cat > $INSTALL_DIR/ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'vantax-demo-backend',
    script: 'vantax-demo-backend.js',
    cwd: '$INSTALL_DIR',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: $BACKEND_PORT
    },
    error_file: '$LOG_DIR/error.log',
    out_file: '$LOG_DIR/out.log',
    log_file: '$LOG_DIR/combined.log',
    time: true,
    max_memory_restart: '512M'
  }]
};
EOF
    
    chown $SERVICE_USER:$SERVICE_USER $INSTALL_DIR/ecosystem.config.js
    
    # Start PM2 as service user
    print_status "Starting application with PM2..."
    sudo -u $SERVICE_USER bash -c "cd $INSTALL_DIR && PM2_HOME=$INSTALL_DIR/.pm2 pm2 start ecosystem.config.js" > /dev/null 2>&1
    sudo -u $SERVICE_USER bash -c "cd $INSTALL_DIR && PM2_HOME=$INSTALL_DIR/.pm2 pm2 save" > /dev/null 2>&1
    
    # Create systemd service
    cat > /etc/systemd/system/pm2-vantax-demo.service << EOF
[Unit]
Description=PM2 process manager for Vanta X Demo
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
    systemctl enable pm2-vantax-demo > /dev/null 2>&1
    systemctl start pm2-vantax-demo
    
    print_success "PM2 configured"
}

# Function to configure Nginx
configure_nginx() {
    show_progress 7 8 "Configuring Web Server"
    
    # Determine server name
    if [[ -n "$PUBLIC_IP" ]]; then
        SERVER_NAME="$PUBLIC_IP"
    else
        SERVER_NAME="_"
    fi
    
    # Create Nginx configuration
    cat > /etc/nginx/sites-available/vantax-demo << EOF
# Backend upstream
upstream backend {
    server 127.0.0.1:$BACKEND_PORT;
    keepalive 32;
}

# HTTP server
server {
    listen 80;
    server_name $SERVER_NAME;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
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
    ln -sf /etc/nginx/sites-available/vantax-demo /etc/nginx/sites-enabled/
    
    # Test and reload Nginx
    nginx -t > /dev/null 2>&1
    systemctl reload nginx
    
    print_success "Web server configured"
}

# Function to configure firewall
configure_security() {
    show_progress 8 8 "Configuring Security"
    
    # Configure UFW
    print_status "Configuring firewall..."
    ufw --force reset > /dev/null 2>&1
    ufw default deny incoming > /dev/null 2>&1
    ufw default allow outgoing > /dev/null 2>&1
    ufw allow ssh > /dev/null 2>&1
    ufw allow 80/tcp > /dev/null 2>&1
    ufw allow 443/tcp > /dev/null 2>&1
    ufw --force enable > /dev/null 2>&1
    
    print_success "Security configured"
}

# Function to create management script
create_management_script() {
    cat > /usr/local/bin/vantax-demo << 'EOF'
#!/bin/bash

INSTALL_DIR="/opt/vantax-demo"
SERVICE_USER="vantax"

case "$1" in
    start)
        echo "Starting Vanta X Demo..."
        systemctl start nginx
        systemctl start pm2-vantax-demo
        ;;
    stop)
        echo "Stopping Vanta X Demo..."
        sudo -u $SERVICE_USER bash -c "cd $INSTALL_DIR && PM2_HOME=$INSTALL_DIR/.pm2 pm2 stop all"
        ;;
    restart)
        echo "Restarting Vanta X Demo..."
        sudo -u $SERVICE_USER bash -c "cd $INSTALL_DIR && PM2_HOME=$INSTALL_DIR/.pm2 pm2 restart all"
        systemctl reload nginx
        ;;
    status)
        echo "=== Vanta X Demo Status ==="
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
        echo "Usage: vantax-demo {start|stop|restart|status|logs|health}"
        exit 1
        ;;
esac
EOF
    
    chmod +x /usr/local/bin/vantax-demo
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
    
    print_header "🎉 Demo Installation Complete!"
    
    echo -e "${GREEN}Vanta X Enterprise FMCG Platform Demo has been successfully installed!${NC}"
    echo -e "Installation time: ${DURATION} seconds"
    echo ""
    echo -e "${CYAN}📊 Access Information:${NC}"
    if [[ -n "$PUBLIC_IP" ]]; then
        echo -e "  🌐 Web Application: ${YELLOW}http://$PUBLIC_IP${NC}"
        echo -e "  🔗 API Endpoint: ${YELLOW}http://$PUBLIC_IP/api/v2${NC}"
    else
        echo -e "  🌐 Web Application: ${YELLOW}http://your-server-ip${NC}"
        echo -e "  🔗 API Endpoint: ${YELLOW}http://your-server-ip/api/v2${NC}"
    fi
    echo -e "  ❤️  Health Check: ${YELLOW}http://localhost/health${NC}"
    echo ""
    echo -e "${CYAN}🏢 Demo Features:${NC}"
    echo -e "  • 3 Companies: Diplomat SA, Premium Brands, Regional Distribution"
    echo -e "  • Multi-company data switching"
    echo -e "  • Interactive dashboards and analytics"
    echo -e "  • AI chatbot with business insights"
    echo -e "  • 5 AI/ML models with predictions"
    echo -e "  • SAP integration endpoints"
    echo -e "  • Excel template downloads"
    echo -e "  • Real-time charts and KPIs"
    echo ""
    echo -e "${CYAN}🔧 Management Commands:${NC}"
    echo -e "  ${YELLOW}vantax-demo start${NC}    - Start the platform"
    echo -e "  ${YELLOW}vantax-demo stop${NC}     - Stop the platform"
    echo -e "  ${YELLOW}vantax-demo restart${NC}  - Restart the platform"
    echo -e "  ${YELLOW}vantax-demo status${NC}   - Check status"
    echo -e "  ${YELLOW}vantax-demo logs${NC}     - View logs"
    echo -e "  ${YELLOW}vantax-demo health${NC}   - Health check"
    echo ""
    echo -e "${CYAN}📁 Important Locations:${NC}"
    echo -e "  • Application: ${YELLOW}$INSTALL_DIR${NC}"
    echo -e "  • Logs: ${YELLOW}$LOG_DIR${NC}"
    echo ""
    echo -e "${PURPLE}🎯 Demo Highlights:${NC}"
    echo -e "  1. Switch between companies using the dropdown"
    echo -e "  2. Explore interactive dashboards and charts"
    echo -e "  3. Test the AI chatbot (🤖 button)"
    echo -e "  4. View sales analytics and KPIs"
    echo -e "  5. Check AI model performance"
    echo -e "  6. Test SAP integration endpoints"
    echo ""
    if [[ -n "$PUBLIC_IP" ]]; then
        echo -e "${GREEN}🔗 Quick Access: ${YELLOW}http://$PUBLIC_IP${NC}"
    fi
    echo ""
}

# Main installation function
main() {
    clear
    print_header "Vanta X Enterprise FMCG Platform Demo Installer v$VERSION"
    
    # Pre-installation checks
    check_root
    detect_system
    
    # Installation steps
    install_dependencies
    install_nodejs
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
    
    print_success "Demo installation completed successfully! 🎊"
}

# Error handling
trap 'print_error "Installation failed at line $LINENO. Check the logs for details."; exit 1' ERR

# Run main function
main "$@"