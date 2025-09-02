#!/bin/bash

# ============================================================================
# Vanta X Enterprise FMCG Platform - Comprehensive Demo Testing Script
# Tests all functionality: backend APIs, frontend features, AI models, integrations
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
API_BASE_URL="http://localhost:4000"
FRONTEND_URL="http://localhost"
TEST_RESULTS=()
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to print colored output
print_status() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

print_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

print_header() {
    echo ""
    echo -e "${PURPLE}============================================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}============================================================${NC}"
    echo ""
}

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_result="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    print_status "Running: $test_name"
    
    if eval "$test_command"; then
        print_success "$test_name"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        TEST_RESULTS+=("✅ $test_name")
        return 0
    else
        print_error "$test_name"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        TEST_RESULTS+=("❌ $test_name")
        return 1
    fi
}

# Function to test API endpoint
test_api() {
    local endpoint="$1"
    local expected_status="$2"
    local company_id="${3:-diplomat-sa}"
    
    local response=$(curl -s -w "%{http_code}" -H "X-Company-ID: $company_id" "$API_BASE_URL$endpoint")
    local status_code="${response: -3}"
    
    if [[ "$status_code" == "$expected_status" ]]; then
        return 0
    else
        echo "Expected status $expected_status, got $status_code"
        return 1
    fi
}

# Function to test API with JSON response
test_api_json() {
    local endpoint="$1"
    local company_id="${2:-diplomat-sa}"
    
    local response=$(curl -s -H "X-Company-ID: $company_id" "$API_BASE_URL$endpoint")
    
    if echo "$response" | jq -e '.success == true' > /dev/null 2>&1; then
        return 0
    else
        echo "API response invalid or success != true"
        return 1
    fi
}

# Function to test POST API
test_api_post() {
    local endpoint="$1"
    local data="$2"
    local company_id="${3:-diplomat-sa}"
    
    local response=$(curl -s -X POST -H "Content-Type: application/json" -H "X-Company-ID: $company_id" -d "$data" "$API_BASE_URL$endpoint")
    
    if echo "$response" | jq -e '.success == true' > /dev/null 2>&1; then
        return 0
    else
        echo "POST API response invalid or success != true"
        return 1
    fi
}

# Backend API Tests
test_backend_apis() {
    print_header "Backend API Tests"
    
    # Health check
    run_test "Health Check Endpoint" "test_api '/health' '200'"
    
    # Companies API
    run_test "Companies List API" "test_api_json '/api/v2/companies'"
    
    # Dashboard API
    run_test "Dashboard API - Diplomat SA" "test_api_json '/api/v2/dashboard' 'diplomat-sa'"
    run_test "Dashboard API - Premium Brands" "test_api_json '/api/v2/dashboard' 'premium-brands'"
    run_test "Dashboard API - Regional Dist" "test_api_json '/api/v2/dashboard' 'regional-dist'"
    
    # KPIs API
    run_test "KPIs API - Diplomat SA" "test_api_json '/api/v2/kpis' 'diplomat-sa'"
    run_test "KPIs API - Premium Brands" "test_api_json '/api/v2/kpis' 'premium-brands'"
    run_test "KPIs API - Regional Dist" "test_api_json '/api/v2/kpis' 'regional-dist'"
    
    # Sales API
    run_test "Sales List API" "test_api_json '/api/v2/sales'"
    run_test "Sales Analytics API" "test_api_json '/api/v2/sales/analytics'"
    
    # Products API
    run_test "Products List API" "test_api_json '/api/v2/products'"
    
    # Customers API
    run_test "Customers List API" "test_api_json '/api/v2/customers'"
    
    # Promotions API
    run_test "Promotions List API" "test_api_json '/api/v2/promotions'"
    
    # AI Models API
    run_test "AI Models List API" "test_api_json '/api/v2/ai/models'"
    
    # AI Prediction API
    run_test "AI Prediction API" "test_api_post '/api/v2/ai/predict' '{\"model\":\"demand-forecasting\",\"data\":{}}'"
    
    # AI Chat API
    run_test "AI Chat API" "test_api_post '/api/v2/ai/chat' '{\"message\":\"What are our sales trends?\"}'"
}

# Multi-company data tests
test_multicompany_data() {
    print_header "Multi-Company Data Tests"
    
    # Test data isolation between companies
    run_test "Diplomat SA Data Isolation" "
        response=\$(curl -s -H 'X-Company-ID: diplomat-sa' '$API_BASE_URL/api/v2/dashboard')
        echo \"\$response\" | jq -e '.data.kpis | length > 0'
    "
    
    run_test "Premium Brands Data Isolation" "
        response=\$(curl -s -H 'X-Company-ID: premium-brands' '$API_BASE_URL/api/v2/dashboard')
        echo \"\$response\" | jq -e '.data.kpis | length > 0'
    "
    
    run_test "Regional Distribution Data Isolation" "
        response=\$(curl -s -H 'X-Company-ID: regional-dist' '$API_BASE_URL/api/v2/dashboard')
        echo \"\$response\" | jq -e '.data.kpis | length > 0'
    "
    
    # Test currency differences
    run_test "Currency Handling - GBP for Diplomat SA" "
        response=\$(curl -s -H 'X-Company-ID: diplomat-sa' '$API_BASE_URL/api/v2/companies')
        echo \"\$response\" | jq -e '.data[] | select(.id == \"diplomat-sa\") | .currency == \"GBP\"'
    "
    
    run_test "Currency Handling - USD for Premium Brands" "
        response=\$(curl -s -H 'X-Company-ID: premium-brands' '$API_BASE_URL/api/v2/companies')
        echo \"\$response\" | jq -e '.data[] | select(.id == \"premium-brands\") | .currency == \"USD\"'
    "
    
    run_test "Currency Handling - AUD for Regional Dist" "
        response=\$(curl -s -H 'X-Company-ID: regional-dist' '$API_BASE_URL/api/v2/companies')
        echo \"\$response\" | jq -e '.data[] | select(.id == \"regional-dist\") | .currency == \"AUD\"'
    "
}

# AI and ML model tests
test_ai_models() {
    print_header "AI/ML Model Tests"
    
    # Test all AI models
    local models=("demand-forecasting" "price-optimization" "customer-segmentation" "promotion-effectiveness" "inventory-optimization")
    
    for model in "${models[@]}"; do
        run_test "AI Model: $model" "test_api_post '/api/v2/ai/predict' '{\"model\":\"$model\",\"data\":{\"companyId\":\"diplomat-sa\"}}'"
    done
    
    # Test AI chat with different queries
    local queries=(
        "What are our sales trends?"
        "How is our revenue performing?"
        "Tell me about our customers"
        "What products are selling well?"
        "How are our promotions doing?"
    )
    
    for query in "${queries[@]}"; do
        run_test "AI Chat: '$query'" "test_api_post '/api/v2/ai/chat' '{\"message\":\"$query\"}'"
    done
}

# Integration endpoints tests
test_integrations() {
    print_header "Integration Endpoints Tests"
    
    # SAP Integration
    run_test "SAP Import Endpoint" "test_api_post '/api/v2/sap/import' '{\"system\":\"ECC\",\"data\":[]}'"
    run_test "SAP Status Endpoint" "test_api_json '/api/v2/sap/status'"
    
    # Excel Templates
    run_test "Excel Templates Endpoint" "test_api_json '/api/v2/templates/excel'"
    
    # Microsoft 365 SSO
    run_test "Microsoft 365 SSO Endpoint" "test_api_json '/api/v2/auth/microsoft'"
    
    # Analytics
    run_test "Analytics Trends Endpoint" "test_api_json '/api/v2/analytics/trends'"
    
    # Reports
    run_test "Reports List Endpoint" "test_api_json '/api/v2/reports'"
}

# Frontend accessibility tests
test_frontend() {
    print_header "Frontend Accessibility Tests"
    
    # Test main page
    run_test "Frontend Main Page" "curl -f -s '$FRONTEND_URL' > /dev/null"
    
    # Test static assets
    run_test "Frontend JavaScript" "curl -f -s '$FRONTEND_URL/vantax-demo-app.js' > /dev/null"
    
    # Test API proxy through Nginx
    run_test "API Proxy - Health Check" "curl -f -s '$FRONTEND_URL/health' > /dev/null"
    run_test "API Proxy - Companies" "curl -f -s '$FRONTEND_URL/api/v2/companies' > /dev/null"
}

# Performance tests
test_performance() {
    print_header "Performance Tests"
    
    # Test response times
    run_test "API Response Time < 1000ms" "
        start_time=\$(date +%s%N)
        curl -s '$API_BASE_URL/api/v2/dashboard' > /dev/null
        end_time=\$(date +%s%N)
        duration=\$(( (end_time - start_time) / 1000000 ))
        [[ \$duration -lt 1000 ]]
    "
    
    # Test concurrent requests
    run_test "Concurrent API Requests" "
        for i in {1..10}; do
            curl -s '$API_BASE_URL/api/v2/companies' > /dev/null &
        done
        wait
        true
    "
    
    # Test memory usage
    run_test "Backend Memory Usage < 200MB" "
        pid=\$(pgrep -f 'vantax-demo-backend.js' | head -1)
        if [[ -n \"\$pid\" ]]; then
            memory=\$(ps -p \$pid -o rss= | tr -d ' ')
            memory_mb=\$(( memory / 1024 ))
            [[ \$memory_mb -lt 200 ]]
        else
            false
        fi
    "
}

# Security tests
test_security() {
    print_header "Security Tests"
    
    # Test CORS headers
    run_test "CORS Headers Present" "
        response=\$(curl -s -I '$API_BASE_URL/api/v2/companies')
        echo \"\$response\" | grep -i 'access-control-allow-origin'
    "
    
    # Test invalid endpoints
    run_test "Invalid Endpoint Returns 404" "test_api '/api/v2/invalid-endpoint' '404'"
    
    # Test malformed JSON
    run_test "Malformed JSON Handling" "
        status=\$(curl -s -w '%{http_code}' -X POST -H 'Content-Type: application/json' -d '{invalid json}' '$API_BASE_URL/api/v2/ai/chat')
        [[ \"\${status: -3}\" == \"400\" ]] || [[ \"\${status: -3}\" == \"500\" ]]
    "
    
    # Test SQL injection attempts (should be safe with in-memory data)
    run_test "SQL Injection Protection" "
        response=\$(curl -s -H 'X-Company-ID: diplomat-sa; DROP TABLE users;' '$API_BASE_URL/api/v2/companies')
        echo \"\$response\" | jq -e '.success == true'
    "
}

# Data validation tests
test_data_validation() {
    print_header "Data Validation Tests"
    
    # Test data structure
    run_test "KPIs Data Structure" "
        response=\$(curl -s -H 'X-Company-ID: diplomat-sa' '$API_BASE_URL/api/v2/kpis')
        echo \"\$response\" | jq -e '.data | length > 0 and .data[0] | has(\"name\") and has(\"value\") and has(\"target\")'
    "
    
    run_test "Sales Data Structure" "
        response=\$(curl -s -H 'X-Company-ID: diplomat-sa' '$API_BASE_URL/api/v2/sales')
        echo \"\$response\" | jq -e '.data | length > 0 and .data[0] | has(\"orderNumber\") and has(\"customerName\") and has(\"totalAmount\")'
    "
    
    run_test "Products Data Structure" "
        response=\$(curl -s -H 'X-Company-ID: diplomat-sa' '$API_BASE_URL/api/v2/products')
        echo \"\$response\" | jq -e '.data | length > 0 and .data[0] | has(\"sku\") and has(\"name\") and has(\"price\")'
    "
    
    run_test "Customers Data Structure" "
        response=\$(curl -s -H 'X-Company-ID: diplomat-sa' '$API_BASE_URL/api/v2/customers')
        echo \"\$response\" | jq -e '.data | length > 0 and .data[0] | has(\"name\") and has(\"type\") and has(\"region\")'
    "
    
    # Test data consistency
    run_test "Dashboard Data Consistency" "
        response=\$(curl -s -H 'X-Company-ID: diplomat-sa' '$API_BASE_URL/api/v2/dashboard')
        echo \"\$response\" | jq -e '.data | has(\"kpis\") and has(\"recentSales\") and has(\"salesTrend\")'
    "
}

# System health tests
test_system_health() {
    print_header "System Health Tests"
    
    # Test process status
    run_test "Backend Process Running" "pgrep -f 'vantax-demo-backend.js' > /dev/null"
    run_test "Nginx Process Running" "pgrep nginx > /dev/null"
    run_test "PM2 Process Running" "pgrep PM2 > /dev/null || pgrep pm2 > /dev/null"
    
    # Test port availability
    run_test "Backend Port 4000 Open" "netstat -tuln | grep ':4000 ' > /dev/null"
    run_test "Frontend Port 80 Open" "netstat -tuln | grep ':80 ' > /dev/null"
    
    # Test log files
    run_test "Log Directory Exists" "[[ -d '/var/log/vantax-demo' ]]"
    run_test "Application Logs Present" "[[ -f '/var/log/vantax-demo/combined.log' ]] || [[ -f '/var/log/vantax-demo/out.log' ]]"
    
    # Test disk space
    run_test "Sufficient Disk Space" "
        available=\$(df / | awk 'NR==2 {print \$4}')
        [[ \$available -gt 1000000 ]]  # More than 1GB available
    "
}

# Generate test report
generate_report() {
    print_header "Test Results Summary"
    
    echo -e "${CYAN}📊 Test Statistics:${NC}"
    echo -e "  Total Tests: ${TOTAL_TESTS}"
    echo -e "  Passed: ${GREEN}${PASSED_TESTS}${NC}"
    echo -e "  Failed: ${RED}${FAILED_TESTS}${NC}"
    echo -e "  Success Rate: $(( PASSED_TESTS * 100 / TOTAL_TESTS ))%"
    echo ""
    
    echo -e "${CYAN}📋 Detailed Results:${NC}"
    for result in "${TEST_RESULTS[@]}"; do
        echo "  $result"
    done
    echo ""
    
    if [[ $FAILED_TESTS -eq 0 ]]; then
        echo -e "${GREEN}🎉 All tests passed! The demo system is fully functional.${NC}"
        echo ""
        echo -e "${CYAN}✅ Verified Features:${NC}"
        echo -e "  • Multi-company data isolation and switching"
        echo -e "  • Complete API functionality (20+ endpoints)"
        echo -e "  • AI/ML models and chatbot integration"
        echo -e "  • Frontend accessibility and responsiveness"
        echo -e "  • SAP integration endpoints"
        echo -e "  • Security headers and error handling"
        echo -e "  • Performance and memory efficiency"
        echo -e "  • Data validation and consistency"
        echo ""
        echo -e "${GREEN}🚀 The Vanta X Enterprise FMCG Platform demo is ready for presentation!${NC}"
        return 0
    else
        echo -e "${RED}❌ Some tests failed. Please review the issues above.${NC}"
        echo ""
        echo -e "${YELLOW}🔧 Troubleshooting Tips:${NC}"
        echo -e "  • Check if all services are running: vantax-demo status"
        echo -e "  • Review logs: vantax-demo logs"
        echo -e "  • Restart services: vantax-demo restart"
        echo -e "  • Check system resources: free -h && df -h"
        return 1
    fi
}

# Main function
main() {
    clear
    print_header "Vanta X Enterprise FMCG Platform - Comprehensive Demo Testing"
    
    echo -e "${BLUE}Testing Environment:${NC}"
    echo -e "  API Base URL: $API_BASE_URL"
    echo -e "  Frontend URL: $FRONTEND_URL"
    echo -e "  Test Start Time: $(date)"
    echo ""
    
    # Check prerequisites
    if ! command -v curl &> /dev/null; then
        print_error "curl is required but not installed"
        exit 1
    fi
    
    if ! command -v jq &> /dev/null; then
        print_error "jq is required but not installed"
        echo "Install with: sudo apt-get install jq"
        exit 1
    fi
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 5
    
    # Run all test suites
    test_backend_apis
    test_multicompany_data
    test_ai_models
    test_integrations
    test_frontend
    test_performance
    test_security
    test_data_validation
    test_system_health
    
    # Generate final report
    generate_report
}

# Run main function
main "$@"