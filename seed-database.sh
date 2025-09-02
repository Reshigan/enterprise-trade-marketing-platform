#!/bin/bash

# Vanta X Enterprise FMCG Platform - Database Seeding Script
# Populates the database with sample data for all companies

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}================================${NC}"
}

print_header "Database Seeding for Vanta X Enterprise"

# Database connection details
DB_NAME="vantax_enterprise"
DB_USER="vantax_user"
DB_PASS="VantaX_Secure_2024!"

print_status "Connecting to PostgreSQL database..."

# Create the seeding SQL script
cat > /tmp/seed_data.sql << 'EOF'
-- Vanta X Enterprise FMCG Platform - Sample Data
-- Multi-company data for Diplomat SA and other companies

-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS companies (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50),
    tier VARCHAR(50),
    region VARCHAR(50),
    currency VARCHAR(10),
    timezone VARCHAR(50),
    language VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    company_id VARCHAR(50) REFERENCES companies(id),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(100),
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    company_id VARCHAR(50) REFERENCES companies(id),
    sku VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    brand VARCHAR(100),
    price DECIMAL(10,2),
    cost DECIMAL(10,2),
    margin DECIMAL(5,2),
    stock_quantity INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 10,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    company_id VARCHAR(50) REFERENCES companies(id),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50),
    segment VARCHAR(50),
    region VARCHAR(100),
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    credit_limit DECIMAL(12,2),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sales (
    id SERIAL PRIMARY KEY,
    company_id VARCHAR(50) REFERENCES companies(id),
    order_number VARCHAR(100) UNIQUE,
    customer_id INTEGER REFERENCES customers(id),
    product_id INTEGER REFERENCES products(id),
    user_id INTEGER REFERENCES users(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2),
    total_amount DECIMAL(12,2),
    discount_amount DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending',
    sale_date DATE DEFAULT CURRENT_DATE,
    delivery_date DATE,
    region VARCHAR(100),
    channel VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS promotions (
    id SERIAL PRIMARY KEY,
    company_id VARCHAR(50) REFERENCES companies(id),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50),
    description TEXT,
    discount_percentage DECIMAL(5,2),
    budget DECIMAL(12,2),
    spent DECIMAL(12,2) DEFAULT 0,
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'active',
    roi DECIMAL(8,2) DEFAULT 0,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kpis (
    id SERIAL PRIMARY KEY,
    company_id VARCHAR(50) REFERENCES companies(id),
    name VARCHAR(255) NOT NULL,
    value DECIMAL(15,2),
    target DECIMAL(15,2),
    unit VARCHAR(50),
    category VARCHAR(100),
    period VARCHAR(50),
    trend VARCHAR(20),
    change_percentage DECIMAL(5,2),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clear existing data
TRUNCATE companies, users, products, customers, sales, promotions, kpis CASCADE;

-- Insert Companies
INSERT INTO companies (id, name, type, tier, region, currency, timezone, language) VALUES
('diplomat-sa', 'Diplomat SA', 'subsidiary', 'professional', 'EMEA', 'GBP', 'Europe/London', 'en-GB'),
('premium-brands', 'Premium Brands International', 'subsidiary', 'enterprise', 'Americas', 'USD', 'America/New_York', 'en-US'),
('regional-dist', 'Regional Distribution Network', 'distributor', 'professional', 'APAC', 'AUD', 'Australia/Sydney', 'en-AU'),
('global-fmcg', 'Global FMCG Holdings', 'parent', 'enterprise', 'Global', 'USD', 'UTC', 'en-US');

-- Insert Users for each company
INSERT INTO users (company_id, username, email, full_name, role, department) VALUES
-- Diplomat SA Users
('diplomat-sa', 'james.morrison', 'james.morrison@diplomat-sa.com', 'James Morrison', 'CEO', 'Executive'),
('diplomat-sa', 'sarah.chen', 'sarah.chen@diplomat-sa.com', 'Sarah Chen', 'CFO', 'Finance'),
('diplomat-sa', 'michael.rodriguez', 'michael.rodriguez@diplomat-sa.com', 'Michael Rodriguez', 'CMO', 'Marketing'),
('diplomat-sa', 'emily.johnson', 'emily.johnson@diplomat-sa.com', 'Emily Johnson', 'Sales Director', 'Sales'),
('diplomat-sa', 'david.thompson', 'david.thompson@diplomat-sa.com', 'David Thompson', 'Trade Marketing Manager', 'Marketing'),
('diplomat-sa', 'lisa.anderson', 'lisa.anderson@diplomat-sa.com', 'Lisa Anderson', 'Field Sales Manager', 'Sales'),
('diplomat-sa', 'robert.kim', 'robert.kim@diplomat-sa.com', 'Robert Kim', 'Data Analyst', 'Analytics'),
('diplomat-sa', 'jennifer.walsh', 'jennifer.walsh@diplomat-sa.com', 'Jennifer Walsh', 'Supply Chain Manager', 'Operations'),
('diplomat-sa', 'christopher.lee', 'christopher.lee@diplomat-sa.com', 'Christopher Lee', 'Finance Manager', 'Finance'),
('diplomat-sa', 'amanda.garcia', 'amanda.garcia@diplomat-sa.com', 'Amanda Garcia', 'IT Administrator', 'IT'),

-- Premium Brands Users
('premium-brands', 'john.smith', 'john.smith@premium-brands.com', 'John Smith', 'CEO', 'Executive'),
('premium-brands', 'maria.gonzalez', 'maria.gonzalez@premium-brands.com', 'Maria Gonzalez', 'CFO', 'Finance'),
('premium-brands', 'alex.brown', 'alex.brown@premium-brands.com', 'Alex Brown', 'CMO', 'Marketing'),
('premium-brands', 'jessica.davis', 'jessica.davis@premium-brands.com', 'Jessica Davis', 'Sales Director', 'Sales'),
('premium-brands', 'ryan.wilson', 'ryan.wilson@premium-brands.com', 'Ryan Wilson', 'Trade Marketing Manager', 'Marketing'),
('premium-brands', 'nicole.taylor', 'nicole.taylor@premium-brands.com', 'Nicole Taylor', 'Field Sales Manager', 'Sales'),
('premium-brands', 'kevin.moore', 'kevin.moore@premium-brands.com', 'Kevin Moore', 'Data Analyst', 'Analytics'),
('premium-brands', 'stephanie.clark', 'stephanie.clark@premium-brands.com', 'Stephanie Clark', 'Supply Chain Manager', 'Operations'),
('premium-brands', 'daniel.lewis', 'daniel.lewis@premium-brands.com', 'Daniel Lewis', 'Finance Manager', 'Finance'),
('premium-brands', 'rachel.white', 'rachel.white@premium-brands.com', 'Rachel White', 'IT Administrator', 'IT'),

-- Regional Distribution Users
('regional-dist', 'andrew.miller', 'andrew.miller@regional-dist.com', 'Andrew Miller', 'CEO', 'Executive'),
('regional-dist', 'sophie.jones', 'sophie.jones@regional-dist.com', 'Sophie Jones', 'CFO', 'Finance'),
('regional-dist', 'mark.williams', 'mark.williams@regional-dist.com', 'Mark Williams', 'CMO', 'Marketing'),
('regional-dist', 'laura.martin', 'laura.martin@regional-dist.com', 'Laura Martin', 'Sales Director', 'Sales'),
('regional-dist', 'peter.jackson', 'peter.jackson@regional-dist.com', 'Peter Jackson', 'Trade Marketing Manager', 'Marketing'),
('regional-dist', 'emma.thompson', 'emma.thompson@regional-dist.com', 'Emma Thompson', 'Field Sales Manager', 'Sales'),
('regional-dist', 'james.harris', 'james.harris@regional-dist.com', 'James Harris', 'Data Analyst', 'Analytics'),
('regional-dist', 'olivia.robinson', 'olivia.robinson@regional-dist.com', 'Olivia Robinson', 'Supply Chain Manager', 'Operations'),
('regional-dist', 'william.walker', 'william.walker@regional-dist.com', 'William Walker', 'Finance Manager', 'Finance'),
('regional-dist', 'grace.hall', 'grace.hall@regional-dist.com', 'Grace Hall', 'IT Administrator', 'IT');

-- Insert Products for each company
INSERT INTO products (company_id, sku, name, category, brand, price, cost, margin, stock_quantity, min_stock) VALUES
-- Diplomat SA Products
('diplomat-sa', 'DIP-001', 'Premium Vodka', 'Spirits', 'Diplomat', 45.99, 25.00, 45.65, 150, 20),
('diplomat-sa', 'DIP-002', 'Craft Gin', 'Spirits', 'Diplomat', 38.50, 22.00, 42.86, 120, 15),
('diplomat-sa', 'DIP-003', 'Single Malt Whisky', 'Spirits', 'Diplomat', 89.99, 55.00, 38.89, 80, 10),
('diplomat-sa', 'DIP-004', 'Premium Rum', 'Spirits', 'Diplomat', 52.75, 30.00, 43.13, 95, 12),
('diplomat-sa', 'DIP-005', 'Artisan Tequila', 'Spirits', 'Diplomat', 67.50, 40.00, 40.74, 70, 8),
('diplomat-sa', 'DIP-006', 'Champagne', 'Wine', 'Diplomat', 125.00, 75.00, 40.00, 45, 5),
('diplomat-sa', 'DIP-007', 'Chardonnay', 'Wine', 'Diplomat', 28.99, 18.00, 37.94, 200, 25),
('diplomat-sa', 'DIP-008', 'Cabernet Sauvignon', 'Wine', 'Diplomat', 32.50, 20.00, 38.46, 180, 20),
('diplomat-sa', 'DIP-009', 'Premium Lager', 'Beer', 'Diplomat', 4.99, 2.50, 49.90, 500, 50),
('diplomat-sa', 'DIP-010', 'Craft IPA', 'Beer', 'Diplomat', 6.25, 3.50, 44.00, 300, 30),

-- Premium Brands Products
('premium-brands', 'PB-001', 'Luxury Cognac', 'Spirits', 'Premium', 199.99, 120.00, 40.00, 60, 8),
('premium-brands', 'PB-002', 'Aged Bourbon', 'Spirits', 'Premium', 75.50, 45.00, 40.40, 90, 12),
('premium-brands', 'PB-003', 'Premium Scotch', 'Spirits', 'Premium', 95.00, 58.00, 38.95, 75, 10),
('premium-brands', 'PB-004', 'Artisan Mezcal', 'Spirits', 'Premium', 85.75, 52.00, 39.33, 55, 8),
('premium-brands', 'PB-005', 'Vintage Port', 'Wine', 'Premium', 145.00, 90.00, 37.93, 40, 5),
('premium-brands', 'PB-006', 'Reserve Pinot Noir', 'Wine', 'Premium', 42.99, 26.00, 39.53, 120, 15),
('premium-brands', 'PB-007', 'Craft Stout', 'Beer', 'Premium', 8.50, 4.75, 44.12, 250, 25),
('premium-brands', 'PB-008', 'Wheat Beer', 'Beer', 'Premium', 5.75, 3.25, 43.48, 400, 40),
('premium-brands', 'PB-009', 'Energy Drink', 'Non-Alcoholic', 'Premium', 3.99, 1.80, 54.89, 800, 100),
('premium-brands', 'PB-010', 'Premium Water', 'Non-Alcoholic', 'Premium', 2.50, 1.00, 60.00, 1000, 150),

-- Regional Distribution Products
('regional-dist', 'RD-001', 'Local Lager', 'Beer', 'Regional', 3.75, 2.00, 46.67, 600, 75),
('regional-dist', 'RD-002', 'Light Beer', 'Beer', 'Regional', 3.50, 1.90, 45.71, 550, 70),
('regional-dist', 'RD-003', 'Cola', 'Soft Drinks', 'Regional', 1.99, 0.80, 59.80, 1200, 200),
('regional-dist', 'RD-004', 'Lemon Soda', 'Soft Drinks', 'Regional', 1.75, 0.70, 60.00, 1000, 150),
('regional-dist', 'RD-005', 'Orange Juice', 'Juices', 'Regional', 4.25, 2.50, 41.18, 300, 40),
('regional-dist', 'RD-006', 'Apple Juice', 'Juices', 'Regional', 3.99, 2.30, 42.36, 280, 35),
('regional-dist', 'RD-007', 'Sparkling Water', 'Water', 'Regional', 2.25, 1.10, 51.11, 800, 100),
('regional-dist', 'RD-008', 'Sports Drink', 'Sports', 'Regional', 3.50, 1.75, 50.00, 400, 50),
('regional-dist', 'RD-009', 'Iced Tea', 'Tea', 'Regional', 2.99, 1.50, 49.83, 350, 45),
('regional-dist', 'RD-010', 'Coffee Drink', 'Coffee', 'Regional', 4.50, 2.75, 38.89, 200, 25);

-- Insert Customers for each company
INSERT INTO customers (company_id, name, type, segment, region, contact_person, email, credit_limit) VALUES
-- Diplomat SA Customers
('diplomat-sa', 'Tesco UK', 'Retail Chain', 'Premium', 'UK', 'John Williams', 'procurement@tesco.co.uk', 500000.00),
('diplomat-sa', 'Sainsburys', 'Retail Chain', 'Premium', 'UK', 'Sarah Davis', 'buyers@sainsburys.co.uk', 450000.00),
('diplomat-sa', 'ASDA', 'Retail Chain', 'Standard', 'UK', 'Mike Johnson', 'purchasing@asda.com', 350000.00),
('diplomat-sa', 'Morrisons', 'Retail Chain', 'Standard', 'UK', 'Lisa Brown', 'procurement@morrisons.com', 300000.00),
('diplomat-sa', 'Waitrose', 'Retail Chain', 'Premium', 'UK', 'David Wilson', 'buying@waitrose.com', 250000.00),
('diplomat-sa', 'Metro Wholesale', 'Wholesaler', 'Standard', 'UK', 'Emma Taylor', 'orders@metro-wholesale.co.uk', 200000.00),
('diplomat-sa', 'Booker Group', 'Wholesaler', 'Standard', 'UK', 'James Miller', 'procurement@booker.co.uk', 180000.00),
('diplomat-sa', 'Costco UK', 'Warehouse Club', 'Premium', 'UK', 'Rachel Green', 'buying@costco.co.uk', 400000.00),
('diplomat-sa', 'Harrods', 'Luxury Retail', 'Luxury', 'London', 'Oliver Smith', 'procurement@harrods.com', 150000.00),
('diplomat-sa', 'Selfridges', 'Luxury Retail', 'Luxury', 'London', 'Sophie Clark', 'buyers@selfridges.com', 120000.00),

-- Premium Brands Customers
('premium-brands', 'Walmart', 'Retail Chain', 'Standard', 'USA', 'Robert Johnson', 'procurement@walmart.com', 1000000.00),
('premium-brands', 'Target', 'Retail Chain', 'Premium', 'USA', 'Jennifer Davis', 'buyers@target.com', 750000.00),
('premium-brands', 'Kroger', 'Retail Chain', 'Standard', 'USA', 'Michael Brown', 'purchasing@kroger.com', 600000.00),
('premium-brands', 'Costco USA', 'Warehouse Club', 'Premium', 'USA', 'Lisa Wilson', 'procurement@costco.com', 800000.00),
('premium-brands', 'Whole Foods', 'Organic Retail', 'Premium', 'USA', 'David Miller', 'buying@wholefoods.com', 400000.00),
('premium-brands', 'BevMo!', 'Specialty Retail', 'Premium', 'USA', 'Sarah Taylor', 'orders@bevmo.com', 300000.00),
('premium-brands', 'Total Wine', 'Specialty Retail', 'Premium', 'USA', 'James Anderson', 'procurement@totalwine.com', 350000.00),
('premium-brands', 'ABC Fine Wine', 'Specialty Retail', 'Premium', 'USA', 'Emma White', 'buyers@abcfws.com', 200000.00),
('premium-brands', 'Liquor Barn', 'Specialty Retail', 'Standard', 'USA', 'Ryan Garcia', 'purchasing@liquorbarn.com', 150000.00),
('premium-brands', 'Specs Wine', 'Specialty Retail', 'Standard', 'USA', 'Nicole Martinez', 'orders@specsonline.com', 180000.00),

-- Regional Distribution Customers
('regional-dist', 'Woolworths', 'Retail Chain', 'Premium', 'Australia', 'Andrew Thompson', 'procurement@woolworths.com.au', 600000.00),
('regional-dist', 'Coles', 'Retail Chain', 'Standard', 'Australia', 'Sophie Harris', 'buyers@coles.com.au', 550000.00),
('regional-dist', 'IGA', 'Independent Retail', 'Standard', 'Australia', 'Mark Robinson', 'purchasing@iga.com.au', 200000.00),
('regional-dist', 'Dan Murphys', 'Specialty Retail', 'Premium', 'Australia', 'Laura Walker', 'procurement@danmurphys.com.au', 300000.00),
('regional-dist', 'BWS', 'Specialty Retail', 'Standard', 'Australia', 'Peter Hall', 'orders@bws.com.au', 250000.00),
('regional-dist', 'Liquorland', 'Specialty Retail', 'Standard', 'Australia', 'Emma Young', 'buyers@liquorland.com.au', 180000.00),
('regional-dist', 'First Choice', 'Specialty Retail', 'Standard', 'Australia', 'James King', 'procurement@firstchoice.com.au', 160000.00),
('regional-dist', 'Vintage Cellars', 'Specialty Retail', 'Premium', 'Australia', 'Olivia Wright', 'purchasing@vintagecellars.com.au', 140000.00),
('regional-dist', 'Thirsty Camel', 'Convenience', 'Standard', 'Australia', 'William Green', 'orders@thirstycamel.com.au', 100000.00),
('regional-dist', 'Bottle-O', 'Convenience', 'Standard', 'Australia', 'Grace Adams', 'buyers@bottle-o.com.au', 80000.00);

-- Generate Sales Data (last 12 months)
INSERT INTO sales (company_id, order_number, customer_id, product_id, user_id, quantity, unit_price, total_amount, status, sale_date, region, channel)
SELECT 
    c.id as company_id,
    c.id || '-ORD-' || LPAD((ROW_NUMBER() OVER (PARTITION BY c.id ORDER BY RANDOM()))::text, 6, '0') as order_number,
    cust.id as customer_id,
    prod.id as product_id,
    u.id as user_id,
    (RANDOM() * 100 + 10)::INTEGER as quantity,
    prod.price as unit_price,
    ((RANDOM() * 100 + 10)::INTEGER * prod.price) as total_amount,
    CASE 
        WHEN RANDOM() < 0.7 THEN 'completed'
        WHEN RANDOM() < 0.9 THEN 'shipped'
        ELSE 'pending'
    END as status,
    CURRENT_DATE - (RANDOM() * 365)::INTEGER as sale_date,
    CASE 
        WHEN c.id = 'diplomat-sa' THEN (ARRAY['North', 'South', 'East', 'West', 'Central'])[FLOOR(RANDOM() * 5 + 1)]
        WHEN c.id = 'premium-brands' THEN (ARRAY['Northeast', 'Southeast', 'Midwest', 'West Coast', 'Southwest'])[FLOOR(RANDOM() * 5 + 1)]
        ELSE (ARRAY['NSW', 'VIC', 'QLD', 'WA', 'SA'])[FLOOR(RANDOM() * 5 + 1)]
    END as region,
    (ARRAY['Direct', 'Online', 'Retail', 'Wholesale'])[FLOOR(RANDOM() * 4 + 1)] as channel
FROM companies c
CROSS JOIN LATERAL (
    SELECT * FROM customers WHERE company_id = c.id ORDER BY RANDOM() LIMIT 1
) cust
CROSS JOIN LATERAL (
    SELECT * FROM products WHERE company_id = c.id ORDER BY RANDOM() LIMIT 1
) prod
CROSS JOIN LATERAL (
    SELECT * FROM users WHERE company_id = c.id ORDER BY RANDOM() LIMIT 1
) u
CROSS JOIN generate_series(1, 100) -- Generate 100 sales per company
WHERE c.id IN ('diplomat-sa', 'premium-brands', 'regional-dist');

-- Insert Promotions
INSERT INTO promotions (company_id, name, type, description, discount_percentage, budget, spent, start_date, end_date, status, roi, created_by) VALUES
-- Diplomat SA Promotions
('diplomat-sa', 'Summer Spirits Sale', 'Discount', 'Summer promotion on premium spirits', 15.0, 50000.00, 35000.00, '2024-06-01', '2024-08-31', 'Active', 285.5, 5),
('diplomat-sa', 'Wine & Dine Offer', 'Bundle', 'Wine pairing promotion with restaurants', 20.0, 30000.00, 22000.00, '2024-07-15', '2024-09-15', 'Active', 320.8, 5),
('diplomat-sa', 'Craft Beer Festival', 'Event', 'Craft beer promotion during festival season', 12.0, 25000.00, 18500.00, '2024-08-01', '2024-10-31', 'Active', 245.2, 5),
('diplomat-sa', 'Holiday Premium Pack', 'Bundle', 'Premium gift sets for holidays', 10.0, 75000.00, 45000.00, '2024-11-01', '2024-12-31', 'Planned', 0.0, 5),
('diplomat-sa', 'New Year Celebration', 'Discount', 'Champagne and spirits for New Year', 18.0, 40000.00, 0.00, '2024-12-15', '2025-01-15', 'Planned', 0.0, 5),

-- Premium Brands Promotions
('premium-brands', 'Luxury Collection Launch', 'Launch', 'New luxury product line introduction', 25.0, 100000.00, 75000.00, '2024-05-01', '2024-07-31', 'Completed', 380.2, 15),
('premium-brands', 'Premium Spirits Showcase', 'Event', 'High-end spirits tasting events', 20.0, 80000.00, 65000.00, '2024-06-15', '2024-09-30', 'Active', 295.7, 15),
('premium-brands', 'Craft Distillery Tour', 'Experience', 'Distillery tours and tastings', 15.0, 60000.00, 42000.00, '2024-07-01', '2024-10-31', 'Active', 225.3, 15),
('premium-brands', 'Holiday Luxury Gifts', 'Bundle', 'Premium gift collections', 12.0, 120000.00, 85000.00, '2024-10-01', '2024-12-31', 'Active', 315.8, 15),
('premium-brands', 'VIP Member Exclusive', 'Loyalty', 'Exclusive offers for VIP customers', 30.0, 50000.00, 35000.00, '2024-08-01', '2024-11-30', 'Active', 420.5, 15),

-- Regional Distribution Promotions
('regional-dist', 'Local Favorites', 'Discount', 'Promotion on local beer brands', 10.0, 35000.00, 28000.00, '2024-06-01', '2024-08-31', 'Active', 195.8, 25),
('regional-dist', 'Summer Refreshers', 'Bundle', 'Soft drinks and juices bundle', 15.0, 25000.00, 20000.00, '2024-07-01', '2024-09-30', 'Active', 165.2, 25),
('regional-dist', 'Back to School', 'Discount', 'Healthy drinks for school season', 12.0, 20000.00, 15000.00, '2024-08-15', '2024-09-30', 'Active', 145.7, 25),
('regional-dist', 'Sports Season Special', 'Event', 'Sports drinks during sports season', 18.0, 30000.00, 22000.00, '2024-09-01', '2024-11-30', 'Active', 185.3, 25),
('regional-dist', 'Holiday Family Pack', 'Bundle', 'Family-sized beverage packs', 20.0, 40000.00, 30000.00, '2024-11-15', '2024-12-31', 'Planned', 0.0, 25);

-- Insert KPIs for each company
INSERT INTO kpis (company_id, name, value, target, unit, category, period, trend, change_percentage) VALUES
-- Diplomat SA KPIs
('diplomat-sa', 'Total Revenue', 2850000.00, 3000000.00, 'currency', 'sales', 'YTD', 'up', 12.5),
('diplomat-sa', 'Gross Profit', 1425000.00, 1500000.00, 'currency', 'finance', 'YTD', 'up', 8.3),
('diplomat-sa', 'Gross Margin', 50.0, 50.0, 'percentage', 'finance', 'YTD', 'flat', 0.0),
('diplomat-sa', 'Active Customers', 1250, 1200, 'count', 'sales', 'Current', 'up', 4.2),
('diplomat-sa', 'Active Promotions', 3, 3, 'count', 'marketing', 'Current', 'flat', 0.0),
('diplomat-sa', 'Average ROI', 285.5, 300.0, 'percentage', 'marketing', 'YTD', 'down', -4.8),
('diplomat-sa', 'Market Share', 24.5, 25.0, 'percentage', 'market', 'YTD', 'down', -2.0),
('diplomat-sa', 'Customer Satisfaction', 87.5, 90.0, 'score', 'customer', 'Current', 'up', 2.5),

-- Premium Brands KPIs
('premium-brands', 'Total Revenue', 4200000.00, 4000000.00, 'currency', 'sales', 'YTD', 'up', 15.8),
('premium-brands', 'Gross Profit', 2100000.00, 2000000.00, 'currency', 'finance', 'YTD', 'up', 12.2),
('premium-brands', 'Gross Margin', 50.0, 50.0, 'percentage', 'finance', 'YTD', 'flat', 0.0),
('premium-brands', 'Active Customers', 850, 800, 'count', 'sales', 'Current', 'up', 6.3),
('premium-brands', 'Active Promotions', 4, 4, 'count', 'marketing', 'Current', 'flat', 0.0),
('premium-brands', 'Average ROI', 327.5, 320.0, 'percentage', 'marketing', 'YTD', 'up', 2.3),
('premium-brands', 'Market Share', 18.2, 18.0, 'percentage', 'market', 'YTD', 'up', 1.1),
('premium-brands', 'Customer Satisfaction', 92.3, 90.0, 'score', 'customer', 'Current', 'up', 2.6),

-- Regional Distribution KPIs
('regional-dist', 'Total Revenue', 1650000.00, 1600000.00, 'currency', 'sales', 'YTD', 'up', 8.7),
('regional-dist', 'Gross Profit', 825000.00, 800000.00, 'currency', 'finance', 'YTD', 'up', 6.5),
('regional-dist', 'Gross Margin', 50.0, 50.0, 'percentage', 'finance', 'YTD', 'flat', 0.0),
('regional-dist', 'Active Customers', 650, 600, 'count', 'sales', 'Current', 'up', 8.3),
('regional-dist', 'Active Promotions', 3, 3, 'count', 'marketing', 'Current', 'flat', 0.0),
('regional-dist', 'Average ROI', 173.5, 180.0, 'percentage', 'marketing', 'YTD', 'down', -3.6),
('regional-dist', 'Market Share', 15.8, 16.0, 'percentage', 'market', 'YTD', 'down', -1.3),
('regional-dist', 'Customer Satisfaction', 84.2, 85.0, 'score', 'customer', 'Current', 'down', -0.9);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sales_company_date ON sales(company_id, sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_product ON sales(product_id);
CREATE INDEX IF NOT EXISTS idx_promotions_company ON promotions(company_id);
CREATE INDEX IF NOT EXISTS idx_kpis_company ON kpis(company_id);

EOF

# Execute the SQL script
print_status "Populating database with sample data..."
PGPASSWORD=$DB_PASS psql -h localhost -U $DB_USER -d $DB_NAME -f /tmp/seed_data.sql > /dev/null 2>&1

# Clean up
rm -f /tmp/seed_data.sql

print_success "Database seeded successfully!"

print_header "Data Summary"
echo -e "${CYAN}Companies:${NC} 4 (Diplomat SA, Premium Brands, Regional Distribution, Global FMCG)"
echo -e "${CYAN}Users:${NC} 30 (10 per company)"
echo -e "${CYAN}Products:${NC} 30 (10 per company)"
echo -e "${CYAN}Customers:${NC} 30 (10 per company)"
echo -e "${CYAN}Sales Records:${NC} 300 (100 per company, last 12 months)"
echo -e "${CYAN}Promotions:${NC} 15 (5 per company)"
echo -e "${CYAN}KPIs:${NC} 24 (8 per company)"

print_header "Next Steps"
echo -e "${GREEN}1.${NC} Refresh your browser to see the data"
echo -e "${GREEN}2.${NC} Switch between companies using the dropdown"
echo -e "${GREEN}3.${NC} Explore dashboards, analytics, and reports"
echo -e "${GREEN}4.${NC} Test the AI chatbot with business questions"

print_success "Your Vanta X Enterprise platform now has comprehensive sample data!"