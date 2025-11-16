#!/bin/bash

BASE_URL="http://localhost:5001/api/v1"
REPORT_FILE="fixed-endpoints-report.md"

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

# Start report
echo "# Fixed Endpoints Test Report" > $REPORT_FILE
echo "" >> $REPORT_FILE
echo "**Test Date:** $(date)" >> $REPORT_FILE
echo "**Base URL:** $BASE_URL" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "This report tests only the 8 endpoints that were previously failing." >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "---" >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     Testing Fixed Endpoints (8 total)     ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""

# Test function
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local auth_token=$5
    
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
    elif [ $http_code -eq 201 ]; then
        status="✓ PASSED (Created)"
        color=$GREEN
        PASSED_TESTS=$((PASSED_TESTS + 1))
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
    
    if [ ${#body} -lt 1000 ]; then
        echo "- **Response:**" >> $REPORT_FILE
        echo '```json' >> $REPORT_FILE
        echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body" >> $REPORT_FILE
        echo '```' >> $REPORT_FILE
    else
        echo "- **Response:** (truncated - too large)" >> $REPORT_FILE
    fi
    
    echo "" >> $REPORT_FILE
}

# Authenticate
echo -ne "Authenticating... "
login_response=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@test.com","password":"admin123"}')

ACCESS_TOKEN=$(echo "$login_response" | python3 -c "import sys, json; print(json.load(sys.stdin).get('data', {}).get('token', ''))" 2>/dev/null)

if [ -n "$ACCESS_TOKEN" ] && [ "$ACCESS_TOKEN" != "" ]; then
    echo -e "${GREEN}✓ SUCCESS${NC}\n"
else
    echo -e "${RED}✗ FAILED - Cannot proceed without authentication${NC}"
    exit 1
fi

# ==========================================
# FIXED ISSUE #1 & #2: Folder & Label Routes
# ==========================================
echo -e "${BLUE}━━━ Issue #1 & #2: Folder & Label Routing ━━━${NC}\n"
echo "## Issue #1 & #2: Folder & Label Routing (Fixed)" >> $REPORT_FILE
echo "" >> $REPORT_FILE

test_endpoint "Get All Folders" "GET" "/conversations/folders" "" "$ACCESS_TOKEN"
test_endpoint "Get All Labels" "GET" "/conversations/labels" "" "$ACCESS_TOKEN"

# ==========================================
# FIXED ISSUE #3: Prompt Type Validation
# ==========================================
echo -e "\n${BLUE}━━━ Issue #3: Prompt Type Validation ━━━${NC}\n"
echo "## Issue #3: Prompt Type Validation (Fixed)" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# First, create a prompt to test with
echo -ne "Creating test prompt... "
create_prompt=$(curl -s -X POST "$BASE_URL/training/prompts/chatbot" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -d '{"userInstructions":"Test instructions","systemPrompt":"Test system prompt"}' 2>/dev/null)
echo -e "${GREEN}Done${NC}"

test_endpoint "Get Chatbot Prompt" "GET" "/training/prompts/chatbot" "" "$ACCESS_TOKEN"
test_endpoint "Update Chatbot Prompt" "PATCH" "/training/prompts/chatbot" '{"userInstructions":"Updated instructions"}' "$ACCESS_TOKEN"
test_endpoint "Get Voice Prompt" "GET" "/training/prompts/voice" "" "$ACCESS_TOKEN"

# ==========================================
# FIXED ISSUE #4: Template Field Name
# ==========================================
echo -e "\n${BLUE}━━━ Issue #4: Template Field Name ━━━${NC}\n"
echo "## Issue #4: Template Field Name (Fixed)" >> $REPORT_FILE
echo "" >> $REPORT_FILE

test_endpoint "Create Template" "POST" "/settings/templates" '{"name":"Test Template","text":"Hello from template","category":"greeting"}' "$ACCESS_TOKEN"

# ==========================================
# FIXED ISSUE #5: Custom Property Field
# ==========================================
echo -e "\n${BLUE}━━━ Issue #5: Custom Property Field ━━━${NC}\n"
echo "## Issue #5: Custom Property Field (Fixed)" >> $REPORT_FILE
echo "" >> $REPORT_FILE

test_endpoint "Create Custom Property" "POST" "/contacts/custom-properties" '{"name":"Test Property","dataType":"string"}' "$ACCESS_TOKEN"

# ==========================================
# FIXED ISSUE #6: Campaign Creation
# ==========================================
echo -e "\n${BLUE}━━━ Issue #6: Campaign Creation ━━━${NC}\n"
echo "## Issue #6: Campaign Creation (Fixed)" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# First get or create a list
LIST_DATA=$(curl -s -X GET "$BASE_URL/contacts/lists/all" -H "Authorization: Bearer $ACCESS_TOKEN")
LIST_ID=$(echo "$LIST_DATA" | python3 -c "import sys, json; data = json.load(sys.stdin).get('data', []); print(data[0]['_id'] if data else '')" 2>/dev/null)

if [ -z "$LIST_ID" ]; then
    # Create a list first
    echo -ne "Creating test list... "
    list_response=$(curl -s -X POST "$BASE_URL/contacts/lists" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -d '{"name":"Test Campaign List"}')
    LIST_ID=$(echo "$list_response" | python3 -c "import sys, json; print(json.load(sys.stdin).get('data', {}).get('_id', ''))" 2>/dev/null)
    echo -e "${GREEN}Done${NC}"
fi

if [ -n "$LIST_ID" ]; then
    test_endpoint "Create Campaign" "POST" "/campaigns" "{\"name\":\"Test Campaign\",\"listId\":\"$LIST_ID\",\"templateId\":\"test_template_id\"}" "$ACCESS_TOKEN"
else
    echo -e "${RED}Skipping campaign test - no list ID available${NC}"
    echo "**Campaign Test:** Skipped - no list ID available" >> $REPORT_FILE
fi

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

SUCCESS_RATE=$(awk "BEGIN {printf \"%.2f\", ($PASSED_TESTS/$TOTAL_TESTS)*100}")
echo "| **Success Rate** | ${SUCCESS_RATE}% |" >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo -e "\n${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          Test Summary                      ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo -e "Total Tests:    ${BLUE}$TOTAL_TESTS${NC}"
echo -e "Passed:         ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed:         ${RED}$FAILED_TESTS${NC}"
echo -e "Success Rate:   ${YELLOW}${SUCCESS_RATE}%${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}🎉 All fixed endpoints are now working!${NC}"
    echo "" >> $REPORT_FILE
    echo "## 🎉 Result" >> $REPORT_FILE
    echo "" >> $REPORT_FILE
    echo "**All previously failing endpoints are now working correctly!**" >> $REPORT_FILE
else
    echo -e "${YELLOW}⚠️  Some endpoints still have issues${NC}"
    echo "" >> $REPORT_FILE
    echo "## ⚠️ Result" >> $REPORT_FILE
    echo "" >> $REPORT_FILE
    echo "**Some endpoints still need attention. See details above.**" >> $REPORT_FILE
fi

echo ""
echo -e "${BLUE}Full report saved to: $REPORT_FILE${NC}\n"

