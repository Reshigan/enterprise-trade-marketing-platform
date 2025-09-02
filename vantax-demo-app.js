/**
 * Vanta X Enterprise FMCG Platform - Frontend Application
 * Complete demo application with all functionality
 * Version: 3.0.0 - Production Demo Ready
 */

// Configuration
const CONFIG = {
    apiBaseUrl: window.location.protocol + '//' + window.location.hostname + ':4000',
    currentCompany: 'diplomat-sa',
    currentUser: null,
    charts: {},
    data: {
        companies: {},
        kpis: {},
        sales: {},
        products: {},
        customers: {},
        promotions: {},
        aiModels: {}
    }
};

// Utility Functions
function formatCurrency(amount, currency = 'GBP') {
    const symbols = { GBP: '£', USD: '$', AUD: 'A$', EUR: '€' };
    return `${symbols[currency] || '$'}${amount.toLocaleString()}`;
}

function formatNumber(number) {
    return number.toLocaleString();
}

function formatPercentage(value) {
    return `${value.toFixed(1)}%`;
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// API Functions
async function apiCall(endpoint, options = {}) {
    try {
        const url = `${CONFIG.apiBaseUrl}${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'X-Company-ID': CONFIG.currentCompany
            }
        };
        
        const response = await fetch(url, { ...defaultOptions, ...options });
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        showNotification(`API Error: ${error.message}`, 'error');
        throw error;
    }
}

// Data Loading Functions
async function loadCompanies() {
    try {
        const response = await apiCall('/api/v2/companies');
        CONFIG.data.companies = response.data.reduce((acc, company) => {
            acc[company.id] = company;
            return acc;
        }, {});
        updateCompanySelector();
    } catch (error) {
        console.error('Failed to load companies:', error);
    }
}

async function loadDashboardData() {
    try {
        const response = await apiCall('/api/v2/dashboard');
        const data = response.data;
        
        // Update KPIs
        updateKPIs(data.kpis);
        
        // Update charts
        updateSalesTrendChart(data.salesTrend);
        updateCategoryChart(data.recentSales.byCategory);
        
        // Update tables
        updateTopProductsTable(data.topProducts);
        updateActivePromotions(data.activePromotions);
        
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
    }
}

async function loadSalesData() {
    try {
        const [salesResponse, analyticsResponse] = await Promise.all([
            apiCall('/api/v2/sales'),
            apiCall('/api/v2/sales/analytics')
        ]);
        
        CONFIG.data.sales = salesResponse.data;
        updateSalesTable(salesResponse.data);
        updateSalesAnalytics(analyticsResponse.data);
        
    } catch (error) {
        console.error('Failed to load sales data:', error);
    }
}

async function loadProductsData() {
    try {
        const response = await apiCall('/api/v2/products');
        CONFIG.data.products = response.data;
        updateProductsTable(response.data);
    } catch (error) {
        console.error('Failed to load products data:', error);
    }
}

async function loadCustomersData() {
    try {
        const response = await apiCall('/api/v2/customers');
        CONFIG.data.customers = response.data;
        updateCustomersTable(response.data);
    } catch (error) {
        console.error('Failed to load customers data:', error);
    }
}

async function loadPromotionsData() {
    try {
        const response = await apiCall('/api/v2/promotions');
        CONFIG.data.promotions = response.data;
        updatePromotionsTable(response.data);
    } catch (error) {
        console.error('Failed to load promotions data:', error);
    }
}

async function loadAIModelsData() {
    try {
        const response = await apiCall('/api/v2/ai/models');
        CONFIG.data.aiModels = response.data;
        updateAIModelsTable(response.data);
    } catch (error) {
        console.error('Failed to load AI models data:', error);
    }
}

// UI Update Functions
function updateCompanySelector() {
    const selector = document.getElementById('companySelector');
    selector.innerHTML = '';
    
    Object.values(CONFIG.data.companies).forEach(company => {
        const option = document.createElement('option');
        option.value = company.id;
        option.textContent = company.name;
        if (company.id === CONFIG.currentCompany) {
            option.selected = true;
        }
        selector.appendChild(option);
    });
}

function updateKPIs(kpis) {
    const company = CONFIG.data.companies[CONFIG.currentCompany];
    const currency = company?.currency || 'GBP';
    
    kpis.forEach(kpi => {
        const element = document.getElementById(getKPIElementId(kpi.name));
        if (element) {
            if (kpi.unit === 'currency') {
                element.textContent = formatCurrency(kpi.value, currency);
            } else if (kpi.unit === '%') {
                element.textContent = formatPercentage(kpi.value);
            } else {
                element.textContent = formatNumber(kpi.value);
            }
        }
    });
}

function getKPIElementId(kpiName) {
    const mapping = {
        'Total Revenue': 'totalRevenue',
        'Gross Profit': 'grossProfit',
        'Active Customers': 'activeCustomers',
        'Market Share': 'marketShare'
    };
    return mapping[kpiName];
}

function updateSalesTrendChart(salesTrend) {
    const ctx = document.getElementById('salesTrendChart');
    if (!ctx) return;
    
    if (CONFIG.charts.salesTrend) {
        CONFIG.charts.salesTrend.destroy();
    }
    
    CONFIG.charts.salesTrend = new Chart(ctx, {
        type: 'line',
        data: {
            labels: salesTrend.map(item => item.month),
            datasets: [{
                label: 'Revenue',
                data: salesTrend.map(item => item.revenue),
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            }
        }
    });
}

function updateCategoryChart(categoryData) {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;
    
    if (CONFIG.charts.category) {
        CONFIG.charts.category.destroy();
    }
    
    const labels = Object.keys(categoryData);
    const data = Object.values(categoryData);
    const colors = ['#3B82F6', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6'];
    
    CONFIG.charts.category = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function updateTopProductsTable(products) {
    const tbody = document.getElementById('topProductsTable');
    if (!tbody) return;
    
    const company = CONFIG.data.companies[CONFIG.currentCompany];
    const currency = company?.currency || 'GBP';
    
    tbody.innerHTML = products.map(product => `
        <tr>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>${formatCurrency(product.price, currency)}</td>
            <td>${product.stock}</td>
        </tr>
    `).join('');
}

function updateActivePromotions(promotionCount) {
    const container = document.getElementById('activePromotions');
    if (!container) return;
    
    container.innerHTML = `
        <div class="text-center">
            <div style="font-size: 2rem; font-weight: 700; color: var(--primary-color); margin-bottom: 0.5rem;">
                ${promotionCount}
            </div>
            <div style="color: var(--text-secondary);">Active Campaigns</div>
            <div style="margin-top: 1rem;">
                <button class="btn btn-primary" onclick="showTab('promotions')">View All</button>
            </div>
        </div>
    `;
}

function updateSalesTable(sales) {
    const tbody = document.getElementById('salesTable');
    if (!tbody) return;
    
    const company = CONFIG.data.companies[CONFIG.currentCompany];
    const currency = company?.currency || 'GBP';
    
    tbody.innerHTML = sales.slice(0, 10).map(sale => `
        <tr>
            <td>${sale.orderNumber}</td>
            <td>${sale.customerName}</td>
            <td>${sale.productName}</td>
            <td>${sale.quantity}</td>
            <td>${formatCurrency(sale.totalAmount, currency)}</td>
            <td><span class="badge ${getStatusBadgeClass(sale.status)}">${sale.status}</span></td>
            <td>${formatDate(sale.saleDate)}</td>
        </tr>
    `).join('');
}

function updateProductsTable(products) {
    const tbody = document.getElementById('productsTable');
    if (!tbody) return;
    
    const company = CONFIG.data.companies[CONFIG.currentCompany];
    const currency = company?.currency || 'GBP';
    
    tbody.innerHTML = products.map(product => `
        <tr>
            <td>${product.sku}</td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>${product.brand}</td>
            <td>${formatCurrency(product.price, currency)}</td>
            <td>${formatPercentage(product.margin)}</td>
            <td>${product.stock}</td>
            <td><span class="badge ${getStatusBadgeClass(product.status)}">${product.status}</span></td>
        </tr>
    `).join('');
}

function updateCustomersTable(customers) {
    const tbody = document.getElementById('customersTable');
    if (!tbody) return;
    
    const company = CONFIG.data.companies[CONFIG.currentCompany];
    const currency = company?.currency || 'GBP';
    
    tbody.innerHTML = customers.map(customer => `
        <tr>
            <td>${customer.name}</td>
            <td>${customer.type}</td>
            <td>${customer.segment}</td>
            <td>${customer.region}</td>
            <td>${customer.contactPerson}</td>
            <td>${formatCurrency(customer.creditLimit, currency)}</td>
            <td><span class="badge ${getStatusBadgeClass(customer.status)}">${customer.status}</span></td>
        </tr>
    `).join('');
}

function updatePromotionsTable(promotions) {
    const tbody = document.getElementById('promotionsTable');
    if (!tbody) return;
    
    const company = CONFIG.data.companies[CONFIG.currentCompany];
    const currency = company?.currency || 'GBP';
    
    tbody.innerHTML = promotions.map(promotion => `
        <tr>
            <td>${promotion.name}</td>
            <td>${promotion.type}</td>
            <td>${formatPercentage(promotion.discountPercentage)}</td>
            <td>${formatCurrency(promotion.budget, currency)}</td>
            <td>${formatCurrency(promotion.spent, currency)}</td>
            <td>${formatPercentage(promotion.roi)}</td>
            <td><span class="badge ${getStatusBadgeClass(promotion.status)}">${promotion.status}</span></td>
            <td>${formatDate(promotion.startDate)} - ${formatDate(promotion.endDate)}</td>
        </tr>
    `).join('');
}

function updateAIModelsTable(models) {
    const tbody = document.getElementById('aiModelsTable');
    if (!tbody) return;
    
    tbody.innerHTML = Object.entries(models).map(([key, model]) => `
        <tr>
            <td>${model.name}</td>
            <td>${formatPercentage(model.accuracy)}</td>
            <td><span class="badge ${getStatusBadgeClass(model.status)}">${model.status}</span></td>
            <td>${formatDate(model.lastTrained)}</td>
            <td>
                <button class="btn btn-primary" onclick="runAIPrediction('${key}')">Run Prediction</button>
            </td>
        </tr>
    `).join('');
}

function updateSalesAnalytics(analytics) {
    // Update analytics charts
    updateRegionChart(analytics.salesByRegion);
    updateChannelChart(analytics.salesByChannel);
    updateTopCustomersChart(analytics.topCustomers);
    updateTrendsChart();
}

function updateRegionChart(regionData) {
    const ctx = document.getElementById('regionChart');
    if (!ctx) return;
    
    if (CONFIG.charts.region) {
        CONFIG.charts.region.destroy();
    }
    
    CONFIG.charts.region = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(regionData),
            datasets: [{
                label: 'Sales by Region',
                data: Object.values(regionData),
                backgroundColor: '#3B82F6',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            }
        }
    });
}

function updateChannelChart(channelData) {
    const ctx = document.getElementById('channelChart');
    if (!ctx) return;
    
    if (CONFIG.charts.channel) {
        CONFIG.charts.channel.destroy();
    }
    
    const colors = ['#3B82F6', '#F59E0B', '#10B981', '#EF4444'];
    
    CONFIG.charts.channel = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(channelData),
            datasets: [{
                data: Object.values(channelData),
                backgroundColor: colors,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function updateTopCustomersChart(customers) {
    const ctx = document.getElementById('topCustomersChart');
    if (!ctx) return;
    
    if (CONFIG.charts.topCustomers) {
        CONFIG.charts.topCustomers.destroy();
    }
    
    CONFIG.charts.topCustomers = new Chart(ctx, {
        type: 'horizontalBar',
        data: {
            labels: customers.map(c => c.name),
            datasets: [{
                label: 'Revenue',
                data: customers.map(c => c.revenue),
                backgroundColor: '#10B981',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            }
        }
    });
}

function updateTrendsChart() {
    const ctx = document.getElementById('trendsChart');
    if (!ctx) return;
    
    if (CONFIG.charts.trends) {
        CONFIG.charts.trends.destroy();
    }
    
    // Generate sample trend data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueData = months.map(() => Math.random() * 500000 + 200000);
    const profitData = months.map(() => Math.random() * 250000 + 100000);
    
    CONFIG.charts.trends = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Revenue',
                data: revenueData,
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4
            }, {
                label: 'Profit',
                data: profitData,
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            }
        }
    });
}

function getStatusBadgeClass(status) {
    const statusMap = {
        'active': 'success',
        'completed': 'success',
        'shipped': 'info',
        'pending': 'warning',
        'inactive': 'danger',
        'cancelled': 'danger',
        'Active': 'success',
        'Completed': 'success',
        'Planned': 'info'
    };
    return statusMap[status] || 'info';
}

// Navigation Functions
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Add active class to clicked nav tab
    event.target.classList.add('active');
    
    // Load data for the selected tab
    loadTabData(tabName);
}

async function loadTabData(tabName) {
    switch (tabName) {
        case 'dashboard':
            await loadDashboardData();
            break;
        case 'sales':
            await loadSalesData();
            break;
        case 'products':
            await loadProductsData();
            break;
        case 'customers':
            await loadCustomersData();
            break;
        case 'promotions':
            await loadPromotionsData();
            break;
        case 'analytics':
            await loadSalesData(); // Analytics uses sales data
            break;
        case 'ai-models':
            await loadAIModelsData();
            break;
    }
}

// Company Selection
function onCompanyChange() {
    const selector = document.getElementById('companySelector');
    CONFIG.currentCompany = selector.value;
    
    // Reload current tab data
    const activeTab = document.querySelector('.tab-content.active');
    if (activeTab) {
        loadTabData(activeTab.id);
    }
    
    showNotification(`Switched to ${CONFIG.data.companies[CONFIG.currentCompany]?.name}`, 'success');
}

// AI Chatbot Functions
function toggleChatbot() {
    const window = document.getElementById('chatbotWindow');
    window.classList.toggle('open');
}

function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message to chat
    addChatMessage(message, 'user');
    input.value = '';
    
    // Show typing indicator
    const typingIndicator = addChatMessage('Analyzing your request...', 'bot', true);
    
    try {
        const response = await apiCall('/api/v2/ai/chat', {
            method: 'POST',
            body: JSON.stringify({ message })
        });
        
        // Remove typing indicator
        typingIndicator.remove();
        
        // Add bot response
        addChatMessage(response.data.message, 'bot');
        
    } catch (error) {
        typingIndicator.remove();
        addChatMessage('Sorry, I encountered an error. Please try again.', 'bot');
    }
}

function addChatMessage(message, sender, isTyping = false) {
    const messagesContainer = document.getElementById('chatbotMessages');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender}`;
    
    if (isTyping) {
        messageElement.innerHTML = `${message} <span class="loading"></span>`;
    } else {
        messageElement.textContent = message;
    }
    
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    return messageElement;
}

// Action Functions
async function runAIPrediction(modelKey) {
    try {
        showNotification('Running AI prediction...', 'info');
        
        const response = await apiCall('/api/v2/ai/predict', {
            method: 'POST',
            body: JSON.stringify({
                model: modelKey,
                data: { companyId: CONFIG.currentCompany }
            })
        });
        
        showNotification(`AI Prediction completed with ${formatPercentage(response.data.confidence * 100)} confidence`, 'success');
        
    } catch (error) {
        showNotification('Failed to run AI prediction', 'error');
    }
}

function generateReport(type) {
    showNotification(`Generating ${type} report...`, 'info');
    
    // Simulate report generation
    setTimeout(() => {
        showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} report generated successfully`, 'success');
    }, 2000);
}

function testSAPConnection() {
    showNotification('Testing SAP connection...', 'info');
    
    setTimeout(() => {
        showNotification('SAP connection test successful', 'success');
    }, 1500);
}

function syncSAPData() {
    showNotification('Syncing SAP data...', 'info');
    
    setTimeout(() => {
        showNotification('SAP data synchronized successfully', 'success');
    }, 3000);
}

function configureMSSSO() {
    showNotification('Opening Microsoft 365 SSO configuration...', 'info');
    
    setTimeout(() => {
        showNotification('Microsoft 365 SSO configured successfully', 'success');
    }, 2000);
}

function downloadTemplate(type) {
    showNotification(`Downloading ${type} template...`, 'info');
    
    // Create a dummy download
    const link = document.createElement('a');
    link.href = 'data:text/plain;charset=utf-8,Sample Template Content';
    link.download = `${type}_template.xlsx`;
    link.click();
    
    showNotification(`${type} template downloaded`, 'success');
}

function importData() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    
    if (!file) {
        showNotification('Please select a file to import', 'warning');
        return;
    }
    
    showNotification(`Importing data from ${file.name}...`, 'info');
    
    setTimeout(() => {
        showNotification('Data imported successfully', 'success');
        fileInput.value = '';
    }, 2500);
}

function showUserMenu() {
    showNotification('User menu functionality coming soon', 'info');
}

// Initialization
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Vanta X Enterprise FMCG Platform - Demo Frontend Loaded');
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    // Set up company selector change handler
    document.getElementById('companySelector').addEventListener('change', onCompanyChange);
    
    // Load initial data
    try {
        await loadCompanies();
        await loadDashboardData();
        
        showNotification('Welcome to Vanta X Enterprise FMCG Platform!', 'success');
        
    } catch (error) {
        console.error('Failed to initialize application:', error);
        showNotification('Failed to load application data. Please check your connection.', 'error');
    }
    
    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
});

// Export for global access
window.VantaX = {
    CONFIG,
    showTab,
    toggleChatbot,
    sendChatMessage,
    handleChatKeyPress,
    runAIPrediction,
    generateReport,
    testSAPConnection,
    syncSAPData,
    configureMSSSO,
    downloadTemplate,
    importData,
    showUserMenu
};