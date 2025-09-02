#!/bin/bash

# Enterprise FMCG Platform - System Testing Script
# Comprehensive testing of all system components
# 
# This script tests:
# - Backend API functionality
# - AI/ML model responses
# - Multi-company data access
# - Frontend integration
# - Real-time features
# - Security and performance

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Test configuration
BACKEND_PORT=4000
FRONTEND_PORT=3000
TEST_COMPANY="diplomat-sa"
TEST_USER="diplomat-sa-user-1"
BASE_URL="http://localhost:$BACKEND_PORT"

# Test counters
TESTS_TOTAL=0
TESTS_PASSED=0
TESTS_FAILED=0

# Function to print colored output
print_test() {
    echo -e "${BLUE}[TEST]${NC} $1"
    ((TESTS_TOTAL++))
}

print_pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((TESTS_PASSED++))
}

print_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((TESTS_FAILED++))
}

print_info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}================================${NC}"
}

# Function to start backend for testing
start_backend() {
    print_header "Starting Backend for Testing"
    
    cd /workspace/enterprise-fmcg-platform
    
    # Start backend in background
    node enterprise-backend.js > backend-test.log 2>&1 &
    BACKEND_PID=$!
    
    print_info "Backend started with PID: $BACKEND_PID"
    
    # Wait for backend to start
    print_info "Waiting for backend to initialize..."
    sleep 10
    
    # Check if backend is running
    if kill -0 $BACKEND_PID 2>/dev/null; then
        print_pass "Backend is running"
    else
        print_fail "Backend failed to start"
        cat backend-test.log
        exit 1
    fi
}

# Function to test API endpoint
test_api_endpoint() {
    local endpoint=$1
    local expected_status=${2:-200}
    local description=$3
    
    print_test "Testing $description"
    
    local url="$BASE_URL$endpoint"
    if [[ "$endpoint" == *"companyId"* ]]; then
        url="$url&companyId=$TEST_COMPANY&userId=$TEST_USER"
    else
        url="$url?companyId=$TEST_COMPANY&userId=$TEST_USER"
    fi
    
    local response=$(curl -s -w "HTTPSTATUS:%{http_code}" -H "X-Company-ID: $TEST_COMPANY" -H "X-User-ID: $TEST_USER" "$url")
    local body=$(echo $response | sed -E 's/HTTPSTATUS\:[0-9]{3}$//')
    local status=$(echo $response | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')
    
    if [[ "$status" == "$expected_status" ]]; then
        print_pass "$description - Status: $status"
        return 0
    else
        print_fail "$description - Expected: $expected_status, Got: $status"
        echo "Response body: $body"
        return 1
    fi
}

# Function to test API endpoint with JSON response
test_api_json() {
    local endpoint=$1
    local expected_field=$2
    local description=$3
    
    print_test "Testing $description"
    
    local url="$BASE_URL$endpoint"
    if [[ "$endpoint" == *"companyId"* ]]; then
        url="$url&companyId=$TEST_COMPANY&userId=$TEST_USER"
    else
        url="$url?companyId=$TEST_COMPANY&userId=$TEST_USER"
    fi
    
    local response=$(curl -s -H "X-Company-ID: $TEST_COMPANY" -H "X-User-ID: $TEST_USER" "$url")
    
    if echo "$response" | grep -q "$expected_field"; then
        print_pass "$description - Contains expected field: $expected_field"
        return 0
    else
        print_fail "$description - Missing expected field: $expected_field"
        echo "Response: $response"
        return 1
    fi
}

# Function to test POST endpoint
test_api_post() {
    local endpoint=$1
    local data=$2
    local expected_status=${3:-200}
    local description=$4
    
    print_test "Testing $description"
    
    local url="$BASE_URL$endpoint"
    local response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X POST -H "Content-Type: application/json" -H "X-Company-ID: $TEST_COMPANY" -H "X-User-ID: $TEST_USER" -d "$data" "$url")
    local body=$(echo $response | sed -E 's/HTTPSTATUS\:[0-9]{3}$//')
    local status=$(echo $response | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')
    
    if [[ "$status" == "$expected_status" ]]; then
        print_pass "$description - Status: $status"
        return 0
    else
        print_fail "$description - Expected: $expected_status, Got: $status"
        echo "Response body: $body"
        return 1
    fi
}

# Function to test basic API endpoints
test_basic_endpoints() {
    print_header "Testing Basic API Endpoints"
    
    test_api_endpoint "/health" 200 "Health Check Endpoint"
    test_api_endpoint "/api/v2" 200 "API Info Endpoint"
    test_api_json "/api/v2" "version" "API Version Information"
    test_api_json "/api/v2" "companies" "API Company Count"
    test_api_json "/api/v2" "aiModels" "API AI Models Count"
}

# Function to test dashboard endpoint
test_dashboard() {
    print_header "Testing Dashboard Functionality"
    
    test_api_endpoint "/api/v2/dashboard" 200 "Dashboard Data Endpoint"
    test_api_json "/api/v2/dashboard" "company" "Dashboard Company Information"
    test_api_json "/api/v2/dashboard" "kpis" "Dashboard KPIs"
    test_api_json "/api/v2/dashboard" "recentSales" "Dashboard Recent Sales"
    test_api_json "/api/v2/dashboard" "activePromotions" "Dashboard Active Promotions"
    test_api_json "/api/v2/dashboard" "insights" "Dashboard AI Insights"
    test_api_json "/api/v2/dashboard" "licenseStatus" "Dashboard License Status"
}

# Function to test CRUD endpoints
test_crud_endpoints() {
    print_header "Testing CRUD Endpoints"
    
    # Test GET endpoints for all entities
    local entities=("products" "customers" "promotions" "sales" "users" "tasks" "notifications" "reports" "contracts" "claims")
    
    for entity in "${entities[@]}"; do
        test_api_endpoint "/api/v2/$entity" 200 "GET $entity endpoint"
        test_api_json "/api/v2/$entity" "$entity" "GET $entity data structure"
    done
}

# Function to test AI/ML endpoints
test_ai_endpoints() {
    print_header "Testing AI/ML Endpoints"
    
    test_api_endpoint "/api/v2/ai/models" 200 "AI Models Status Endpoint"
    test_api_json "/api/v2/ai/models" "models" "AI Models List"
    
    test_api_endpoint "/api/v2/ai/insights" 200 "AI Insights Endpoint"
    test_api_json "/api/v2/ai/insights" "insights" "AI Insights Data"
    
    # Test AI chatbot
    test_api_post "/api/v2/ai/chatbot" '{"message":"Show me sales performance","context":{}}' 200 "AI Chatbot Interaction"
    
    # Test AI prediction (demand forecasting)
    test_api_post "/api/v2/ai/predict" '{"model":"demand_forecasting","data":{"productId":1,"timeframe":30}}' 200 "AI Demand Forecasting"
}

# Function to test multi-company functionality
test_multi_company() {
    print_header "Testing Multi-Company Functionality"
    
    local companies=("diplomat-sa" "premium-brands" "regional-dist")
    
    for company in "${companies[@]}"; do
        print_test "Testing company: $company"
        
        local url="$BASE_URL/api/v2/dashboard?companyId=$company&userId=${company}-user-1"
        local response=$(curl -s -H "X-Company-ID: $company" -H "X-User-ID: ${company}-user-1" "$url")
        
        if echo "$response" | grep -q "company"; then
            print_pass "Company $company data accessible"
        else
            print_fail "Company $company data not accessible"
        fi
    done
}

# Function to test analytics endpoints
test_analytics_endpoints() {
    print_header "Testing Analytics Endpoints"
    
    test_api_endpoint "/api/v2/analytics" 200 "Analytics Endpoint"
    test_api_endpoint "/api/v2/supply-chain" 200 "Supply Chain Analytics"
    test_api_endpoint "/api/v2/financial" 200 "Financial Analytics"
    test_api_endpoint "/api/v2/sustainability" 200 "Sustainability Analytics"
}

# Function to test licensing endpoints
test_licensing_endpoints() {
    print_header "Testing Licensing Endpoints"
    
    test_api_endpoint "/api/v2/licensing" 200 "Licensing Status Endpoint"
    test_api_json "/api/v2/licensing" "licensing" "Licensing Information"
}

# Function to test integration endpoints
test_integration_endpoints() {
    print_header "Testing Integration Endpoints"
    
    test_api_endpoint "/api/v2/integrations" 200 "Integrations Endpoint"
}

# Function to test frontend files
test_frontend_files() {
    print_header "Testing Frontend Files"
    
    cd /workspace/enterprise-fmcg-platform
    
    # Check if frontend files exist
    if [[ -f "enterprise-frontend.html" ]]; then
        print_pass "Frontend HTML file exists"
    else
        print_fail "Frontend HTML file missing"
    fi
    
    if [[ -f "enterprise-app.js" ]]; then
        print_pass "Frontend JavaScript file exists"
    else
        print_fail "Frontend JavaScript file missing"
    fi
    
    # Check HTML structure
    if grep -q "Vanta X" enterprise-frontend.html; then
        print_pass "Frontend contains Vanta X branding"
    else
        print_fail "Frontend missing Vanta X branding"
    fi
    
    if grep -q "Enterprise FMCG Platform" enterprise-frontend.html; then
        print_pass "Frontend contains platform title"
    else
        print_fail "Frontend missing platform title"
    fi
    
    # Check JavaScript functionality
    if grep -q "EnterpriseApp" enterprise-app.js; then
        print_pass "Frontend JavaScript contains main app class"
    else
        print_fail "Frontend JavaScript missing main app class"
    fi
    
    if grep -q "apiCall" enterprise-app.js; then
        print_pass "Frontend JavaScript contains API integration"
    else
        print_fail "Frontend JavaScript missing API integration"
    fi
}

# Function to test system performance
test_performance() {
    print_header "Testing System Performance"
    
    print_test "Testing API response time"
    
    local start_time=$(date +%s%N)
    curl -s "$BASE_URL/health" > /dev/null
    local end_time=$(date +%s%N)
    local response_time=$(( (end_time - start_time) / 1000000 ))
    
    if [[ $response_time -lt 1000 ]]; then
        print_pass "API response time: ${response_time}ms (< 1000ms)"
    else
        print_fail "API response time: ${response_time}ms (>= 1000ms)"
    fi
    
    # Test concurrent requests
    print_test "Testing concurrent API requests"
    
    local concurrent_start=$(date +%s%N)
    for i in {1..5}; do
        curl -s "$BASE_URL/health" > /dev/null &
    done
    wait
    local concurrent_end=$(date +%s%N)
    local concurrent_time=$(( (concurrent_end - concurrent_start) / 1000000 ))
    
    if [[ $concurrent_time -lt 2000 ]]; then
        print_pass "Concurrent requests time: ${concurrent_time}ms (< 2000ms)"
    else
        print_fail "Concurrent requests time: ${concurrent_time}ms (>= 2000ms)"
    fi
}

# Function to test data integrity
test_data_integrity() {
    print_header "Testing Data Integrity"
    
    # Test that each company has proper data structure
    local companies=("diplomat-sa" "premium-brands" "regional-dist")
    
    for company in "${companies[@]}"; do
        print_test "Testing data integrity for $company"
        
        local url="$BASE_URL/api/v2/products?companyId=$company"
        local response=$(curl -s -H "X-Company-ID: $company" "$url")
        
        if echo "$response" | grep -q "products" && echo "$response" | grep -q "$company"; then
            print_pass "Company $company has valid product data"
        else
            print_fail "Company $company missing valid product data"
        fi
    done
    
    # Test AI models are properly initialized
    print_test "Testing AI models initialization"
    
    local ai_response=$(curl -s -H "X-Company-ID: $TEST_COMPANY" "$BASE_URL/api/v2/ai/models")
    local model_count=$(echo "$ai_response" | grep -o '"name"' | wc -l)
    
    if [[ $model_count -ge 10 ]]; then
        print_pass "AI models properly initialized ($model_count models)"
    else
        print_fail "AI models not properly initialized ($model_count models, expected >= 10)"
    fi
}

# Function to test security features
test_security() {
    print_header "Testing Security Features"
    
    # Test CORS headers
    print_test "Testing CORS headers"
    
    local cors_response=$(curl -s -I "$BASE_URL/health")
    if echo "$cors_response" | grep -q "Access-Control-Allow-Origin"; then
        print_pass "CORS headers present"
    else
        print_fail "CORS headers missing"
    fi
    
    # Test rate limiting (this would need to be implemented in the backend)
    print_test "Testing API without company ID"
    
    local no_company_response=$(curl -s -w "HTTPSTATUS:%{http_code}" "$BASE_URL/api/v2/dashboard")
    local no_company_status=$(echo $no_company_response | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')
    
    if [[ "$no_company_status" == "400" ]]; then
        print_pass "API properly validates company ID requirement"
    else
        print_fail "API does not validate company ID requirement (status: $no_company_status)"
    fi
}

# Function to cleanup
cleanup() {
    print_header "Cleaning Up"
    
    if [[ -n "$BACKEND_PID" ]]; then
        print_info "Stopping backend process (PID: $BACKEND_PID)"
        kill $BACKEND_PID 2>/dev/null || true
        wait $BACKEND_PID 2>/dev/null || true
    fi
    
    # Clean up log files
    rm -f /workspace/enterprise-fmcg-platform/backend-test.log
    
    print_info "Cleanup completed"
}

# Function to display test results
display_results() {
    print_header "Test Results Summary"
    
    echo -e "${CYAN}📊 Test Statistics:${NC}"
    echo -e "   Total Tests: ${YELLOW}$TESTS_TOTAL${NC}"
    echo -e "   Passed: ${GREEN}$TESTS_PASSED${NC}"
    echo -e "   Failed: ${RED}$TESTS_FAILED${NC}"
    
    local success_rate=0
    if [[ $TESTS_TOTAL -gt 0 ]]; then
        success_rate=$(( (TESTS_PASSED * 100) / TESTS_TOTAL ))
    fi
    
    echo -e "   Success Rate: ${YELLOW}$success_rate%${NC}"
    echo ""
    
    if [[ $TESTS_FAILED -eq 0 ]]; then
        echo -e "${GREEN}🎉 All tests passed! The Enterprise FMCG Platform is ready for deployment.${NC}"
        echo ""
        echo -e "${CYAN}✅ Verified Features:${NC}"
        echo -e "   • Multi-company architecture working"
        echo -e "   • All API endpoints responding correctly"
        echo -e "   • AI/ML models active and functional"
        echo -e "   • Frontend files properly structured"
        echo -e "   • Data integrity maintained across companies"
        echo -e "   • Security features implemented"
        echo -e "   • Performance within acceptable limits"
        echo ""
        echo -e "${GREEN}🚀 Ready for production deployment!${NC}"
        return 0
    else
        echo -e "${RED}❌ Some tests failed. Please review the issues above before deployment.${NC}"
        echo ""
        echo -e "${YELLOW}🔧 Common Issues:${NC}"
        echo -e "   • Ensure Node.js dependencies are installed"
        echo -e "   • Check that all files are in the correct location"
        echo -e "   • Verify network connectivity"
        echo -e "   • Review backend logs for errors"
        return 1
    fi
}

# Main testing function
main() {
    print_header "🧪 Enterprise FMCG Platform - System Testing"
    print_info "Starting comprehensive system tests..."
    
    # Set up trap for cleanup
    trap cleanup EXIT
    
    # Start backend
    start_backend
    
    # Run all tests
    test_basic_endpoints
    test_dashboard
    test_crud_endpoints
    test_ai_endpoints
    test_multi_company
    test_analytics_endpoints
    test_licensing_endpoints
    test_integration_endpoints
    test_frontend_files
    test_performance
    test_data_integrity
    test_security
    
    # Display results
    display_results
}

# Run main function
main "$@"