/**
 * Vanta X-Trade Spend Enterprise Frontend Application
 * Level 3 System with Full Functionality
 */

// Global state
let state = {
    user: null,
    token: null,
    company: null,
    currentView: 'dashboard',
    data: {
        products: [],
        customers: [],
        sales: [],
        promotions: [],
        budgets: [],
        kpis: [],
        aiModels: []
    },
    charts: {}
};

// API Configuration
const API_BASE = 'http://localhost:4000/api';

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    // Check for existing session
    const token = localStorage.getItem('vantax_token');
    const user = localStorage.getItem('vantax_user');
    
    if (token && user) {
        state.token = token;
        state.user = JSON.parse(user);
        showMainApp();
        loadDashboard();
    } else {
        showLoginScreen();
    }
});

// Authentication Functions
async function login(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            state.token = data.token;
            state.user = data.user;
            state.company = data.user.company;
            
            localStorage.setItem('vantax_token', data.token);
            localStorage.setItem('vantax_user', JSON.stringify(data.user));
            
            showMainApp();
            loadDashboard();
        } else {
            showNotification('Invalid credentials', 'error');
        }
    } catch (error) {
        showNotification('Login failed', 'error');
    }
}

async function loginWithSSO() {
    // Simulate Microsoft 365 SSO
    showNotification('Redirecting to Microsoft login...', 'info');
    
    // In production, this would redirect to Microsoft OAuth
    setTimeout(async () => {
        try {
            const response = await fetch(`${API_BASE}/auth/sso/microsoft`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    token: 'mock-sso-token',
                    email: 'john.smith@diplomat.co.za'
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                state.token = data.token;
                state.user = data.user;
                state.company = data.user.company;
                
                localStorage.setItem('vantax_token', data.token);
                localStorage.setItem('vantax_user', JSON.stringify(data.user));
                
                showMainApp();
                loadDashboard();
            }
        } catch (error) {
            showNotification('SSO login failed', 'error');
        }
    }, 1500);
}

function logout() {
    localStorage.removeItem('vantax_token');
    localStorage.removeItem('vantax_user');
    state = {
        user: null,
        token: null,
        company: null,
        currentView: 'dashboard',
        data: {},
        charts: {}
    };
    showLoginScreen();
}

// UI Functions
function showLoginScreen() {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('mainApp').classList.add('hidden');
}

function showMainApp() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    
    // Update user info
    document.getElementById('userName').textContent = state.user.name;
    document.getElementById('userInitials').textContent = state.user.name.split(' ').map(n => n[0]).join('');
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

function toggleUserMenu() {
    document.getElementById('userMenu').classList.toggle('hidden');
}

function toggleChat() {
    document.getElementById('chatWindow').classList.toggle('hidden');
}

// Navigation
function navigate(view) {
    state.currentView = view;
    
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('bg-gray-800');
    });
    event.target.closest('.nav-item').classList.add('bg-gray-800');
    
    // Close mobile sidebar
    if (window.innerWidth < 768) {
        document.getElementById('sidebar').classList.remove('open');
    }
    
    // Load view
    switch(view) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'promotions':
            loadPromotions();
            break;
        case 'budgets':
            loadBudgets();
            break;
        case 'contracts':
            loadContracts();
            break;
        case 'analytics':
            loadAnalytics();
            break;
        case 'ai-insights':
            loadAIInsights();
            break;
        case 'forecasting':
            loadForecasting();
            break;
        case 'products':
            loadProducts();
            break;
        case 'customers':
            loadCustomers();
            break;
        case 'import':
            loadImport();
            break;
        case 'templates':
            loadTemplates();
            break;
    }
}

// API Functions
async function apiCall(endpoint, options = {}) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
            'Authorization': `Bearer ${state.token}`,
            'Content-Type': 'application/json',
            ...options.headers
        }
    });
    
    if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
    }
    
    return response.json();
}

// Dashboard
async function loadDashboard() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p class="text-gray-600 mt-2">Welcome back, ${state.user.name}</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="metric-card bg-white rounded-lg shadow p-6">
                <div class="flex items-center justify-between mb-4">
                    <div class="bg-blue-100 p-3 rounded-lg">
                        <i class="fas fa-dollar-sign text-blue-600"></i>
                    </div>
                    <span class="text-sm text-green-600 font-semibold">+12.5%</span>
                </div>
                <h3 class="text-gray-600 text-sm">Total Revenue</h3>
                <p class="text-2xl font-bold text-gray-900" id="totalRevenue">Loading...</p>
            </div>
            
            <div class="metric-card bg-white rounded-lg shadow p-6">
                <div class="flex items-center justify-between mb-4">
                    <div class="bg-green-100 p-3 rounded-lg">
                        <i class="fas fa-shopping-cart text-green-600"></i>
                    </div>
                    <span class="text-sm text-green-600 font-semibold">+8.3%</span>
                </div>
                <h3 class="text-gray-600 text-sm">Total Orders</h3>
                <p class="text-2xl font-bold text-gray-900" id="totalOrders">Loading...</p>
            </div>
            
            <div class="metric-card bg-white rounded-lg shadow p-6">
                <div class="flex items-center justify-between mb-4">
                    <div class="bg-purple-100 p-3 rounded-lg">
                        <i class="fas fa-tags text-purple-600"></i>
                    </div>
                    <span class="text-sm text-gray-600 font-semibold">Active</span>
                </div>
                <h3 class="text-gray-600 text-sm">Promotions</h3>
                <p class="text-2xl font-bold text-gray-900" id="activePromotions">Loading...</p>
            </div>
            
            <div class="metric-card bg-white rounded-lg shadow p-6">
                <div class="flex items-center justify-between mb-4">
                    <div class="bg-orange-100 p-3 rounded-lg">
                        <i class="fas fa-wallet text-orange-600"></i>
                    </div>
                    <span class="text-sm text-orange-600 font-semibold">75%</span>
                </div>
                <h3 class="text-gray-600 text-sm">Trade Spend YTD</h3>
                <p class="text-2xl font-bold text-gray-900" id="tradeSpendYTD">Loading...</p>
            </div>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div class="bg-white rounded-lg shadow p-6">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Sales Trend</h2>
                <canvas id="salesTrendChart" height="300"></canvas>
            </div>
            
            <div class="bg-white rounded-lg shadow p-6">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Category Performance</h2>
                <canvas id="categoryChart" height="300"></canvas>
            </div>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="bg-white rounded-lg shadow p-6">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
                <div id="recentActivity" class="space-y-3">
                    <div class="text-center py-4">
                        <div class="loading-spinner mx-auto"></div>
                    </div>
                </div>
            </div>
            
            <div class="bg-white rounded-lg shadow p-6">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Upcoming Promotions</h2>
                <div id="upcomingPromotions" class="space-y-3">
                    <div class="text-center py-4">
                        <div class="loading-spinner mx-auto"></div>
                    </div>
                </div>
            </div>
            
            <div class="bg-white rounded-lg shadow p-6">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Alerts</h2>
                <div id="alerts" class="space-y-3">
                    <div class="text-center py-4">
                        <div class="loading-spinner mx-auto"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Load dashboard data
    try {
        const data = await apiCall(`/dashboard/${state.company.id}`);
        
        // Update metrics
        document.getElementById('totalRevenue').textContent = `R${(data.data.summary.totalRevenue / 1000000).toFixed(1)}M`;
        document.getElementById('totalOrders').textContent = data.data.summary.totalOrders.toLocaleString();
        document.getElementById('activePromotions').textContent = data.data.summary.activePromotions;
        document.getElementById('tradeSpendYTD').textContent = `R${(data.data.summary.tradeSpendYTD / 1000000).toFixed(1)}M`;
        
        // Load charts
        await loadSalesTrendChart();
        await loadCategoryChart();
        
        // Update activity feeds
        updateRecentActivity(data.data.recentActivity);
        updateUpcomingPromotions(data.data.upcomingPromotions);
        updateAlerts(data.data.alerts);
        
    } catch (error) {
        showNotification('Failed to load dashboard data', 'error');
    }
}

async function loadSalesTrendChart() {
    try {
        const data = await apiCall('/analytics/sales-trend');
        
        const ctx = document.getElementById('salesTrendChart').getContext('2d');
        
        if (state.charts.salesTrend) {
            state.charts.salesTrend.destroy();
        }
        
        state.charts.salesTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.data.map(d => d.month),
                datasets: [{
                    label: 'Revenue',
                    data: data.data.map(d => d.revenue),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4
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
                                return 'R' + (value / 1000000).toFixed(1) + 'M';
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Failed to load sales trend chart:', error);
    }
}

async function loadCategoryChart() {
    try {
        const data = await apiCall('/analytics/category-performance');
        
        const ctx = document.getElementById('categoryChart').getContext('2d');
        
        if (state.charts.category) {
            state.charts.category.destroy();
        }
        
        state.charts.category = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.data.map(d => d.category),
                datasets: [{
                    data: data.data.map(d => d.revenue),
                    backgroundColor: [
                        '#3b82f6',
                        '#10b981',
                        '#f59e0b',
                        '#ef4444',
                        '#8b5cf6',
                        '#ec4899'
                    ]
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
    } catch (error) {
        console.error('Failed to load category chart:', error);
    }
}

function updateRecentActivity(activities) {
    const container = document.getElementById('recentActivity');
    
    if (!activities || activities.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-sm">No recent activity</p>';
        return;
    }
    
    container.innerHTML = activities.slice(0, 5).map(activity => `
        <div class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
            <div>
                <p class="text-sm font-medium text-gray-900">Order #${activity.invoiceNumber}</p>
                <p class="text-xs text-gray-500">${new Date(activity.date).toLocaleDateString()}</p>
            </div>
            <span class="text-sm font-semibold text-gray-900">R${activity.amount.toFixed(2)}</span>
        </div>
    `).join('');
}

function updateUpcomingPromotions(promotions) {
    const container = document.getElementById('upcomingPromotions');
    
    if (!promotions || promotions.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-sm">No upcoming promotions</p>';
        return;
    }
    
    container.innerHTML = promotions.map(promo => `
        <div class="bg-blue-50 rounded-lg p-3">
            <h4 class="font-medium text-gray-900">${promo.name}</h4>
            <p class="text-sm text-gray-600 mt-1">${promo.mechanics}</p>
            <p class="text-xs text-gray-500 mt-2">Starts: ${new Date(promo.startDate).toLocaleDateString()}</p>
        </div>
    `).join('');
}

function updateAlerts(alerts) {
    const container = document.getElementById('alerts');
    
    if (!alerts || alerts.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-sm">No alerts</p>';
        return;
    }
    
    container.innerHTML = alerts.map(alert => {
        const iconClass = alert.type === 'warning' ? 'fa-exclamation-triangle text-orange-500' : 'fa-info-circle text-blue-500';
        return `
            <div class="flex items-start gap-3">
                <i class="fas ${iconClass} mt-1"></i>
                <p class="text-sm text-gray-700">${alert.message}</p>
            </div>
        `;
    }).join('');
}

// Promotions View
async function loadPromotions() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="mb-8 flex justify-between items-center">
            <div>
                <h1 class="text-3xl font-bold text-gray-900">Promotions</h1>
                <p class="text-gray-600 mt-2">Manage your promotional campaigns</p>
            </div>
            <button onclick="showCreatePromotion()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
                <i class="fas fa-plus"></i>
                Create Promotion
            </button>
        </div>
        
        <div class="bg-white rounded-lg shadow">
            <div class="p-6 border-b border-gray-200">
                <div class="flex flex-col md:flex-row gap-4">
                    <input type="text" placeholder="Search promotions..." 
                           class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <select class="px-4 py-2 border border-gray-300 rounded-lg">
                        <option>All Status</option>
                        <option>Active</option>
                        <option>Planned</option>
                        <option>Completed</option>
                    </select>
                    <select class="px-4 py-2 border border-gray-300 rounded-lg">
                        <option>All Types</option>
                        <option>Volume Discount</option>
                        <option>Price Reduction</option>
                        <option>BOGO</option>
                        <option>Bundle</option>
                    </select>
                </div>
            </div>
            
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ROI</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="promotionsTable" class="bg-white divide-y divide-gray-200">
                        <tr>
                            <td colspan="7" class="px-6 py-4 text-center">
                                <div class="loading-spinner mx-auto"></div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    // Load promotions data
    try {
        const data = await apiCall('/promotions');
        updatePromotionsTable(data.data);
    } catch (error) {
        showNotification('Failed to load promotions', 'error');
    }
}

function updatePromotionsTable(promotions) {
    const tbody = document.getElementById('promotionsTable');
    
    if (!promotions || promotions.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-4 text-center text-gray-500">
                    No promotions found
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = promotions.map(promo => {
        const statusColor = promo.status === 'active' ? 'green' : promo.status === 'planned' ? 'blue' : 'gray';
        const roiColor = promo.roi > 200 ? 'text-green-600' : promo.roi > 100 ? 'text-orange-600' : 'text-red-600';
        
        return `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${promo.name}</div>
                    <div class="text-sm text-gray-500">${promo.mechanics}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${promo.type}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${new Date(promo.startDate).toLocaleDateString()} - ${new Date(promo.endDate).toLocaleDateString()}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    R${(promo.budget / 1000).toFixed(0)}k
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold ${roiColor}">
                    ${promo.roi.toFixed(0)}%
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-${statusColor}-100 text-${statusColor}-800">
                        ${promo.status}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button class="text-blue-600 hover:text-blue-900 mr-3">View</button>
                    <button class="text-gray-600 hover:text-gray-900">Edit</button>
                </td>
            </tr>
        `;
    }).join('');
}

// AI Insights View
async function loadAIInsights() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900">AI Insights</h1>
            <p class="text-gray-600 mt-2">Machine learning models and predictions</p>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div class="bg-white rounded-lg shadow p-6">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Active Models</h2>
                <div id="aiModels" class="space-y-4">
                    <div class="text-center py-4">
                        <div class="loading-spinner mx-auto"></div>
                    </div>
                </div>
            </div>
            
            <div class="bg-white rounded-lg shadow p-6">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Latest Predictions</h2>
                <div id="aiPredictions" class="space-y-4">
                    <div class="text-center py-4">
                        <div class="loading-spinner mx-auto"></div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Model Performance</h2>
            <canvas id="modelPerformanceChart" height="300"></canvas>
        </div>
    `;
    
    // Load AI models data
    try {
        const data = await apiCall('/ai/models');
        updateAIModels(data.data);
        loadModelPerformanceChart(data.data);
    } catch (error) {
        showNotification('Failed to load AI insights', 'error');
    }
}

function updateAIModels(models) {
    const container = document.getElementById('aiModels');
    
    container.innerHTML = models.map(model => {
        const accuracyColor = model.accuracy > 80 ? 'text-green-600' : model.accuracy > 70 ? 'text-orange-600' : 'text-red-600';
        
        return `
            <div class="border border-gray-200 rounded-lg p-4">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-medium text-gray-900">${model.name}</h3>
                    <span class="text-sm font-semibold ${accuracyColor}">${model.accuracy}%</span>
                </div>
                <p class="text-sm text-gray-600 mb-2">Type: ${model.type}</p>
                <p class="text-xs text-gray-500">Last trained: ${new Date(model.lastTrained).toLocaleDateString()}</p>
                <button onclick="runPrediction('${model.id}')" class="mt-3 text-sm text-blue-600 hover:text-blue-800">
                    Run Prediction →
                </button>
            </div>
        `;
    }).join('');
    
    // Update predictions
    const predictionsContainer = document.getElementById('aiPredictions');
    predictionsContainer.innerHTML = models.map(model => {
        const predictions = model.predictions;
        let content = '';
        
        switch(model.type) {
            case 'timeseries':
                content = `
                    <p class="text-sm"><strong>Next Month:</strong> R${(predictions.nextMonth / 1000000).toFixed(1)}M</p>
                    <p class="text-sm"><strong>Next Quarter:</strong> R${(predictions.nextQuarter / 1000000).toFixed(1)}M</p>
                    <p class="text-sm"><strong>Confidence:</strong> ${(predictions.confidence * 100).toFixed(0)}%</p>
                `;
                break;
            case 'optimization':
                content = `
                    <p class="text-sm"><strong>Recommended Discount:</strong> ${predictions.recommendedDiscount}%</p>
                    <p class="text-sm"><strong>Expected ROI:</strong> ${predictions.expectedROI}%</p>
                    <p class="text-sm"><strong>Optimal Duration:</strong> ${predictions.optimalDuration} days</p>
                `;
                break;
            case 'anomaly':
                content = `
                    <p class="text-sm"><strong>Anomalies Detected:</strong> ${predictions.anomaliesDetected}</p>
                    <p class="text-sm"><strong>Risk Score:</strong> ${(predictions.riskScore * 100).toFixed(0)}%</p>
                    <p class="text-sm text-orange-600">${predictions.alerts[0] || 'No alerts'}</p>
                `;
                break;
        }
        
        return `
            <div class="bg-gray-50 rounded-lg p-4">
                <h4 class="font-medium text-gray-900 mb-2">${model.name}</h4>
                ${content}
            </div>
        `;
    }).join('');
}

function loadModelPerformanceChart(models) {
    const ctx = document.getElementById('modelPerformanceChart').getContext('2d');
    
    if (state.charts.modelPerformance) {
        state.charts.modelPerformance.destroy();
    }
    
    state.charts.modelPerformance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: models.map(m => m.name),
            datasets: [{
                label: 'Accuracy %',
                data: models.map(m => m.accuracy),
                backgroundColor: models.map(m => 
                    m.accuracy > 80 ? '#10b981' : m.accuracy > 70 ? '#f59e0b' : '#ef4444'
                )
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

// Import Data View
async function loadImport() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900">Import Data</h1>
            <p class="text-gray-600 mt-2">Import data from SAP or Excel files</p>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-white rounded-lg shadow p-6">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">
                    <i class="fas fa-database text-blue-600 mr-2"></i>
                    SAP Integration
                </h2>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">System</label>
                        <select class="w-full px-4 py-2 border border-gray-300 rounded-lg">
                            <option>SAP ECC (PRD)</option>
                            <option>SAP S/4HANA (S4P)</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Data Type</label>
                        <select class="w-full px-4 py-2 border border-gray-300 rounded-lg">
                            <option>Sales Orders</option>
                            <option>Master Data</option>
                            <option>Inventory</option>
                            <option>Financial Documents</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                        <div class="grid grid-cols-2 gap-2">
                            <input type="date" class="px-4 py-2 border border-gray-300 rounded-lg">
                            <input type="date" class="px-4 py-2 border border-gray-300 rounded-lg">
                        </div>
                    </div>
                    
                    <button onclick="importFromSAP()" class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition">
                        <i class="fas fa-download mr-2"></i>
                        Import from SAP
                    </button>
                </div>
            </div>
            
            <div class="bg-white rounded-lg shadow p-6">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">
                    <i class="fas fa-file-excel text-green-600 mr-2"></i>
                    Excel Import
                </h2>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Template</label>
                        <select id="excelTemplate" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
                            <option value="TMPL003">Sales Data Template</option>
                            <option value="TMPL004">Product Master Template</option>
                        </select>
                    </div>
                    
                    <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <i class="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i>
                        <p class="text-gray-600 mb-2">Drag and drop your Excel file here</p>
                        <p class="text-sm text-gray-500 mb-4">or</p>
                        <input type="file" id="excelFile" accept=".xlsx,.xls" class="hidden">
                        <button onclick="document.getElementById('excelFile').click()" 
                                class="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition">
                            Browse Files
                        </button>
                    </div>
                    
                    <button onclick="importFromExcel()" class="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition">
                        <i class="fas fa-upload mr-2"></i>
                        Upload Excel File
                    </button>
                </div>
            </div>
        </div>
        
        <div class="mt-8 bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Import History</h2>
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Records</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        <tr>
                            <td class="px-6 py-4 text-sm">2025-08-30</td>
                            <td class="px-6 py-4 text-sm">SAP ECC</td>
                            <td class="px-6 py-4 text-sm">Sales Orders</td>
                            <td class="px-6 py-4 text-sm">1,234</td>
                            <td class="px-6 py-4 text-sm">
                                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                    Completed
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td class="px-6 py-4 text-sm">2025-08-29</td>
                            <td class="px-6 py-4 text-sm">Excel</td>
                            <td class="px-6 py-4 text-sm">Product Master</td>
                            <td class="px-6 py-4 text-sm">56</td>
                            <td class="px-6 py-4 text-sm">
                                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                    Completed
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// Chat Functions
async function sendChatMessage(event) {
    event.preventDefault();
    
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    addChatMessage(message, 'user');
    input.value = '';
    
    // Send to AI
    try {
        const response = await apiCall('/ai/chat', {
            method: 'POST',
            body: JSON.stringify({ message })
        });
        
        if (response.success) {
            addChatMessage(response.data.response, 'assistant');
        }
    } catch (error) {
        addChatMessage('Sorry, I encountered an error. Please try again.', 'assistant');
    }
}

function addChatMessage(message, role) {
    const container = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    
    messageDiv.className = `chat-bubble ${role === 'user' ? 'bg-blue-600 text-white ml-auto' : 'bg-gray-100'} p-3 rounded-lg max-w-xs`;
    messageDiv.innerHTML = `<p class="text-sm">${message}</p>`;
    
    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
}

// Utility Functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    const bgColor = type === 'error' ? 'bg-red-500' : type === 'success' ? 'bg-green-500' : 'bg-blue-500';
    
    notification.className = `fixed top-20 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in`;
    notification.innerHTML = `
        <div class="flex items-center gap-3">
            <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

async function importFromSAP() {
    showNotification('Connecting to SAP system...', 'info');
    
    try {
        const response = await apiCall('/import/sap', {
            method: 'POST',
            body: JSON.stringify({
                system: 'ECC',
                type: 'sales_orders'
            })
        });
        
        if (response.success) {
            showNotification(`Successfully imported ${response.data.recordsImported} records from SAP`, 'success');
        }
    } catch (error) {
        showNotification('SAP import failed', 'error');
    }
}

async function importFromExcel() {
    const fileInput = document.getElementById('excelFile');
    const templateId = document.getElementById('excelTemplate').value;
    
    if (!fileInput.files[0]) {
        showNotification('Please select a file', 'error');
        return;
    }
    
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('templateId', templateId);
    
    showNotification('Uploading file...', 'info');
    
    try {
        const response = await fetch(`${API_BASE}/import/excel`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${state.token}`
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification(`Successfully imported ${data.data.recordsImported} records`, 'success');
            fileInput.value = '';
        } else {
            showNotification('Excel import failed', 'error');
        }
    } catch (error) {
        showNotification('Excel import failed', 'error');
    }
}

async function runPrediction(modelId) {
    showNotification('Running AI prediction...', 'info');
    
    try {
        const response = await apiCall('/ai/predict', {
            method: 'POST',
            body: JSON.stringify({ modelId })
        });
        
        if (response.success) {
            showNotification('Prediction completed successfully', 'success');
            // Refresh the predictions display
            loadAIInsights();
        }
    } catch (error) {
        showNotification('Prediction failed', 'error');
    }
}

// Initialize tooltips and other UI enhancements
document.addEventListener('click', (e) => {
    // Close user menu when clicking outside
    if (!e.target.closest('#userMenu') && !e.target.closest('[onclick="toggleUserMenu()"]')) {
        document.getElementById('userMenu').classList.add('hidden');
    }
});

// Export for use in HTML
window.login = login;
window.loginWithSSO = loginWithSSO;
window.logout = logout;
window.toggleSidebar = toggleSidebar;
window.toggleUserMenu = toggleUserMenu;
window.toggleChat = toggleChat;
window.navigate = navigate;
window.sendChatMessage = sendChatMessage;
window.importFromSAP = importFromSAP;
window.importFromExcel = importFromExcel;
window.runPrediction = runPrediction;