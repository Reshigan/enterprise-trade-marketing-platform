#!/bin/bash

# Vanta X Enterprise System Test Suite
# Comprehensive testing for Level 3 functionality

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
API_URL="http://localhost:4000/api"
FRONTEND_URL="http://localhost"
TEST_EMAIL="john.smith@diplomat.co.za"
TEST_PASSWORD="Demo123!"

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Test results array
declare -a TEST_RESULTS

# Functions
print_header() {
    echo -e "${BLUE}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║        Vanta X Enterprise System Test Suite                ║"
    echo "║                 Level 3 Functionality                      ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    echo "  API Base URL: $API_URL"
    echo "  Frontend URL: $FRONTEND_URL"
    echo "  Test Start Time: $(date)"
    echo ""
}

run_test() {
    local test_name=$1
    local test_command=$2
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -e "${YELLOW}[TEST] Running: $test_name${NC}"
    
    if eval "$test_command"; then
        PASSED_TESTS=$((PASSED_TESTS + 1))
        echo -e "${GREEN}[PASS] $test_name${NC}"
        TEST_RESULTS+=("PASS: $test_name")
    else
        FAILED_TESTS=$((FAILED_TESTS + 1))
        echo -e "${RED}[FAIL] $test_name${NC}"
        TEST_RESULTS+=("FAIL: $test_name")
    fi
    echo ""
}

# Wait for services
echo -e "${BLUE}[TEST] Waiting for services to be ready...${NC}"
sleep 5

print_header

# Test Categories
echo -e "${BLUE}============================================================${NC}"
echo -e "${BLUE}Backend API Tests${NC}"
echo -e "${BLUE}============================================================${NC}"
echo ""

# 1. Health Check
run_test "Health Check Endpoint" "curl -s $API_URL/health | grep -q '\"success\":true'"

# 2. Authentication Tests
run_test "Login with Valid Credentials" "
    response=\$(curl -s -X POST $API_URL/auth/login \
        -H 'Content-Type: application/json' \
        -d '{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}')
    echo \$response | grep -q '\"success\":true' && echo \$response | grep -q 'token'
"

# Get auth token for subsequent tests
AUTH_TOKEN=$(curl -s -X POST $API_URL/auth/login \
    -H 'Content-Type: application/json' \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}" | \
    grep -o '"token":"[^"]*' | cut -d'"' -f4)

run_test "Microsoft 365 SSO Endpoint" "
    curl -s -X POST $API_URL/auth/sso/microsoft \
        -H 'Content-Type: application/json' \
        -d '{\"token\":\"mock-token\",\"email\":\"$TEST_EMAIL\"}' | \
    grep -q '\"success\":true'
"

# 3. Company Data Tests
run_test "Get Company Information" "
    curl -s $API_URL/companies/diplomat-sa \
        -H \"Authorization: Bearer $AUTH_TOKEN\" | \
    grep -q 'Diplomat South Africa'
"

# 4. Dashboard Tests
run_test "Dashboard Data Loading" "
    curl -s $API_URL/dashboard/diplomat-sa \
        -H \"Authorization: Bearer $AUTH_TOKEN\" | \
    grep -q 'totalRevenue'
"

# 5. Master Data Tests
run_test "Products API" "
    curl -s $API_URL/products \
        -H \"Authorization: Bearer $AUTH_TOKEN\" | \
    grep -q 'PROD001'
"

run_test "Customers API" "
    curl -s $API_URL/customers \
        -H \"Authorization: Bearer $AUTH_TOKEN\" | \
    grep -q 'Pick n Pay'
"

# 6. Sales Data Tests
run_test "Sales Data Query" "
    curl -s \"$API_URL/sales?startDate=2025-01-01&endDate=2025-08-31\" \
        -H \"Authorization: Bearer $AUTH_TOKEN\" | \
    grep -q 'SALE'
"

# 7. Promotions Tests
run_test "Promotions List" "
    curl -s $API_URL/promotions \
        -H \"Authorization: Bearer $AUTH_TOKEN\" | \
    grep -q 'Summer Beverage Special'
"

run_test "Create New Promotion" "
    curl -s -X POST $API_URL/promotions \
        -H \"Authorization: Bearer $AUTH_TOKEN\" \
        -H 'Content-Type: application/json' \
        -d '{
            \"name\":\"Test Promotion\",
            \"type\":\"Volume Discount\",
            \"startDate\":\"2025-09-01\",
            \"endDate\":\"2025-09-30\",
            \"budget\":100000
        }' | \
    grep -q '\"success\":true'
"

# 8. Budget Tests
run_test "Budget Information" "
    curl -s $API_URL/budgets \
        -H \"Authorization: Bearer $AUTH_TOKEN\" | \
    grep -q 'Trade Spend'
"

# 9. KPI Tests
run_test "KPI Metrics" "
    curl -s $API_URL/kpis \
        -H \"Authorization: Bearer $AUTH_TOKEN\" | \
    grep -q 'Trade Spend ROI'
"

# 10. AI/ML Tests
echo ""
echo -e "${BLUE}============================================================${NC}"
echo -e "${BLUE}AI/ML Model Tests${NC}"
echo -e "${BLUE}============================================================${NC}"
echo ""

run_test "AI Models List" "
    curl -s $API_URL/ai/models \
        -H \"Authorization: Bearer $AUTH_TOKEN\" | \
    grep -q 'Demand Forecasting Model'
"

run_test "Run AI Prediction" "
    curl -s -X POST $API_URL/ai/predict \
        -H \"Authorization: Bearer $AUTH_TOKEN\" \
        -H 'Content-Type: application/json' \
        -d '{\"modelId\":\"MODEL001\"}' | \
    grep -q 'predictions'
"

run_test "AI Chatbot" "
    curl -s -X POST $API_URL/ai/chat \
        -H \"Authorization: Bearer $AUTH_TOKEN\" \
        -H 'Content-Type: application/json' \
        -d '{\"message\":\"What are my total sales?\"}' | \
    grep -q 'response'
"

# 11. Analytics Tests
echo ""
echo -e "${BLUE}============================================================${NC}"
echo -e "${BLUE}Analytics Tests${NC}"
echo -e "${BLUE}============================================================${NC}"
echo ""

run_test "Sales Trend Analytics" "
    curl -s $API_URL/analytics/sales-trend \
        -H \"Authorization: Bearer $AUTH_TOKEN\" | \
    grep -q 'revenue'
"

run_test "Category Performance Analytics" "
    curl -s $API_URL/analytics/category-performance \
        -H \"Authorization: Bearer $AUTH_TOKEN\" | \
    grep -q 'Beverages'
"

# 12. Import/Export Tests
echo ""
echo -e "${BLUE}============================================================${NC}"
echo -e "${BLUE}Integration Tests${NC}"
echo -e "${BLUE}============================================================${NC}"
echo ""

run_test "Template Download" "
    curl -s -I $API_URL/templates/download/TMPL003 | \
    grep -q '200 OK'
"

# 13. Frontend Tests
echo ""
echo -e "${BLUE}============================================================${NC}"
echo -e "${BLUE}Frontend Tests${NC}"
echo -e "${BLUE}============================================================${NC}"
echo ""

run_test "Frontend HTML Loading" "
    curl -s $FRONTEND_URL | grep -q 'Vanta X-Trade Spend'
"

run_test "Frontend JavaScript Loading" "
    curl -s $FRONTEND_URL/vantax-enterprise-app.js | grep -q 'Vanta X-Trade Spend Enterprise Frontend'
"

run_test "PWA Manifest" "
    curl -s $FRONTEND_URL/manifest.json | grep -q 'Vanta X-Trade Spend'
"

# 14. Security Tests
echo ""
echo -e "${BLUE}============================================================${NC}"
echo -e "${BLUE}Security Tests${NC}"
echo -e "${BLUE}============================================================${NC}"
echo ""

run_test "Unauthorized Access Blocked" "
    response=\$(curl -s -w '%{http_code}' -o /dev/null $API_URL/products)
    [ \$response -eq 401 ]
"

run_test "Invalid Token Rejected" "
    response=\$(curl -s -w '%{http_code}' -o /dev/null \
        -H 'Authorization: Bearer invalid-token' \
        $API_URL/products)
    [ \$response -eq 403 ]
"

# 15. Performance Tests
echo ""
echo -e "${BLUE}============================================================${NC}"
echo -e "${BLUE}Performance Tests${NC}"
echo -e "${BLUE}============================================================${NC}"
echo ""

run_test "API Response Time < 500ms" "
    response_time=\$(curl -s -o /dev/null -w '%{time_total}' \
        -H \"Authorization: Bearer $AUTH_TOKEN\" \
        $API_URL/products)
    awk -v time=\$response_time 'BEGIN { exit (time < 0.5) ? 0 : 1 }'
"

run_test "Large Dataset Query" "
    curl -s \"$API_URL/sales?startDate=2024-09-01&endDate=2025-08-31\" \
        -H \"Authorization: Bearer $AUTH_TOKEN\" | \
    jq -e 'length > 1000' >/dev/null
"

# 16. Multi-Company Tests
echo ""
echo -e "${BLUE}============================================================${NC}"
echo -e "${BLUE}Multi-Company Isolation Tests${NC}"
echo -e "${BLUE}============================================================${NC}"
echo ""

run_test "Company Data Isolation" "
    # Verify only Diplomat SA data is returned
    curl -s $API_URL/products \
        -H \"Authorization: Bearer $AUTH_TOKEN\" | \
    jq -e '.data | all(.companyId == \"diplomat-sa\")' >/dev/null
"

# Test Summary
echo ""
echo -e "${BLUE}============================================================${NC}"
echo -e "${BLUE}Test Summary${NC}"
echo -e "${BLUE}============================================================${NC}"
echo ""

echo "Total Tests: $TOTAL_TESTS"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed: ${RED}$FAILED_TESTS${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed! The system is ready for deployment.${NC}"
    exit_code=0
else
    echo -e "${RED}❌ Some tests failed. Please review the results above.${NC}"
    exit_code=1
fi

echo ""
echo "Detailed Results:"
echo "================="
for result in "${TEST_RESULTS[@]}"; do
    if [[ $result == PASS* ]]; then
        echo -e "${GREEN}$result${NC}"
    else
        echo -e "${RED}$result${NC}"
    fi
done

echo ""
echo "Test completed at: $(date)"

exit $exit_code