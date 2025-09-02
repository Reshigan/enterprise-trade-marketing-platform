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
            logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiMzQjgyRjYiLz4KPHRleHQgeD0iMjAiIHk9IjI1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiPkQ8L3RleHQ+Cjwvc3ZnPgo=',
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
            logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNGNTk0MzEiLz4KPHRleHQgeD0iMjAiIHk9IjI1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiPlA8L3RleHQ+Cjwvc3ZnPgo=',
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
            logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiMxMEI5ODEiLz4KPHRleHQgeD0iMjAiIHk9IjI1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiPlI8L3RleHQ+Cjwvc3ZnPgo=',
            settings: {
                theme: 'green',
                language: 'en-AU',
                timezone: 'Australia/Sydney',
                dateFormat: 'DD/MM/YYYY',
                currency: 'AUD'
            }
        }
    },
    users: {
        'diplomat-sa': [
            { id: 1, username: 'james.morrison', email: 'james.morrison@diplomat-sa.com', fullName: 'James Morrison', role: 'CEO', department: 'Executive', isActive: true },
            { id: 2, username: 'sarah.chen', email: 'sarah.chen@diplomat-sa.com', fullName: 'Sarah Chen', role: 'CFO', department: 'Finance', isActive: true },
            { id: 3, username: 'michael.rodriguez', email: 'michael.rodriguez@diplomat-sa.com', fullName: 'Michael Rodriguez', role: 'CMO', department: 'Marketing', isActive: true },
            { id: 4, username: 'emily.johnson', email: 'emily.johnson@diplomat-sa.com', fullName: 'Emily Johnson', role: 'Sales Director', department: 'Sales', isActive: true },
            { id: 5, username: 'david.thompson', email: 'david.thompson@diplomat-sa.com', fullName: 'David Thompson', role: 'Trade Marketing Manager', department: 'Marketing', isActive: true },
            { id: 6, username: 'lisa.anderson', email: 'lisa.anderson@diplomat-sa.com', fullName: 'Lisa Anderson', role: 'Field Sales Manager', department: 'Sales', isActive: true },
            { id: 7, username: 'robert.kim', email: 'robert.kim@diplomat-sa.com', fullName: 'Robert Kim', role: 'Data Analyst', department: 'Analytics', isActive: true },
            { id: 8, username: 'jennifer.walsh', email: 'jennifer.walsh@diplomat-sa.com', fullName: 'Jennifer Walsh', role: 'Supply Chain Manager', department: 'Operations', isActive: true },
            { id: 9, username: 'christopher.lee', email: 'christopher.lee@diplomat-sa.com', fullName: 'Christopher Lee', role: 'Finance Manager', department: 'Finance', isActive: true },
            { id: 10, username: 'amanda.garcia', email: 'amanda.garcia@diplomat-sa.com', fullName: 'Amanda Garcia', role: 'IT Administrator', department: 'IT', isActive: true }
        ],
        'premium-brands': [
            { id: 11, username: 'john.smith', email: 'john.smith@premium-brands.com', fullName: 'John Smith', role: 'CEO', department: 'Executive', isActive: true },
            { id: 12, username: 'maria.gonzalez', email: 'maria.gonzalez@premium-brands.com', fullName: 'Maria Gonzalez', role: 'CFO', department: 'Finance', isActive: true },
            { id: 13, username: 'alex.brown', email: 'alex.brown@premium-brands.com', fullName: 'Alex Brown', role: 'CMO', department: 'Marketing', isActive: true },
            { id: 14, username: 'jessica.davis', email: 'jessica.davis@premium-brands.com', fullName: 'Jessica Davis', role: 'Sales Director', department: 'Sales', isActive: true },
            { id: 15, username: 'ryan.wilson', email: 'ryan.wilson@premium-brands.com', fullName: 'Ryan Wilson', role: 'Trade Marketing Manager', department: 'Marketing', isActive: true },
            { id: 16, username: 'nicole.taylor', email: 'nicole.taylor@premium-brands.com', fullName: 'Nicole Taylor', role: 'Field Sales Manager', department: 'Sales', isActive: true },
            { id: 17, username: 'kevin.moore', email: 'kevin.moore@premium-brands.com', fullName: 'Kevin Moore', role: 'Data Analyst', department: 'Analytics', isActive: true },
            { id: 18, username: 'stephanie.clark', email: 'stephanie.clark@premium-brands.com', fullName: 'Stephanie Clark', role: 'Supply Chain Manager', department: 'Operations', isActive: true },
            { id: 19, username: 'daniel.lewis', email: 'daniel.lewis@premium-brands.com', fullName: 'Daniel Lewis', role: 'Finance Manager', department: 'Finance', isActive: true },
            { id: 20, username: 'rachel.white', email: 'rachel.white@premium-brands.com', fullName: 'Rachel White', role: 'IT Administrator', department: 'IT', isActive: true }
        ],
        'regional-dist': [
            { id: 21, username: 'andrew.miller', email: 'andrew.miller@regional-dist.com', fullName: 'Andrew Miller', role: 'CEO', department: 'Executive', isActive: true },
            { id: 22, username: 'sophie.jones', email: 'sophie.jones@regional-dist.com', fullName: 'Sophie Jones', role: 'CFO', department: 'Finance', isActive: true },
            { id: 23, username: 'mark.williams', email: 'mark.williams@regional-dist.com', fullName: 'Mark Williams', role: 'CMO', department: 'Marketing', isActive: true },
            { id: 24, username: 'laura.martin', email: 'laura.martin@regional-dist.com', fullName: 'Laura Martin', role: 'Sales Director', department: 'Sales', isActive: true },
            { id: 25, username: 'peter.jackson', email: 'peter.jackson@regional-dist.com', fullName: 'Peter Jackson', role: 'Trade Marketing Manager', department: 'Marketing', isActive: true },
            { id: 26, username: 'emma.thompson', email: 'emma.thompson@regional-dist.com', fullName: 'Emma Thompson', role: 'Field Sales Manager', department: 'Sales', isActive: true },
            { id: 27, username: 'james.harris', email: 'james.harris@regional-dist.com', fullName: 'James Harris', role: 'Data Analyst', department: 'Analytics', isActive: true },
            { id: 28, username: 'olivia.robinson', email: 'olivia.robinson@regional-dist.com', fullName: 'Olivia Robinson', role: 'Supply Chain Manager', department: 'Operations', isActive: true },
            { id: 29, username: 'william.walker', email: 'william.walker@regional-dist.com', fullName: 'William Walker', role: 'Finance Manager', department: 'Finance', isActive: true },
            { id: 30, username: 'grace.hall', email: 'grace.hall@regional-dist.com', fullName: 'Grace Hall', role: 'IT Administrator', department: 'IT', isActive: true }
        ]
    },
    products: {
        'diplomat-sa': [
            { id: 1, sku: 'DIP-001', name: 'Premium Vodka', category: 'Spirits', brand: 'Diplomat', price: 45.99, cost: 25.00, margin: 45.65, stock: 150, minStock: 20, status: 'active' },
            { id: 2, sku: 'DIP-002', name: 'Craft Gin', category: 'Spirits', brand: 'Diplomat', price: 38.50, cost: 22.00, margin: 42.86, stock: 120, minStock: 15, status: 'active' },
            { id: 3, sku: 'DIP-003', name: 'Single Malt Whisky', category: 'Spirits', brand: 'Diplomat', price: 89.99, cost: 55.00, margin: 38.89, stock: 80, minStock: 10, status: 'active' },
            { id: 4, sku: 'DIP-004', name: 'Premium Rum', category: 'Spirits', brand: 'Diplomat', price: 52.75, cost: 30.00, margin: 43.13, stock: 95, minStock: 12, status: 'active' },
            { id: 5, sku: 'DIP-005', name: 'Artisan Tequila', category: 'Spirits', brand: 'Diplomat', price: 67.50, cost: 40.00, margin: 40.74, stock: 70, minStock: 8, status: 'active' },
            { id: 6, sku: 'DIP-006', name: 'Champagne', category: 'Wine', brand: 'Diplomat', price: 125.00, cost: 75.00, margin: 40.00, stock: 45, minStock: 5, status: 'active' },
            { id: 7, sku: 'DIP-007', name: 'Chardonnay', category: 'Wine', brand: 'Diplomat', price: 28.99, cost: 18.00, margin: 37.94, stock: 200, minStock: 25, status: 'active' },
            { id: 8, sku: 'DIP-008', name: 'Cabernet Sauvignon', category: 'Wine', brand: 'Diplomat', price: 32.50, cost: 20.00, margin: 38.46, stock: 180, minStock: 20, status: 'active' },
            { id: 9, sku: 'DIP-009', name: 'Premium Lager', category: 'Beer', brand: 'Diplomat', price: 4.99, cost: 2.50, margin: 49.90, stock: 500, minStock: 50, status: 'active' },
            { id: 10, sku: 'DIP-010', name: 'Craft IPA', category: 'Beer', brand: 'Diplomat', price: 6.25, cost: 3.50, margin: 44.00, stock: 300, minStock: 30, status: 'active' }
        ],
        'premium-brands': [
            { id: 11, sku: 'PB-001', name: 'Luxury Cognac', category: 'Spirits', brand: 'Premium', price: 199.99, cost: 120.00, margin: 40.00, stock: 60, minStock: 8, status: 'active' },
            { id: 12, sku: 'PB-002', name: 'Aged Bourbon', category: 'Spirits', brand: 'Premium', price: 75.50, cost: 45.00, margin: 40.40, stock: 90, minStock: 12, status: 'active' },
            { id: 13, sku: 'PB-003', name: 'Premium Scotch', category: 'Spirits', brand: 'Premium', price: 95.00, cost: 58.00, margin: 38.95, stock: 75, minStock: 10, status: 'active' },
            { id: 14, sku: 'PB-004', name: 'Artisan Mezcal', category: 'Spirits', brand: 'Premium', price: 85.75, cost: 52.00, margin: 39.33, stock: 55, minStock: 8, status: 'active' },
            { id: 15, sku: 'PB-005', name: 'Vintage Port', category: 'Wine', brand: 'Premium', price: 145.00, cost: 90.00, margin: 37.93, stock: 40, minStock: 5, status: 'active' },
            { id: 16, sku: 'PB-006', name: 'Reserve Pinot Noir', category: 'Wine', brand: 'Premium', price: 42.99, cost: 26.00, margin: 39.53, stock: 120, minStock: 15, status: 'active' },
            { id: 17, sku: 'PB-007', name: 'Craft Stout', category: 'Beer', brand: 'Premium', price: 8.50, cost: 4.75, margin: 44.12, stock: 250, minStock: 25, status: 'active' },
            { id: 18, sku: 'PB-008', name: 'Wheat Beer', category: 'Beer', brand: 'Premium', price: 5.75, cost: 3.25, margin: 43.48, stock: 400, minStock: 40, status: 'active' },
            { id: 19, sku: 'PB-009', name: 'Energy Drink', category: 'Non-Alcoholic', brand: 'Premium', price: 3.99, cost: 1.80, margin: 54.89, stock: 800, minStock: 100, status: 'active' },
            { id: 20, sku: 'PB-010', name: 'Premium Water', category: 'Non-Alcoholic', brand: 'Premium', price: 2.50, cost: 1.00, margin: 60.00, stock: 1000, minStock: 150, status: 'active' }
        ],
        'regional-dist': [
            { id: 21, sku: 'RD-001', name: 'Local Lager', category: 'Beer', brand: 'Regional', price: 3.75, cost: 2.00, margin: 46.67, stock: 600, minStock: 75, status: 'active' },
            { id: 22, sku: 'RD-002', name: 'Light Beer', category: 'Beer', brand: 'Regional', price: 3.50, cost: 1.90, margin: 45.71, stock: 550, minStock: 70, status: 'active' },
            { id: 23, sku: 'RD-003', name: 'Cola', category: 'Soft Drinks', brand: 'Regional', price: 1.99, cost: 0.80, margin: 59.80, stock: 1200, minStock: 200, status: 'active' },
            { id: 24, sku: 'RD-004', name: 'Lemon Soda', category: 'Soft Drinks', brand: 'Regional', price: 1.75, cost: 0.70, margin: 60.00, stock: 1000, minStock: 150, status: 'active' },
            { id: 25, sku: 'RD-005', name: 'Orange Juice', category: 'Juices', brand: 'Regional', price: 4.25, cost: 2.50, margin: 41.18, stock: 300, minStock: 40, status: 'active' },
            { id: 26, sku: 'RD-006', name: 'Apple Juice', category: 'Juices', brand: 'Regional', price: 3.99, cost: 2.30, margin: 42.36, stock: 280, minStock: 35, status: 'active' },
            { id: 27, sku: 'RD-007', name: 'Sparkling Water', category: 'Water', brand: 'Regional', price: 2.25, cost: 1.10, margin: 51.11, stock: 800, minStock: 100, status: 'active' },
            { id: 28, sku: 'RD-008', name: 'Sports Drink', category: 'Sports', brand: 'Regional', price: 3.50, cost: 1.75, margin: 50.00, stock: 400, minStock: 50, status: 'active' },
            { id: 29, sku: 'RD-009', name: 'Iced Tea', category: 'Tea', brand: 'Regional', price: 2.99, cost: 1.50, margin: 49.83, stock: 350, minStock: 45, status: 'active' },
            { id: 30, sku: 'RD-010', name: 'Coffee Drink', category: 'Coffee', brand: 'Regional', price: 4.50, cost: 2.75, margin: 38.89, stock: 200, minStock: 25, status: 'active' }
        ]
    },
    customers: {
        'diplomat-sa': [
            { id: 1, name: 'Tesco UK', type: 'Retail Chain', segment: 'Premium', region: 'UK', contactPerson: 'John Williams', email: 'procurement@tesco.co.uk', creditLimit: 500000.00, status: 'active' },
            { id: 2, name: 'Sainsburys', type: 'Retail Chain', segment: 'Premium', region: 'UK', contactPerson: 'Sarah Davis', email: 'buyers@sainsburys.co.uk', creditLimit: 450000.00, status: 'active' },
            { id: 3, name: 'ASDA', type: 'Retail Chain', segment: 'Standard', region: 'UK', contactPerson: 'Mike Johnson', email: 'purchasing@asda.com', creditLimit: 350000.00, status: 'active' },
            { id: 4, name: 'Morrisons', type: 'Retail Chain', segment: 'Standard', region: 'UK', contactPerson: 'Lisa Brown', email: 'procurement@morrisons.com', creditLimit: 300000.00, status: 'active' },
            { id: 5, name: 'Waitrose', type: 'Retail Chain', segment: 'Premium', region: 'UK', contactPerson: 'David Wilson', email: 'buying@waitrose.com', creditLimit: 250000.00, status: 'active' }
        ],
        'premium-brands': [
            { id: 6, name: 'Walmart', type: 'Retail Chain', segment: 'Standard', region: 'USA', contactPerson: 'Robert Johnson', email: 'procurement@walmart.com', creditLimit: 1000000.00, status: 'active' },
            { id: 7, name: 'Target', type: 'Retail Chain', segment: 'Premium', region: 'USA', contactPerson: 'Jennifer Davis', email: 'buyers@target.com', creditLimit: 750000.00, status: 'active' },
            { id: 8, name: 'Kroger', type: 'Retail Chain', segment: 'Standard', region: 'USA', contactPerson: 'Michael Brown', email: 'purchasing@kroger.com', creditLimit: 600000.00, status: 'active' },
            { id: 9, name: 'Costco USA', type: 'Warehouse Club', segment: 'Premium', region: 'USA', contactPerson: 'Lisa Wilson', email: 'procurement@costco.com', creditLimit: 800000.00, status: 'active' },
            { id: 10, name: 'Whole Foods', type: 'Organic Retail', segment: 'Premium', region: 'USA', contactPerson: 'David Miller', email: 'buying@wholefoods.com', creditLimit: 400000.00, status: 'active' }
        ],
        'regional-dist': [
            { id: 11, name: 'Woolworths', type: 'Retail Chain', segment: 'Premium', region: 'Australia', contactPerson: 'Andrew Thompson', email: 'procurement@woolworths.com.au', creditLimit: 600000.00, status: 'active' },
            { id: 12, name: 'Coles', type: 'Retail Chain', segment: 'Standard', region: 'Australia', contactPerson: 'Sophie Harris', email: 'buyers@coles.com.au', creditLimit: 550000.00, status: 'active' },
            { id: 13, name: 'IGA', type: 'Independent Retail', segment: 'Standard', region: 'Australia', contactPerson: 'Mark Robinson', email: 'purchasing@iga.com.au', creditLimit: 200000.00, status: 'active' },
            { id: 14, name: 'Dan Murphys', type: 'Specialty Retail', segment: 'Premium', region: 'Australia', contactPerson: 'Laura Walker', email: 'procurement@danmurphys.com.au', creditLimit: 300000.00, status: 'active' },
            { id: 15, name: 'BWS', type: 'Specialty Retail', segment: 'Standard', region: 'Australia', contactPerson: 'Peter Hall', email: 'orders@bws.com.au', creditLimit: 250000.00, status: 'active' }
        ]
    },
    kpis: {
        'diplomat-sa': [
            { id: 1, name: 'Total Revenue', value: 2850000.00, target: 3000000.00, unit: 'GBP', category: 'sales', period: 'YTD', trend: 'up', changePercentage: 12.5 },
            { id: 2, name: 'Gross Profit', value: 1425000.00, target: 1500000.00, unit: 'GBP', category: 'finance', period: 'YTD', trend: 'up', changePercentage: 8.3 },
            { id: 3, name: 'Gross Margin', value: 50.0, target: 50.0, unit: '%', category: 'finance', period: 'YTD', trend: 'flat', changePercentage: 0.0 },
            { id: 4, name: 'Active Customers', value: 1250, target: 1200, unit: 'count', category: 'sales', period: 'Current', trend: 'up', changePercentage: 4.2 },
            { id: 5, name: 'Market Share', value: 24.5, target: 25.0, unit: '%', category: 'market', period: 'YTD', trend: 'down', changePercentage: -2.0 },
            { id: 6, name: 'Customer Satisfaction', value: 87.5, target: 90.0, unit: 'score', category: 'customer', period: 'Current', trend: 'up', changePercentage: 2.5 }
        ],
        'premium-brands': [
            { id: 7, name: 'Total Revenue', value: 4200000.00, target: 4000000.00, unit: 'USD', category: 'sales', period: 'YTD', trend: 'up', changePercentage: 15.8 },
            { id: 8, name: 'Gross Profit', value: 2100000.00, target: 2000000.00, unit: 'USD', category: 'finance', period: 'YTD', trend: 'up', changePercentage: 12.2 },
            { id: 9, name: 'Gross Margin', value: 50.0, target: 50.0, unit: '%', category: 'finance', period: 'YTD', trend: 'flat', changePercentage: 0.0 },
            { id: 10, name: 'Active Customers', value: 850, target: 800, unit: 'count', category: 'sales', period: 'Current', trend: 'up', changePercentage: 6.3 },
            { id: 11, name: 'Market Share', value: 18.2, target: 18.0, unit: '%', category: 'market', period: 'YTD', trend: 'up', changePercentage: 1.1 },
            { id: 12, name: 'Customer Satisfaction', value: 92.3, target: 90.0, unit: 'score', category: 'customer', period: 'Current', trend: 'up', changePercentage: 2.6 }
        ],
        'regional-dist': [
            { id: 13, name: 'Total Revenue', value: 1650000.00, target: 1600000.00, unit: 'AUD', category: 'sales', period: 'YTD', trend: 'up', changePercentage: 8.7 },
            { id: 14, name: 'Gross Profit', value: 825000.00, target: 800000.00, unit: 'AUD', category: 'finance', period: 'YTD', trend: 'up', changePercentage: 6.5 },
            { id: 15, name: 'Gross Margin', value: 50.0, target: 50.0, unit: '%', category: 'finance', period: 'YTD', trend: 'flat', changePercentage: 0.0 },
            { id: 16, name: 'Active Customers', value: 650, target: 600, unit: 'count', category: 'sales', period: 'Current', trend: 'up', changePercentage: 8.3 },
            { id: 17, name: 'Market Share', value: 15.8, target: 16.0, unit: '%', category: 'market', period: 'YTD', trend: 'down', changePercentage: -1.3 },
            { id: 18, name: 'Customer Satisfaction', value: 84.2, target: 85.0, unit: 'score', category: 'customer', period: 'Current', trend: 'down', changePercentage: -0.9 }
        ]
    },
    sales: generateSalesData(),
    promotions: {
        'diplomat-sa': [
            { id: 1, name: 'Summer Spirits Sale', type: 'Discount', description: 'Summer promotion on premium spirits', discountPercentage: 15.0, budget: 50000.00, spent: 35000.00, startDate: '2024-06-01', endDate: '2024-08-31', status: 'Active', roi: 285.5 },
            { id: 2, name: 'Wine & Dine Offer', type: 'Bundle', description: 'Wine pairing promotion with restaurants', discountPercentage: 20.0, budget: 30000.00, spent: 22000.00, startDate: '2024-07-15', endDate: '2024-09-15', status: 'Active', roi: 320.8 },
            { id: 3, name: 'Craft Beer Festival', type: 'Event', description: 'Craft beer promotion during festival season', discountPercentage: 12.0, budget: 25000.00, spent: 18500.00, startDate: '2024-08-01', endDate: '2024-10-31', status: 'Active', roi: 245.2 }
        ],
        'premium-brands': [
            { id: 4, name: 'Luxury Collection Launch', type: 'Launch', description: 'New luxury product line introduction', discountPercentage: 25.0, budget: 100000.00, spent: 75000.00, startDate: '2024-05-01', endDate: '2024-07-31', status: 'Completed', roi: 380.2 },
            { id: 5, name: 'Premium Spirits Showcase', type: 'Event', description: 'High-end spirits tasting events', discountPercentage: 20.0, budget: 80000.00, spent: 65000.00, startDate: '2024-06-15', endDate: '2024-09-30', status: 'Active', roi: 295.7 },
            { id: 6, name: 'VIP Member Exclusive', type: 'Loyalty', description: 'Exclusive offers for VIP customers', discountPercentage: 30.0, budget: 50000.00, spent: 35000.00, startDate: '2024-08-01', endDate: '2024-11-30', status: 'Active', roi: 420.5 }
        ],
        'regional-dist': [
            { id: 7, name: 'Local Favorites', type: 'Discount', description: 'Promotion on local beer brands', discountPercentage: 10.0, budget: 35000.00, spent: 28000.00, startDate: '2024-06-01', endDate: '2024-08-31', status: 'Active', roi: 195.8 },
            { id: 8, name: 'Summer Refreshers', type: 'Bundle', description: 'Soft drinks and juices bundle', discountPercentage: 15.0, budget: 25000.00, spent: 20000.00, startDate: '2024-07-01', endDate: '2024-09-30', status: 'Active', roi: 165.2 },
            { id: 9, name: 'Sports Season Special', type: 'Event', description: 'Sports drinks during sports season', discountPercentage: 18.0, budget: 30000.00, spent: 22000.00, startDate: '2024-09-01', endDate: '2024-11-30', status: 'Active', roi: 185.3 }
        ]
    },
    aiModels: {
        'demand-forecasting': { name: 'Demand Forecasting', accuracy: 94.2, status: 'active', lastTrained: '2024-08-25' },
        'price-optimization': { name: 'Price Optimization', accuracy: 89.7, status: 'active', lastTrained: '2024-08-20' },
        'customer-segmentation': { name: 'Customer Segmentation', accuracy: 91.5, status: 'active', lastTrained: '2024-08-22' },
        'promotion-effectiveness': { name: 'Promotion Effectiveness', accuracy: 87.3, status: 'active', lastTrained: '2024-08-18' },
        'inventory-optimization': { name: 'Inventory Optimization', accuracy: 93.8, status: 'active', lastTrained: '2024-08-24' },
        'market-basket-analysis': { name: 'Market Basket Analysis', accuracy: 85.9, status: 'active', lastTrained: '2024-08-19' },
        'churn-prediction': { name: 'Churn Prediction', accuracy: 88.4, status: 'active', lastTrained: '2024-08-21' },
        'sentiment-analysis': { name: 'Sentiment Analysis', accuracy: 92.1, status: 'active', lastTrained: '2024-08-23' },
        'supply-chain-optimization': { name: 'Supply Chain Optimization', accuracy: 90.6, status: 'active', lastTrained: '2024-08-17' },
        'competitive-intelligence': { name: 'Competitive Intelligence', accuracy: 86.2, status: 'active', lastTrained: '2024-08-16' }
    }
};

// Generate realistic sales data
function generateSalesData() {
    const salesData = {};
    const companies = ['diplomat-sa', 'premium-brands', 'regional-dist'];
    
    companies.forEach(companyId => {
        salesData[companyId] = [];
        const products = DATABASE.products[companyId];
        const customers = DATABASE.customers[companyId];
        
        // Generate 50 sales records per company
        for (let i = 0; i < 50; i++) {
            const product = products[Math.floor(Math.random() * products.length)];
            const customer = customers[Math.floor(Math.random() * customers.length)];
            const quantity = Math.floor(Math.random() * 100) + 10;
            const saleDate = new Date();
            saleDate.setDate(saleDate.getDate() - Math.floor(Math.random() * 365));
            
            salesData[companyId].push({
                id: i + 1,
                orderNumber: `${companyId.toUpperCase()}-ORD-${String(i + 1).padStart(6, '0')}`,
                customerId: customer.id,
                customerName: customer.name,
                productId: product.id,
                productName: product.name,
                category: product.category,
                quantity: quantity,
                unitPrice: product.price,
                totalAmount: quantity * product.price,
                discountAmount: Math.random() * 100,
                status: ['completed', 'shipped', 'pending'][Math.floor(Math.random() * 3)],
                saleDate: saleDate.toISOString().split('T')[0],
                region: customer.region,
                channel: ['Direct', 'Online', 'Retail', 'Wholesale'][Math.floor(Math.random() * 4)]
            });
        }
    });
    
    return salesData;
}

// Utility functions
function generateId() {
    return crypto.randomBytes(16).toString('hex');
}

function getCurrentTimestamp() {
    return new Date().toISOString();
}

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
        timestamp: getCurrentTimestamp()
    });
}

// AI Chatbot responses
function generateAIResponse(message, companyId) {
    const responses = {
        'sales': [
            `Based on our analysis for ${DATABASE.companies[companyId]?.name}, sales are trending upward with a 12.5% increase YTD. Our premium products are performing exceptionally well.`,
            `Current sales performance shows strong growth in the spirits category, particularly premium vodka and craft gin segments.`,
            `Sales data indicates seasonal patterns with peak performance during summer months for our beverage portfolio.`
        ],
        'revenue': [
            `Revenue for ${DATABASE.companies[companyId]?.name} is currently at ${DATABASE.kpis[companyId]?.[0]?.value?.toLocaleString()} ${DATABASE.companies[companyId]?.currency}, which is ${DATABASE.kpis[companyId]?.[0]?.changePercentage}% above last year.`,
            `Our revenue streams are diversified across multiple channels, with retail partnerships contributing 60% of total revenue.`,
            `Revenue growth is driven by premium product lines and strategic market expansion initiatives.`
        ],
        'customers': [
            `We currently serve ${DATABASE.kpis[companyId]?.find(k => k.name === 'Active Customers')?.value} active customers with a satisfaction score of ${DATABASE.kpis[companyId]?.find(k => k.name === 'Customer Satisfaction')?.value}/100.`,
            `Customer retention rates are strong, with premium segment customers showing 95% loyalty rates.`,
            `Our customer base spans major retail chains including Tesco, Sainsbury's, and premium specialty stores.`
        ],
        'products': [
            `Our product portfolio includes ${DATABASE.products[companyId]?.length} active SKUs across spirits, wine, and beer categories.`,
            `Top-performing products include Premium Vodka, Craft Gin, and Single Malt Whisky with margins above 40%.`,
            `Product innovation pipeline includes 5 new launches planned for Q4 2024.`
        ],
        'market': [
            `Current market share stands at ${DATABASE.kpis[companyId]?.find(k => k.name === 'Market Share')?.value}% in our primary markets.`,
            `Market analysis shows opportunities in the premium and craft segments with 15% annual growth rates.`,
            `Competitive positioning remains strong with differentiated product offerings and strategic partnerships.`
        ],
        'promotions': [
            `Active promotions include ${DATABASE.promotions[companyId]?.filter(p => p.status === 'Active').length} campaigns with an average ROI of 285%.`,
            `Summer Spirits Sale is performing exceptionally well with 75% budget utilization and strong customer response.`,
            `Promotional effectiveness varies by channel, with online campaigns showing 40% higher engagement rates.`
        ],
        'default': [
            `I'm here to help you analyze your FMCG business data. I can provide insights on sales, revenue, customers, products, market trends, and promotional performance.`,
            `As your AI business analyst, I can help you understand key metrics, identify trends, and provide actionable recommendations for ${DATABASE.companies[companyId]?.name}.`,
            `Feel free to ask me about sales performance, customer analytics, product insights, market analysis, or promotional effectiveness.`
        ]
    };
    
    const lowerMessage = message.toLowerCase();
    let category = 'default';
    
    if (lowerMessage.includes('sales') || lowerMessage.includes('sell')) category = 'sales';
    else if (lowerMessage.includes('revenue') || lowerMessage.includes('money') || lowerMessage.includes('profit')) category = 'revenue';
    else if (lowerMessage.includes('customer') || lowerMessage.includes('client')) category = 'customers';
    else if (lowerMessage.includes('product') || lowerMessage.includes('sku')) category = 'products';
    else if (lowerMessage.includes('market') || lowerMessage.includes('competition')) category = 'market';
    else if (lowerMessage.includes('promotion') || lowerMessage.includes('campaign')) category = 'promotions';
    
    const categoryResponses = responses[category];
    return categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
}

// API Routes
const routes = {
    // Health check
    'GET /health': (req, res) => {
        sendResponse(res, 200, {
            status: 'healthy',
            service: 'Vanta X Enterprise FMCG Platform',
            version: '3.0.0',
            timestamp: getCurrentTimestamp(),
            uptime: process.uptime(),
            environment: 'demo',
            features: {
                multiCompany: true,
                aiModels: Object.keys(DATABASE.aiModels).length,
                realTimeAnalytics: true,
                sapIntegration: true,
                microsoftSSO: true
            }
        });
    },

    // Authentication
    'POST /api/v2/auth/login': (req, res) => {
        const { username, password, companyId } = req.body;
        
        if (!companyId || !DATABASE.companies[companyId]) {
            return sendError(res, 400, 'Invalid company ID');
        }
        
        const users = DATABASE.users[companyId];
        const user = users.find(u => u.username === username || u.email === username);
        
        if (!user) {
            return sendError(res, 401, 'Invalid credentials');
        }
        
        const token = Buffer.from(JSON.stringify({ userId: user.id, companyId, exp: Date.now() + 86400000 })).toString('base64');
        
        sendResponse(res, 200, {
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                department: user.department,
                companyId
            },
            company: DATABASE.companies[companyId]
        });
    },

    // Companies
    'GET /api/v2/companies': (req, res) => {
        sendResponse(res, 200, {
            success: true,
            data: Object.values(DATABASE.companies)
        });
    },

    'GET /api/v2/companies/:id': (req, res) => {
        const { id } = req.params;
        const company = DATABASE.companies[id];
        
        if (!company) {
            return sendError(res, 404, 'Company not found');
        }
        
        sendResponse(res, 200, {
            success: true,
            data: company
        });
    },

    // Dashboard data
    'GET /api/v2/dashboard': (req, res) => {
        const companyId = req.headers['x-company-id'] || 'diplomat-sa';
        
        if (!DATABASE.companies[companyId]) {
            return sendError(res, 400, 'Invalid company ID');
        }
        
        const kpis = DATABASE.kpis[companyId] || [];
        const sales = DATABASE.sales[companyId] || [];
        const promotions = DATABASE.promotions[companyId] || [];
        
        // Calculate recent sales (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentSales = sales.filter(sale => new Date(sale.saleDate) >= thirtyDaysAgo);
        const totalRecentRevenue = recentSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        
        // Sales by category
        const salesByCategory = {};
        recentSales.forEach(sale => {
            salesByCategory[sale.category] = (salesByCategory[sale.category] || 0) + sale.totalAmount;
        });
        
        // Sales trend (last 12 months)
        const salesTrend = [];
        for (let i = 11; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthKey = date.toISOString().slice(0, 7);
            
            const monthSales = sales.filter(sale => sale.saleDate.startsWith(monthKey));
            const monthRevenue = monthSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
            
            salesTrend.push({
                month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                revenue: monthRevenue,
                orders: monthSales.length
            });
        }
        
        sendResponse(res, 200, {
            success: true,
            data: {
                kpis,
                recentSales: {
                    total: recentSales.length,
                    revenue: totalRecentRevenue,
                    byCategory: salesByCategory
                },
                salesTrend,
                activePromotions: promotions.filter(p => p.status === 'Active').length,
                topProducts: DATABASE.products[companyId]?.slice(0, 5) || []
            }
        });
    },

    // KPIs
    'GET /api/v2/kpis': (req, res) => {
        const companyId = req.headers['x-company-id'] || 'diplomat-sa';
        const kpis = DATABASE.kpis[companyId] || [];
        
        sendResponse(res, 200, {
            success: true,
            data: kpis
        });
    },

    // Sales
    'GET /api/v2/sales': (req, res) => {
        const companyId = req.headers['x-company-id'] || 'diplomat-sa';
        const sales = DATABASE.sales[companyId] || [];
        
        sendResponse(res, 200, {
            success: true,
            data: sales,
            total: sales.length
        });
    },

    'GET /api/v2/sales/analytics': (req, res) => {
        const companyId = req.headers['x-company-id'] || 'diplomat-sa';
        const sales = DATABASE.sales[companyId] || [];
        
        // Sales by region
        const salesByRegion = {};
        sales.forEach(sale => {
            salesByRegion[sale.region] = (salesByRegion[sale.region] || 0) + sale.totalAmount;
        });
        
        // Sales by channel
        const salesByChannel = {};
        sales.forEach(sale => {
            salesByChannel[sale.channel] = (salesByChannel[sale.channel] || 0) + sale.totalAmount;
        });
        
        // Top customers
        const customerSales = {};
        sales.forEach(sale => {
            customerSales[sale.customerName] = (customerSales[sale.customerName] || 0) + sale.totalAmount;
        });
        
        const topCustomers = Object.entries(customerSales)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([name, revenue]) => ({ name, revenue }));
        
        sendResponse(res, 200, {
            success: true,
            data: {
                totalRevenue: sales.reduce((sum, sale) => sum + sale.totalAmount, 0),
                totalOrders: sales.length,
                averageOrderValue: sales.length > 0 ? sales.reduce((sum, sale) => sum + sale.totalAmount, 0) / sales.length : 0,
                salesByRegion,
                salesByChannel,
                topCustomers
            }
        });
    },

    // Products
    'GET /api/v2/products': (req, res) => {
        const companyId = req.headers['x-company-id'] || 'diplomat-sa';
        const products = DATABASE.products[companyId] || [];
        
        sendResponse(res, 200, {
            success: true,
            data: products,
            total: products.length
        });
    },

    // Customers
    'GET /api/v2/customers': (req, res) => {
        const companyId = req.headers['x-company-id'] || 'diplomat-sa';
        const customers = DATABASE.customers[companyId] || [];
        
        sendResponse(res, 200, {
            success: true,
            data: customers,
            total: customers.length
        });
    },

    // Promotions
    'GET /api/v2/promotions': (req, res) => {
        const companyId = req.headers['x-company-id'] || 'diplomat-sa';
        const promotions = DATABASE.promotions[companyId] || [];
        
        sendResponse(res, 200, {
            success: true,
            data: promotions,
            total: promotions.length
        });
    },

    // AI Models
    'GET /api/v2/ai/models': (req, res) => {
        sendResponse(res, 200, {
            success: true,
            data: DATABASE.aiModels,
            total: Object.keys(DATABASE.aiModels).length
        });
    },

    'POST /api/v2/ai/predict': (req, res) => {
        const { model, data } = req.body;
        
        if (!DATABASE.aiModels[model]) {
            return sendError(res, 404, 'AI model not found');
        }
        
        // Simulate AI prediction
        const prediction = {
            model,
            confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
            result: {
                prediction: Math.random() * 1000 + 500,
                factors: ['seasonal_trends', 'historical_data', 'market_conditions'],
                recommendations: [
                    'Increase inventory for high-demand products',
                    'Optimize pricing for premium segments',
                    'Focus marketing on top-performing regions'
                ]
            },
            timestamp: getCurrentTimestamp()
        };
        
        sendResponse(res, 200, {
            success: true,
            data: prediction
        });
    },

    // AI Chatbot
    'POST /api/v2/ai/chat': (req, res) => {
        const { message } = req.body;
        const companyId = req.headers['x-company-id'] || 'diplomat-sa';
        
        if (!message) {
            return sendError(res, 400, 'Message is required');
        }
        
        const response = generateAIResponse(message, companyId);
        
        sendResponse(res, 200, {
            success: true,
            data: {
                message: response,
                timestamp: getCurrentTimestamp(),
                companyContext: DATABASE.companies[companyId]?.name
            }
        });
    },

    // SAP Integration endpoints
    'POST /api/v2/sap/import': (req, res) => {
        const { system, data } = req.body;
        
        sendResponse(res, 200, {
            success: true,
            message: `Successfully imported ${data?.length || 0} records from SAP ${system}`,
            importId: generateId(),
            timestamp: getCurrentTimestamp()
        });
    },

    'GET /api/v2/sap/status': (req, res) => {
        sendResponse(res, 200, {
            success: true,
            data: {
                sapECC: { status: 'connected', lastSync: '2024-08-31T10:30:00Z' },
                sapS4: { status: 'connected', lastSync: '2024-08-31T10:25:00Z' }
            }
        });
    },

    // Excel templates
    'GET /api/v2/templates/excel': (req, res) => {
        const templates = [
            { name: 'Sales Data Import', file: 'sales_import_template.xlsx', description: 'Template for importing sales transactions' },
            { name: 'Product Catalog', file: 'product_catalog_template.xlsx', description: 'Template for product information' },
            { name: 'Customer Data', file: 'customer_data_template.xlsx', description: 'Template for customer information' },
            { name: 'Promotion Setup', file: 'promotion_setup_template.xlsx', description: 'Template for promotion configuration' }
        ];
        
        sendResponse(res, 200, {
            success: true,
            data: templates
        });
    },

    // Microsoft 365 SSO
    'GET /api/v2/auth/microsoft': (req, res) => {
        sendResponse(res, 200, {
            success: true,
            authUrl: 'https://login.microsoftonline.com/oauth2/v2.0/authorize?client_id=demo&response_type=code&scope=openid%20profile%20email',
            message: 'Microsoft 365 SSO integration ready'
        });
    },

    // Analytics
    'GET /api/v2/analytics/trends': (req, res) => {
        const companyId = req.headers['x-company-id'] || 'diplomat-sa';
        const sales = DATABASE.sales[companyId] || [];
        
        // Generate trend data
        const trends = {
            revenue: {
                current: sales.reduce((sum, sale) => sum + sale.totalAmount, 0),
                previous: sales.reduce((sum, sale) => sum + sale.totalAmount, 0) * 0.85,
                change: 15.2
            },
            orders: {
                current: sales.length,
                previous: Math.floor(sales.length * 0.92),
                change: 8.7
            },
            customers: {
                current: new Set(sales.map(s => s.customerId)).size,
                previous: Math.floor(new Set(sales.map(s => s.customerId)).size * 0.96),
                change: 4.2
            }
        };
        
        sendResponse(res, 200, {
            success: true,
            data: trends
        });
    },

    // Reports
    'GET /api/v2/reports': (req, res) => {
        const reports = [
            { id: 1, name: 'Sales Performance Report', type: 'sales', lastGenerated: '2024-08-31T09:00:00Z' },
            { id: 2, name: 'Customer Analysis Report', type: 'customer', lastGenerated: '2024-08-31T08:30:00Z' },
            { id: 3, name: 'Product Performance Report', type: 'product', lastGenerated: '2024-08-31T08:00:00Z' },
            { id: 4, name: 'Promotion Effectiveness Report', type: 'promotion', lastGenerated: '2024-08-31T07:30:00Z' }
        ];
        
        sendResponse(res, 200, {
            success: true,
            data: reports
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
        // Extract route parameters
        req.params = {};
        req.query = parsedUrl.query;
        
        // Find matching route
        let handler = routes[routeKey];
        
        // Handle parameterized routes
        if (!handler) {
            for (const route in routes) {
                const [routeMethod, routePath] = route.split(' ');
                if (routeMethod === method) {
                    const routeRegex = routePath.replace(/:([^/]+)/g, '([^/]+)');
                    const match = pathname.match(new RegExp(`^${routeRegex}$`));
                    if (match) {
                        const paramNames = (routePath.match(/:([^/]+)/g) || []).map(p => p.slice(1));
                        paramNames.forEach((name, index) => {
                            req.params[name] = match[index + 1];
                        });
                        handler = routes[route];
                        break;
                    }
                }
            }
        }
        
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
    console.log(`📊 Demo data loaded: ${Object.keys(DATABASE.sales).reduce((sum, key) => sum + DATABASE.sales[key].length, 0)} sales records`);
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

process.on('SIGINT', () => {
    console.log('🛑 Shutting down server...');
    server.close(() => {
        console.log('✅ Server shutdown complete');
        process.exit(0);
    });
});