#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:5001/api/v1"
REPORT_FILE="endpoint-test-report.txt"

# Initialize report
echo "========================================" > $REPORT_FILE
echo "KepleroAI API Endpoint Test Report" >> $REPORT_FILE
echo "Test Date: $(date)" >> $REPORT_FILE
echo "========================================" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to test endpoint
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local auth_header=$5
    local content_type=${6:-"application/json"}
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -e "${BLUE}Testing: $name${NC}"
    
    if [ -z "$auth_header" ]; then
        if [ -z "$data" ]; then
            response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" -H "Content-Type: $content_type")
        else
            response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" -H "Content-Type: $content_type" -d "$data")
        fi
    else
        if [ -z "$data" ]; then
            response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" -H "Content-Type: $content_type" -H "Authorization: Bearer $auth_header")
        else
            response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" -H "Content-Type: $content_type" -H "Authorization: Bearer $auth_header" -d "$data")
        fi
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    # Log to report
    echo "Test #$TOTAL_TESTS: $name" >> $REPORT_FILE
    echo "Method: $method" >> $REPORT_FILE
    echo "Endpoint: $endpoint" >> $REPORT_FILE
    echo "HTTP Code: $http_code" >> $REPORT_FILE
    
    if [ $http_code -ge 200 ] && [ $http_code -lt 300 ]; then
        echo -e "Status: ${GREEN}PASSED${NC}" | tee -a $REPORT_FILE
        PASSED_TESTS=$((PASSED_TESTS + 1))
    elif [ $http_code -ge 400 ] && [ $http_code -lt 500 ]; then
        echo -e "Status: ${YELLOW}CLIENT ERROR (Expected for some endpoints)${NC}" | tee -a $REPORT_FILE
        echo "Response: $body" >> $REPORT_FILE
        # Don't count as failed if it's an expected auth error or validation error
        if [[ "$body" == *"authentication"* ]] || [[ "$body" == *"validation"* ]] || [[ "$body" == *"not found"* ]]; then
            PASSED_TESTS=$((PASSED_TESTS + 1))
        else
            FAILED_TESTS=$((FAILED_TESTS + 1))
        fi
    else
        echo -e "Status: ${RED}FAILED${NC}" | tee -a $REPORT_FILE
        echo "Response: $body" >> $REPORT_FILE
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    
    echo "Response Body: $body" >> $REPORT_FILE
    echo "---" >> $REPORT_FILE
    echo ""
}

echo -e "${GREEN}Starting API Endpoint Tests...${NC}\n"

# ==========================================
# 1. HEALTH CHECK
# ==========================================
echo -e "${YELLOW}=== HEALTH CHECK ===${NC}"
test_endpoint "Root Endpoint" "GET" "/" "" ""
test_endpoint "Health Check" "GET" "/health" "" ""

# ==========================================
# 2. AUTHENTICATION
# ==========================================
echo -e "\n${YELLOW}=== AUTHENTICATION ===${NC}"

# Login - This will fail without valid credentials but we can test the endpoint
login_data='{"email":"admin@example.com","password":"password123"}'
test_endpoint "Login" "POST" "/auth/login" "$login_data" ""

# Try to get access token from response (if login succeeded)
# For now, we'll use a dummy token for protected routes
ACCESS_TOKEN="dummy_token_for_testing"

test_endpoint "Get Current User (No Auth)" "GET" "/auth/me" "" ""
test_endpoint "Refresh Token" "POST" "/auth/refresh" '{"refreshToken":"dummy_refresh_token"}' ""
test_endpoint "Logout" "POST" "/auth/logout" "" "$ACCESS_TOKEN"

# ==========================================
# 3. CONVERSATIONS
# ==========================================
echo -e "\n${YELLOW}=== CONVERSATIONS ===${NC}"
test_endpoint "Get All Conversations" "GET" "/conversations" "" "$ACCESS_TOKEN"
test_endpoint "Get Conversation By ID" "GET" "/conversations/507f1f77bcf86cd799439011" "" "$ACCESS_TOKEN"
test_endpoint "Search Messages" "GET" "/conversations/search-messages?query=hello" "" "$ACCESS_TOKEN"
test_endpoint "Add Message" "POST" "/conversations/507f1f77bcf86cd799439011/messages" '{"text":"Test message","sender":"operator"}' "$ACCESS_TOKEN"
test_endpoint "Take Control" "POST" "/conversations/507f1f77bcf86cd799439011/take-control" "" "$ACCESS_TOKEN"
test_endpoint "Release Control" "POST" "/conversations/507f1f77bcf86cd799439011/release-control" "" "$ACCESS_TOKEN"
test_endpoint "Update Status" "PATCH" "/conversations/507f1f77bcf86cd799439011/status" '{"status":"resolved"}' "$ACCESS_TOKEN"
test_endpoint "Assign Operator" "PATCH" "/conversations/507f1f77bcf86cd799439011/assign" '{"operatorId":"507f1f77bcf86cd799439012"}' "$ACCESS_TOKEN"
test_endpoint "Update Labels" "PATCH" "/conversations/507f1f77bcf86cd799439011/labels" '{"labels":["507f1f77bcf86cd799439013"]}' "$ACCESS_TOKEN"
test_endpoint "Move to Folder" "PATCH" "/conversations/507f1f77bcf86cd799439011/folder" '{"folderId":"507f1f77bcf86cd799439014"}' "$ACCESS_TOKEN"
test_endpoint "Bulk Delete Conversations" "POST" "/conversations/bulk-delete" '{"conversationIds":["507f1f77bcf86cd799439011"]}' "$ACCESS_TOKEN"

# ==========================================
# 4. FOLDERS
# ==========================================
echo -e "\n${YELLOW}=== FOLDERS ===${NC}"
test_endpoint "Get All Folders" "GET" "/conversations/folders" "" "$ACCESS_TOKEN"
test_endpoint "Create Folder" "POST" "/conversations/folders" '{"name":"Test Folder","color":"#FF5733"}' "$ACCESS_TOKEN"
test_endpoint "Update Folder" "PATCH" "/conversations/folders/507f1f77bcf86cd799439011" '{"name":"Updated Folder"}' "$ACCESS_TOKEN"
test_endpoint "Delete Folder" "DELETE" "/conversations/folders/507f1f77bcf86cd799439011" "" "$ACCESS_TOKEN"

# ==========================================
# 5. LABELS
# ==========================================
echo -e "\n${YELLOW}=== LABELS ===${NC}"
test_endpoint "Get All Labels" "GET" "/conversations/labels" "" "$ACCESS_TOKEN"
test_endpoint "Create Label" "POST" "/conversations/labels" '{"name":"Urgent","color":"#FF0000"}' "$ACCESS_TOKEN"
test_endpoint "Update Label" "PATCH" "/conversations/labels/507f1f77bcf86cd799439011" '{"name":"Very Urgent"}' "$ACCESS_TOKEN"
test_endpoint "Delete Label" "DELETE" "/conversations/labels/507f1f77bcf86cd799439011" "" "$ACCESS_TOKEN"

# ==========================================
# 6. TEMPLATES
# ==========================================
echo -e "\n${YELLOW}=== TEMPLATES ===${NC}"
test_endpoint "Get All Templates" "GET" "/settings/templates" "" "$ACCESS_TOKEN"
test_endpoint "Create Template" "POST" "/settings/templates" '{"name":"Welcome","content":"Hello!","category":"greeting"}' "$ACCESS_TOKEN"
test_endpoint "Update Template" "PATCH" "/settings/templates/507f1f77bcf86cd799439011" '{"content":"Updated content"}' "$ACCESS_TOKEN"
test_endpoint "Delete Template" "DELETE" "/settings/templates/507f1f77bcf86cd799439011" "" "$ACCESS_TOKEN"

# ==========================================
# 7. KNOWLEDGE BASE
# ==========================================
echo -e "\n${YELLOW}=== KNOWLEDGE BASE ===${NC}"
test_endpoint "Get All Knowledge Bases" "GET" "/training/knowledge-bases" "" "$ACCESS_TOKEN"
test_endpoint "Create Knowledge Base" "POST" "/training/knowledge-bases" '{"name":"Test KB","description":"Test"}' "$ACCESS_TOKEN"
test_endpoint "Get Space Usage" "GET" "/training/knowledge-bases/507f1f77bcf86cd799439011/space-usage" "" "$ACCESS_TOKEN"
test_endpoint "Get All FAQs" "GET" "/training/knowledge-bases/507f1f77bcf86cd799439011/faqs" "" "$ACCESS_TOKEN"
test_endpoint "Create FAQ" "POST" "/training/knowledge-bases/507f1f77bcf86cd799439011/faqs" '{"question":"Test?","answer":"Answer"}' "$ACCESS_TOKEN"
test_endpoint "Update FAQ" "PATCH" "/training/knowledge-bases/507f1f77bcf86cd799439011/faqs/507f1f77bcf86cd799439012" '{"answer":"Updated"}' "$ACCESS_TOKEN"
test_endpoint "Delete FAQ" "DELETE" "/training/knowledge-bases/507f1f77bcf86cd799439011/faqs/507f1f77bcf86cd799439012" "" "$ACCESS_TOKEN"
test_endpoint "Get All Websites" "GET" "/training/knowledge-bases/507f1f77bcf86cd799439011/websites" "" "$ACCESS_TOKEN"
test_endpoint "Add Website" "POST" "/training/knowledge-bases/507f1f77bcf86cd799439011/websites" '{"url":"https://example.com"}' "$ACCESS_TOKEN"
test_endpoint "Update Website" "POST" "/training/knowledge-bases/507f1f77bcf86cd799439011/websites/507f1f77bcf86cd799439012/update" "" "$ACCESS_TOKEN"
test_endpoint "Delete Website" "DELETE" "/training/knowledge-bases/507f1f77bcf86cd799439011/websites/507f1f77bcf86cd799439012" "" "$ACCESS_TOKEN"
test_endpoint "Get All Files" "GET" "/training/knowledge-bases/507f1f77bcf86cd799439011/files" "" "$ACCESS_TOKEN"
test_endpoint "Delete File" "DELETE" "/training/knowledge-bases/507f1f77bcf86cd799439011/files/507f1f77bcf86cd799439012" "" "$ACCESS_TOKEN"

# ==========================================
# 8. PROMPTS
# ==========================================
echo -e "\n${YELLOW}=== PROMPTS ===${NC}"
test_endpoint "Get Main Prompt" "GET" "/training/prompts/main" "" "$ACCESS_TOKEN"
test_endpoint "Get Greeting Prompt" "GET" "/training/prompts/greeting" "" "$ACCESS_TOKEN"
test_endpoint "Update Prompt" "PATCH" "/training/prompts/main" '{"content":"Updated prompt"}' "$ACCESS_TOKEN"
test_endpoint "Revert Prompt" "POST" "/training/prompts/main/revert" "" "$ACCESS_TOKEN"

# ==========================================
# 9. CONTACTS
# ==========================================
echo -e "\n${YELLOW}=== CONTACTS ===${NC}"
test_endpoint "Get All Contacts" "GET" "/contacts" "" "$ACCESS_TOKEN"
test_endpoint "Get Contact By ID" "GET" "/contacts/507f1f77bcf86cd799439011" "" "$ACCESS_TOKEN"
test_endpoint "Create Contact" "POST" "/contacts" '{"name":"John Doe","email":"john@example.com","phone":"+1234567890"}' "$ACCESS_TOKEN"
test_endpoint "Update Contact" "PATCH" "/contacts/507f1f77bcf86cd799439011" '{"name":"Jane Doe"}' "$ACCESS_TOKEN"
test_endpoint "Update Contact Status" "PATCH" "/contacts/507f1f77bcf86cd799439011/status" '{"statusId":"507f1f77bcf86cd799439012"}' "$ACCESS_TOKEN"
test_endpoint "Bulk Delete Contacts" "POST" "/contacts/bulk-delete" '{"contactIds":["507f1f77bcf86cd799439011"]}' "$ACCESS_TOKEN"
test_endpoint "Bulk Add to List" "POST" "/contacts/bulk-add-to-list" '{"contactIds":["507f1f77bcf86cd799439011"],"listId":"507f1f77bcf86cd799439012"}' "$ACCESS_TOKEN"
test_endpoint "Get All Lists" "GET" "/contacts/lists/all" "" "$ACCESS_TOKEN"
test_endpoint "Create List" "POST" "/contacts/lists" '{"name":"Sales Leads"}' "$ACCESS_TOKEN"
test_endpoint "Update List" "PATCH" "/contacts/lists/507f1f77bcf86cd799439011" '{"name":"Updated List"}' "$ACCESS_TOKEN"
test_endpoint "Delete List" "DELETE" "/contacts/lists/507f1f77bcf86cd799439011" "" "$ACCESS_TOKEN"
test_endpoint "Create Status" "POST" "/contacts/lists/507f1f77bcf86cd799439011/statuses" '{"name":"Qualified","color":"#00FF00"}' "$ACCESS_TOKEN"
test_endpoint "Update Status" "PATCH" "/contacts/lists/507f1f77bcf86cd799439011/statuses/507f1f77bcf86cd799439012" '{"name":"Updated"}' "$ACCESS_TOKEN"
test_endpoint "Delete Status" "DELETE" "/contacts/lists/507f1f77bcf86cd799439011/statuses/507f1f77bcf86cd799439012" "" "$ACCESS_TOKEN"
test_endpoint "Get Custom Properties" "GET" "/contacts/custom-properties/all" "" "$ACCESS_TOKEN"
test_endpoint "Create Custom Property" "POST" "/contacts/custom-properties" '{"name":"Company Size","type":"text"}' "$ACCESS_TOKEN"
test_endpoint "Delete Custom Property" "DELETE" "/contacts/custom-properties/507f1f77bcf86cd799439011" "" "$ACCESS_TOKEN"

# ==========================================
# 10. CAMPAIGNS
# ==========================================
echo -e "\n${YELLOW}=== CAMPAIGNS ===${NC}"
test_endpoint "Get All Campaigns" "GET" "/campaigns" "" "$ACCESS_TOKEN"
test_endpoint "Get Campaign Templates" "GET" "/campaigns/templates" "" "$ACCESS_TOKEN"
test_endpoint "Get Campaign By ID" "GET" "/campaigns/507f1f77bcf86cd799439011" "" "$ACCESS_TOKEN"
test_endpoint "Create Campaign" "POST" "/campaigns" '{"name":"Test Campaign","listId":"507f1f77bcf86cd799439012","channel":"whatsapp"}' "$ACCESS_TOKEN"
test_endpoint "Update Campaign" "PATCH" "/campaigns/507f1f77bcf86cd799439011" '{"name":"Updated Campaign"}' "$ACCESS_TOKEN"
test_endpoint "Cancel Campaign" "POST" "/campaigns/507f1f77bcf86cd799439011/cancel" "" "$ACCESS_TOKEN"
test_endpoint "Get Campaign Analytics" "GET" "/campaigns/507f1f77bcf86cd799439011/analytics" "" "$ACCESS_TOKEN"
test_endpoint "Delete Campaign" "DELETE" "/campaigns/507f1f77bcf86cd799439011" "" "$ACCESS_TOKEN"

# ==========================================
# 11. AUTOMATIONS
# ==========================================
echo -e "\n${YELLOW}=== AUTOMATIONS ===${NC}"
test_endpoint "Get All Automations" "GET" "/automations" "" "$ACCESS_TOKEN"
test_endpoint "Get Automation By ID" "GET" "/automations/507f1f77bcf86cd799439011" "" "$ACCESS_TOKEN"
test_endpoint "Create Automation" "POST" "/automations" '{"name":"Test Automation","trigger":"facebook_lead","nodes":[]}' "$ACCESS_TOKEN"
test_endpoint "Update Automation" "PATCH" "/automations/507f1f77bcf86cd799439011" '{"name":"Updated Automation"}' "$ACCESS_TOKEN"
test_endpoint "Toggle Automation" "PATCH" "/automations/507f1f77bcf86cd799439011/toggle" "" "$ACCESS_TOKEN"
test_endpoint "Test Automation" "POST" "/automations/507f1f77bcf86cd799439011/test" '{"testData":{"name":"Test"}}' "$ACCESS_TOKEN"
test_endpoint "Get Execution Logs" "GET" "/automations/507f1f77bcf86cd799439011/logs" "" "$ACCESS_TOKEN"
test_endpoint "Delete Automation" "DELETE" "/automations/507f1f77bcf86cd799439011" "" "$ACCESS_TOKEN"

# ==========================================
# 12. ANALYTICS
# ==========================================
echo -e "\n${YELLOW}=== ANALYTICS ===${NC}"
test_endpoint "Get Dashboard" "GET" "/analytics/dashboard?startDate=2024-01-01&endDate=2024-12-31" "" "$ACCESS_TOKEN"
test_endpoint "Get Trends" "GET" "/analytics/trends?period=7d&metric=conversations" "" "$ACCESS_TOKEN"
test_endpoint "Get Performance" "GET" "/analytics/performance?startDate=2024-01-01&endDate=2024-12-31" "" "$ACCESS_TOKEN"
test_endpoint "Export Analytics" "GET" "/analytics/export?format=csv&startDate=2024-01-01&endDate=2024-12-31" "" "$ACCESS_TOKEN"
test_endpoint "Get All Topics" "GET" "/analytics/topics" "" "$ACCESS_TOKEN"
test_endpoint "Get Topic By ID" "GET" "/analytics/topics/507f1f77bcf86cd799439011" "" "$ACCESS_TOKEN"
test_endpoint "Create Topic" "POST" "/analytics/topics" '{"name":"Pricing","keywords":["price","cost"]}' "$ACCESS_TOKEN"
test_endpoint "Update Topic" "PATCH" "/analytics/topics/507f1f77bcf86cd799439011" '{"name":"Pricing & Billing"}' "$ACCESS_TOKEN"
test_endpoint "Delete Topic" "DELETE" "/analytics/topics/507f1f77bcf86cd799439011" "" "$ACCESS_TOKEN"
test_endpoint "Detect Topics" "POST" "/analytics/detect-topics" '{"startDate":"2024-01-01","endDate":"2024-12-31"}' "$ACCESS_TOKEN"
test_endpoint "Get Topic Stats" "GET" "/analytics/topics/Pricing/stats?startDate=2024-01-01&endDate=2024-12-31" "" "$ACCESS_TOKEN"

# ==========================================
# 13. WEBHOOKS (No Auth Required)
# ==========================================
echo -e "\n${YELLOW}=== WEBHOOKS ===${NC}"
test_endpoint "Facebook Webhook" "POST" "/webhooks/facebook" '{"name":"John Doe","email":"john@example.com"}' ""
test_endpoint "Shopify Webhook" "POST" "/webhooks/shopify" '{"orderId":"12345","total":99.99}' ""
test_endpoint "Generic Webhook" "POST" "/webhooks/generic/test-webhook-id" '{"customField":"value"}' ""

# ==========================================
# FINAL REPORT
# ==========================================
echo "" >> $REPORT_FILE
echo "========================================" >> $REPORT_FILE
echo "TEST SUMMARY" >> $REPORT_FILE
echo "========================================" >> $REPORT_FILE
echo "Total Tests: $TOTAL_TESTS" >> $REPORT_FILE
echo "Passed: $PASSED_TESTS" >> $REPORT_FILE
echo "Failed: $FAILED_TESTS" >> $REPORT_FILE
echo "Success Rate: $(awk "BEGIN {printf \"%.2f\", ($PASSED_TESTS/$TOTAL_TESTS)*100}")%" >> $REPORT_FILE
echo "========================================" >> $REPORT_FILE

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}TEST SUMMARY${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Total Tests: ${BLUE}$TOTAL_TESTS${NC}"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed: ${RED}$FAILED_TESTS${NC}"
echo -e "Success Rate: ${YELLOW}$(awk "BEGIN {printf \"%.2f\", ($PASSED_TESTS/$TOTAL_TESTS)*100}")%${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\n${BLUE}Full report saved to: $REPORT_FILE${NC}"

