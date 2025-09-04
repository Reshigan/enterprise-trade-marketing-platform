#!/usr/bin/env node

/**
 * Vanta X-Trade Spend Level 5 Enterprise Backend
 * Advanced Trade Promotion Management System
 * Version: 5.0.0
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
const { EventEmitter } = require('events');

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');

// Event emitter for real-time updates
const eventBus = new EventEmitter();

// Middleware
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// File upload configuration
const upload = multer({ 
    dest: '/tmp/uploads/',
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Advanced in-memory database with comprehensive TPM data
const db = {
    // Core entities
    companies: new Map(),
    users: new Map(),
    sessions: new Map(),
    products: new Map(),
    customers: new Map(),
    sales: new Map(),
    
    // TPM specific
    promotions: new Map(),
    promotionMechanics: new Map(),
    activityGrid: new Map(),
    budgets: new Map(),
    claims: new Map(),
    settlements: new Map(),
    contracts: new Map(),
    rebates: new Map(),
    
    // Pricing
    priceLists: new Map(),
    priceHistory: new Map(),
    elasticityModels: new Map(),
    competitorPrices: new Map(),
    
    // Planning
    scenarios: new Map(),
    forecasts: new Map(),
    baselines: new Map(),
    cannibalization: new Map(),
    
    // Analytics
    kpis: new Map(),
    scorecards: new Map(),
    alerts: new Map(),
    reports: new Map(),
    
    // AI/ML
    aiModels: new Map(),
    predictions: new Map(),
    insights: new Map(),
    recommendations: new Map(),
    chatHistory: new Map(),
    
    // Integration
    templates: new Map(),
    integrations: new Map(),
    dataFlows: new Map(),
    
    // Audit & Compliance
    audit: [],
    approvalWorkflows: new Map(),
    complianceRules: new Map()
};

// Initialize comprehensive Diplomat SA data
function initializeDiplomatSA() {
    const companyId = 'diplomat-sa';
    
    // Create company with Level 5 features
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
                },
                powerbi: { enabled: true, workspace: 'diplomat-tpm' },
                teams: { enabled: true, webhook: 'https://teams.webhook.url' }
            },
            features: {
                level: 5,
                advancedPricing: true,
                activityGrid: true,
                scenarioPlanning: true,
                settlementEngine: true,
                aiInsights: true,
                predictiveAnalytics: true,
                collaborativePlanning: true,
                mobileApps: true
            },
            approvalLimits: {
                promotion: { level1: 100000, level2: 500000, level3: 1000000 },
                claim: { level1: 50000, level2: 250000, level3: 500000 },
                pricing: { level1: 5, level2: 10, level3: 15 } // percentage
            }
        },
        licenses: {
            total: 50,
            used: 25,
            roles: {
                admin: 3,
                keyAccountManager: 8,
                tradeMarketingManager: 5,
                analyst: 6,
                approver: 3
            }
        }
    });

    // Create comprehensive user base
    const users = [
        // Administrators
        { id: 'admin1', name: 'John Smith', email: 'john.smith@diplomat.co.za', role: 'admin', department: 'IT' },
        { id: 'admin2', name: 'Sarah Johnson', email: 'sarah.johnson@diplomat.co.za', role: 'admin', department: 'Finance' },
        { id: 'admin3', name: 'Peter Chen', email: 'peter.chen@diplomat.co.za', role: 'admin', department: 'Operations' },
        
        // Key Account Managers
        { id: 'kam1', name: 'Michael Brown', email: 'michael.brown@diplomat.co.za', role: 'keyAccountManager', accounts: ['CUST001', 'CUST002'] },
        { id: 'kam2', name: 'Lisa Davis', email: 'lisa.davis@diplomat.co.za', role: 'keyAccountManager', accounts: ['CUST003', 'CUST004'] },
        { id: 'kam3', name: 'David Wilson', email: 'david.wilson@diplomat.co.za', role: 'keyAccountManager', accounts: ['CUST005', 'CUST006'] },
        { id: 'kam4', name: 'Jennifer Taylor', email: 'jennifer.taylor@diplomat.co.za', role: 'keyAccountManager', accounts: ['CUST007', 'CUST008'] },
        { id: 'kam5', name: 'Robert Anderson', email: 'robert.anderson@diplomat.co.za', role: 'keyAccountManager', accounts: ['CUST009', 'CUST010'] },
        
        // Trade Marketing Managers
        { id: 'tmm1', name: 'Emma Martinez', email: 'emma.martinez@diplomat.co.za', role: 'tradeMarketingManager', categories: ['Beverages'] },
        { id: 'tmm2', name: 'James Rodriguez', email: 'james.rodriguez@diplomat.co.za', role: 'tradeMarketingManager', categories: ['Snacks'] },
        { id: 'tmm3', name: 'Olivia Garcia', email: 'olivia.garcia@diplomat.co.za', role: 'tradeMarketingManager', categories: ['Personal Care'] },
        
        // Analysts
        { id: 'analyst1', name: 'William Lee', email: 'william.lee@diplomat.co.za', role: 'analyst', specialization: 'pricing' },
        { id: 'analyst2', name: 'Sophia Kim', email: 'sophia.kim@diplomat.co.za', role: 'analyst', specialization: 'promotions' },
        { id: 'analyst3', name: 'Daniel Park', email: 'daniel.park@diplomat.co.za', role: 'analyst', specialization: 'forecasting' },
        
        // Approvers
        { id: 'approver1', name: 'Charles Thompson', email: 'charles.thompson@diplomat.co.za', role: 'approver', level: 3 },
        { id: 'approver2', name: 'Patricia White', email: 'patricia.white@diplomat.co.za', role: 'approver', level: 2 }
    ];

    users.forEach(user => {
        db.users.set(user.email, {
            ...user,
            companyId,
            password: bcrypt.hashSync('Demo123!', 10),
            active: true,
            lastLogin: new Date().toISOString(),
            permissions: getPermissionsByRole(user.role),
            preferences: {
                dashboard: 'executive',
                notifications: true,
                language: 'en',
                timezone: 'Africa/Johannesburg'
            }
        });
    });

    // Create comprehensive product hierarchy
    const productHierarchy = {
        'Beverages': {
            'Soft Drinks': {
                'Cola': ['Coca-Cola 330ml', 'Coca-Cola 1L', 'Coca-Cola Zero 330ml'],
                'Clear': ['Sprite 330ml', 'Sprite 1L', 'Sprite Zero 330ml'],
                'Flavored': ['Fanta Orange 330ml', 'Fanta Grape 330ml', 'Fanta Pineapple 330ml']
            },
            'Beer': {
                'Lager': ['Castle Lager 340ml', 'Castle Lite 340ml', 'Hansa Pilsener 340ml'],
                'Premium': ['Heineken 330ml', 'Amstel 330ml', 'Corona 355ml']
            },
            'Energy': {
                'Standard': ['Red Bull 250ml', 'Monster 500ml', 'Play Energy 440ml'],
                'Sugar Free': ['Red Bull Zero 250ml', 'Monster Zero 500ml']
            }
        },
        'Snacks': {
            'Chips': {
                'Potato': ['Lays Original 125g', 'Lays Salt & Vinegar 125g', 'Simba Chips 125g'],
                'Corn': ['Doritos Cheese 150g', 'Doritos Sweet Chilli 150g'],
                'Extruded': ['NikNaks 135g', 'Cheese Curls 120g']
            },
            'Chocolate': {
                'Bars': ['KitKat 4 Finger', 'Lunch Bar 48g', 'Bar One 55g'],
                'Slabs': ['Cadbury Dairy Milk 80g', 'Nestle Aero 85g', 'Beacon TV Bar 47g']
            }
        },
        'Personal Care': {
            'Oral Care': {
                'Toothpaste': ['Colgate Total 100ml', 'Aquafresh 100ml', 'Sensodyne 75ml'],
                'Mouthwash': ['Listerine Cool Mint 250ml', 'Colgate Plax 250ml']
            },
            'Hair Care': {
                'Shampoo': ['Head & Shoulders 200ml', 'Pantene 200ml', 'Sunsilk 200ml'],
                'Conditioner': ['Pantene Conditioner 200ml', 'TRESemmé Conditioner 200ml']
            }
        }
    };

    // Create products with advanced attributes
    let productId = 1;
    const products = [];
    
    Object.entries(productHierarchy).forEach(([category, subcategories]) => {
        Object.entries(subcategories).forEach(([subcategory, types]) => {
            Object.entries(types).forEach(([type, items]) => {
                items.forEach(name => {
                    const product = {
                        id: `PROD${productId.toString().padStart(3, '0')}`,
                        name,
                        category,
                        subcategory,
                        type,
                        brand: name.split(' ')[0],
                        sku: `SKU${productId.toString().padStart(5, '0')}`,
                        barcode: `600${Math.floor(Math.random() * 1000000000)}`,
                        companyId,
                        // Pricing attributes
                        basePrice: Math.floor(Math.random() * 50) + 10,
                        currentPrice: 0, // Will be calculated
                        marginTarget: 0.25,
                        vat: 0.15,
                        // Pack configuration
                        unitSize: name.match(/\d+(?:ml|g|L)/)?.[0] || '100g',
                        unitsPerCase: 12,
                        casesPerPallet: 48,
                        // Supply chain
                        leadTime: Math.floor(Math.random() * 7) + 3,
                        moq: 100,
                        safetyStock: 500,
                        // Performance metrics
                        velocityRank: Math.floor(Math.random() * 100) + 1,
                        profitability: Math.random() * 0.3 + 0.1,
                        // Attributes
                        attributes: {
                            launchDate: '2024-01-01',
                            lifecycle: 'mature',
                            strategic: Math.random() > 0.7,
                            promotional: true,
                            seasonal: category === 'Beverages' && subcategory === 'Beer'
                        }
                    };
                    
                    product.currentPrice = product.basePrice * (1 + product.marginTarget) * (1 + product.vat);
                    products.push(product);
                    productId++;
                });
            });
        });
    });

    products.forEach(product => {
        db.products.set(product.id, product);
    });

    // Create customer hierarchy with channels
    const customerChannels = {
        'Modern Trade': {
            'Hypermarket': [
                { name: 'Pick n Pay Sandton', chain: 'Pick n Pay', tier: 'A', region: 'Gauteng' },
                { name: 'Checkers Hyper Fourways', chain: 'Checkers', tier: 'A', region: 'Gauteng' },
                { name: 'Game Menlyn', chain: 'Game', tier: 'A', region: 'Gauteng' }
            ],
            'Supermarket': [
                { name: 'Woolworths V&A', chain: 'Woolworths', tier: 'A', region: 'Western Cape' },
                { name: 'Spar Rosebank', chain: 'Spar', tier: 'B', region: 'Gauteng' },
                { name: 'Food Lovers Durban North', chain: 'Food Lovers', tier: 'B', region: 'KwaZulu-Natal' }
            ]
        },
        'Traditional Trade': {
            'Wholesale': [
                { name: 'Makro Woodmead', chain: 'Makro', tier: 'A', region: 'Gauteng' },
                { name: 'Cash & Carry Germiston', chain: 'Independent', tier: 'C', region: 'Gauteng' }
            ],
            'Spaza': [
                { name: 'Sipho General Dealer', chain: 'Independent', tier: 'D', region: 'Gauteng' },
                { name: 'Mama Joyce Shop', chain: 'Independent', tier: 'D', region: 'Gauteng' }
            ]
        },
        'Convenience': {
            'Forecourt': [
                { name: 'Engen QuickShop N1', chain: 'Engen', tier: 'B', region: 'Gauteng' },
                { name: 'Shell Select Sandton', chain: 'Shell', tier: 'B', region: 'Gauteng' }
            ],
            'Pharmacy': [
                { name: 'Clicks Sandton City', chain: 'Clicks', tier: 'A', region: 'Gauteng' },
                { name: 'Dischem Centurion', chain: 'Dischem', tier: 'A', region: 'Gauteng' }
            ]
        }
    };

    let customerId = 1;
    Object.entries(customerChannels).forEach(([channel, types]) => {
        Object.entries(types).forEach(([type, stores]) => {
            stores.forEach(store => {
                const customer = {
                    id: `CUST${customerId.toString().padStart(3, '0')}`,
                    ...store,
                    companyId,
                    channel,
                    type,
                    accountNumber: `ACC${customerId.toString().padStart(6, '0')}`,
                    // Financial
                    creditLimit: store.tier === 'A' ? 1000000 : store.tier === 'B' ? 500000 : store.tier === 'C' ? 200000 : 50000,
                    paymentTerms: store.tier === 'D' ? 'COD' : store.tier === 'C' ? '15 days' : '30 days',
                    yearlyTarget: store.tier === 'A' ? 10000000 : store.tier === 'B' ? 5000000 : store.tier === 'C' ? 2000000 : 500000,
                    // Store attributes
                    storeSize: store.tier === 'A' ? 'Large' : store.tier === 'B' ? 'Medium' : 'Small',
                    numberOfCheckouts: store.tier === 'A' ? 20 : store.tier === 'B' ? 10 : 5,
                    footfall: store.tier === 'A' ? 5000 : store.tier === 'B' ? 2000 : 500,
                    // Location
                    coordinates: {
                        lat: -26.2041 + (Math.random() - 0.5) * 2,
                        lng: 28.0473 + (Math.random() - 0.5) * 2
                    },
                    // Performance
                    compliance: Math.random() * 0.2 + 0.8,
                    growthRate: Math.random() * 0.3 - 0.1,
                    profitability: Math.random() * 0.2 + 0.1,
                    // Capabilities
                    capabilities: {
                        gondolaEnd: store.tier === 'A' || store.tier === 'B',
                        secondaryDisplay: store.tier === 'A',
                        digitalScreens: store.tier === 'A',
                        loyaltyProgram: channel === 'Modern Trade',
                        ecommerce: store.chain === 'Woolworths' || store.chain === 'Pick n Pay'
                    }
                };
                
                db.customers.set(customer.id, customer);
                customerId++;
            });
        });
    });

    // Create promotion mechanics
    const mechanics = [
        { id: 'MECH001', name: 'Buy X Get Y Free', type: 'volume', calculation: 'stepped' },
        { id: 'MECH002', name: 'Percentage Off', type: 'price', calculation: 'linear' },
        { id: 'MECH003', name: 'Fixed Amount Off', type: 'price', calculation: 'fixed' },
        { id: 'MECH004', name: 'Bundle Deal', type: 'bundle', calculation: 'group' },
        { id: 'MECH005', name: 'Loyalty Points', type: 'loyalty', calculation: 'points' },
        { id: 'MECH006', name: 'Cash Back', type: 'rebate', calculation: 'percentage' },
        { id: 'MECH007', name: 'Gift with Purchase', type: 'premium', calculation: 'threshold' },
        { id: 'MECH008', name: 'Competition Entry', type: 'engagement', calculation: 'entry' }
    ];

    mechanics.forEach(mech => {
        db.promotionMechanics.set(mech.id, {
            ...mech,
            companyId,
            rules: generateMechanicRules(mech.type),
            restrictions: generateMechanicRestrictions(mech.type)
        });
    });

    // Create comprehensive promotions with activity grid
    const promotions = [
        {
            id: 'PROMO001',
            name: 'Summer Refresh Campaign',
            type: 'National',
            status: 'active',
            mechanicId: 'MECH001',
            startDate: '2025-09-01',
            endDate: '2025-11-30',
            products: ['PROD001', 'PROD002', 'PROD003', 'PROD004'],
            customers: ['CUST001', 'CUST002', 'CUST003'],
            // Financial
            budget: 2000000,
            spent: 450000,
            committed: 800000,
            // Targets
            volumeTarget: 100000,
            revenueTarget: 5000000,
            incrementalTarget: 20,
            // Performance
            volumeActual: 35000,
            revenueActual: 1750000,
            incrementalActual: 18,
            roi: 2.8,
            // Activity details
            activities: [
                {
                    week: '2025-W36',
                    customerId: 'CUST001',
                    productId: 'PROD001',
                    mechanic: 'Buy 10 Get 2 Free',
                    investment: 50000,
                    display: 'Gondola End',
                    expectedVolume: 5000
                }
            ]
        }
    ];

    promotions.forEach(promo => {
        db.promotions.set(promo.id, {
            ...promo,
            companyId,
            createdBy: 'tmm1',
            approvalStatus: 'approved',
            approvedBy: 'approver1',
            approvedDate: '2025-08-15'
        });
    });

    // Create activity grid (52 weeks x products x customers)
    const currentYear = 2025;
    for (let week = 1; week <= 52; week++) {
        const weekId = `${currentYear}-W${week.toString().padStart(2, '0')}`;
        
        // Sample activities for key customers
        ['CUST001', 'CUST002', 'CUST003'].forEach(customerId => {
            const customer = db.customers.get(customerId);
            
            // Plan 2-3 activities per month
            if (week % 2 === 0) {
                const activity = {
                    id: `ACT${currentYear}${week}${customerId}`,
                    weekId,
                    customerId,
                    companyId,
                    status: week < 36 ? 'completed' : week === 36 ? 'active' : 'planned',
                    activities: []
                };
                
                // Add product activities
                const numActivities = Math.floor(Math.random() * 3) + 1;
                for (let i = 0; i < numActivities; i++) {
                    const productId = `PROD${Math.floor(Math.random() * 30) + 1}`.padStart(7, '0');
                    const product = db.products.get(productId);
                    
                    if (product) {
                        activity.activities.push({
                            productId,
                            promotionId: week < 36 ? 'PROMO001' : null,
                            mechanicId: mechanics[Math.floor(Math.random() * mechanics.length)].id,
                            displayType: customer.tier === 'A' ? 'Gondola End' : 'Shelf',
                            investment: customer.tier === 'A' ? 20000 : 10000,
                            targetVolume: Math.floor(Math.random() * 1000) + 500,
                            actualVolume: week < 36 ? Math.floor(Math.random() * 1200) + 400 : null
                        });
                    }
                }
                
                db.activityGrid.set(activity.id, activity);
            }
        });
    }

    // Create price lists and history
    const priceListTypes = ['Standard', 'Promotional', 'Contract', 'Regional'];
    
    priceListTypes.forEach(type => {
        const priceListId = `PL${type.toUpperCase()}`;
        const priceList = {
            id: priceListId,
            name: `${type} Price List`,
            type,
            companyId,
            effectiveFrom: '2025-01-01',
            effectiveTo: '2025-12-31',
            status: 'active',
            items: []
        };
        
        // Add prices for all products
        products.forEach(product => {
            const basePrice = product.basePrice;
            let price = basePrice;
            
            // Adjust price based on type
            if (type === 'Promotional') {
                price = basePrice * 0.85; // 15% discount
            } else if (type === 'Contract') {
                price = basePrice * 0.9; // 10% discount
            } else if (type === 'Regional') {
                price = basePrice * (0.95 + Math.random() * 0.1); // Regional variation
            }
            
            priceList.items.push({
                productId: product.id,
                price,
                minQuantity: type === 'Contract' ? 100 : 1,
                maxQuantity: type === 'Promotional' ? 1000 : null
            });
        });
        
        db.priceLists.set(priceListId, priceList);
    });

    // Create elasticity models
    products.forEach(product => {
        const elasticity = {
            id: `ELAST${product.id}`,
            productId: product.id,
            companyId,
            baseElasticity: -1.2 + Math.random() * 0.8, // Between -1.2 and -0.4
            crossElasticity: {},
            seasonalFactors: {
                Q1: 0.9,
                Q2: 1.1,
                Q3: 1.2,
                Q4: 0.8
            },
            competitorImpact: 0.3,
            promoLift: 2.5,
            lastUpdated: '2025-08-01'
        };
        
        // Add cross-elasticity for related products
        if (product.subcategory === 'Soft Drinks') {
            products.filter(p => p.subcategory === 'Soft Drinks' && p.id !== product.id)
                .slice(0, 3)
                .forEach(p => {
                    elasticity.crossElasticity[p.id] = 0.2 + Math.random() * 0.3;
                });
        }
        
        db.elasticityModels.set(elasticity.id, elasticity);
    });

    // Create budgets with detailed allocation
    const budgetCategories = [
        { name: 'Trade Spend', total: 50000000 },
        { name: 'Consumer Promotions', total: 20000000 },
        { name: 'Shopper Marketing', total: 15000000 },
        { name: 'Digital Marketing', total: 10000000 }
    ];

    budgetCategories.forEach((cat, index) => {
        const budget = {
            id: `BUDGET${(index + 1).toString().padStart(3, '0')}`,
            companyId,
            name: cat.name,
            year: 2025,
            total: cat.total,
            allocated: 0,
            committed: 0,
            spent: 0,
            // Quarterly breakdown
            quarters: {
                Q1: { budget: cat.total * 0.2, spent: cat.total * 0.18 },
                Q2: { budget: cat.total * 0.3, spent: cat.total * 0.25 },
                Q3: { budget: cat.total * 0.3, spent: cat.total * 0.15 },
                Q4: { budget: cat.total * 0.2, spent: 0 }
            },
            // Channel allocation
            channels: {
                'Modern Trade': 0.6,
                'Traditional Trade': 0.25,
                'Convenience': 0.15
            },
            // Category allocation
            categories: {
                'Beverages': 0.5,
                'Snacks': 0.3,
                'Personal Care': 0.2
            }
        };
        
        // Calculate totals
        budget.spent = Object.values(budget.quarters).reduce((sum, q) => sum + q.spent, 0);
        budget.committed = budget.spent * 1.2;
        budget.allocated = budget.committed * 1.1;
        
        db.budgets.set(budget.id, budget);
    });

    // Create claims and settlements
    let claimId = 1;
    ['CUST001', 'CUST002', 'CUST003'].forEach(customerId => {
        for (let month = 1; month <= 8; month++) {
            const claim = {
                id: `CLAIM${claimId.toString().padStart(6, '0')}`,
                companyId,
                customerId,
                promotionId: 'PROMO001',
                claimDate: `2025-${month.toString().padStart(2, '0')}-15`,
                period: `2025-${month.toString().padStart(2, '0')}`,
                // Claim details
                type: 'Off-Invoice',
                amount: Math.floor(Math.random() * 100000) + 50000,
                status: month < 7 ? 'settled' : month === 7 ? 'approved' : 'submitted',
                // Supporting documents
                documents: [
                    { type: 'invoice', number: `INV${claimId}`, amount: 0 },
                    { type: 'proof_of_performance', verified: true }
                ],
                // Settlement
                settlementId: month < 7 ? `SETT${claimId}` : null,
                settlementDate: month < 7 ? `2025-${month.toString().padStart(2, '0')}-25` : null,
                // Audit trail
                submittedBy: 'kam1',
                submittedDate: `2025-${month.toString().padStart(2, '0')}-10`,
                approvedBy: month < 8 ? 'approver2' : null,
                approvedDate: month < 8 ? `2025-${month.toString().padStart(2, '0')}-12` : null
            };
            
            claim.documents[0].amount = claim.amount;
            db.claims.set(claim.id, claim);
            
            // Create settlement if settled
            if (claim.settlementId) {
                db.settlements.set(claim.settlementId, {
                    id: claim.settlementId,
                    claimId: claim.id,
                    companyId,
                    amount: claim.amount * 0.95, // 5% deduction
                    method: 'Credit Note',
                    reference: `CN${claimId}`,
                    date: claim.settlementDate,
                    status: 'completed'
                });
            }
            
            claimId++;
        }
    });

    // Create contracts with detailed terms
    const contractTypes = ['Annual Trading Terms', 'Promotional Agreement', 'Category Agreement'];
    
    let contractId = 1;
    ['CUST001', 'CUST002', 'CUST003', 'CUST004', 'CUST005'].forEach(customerId => {
        const customer = db.customers.get(customerId);
        const contract = {
            id: `CONTRACT${contractId.toString().padStart(3, '0')}`,
            companyId,
            customerId,
            type: contractTypes[contractId % 3],
            status: 'active',
            startDate: '2025-01-01',
            endDate: '2025-12-31',
            // Financial terms
            annualValue: customer.yearlyTarget,
            minimumCommitment: customer.yearlyTarget * 0.8,
            // Rebate structure
            rebates: [
                { threshold: 0.8, rate: 0.02 },
                { threshold: 1.0, rate: 0.03 },
                { threshold: 1.2, rate: 0.05 }
            ],
            // Trading terms
            terms: {
                paymentTerms: customer.paymentTerms,
                creditLimit: customer.creditLimit,
                listingFees: customer.tier === 'A' ? 100000 : 50000,
                promotionalSupport: customer.tier === 'A' ? 500000 : 200000,
                growthTarget: 0.1,
                spaceAllocation: customer.tier === 'A' ? 'Premium' : 'Standard'
            },
            // Performance
            performance: {
                ytdValue: customer.yearlyTarget * 0.65,
                ytdGrowth: 0.08,
                forecastValue: customer.yearlyTarget * 0.98,
                complianceScore: 0.92
            },
            // Approval
            approvedBy: 'approver1',
            approvedDate: '2024-12-15',
            nextReview: '2025-06-30'
        };
        
        db.contracts.set(contract.id, contract);
        contractId++;
    });

    // Create comprehensive KPIs
    const kpiCategories = {
        'Financial': [
            { name: 'Trade Spend ROI', target: 300, unit: '%', frequency: 'monthly' },
            { name: 'Net Revenue Growth', target: 12, unit: '%', frequency: 'monthly' },
            { name: 'Gross Margin', target: 25, unit: '%', frequency: 'monthly' },
            { name: 'Working Capital Days', target: 45, unit: 'days', frequency: 'monthly' }
        ],
        'Commercial': [
            { name: 'Promotional Effectiveness', target: 85, unit: '%', frequency: 'weekly' },
            { name: 'Baseline Lift', target: 15, unit: '%', frequency: 'weekly' },
            { name: 'Incremental Volume', target: 20, unit: '%', frequency: 'weekly' },
            { name: 'Price Realization', target: 95, unit: '%', frequency: 'daily' }
        ],
        'Execution': [
            { name: 'Perfect Store Score', target: 90, unit: '%', frequency: 'weekly' },
            { name: 'On-Shelf Availability', target: 98, unit: '%', frequency: 'daily' },
            { name: 'Promotion Compliance', target: 95, unit: '%', frequency: 'weekly' },
            { name: 'Claims Processing Time', target: 5, unit: 'days', frequency: 'daily' }
        ],
        'Customer': [
            { name: 'Customer Satisfaction', target: 90, unit: '%', frequency: 'monthly' },
            { name: 'Account Profitability', target: 15, unit: '%', frequency: 'monthly' },
            { name: 'Share of Shelf', target: 30, unit: '%', frequency: 'monthly' },
            { name: 'Joint Business Plan Achievement', target: 90, unit: '%', frequency: 'quarterly' }
        ]
    };

    let kpiId = 1;
    Object.entries(kpiCategories).forEach(([category, kpis]) => {
        kpis.forEach(kpi => {
            const actual = kpi.target * (0.85 + Math.random() * 0.3);
            const kpiData = {
                id: `KPI${kpiId.toString().padStart(3, '0')}`,
                companyId,
                category,
                ...kpi,
                actual,
                variance: ((actual - kpi.target) / kpi.target * 100).toFixed(1),
                trend: Math.random() > 0.5 ? 'up' : 'down',
                status: actual >= kpi.target * 0.95 ? 'green' : actual >= kpi.target * 0.8 ? 'amber' : 'red',
                // Historical data
                history: generateKPIHistory(kpi.frequency),
                // Drill-down dimensions
                dimensions: {
                    channel: generateDimensionData(['Modern Trade', 'Traditional Trade', 'Convenience']),
                    region: generateDimensionData(['Gauteng', 'Western Cape', 'KwaZulu-Natal']),
                    category: generateDimensionData(['Beverages', 'Snacks', 'Personal Care'])
                }
            };
            
            db.kpis.set(kpiData.id, kpiData);
            kpiId++;
        });
    });

    // Create advanced AI models
    const aiModels = [
        {
            id: 'MODEL001',
            name: 'TPM Optimization Engine',
            type: 'optimization',
            version: '3.2',
            accuracy: 87.5,
            features: ['promo_mechanics', 'pricing', 'seasonality', 'competition', 'weather', 'events'],
            capabilities: ['scenario_planning', 'what_if_analysis', 'constraint_optimization'],
            lastTrained: '2025-08-20',
            nextTraining: '2025-09-20',
            status: 'active'
        },
        {
            id: 'MODEL002',
            name: 'Demand Sensing AI',
            type: 'forecasting',
            version: '2.8',
            accuracy: 91.2,
            features: ['pos_data', 'weather', 'social_sentiment', 'economic_indicators', 'events'],
            capabilities: ['short_term_forecast', 'anomaly_detection', 'demand_transfer'],
            lastTrained: '2025-08-25',
            nextTraining: '2025-09-25',
            status: 'active'
        },
        {
            id: 'MODEL003',
            name: 'Price Optimization AI',
            type: 'pricing',
            version: '2.5',
            accuracy: 84.3,
            features: ['elasticity', 'competition', 'inventory', 'margin_targets', 'volume_targets'],
            capabilities: ['dynamic_pricing', 'competitive_response', 'markdown_optimization'],
            lastTrained: '2025-08-15',
            nextTraining: '2025-09-15',
            status: 'active'
        },
        {
            id: 'MODEL004',
            name: 'Customer Insights AI',
            type: 'segmentation',
            version: '3.0',
            accuracy: 88.7,
            features: ['purchase_behavior', 'demographics', 'store_attributes', 'loyalty_data'],
            capabilities: ['micro_segmentation', 'propensity_scoring', 'churn_prediction'],
            lastTrained: '2025-08-18',
            nextTraining: '2025-09-18',
            status: 'active'
        },
        {
            id: 'MODEL005',
            name: 'Promotion Effectiveness AI',
            type: 'attribution',
            version: '2.3',
            accuracy: 82.9,
            features: ['promo_data', 'media_spend', 'competitor_activity', 'store_execution'],
            capabilities: ['roi_attribution', 'cannibalization_analysis', 'halo_effect'],
            lastTrained: '2025-08-22',
            nextTraining: '2025-09-22',
            status: 'active'
        },
        {
            id: 'MODEL006',
            name: 'Supply Chain AI',
            type: 'optimization',
            version: '1.8',
            accuracy: 86.4,
            features: ['inventory_levels', 'lead_times', 'demand_forecast', 'service_levels'],
            capabilities: ['inventory_optimization', 'allocation_planning', 'risk_assessment'],
            lastTrained: '2025-08-10',
            nextTraining: '2025-09-10',
            status: 'active'
        },
        {
            id: 'MODEL007',
            name: 'Trade Investment AI',
            type: 'allocation',
            version: '2.1',
            accuracy: 85.6,
            features: ['customer_potential', 'roi_history', 'market_share', 'growth_targets'],
            capabilities: ['budget_allocation', 'investment_optimization', 'scenario_comparison'],
            lastTrained: '2025-08-12',
            nextTraining: '2025-09-12',
            status: 'active'
        },
        {
            id: 'MODEL008',
            name: 'Insights Bot NLP',
            type: 'nlp',
            version: '4.0',
            accuracy: 92.3,
            features: ['context_understanding', 'domain_knowledge', 'multi_language', 'sentiment'],
            capabilities: ['natural_conversation', 'complex_queries', 'actionable_insights', 'learning'],
            lastTrained: '2025-08-28',
            nextTraining: '2025-09-28',
            status: 'active'
        }
    ];

    aiModels.forEach(model => {
        db.aiModels.set(model.id, {
            ...model,
            companyId,
            performance: generateModelPerformance(model.type),
            predictions: generateModelPredictions(model.type),
            recommendations: generateModelRecommendations(model.type)
        });
    });

    // Create scenarios for planning
    const scenarios = [
        {
            id: 'SCEN001',
            name: 'Aggressive Growth',
            type: 'annual_plan',
            status: 'draft',
            assumptions: {
                marketGrowth: 0.08,
                priceIncrease: 0.05,
                promoInvestment: 1.2,
                competitorResponse: 'moderate'
            },
            targets: {
                revenue: 1200000000,
                volume: 50000000,
                share: 28
            }
        },
        {
            id: 'SCEN002',
            name: 'Margin Focus',
            type: 'annual_plan',
            status: 'approved',
            assumptions: {
                marketGrowth: 0.05,
                priceIncrease: 0.08,
                promoInvestment: 0.8,
                competitorResponse: 'aggressive'
            },
            targets: {
                revenue: 1100000000,
                volume: 45000000,
                share: 25
            }
        }
    ];

    scenarios.forEach(scenario => {
        db.scenarios.set(scenario.id, {
            ...scenario,
            companyId,
            createdBy: 'analyst3',
            createdDate: '2025-07-15',
            simulations: generateScenarioSimulations(scenario)
        });
    });

    // Initialize real-time insights
    generateRealTimeInsights();

    console.log(`✅ Initialized Diplomat SA Level 5 System`);
    console.log(`   - ${users.length} users across advanced roles`);
    console.log(`   - ${products.length} products with full hierarchy`);
    console.log(`   - ${customerId - 1} customers across channels`);
    console.log(`   - ${db.activityGrid.size} activity grid entries`);
    console.log(`   - ${aiModels.length} AI/ML models`);
    console.log(`   - ${Object.keys(kpiCategories).reduce((sum, cat) => sum + kpiCategories[cat].length, 0)} KPIs`);
}

// Helper functions
function getPermissionsByRole(role) {
    const permissions = {
        admin: ['all'],
        keyAccountManager: [
            'view_accounts', 'edit_accounts', 'create_promotions', 'view_claims',
            'submit_claims', 'view_contracts', 'view_analytics', 'use_ai'
        ],
        tradeMarketingManager: [
            'view_all', 'edit_promotions', 'approve_promotions_l1', 'manage_budgets',
            'view_analytics', 'create_scenarios', 'use_ai'
        ],
        analyst: [
            'view_all', 'create_reports', 'export_data', 'use_ai', 'create_scenarios',
            'view_models', 'run_simulations'
        ],
        approver: [
            'view_all', 'approve_promotions', 'approve_claims', 'approve_pricing',
            'view_analytics', 'override_limits'
        ]
    };
    return permissions[role] || ['view_own'];
}

function generateMechanicRules(type) {
    const rules = {
        volume: {
            tiers: [
                { min: 10, free: 1 },
                { min: 20, free: 3 },
                { min: 50, free: 10 }
            ],
            maxRedemptions: 1000
        },
        price: {
            discount: 0.15,
            maxDiscount: 100,
            minPurchase: 100
        },
        bundle: {
            products: 3,
            discount: 0.2,
            fixedPrice: null
        },
        loyalty: {
            pointsEarned: 10,
            pointsMultiplier: 2,
            minSpend: 50
        }
    };
    return rules[type] || {};
}

function generateMechanicRestrictions(type) {
    return {
        customerTypes: ['all'],
        regions: ['all'],
        dayOfWeek: ['all'],
        timeOfDay: null,
        combinable: type !== 'volume',
        maxPerCustomer: type === 'volume' ? 5 : null
    };
}

function generateKPIHistory(frequency) {
    const periods = frequency === 'daily' ? 30 : frequency === 'weekly' ? 12 : 12;
    const history = [];
    
    for (let i = periods; i > 0; i--) {
        history.push({
            period: i,
            value: 80 + Math.random() * 20,
            target: 90
        });
    }
    
    return history;
}

function generateDimensionData(dimensions) {
    const data = {};
    dimensions.forEach(dim => {
        data[dim] = {
            value: 70 + Math.random() * 30,
            trend: Math.random() > 0.5 ? 'up' : 'down'
        };
    });
    return data;
}

function generateModelPerformance(type) {
    return {
        mape: 5 + Math.random() * 10, // Mean Absolute Percentage Error
        rmse: 1000 + Math.random() * 2000, // Root Mean Square Error
        r2: 0.8 + Math.random() * 0.15, // R-squared
        precision: 0.85 + Math.random() * 0.1,
        recall: 0.8 + Math.random() * 0.15,
        f1Score: 0.82 + Math.random() * 0.13
    };
}

function generateModelPredictions(type) {
    const predictions = {
        optimization: {
            optimalPromoMix: [
                { product: 'PROD001', mechanic: 'MECH001', investment: 100000, roi: 3.2 },
                { product: 'PROD005', mechanic: 'MECH002', investment: 80000, roi: 2.8 }
            ],
            budgetAllocation: {
                'Modern Trade': 0.55,
                'Traditional Trade': 0.30,
                'Convenience': 0.15
            },
            expectedOutcome: {
                incrementalRevenue: 5000000,
                incrementalVolume: 200000,
                roi: 2.9
            }
        },
        forecasting: {
            nextWeek: { volume: 125000, revenue: 3100000, confidence: 0.92 },
            nextMonth: { volume: 520000, revenue: 12800000, confidence: 0.87 },
            nextQuarter: { volume: 1600000, revenue: 39500000, confidence: 0.78 },
            alerts: ['Potential stockout for PROD003 in Week 38']
        },
        pricing: {
            recommendations: [
                { product: 'PROD001', currentPrice: 15.99, optimalPrice: 16.49, volumeImpact: -5, revenueImpact: 3 },
                { product: 'PROD007', currentPrice: 24.99, optimalPrice: 23.99, volumeImpact: 8, revenueImpact: 5 }
            ],
            elasticityUpdate: true,
            competitivePosition: 'maintain'
        }
    };
    
    return predictions[type] || predictions.optimization;
}

function generateModelRecommendations(type) {
    const recommendations = {
        optimization: [
            {
                priority: 'high',
                action: 'Increase investment in Modern Trade by 15%',
                impact: 'Expected ROI improvement of 0.4 points',
                confidence: 0.88
            },
            {
                priority: 'medium',
                action: 'Shift Q4 budget from Traditional to Convenience channel',
                impact: 'Projected 8% increase in effectiveness',
                confidence: 0.75
            }
        ],
        forecasting: [
            {
                priority: 'high',
                action: 'Increase safety stock for high-velocity SKUs',
                impact: 'Reduce stockout risk by 60%',
                confidence: 0.91
            }
        ],
        pricing: [
            {
                priority: 'high',
                action: 'Implement 3% price increase on premium products',
                impact: 'Margin improvement of 2.1% with minimal volume loss',
                confidence: 0.83
            }
        ]
    };
    
    return recommendations[type] || recommendations.optimization;
}

function generateScenarioSimulations(scenario) {
    return {
        monthlyProjections: Array.from({ length: 12 }, (_, i) => ({
            month: i + 1,
            revenue: scenario.targets.revenue / 12 * (0.9 + Math.random() * 0.2),
            volume: scenario.targets.volume / 12 * (0.9 + Math.random() * 0.2),
            spend: scenario.targets.revenue * 0.08 / 12
        })),
        sensitivity: {
            priceElasticity: { low: -5, base: 0, high: 8 },
            volumeResponse: { low: -10, base: 0, high: 15 },
            competitorImpact: { low: -3, base: 0, high: 5 }
        },
        risks: [
            { factor: 'Competitor price war', probability: 0.3, impact: -5 },
            { factor: 'Supply chain disruption', probability: 0.2, impact: -8 }
        ]
    };
}

function generateRealTimeInsights() {
    const insights = [
        {
            id: 'INSIGHT001',
            type: 'anomaly',
            severity: 'high',
            title: 'Unusual sales spike detected',
            description: 'Sales for PROD003 in Gauteng increased by 150% compared to baseline',
            timestamp: new Date().toISOString(),
            actionable: true,
            actions: ['Investigate cause', 'Check inventory levels', 'Verify pricing']
        },
        {
            id: 'INSIGHT002',
            type: 'opportunity',
            severity: 'medium',
            title: 'Cross-sell opportunity identified',
            description: 'Customers buying PROD001 have 75% likelihood to purchase PROD007',
            timestamp: new Date().toISOString(),
            actionable: true,
            actions: ['Create bundle promotion', 'Update planograms']
        },
        {
            id: 'INSIGHT003',
            type: 'risk',
            severity: 'high',
            title: 'Budget overrun risk',
            description: 'Current spend trajectory will exceed Q3 budget by 12%',
            timestamp: new Date().toISOString(),
            actionable: true,
            actions: ['Review upcoming promotions', 'Defer non-critical activities']
        }
    ];
    
    insights.forEach(insight => {
        db.insights.set(insight.id, {
            ...insight,
            companyId: 'diplomat-sa',
            acknowledged: false,
            assignedTo: null
        });
    });
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

// Advanced API Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        status: 'healthy',
        version: '5.0.0',
        level: 'Enterprise Level 5',
        timestamp: new Date().toISOString()
    });
});

// Authentication endpoints
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
            role: user.role,
            permissions: user.permissions
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
            company: db.companies.get(user.companyId),
            preferences: user.preferences
        }
    });
});

// Activity Grid endpoints
app.get('/api/activity-grid', authenticateToken, (req, res) => {
    const { weekStart, weekEnd, customerId, productId } = req.query;
    const companyId = req.user.companyId;
    
    let activities = Array.from(db.activityGrid.values())
        .filter(a => a.companyId === companyId);
    
    if (weekStart) activities = activities.filter(a => a.weekId >= weekStart);
    if (weekEnd) activities = activities.filter(a => a.weekId <= weekEnd);
    if (customerId) activities = activities.filter(a => a.customerId === customerId);
    
    if (productId) {
        activities = activities.map(a => ({
            ...a,
            activities: a.activities.filter(act => act.productId === productId)
        })).filter(a => a.activities.length > 0);
    }
    
    res.json({ success: true, data: activities });
});

app.post('/api/activity-grid', authenticateToken, (req, res) => {
    const activity = {
        id: `ACT${Date.now()}`,
        companyId: req.user.companyId,
        ...req.body,
        createdBy: req.user.userId,
        createdAt: new Date().toISOString()
    };
    
    db.activityGrid.set(activity.id, activity);
    
    // Trigger planning optimization
    eventBus.emit('activity-created', activity);
    
    res.json({ success: true, data: activity });
});

// Pricing Engine endpoints
app.get('/api/pricing/recommendations', authenticateToken, async (req, res) => {
    const { productId, customerId, scenario } = req.query;
    
    // Get AI pricing recommendations
    const pricingModel = Array.from(db.aiModels.values())
        .find(m => m.type === 'pricing');
    
    if (!pricingModel) {
        return res.status(404).json({ success: false, error: 'Pricing model not found' });
    }
    
    const recommendations = pricingModel.predictions.recommendations;
    
    // Filter by product if specified
    let filtered = productId 
        ? recommendations.filter(r => r.product === productId)
        : recommendations;
    
    // Apply customer-specific pricing if specified
    if (customerId) {
        const customer = db.customers.get(customerId);
        filtered = filtered.map(r => ({
            ...r,
            customerPrice: r.optimalPrice * (1 - (customer.tier === 'A' ? 0.05 : 0))
        }));
    }
    
    res.json({ 
        success: true, 
        data: {
            recommendations: filtered,
            model: {
                id: pricingModel.id,
                accuracy: pricingModel.accuracy,
                lastUpdated: pricingModel.lastTrained
            }
        }
    });
});

app.post('/api/pricing/simulate', authenticateToken, async (req, res) => {
    const { changes, duration } = req.body;
    
    // Simulate price changes
    const simulation = {
        id: `SIM${Date.now()}`,
        changes,
        duration,
        impact: {
            revenue: changes.reduce((sum, c) => sum + (c.revenueImpact || 0), 0),
            volume: changes.reduce((sum, c) => sum + (c.volumeImpact || 0), 0),
            margin: changes.reduce((sum, c) => sum + (c.marginImpact || 0), 0)
        },
        risks: [],
        opportunities: []
    };
    
    // Analyze competitive response
    if (simulation.impact.revenue > 5) {
        simulation.risks.push({
            type: 'competitive_response',
            probability: 0.7,
            impact: -2
        });
    }
    
    res.json({ success: true, data: simulation });
});

// Scenario Planning endpoints
app.get('/api/scenarios', authenticateToken, (req, res) => {
    const companyId = req.user.companyId;
    const scenarios = Array.from(db.scenarios.values())
        .filter(s => s.companyId === companyId);
    
    res.json({ success: true, data: scenarios });
});

app.post('/api/scenarios', authenticateToken, (req, res) => {
    const scenario = {
        id: `SCEN${Date.now()}`,
        companyId: req.user.companyId,
        ...req.body,
        createdBy: req.user.userId,
        createdDate: new Date().toISOString(),
        status: 'draft'
    };
    
    // Generate simulations
    scenario.simulations = generateScenarioSimulations(scenario);
    
    db.scenarios.set(scenario.id, scenario);
    res.json({ success: true, data: scenario });
});

app.post('/api/scenarios/:id/compare', authenticateToken, (req, res) => {
    const { compareWith } = req.body;
    const scenario1 = db.scenarios.get(req.params.id);
    const scenario2 = db.scenarios.get(compareWith);
    
    if (!scenario1 || !scenario2) {
        return res.status(404).json({ success: false, error: 'Scenario not found' });
    }
    
    const comparison = {
        scenarios: [scenario1, scenario2],
        differences: {
            revenue: scenario1.targets.revenue - scenario2.targets.revenue,
            volume: scenario1.targets.volume - scenario2.targets.volume,
            investment: (scenario1.assumptions.promoInvestment - scenario2.assumptions.promoInvestment) * 100
        },
        recommendation: scenario1.targets.revenue > scenario2.targets.revenue ? scenario1.id : scenario2.id
    };
    
    res.json({ success: true, data: comparison });
});

// Settlement Engine endpoints
app.get('/api/claims', authenticateToken, (req, res) => {
    const { status, customerId, dateFrom, dateTo } = req.query;
    const companyId = req.user.companyId;
    
    let claims = Array.from(db.claims.values())
        .filter(c => c.companyId === companyId);
    
    if (status) claims = claims.filter(c => c.status === status);
    if (customerId) claims = claims.filter(c => c.customerId === customerId);
    if (dateFrom) claims = claims.filter(c => c.claimDate >= dateFrom);
    if (dateTo) claims = claims.filter(c => c.claimDate <= dateTo);
    
    // Add customer and promotion details
    claims = claims.map(claim => ({
        ...claim,
        customer: db.customers.get(claim.customerId),
        promotion: db.promotions.get(claim.promotionId)
    }));
    
    res.json({ success: true, data: claims });
});

app.post('/api/claims', authenticateToken, (req, res) => {
    const claim = {
        id: `CLAIM${Date.now()}`,
        companyId: req.user.companyId,
        ...req.body,
        status: 'submitted',
        submittedBy: req.user.userId,
        submittedDate: new Date().toISOString()
    };
    
    db.claims.set(claim.id, claim);
    
    // Trigger approval workflow
    eventBus.emit('claim-submitted', claim);
    
    res.json({ success: true, data: claim });
});

app.post('/api/claims/:id/approve', authenticateToken, (req, res) => {
    const claim = db.claims.get(req.params.id);
    
    if (!claim) {
        return res.status(404).json({ success: false, error: 'Claim not found' });
    }
    
    // Check approval limits
    const user = db.users.get(req.user.email);
    const approvalLimit = getApprovalLimit(user.role, 'claim');
    
    if (claim.amount > approvalLimit) {
        return res.status(403).json({ 
            success: false, 
            error: `Claim amount exceeds your approval limit of R${approvalLimit}` 
        });
    }
    
    claim.status = 'approved';
    claim.approvedBy = req.user.userId;
    claim.approvedDate = new Date().toISOString();
    
    // Create settlement
    const settlement = {
        id: `SETT${Date.now()}`,
        claimId: claim.id,
        companyId: claim.companyId,
        amount: claim.amount * 0.95, // 5% processing fee
        method: 'Credit Note',
        reference: `CN${Date.now()}`,
        date: new Date().toISOString(),
        status: 'pending'
    };
    
    db.settlements.set(settlement.id, settlement);
    claim.settlementId = settlement.id;
    
    res.json({ success: true, data: { claim, settlement } });
});

// Advanced Analytics endpoints
app.get('/api/analytics/tpm-dashboard', authenticateToken, async (req, res) => {
    const companyId = req.user.companyId;
    
    // Calculate comprehensive TPM metrics
    const promotions = Array.from(db.promotions.values())
        .filter(p => p.companyId === companyId);
    
    const claims = Array.from(db.claims.values())
        .filter(c => c.companyId === companyId);
    
    const budgets = Array.from(db.budgets.values())
        .filter(b => b.companyId === companyId);
    
    const totalBudget = budgets.reduce((sum, b) => sum + b.total, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    const totalCommitted = budgets.reduce((sum, b) => sum + b.committed, 0);
    
    const activePromos = promotions.filter(p => p.status === 'active');
    const avgROI = activePromos.reduce((sum, p) => sum + p.roi, 0) / activePromos.length;
    
    const pendingClaims = claims.filter(c => c.status === 'submitted').length;
    const claimsValue = claims.filter(c => c.status === 'submitted')
        .reduce((sum, c) => sum + c.amount, 0);
    
    res.json({
        success: true,
        data: {
            budget: {
                total: totalBudget,
                committed: totalCommitted,
                spent: totalSpent,
                available: totalBudget - totalCommitted,
                utilization: (totalSpent / totalBudget * 100).toFixed(1)
            },
            promotions: {
                active: activePromos.length,
                planned: promotions.filter(p => p.status === 'planned').length,
                completed: promotions.filter(p => p.status === 'completed').length,
                avgROI: avgROI.toFixed(1)
            },
            claims: {
                pending: pendingClaims,
                pendingValue: claimsValue,
                processed: claims.filter(c => c.status === 'settled').length,
                avgProcessingTime: 5.2
            },
            effectiveness: {
                incrementalRevenue: activePromos.reduce((sum, p) => sum + p.revenueActual, 0),
                incrementalVolume: activePromos.reduce((sum, p) => sum + p.volumeActual, 0),
                baselineGrowth: 8.5
            }
        }
    });
});

app.get('/api/analytics/price-elasticity', authenticateToken, (req, res) => {
    const { productId, period } = req.query;
    const companyId = req.user.companyId;
    
    const elasticities = Array.from(db.elasticityModels.values())
        .filter(e => e.companyId === companyId);
    
    if (productId) {
        const model = elasticities.find(e => e.productId === productId);
        if (!model) {
            return res.status(404).json({ success: false, error: 'Elasticity model not found' });
        }
        
        res.json({ 
            success: true, 
            data: {
                model,
                product: db.products.get(productId),
                recommendations: generateElasticityRecommendations(model)
            }
        });
    } else {
        res.json({ success: true, data: elasticities });
    }
});

// AI Insights Bot endpoints
app.post('/api/ai/insights-bot', authenticateToken, async (req, res) => {
    const { query, context, conversationId } = req.body;
    const sessionId = conversationId || `CONV${Date.now()}`;
    
    // Get NLP model
    const nlpModel = Array.from(db.aiModels.values())
        .find(m => m.type === 'nlp');
    
    if (!nlpModel) {
        return res.status(500).json({ success: false, error: 'NLP model not available' });
    }
    
    // Store query in history
    if (!db.chatHistory.has(sessionId)) {
        db.chatHistory.set(sessionId, []);
    }
    
    const history = db.chatHistory.get(sessionId);
    history.push({ 
        role: 'user', 
        message: query, 
        timestamp: new Date().toISOString() 
    });
    
    // Process query and generate insights
    const insights = await processNLPQuery(query, context, req.user);
    
    history.push({ 
        role: 'assistant', 
        message: insights.response, 
        data: insights.data,
        timestamp: new Date().toISOString() 
    });
    
    res.json({
        success: true,
        data: {
            conversationId: sessionId,
            response: insights.response,
            data: insights.data,
            suggestions: insights.suggestions,
            actions: insights.actions
        }
    });
});

// Real-time insights stream
app.get('/api/insights/stream', authenticateToken, (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });
    
    const sendInsight = (insight) => {
        res.write(`data: ${JSON.stringify(insight)}\n\n`);
    };
    
    // Send existing insights
    db.insights.forEach(insight => {
        if (!insight.acknowledged) {
            sendInsight(insight);
        }
    });
    
    // Listen for new insights
    const insightHandler = (insight) => sendInsight(insight);
    eventBus.on('new-insight', insightHandler);
    
    // Clean up on disconnect
    req.on('close', () => {
        eventBus.off('new-insight', insightHandler);
    });
});

// Helper functions for advanced features
function getApprovalLimit(role, type) {
    const limits = {
        approver: { claim: 500000, promotion: 1000000, pricing: 15 },
        tradeMarketingManager: { claim: 50000, promotion: 100000, pricing: 5 },
        keyAccountManager: { claim: 10000, promotion: 50000, pricing: 0 }
    };
    
    return limits[role]?.[type] || 0;
}

function generateElasticityRecommendations(model) {
    return [
        {
            action: 'Optimal price point',
            detail: `Current elasticity of ${model.baseElasticity.toFixed(2)} suggests optimal price increase of 3-5%`,
            impact: 'Revenue increase of 2.5% with minimal volume loss'
        },
        {
            action: 'Promotional depth',
            detail: 'Reduce discount depth from 20% to 15% for better margin',
            impact: 'Improve promotion ROI by 0.5 points'
        }
    ];
}

async function processNLPQuery(query, context, user) {
    const lowerQuery = query.toLowerCase();
    
    // Analyze query intent
    if (lowerQuery.includes('promotion') && lowerQuery.includes('performance')) {
        const promotions = Array.from(db.promotions.values())
            .filter(p => p.companyId === user.companyId && p.status === 'active');
        
        const avgROI = promotions.reduce((sum, p) => sum + p.roi, 0) / promotions.length;
        
        return {
            response: `Your active promotions are delivering an average ROI of ${avgROI.toFixed(1)}%. The top performer is "${promotions[0]?.name}" with ${promotions[0]?.roi}% ROI. Would you like me to analyze what's driving this performance?`,
            data: {
                promotions: promotions.slice(0, 3),
                metrics: { avgROI, count: promotions.length }
            },
            suggestions: [
                'Show me underperforming promotions',
                'What can we learn from top performers?',
                'Optimize promotion calendar'
            ],
            actions: [
                { label: 'View Details', action: 'navigate', target: '/promotions' },
                { label: 'Run Optimization', action: 'optimize', target: 'promotions' }
            ]
        };
    } else if (lowerQuery.includes('budget') || lowerQuery.includes('spend')) {
        const budgets = Array.from(db.budgets.values())
            .filter(b => b.companyId === user.companyId);
        
        const totalBudget = budgets.reduce((sum, b) => sum + b.total, 0);
        const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
        const utilization = (totalSpent / totalBudget * 100).toFixed(1);
        
        return {
            response: `You've spent R${(totalSpent/1000000).toFixed(1)}M of your R${(totalBudget/1000000).toFixed(1)}M budget (${utilization}% utilization). You have R${((totalBudget-totalSpent)/1000000).toFixed(1)}M remaining. The highest spend category is "${budgets[0]?.name}". Should I show you optimization opportunities?`,
            data: {
                budgets,
                summary: { total: totalBudget, spent: totalSpent, utilization }
            },
            suggestions: [
                'Show spend by category',
                'Forecast year-end position',
                'Find savings opportunities'
            ],
            actions: [
                { label: 'Budget Dashboard', action: 'navigate', target: '/budgets' },
                { label: 'Reallocation Tool', action: 'tool', target: 'budget-optimizer' }
            ]
        };
    } else if (lowerQuery.includes('price') || lowerQuery.includes('elasticity')) {
        return {
            response: `Based on our price elasticity models, I've identified 5 products where price optimization could increase revenue by 3-7% without significant volume loss. The models show an average elasticity of -1.2, indicating moderate price sensitivity. Would you like to see specific recommendations?`,
            data: {
                elasticity: { average: -1.2, range: [-1.8, -0.6] },
                opportunities: 5
            },
            suggestions: [
                'Show price recommendations',
                'Run price simulation',
                'Compare with competitors'
            ],
            actions: [
                { label: 'Price Optimizer', action: 'navigate', target: '/pricing' },
                { label: 'Run Simulation', action: 'tool', target: 'price-simulator' }
            ]
        };
    } else {
        // General response
        return {
            response: `I can help you with promotion performance, budget optimization, pricing strategies, and more. What specific area would you like to explore?`,
            data: {},
            suggestions: [
                'Show me promotion performance',
                'Analyze my budget utilization',
                'What are my top opportunities?'
            ],
            actions: [
                { label: 'Dashboard', action: 'navigate', target: '/dashboard' }
            ]
        };
    }
}

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
║        Vanta X-Trade Spend Level 5 Enterprise Backend      ║
║                  Advanced TPM System                       ║
╠════════════════════════════════════════════════════════════╣
║  Status: ✅ Running                                        ║
║  Port: ${PORT}                                                ║
║  Level: 5 (Full Enterprise)                                ║
║  Company: Diplomat South Africa                            ║
║  Features: All advanced TPM features enabled               ║
╚════════════════════════════════════════════════════════════╝
    `);
});

module.exports = app;