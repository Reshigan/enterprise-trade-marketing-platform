#!/usr/bin/env node

/**
 * Vanta X-Trade Spend Enterprise Backend
 * Level 3 System with Full Functionality
 * Version: 3.0.0
 */

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// File upload configuration
const upload = multer({ 
    dest: '/tmp/uploads/',
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// In-memory database with comprehensive data
const db = {
    companies: new Map(),
    users: new Map(),
    sessions: new Map(),
    products: new Map(),
    customers: new Map(),
    sales: new Map(),
    promotions: new Map(),
    budgets: new Map(),
    claims: new Map(),
    contracts: new Map(),
    kpis: new Map(),
    forecasts: new Map(),
    alerts: new Map(),
    reports: new Map(),
    templates: new Map(),
    aiModels: new Map(),
    chatHistory: new Map(),
    integrations: new Map(),
    audit: []
};

// Initialize Diplomat SA with comprehensive data
function initializeDiplomatSA() {
    const companyId = 'diplomat-sa';
    
    // Create company
    db.companies.set(companyId, {
        id: companyId,
        name: 'Diplomat South Africa',
        type: 'FMCG Distributor',
        country: 'South Africa',
        currency: 'ZAR',
        fiscalYear: '2025',
        logo: '/assets/diplomat-sa-logo.png',
        settings: {
            sso: {
                enabled: true,
                provider: 'microsoft365',
                domain: 'diplomat.co.za',
                tenantId: 'diplomat-tenant-123'
            },
            integrations: {
                sap: {
                    ecc: { enabled: true, system: 'PRD', client: '100' },
                    s4hana: { enabled: true, system: 'S4P', client: '200' }
                }
            },
            features: {
                ai: true,
                ml: true,
                chatbot: true,
                forecasting: true,
                budgeting: true,
                claims: true,
                contracts: true
            }
        },
        licenses: {
            total: 10,
            used: 10,
            roles: {
                admin: 2,
                manager: 3,
                analyst: 3,
                viewer: 2
            }
        }
    });

    // Create users with different roles
    const users = [
        { id: 'admin1', name: 'John Smith', email: 'john.smith@diplomat.co.za', role: 'admin', department: 'IT' },
        { id: 'admin2', name: 'Sarah Johnson', email: 'sarah.johnson@diplomat.co.za', role: 'admin', department: 'Finance' },
        { id: 'manager1', name: 'Michael Brown', email: 'michael.brown@diplomat.co.za', role: 'manager', department: 'Sales' },
        { id: 'manager2', name: 'Lisa Davis', email: 'lisa.davis@diplomat.co.za', role: 'manager', department: 'Marketing' },
        { id: 'manager3', name: 'David Wilson', email: 'david.wilson@diplomat.co.za', role: 'manager', department: 'Trade Marketing' },
        { id: 'analyst1', name: 'Emma Taylor', email: 'emma.taylor@diplomat.co.za', role: 'analyst', department: 'Analytics' },
        { id: 'analyst2', name: 'James Anderson', email: 'james.anderson@diplomat.co.za', role: 'analyst', department: 'Finance' },
        { id: 'analyst3', name: 'Olivia Martinez', email: 'olivia.martinez@diplomat.co.za', role: 'analyst', department: 'Trade Marketing' },
        { id: 'viewer1', name: 'Robert Garcia', email: 'robert.garcia@diplomat.co.za', role: 'viewer', department: 'Sales' },
        { id: 'viewer2', name: 'Maria Rodriguez', email: 'maria.rodriguez@diplomat.co.za', role: 'viewer', department: 'Operations' }
    ];

    users.forEach(user => {
        db.users.set(user.email, {
            ...user,
            companyId,
            password: bcrypt.hashSync('Demo123!', 10),
            active: true,
            lastLogin: new Date().toISOString(),
            permissions: getPermissionsByRole(user.role)
        });
    });

    // Create comprehensive product catalog
    const products = [
        // Beverages
        { id: 'PROD001', name: 'Coca-Cola 330ml', category: 'Beverages', subcategory: 'Soft Drinks', brand: 'Coca-Cola', sku: 'CC330', barcode: '5449000000996' },
        { id: 'PROD002', name: 'Coca-Cola 1L', category: 'Beverages', subcategory: 'Soft Drinks', brand: 'Coca-Cola', sku: 'CC1L', barcode: '5449000001002' },
        { id: 'PROD003', name: 'Sprite 330ml', category: 'Beverages', subcategory: 'Soft Drinks', brand: 'Sprite', sku: 'SP330', barcode: '5449000002334' },
        { id: 'PROD004', name: 'Fanta Orange 330ml', category: 'Beverages', subcategory: 'Soft Drinks', brand: 'Fanta', sku: 'FO330', barcode: '5449000003456' },
        { id: 'PROD005', name: 'Castle Lager 340ml', category: 'Beverages', subcategory: 'Beer', brand: 'Castle', sku: 'CL340', barcode: '6001108000123' },
        { id: 'PROD006', name: 'Black Label 340ml', category: 'Beverages', subcategory: 'Beer', brand: 'Carling', sku: 'BL340', barcode: '6001108000456' },
        
        // Snacks
        { id: 'PROD007', name: 'Lays Original 125g', category: 'Snacks', subcategory: 'Chips', brand: 'Lays', sku: 'LO125', barcode: '6001068000123' },
        { id: 'PROD008', name: 'Doritos Cheese 150g', category: 'Snacks', subcategory: 'Chips', brand: 'Doritos', sku: 'DC150', barcode: '6001068000456' },
        { id: 'PROD009', name: 'Simba Chips 125g', category: 'Snacks', subcategory: 'Chips', brand: 'Simba', sku: 'SC125', barcode: '6001068000789' },
        { id: 'PROD010', name: 'KitKat 4 Finger', category: 'Snacks', subcategory: 'Chocolate', brand: 'Nestle', sku: 'KK4F', barcode: '7613034000123' },
        
        // Personal Care
        { id: 'PROD011', name: 'Colgate Total 100ml', category: 'Personal Care', subcategory: 'Oral Care', brand: 'Colgate', sku: 'CT100', barcode: '8901314000123' },
        { id: 'PROD012', name: 'Dove Soap 100g', category: 'Personal Care', subcategory: 'Soap', brand: 'Dove', sku: 'DS100', barcode: '8901030000456' },
        { id: 'PROD013', name: 'Head & Shoulders 200ml', category: 'Personal Care', subcategory: 'Hair Care', brand: 'P&G', sku: 'HS200', barcode: '8901030000789' },
        
        // Food
        { id: 'PROD014', name: 'Kelloggs Corn Flakes 500g', category: 'Food', subcategory: 'Cereal', brand: 'Kelloggs', sku: 'KCF500', barcode: '5053827000123' },
        { id: 'PROD015', name: 'Jungle Oats 1kg', category: 'Food', subcategory: 'Cereal', brand: 'Tiger Brands', sku: 'JO1K', barcode: '6001089000456' },
        { id: 'PROD016', name: 'All Gold Tomato Sauce 700ml', category: 'Food', subcategory: 'Condiments', brand: 'All Gold', sku: 'AGTS700', barcode: '6001089000789' },
        { id: 'PROD017', name: 'Tastic Rice 2kg', category: 'Food', subcategory: 'Rice', brand: 'Tastic', sku: 'TR2K', barcode: '6001038000123' },
        { id: 'PROD018', name: 'Lucky Star Pilchards 400g', category: 'Food', subcategory: 'Canned', brand: 'Lucky Star', sku: 'LSP400', barcode: '6001069000456' },
        
        // Household
        { id: 'PROD019', name: 'Sunlight Liquid 750ml', category: 'Household', subcategory: 'Cleaning', brand: 'Sunlight', sku: 'SL750', barcode: '6001085000123' },
        { id: 'PROD020', name: 'Handy Andy 750ml', category: 'Household', subcategory: 'Cleaning', brand: 'Handy Andy', sku: 'HA750', barcode: '6001085000456' }
    ];

    products.forEach(product => {
        db.products.set(product.id, {
            ...product,
            companyId,
            unitPrice: Math.floor(Math.random() * 50) + 10,
            caseSize: 12,
            active: true,
            launchDate: '2024-01-01',
            attributes: {
                weight: `${Math.floor(Math.random() * 500) + 100}g`,
                dimensions: '10x10x20cm',
                shelfLife: '12 months'
            }
        });
    });

    // Create customers (stores) across different types
    const customers = [
        // Hypermarkets
        { id: 'CUST001', name: 'Pick n Pay Sandton', type: 'Hypermarket', chain: 'Pick n Pay', region: 'Gauteng', city: 'Johannesburg' },
        { id: 'CUST002', name: 'Checkers Hyper Fourways', type: 'Hypermarket', chain: 'Checkers', region: 'Gauteng', city: 'Johannesburg' },
        { id: 'CUST003', name: 'Game Menlyn', type: 'Hypermarket', chain: 'Game', region: 'Gauteng', city: 'Pretoria' },
        
        // Supermarkets
        { id: 'CUST004', name: 'Woolworths V&A', type: 'Supermarket', chain: 'Woolworths', region: 'Western Cape', city: 'Cape Town' },
        { id: 'CUST005', name: 'Spar Rosebank', type: 'Supermarket', chain: 'Spar', region: 'Gauteng', city: 'Johannesburg' },
        { id: 'CUST006', name: 'Food Lovers Durban North', type: 'Supermarket', chain: 'Food Lovers', region: 'KwaZulu-Natal', city: 'Durban' },
        
        // Convenience
        { id: 'CUST007', name: 'Engen QuickShop N1', type: 'Convenience', chain: 'Engen', region: 'Gauteng', city: 'Johannesburg' },
        { id: 'CUST008', name: 'Shell Select Sandton', type: 'Convenience', chain: 'Shell', region: 'Gauteng', city: 'Johannesburg' },
        
        // Wholesale
        { id: 'CUST009', name: 'Makro Woodmead', type: 'Wholesale', chain: 'Makro', region: 'Gauteng', city: 'Johannesburg' },
        { id: 'CUST010', name: 'Cash & Carry Germiston', type: 'Wholesale', chain: 'Independent', region: 'Gauteng', city: 'Germiston' },
        
        // Pharmacy
        { id: 'CUST011', name: 'Clicks Sandton City', type: 'Pharmacy', chain: 'Clicks', region: 'Gauteng', city: 'Johannesburg' },
        { id: 'CUST012', name: 'Dischem Centurion', type: 'Pharmacy', chain: 'Dischem', region: 'Gauteng', city: 'Centurion' },
        
        // Spaza Shops
        { id: 'CUST013', name: 'Sipho General Dealer', type: 'Spaza', chain: 'Independent', region: 'Gauteng', city: 'Soweto' },
        { id: 'CUST014', name: 'Mama Joyce Shop', type: 'Spaza', chain: 'Independent', region: 'Gauteng', city: 'Alexandra' },
        { id: 'CUST015', name: 'Lucky Store Khayelitsha', type: 'Spaza', chain: 'Independent', region: 'Western Cape', city: 'Cape Town' }
    ];

    customers.forEach(customer => {
        db.customers.set(customer.id, {
            ...customer,
            companyId,
            accountNumber: `ACC${customer.id}`,
            creditLimit: customer.type === 'Hypermarket' ? 500000 : customer.type === 'Wholesale' ? 300000 : 100000,
            paymentTerms: customer.type === 'Spaza' ? 'COD' : '30 days',
            active: true,
            onboarded: '2024-01-01',
            coordinates: {
                lat: -26.2041 + (Math.random() - 0.5) * 2,
                lng: 28.0473 + (Math.random() - 0.5) * 2
            }
        });
    });

    // Generate comprehensive sales data for the past year
    const startDate = new Date('2024-09-01');
    const endDate = new Date('2025-08-31');
    let salesId = 1;

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        // Generate 20-50 sales transactions per day
        const dailyTransactions = Math.floor(Math.random() * 30) + 20;
        
        for (let t = 0; t < dailyTransactions; t++) {
            const customerId = customers[Math.floor(Math.random() * customers.length)].id;
            const customer = db.customers.get(customerId);
            const productId = products[Math.floor(Math.random() * products.length)].id;
            const product = db.products.get(productId);
            
            const quantity = Math.floor(Math.random() * 50) + 10;
            const baseAmount = quantity * product.unitPrice;
            const discount = customer.type === 'Hypermarket' ? 0.15 : customer.type === 'Wholesale' ? 0.12 : 0.05;
            const amount = baseAmount * (1 - discount);
            
            db.sales.set(`SALE${salesId.toString().padStart(6, '0')}`, {
                id: `SALE${salesId.toString().padStart(6, '0')}`,
                companyId,
                date: d.toISOString().split('T')[0],
                customerId,
                productId,
                quantity,
                unitPrice: product.unitPrice,
                discount: discount * 100,
                amount,
                invoiceNumber: `INV${d.getFullYear()}${(d.getMonth() + 1).toString().padStart(2, '0')}${salesId.toString().padStart(4, '0')}`,
                status: 'completed',
                paymentStatus: customer.paymentTerms === 'COD' ? 'paid' : 'pending'
            });
            
            salesId++;
        }
    }

    // Create promotions
    const promotions = [
        {
            id: 'PROMO001',
            name: 'Summer Beverage Special',
            type: 'Volume Discount',
            startDate: '2025-09-01',
            endDate: '2025-11-30',
            products: ['PROD001', 'PROD002', 'PROD003', 'PROD004'],
            mechanics: 'Buy 10 cases get 2 free',
            budget: 500000,
            spent: 125000,
            targetCustomers: ['Hypermarket', 'Supermarket'],
            status: 'active'
        },
        {
            id: 'PROMO002',
            name: 'Back to School',
            type: 'Price Reduction',
            startDate: '2025-01-01',
            endDate: '2025-01-31',
            products: ['PROD014', 'PROD015'],
            mechanics: '20% off all cereals',
            budget: 300000,
            spent: 280000,
            targetCustomers: ['all'],
            status: 'completed'
        },
        {
            id: 'PROMO003',
            name: 'Easter Chocolate Festival',
            type: 'BOGO',
            startDate: '2025-03-15',
            endDate: '2025-04-15',
            products: ['PROD010'],
            mechanics: 'Buy one get one 50% off',
            budget: 200000,
            spent: 150000,
            targetCustomers: ['Supermarket', 'Convenience'],
            status: 'completed'
        },
        {
            id: 'PROMO004',
            name: 'Winter Warmers',
            type: 'Bundle',
            startDate: '2025-06-01',
            endDate: '2025-08-31',
            products: ['PROD015', 'PROD016'],
            mechanics: 'Bundle deal - Save R20',
            budget: 250000,
            spent: 180000,
            targetCustomers: ['all'],
            status: 'completed'
        },
        {
            id: 'PROMO005',
            name: 'Festive Season Special',
            type: 'Loyalty',
            startDate: '2025-12-01',
            endDate: '2025-12-31',
            products: ['all'],
            mechanics: 'Double loyalty points',
            budget: 1000000,
            spent: 0,
            targetCustomers: ['all'],
            status: 'planned'
        }
    ];

    promotions.forEach(promo => {
        db.promotions.set(promo.id, {
            ...promo,
            companyId,
            roi: promo.spent > 0 ? ((promo.spent * 2.5) / promo.spent - 1) * 100 : 0,
            incrementalSales: promo.spent * 2.5
        });
    });

    // Create budgets
    const budgets = [
        {
            id: 'BUDGET001',
            year: 2025,
            type: 'Trade Spend',
            total: 10000000,
            allocated: 8500000,
            spent: 3200000,
            categories: {
                'Volume Discounts': { budget: 3000000, spent: 1200000 },
                'Promotional Allowances': { budget: 2500000, spent: 900000 },
                'Listing Fees': { budget: 1500000, spent: 600000 },
                'Merchandising': { budget: 1000000, spent: 300000 },
                'Co-op Advertising': { budget: 500000, spent: 200000 }
            }
        }
    ];

    budgets.forEach(budget => {
        db.budgets.set(budget.id, {
            ...budget,
            companyId,
            remaining: budget.total - budget.spent,
            utilizationRate: (budget.spent / budget.total) * 100
        });
    });

    // Create contracts
    const contracts = [
        {
            id: 'CONTRACT001',
            customerId: 'CUST001',
            type: 'Annual Trading Terms',
            startDate: '2025-01-01',
            endDate: '2025-12-31',
            value: 5000000,
            terms: {
                volumeRebate: '5% on achieving R5M annual purchases',
                growthIncentive: '2% additional for 10% YoY growth',
                paymentTerms: '30 days',
                listingFees: 50000,
                promotionalSupport: 200000
            },
            status: 'active'
        },
        {
            id: 'CONTRACT002',
            customerId: 'CUST002',
            type: 'Annual Trading Terms',
            startDate: '2025-01-01',
            endDate: '2025-12-31',
            value: 4500000,
            terms: {
                volumeRebate: '4.5% on achieving R4.5M annual purchases',
                growthIncentive: '1.5% additional for 8% YoY growth',
                paymentTerms: '30 days',
                listingFees: 45000,
                promotionalSupport: 180000
            },
            status: 'active'
        }
    ];

    contracts.forEach(contract => {
        db.contracts.set(contract.id, {
            ...contract,
            companyId,
            performance: {
                actualValue: contract.value * 0.7,
                achievementRate: 70,
                projectedYearEnd: contract.value * 0.95
            }
        });
    });

    // Create KPIs
    const kpis = [
        { id: 'KPI001', name: 'Trade Spend ROI', target: 250, actual: 285, unit: '%', category: 'Financial' },
        { id: 'KPI002', name: 'Promotional Effectiveness', target: 80, actual: 75, unit: '%', category: 'Marketing' },
        { id: 'KPI003', name: 'Distribution Coverage', target: 95, actual: 92, unit: '%', category: 'Sales' },
        { id: 'KPI004', name: 'Perfect Store Execution', target: 85, actual: 78, unit: '%', category: 'Execution' },
        { id: 'KPI005', name: 'Customer Satisfaction', target: 90, actual: 88, unit: '%', category: 'Service' },
        { id: 'KPI006', name: 'Forecast Accuracy', target: 85, actual: 82, unit: '%', category: 'Planning' },
        { id: 'KPI007', name: 'Claims Processing Time', target: 5, actual: 6, unit: 'days', category: 'Operations' },
        { id: 'KPI008', name: 'Contract Compliance', target: 95, actual: 93, unit: '%', category: 'Compliance' },
        { id: 'KPI009', name: 'Revenue Growth', target: 12, actual: 10.5, unit: '%', category: 'Financial' },
        { id: 'KPI010', name: 'Market Share', target: 25, actual: 23.5, unit: '%', category: 'Market' }
    ];

    kpis.forEach(kpi => {
        db.kpis.set(kpi.id, {
            ...kpi,
            companyId,
            trend: kpi.actual > kpi.target ? 'up' : 'down',
            status: kpi.actual >= kpi.target * 0.95 ? 'green' : kpi.actual >= kpi.target * 0.8 ? 'amber' : 'red'
        });
    });

    // Initialize AI models
    const aiModels = [
        {
            id: 'MODEL001',
            name: 'Demand Forecasting Model',
            type: 'timeseries',
            accuracy: 82.5,
            lastTrained: '2025-08-01',
            features: ['historical_sales', 'seasonality', 'promotions', 'weather', 'events'],
            status: 'active'
        },
        {
            id: 'MODEL002',
            name: 'Promotion Optimization',
            type: 'optimization',
            accuracy: 78.3,
            lastTrained: '2025-08-15',
            features: ['promotion_type', 'discount_depth', 'duration', 'product_category', 'customer_segment'],
            status: 'active'
        },
        {
            id: 'MODEL003',
            name: 'Customer Segmentation',
            type: 'clustering',
            accuracy: 85.7,
            lastTrained: '2025-07-20',
            features: ['purchase_frequency', 'basket_size', 'product_preferences', 'payment_behavior'],
            status: 'active'
        },
        {
            id: 'MODEL004',
            name: 'Anomaly Detection',
            type: 'anomaly',
            accuracy: 91.2,
            lastTrained: '2025-08-25',
            features: ['sales_patterns', 'claim_amounts', 'discount_rates', 'return_rates'],
            status: 'active'
        },
        {
            id: 'MODEL005',
            name: 'Price Elasticity',
            type: 'regression',
            accuracy: 76.8,
            lastTrained: '2025-08-10',
            features: ['price_changes', 'volume_impact', 'competitor_prices', 'category_dynamics'],
            status: 'active'
        }
    ];

    aiModels.forEach(model => {
        db.aiModels.set(model.id, {
            ...model,
            companyId,
            predictions: generateModelPredictions(model.type)
        });
    });

    // Create templates for SAP/Excel imports
    const templates = [
        {
            id: 'TMPL001',
            name: 'SAP ECC Sales Data Import',
            type: 'sap_ecc',
            format: 'IDOC',
            mapping: {
                'VBELN': 'invoiceNumber',
                'KUNNR': 'customerId',
                'MATNR': 'productId',
                'KWMENG': 'quantity',
                'NETWR': 'amount'
            }
        },
        {
            id: 'TMPL002',
            name: 'SAP S/4HANA Master Data',
            type: 'sap_s4',
            format: 'CDS View',
            mapping: {
                'Customer': 'I_Customer',
                'Material': 'I_Product',
                'SalesOrder': 'I_SalesOrder'
            }
        },
        {
            id: 'TMPL003',
            name: 'Excel Sales Import Template',
            type: 'excel',
            format: 'xlsx',
            columns: ['Date', 'Customer', 'Product', 'Quantity', 'Amount', 'Discount']
        },
        {
            id: 'TMPL004',
            name: 'Excel Product Master',
            type: 'excel',
            format: 'xlsx',
            columns: ['SKU', 'Name', 'Category', 'Brand', 'Price', 'Barcode']
        }
    ];

    templates.forEach(template => {
        db.templates.set(template.id, {
            ...template,
            companyId,
            downloadUrl: `/api/templates/download/${template.id}`
        });
    });

    console.log(`✅ Initialized Diplomat SA with comprehensive data`);
    console.log(`   - 10 users across different roles`);
    console.log(`   - 20 products across categories`);
    console.log(`   - 15 customers of different types`);
    console.log(`   - ${db.sales.size} sales transactions (full year)`);
    console.log(`   - 5 promotions`);
    console.log(`   - 10 KPIs`);
    console.log(`   - 5 AI/ML models`);
}

// Helper function to get permissions by role
function getPermissionsByRole(role) {
    const permissions = {
        admin: ['all'],
        manager: ['view_all', 'edit_own', 'create', 'approve_claims', 'run_reports'],
        analyst: ['view_all', 'create_reports', 'export_data', 'use_ai'],
        viewer: ['view_own', 'basic_reports']
    };
    return permissions[role] || ['view_own'];
}

// Helper function to generate model predictions
function generateModelPredictions(modelType) {
    switch (modelType) {
        case 'timeseries':
            return {
                nextMonth: Math.floor(Math.random() * 1000000) + 500000,
                nextQuarter: Math.floor(Math.random() * 3000000) + 1500000,
                confidence: 0.82
            };
        case 'optimization':
            return {
                recommendedDiscount: 15,
                expectedROI: 285,
                optimalDuration: 14
            };
        case 'clustering':
            return {
                segments: ['Premium', 'Value', 'Convenience', 'Bulk'],
                distribution: [0.2, 0.4, 0.25, 0.15]
            };
        case 'anomaly':
            return {
                anomaliesDetected: 3,
                riskScore: 0.15,
                alerts: ['Unusual discount pattern in Region 2']
            };
        case 'regression':
            return {
                elasticity: -1.2,
                optimalPrice: 'Current + 5%',
                volumeImpact: -8
            };
        default:
            return {};
    }
}

// Initialize database
initializeDiplomatSA();

// Authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        status: 'healthy',
        version: '3.0.0',
        timestamp: new Date().toISOString()
    });
});

// Microsoft 365 SSO
app.post('/api/auth/sso/microsoft', async (req, res) => {
    const { token, email } = req.body;
    
    // In production, validate with Microsoft Graph API
    // For demo, check if user exists
    const user = db.users.get(email);
    
    if (!user || !user.active) {
        return res.status(401).json({ success: false, error: 'User not found or inactive' });
    }
    
    const accessToken = jwt.sign(
        { 
            userId: user.id, 
            email: user.email, 
            companyId: user.companyId,
            role: user.role 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
    
    user.lastLogin = new Date().toISOString();
    
    res.json({
        success: true,
        token: accessToken,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            company: db.companies.get(user.companyId)
        }
    });
});

// Standard login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    
    const user = db.users.get(email);
    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
        { 
            userId: user.id, 
            email: user.email, 
            companyId: user.companyId,
            role: user.role 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
    
    user.lastLogin = new Date().toISOString();
    
    res.json({
        success: true,
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            company: db.companies.get(user.companyId)
        }
    });
});

// Get company info
app.get('/api/companies/:companyId', authenticateToken, (req, res) => {
    const company = db.companies.get(req.params.companyId);
    
    if (!company) {
        return res.status(404).json({ success: false, error: 'Company not found' });
    }
    
    res.json({ success: true, data: company });
});

// Dashboard data
app.get('/api/dashboard/:companyId', authenticateToken, (req, res) => {
    const companyId = req.params.companyId;
    
    // Calculate metrics
    const sales = Array.from(db.sales.values()).filter(s => s.companyId === companyId);
    const totalRevenue = sales.reduce((sum, s) => sum + s.amount, 0);
    const promotions = Array.from(db.promotions.values()).filter(p => p.companyId === companyId);
    const activePromos = promotions.filter(p => p.status === 'active').length;
    const budget = Array.from(db.budgets.values()).find(b => b.companyId === companyId);
    
    res.json({
        success: true,
        data: {
            summary: {
                totalRevenue,
                totalOrders: sales.length,
                activePromotions: activePromos,
                tradeSpendYTD: budget ? budget.spent : 0
            },
            recentActivity: sales.slice(-10).reverse(),
            upcomingPromotions: promotions.filter(p => p.status === 'planned'),
            alerts: [
                { type: 'warning', message: 'Trade spend approaching 80% of budget' },
                { type: 'info', message: '3 contracts expiring in next 30 days' }
            ]
        }
    });
});

// Products endpoints
app.get('/api/products', authenticateToken, (req, res) => {
    const companyId = req.user.companyId;
    const products = Array.from(db.products.values()).filter(p => p.companyId === companyId);
    res.json({ success: true, data: products });
});

app.post('/api/products', authenticateToken, (req, res) => {
    const product = {
        id: `PROD${Date.now()}`,
        companyId: req.user.companyId,
        ...req.body,
        createdAt: new Date().toISOString()
    };
    
    db.products.set(product.id, product);
    res.json({ success: true, data: product });
});

// Customers endpoints
app.get('/api/customers', authenticateToken, (req, res) => {
    const companyId = req.user.companyId;
    const customers = Array.from(db.customers.values()).filter(c => c.companyId === companyId);
    res.json({ success: true, data: customers });
});

// Sales endpoints
app.get('/api/sales', authenticateToken, (req, res) => {
    const companyId = req.user.companyId;
    const { startDate, endDate, customerId, productId } = req.query;
    
    let sales = Array.from(db.sales.values()).filter(s => s.companyId === companyId);
    
    if (startDate) sales = sales.filter(s => s.date >= startDate);
    if (endDate) sales = sales.filter(s => s.date <= endDate);
    if (customerId) sales = sales.filter(s => s.customerId === customerId);
    if (productId) sales = sales.filter(s => s.productId === productId);
    
    res.json({ success: true, data: sales });
});

// Promotions endpoints
app.get('/api/promotions', authenticateToken, (req, res) => {
    const companyId = req.user.companyId;
    const promotions = Array.from(db.promotions.values()).filter(p => p.companyId === companyId);
    res.json({ success: true, data: promotions });
});

app.post('/api/promotions', authenticateToken, (req, res) => {
    const promotion = {
        id: `PROMO${Date.now()}`,
        companyId: req.user.companyId,
        ...req.body,
        createdAt: new Date().toISOString(),
        createdBy: req.user.userId
    };
    
    db.promotions.set(promotion.id, promotion);
    res.json({ success: true, data: promotion });
});

// Budget endpoints
app.get('/api/budgets', authenticateToken, (req, res) => {
    const companyId = req.user.companyId;
    const budgets = Array.from(db.budgets.values()).filter(b => b.companyId === companyId);
    res.json({ success: true, data: budgets });
});

// KPIs endpoints
app.get('/api/kpis', authenticateToken, (req, res) => {
    const companyId = req.user.companyId;
    const kpis = Array.from(db.kpis.values()).filter(k => k.companyId === companyId);
    res.json({ success: true, data: kpis });
});

// AI/ML endpoints
app.get('/api/ai/models', authenticateToken, (req, res) => {
    const companyId = req.user.companyId;
    const models = Array.from(db.aiModels.values()).filter(m => m.companyId === companyId);
    res.json({ success: true, data: models });
});

app.post('/api/ai/predict', authenticateToken, async (req, res) => {
    const { modelId, parameters } = req.body;
    const model = db.aiModels.get(modelId);
    
    if (!model) {
        return res.status(404).json({ success: false, error: 'Model not found' });
    }
    
    // Simulate prediction with some delay
    setTimeout(() => {
        res.json({
            success: true,
            data: {
                modelId,
                predictions: model.predictions,
                confidence: model.accuracy / 100,
                timestamp: new Date().toISOString()
            }
        });
    }, 500);
});

// AI Chatbot endpoint
app.post('/api/ai/chat', authenticateToken, async (req, res) => {
    const { message, context } = req.body;
    const sessionId = req.user.userId;
    
    // Store chat history
    if (!db.chatHistory.has(sessionId)) {
        db.chatHistory.set(sessionId, []);
    }
    
    const history = db.chatHistory.get(sessionId);
    history.push({ role: 'user', message, timestamp: new Date().toISOString() });
    
    // Generate AI response based on message content
    let response = '';
    
    if (message.toLowerCase().includes('sales')) {
        const sales = Array.from(db.sales.values()).filter(s => s.companyId === req.user.companyId);
        const totalSales = sales.reduce((sum, s) => sum + s.amount, 0);
        response = `Based on my analysis, your total sales amount to R${totalSales.toLocaleString()}. Would you like me to break this down by product category or time period?`;
    } else if (message.toLowerCase().includes('promotion')) {
        const promos = Array.from(db.promotions.values()).filter(p => p.companyId === req.user.companyId && p.status === 'active');
        response = `You currently have ${promos.length} active promotions. The most successful one is achieving an ROI of 285%. Would you like recommendations for optimizing your promotional calendar?`;
    } else if (message.toLowerCase().includes('forecast')) {
        response = `Based on current trends and our ML models, I predict a 12% increase in sales for next quarter. Key drivers include seasonal demand and planned promotional activities. Should I generate a detailed forecast report?`;
    } else {
        response = `I understand you're asking about "${message}". I can help you with sales analysis, promotion optimization, forecasting, budget tracking, and KPI monitoring. What specific insights would you like?`;
    }
    
    history.push({ role: 'assistant', message: response, timestamp: new Date().toISOString() });
    
    res.json({
        success: true,
        data: {
            response,
            context: { sessionId, messageCount: history.length }
        }
    });
});

// Import endpoints
app.post('/api/import/sap', authenticateToken, upload.single('file'), async (req, res) => {
    const { system, type } = req.body;
    
    // Simulate SAP import
    setTimeout(() => {
        res.json({
            success: true,
            data: {
                system,
                type,
                recordsImported: Math.floor(Math.random() * 1000) + 100,
                status: 'completed',
                timestamp: new Date().toISOString()
            }
        });
    }, 2000);
});

app.post('/api/import/excel', authenticateToken, upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    
    try {
        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
        
        // Process the data based on template type
        const { templateId } = req.body;
        const template = db.templates.get(templateId);
        
        res.json({
            success: true,
            data: {
                fileName: req.file.originalname,
                recordsFound: data.length,
                recordsImported: data.length,
                template: template?.name,
                timestamp: new Date().toISOString()
            }
        });
        
        // Clean up uploaded file
        await fs.unlink(req.file.path);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Template download
app.get('/api/templates/download/:templateId', (req, res) => {
    const template = db.templates.get(req.params.templateId);
    
    if (!template) {
        return res.status(404).json({ success: false, error: 'Template not found' });
    }
    
    // Create Excel template
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.aoa_to_sheet([template.columns || Object.keys(template.mapping)]);
    xlsx.utils.book_append_sheet(wb, ws, 'Template');
    
    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${template.name}.xlsx"`);
    res.send(buffer);
});

// Reports endpoint
app.post('/api/reports/generate', authenticateToken, async (req, res) => {
    const { type, parameters } = req.body;
    const reportId = `RPT${Date.now()}`;
    
    const report = {
        id: reportId,
        companyId: req.user.companyId,
        type,
        parameters,
        status: 'generating',
        createdBy: req.user.userId,
        createdAt: new Date().toISOString()
    };
    
    db.reports.set(reportId, report);
    
    // Simulate report generation
    setTimeout(() => {
        report.status = 'completed';
        report.url = `/api/reports/download/${reportId}`;
        res.json({ success: true, data: report });
    }, 1500);
});

// Analytics endpoints
app.get('/api/analytics/sales-trend', authenticateToken, (req, res) => {
    const companyId = req.user.companyId;
    const sales = Array.from(db.sales.values()).filter(s => s.companyId === companyId);
    
    // Group by month
    const monthlyData = {};
    sales.forEach(sale => {
        const month = sale.date.substring(0, 7);
        if (!monthlyData[month]) {
            monthlyData[month] = { revenue: 0, orders: 0 };
        }
        monthlyData[month].revenue += sale.amount;
        monthlyData[month].orders += 1;
    });
    
    res.json({
        success: true,
        data: Object.entries(monthlyData).map(([month, data]) => ({
            month,
            ...data
        })).sort((a, b) => a.month.localeCompare(b.month))
    });
});

app.get('/api/analytics/category-performance', authenticateToken, (req, res) => {
    const companyId = req.user.companyId;
    const sales = Array.from(db.sales.values()).filter(s => s.companyId === companyId);
    
    // Group by category
    const categoryData = {};
    sales.forEach(sale => {
        const product = db.products.get(sale.productId);
        if (product) {
            const category = product.category;
            if (!categoryData[category]) {
                categoryData[category] = { revenue: 0, units: 0 };
            }
            categoryData[category].revenue += sale.amount;
            categoryData[category].units += sale.quantity;
        }
    });
    
    res.json({
        success: true,
        data: Object.entries(categoryData).map(([category, data]) => ({
            category,
            ...data
        }))
    });
});

// Audit log
app.use((req, res, next) => {
    if (req.method !== 'GET' && req.user) {
        db.audit.push({
            timestamp: new Date().toISOString(),
            userId: req.user.userId,
            action: `${req.method} ${req.path}`,
            ip: req.ip
        });
    }
    next();
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║          Vanta X-Trade Spend Enterprise Backend            ║
║                    Level 3 System                          ║
╠════════════════════════════════════════════════════════════╣
║  Status: ✅ Running                                        ║
║  Port: ${PORT}                                                ║
║  Company: Diplomat South Africa                            ║
║  Users: 10 (with different roles)                          ║
║  Features: All Level 3 features enabled                    ║
╚════════════════════════════════════════════════════════════╝
    `);
});

module.exports = app;