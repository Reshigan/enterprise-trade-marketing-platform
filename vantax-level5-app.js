/**
 * Vanta X-Trade Spend Level 5 Frontend Application
 * Advanced Trade Promotion Management System
 */

// Global state management
let state = {
    user: null,
    token: null,
    company: null,
    currentView: 'dashboard',
    selectedWeek: null,
    selectedCustomer: null,
    selectedProduct: null,
    data: {
        products: [],
        customers: [],
        sales: [],
        promotions: [],
        budgets: [],
        kpis: [],
        aiModels: [],
        activityGrid: [],
        claims: [],
        scenarios: [],
        insights: [],
        notifications: []
    },
    charts: {},
    grids: {},
    filters: {
        dateRange: { start: null, end: null },
        channels: [],
        categories: [],
        regions: []
    },
    cache: new Map(),
    eventSource: null
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
        initializeApp();
    } else {
        showLoginScreen();
    }
    
    // Initialize keyboard shortcuts
    initializeKeyboardShortcuts();
    
    // Initialize real-time updates
    initializeRealTimeUpdates();
});

// Authentication Functions
async function login(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    showLoading('Authenticating...');
    
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
            
            hideLoading();
            showMainApp();
            initializeApp();
        } else {
            hideLoading();
            showNotification('Invalid credentials', 'error');
        }
    } catch (error) {
        hideLoading();
        showNotification('Login failed. Please try again.', 'error');
    }
}

async function loginWithSSO() {
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
                initializeApp();
            }
        } catch (error) {
            showNotification('SSO login failed', 'error');
        }
    }, 1500);
}

function logout() {
    localStorage.removeItem('vantax_token');
    localStorage.removeItem('vantax_user');
    
    // Close event source
    if (state.eventSource) {
        state.eventSource.close();
    }
    
    // Reset state
    state = {
        user: null,
        token: null,
        company: null,
        currentView: 'dashboard',
        data: {},
        charts: {},
        grids: {},
        cache: new Map()
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
    document.getElementById('userRole').textContent = state.user.role.replace(/([A-Z])/g, ' $1').trim();
    document.getElementById('userInitials').textContent = state.user.name.split(' ').map(n => n[0]).join('');
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

function toggleUserMenu() {
    document.getElementById('userMenu').classList.toggle('hidden');
}

function toggleInsightsBot() {
    document.getElementById('insightsBotWindow').classList.toggle('hidden');
}

function toggleInsights() {
    const panel = document.getElementById('insightsPanel');
    panel.classList.toggle('hidden');
    
    if (!panel.classList.contains('hidden')) {
        loadInsights();
    }
}

function toggleNotifications() {
    const panel = document.getElementById('notificationsPanel');
    panel.classList.toggle('hidden');
    
    if (!panel.classList.contains('hidden')) {
        loadNotifications();
    }
}

function showQuickCreate() {
    document.getElementById('quickCreateModal').classList.remove('hidden');
}

function closeQuickCreate() {
    document.getElementById('quickCreateModal').classList.add('hidden');
}

// Initialize application
async function initializeApp() {
    showLoading('Initializing application...');
    
    try {
        // Load initial data
        await Promise.all([
            loadMasterData(),
            loadUserPreferences()
        ]);
        
        // Navigate to dashboard
        navigate('dashboard');
        
        // Start real-time insights
        startInsightsStream();
        
        hideLoading();
        
        // Show welcome message
        showNotification(`Welcome back, ${state.user.name}!`, 'success');
        
    } catch (error) {
        hideLoading();
        showNotification('Failed to initialize application', 'error');
        console.error('Initialization error:', error);
    }
}

// Navigation
function navigate(view) {
    state.currentView = view;
    
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('bg-gray-800');
    });
    
    const activeItem = document.querySelector(`.nav-item[href="#${view}"]`);
    if (activeItem) {
        activeItem.classList.add('bg-gray-800');
    }
    
    // Close mobile sidebar
    if (window.innerWidth < 1024) {
        document.getElementById('sidebar').classList.remove('open');
    }
    
    // Clear content
    const content = document.getElementById('content');
    content.innerHTML = '<div class="flex justify-center items-center h-64"><div class="loading-spinner"></div></div>';
    
    // Load view
    switch(view) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'activity-grid':
            loadActivityGrid();
            break;
        case 'promotions':
            loadPromotions();
            break;
        case 'pricing':
            loadPricing();
            break;
        case 'claims':
            loadClaims();
            break;
        case 'scenarios':
            loadScenarios();
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
        case 'ai-models':
            loadAIModels();
            break;
        case 'insights':
            loadInsightsHub();
            break;
        case 'products':
            loadProducts();
            break;
        case 'customers':
            loadCustomers();
            break;
        default:
            loadDashboard();
    }
}

// API Functions
async function apiCall(endpoint, options = {}) {
    const cacheKey = `${endpoint}${JSON.stringify(options)}`;
    
    // Check cache for GET requests
    if (options.method === 'GET' || !options.method) {
        const cached = state.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < 60000) { // 1 minute cache
            return cached.data;
        }
    }
    
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
    
    const data = await response.json();
    
    // Cache successful GET responses
    if (options.method === 'GET' || !options.method) {
        state.cache.set(cacheKey, { data, timestamp: Date.now() });
    }
    
    return data;
}

// Load master data
async function loadMasterData() {
    const [products, customers] = await Promise.all([
        apiCall('/products'),
        apiCall('/customers')
    ]);
    
    state.data.products = products.data;
    state.data.customers = customers.data;
}

// Load user preferences
async function loadUserPreferences() {
    // Set default date range (current month)
    const now = new Date();
    state.filters.dateRange = {
        start: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0],
        end: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
    };
}

// Dashboard View
async function loadDashboard() {
    const content = document.getElementById('content');
    
    content.innerHTML = `
        <div class="mb-8">
            <div class="flex justify-between items-center">
                <div>
                    <h1 class="text-3xl font-bold text-gray-900">Executive Dashboard</h1>
                    <p class="text-gray-600 mt-2">Real-time TPM performance overview</p>
                </div>
                <div class="flex gap-3">
                    <button onclick="exportDashboard()" class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
                        <i class="fas fa-download"></i>
                        Export
                    </button>
                    <button onclick="refreshDashboard()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
                        <i class="fas fa-sync"></i>
                        Refresh
                    </button>
                </div>
            </div>
        </div>
        
        <!-- KPI Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
            <div class="metric-card bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div class="flex items-center justify-between mb-4">
                    <div class="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg">
                        <i class="fas fa-dollar-sign text-white text-lg"></i>
                    </div>
                    <span class="text-sm font-semibold text-green-600">+12.5%</span>
                </div>
                <h3 class="text-gray-600 text-sm font-medium">Net Revenue</h3>
                <p class="text-2xl font-bold text-gray-900 mt-1" id="netRevenue">Loading...</p>
                <p class="text-xs text-gray-500 mt-2">YTD vs LY</p>
            </div>
            
            <div class="metric-card bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div class="flex items-center justify-between mb-4">
                    <div class="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-lg">
                        <i class="fas fa-percentage text-white text-lg"></i>
                    </div>
                    <span class="text-sm font-semibold text-green-600">285%</span>
                </div>
                <h3 class="text-gray-600 text-sm font-medium">Trade Spend ROI</h3>
                <p class="text-2xl font-bold text-gray-900 mt-1" id="tradeSpendROI">Loading...</p>
                <p class="text-xs text-gray-500 mt-2">Target: 250%</p>
            </div>
            
            <div class="metric-card bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div class="flex items-center justify-between mb-4">
                    <div class="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-lg">
                        <i class="fas fa-tags text-white text-lg"></i>
                    </div>
                    <span class="text-sm font-semibold text-blue-600">Active</span>
                </div>
                <h3 class="text-gray-600 text-sm font-medium">Promotions</h3>
                <p class="text-2xl font-bold text-gray-900 mt-1" id="activePromotions">Loading...</p>
                <p class="text-xs text-gray-500 mt-2">15 planned</p>
            </div>
            
            <div class="metric-card bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div class="flex items-center justify-between mb-4">
                    <div class="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-lg">
                        <i class="fas fa-wallet text-white text-lg"></i>
                    </div>
                    <span class="text-sm font-semibold text-orange-600">75%</span>
                </div>
                <h3 class="text-gray-600 text-sm font-medium">Budget Utilization</h3>
                <p class="text-2xl font-bold text-gray-900 mt-1" id="budgetUtilization">Loading...</p>
                <p class="text-xs text-gray-500 mt-2">R15M remaining</p>
            </div>
            
            <div class="metric-card bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div class="flex items-center justify-between mb-4">
                    <div class="bg-gradient-to-br from-red-500 to-red-600 p-3 rounded-lg">
                        <i class="fas fa-exclamation-triangle text-white text-lg"></i>
                    </div>
                    <span class="text-sm font-semibold text-red-600">3</span>
                </div>
                <h3 class="text-gray-600 text-sm font-medium">Critical Alerts</h3>
                <p class="text-2xl font-bold text-gray-900 mt-1" id="criticalAlerts">Loading...</p>
                <p class="text-xs text-gray-500 mt-2">Action required</p>
            </div>
        </div>
        
        <!-- Charts Row 1 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
            <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-lg font-semibold text-gray-900">Revenue Trend</h2>
                    <select class="text-sm border border-gray-300 rounded-lg px-3 py-1">
                        <option>Last 12 Months</option>
                        <option>YTD</option>
                        <option>QTD</option>
                    </select>
                </div>
                <canvas id="revenueTrendChart" height="250"></canvas>
            </div>
            
            <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-lg font-semibold text-gray-900">Channel Performance</h2>
                    <button class="text-sm text-blue-600 hover:text-blue-800">Details →</button>
                </div>
                <canvas id="channelPerformanceChart" height="250"></canvas>
            </div>
            
            <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-lg font-semibold text-gray-900">Promotion Effectiveness</h2>
                    <button class="text-sm text-blue-600 hover:text-blue-800">Analyze →</button>
                </div>
                <canvas id="promotionEffectivenessChart" height="250"></canvas>
            </div>
        </div>
        
        <!-- Activity Summary & Insights -->
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div class="xl:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-lg font-semibold text-gray-900">Activity Calendar</h2>
                    <button onclick="navigate('activity-grid')" class="text-sm text-blue-600 hover:text-blue-800">
                        View Full Grid →
                    </button>
                </div>
                <div id="activityCalendar" class="h-64">
                    <!-- Mini activity grid will be loaded here -->
                </div>
            </div>
            
            <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-lg font-semibold text-gray-900">AI Insights</h2>
                    <span class="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        <i class="fas fa-bolt"></i> Live
                    </span>
                </div>
                <div id="dashboardInsights" class="space-y-3">
                    <!-- AI insights will be loaded here -->
                </div>
            </div>
        </div>
    `;
    
    // Load dashboard data
    try {
        const data = await apiCall(`/analytics/tpm-dashboard`);
        
        // Update KPIs
        document.getElementById('netRevenue').textContent = `R${(data.data.effectiveness.incrementalRevenue / 1000000).toFixed(1)}M`;
        document.getElementById('tradeSpendROI').textContent = `${data.data.promotions.avgROI}%`;
        document.getElementById('activePromotions').textContent = data.data.promotions.active;
        document.getElementById('budgetUtilization').textContent = `${data.data.budget.utilization}%`;
        document.getElementById('criticalAlerts').textContent = '3'; // Would come from real alerts
        
        // Load charts
        await Promise.all([
            loadRevenueTrendChart(),
            loadChannelPerformanceChart(),
            loadPromotionEffectivenessChart()
        ]);
        
        // Load activity calendar
        loadMiniActivityGrid();
        
        // Load AI insights
        loadDashboardInsights();
        
    } catch (error) {
        showNotification('Failed to load dashboard data', 'error');
        console.error('Dashboard error:', error);
    }
}

// Activity Grid View
async function loadActivityGrid() {
    const content = document.getElementById('content');
    
    content.innerHTML = `
        <div class="mb-6">
            <div class="flex justify-between items-center">
                <div>
                    <h1 class="text-3xl font-bold text-gray-900">Activity Planning Grid</h1>
                    <p class="text-gray-600 mt-2">Plan and track promotional activities across customers and time</p>
                </div>
                <div class="flex gap-3">
                    <button onclick="showActivityFilters()" class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                        <i class="fas fa-filter"></i> Filters
                    </button>
                    <button onclick="exportActivityGrid()" class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                        <i class="fas fa-download"></i> Export
                    </button>
                    <button onclick="createActivity()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                        <i class="fas fa-plus"></i> Add Activity
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Grid Controls -->
        <div class="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
            <div class="flex flex-wrap gap-4 items-center">
                <div class="flex items-center gap-2">
                    <label class="text-sm font-medium text-gray-700">View:</label>
                    <select id="gridView" onchange="updateActivityGrid()" class="text-sm border border-gray-300 rounded-lg px-3 py-1">
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                    </select>
                </div>
                
                <div class="flex items-center gap-2">
                    <label class="text-sm font-medium text-gray-700">Channel:</label>
                    <select id="gridChannel" onchange="updateActivityGrid()" class="text-sm border border-gray-300 rounded-lg px-3 py-1">
                        <option value="all">All Channels</option>
                        <option value="modern">Modern Trade</option>
                        <option value="traditional">Traditional Trade</option>
                        <option value="convenience">Convenience</option>
                    </select>
                </div>
                
                <div class="flex items-center gap-2">
                    <label class="text-sm font-medium text-gray-700">Category:</label>
                    <select id="gridCategory" onchange="updateActivityGrid()" class="text-sm border border-gray-300 rounded-lg px-3 py-1">
                        <option value="all">All Categories</option>
                        <option value="beverages">Beverages</option>
                        <option value="snacks">Snacks</option>
                        <option value="personal-care">Personal Care</option>
                    </select>
                </div>
                
                <div class="flex-1"></div>
                
                <div class="flex items-center gap-4">
                    <div class="flex items-center gap-2">
                        <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span class="text-xs text-gray-600">Completed</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span class="text-xs text-gray-600">Active</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-3 h-3 bg-gray-300 rounded-full"></div>
                        <span class="text-xs text-gray-600">Planned</span>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Activity Grid -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div id="activityGridContainer" class="overflow-auto" style="max-height: calc(100vh - 300px);">
                <div class="min-w-[1200px]">
                    <!-- Grid header -->
                    <div class="sticky top-0 bg-gray-50 border-b border-gray-200 z-20">
                        <div class="flex">
                            <div class="w-48 p-3 font-medium text-sm text-gray-700 border-r border-gray-200">
                                Customer / Week
                            </div>
                            <div id="gridWeeks" class="flex flex-1">
                                <!-- Week headers will be generated -->
                            </div>
                        </div>
                    </div>
                    
                    <!-- Grid body -->
                    <div id="gridBody">
                        <!-- Customer rows will be generated -->
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Activity Details Modal -->
        <div id="activityModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div id="activityModalContent">
                    <!-- Activity details will be loaded here -->
                </div>
            </div>
        </div>
    `;
    
    // Load activity grid data
    loadActivityGridData();
}

async function loadActivityGridData() {
    try {
        // Get current week
        const now = new Date();
        const currentWeek = getWeekNumber(now);
        const currentYear = now.getFullYear();
        
        // Load 12 weeks of data (4 past, current, 7 future)
        const weekStart = `${currentYear}-W${(currentWeek - 4).toString().padStart(2, '0')}`;
        const weekEnd = `${currentYear}-W${(currentWeek + 7).toString().padStart(2, '0')}`;
        
        const activities = await apiCall(`/activity-grid?weekStart=${weekStart}&weekEnd=${weekEnd}`);
        state.data.activityGrid = activities.data;
        
        // Render grid
        renderActivityGrid();
        
    } catch (error) {
        showNotification('Failed to load activity grid', 'error');
        console.error('Activity grid error:', error);
    }
}

function renderActivityGrid() {
    const view = document.getElementById('gridView').value;
    const channel = document.getElementById('gridChannel').value;
    const category = document.getElementById('gridCategory').value;
    
    // Filter customers
    let customers = state.data.customers;
    if (channel !== 'all') {
        customers = customers.filter(c => c.channel.toLowerCase().includes(channel));
    }
    
    // Generate week headers
    const weeksContainer = document.getElementById('gridWeeks');
    const weeks = generateWeekHeaders();
    
    weeksContainer.innerHTML = weeks.map(week => `
        <div class="flex-1 min-w-[120px] p-3 text-center border-r border-gray-200">
            <div class="text-xs font-medium text-gray-700">${week.label}</div>
            <div class="text-xs text-gray-500">${week.dates}</div>
        </div>
    `).join('');
    
    // Generate customer rows
    const gridBody = document.getElementById('gridBody');
    
    gridBody.innerHTML = customers.slice(0, 10).map(customer => {
        const customerActivities = state.data.activityGrid.filter(a => a.customerId === customer.id);
        
        return `
            <div class="flex border-b border-gray-200 hover:bg-gray-50">
                <div class="w-48 p-3 border-r border-gray-200 sticky left-0 bg-white z-10">
                    <div class="text-sm font-medium text-gray-900">${customer.name}</div>
                    <div class="text-xs text-gray-500">${customer.type}</div>
                </div>
                <div class="flex flex-1">
                    ${weeks.map(week => {
                        const activity = customerActivities.find(a => a.weekId === week.id);
                        return renderActivityCell(customer.id, week.id, activity);
                    }).join('')}
                </div>
            </div>
        `;
    }).join('');
}

function renderActivityCell(customerId, weekId, activity) {
    if (!activity || activity.activities.length === 0) {
        return `
            <div class="flex-1 min-w-[120px] activity-cell cursor-pointer" 
                 onclick="showActivityDetails('${customerId}', '${weekId}')">
                <div class="h-full p-2">
                    <div class="text-xs text-gray-400 text-center">
                        <i class="fas fa-plus opacity-0 hover:opacity-100 transition"></i>
                    </div>
                </div>
            </div>
        `;
    }
    
    const statusColor = activity.status === 'completed' ? 'green' : 
                       activity.status === 'active' ? 'blue' : 'gray';
    
    const totalInvestment = activity.activities.reduce((sum, a) => sum + a.investment, 0);
    
    return `
        <div class="flex-1 min-w-[120px] activity-cell cursor-pointer relative" 
             onclick="showActivityDetails('${customerId}', '${weekId}', '${activity.id}')">
            <div class="activity-indicator bg-${statusColor}-500"></div>
            <div class="h-full p-2">
                <div class="text-xs font-medium text-gray-900">${activity.activities.length} activities</div>
                <div class="text-xs text-gray-600">R${(totalInvestment/1000).toFixed(0)}k</div>
                ${activity.activities.slice(0, 2).map(a => {
                    const product = state.data.products.find(p => p.id === a.productId);
                    return `<div class="text-xs text-gray-500 truncate">${product?.name || 'Unknown'}</div>`;
                }).join('')}
                ${activity.activities.length > 2 ? `<div class="text-xs text-gray-400">+${activity.activities.length - 2} more</div>` : ''}
            </div>
        </div>
    `;
}

function generateWeekHeaders() {
    const weeks = [];
    const now = new Date();
    const currentWeek = getWeekNumber(now);
    const currentYear = now.getFullYear();
    
    for (let i = -4; i <= 7; i++) {
        const weekNum = currentWeek + i;
        const weekId = `${currentYear}-W${weekNum.toString().padStart(2, '0')}`;
        const weekStart = getDateFromWeek(currentYear, weekNum);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        weeks.push({
            id: weekId,
            label: `Week ${weekNum}`,
            dates: `${weekStart.getDate()}/${weekStart.getMonth() + 1} - ${weekEnd.getDate()}/${weekEnd.getMonth() + 1}`,
            isCurrent: i === 0
        });
    }
    
    return weeks;
}

// Pricing & Elasticity View
async function loadPricing() {
    const content = document.getElementById('content');
    
    content.innerHTML = `
        <div class="mb-6">
            <div class="flex justify-between items-center">
                <div>
                    <h1 class="text-3xl font-bold text-gray-900">Pricing & Elasticity</h1>
                    <p class="text-gray-600 mt-2">Dynamic pricing optimization and elasticity analysis</p>
                </div>
                <div class="flex gap-3">
                    <button onclick="runPriceSimulation()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                        <i class="fas fa-calculator"></i> Run Simulation
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Price Recommendations -->
        <div class="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-lg font-semibold text-gray-900">AI Price Recommendations</h2>
                <span class="text-sm text-gray-500">Last updated: 2 hours ago</span>
            </div>
            <div id="priceRecommendations" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <!-- Recommendations will be loaded here -->
            </div>
        </div>
        
        <!-- Elasticity Analysis -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Price Elasticity by Category</h2>
                <canvas id="elasticityChart" height="300"></canvas>
            </div>
            
            <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Competitive Price Index</h2>
                <canvas id="competitivePriceChart" height="300"></canvas>
            </div>
        </div>
    `;
    
    // Load pricing data
    loadPricingData();
}

// Scenario Planning View
async function loadScenarios() {
    const content = document.getElementById('content');
    
    content.innerHTML = `
        <div class="mb-6">
            <div class="flex justify-between items-center">
                <div>
                    <h1 class="text-3xl font-bold text-gray-900">Scenario Planning</h1>
                    <p class="text-gray-600 mt-2">What-if analysis and strategic planning</p>
                </div>
                <div class="flex gap-3">
                    <button onclick="createScenario()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                        <i class="fas fa-plus"></i> New Scenario
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Active Scenarios -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div id="scenarioCards">
                <!-- Scenario cards will be loaded here -->
            </div>
        </div>
        
        <!-- Scenario Comparison -->
        <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Scenario Comparison</h2>
            <div id="scenarioComparison">
                <!-- Comparison table will be loaded here -->
            </div>
        </div>
    `;
    
    // Load scenarios
    loadScenariosData();
}

// Chart loading functions
async function loadRevenueTrendChart() {
    try {
        const data = await apiCall('/analytics/sales-trend');
        
        const ctx = document.getElementById('revenueTrendChart').getContext('2d');
        
        if (state.charts.revenueTrend) {
            state.charts.revenueTrend.destroy();
        }
        
        state.charts.revenueTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.data.map(d => d.month),
                datasets: [{
                    label: 'Revenue',
                    data: data.data.map(d => d.revenue),
                    borderColor: '#3b82f6',
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
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Revenue: R' + (context.parsed.y / 1000000).toFixed(1) + 'M';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'R' + (value / 1000000).toFixed(0) + 'M';
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Failed to load revenue trend chart:', error);
    }
}

async function loadChannelPerformanceChart() {
    const ctx = document.getElementById('channelPerformanceChart').getContext('2d');
    
    if (state.charts.channelPerformance) {
        state.charts.channelPerformance.destroy();
    }
    
    state.charts.channelPerformance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Modern Trade', 'Traditional Trade', 'Convenience'],
            datasets: [{
                data: [55, 30, 15],
                backgroundColor: [
                    '#3b82f6',
                    '#10b981',
                    '#f59e0b'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed + '%';
                        }
                    }
                }
            }
        }
    });
}

async function loadPromotionEffectivenessChart() {
    const ctx = document.getElementById('promotionEffectivenessChart').getContext('2d');
    
    if (state.charts.promotionEffectiveness) {
        state.charts.promotionEffectiveness.destroy();
    }
    
    state.charts.promotionEffectiveness = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Volume Discount', 'Price Off', 'BOGO', 'Bundle', 'Loyalty'],
            datasets: [{
                label: 'ROI %',
                data: [285, 220, 180, 150, 320],
                backgroundColor: function(context) {
                    const value = context.parsed.y;
                    return value >= 250 ? '#10b981' : value >= 150 ? '#f59e0b' : '#ef4444';
                }
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                datalabels: {
                    anchor: 'end',
                    align: 'top',
                    formatter: (value) => value + '%',
                    font: {
                        weight: 'bold',
                        size: 11
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

// AI Insights Bot functions
async function sendInsightsBotMessage(event) {
    event.preventDefault();
    
    const input = document.getElementById('insightsBotInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    addInsightsBotMessage(message, 'user');
    input.value = '';
    
    // Show typing indicator
    showInsightsBotTyping();
    
    try {
        const response = await apiCall('/ai/insights-bot', {
            method: 'POST',
            body: JSON.stringify({ 
                query: message,
                context: {
                    currentView: state.currentView,
                    filters: state.filters
                }
            })
        });
        
        hideInsightsBotTyping();
        
        if (response.success) {
            addInsightsBotMessage(response.data.response, 'assistant', response.data);
        }
    } catch (error) {
        hideInsightsBotTyping();
        addInsightsBotMessage('Sorry, I encountered an error. Please try again.', 'assistant');
    }
}

function addInsightsBotMessage(message, role, data = null) {
    const container = document.getElementById('insightsBotMessages');
    const messageDiv = document.createElement('div');
    
    if (role === 'user') {
        messageDiv.className = 'chat-bubble bg-blue-600 text-white p-3 rounded-lg ml-auto';
        messageDiv.innerHTML = `<p class="text-sm">${message}</p>`;
    } else {
        messageDiv.className = 'chat-bubble bg-white p-3 rounded-lg shadow-sm';
        messageDiv.innerHTML = `
            <p class="text-sm text-gray-700">${message}</p>
            ${data?.suggestions ? `
                <div class="mt-3 flex flex-wrap gap-2">
                    ${data.suggestions.map(s => `
                        <button onclick="askInsightsBot('${s}')" class="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition">
                            ${s}
                        </button>
                    `).join('')}
                </div>
            ` : ''}
            ${data?.actions ? `
                <div class="mt-3 flex gap-2">
                    ${data.actions.map(a => `
                        <button onclick="executeInsightAction('${a.action}', '${a.target}')" class="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded transition">
                            ${a.label}
                        </button>
                    `).join('')}
                </div>
            ` : ''}
        `;
    }
    
    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
}

function askInsightsBot(query) {
    document.getElementById('insightsBotInput').value = query;
    document.getElementById('insightsBotInput').form.dispatchEvent(new Event('submit'));
}

function showInsightsBotTyping() {
    const container = document.getElementById('insightsBotMessages');
    const typingDiv = document.createElement('div');
    typingDiv.id = 'insightsBotTyping';
    typingDiv.className = 'chat-bubble bg-white p-3 rounded-lg shadow-sm';
    typingDiv.innerHTML = `
        <div class="chat-typing">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    container.appendChild(typingDiv);
    container.scrollTop = container.scrollHeight;
}

function hideInsightsBotTyping() {
    const typing = document.getElementById('insightsBotTyping');
    if (typing) typing.remove();
}

// Real-time updates
function initializeRealTimeUpdates() {
    // Set up SSE for real-time insights
    if (state.token) {
        startInsightsStream();
    }
}

function startInsightsStream() {
    if (state.eventSource) {
        state.eventSource.close();
    }
    
    state.eventSource = new EventSource(`${API_BASE}/insights/stream?token=${state.token}`);
    
    state.eventSource.onmessage = (event) => {
        const insight = JSON.parse(event.data);
        handleNewInsight(insight);
    };
    
    state.eventSource.onerror = (error) => {
        console.error('SSE error:', error);
        // Reconnect after 5 seconds
        setTimeout(startInsightsStream, 5000);
    };
}

function handleNewInsight(insight) {
    // Add to insights list
    state.data.insights.unshift(insight);
    
    // Show notification for high severity
    if (insight.severity === 'high') {
        showNotification(insight.title, 'warning');
    }
    
    // Update insights panel if open
    const panel = document.getElementById('insightsPanel');
    if (!panel.classList.contains('hidden')) {
        updateInsightsList();
    }
    
    // Update dashboard insights if on dashboard
    if (state.currentView === 'dashboard') {
        updateDashboardInsights();
    }
}

// Utility functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    const bgColor = type === 'error' ? 'bg-red-500' : 
                   type === 'success' ? 'bg-green-500' : 
                   type === 'warning' ? 'bg-orange-500' : 'bg-blue-500';
    
    notification.className = `fixed top-20 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 notification-enter`;
    notification.innerHTML = `
        <div class="flex items-center gap-3">
            <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 
                          type === 'success' ? 'fa-check-circle' : 
                          type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function showLoading(message = 'Loading...') {
    const loading = document.createElement('div');
    loading.id = 'globalLoading';
    loading.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
    loading.innerHTML = `
        <div class="bg-white rounded-lg p-6 flex items-center gap-4">
            <div class="loading-spinner"></div>
            <span class="text-gray-700">${message}</span>
        </div>
    `;
    document.body.appendChild(loading);
}

function hideLoading() {
    const loading = document.getElementById('globalLoading');
    if (loading) loading.remove();
}

function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function getDateFromWeek(year, week) {
    const date = new Date(year, 0, 1 + (week - 1) * 7);
    const dayOfWeek = date.getDay();
    const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
}

// Keyboard shortcuts
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K for search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            document.querySelector('input[placeholder="Search..."]').focus();
        }
        
        // Ctrl/Cmd + N for quick create
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            showQuickCreate();
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
            closeQuickCreate();
            document.getElementById('activityModal').classList.add('hidden');
        }
    });
}

// Export functions for HTML
window.login = login;
window.loginWithSSO = loginWithSSO;
window.logout = logout;
window.toggleSidebar = toggleSidebar;
window.toggleUserMenu = toggleUserMenu;
window.toggleInsightsBot = toggleInsightsBot;
window.toggleInsights = toggleInsights;
window.toggleNotifications = toggleNotifications;
window.showQuickCreate = showQuickCreate;
window.closeQuickCreate = closeQuickCreate;
window.navigate = navigate;
window.sendInsightsBotMessage = sendInsightsBotMessage;
window.askInsightsBot = askInsightsBot;
window.quickCreate = (type) => {
    closeQuickCreate();
    showNotification(`Creating new ${type}...`, 'info');
    // Navigate to appropriate view
    switch(type) {
        case 'promotion':
            navigate('promotions');
            break;
        case 'claim':
            navigate('claims');
            break;
        case 'scenario':
            navigate('scenarios');
            break;
    }
};

// Initialize tooltips
document.addEventListener('DOMContentLoaded', () => {
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#userMenu') && !e.target.closest('[onclick="toggleUserMenu()"]')) {
            document.getElementById('userMenu').classList.add('hidden');
        }
    });
});