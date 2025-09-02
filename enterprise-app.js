/**
 * Enterprise FMCG Platform - Frontend Application
 * Advanced React-like functionality with vanilla JavaScript
 * 
 * Features:
 * - Multi-company support
 * - Real-time data updates
 * - AI-powered insights
 * - Interactive dashboards
 * - Comprehensive analytics
 * - Progressive Web App capabilities
 */

class EnterpriseApp {
    constructor() {
        this.apiBaseUrl = 'http://localhost:4000/api/v2';
        this.currentCompany = 'diplomat-sa';
        this.currentUser = 'diplomat-sa-user-1';
        this.currentPage = 'dashboard';
        this.data = {};
        this.cache = new Map();
        this.eventListeners = new Map();
        
        this.init();
    }
    
    async init() {
        console.log('🚀 Initializing Enterprise FMCG Platform...');
        
        // Initialize event listeners
        this.setupEventListeners();
        
        // Load initial data
        await this.loadInitialData();
        
        // Render dashboard
        this.renderPage('dashboard');
        
        // Setup real-time updates
        this.setupRealTimeUpdates();
        
        console.log('✅ Enterprise Platform initialized successfully');
    }
    
    setupEventListeners() {
        // Navigation
        document.addEventListener('click', (e) => {
            if (e.target.matches('.nav-link')) {
                e.preventDefault();
                const page = e.target.dataset.page;
                this.navigateTo(page);
            }
        });
        
        // Company selector
        const companySelector = document.getElementById('companySelector');
        if (companySelector) {
            companySelector.addEventListener('change', (e) => {
                this.switchCompany(e.target.value);
            });
        }
        
        // AI Chat
        const aiChatToggle = document.getElementById('aiChatToggle');
        if (aiChatToggle) {
            aiChatToggle.addEventListener('click', () => {
                this.toggleAIChat();
            });
        }
        
        // Global error handling
        window.addEventListener('error', (e) => {
            console.error('Application error:', e.error);
            this.showNotification('An error occurred. Please try again.', 'error');
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'k':
                        e.preventDefault();
                        this.toggleAIChat();
                        break;
                    case '1':
                        e.preventDefault();
                        this.navigateTo('dashboard');
                        break;
                    case '2':
                        e.preventDefault();
                        this.navigateTo('analytics');
                        break;
                }
            }
        });
    }
    
    async loadInitialData() {
        try {
            this.showLoading(true);
            
            // Load dashboard data
            const dashboardData = await this.apiCall('/dashboard', {
                companyId: this.currentCompany,
                userId: this.currentUser
            });
            
            this.data.dashboard = dashboardData;
            
            // Load AI models status
            const aiModels = await this.apiCall('/ai/models', {
                companyId: this.currentCompany
            });
            
            this.data.aiModels = aiModels.models;
            
            // Cache the data
            this.cache.set('dashboard', dashboardData);
            this.cache.set('aiModels', aiModels.models);
            
        } catch (error) {
            console.error('Failed to load initial data:', error);
            this.showNotification('Failed to load data. Please refresh the page.', 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    async apiCall(endpoint, params = {}) {
        const url = new URL(this.apiBaseUrl + endpoint);
        
        // Add query parameters
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                url.searchParams.append(key, params[key]);
            }
        });
        
        const headers = {
            'Content-Type': 'application/json',
            'X-Company-ID': this.currentCompany,
            'X-User-ID': this.currentUser
        };
        
        try {
            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: headers
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API call failed:', error);
            throw error;
        }
    }
    
    async postApiCall(endpoint, data = {}) {
        const url = this.apiBaseUrl + endpoint;
        
        const headers = {
            'Content-Type': 'application/json',
            'X-Company-ID': this.currentCompany,
            'X-User-ID': this.currentUser
        };
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const responseData = await response.json();
            return responseData;
        } catch (error) {
            console.error('API POST call failed:', error);
            throw error;
        }
    }
    
    navigateTo(page) {
        // Update active navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`[data-page="${page}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
        
        // Update current page
        this.currentPage = page;
        
        // Render page
        this.renderPage(page);
        
        // Update URL
        window.history.pushState({ page }, '', `#${page}`);
    }
    
    async renderPage(page) {
        const contentContainer = document.getElementById('pageContent');
        if (!contentContainer) return;
        
        try {
            this.showLoading(true);
            
            let content = '';
            
            switch (page) {
                case 'dashboard':
                    content = await this.renderDashboard();
                    break;
                case 'analytics':
                    content = await this.renderAnalytics();
                    break;
                case 'products':
                    content = await this.renderProducts();
                    break;
                case 'customers':
                    content = await this.renderCustomers();
                    break;
                case 'promotions':
                    content = await this.renderPromotions();
                    break;
                case 'sales':
                    content = await this.renderSales();
                    break;
                case 'supply-chain':
                    content = await this.renderSupplyChain();
                    break;
                case 'financial':
                    content = await this.renderFinancial();
                    break;
                case 'sustainability':
                    content = await this.renderSustainability();
                    break;
                case 'ai-insights':
                    content = await this.renderAIInsights();
                    break;
                case 'contracts':
                    content = await this.renderContracts();
                    break;
                case 'claims':
                    content = await this.renderClaims();
                    break;
                case 'tasks':
                    content = await this.renderTasks();
                    break;
                case 'reports':
                    content = await this.renderReports();
                    break;
                case 'integrations':
                    content = await this.renderIntegrations();
                    break;
                case 'licensing':
                    content = await this.renderLicensing();
                    break;
                default:
                    content = await this.renderDashboard();
            }
            
            contentContainer.innerHTML = content;
            
            // Add fade-in animation
            contentContainer.classList.add('fade-in');
            
            // Setup page-specific event listeners
            this.setupPageEventListeners(page);
            
        } catch (error) {
            console.error('Failed to render page:', error);
            contentContainer.innerHTML = this.renderError('Failed to load page content');
        } finally {
            this.showLoading(false);
        }
    }
    
    async renderDashboard() {
        const dashboardData = this.data.dashboard || {};
        const company = dashboardData.company || {};
        const kpis = dashboardData.kpis || [];
        const recentSales = dashboardData.recentSales || [];
        const activePromotions = dashboardData.activePromotions || [];
        const notifications = dashboardData.notifications || [];
        const tasks = dashboardData.tasks || [];
        const insights = dashboardData.insights || [];
        const licenseStatus = dashboardData.licenseStatus || {};
        
        return `
            <div class="page-header">
                <h1 class="page-title">Dashboard</h1>
                <p class="page-subtitle">Welcome to ${company.name || 'Your Company'} - ${company.tier || 'Professional'} Edition</p>
            </div>
            
            <!-- KPI Grid -->
            <div class="kpi-grid">
                ${kpis.map(kpi => `
                    <div class="kpi-card">
                        <div class="kpi-header">
                            <div class="kpi-title">${kpi.name}</div>
                            <div class="kpi-trend ${kpi.trend}">
                                ${kpi.trend === 'up' ? '↗' : kpi.trend === 'down' ? '↘' : '→'} ${kpi.change}%
                            </div>
                        </div>
                        <div class="kpi-value">${this.formatValue(kpi.value, kpi.unit)}</div>
                        <div class="kpi-target">Target: ${this.formatValue(kpi.target, kpi.unit)}</div>
                    </div>
                `).join('')}
            </div>
            
            <!-- Dashboard Grid -->
            <div class="dashboard-grid">
                <!-- Recent Sales -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Recent Sales</h3>
                        <div class="card-icon" style="background: rgba(5, 150, 105, 0.1); color: var(--success-color);">💰</div>
                    </div>
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Order</th>
                                    <th>Customer</th>
                                    <th>Value</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${recentSales.slice(0, 5).map(sale => `
                                    <tr>
                                        <td>${sale.orderNumber}</td>
                                        <td>Customer ${sale.customer}</td>
                                        <td>${this.formatCurrency(sale.value)}</td>
                                        <td><span class="status-badge ${sale.status}">${sale.status}</span></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <!-- Active Promotions -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Active Promotions</h3>
                        <div class="card-icon" style="background: rgba(124, 58, 237, 0.1); color: var(--accent-color);">🎯</div>
                    </div>
                    ${activePromotions.map(promo => `
                        <div style="padding: 1rem; border-bottom: 1px solid var(--gray-200); last-child:border-bottom: none;">
                            <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 0.5rem;">
                                <div style="font-weight: 600;">${promo.name}</div>
                                <div style="font-size: 0.875rem; color: var(--success-color);">${promo.roi}% ROI</div>
                            </div>
                            <div style="font-size: 0.875rem; color: var(--gray-600);">
                                Budget: ${this.formatCurrency(promo.spent)} / ${this.formatCurrency(promo.budget)}
                            </div>
                            <div style="background: var(--gray-200); height: 4px; border-radius: 2px; margin-top: 0.5rem;">
                                <div style="background: var(--success-color); height: 100%; width: ${(promo.spent / promo.budget * 100)}%; border-radius: 2px;"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <!-- AI Insights -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">AI Insights</h3>
                        <div class="card-icon" style="background: rgba(1, 118, 211, 0.1); color: var(--primary-color);">🤖</div>
                    </div>
                    ${insights.slice(0, 3).map(insight => `
                        <div class="notification ${insight.priority === 'high' ? 'warning' : 'info'}" style="margin-bottom: 1rem;">
                            <div class="notification-content">
                                <div class="notification-title">${insight.title}</div>
                                <div class="notification-message">${insight.message}</div>
                                ${insight.recommendation ? `<div style="margin-top: 0.5rem; font-size: 0.75rem; color: var(--primary-color);">💡 ${insight.recommendation}</div>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <!-- Notifications -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Notifications</h3>
                        <div class="card-icon" style="background: rgba(217, 119, 6, 0.1); color: var(--warning-color);">🔔</div>
                    </div>
                    ${notifications.slice(0, 5).map(notification => `
                        <div style="padding: 0.75rem; border-bottom: 1px solid var(--gray-200); display: flex; align-items: flex-start; gap: 0.75rem;">
                            <div style="width: 8px; height: 8px; background: ${notification.read ? 'var(--gray-300)' : 'var(--primary-color)'}; border-radius: 50%; margin-top: 0.5rem;"></div>
                            <div style="flex: 1;">
                                <div style="font-weight: 600; font-size: 0.875rem;">${notification.title}</div>
                                <div style="font-size: 0.75rem; color: var(--gray-600); margin-top: 0.25rem;">${notification.message}</div>
                                <div style="font-size: 0.75rem; color: var(--gray-400); margin-top: 0.25rem;">${this.formatDate(notification.timestamp)}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <!-- Tasks -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Recent Tasks</h3>
                        <div class="card-icon" style="background: rgba(13, 148, 136, 0.1); color: var(--secondary-color);">✅</div>
                    </div>
                    ${tasks.slice(0, 5).map(task => `
                        <div style="padding: 0.75rem; border-bottom: 1px solid var(--gray-200); display: flex; align-items: center; gap: 0.75rem;">
                            <div style="width: 12px; height: 12px; border: 2px solid ${task.status === 'completed' ? 'var(--success-color)' : 'var(--gray-300)'}; border-radius: 50%; ${task.status === 'completed' ? 'background: var(--success-color);' : ''}"></div>
                            <div style="flex: 1;">
                                <div style="font-weight: 500; font-size: 0.875rem;">${task.title}</div>
                                <div style="font-size: 0.75rem; color: var(--gray-600);">Due: ${this.formatDate(task.dueDate)}</div>
                            </div>
                            <div style="font-size: 0.75rem; color: var(--gray-500);">${task.progress}%</div>
                        </div>
                    `).join('')}
                </div>
                
                <!-- License Status -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">License Status</h3>
                        <div class="card-icon" style="background: rgba(124, 58, 237, 0.1); color: var(--accent-color);">📜</div>
                    </div>
                    <div style="padding: 1rem 0;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                            <div>
                                <div style="font-weight: 600;">${licenseStatus.tier || 'Professional'} Edition</div>
                                <div style="font-size: 0.875rem; color: var(--gray-600);">${licenseStatus.companyName || company.name}</div>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-weight: 600;">${licenseStatus.licenses?.used || 0}/${licenseStatus.licenses?.total || 0}</div>
                                <div style="font-size: 0.875rem; color: var(--gray-600);">Users</div>
                            </div>
                        </div>
                        <div style="background: var(--gray-200); height: 6px; border-radius: 3px;">
                            <div style="background: var(--primary-color); height: 100%; width: ${licenseStatus.licenses?.utilization || 0}%; border-radius: 3px;"></div>
                        </div>
                        <div style="font-size: 0.75rem; color: var(--gray-500); margin-top: 0.5rem;">
                            ${licenseStatus.licenses?.utilization || 0}% utilization
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    async renderAnalytics() {
        return `
            <div class="page-header">
                <h1 class="page-title">Analytics</h1>
                <p class="page-subtitle">Advanced analytics and business intelligence</p>
            </div>
            
            <div class="dashboard-grid">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Sales Performance</h3>
                        <div class="card-icon" style="background: rgba(5, 150, 105, 0.1); color: var(--success-color);">📈</div>
                    </div>
                    <div class="chart-container">
                        Sales performance chart would be rendered here
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Customer Segmentation</h3>
                        <div class="card-icon" style="background: rgba(124, 58, 237, 0.1); color: var(--accent-color);">👥</div>
                    </div>
                    <div class="chart-container">
                        Customer segmentation chart would be rendered here
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Promotion Effectiveness</h3>
                        <div class="card-icon" style="background: rgba(1, 118, 211, 0.1); color: var(--primary-color);">🎯</div>
                    </div>
                    <div class="chart-container">
                        Promotion effectiveness chart would be rendered here
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Market Share Analysis</h3>
                        <div class="card-icon" style="background: rgba(13, 148, 136, 0.1); color: var(--secondary-color);">📊</div>
                    </div>
                    <div class="chart-container">
                        Market share analysis chart would be rendered here
                    </div>
                </div>
            </div>
        `;
    }
    
    async renderProducts() {
        try {
            const productsData = await this.apiCall('/products', {
                companyId: this.currentCompany
            });
            
            const products = productsData.products || [];
            
            return `
                <div class="page-header">
                    <h1 class="page-title">Products</h1>
                    <p class="page-subtitle">Manage your product catalog and inventory</p>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Product Catalog</h3>
                        <button class="btn btn-primary">Add Product</button>
                    </div>
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Margin</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${products.map(product => `
                                    <tr>
                                        <td>
                                            <div style="font-weight: 600;">${product.name}</div>
                                            <div style="font-size: 0.75rem; color: var(--gray-500);">${product.sku}</div>
                                        </td>
                                        <td>${product.category}</td>
                                        <td>${this.formatCurrency(product.price)}</td>
                                        <td>
                                            <div>${product.stock}</div>
                                            <div style="font-size: 0.75rem; color: ${product.stock <= product.minStock ? 'var(--error-color)' : 'var(--gray-500)'};">
                                                Min: ${product.minStock}
                                            </div>
                                        </td>
                                        <td>${product.margin}%</td>
                                        <td><span class="status-badge ${product.status}">${product.status}</span></td>
                                        <td>
                                            <button class="btn btn-secondary btn-sm">Edit</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } catch (error) {
            return this.renderError('Failed to load products');
        }
    }
    
    async renderCustomers() {
        try {
            const customersData = await this.apiCall('/customers', {
                companyId: this.currentCompany
            });
            
            const customers = customersData.customers || [];
            
            return `
                <div class="page-header">
                    <h1 class="page-title">Customers</h1>
                    <p class="page-subtitle">Manage customer relationships and accounts</p>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Customer Accounts</h3>
                        <button class="btn btn-primary">Add Customer</button>
                    </div>
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Type</th>
                                    <th>Region</th>
                                    <th>Sales LTD</th>
                                    <th>Segment</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${customers.map(customer => `
                                    <tr>
                                        <td>
                                            <div style="font-weight: 600;">${customer.name}</div>
                                            <div style="font-size: 0.75rem; color: var(--gray-500);">${customer.contact}</div>
                                        </td>
                                        <td>${customer.type}</td>
                                        <td>${customer.region}</td>
                                        <td>${this.formatCurrency(customer.salesLTD)}</td>
                                        <td><span class="status-badge ${customer.segment.toLowerCase()}">${customer.segment}</span></td>
                                        <td><span class="status-badge ${customer.status}">${customer.status}</span></td>
                                        <td>
                                            <button class="btn btn-secondary btn-sm">Edit</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } catch (error) {
            return this.renderError('Failed to load customers');
        }
    }
    
    async renderPromotions() {
        try {
            const promotionsData = await this.apiCall('/promotions', {
                companyId: this.currentCompany
            });
            
            const promotions = promotionsData.promotions || [];
            
            return `
                <div class="page-header">
                    <h1 class="page-title">Promotions</h1>
                    <p class="page-subtitle">Manage marketing campaigns and promotional activities</p>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Marketing Campaigns</h3>
                        <button class="btn btn-primary">Create Campaign</button>
                    </div>
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Campaign</th>
                                    <th>Type</th>
                                    <th>Budget</th>
                                    <th>Spent</th>
                                    <th>ROI</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${promotions.map(promo => `
                                    <tr>
                                        <td>
                                            <div style="font-weight: 600;">${promo.name}</div>
                                            <div style="font-size: 0.75rem; color: var(--gray-500);">${promo.startDate} - ${promo.endDate}</div>
                                        </td>
                                        <td>${promo.type}</td>
                                        <td>${this.formatCurrency(promo.budget)}</td>
                                        <td>
                                            <div>${this.formatCurrency(promo.spent)}</div>
                                            <div style="font-size: 0.75rem; color: var(--gray-500);">
                                                ${Math.round((promo.spent / promo.budget) * 100)}%
                                            </div>
                                        </td>
                                        <td style="color: ${promo.roi > 200 ? 'var(--success-color)' : 'var(--gray-700)'};">
                                            ${promo.roi}%
                                        </td>
                                        <td><span class="status-badge ${promo.status.toLowerCase()}">${promo.status}</span></td>
                                        <td>
                                            <button class="btn btn-secondary btn-sm">Edit</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } catch (error) {
            return this.renderError('Failed to load promotions');
        }
    }
    
    async renderSales() {
        try {
            const salesData = await this.apiCall('/sales', {
                companyId: this.currentCompany
            });
            
            const sales = salesData.sales || [];
            
            return `
                <div class="page-header">
                    <h1 class="page-title">Sales</h1>
                    <p class="page-subtitle">Track sales performance and transactions</p>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Sales Transactions</h3>
                        <button class="btn btn-primary">Add Sale</button>
                    </div>
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Order</th>
                                    <th>Date</th>
                                    <th>Customer</th>
                                    <th>Product</th>
                                    <th>Quantity</th>
                                    <th>Value</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${sales.slice(0, 20).map(sale => `
                                    <tr>
                                        <td>${sale.orderNumber}</td>
                                        <td>${this.formatDate(sale.date)}</td>
                                        <td>Customer ${sale.customer}</td>
                                        <td>Product ${sale.product}</td>
                                        <td>${sale.quantity}</td>
                                        <td>${this.formatCurrency(sale.value)}</td>
                                        <td><span class="status-badge ${sale.status}">${sale.status}</span></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } catch (error) {
            return this.renderError('Failed to load sales');
        }
    }
    
    async renderSupplyChain() {
        try {
            const supplyChainData = await this.apiCall('/supply-chain', {
                companyId: this.currentCompany
            });
            
            const supplyChain = supplyChainData.supplyChain || {};
            
            return `
                <div class="page-header">
                    <h1 class="page-title">Supply Chain</h1>
                    <p class="page-subtitle">Monitor supply chain operations and logistics</p>
                </div>
                
                <div class="dashboard-grid">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Suppliers</h3>
                            <div class="card-icon" style="background: rgba(5, 150, 105, 0.1); color: var(--success-color);">🏭</div>
                        </div>
                        <div class="table-container">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Supplier</th>
                                        <th>Category</th>
                                        <th>Rating</th>
                                        <th>On-Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${(supplyChain.suppliers || []).map(supplier => `
                                        <tr>
                                            <td>${supplier.name}</td>
                                            <td>${supplier.category}</td>
                                            <td>${supplier.rating}/5</td>
                                            <td>${Math.round(supplier.onTime * 100)}%</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Logistics Overview</h3>
                            <div class="card-icon" style="background: rgba(13, 148, 136, 0.1); color: var(--secondary-color);">🚚</div>
                        </div>
                        <div style="padding: 1rem 0;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                                <div>
                                    <div style="font-size: 0.875rem; color: var(--gray-600);">Warehouses</div>
                                    <div style="font-size: 1.5rem; font-weight: 600;">${supplyChain.logistics?.warehouses || 0}</div>
                                </div>
                                <div>
                                    <div style="font-size: 0.875rem; color: var(--gray-600);">Distribution Centers</div>
                                    <div style="font-size: 1.5rem; font-weight: 600;">${supplyChain.logistics?.distributionCenters || 0}</div>
                                </div>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <div>
                                    <div style="font-size: 0.875rem; color: var(--gray-600);">Avg Delivery Time</div>
                                    <div style="font-size: 1.5rem; font-weight: 600;">${supplyChain.logistics?.averageDeliveryTime || 0} days</div>
                                </div>
                                <div>
                                    <div style="font-size: 0.875rem; color: var(--gray-600);">On-Time Delivery</div>
                                    <div style="font-size: 1.5rem; font-weight: 600;">${Math.round((supplyChain.logistics?.onTimeDelivery || 0) * 100)}%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Inventory Management</h3>
                            <div class="card-icon" style="background: rgba(124, 58, 237, 0.1); color: var(--accent-color);">📦</div>
                        </div>
                        <div style="padding: 1rem 0;">
                            <div style="margin-bottom: 1rem;">
                                <div style="font-size: 0.875rem; color: var(--gray-600);">Total Inventory Value</div>
                                <div style="font-size: 1.5rem; font-weight: 600;">${this.formatCurrency(supplyChain.inventory?.totalValue || 0)}</div>
                            </div>
                            <div style="margin-bottom: 1rem;">
                                <div style="font-size: 0.875rem; color: var(--gray-600);">Turnover Rate</div>
                                <div style="font-size: 1.5rem; font-weight: 600;">${supplyChain.inventory?.turnoverRate || 0}x</div>
                            </div>
                            <div>
                                <div style="font-size: 0.875rem; color: var(--gray-600);">Stockout Rate</div>
                                <div style="font-size: 1.5rem; font-weight: 600;">${Math.round((supplyChain.inventory?.stockouts || 0) * 100)}%</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Quality Control</h3>
                            <div class="card-icon" style="background: rgba(1, 118, 211, 0.1); color: var(--primary-color);">✅</div>
                        </div>
                        <div style="padding: 1rem 0;">
                            <div style="margin-bottom: 1rem;">
                                <div style="font-size: 0.875rem; color: var(--gray-600);">Quality Score</div>
                                <div style="font-size: 1.5rem; font-weight: 600;">${Math.round((supplyChain.qualityControl?.qualityScore || 0) * 100)}%</div>
                            </div>
                            <div style="margin-bottom: 1rem;">
                                <div style="font-size: 0.875rem; color: var(--gray-600);">Defect Rate</div>
                                <div style="font-size: 1.5rem; font-weight: 600;">${Math.round((supplyChain.qualityControl?.defectRate || 0) * 100)}%</div>
                            </div>
                            <div>
                                <div style="font-size: 0.875rem; color: var(--gray-600);">Compliance</div>
                                <div style="font-size: 1.5rem; font-weight: 600;">${Math.round((supplyChain.qualityControl?.certificationCompliance || 0) * 100)}%</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            return this.renderError('Failed to load supply chain data');
        }
    }
    
    async renderFinancial() {
        try {
            const financialData = await this.apiCall('/financial', {
                companyId: this.currentCompany
            });
            
            const financial = financialData.financial || {};
            
            return `
                <div class="page-header">
                    <h1 class="page-title">Financial Management</h1>
                    <p class="page-subtitle">Monitor financial performance and cash flow</p>
                </div>
                
                <div class="dashboard-grid">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Revenue Overview</h3>
                            <div class="card-icon" style="background: rgba(5, 150, 105, 0.1); color: var(--success-color);">💰</div>
                        </div>
                        <div style="padding: 1rem 0;">
                            <div style="margin-bottom: 1rem;">
                                <div style="font-size: 0.875rem; color: var(--gray-600);">Total Revenue</div>
                                <div style="font-size: 1.5rem; font-weight: 600;">${this.formatCurrency(financial.revenue?.total || 0)}</div>
                            </div>
                            <div style="margin-bottom: 1rem;">
                                <div style="font-size: 0.875rem; color: var(--gray-600);">Recurring Revenue</div>
                                <div style="font-size: 1.5rem; font-weight: 600;">${this.formatCurrency(financial.revenue?.recurring || 0)}</div>
                            </div>
                            <div>
                                <div style="font-size: 0.875rem; color: var(--gray-600);">Growth Rate</div>
                                <div style="font-size: 1.5rem; font-weight: 600;">${Math.round((financial.revenue?.growth || 0) * 100)}%</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Profitability</h3>
                            <div class="card-icon" style="background: rgba(1, 118, 211, 0.1); color: var(--primary-color);">📊</div>
                        </div>
                        <div style="padding: 1rem 0;">
                            <div style="margin-bottom: 1rem;">
                                <div style="font-size: 0.875rem; color: var(--gray-600);">Gross Margin</div>
                                <div style="font-size: 1.5rem; font-weight: 600;">${Math.round((financial.profitability?.grossMargin || 0) * 100)}%</div>
                            </div>
                            <div style="margin-bottom: 1rem;">
                                <div style="font-size: 0.875rem; color: var(--gray-600);">Operating Margin</div>
                                <div style="font-size: 1.5rem; font-weight: 600;">${Math.round((financial.profitability?.operatingMargin || 0) * 100)}%</div>
                            </div>
                            <div>
                                <div style="font-size: 0.875rem; color: var(--gray-600);">Net Margin</div>
                                <div style="font-size: 1.5rem; font-weight: 600;">${Math.round((financial.profitability?.netMargin || 0) * 100)}%</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Cash Flow</h3>
                            <div class="card-icon" style="background: rgba(13, 148, 136, 0.1); color: var(--secondary-color);">💸</div>
                        </div>
                        <div style="padding: 1rem 0;">
                            <div style="margin-bottom: 1rem;">
                                <div style="font-size: 0.875rem; color: var(--gray-600);">Operating Cash Flow</div>
                                <div style="font-size: 1.5rem; font-weight: 600;">${this.formatCurrency(financial.cashFlow?.operating || 0)}</div>
                            </div>
                            <div style="margin-bottom: 1rem;">
                                <div style="font-size: 0.875rem; color: var(--gray-600);">Free Cash Flow</div>
                                <div style="font-size: 1.5rem; font-weight: 600;">${this.formatCurrency(financial.cashFlow?.free || 0)}</div>
                            </div>
                            <div>
                                <div style="font-size: 0.875rem; color: var(--gray-600);">Investing Cash Flow</div>
                                <div style="font-size: 1.5rem; font-weight: 600;">${this.formatCurrency(financial.cashFlow?.investing || 0)}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Working Capital</h3>
                            <div class="card-icon" style="background: rgba(124, 58, 237, 0.1); color: var(--accent-color);">🏦</div>
                        </div>
                        <div style="padding: 1rem 0;">
                            <div style="margin-bottom: 1rem;">
                                <div style="font-size: 0.875rem; color: var(--gray-600);">Current Working Capital</div>
                                <div style="font-size: 1.5rem; font-weight: 600;">${this.formatCurrency(financial.workingCapital?.current || 0)}</div>
                            </div>
                            <div style="margin-bottom: 1rem;">
                                <div style="font-size: 0.875rem; color: var(--gray-600);">DSO (Days)</div>
                                <div style="font-size: 1.5rem; font-weight: 600;">${Math.round(financial.workingCapital?.dso || 0)}</div>
                            </div>
                            <div>
                                <div style="font-size: 0.875rem; color: var(--gray-600);">DPO (Days)</div>
                                <div style="font-size: 1.5rem; font-weight: 600;">${Math.round(financial.workingCapital?.dpo || 0)}</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            return this.renderError('Failed to load financial data');
        }
    }
    
    async renderSustainability() {
        try {
            const sustainabilityData = await this.apiCall('/sustainability', {
                companyId: this.currentCompany
            });
            
            const sustainability = sustainabilityData.sustainability || {};
            
            return `
                <div class="page-header">
                    <h1 class="page-title">Sustainability</h1>
                    <p class="page-subtitle">Track environmental and social impact</p>
                </div>
                
                <div class="dashboard-grid">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Carbon Footprint</h3>
                            <div class="card-icon" style="background: rgba(5, 150, 105, 0.1); color: var(--success-color);">🌍</div>
                        </div>
                        <div style="padding: 1rem 0;">
                            <div style="margin-bottom: 1rem;">
                                <div style="font-size: 0.875rem; color: var(--gray-600);">Total Emissions</div>
                                <div style="font-size: 1.5rem; font-weight: 600;">${sustainability.carbonFootprint?.total || 0} ${sustainability.carbonFootprint?.unit || 'tCO2e'}</div>
                            </div>
                            <div style="margin-bottom: 1rem;">
                                <div style="font-size: 0.875rem; color: var(--gray-600);">Target</div>
                                <div style="font-size: 1.5rem; font-weight: 600;">${sustainability.carbonFootprint?.target || 0} ${sustainability.carbonFootprint?.unit || 'tCO2e'}</div>
                            </div>
                            <div>
                                <div style="font-size: 0.875rem; color: var(--gray-600);">Trend</div>
                                <div style="font-size: 1.5rem; font-weight: 600; color: var(--success-color);">
                                    ${sustainability.carbonFootprint?.trend === 'down' ? '↓' : '↑'} ${Math.abs(sustainability.carbonFootprint?.change || 0)}%
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Water Usage</h3>
                            <div class="card-icon" style="background: rgba(1, 118, 211, 0.1); color: var(--primary-color);">💧</div>
                        </div>
                        <div style="padding: 1rem 0;">
                            <div style="margin-bottom: 1rem;">
                                <div style="font-size: 0.875rem; color: var(--gray-600);">Total Usage</div>
                                <div style="font-size: 1.5rem; font-weight: 600;">${sustainability.waterUsage?.total || 0} ${sustainability.waterUsage?.unit || 'liters'}</div>
                            </div>
                            <div style="margin-bottom: 1rem;">
                                <div style="font-size: 0.875rem; color: var(--gray-600);">Efficiency</div>
                                <div style="font-size: 1.5rem; font-weight: 600;">${Math.round((sustainability.waterUsage?.efficiency || 0) * 100)}%</div>
                            </div>
                            <div>
                                <div style="font-size: 0.875rem; color: var(--gray-600);">Recycled</div>
                                <div style="font-size: 1.5rem; font-weight: 600;">${Math.round((sustainability.waterUsage?.recycled || 0) * 100)}%</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Waste Management</h3>
                            <div class="card-icon" style="background: rgba(13, 148, 136, 0.1); color: var(--secondary-color);">♻️</div>
                        </div>
                        <div style="padding: 1rem 0;">
                            <div style="margin-bottom: 1rem;">
                                <div style="font-size: 0.875rem; color: var(--gray-600);">Total Waste</div>
                                <div style="font-size: 1.5rem; font-weight: 600;">${sustainability.wasteManagement?.total || 0} ${sustainability.wasteManagement?.unit || 'tons'}</div>
                            </div>
                            <div style="margin-bottom: 1rem;">
                                <div style="font-size: 0.875rem; color: var(--gray-600);">Recycled</div>
                                <div style="font-size: 1.5rem; font-weight: 600;">${Math.round((sustainability.wasteManagement?.recycled || 0) * 100)}%</div>
                            </div>
                            <div>
                                <div style="font-size: 0.875rem; color: var(--gray-600);">Landfill</div>
                                <div style="font-size: 1.5rem; font-weight: 600;">${Math.round((sustainability.wasteManagement?.landfill || 0) * 100)}%</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Certifications</h3>
                            <div class="card-icon" style="background: rgba(124, 58, 237, 0.1); color: var(--accent-color);">🏆</div>
                        </div>
                        <div style="padding: 1rem 0;">
                            ${Object.entries(sustainability.certifications || {}).map(([cert, status]) => `
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                    <div style="font-size: 0.875rem;">${cert.toUpperCase()}</div>
                                    <div style="color: ${status ? 'var(--success-color)' : 'var(--gray-400)'};">
                                        ${status ? '✅' : '❌'}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            return this.renderError('Failed to load sustainability data');
        }
    }
    
    async renderAIInsights() {
        try {
            const insightsData = await this.apiCall('/ai/insights', {
                companyId: this.currentCompany
            });
            
            const insights = insightsData.insights || [];
            const models = this.data.aiModels || [];
            
            return `
                <div class="page-header">
                    <h1 class="page-title">AI Insights</h1>
                    <p class="page-subtitle">Artificial intelligence powered business insights</p>
                </div>
                
                <div class="dashboard-grid">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">AI Models Status</h3>
                            <div class="card-icon" style="background: rgba(1, 118, 211, 0.1); color: var(--primary-color);">🤖</div>
                        </div>
                        <div class="table-container">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Model</th>
                                        <th>Accuracy</th>
                                        <th>Status</th>
                                        <th>Last Trained</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${models.map(model => `
                                        <tr>
                                            <td>${model.displayName}</td>
                                            <td>${Math.round(model.accuracy * 100)}%</td>
                                            <td><span class="status-badge ${model.status}">${model.status}</span></td>
                                            <td>${this.formatDate(model.lastTrained)}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Business Insights</h3>
                            <div class="card-icon" style="background: rgba(124, 58, 237, 0.1); color: var(--accent-color);">💡</div>
                        </div>
                        ${insights.map(insight => `
                            <div class="notification ${insight.priority === 'high' ? 'warning' : insight.priority === 'critical' ? 'error' : 'info'}" style="margin-bottom: 1rem;">
                                <div class="notification-content">
                                    <div class="notification-title">${insight.title}</div>
                                    <div class="notification-message">${insight.message}</div>
                                    ${insight.recommendation ? `
                                        <div style="margin-top: 0.5rem; padding: 0.5rem; background: rgba(1, 118, 211, 0.1); border-radius: 4px; font-size: 0.875rem;">
                                            <strong>Recommendation:</strong> ${insight.recommendation}
                                        </div>
                                    ` : ''}
                                    <div style="margin-top: 0.5rem; font-size: 0.75rem; color: var(--gray-500);">
                                        Confidence: ${Math.round((insight.confidence || 0) * 100)}% | Impact: ${insight.impact || 'Unknown'}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        } catch (error) {
            return this.renderError('Failed to load AI insights');
        }
    }
    
    async renderContracts() {
        try {
            const contractsData = await this.apiCall('/contracts', {
                companyId: this.currentCompany
            });
            
            const contracts = contractsData.contracts || [];
            
            return `
                <div class="page-header">
                    <h1 class="page-title">Contracts</h1>
                    <p class="page-subtitle">Manage business contracts and agreements</p>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Contract Portfolio</h3>
                        <button class="btn btn-primary">New Contract</button>
                    </div>
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Contract</th>
                                    <th>Type</th>
                                    <th>Counterparty</th>
                                    <th>Value</th>
                                    <th>End Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${contracts.slice(0, 20).map(contract => `
                                    <tr>
                                        <td>
                                            <div style="font-weight: 600;">${contract.title}</div>
                                            <div style="font-size: 0.75rem; color: var(--gray-500);">ID: ${contract.id}</div>
                                        </td>
                                        <td>${contract.type}</td>
                                        <td>${contract.counterparty}</td>
                                        <td>${this.formatCurrency(contract.value)}</td>
                                        <td>${this.formatDate(contract.endDate)}</td>
                                        <td><span class="status-badge ${contract.status.toLowerCase()}">${contract.status}</span></td>
                                        <td>
                                            <button class="btn btn-secondary btn-sm">View</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } catch (error) {
            return this.renderError('Failed to load contracts');
        }
    }
    
    async renderClaims() {
        try {
            const claimsData = await this.apiCall('/claims', {
                companyId: this.currentCompany
            });
            
            const claims = claimsData.claims || [];
            
            return `
                <div class="page-header">
                    <h1 class="page-title">Claims</h1>
                    <p class="page-subtitle">Manage claims and deductions processing</p>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Claims Processing</h3>
                        <button class="btn btn-primary">New Claim</button>
                    </div>
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Claim #</th>
                                    <th>Type</th>
                                    <th>Customer</th>
                                    <th>Amount</th>
                                    <th>Submitted</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${claims.slice(0, 20).map(claim => `
                                    <tr>
                                        <td>${claim.claimNumber}</td>
                                        <td>${claim.type}</td>
                                        <td>Customer ${claim.customer}</td>
                                        <td>${this.formatCurrency(claim.amount)}</td>
                                        <td>${this.formatDate(claim.submittedDate)}</td>
                                        <td><span class="status-badge ${claim.status.toLowerCase().replace(' ', '-')}">${claim.status}</span></td>
                                        <td>
                                            <button class="btn btn-secondary btn-sm">Review</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } catch (error) {
            return this.renderError('Failed to load claims');
        }
    }
    
    async renderTasks() {
        try {
            const tasksData = await this.apiCall('/tasks', {
                companyId: this.currentCompany
            });
            
            const tasks = tasksData.tasks || [];
            
            return `
                <div class="page-header">
                    <h1 class="page-title">Tasks</h1>
                    <p class="page-subtitle">Manage tasks and project activities</p>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Task Management</h3>
                        <button class="btn btn-primary">New Task</button>
                    </div>
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Task</th>
                                    <th>Category</th>
                                    <th>Assignee</th>
                                    <th>Priority</th>
                                    <th>Due Date</th>
                                    <th>Progress</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tasks.slice(0, 20).map(task => `
                                    <tr>
                                        <td>
                                            <div style="font-weight: 600;">${task.title}</div>
                                            <div style="font-size: 0.75rem; color: var(--gray-500);">${task.description}</div>
                                        </td>
                                        <td>${task.category}</td>
                                        <td>User ${task.assignee}</td>
                                        <td><span class="status-badge ${task.priority}">${task.priority}</span></td>
                                        <td>${this.formatDate(task.dueDate)}</td>
                                        <td>
                                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                                <div style="flex: 1; background: var(--gray-200); height: 4px; border-radius: 2px;">
                                                    <div style="background: var(--primary-color); height: 100%; width: ${task.progress}%; border-radius: 2px;"></div>
                                                </div>
                                                <div style="font-size: 0.75rem;">${task.progress}%</div>
                                            </div>
                                        </td>
                                        <td><span class="status-badge ${task.status.replace('_', '-')}">${task.status}</span></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } catch (error) {
            return this.renderError('Failed to load tasks');
        }
    }
    
    async renderReports() {
        try {
            const reportsData = await this.apiCall('/reports', {
                companyId: this.currentCompany
            });
            
            const reports = reportsData.reports || [];
            
            return `
                <div class="page-header">
                    <h1 class="page-title">Reports</h1>
                    <p class="page-subtitle">Generate and manage business reports</p>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Report Library</h3>
                        <button class="btn btn-primary">Create Report</button>
                    </div>
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Report</th>
                                    <th>Type</th>
                                    <th>Schedule</th>
                                    <th>Last Run</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${reports.slice(0, 20).map(report => `
                                    <tr>
                                        <td>
                                            <div style="font-weight: 600;">${report.name}</div>
                                            <div style="font-size: 0.75rem; color: var(--gray-500);">${report.description}</div>
                                        </td>
                                        <td>${report.type}</td>
                                        <td>${report.schedule}</td>
                                        <td>${this.formatDate(report.lastRun)}</td>
                                        <td><span class="status-badge ${report.status}">${report.status}</span></td>
                                        <td>
                                            <button class="btn btn-secondary btn-sm">Run</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } catch (error) {
            return this.renderError('Failed to load reports');
        }
    }
    
    async renderIntegrations() {
        return `
            <div class="page-header">
                <h1 class="page-title">Integrations</h1>
                <p class="page-subtitle">Connect with external systems and services</p>
            </div>
            
            <div class="dashboard-grid">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">ERP Systems</h3>
                        <div class="card-icon" style="background: rgba(1, 118, 211, 0.1); color: var(--primary-color);">🏢</div>
                    </div>
                    <div style="padding: 1rem 0;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <div>
                                <div style="font-weight: 600;">SAP S/4HANA</div>
                                <div style="font-size: 0.875rem; color: var(--gray-600);">Enterprise Resource Planning</div>
                            </div>
                            <span class="status-badge active">Connected</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <div>
                                <div style="font-weight: 600;">SAP ECC</div>
                                <div style="font-size: 0.875rem; color: var(--gray-600);">Legacy ERP System</div>
                            </div>
                            <span class="status-badge inactive">Available</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="font-weight: 600;">Oracle ERP</div>
                                <div style="font-size: 0.875rem; color: var(--gray-600);">Cloud ERP Solution</div>
                            </div>
                            <span class="status-badge inactive">Available</span>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Analytics Platforms</h3>
                        <div class="card-icon" style="background: rgba(13, 148, 136, 0.1); color: var(--secondary-color);">📊</div>
                    </div>
                    <div style="padding: 1rem 0;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <div>
                                <div style="font-weight: 600;">Power BI</div>
                                <div style="font-size: 0.875rem; color: var(--gray-600);">Microsoft Business Intelligence</div>
                            </div>
                            <span class="status-badge active">Connected</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <div>
                                <div style="font-weight: 600;">Tableau</div>
                                <div style="font-size: 0.875rem; color: var(--gray-600);">Data Visualization Platform</div>
                            </div>
                            <span class="status-badge inactive">Available</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="font-weight: 600;">Google Analytics</div>
                                <div style="font-size: 0.875rem; color: var(--gray-600);">Web Analytics</div>
                            </div>
                            <span class="status-badge active">Connected</span>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">CRM Systems</h3>
                        <div class="card-icon" style="background: rgba(124, 58, 237, 0.1); color: var(--accent-color);">👥</div>
                    </div>
                    <div style="padding: 1rem 0;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <div>
                                <div style="font-weight: 600;">Salesforce</div>
                                <div style="font-size: 0.875rem; color: var(--gray-600);">Customer Relationship Management</div>
                            </div>
                            <span class="status-badge active">Connected</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <div>
                                <div style="font-weight: 600;">HubSpot</div>
                                <div style="font-size: 0.875rem; color: var(--gray-600);">Marketing & Sales Platform</div>
                            </div>
                            <span class="status-badge inactive">Available</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="font-weight: 600;">Microsoft Dynamics</div>
                                <div style="font-size: 0.875rem; color: var(--gray-600);">Business Applications</div>
                            </div>
                            <span class="status-badge inactive">Available</span>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Communication</h3>
                        <div class="card-icon" style="background: rgba(5, 150, 105, 0.1); color: var(--success-color);">💬</div>
                    </div>
                    <div style="padding: 1rem 0;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <div>
                                <div style="font-weight: 600;">Microsoft Teams</div>
                                <div style="font-size: 0.875rem; color: var(--gray-600);">Collaboration Platform</div>
                            </div>
                            <span class="status-badge active">Connected</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <div>
                                <div style="font-weight: 600;">Slack</div>
                                <div style="font-size: 0.875rem; color: var(--gray-600);">Team Communication</div>
                            </div>
                            <span class="status-badge inactive">Available</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="font-weight: 600;">Zoom</div>
                                <div style="font-size: 0.875rem; color: var(--gray-600);">Video Conferencing</div>
                            </div>
                            <span class="status-badge active">Connected</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    async renderLicensing() {
        try {
            const licensingData = await this.apiCall('/licensing', {
                companyId: this.currentCompany
            });
            
            const licensing = licensingData.licensing || {};
            
            return `
                <div class="page-header">
                    <h1 class="page-title">Licensing</h1>
                    <p class="page-subtitle">Manage user licenses and billing</p>
                </div>
                
                <div class="dashboard-grid">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">License Overview</h3>
                            <div class="card-icon" style="background: rgba(1, 118, 211, 0.1); color: var(--primary-color);">📜</div>
                        </div>
                        <div style="padding: 1rem 0;">
                            <div style="margin-bottom: 1.5rem;">
                                <div style="font-size: 0.875rem; color: var(--gray-600);">Current Plan</div>
                                <div style="font-size: 1.5rem; font-weight: 600;">${licensing.tier || 'Professional'} Edition</div>
                            </div>
                            <div style="margin-bottom: 1.5rem;">
                                <div style="font-size: 0.875rem; color: var(--gray-600);">License Utilization</div>
                                <div style="display: flex; align-items: center; gap: 1rem; margin-top: 0.5rem;">
                                    <div style="flex: 1; background: var(--gray-200); height: 8px; border-radius: 4px;">
                                        <div style="background: var(--primary-color); height: 100%; width: ${licensing.licenses?.utilization || 0}%; border-radius: 4px;"></div>
                                    </div>
                                    <div style="font-weight: 600;">${licensing.licenses?.used || 0}/${licensing.licenses?.total || 0}</div>
                                </div>
                            </div>
                            <div>
                                <div style="font-size: 0.875rem; color: var(--gray-600);">Active Users</div>
                                <div style="font-size: 1.5rem; font-weight: 600;">${licensing.activeUsers || 0}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Billing Information</h3>
                            <div class="card-icon" style="background: rgba(5, 150, 105, 0.1); color: var(--success-color);">💳</div>
                        </div>
                        <div style="padding: 1rem 0;">
                            <div style="margin-bottom: 1rem;">
                                <div style="font-size: 0.875rem; color: var(--gray-600);">Monthly Cost</div>
                                <div style="font-size: 1.5rem; font-weight: 600;">${this.formatCurrency(licensing.billing?.total || 0)}</div>
                            </div>
                            <div style="margin-bottom: 1rem;">
                                <div style="font-size: 0.875rem; color: var(--gray-600);">Next Billing Date</div>
                                <div style="font-weight: 600;">${this.formatDate(licensing.billing?.nextBillingDate)}</div>
                            </div>
                            <div>
                                <div style="font-size: 0.875rem; color: var(--gray-600);">Billing Period</div>
                                <div style="font-weight: 600;">${licensing.billing?.billingPeriod || 'Monthly'}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Usage Summary</h3>
                            <div class="card-icon" style="background: rgba(13, 148, 136, 0.1); color: var(--secondary-color);">📊</div>
                        </div>
                        <div style="padding: 1rem 0;">
                            <div style="margin-bottom: 1rem;">
                                <div style="font-size: 0.875rem; color: var(--gray-600);">Total Sessions</div>
                                <div style="font-size: 1.5rem; font-weight: 600;">${licensing.usageSummary?.totalSessions || 0}</div>
                            </div>
                            <div style="margin-bottom: 1rem;">
                                <div style="font-size: 0.875rem; color: var(--gray-600);">API Calls</div>
                                <div style="font-size: 1.5rem; font-weight: 600;">${licensing.usageSummary?.totalApiCalls || 0}</div>
                            </div>
                            <div>
                                <div style="font-size: 0.875rem; color: var(--gray-600);">Avg Sessions/User</div>
                                <div style="font-size: 1.5rem; font-weight: 600;">${licensing.usageSummary?.avgSessionsPerUser || 0}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Available Modules</h3>
                            <div class="card-icon" style="background: rgba(124, 58, 237, 0.1); color: var(--accent-color);">🧩</div>
                        </div>
                        <div style="padding: 1rem 0;">
                            ${(licensing.modules || []).map(module => `
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                    <div style="font-size: 0.875rem;">${module.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                                    <span class="status-badge active">Active</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            return this.renderError('Failed to load licensing data');
        }
    }
    
    renderError(message) {
        return `
            <div class="page-header">
                <h1 class="page-title">Error</h1>
                <p class="page-subtitle">Something went wrong</p>
            </div>
            
            <div class="card">
                <div class="notification error">
                    <div class="notification-content">
                        <div class="notification-title">Error</div>
                        <div class="notification-message">${message}</div>
                    </div>
                </div>
                <div style="text-align: center; padding: 2rem;">
                    <button class="btn btn-primary" onclick="location.reload()">Refresh Page</button>
                </div>
            </div>
        `;
    }
    
    setupPageEventListeners(page) {
        // Add page-specific event listeners here
        // This would be expanded based on the specific page requirements
    }
    
    async switchCompany(companyId) {
        this.currentCompany = companyId;
        
        // Update user avatar based on company
        const userAvatar = document.getElementById('userAvatar');
        if (userAvatar) {
            const avatars = {
                'diplomat-sa': 'JM',
                'premium-brands': 'SC',
                'regional-dist': 'LA'
            };
            userAvatar.textContent = avatars[companyId] || 'U';
        }
        
        // Reload data for new company
        await this.loadInitialData();
        
        // Re-render current page
        this.renderPage(this.currentPage);
        
        this.showNotification(`Switched to ${companyId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`, 'success');
    }
    
    toggleAIChat() {
        const aiChat = document.getElementById('aiChat');
        const aiChatToggle = document.getElementById('aiChatToggle');
        
        if (aiChat && aiChatToggle) {
            const isOpen = aiChat.classList.contains('open');
            
            if (isOpen) {
                aiChat.classList.remove('open');
                aiChatToggle.style.display = 'block';
            } else {
                aiChat.classList.add('open');
                aiChatToggle.style.display = 'none';
                
                // Focus on input
                const input = document.getElementById('aiChatInput');
                if (input) {
                    setTimeout(() => input.focus(), 100);
                }
            }
        }
    }
    
    async sendChatMessage() {
        const input = document.getElementById('aiChatInput');
        const messagesContainer = document.getElementById('aiChatMessages');
        
        if (!input || !messagesContainer) return;
        
        const message = input.value.trim();
        if (!message) return;
        
        // Add user message
        const userMessage = document.createElement('div');
        userMessage.className = 'chat-message user';
        userMessage.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 0.25rem;">You</div>
            <div>${message}</div>
        `;
        messagesContainer.appendChild(userMessage);
        
        // Clear input
        input.value = '';
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        try {
            // Send to AI
            const response = await this.postApiCall('/ai/chatbot', {
                message: message,
                context: {}
            });
            
            // Add AI response
            const aiMessage = document.createElement('div');
            aiMessage.className = 'chat-message ai';
            aiMessage.innerHTML = `
                <div style="font-weight: 600; margin-bottom: 0.25rem;">AI Assistant</div>
                <div>${response.response?.response || 'I apologize, but I encountered an error processing your request.'}</div>
                ${response.response?.suggestions ? `
                    <div style="margin-top: 0.5rem;">
                        <div style="font-size: 0.75rem; color: var(--gray-600); margin-bottom: 0.25rem;">Suggestions:</div>
                        ${response.response.suggestions.map(suggestion => `
                            <button class="btn btn-secondary btn-sm" style="margin: 0.125rem;" onclick="app.sendSuggestedMessage('${suggestion}')">${suggestion}</button>
                        `).join('')}
                    </div>
                ` : ''}
            `;
            messagesContainer.appendChild(aiMessage);
            
        } catch (error) {
            console.error('Chat error:', error);
            
            // Add error message
            const errorMessage = document.createElement('div');
            errorMessage.className = 'chat-message ai';
            errorMessage.innerHTML = `
                <div style="font-weight: 600; margin-bottom: 0.25rem;">AI Assistant</div>
                <div>I apologize, but I'm currently unable to process your request. Please try again later.</div>
            `;
            messagesContainer.appendChild(errorMessage);
        }
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    sendSuggestedMessage(message) {
        const input = document.getElementById('aiChatInput');
        if (input) {
            input.value = message;
            this.sendChatMessage();
        }
    }
    
    handleChatKeyPress(event) {
        if (event.key === 'Enter') {
            this.sendChatMessage();
        }
    }
    
    setupRealTimeUpdates() {
        // Simulate real-time updates
        setInterval(() => {
            // Update timestamps, counters, etc.
            this.updateRealTimeElements();
        }, 30000); // Update every 30 seconds
    }
    
    updateRealTimeElements() {
        // Update any real-time elements on the page
        // This would be expanded to update specific metrics
    }
    
    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = show ? 'flex' : 'none';
        }
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 2rem;
            z-index: 1001;
            max-width: 400px;
            animation: slideIn 0.3s ease-out;
        `;
        
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-message">${message}</div>
            </div>
            <button style="background: none; border: none; font-size: 1.25rem; cursor: pointer; margin-left: 1rem;" onclick="this.parentElement.remove()">×</button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
    
    // Utility methods
    formatCurrency(value) {
        if (typeof value !== 'number') return '$0';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    }
    
    formatValue(value, unit) {
        if (typeof value !== 'number') return '0';
        
        switch (unit) {
            case 'currency':
                return this.formatCurrency(value);
            case 'percentage':
                return `${value.toFixed(1)}%`;
            case 'count':
                return value.toLocaleString();
            default:
                return value.toLocaleString();
        }
    }
    
    formatDate(dateString) {
        if (!dateString) return 'N/A';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return 'Invalid Date';
        }
    }
}

// Global functions for HTML event handlers
function toggleAIChat() {
    if (window.app) {
        window.app.toggleAIChat();
    }
}

function sendChatMessage() {
    if (window.app) {
        window.app.sendChatMessage();
    }
}

function handleChatKeyPress(event) {
    if (window.app) {
        window.app.handleChatKeyPress(event);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.app = new EnterpriseApp();
});

// Handle browser back/forward
window.addEventListener('popstate', (event) => {
    if (event.state && event.state.page && window.app) {
        window.app.navigateTo(event.state.page);
    }
});

// Service Worker for PWA capabilities
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}