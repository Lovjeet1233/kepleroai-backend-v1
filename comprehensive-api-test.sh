#!/bin/bash

BASE_URL="http://localhost:5001/api/v1"
REPORT_FILE="comprehensive-test-report.md"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Initialize counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
SKIPPED_TESTS=0

# Start report
echo "# KepleroAI API Comprehensive Test Report" > $REPORT_FILE
echo "" >> $REPORT_FILE
echo "**Test Date:** $(date)" >> $REPORT_FILE
echo "**Base URL:** $BASE_URL" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "---" >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  KepleroAI API Comprehensive Test Suite   ║${NC}"
echo -e "${GREEN}╔════════════════════════════════════════════╝${NC}"
echo ""

# Test function
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local auth_token=$5
    local expect_success=${6:-true}
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    printf "%-60s" "$name"
    
    # Make request
    if [ -n "$auth_token" ]; then
        if [ -n "$data" ]; then
            response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $auth_token" \
                -d "$data" 2>/dev/null)
        else
            response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
                -H "Authorization: Bearer $auth_token" 2>/dev/null)
        fi
    else
        if [ -n "$data" ]; then
            response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -d "$data" 2>/dev/null)
        else
            response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" 2>/dev/null)
        fi
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    # Determine status
    local status="FAILED"
    local color=$RED
    
    if [ $http_code -ge 200 ] && [ $http_code -lt 300 ]; then
        status="✓ PASSED"
        color=$GREEN
        PASSED_TESTS=$((PASSED_TESTS + 1))
    elif [ $http_code -eq 401 ] || [ $http_code -eq 404 ] && [ "$expect_success" = "false" ]; then
        status="⊘ EXPECTED"
        color=$YELLOW
        PASSED_TESTS=$((PASSED_TESTS + 1))
    elif [ $http_code -eq 401 ] && [[ "$body" == *"authentication"* ]]; then
        status="⊘ AUTH REQ"
        color=$YELLOW
        SKIPPED_TESTS=$((SKIPPED_TESTS + 1))
    else
        status="✗ FAILED"
        color=$RED
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    
    echo -e "${color}[$status]${NC} (HTTP $http_code)"
    
    # Write to report
    echo "### $name" >> $REPORT_FILE
    echo "" >> $REPORT_FILE
    echo "- **Method:** \`$method\`" >> $REPORT_FILE
    echo "- **Endpoint:** \`$endpoint\`" >> $REPORT_FILE
    echo "- **HTTP Code:** $http_code" >> $REPORT_FILE
    echo "- **Status:** $status" >> $REPORT_FILE
    
    if [ ${#body} -lt 500 ]; then
        echo "- **Response:**" >> $REPORT_FILE
        echo '```json' >> $REPORT_FILE
        echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body" >> $REPORT_FILE
        echo '```' >> $REPORT_FILE
    else
        echo "- **Response:** (truncated - too large)" >> $REPORT_FILE
    fi
    
    echo "" >> $REPORT_FILE
}

# ==========================================
# PHASE 1: HEALTH & AUTHENTICATION
# ==========================================
echo -e "\n${BLUE}━━━ PHASE 1: Health & Authentication ━━━${NC}\n"
echo "## Phase 1: Health & Authentication" >> $REPORT_FILE
echo "" >> $REPORT_FILE

test_endpoint "Health Check" "GET" "/health" "" "" true

# Login to get access token
echo -ne "Authenticating with admin credentials... "
login_response=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@test.com","password":"admin123"}')

ACCESS_TOKEN=$(echo "$login_response" | python3 -c "import sys, json; print(json.load(sys.stdin).get('data', {}).get('token', ''))" 2>/dev/null)

if [ -n "$ACCESS_TOKEN" ] && [ "$ACCESS_TOKEN" != "" ]; then
    echo -e "${GREEN}✓ SUCCESS${NC}"
    echo "" >> $REPORT_FILE
    echo "**Authentication Status:** ✓ Successfully authenticated" >> $REPORT_FILE
    echo "" >> $REPORT_FILE
else
    echo -e "${RED}✗ FAILED${NC}"
    echo "" >> $REPORT_FILE
    echo "**Authentication Status:** ✗ Failed to authenticate" >> $REPORT_FILE
    echo "" >> $REPORT_FILE
    echo -e "${RED}Cannot proceed without authentication. Exiting.${NC}"
    exit 1
fi

test_endpoint "Get Current User" "GET" "/auth/me" "" "$ACCESS_TOKEN" true
test_endpoint "Logout" "POST" "/auth/logout" "" "$ACCESS_TOKEN" true

# Re-authenticate after logout
login_response=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@test.com","password":"admin123"}')
ACCESS_TOKEN=$(echo "$login_response" | python3 -c "import sys, json; print(json.load(sys.stdin).get('data', {}).get('token', ''))" 2>/dev/null)

# ==========================================
# PHASE 2: CONVERSATIONS
# ==========================================
echo -e "\n${BLUE}━━━ PHASE 2: Conversations ━━━${NC}\n"
echo "## Phase 2: Conversations" >> $REPORT_FILE
echo "" >> $REPORT_FILE

test_endpoint "Get All Conversations" "GET" "/conversations" "" "$ACCESS_TOKEN" true
test_endpoint "Search Messages" "GET" "/conversations/search-messages?query=hello" "" "$ACCESS_TOKEN" true
test_endpoint "Get Conversation By ID (Non-existent)" "GET" "/conversations/507f1f77bcf86cd799439011" "" "$ACCESS_TOKEN" false

# ==========================================
# PHASE 3: FOLDERS & LABELS
# ==========================================
echo -e "\n${BLUE}━━━ PHASE 3: Folders & Labels ━━━${NC}\n"
echo "## Phase 3: Folders & Labels" >> $REPORT_FILE
echo "" >> $REPORT_FILE

test_endpoint "Get All Folders" "GET" "/conversations/folders" "" "$ACCESS_TOKEN" true
test_endpoint "Create Folder" "POST" "/conversations/folders" '{"name":"Test Folder","color":"#FF5733"}' "$ACCESS_TOKEN" true
test_endpoint "Get All Labels" "GET" "/conversations/labels" "" "$ACCESS_TOKEN" true
test_endpoint "Create Label" "POST" "/conversations/labels" '{"name":"Urgent","color":"#FF0000"}' "$ACCESS_TOKEN" true

# ==========================================
# PHASE 4: TEMPLATES
# ==========================================
echo -e "\n${BLUE}━━━ PHASE 4: Templates ━━━${NC}\n"
echo "## Phase 4: Templates" >> $REPORT_FILE
echo "" >> $REPORT_FILE

test_endpoint "Get All Templates" "GET" "/settings/templates" "" "$ACCESS_TOKEN" true
test_endpoint "Create Template" "POST" "/settings/templates" '{"name":"Welcome Message","content":"Hello, welcome!","category":"greeting"}' "$ACCESS_TOKEN" true

# ==========================================
# PHASE 5: KNOWLEDGE BASE
# ==========================================
echo -e "\n${BLUE}━━━ PHASE 5: Knowledge Base ━━━${NC}\n"
echo "## Phase 5: Knowledge Base" >> $REPORT_FILE
echo "" >> $REPORT_FILE

test_endpoint "Get All Knowledge Bases" "GET" "/training/knowledge-bases" "" "$ACCESS_TOKEN" true
test_endpoint "Create Knowledge Base" "POST" "/training/knowledge-bases" '{"name":"Product KB","description":"Product knowledge"}' "$ACCESS_TOKEN" true

# Get KB ID if available
KB_LIST=$(curl -s -X GET "$BASE_URL/training/knowledge-bases" -H "Authorization: Bearer $ACCESS_TOKEN")
KB_ID=$(echo "$KB_LIST" | python3 -c "import sys, json; data = json.load(sys.stdin).get('data', []); print(data[0]['_id'] if data else '')" 2>/dev/null)

if [ -n "$KB_ID" ]; then
    test_endpoint "Get Space Usage" "GET" "/training/knowledge-bases/$KB_ID/space-usage" "" "$ACCESS_TOKEN" true
    test_endpoint "Get All FAQs" "GET" "/training/knowledge-bases/$KB_ID/faqs" "" "$ACCESS_TOKEN" true
    test_endpoint "Create FAQ" "POST" "/training/knowledge-bases/$KB_ID/faqs" '{"question":"What are your hours?","answer":"9 AM - 5 PM"}' "$ACCESS_TOKEN" true
    test_endpoint "Get All Websites" "GET" "/training/knowledge-bases/$KB_ID/websites" "" "$ACCESS_TOKEN" true
    test_endpoint "Get All Files" "GET" "/training/knowledge-bases/$KB_ID/files" "" "$ACCESS_TOKEN" true
fi

# ==========================================
# PHASE 6: PROMPTS
# ==========================================
echo -e "\n${BLUE}━━━ PHASE 6: Prompts ━━━${NC}\n"
echo "## Phase 6: Prompts" >> $REPORT_FILE
echo "" >> $REPORT_FILE

test_endpoint "Get Main Prompt" "GET" "/training/prompts/main" "" "$ACCESS_TOKEN" true
test_endpoint "Get Greeting Prompt" "GET" "/training/prompts/greeting" "" "$ACCESS_TOKEN" true
test_endpoint "Update Main Prompt" "PATCH" "/training/prompts/main" '{"content":"You are a helpful AI assistant."}' "$ACCESS_TOKEN" true

# ==========================================
# PHASE 7: CONTACTS & LISTS
# ==========================================
echo -e "\n${BLUE}━━━ PHASE 7: Contacts & Lists ━━━${NC}\n"
echo "## Phase 7: Contacts & Lists" >> $REPORT_FILE
echo "" >> $REPORT_FILE

test_endpoint "Get All Lists" "GET" "/contacts/lists/all" "" "$ACCESS_TOKEN" true
test_endpoint "Create Contact List" "POST" "/contacts/lists" '{"name":"Sales Leads","description":"Potential customers"}' "$ACCESS_TOKEN" true

# Get List ID
LIST_DATA=$(curl -s -X GET "$BASE_URL/contacts/lists/all" -H "Authorization: Bearer $ACCESS_TOKEN")
LIST_ID=$(echo "$LIST_DATA" | python3 -c "import sys, json; data = json.load(sys.stdin).get('data', []); print(data[0]['_id'] if data else '')" 2>/dev/null)

test_endpoint "Get All Contacts" "GET" "/contacts" "" "$ACCESS_TOKEN" true
if [ -n "$LIST_ID" ]; then
    test_endpoint "Create Contact" "POST" "/contacts" "{\"name\":\"John Doe\",\"email\":\"john@example.com\",\"phone\":\"+1234567890\",\"listId\":\"$LIST_ID\"}" "$ACCESS_TOKEN" true
fi

test_endpoint "Get Custom Properties" "GET" "/contacts/custom-properties/all" "" "$ACCESS_TOKEN" true
test_endpoint "Create Custom Property" "POST" "/contacts/custom-properties" '{"name":"Company Size","type":"text"}' "$ACCESS_TOKEN" true

# ==========================================
# PHASE 8: CAMPAIGNS
# ==========================================
echo -e "\n${BLUE}━━━ PHASE 8: Campaigns ━━━${NC}\n"
echo "## Phase 8: Campaigns" >> $REPORT_FILE
echo "" >> $REPORT_FILE

test_endpoint "Get All Campaigns" "GET" "/campaigns" "" "$ACCESS_TOKEN" true
test_endpoint "Get Campaign Templates" "GET" "/campaigns/templates" "" "$ACCESS_TOKEN" true

if [ -n "$LIST_ID" ]; then
    test_endpoint "Create Campaign" "POST" "/campaigns" "{\"name\":\"Summer Sale\",\"listId\":\"$LIST_ID\",\"channel\":\"whatsapp\",\"template\":\"promotional\",\"scheduledFor\":\"2025-12-01T10:00:00Z\"}" "$ACCESS_TOKEN" true
fi

# ==========================================
# PHASE 9: AUTOMATIONS
# ==========================================
echo -e "\n${BLUE}━━━ PHASE 9: Automations ━━━${NC}\n"
echo "## Phase 9: Automations" >> $REPORT_FILE
echo "" >> $REPORT_FILE

test_endpoint "Get All Automations" "GET" "/automations" "" "$ACCESS_TOKEN" true
test_endpoint "Create Automation" "POST" "/automations" '{"name":"Lead Follow-up","trigger":"facebook_lead","nodes":[],"isActive":true}' "$ACCESS_TOKEN" true

# ==========================================
# PHASE 10: ANALYTICS
# ==========================================
echo -e "\n${BLUE}━━━ PHASE 10: Analytics ━━━${NC}\n"
echo "## Phase 10: Analytics" >> $REPORT_FILE
echo "" >> $REPORT_FILE

test_endpoint "Get Dashboard Analytics" "GET" "/analytics/dashboard?startDate=2024-01-01&endDate=2025-12-31" "" "$ACCESS_TOKEN" true
test_endpoint "Get Trends" "GET" "/analytics/trends?period=7d&metric=conversations" "" "$ACCESS_TOKEN" true
test_endpoint "Get Performance" "GET" "/analytics/performance?startDate=2024-01-01&endDate=2025-12-31" "" "$ACCESS_TOKEN" true
test_endpoint "Get All Topics" "GET" "/analytics/topics" "" "$ACCESS_TOKEN" true
test_endpoint "Create Topic" "POST" "/analytics/topics" '{"name":"Pricing","keywords":["price","cost","pricing"],"color":"#3B82F6"}' "$ACCESS_TOKEN" true

# ==========================================
# PHASE 11: WEBHOOKS (No Auth)
# ==========================================
echo -e "\n${BLUE}━━━ PHASE 11: Webhooks ━━━${NC}\n"
echo "## Phase 11: Webhooks" >> $REPORT_FILE
echo "" >> $REPORT_FILE

test_endpoint "Facebook Webhook" "POST" "/webhooks/facebook" '{"name":"Jane Smith","email":"jane@example.com","phone":"+1234567890"}' "" true
test_endpoint "Shopify Webhook" "POST" "/webhooks/shopify" '{"orderId":"ORD123","total":99.99}' "" true
test_endpoint "Generic Webhook" "POST" "/webhooks/generic/test-webhook-id" '{"customData":"test"}' "" true

# ==========================================
# FINAL SUMMARY
# ==========================================
echo "" >> $REPORT_FILE
echo "---" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "## Test Summary" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "| Metric | Count |" >> $REPORT_FILE
echo "|--------|-------|" >> $REPORT_FILE
echo "| **Total Tests** | $TOTAL_TESTS |" >> $REPORT_FILE
echo "| **Passed** | $PASSED_TESTS |" >> $REPORT_FILE
echo "| **Failed** | $FAILED_TESTS |" >> $REPORT_FILE
echo "| **Skipped** | $SKIPPED_TESTS |" >> $REPORT_FILE

SUCCESS_RATE=$(awk "BEGIN {printf \"%.2f\", ($PASSED_TESTS/$TOTAL_TESTS)*100}")
echo "| **Success Rate** | ${SUCCESS_RATE}% |" >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo -e "\n${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          Test Summary                      ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo -e "Total Tests:    ${BLUE}$TOTAL_TESTS${NC}"
echo -e "Passed:         ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed:         ${RED}$FAILED_TESTS${NC}"
echo -e "Skipped:        ${YELLOW}$SKIPPED_TESTS${NC}"
echo -e "Success Rate:   ${YELLOW}${SUCCESS_RATE}%${NC}"
echo ""
echo -e "${BLUE}Full report saved to: $REPORT_FILE${NC}\n"

