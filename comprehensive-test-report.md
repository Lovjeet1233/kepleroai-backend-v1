# KepleroAI API Comprehensive Test Report

**Test Date:** Thu Oct 30 15:47:15 IST 2025
**Base URL:** http://localhost:5001/api/v1

---

## Phase 1: Health & Authentication

### Health Check

- **Method:** `GET`
- **Endpoint:** `/health`
- **HTTP Code:** 200
- **Status:** ✓ PASSED
- **Response:**
```json
```


**Authentication Status:** ✓ Successfully authenticated

### Get Current User

- **Method:** `GET`
- **Endpoint:** `/auth/me`
- **HTTP Code:** 200
- **Status:** ✓ PASSED
- **Response:**
```json
```

### Logout

- **Method:** `POST`
- **Endpoint:** `/auth/logout`
- **HTTP Code:** 200
- **Status:** ✓ PASSED
- **Response:**
```json
```

## Phase 2: Conversations

### Get All Conversations

- **Method:** `GET`
- **Endpoint:** `/conversations`
- **HTTP Code:** 200
- **Status:** ✓ PASSED
- **Response:**
```json
```

### Search Messages

- **Method:** `GET`
- **Endpoint:** `/conversations/search-messages?query=hello`
- **HTTP Code:** 200
- **Status:** ✓ PASSED
- **Response:**
```json
```

### Get Conversation By ID (Non-existent)

- **Method:** `GET`
- **Endpoint:** `/conversations/507f1f77bcf86cd799439011`
- **HTTP Code:** 404
- **Status:** ⊘ EXPECTED
- **Response:**
```json
```

## Phase 3: Folders & Labels

### Get All Folders

- **Method:** `GET`
- **Endpoint:** `/conversations/folders`
- **HTTP Code:** 500
- **Status:** ✗ FAILED
- **Response:**
```json
```

### Create Folder

- **Method:** `POST`
- **Endpoint:** `/conversations/folders`
- **HTTP Code:** 201
- **Status:** ✓ PASSED
- **Response:**
```json
```

### Get All Labels

- **Method:** `GET`
- **Endpoint:** `/conversations/labels`
- **HTTP Code:** 500
- **Status:** ✗ FAILED
- **Response:**
```json
```

### Create Label

- **Method:** `POST`
- **Endpoint:** `/conversations/labels`
- **HTTP Code:** 201
- **Status:** ✓ PASSED
- **Response:**
```json
```

## Phase 4: Templates

### Get All Templates

- **Method:** `GET`
- **Endpoint:** `/settings/templates`
- **HTTP Code:** 200
- **Status:** ✓ PASSED
- **Response:**
```json
```

### Create Template

- **Method:** `POST`
- **Endpoint:** `/settings/templates`
- **HTTP Code:** 400
- **Status:** ✗ FAILED
- **Response:**
```json
```

## Phase 5: Knowledge Base

### Get All Knowledge Bases

- **Method:** `GET`
- **Endpoint:** `/training/knowledge-bases`
- **HTTP Code:** 200
- **Status:** ✓ PASSED
- **Response:**
```json
```

### Create Knowledge Base

- **Method:** `POST`
- **Endpoint:** `/training/knowledge-bases`
- **HTTP Code:** 201
- **Status:** ✓ PASSED
- **Response:**
```json
```

### Get Space Usage

- **Method:** `GET`
- **Endpoint:** `/training/knowledge-bases/69033b2e7c132f133f24d3e9/space-usage`
- **HTTP Code:** 200
- **Status:** ✓ PASSED
- **Response:**
```json
```

### Get All FAQs

- **Method:** `GET`
- **Endpoint:** `/training/knowledge-bases/69033b2e7c132f133f24d3e9/faqs`
- **HTTP Code:** 200
- **Status:** ✓ PASSED
- **Response:**
```json
```

### Create FAQ

- **Method:** `POST`
- **Endpoint:** `/training/knowledge-bases/69033b2e7c132f133f24d3e9/faqs`
- **HTTP Code:** 201
- **Status:** ✓ PASSED
- **Response:**
```json
```

### Get All Websites

- **Method:** `GET`
- **Endpoint:** `/training/knowledge-bases/69033b2e7c132f133f24d3e9/websites`
- **HTTP Code:** 200
- **Status:** ✓ PASSED
- **Response:**
```json
```

### Get All Files

- **Method:** `GET`
- **Endpoint:** `/training/knowledge-bases/69033b2e7c132f133f24d3e9/files`
- **HTTP Code:** 200
- **Status:** ✓ PASSED
- **Response:**
```json
```

## Phase 6: Prompts

### Get Main Prompt

- **Method:** `GET`
- **Endpoint:** `/training/prompts/main`
- **HTTP Code:** 400
- **Status:** ✗ FAILED
- **Response:**
```json
```

### Get Greeting Prompt

- **Method:** `GET`
- **Endpoint:** `/training/prompts/greeting`
- **HTTP Code:** 400
- **Status:** ✗ FAILED
- **Response:**
```json
```

### Update Main Prompt

- **Method:** `PATCH`
- **Endpoint:** `/training/prompts/main`
- **HTTP Code:** 400
- **Status:** ✗ FAILED
- **Response:**
```json
```

## Phase 7: Contacts & Lists

### Get All Lists

- **Method:** `GET`
- **Endpoint:** `/contacts/lists/all`
- **HTTP Code:** 200
- **Status:** ✓ PASSED
- **Response:**
```json
```

### Create Contact List

- **Method:** `POST`
- **Endpoint:** `/contacts/lists`
- **HTTP Code:** 201
- **Status:** ✓ PASSED
- **Response:**
```json
```

### Get All Contacts

- **Method:** `GET`
- **Endpoint:** `/contacts`
- **HTTP Code:** 200
- **Status:** ✓ PASSED
- **Response:**
```json
```

### Create Contact

- **Method:** `POST`
- **Endpoint:** `/contacts`
- **HTTP Code:** 201
- **Status:** ✓ PASSED
- **Response:**
```json
```

### Get Custom Properties

- **Method:** `GET`
- **Endpoint:** `/contacts/custom-properties/all`
- **HTTP Code:** 200
- **Status:** ✓ PASSED
- **Response:**
```json
```

### Create Custom Property

- **Method:** `POST`
- **Endpoint:** `/contacts/custom-properties`
- **HTTP Code:** 400
- **Status:** ✗ FAILED
- **Response:**
```json
```

## Phase 8: Campaigns

### Get All Campaigns

- **Method:** `GET`
- **Endpoint:** `/campaigns`
- **HTTP Code:** 200
- **Status:** ✓ PASSED
- **Response:**
```json
```

### Get Campaign Templates

- **Method:** `GET`
- **Endpoint:** `/campaigns/templates`
- **HTTP Code:** 200
- **Status:** ✓ PASSED
- **Response:** (truncated - too large)

### Create Campaign

- **Method:** `POST`
- **Endpoint:** `/campaigns`
- **HTTP Code:** 400
- **Status:** ✗ FAILED
- **Response:**
```json
```

## Phase 9: Automations

### Get All Automations

- **Method:** `GET`
- **Endpoint:** `/automations`
- **HTTP Code:** 200
- **Status:** ✓ PASSED
- **Response:**
```json
```

### Create Automation

- **Method:** `POST`
- **Endpoint:** `/automations`
- **HTTP Code:** 201
- **Status:** ✓ PASSED
- **Response:**
```json
```

## Phase 10: Analytics

### Get Dashboard Analytics

- **Method:** `GET`
- **Endpoint:** `/analytics/dashboard?startDate=2024-01-01&endDate=2025-12-31`
- **HTTP Code:** 200
- **Status:** ✓ PASSED
- **Response:**
```json
```

### Get Trends

- **Method:** `GET`
- **Endpoint:** `/analytics/trends?period=7d&metric=conversations`
- **HTTP Code:** 200
- **Status:** ✓ PASSED
- **Response:**
```json
```

### Get Performance

- **Method:** `GET`
- **Endpoint:** `/analytics/performance?startDate=2024-01-01&endDate=2025-12-31`
- **HTTP Code:** 200
- **Status:** ✓ PASSED
- **Response:**
```json
```

### Get All Topics

- **Method:** `GET`
- **Endpoint:** `/analytics/topics`
- **HTTP Code:** 200
- **Status:** ✓ PASSED
- **Response:**
```json
```

### Create Topic

- **Method:** `POST`
- **Endpoint:** `/analytics/topics`
- **HTTP Code:** 201
- **Status:** ✓ PASSED
- **Response:**
```json
```

## Phase 11: Webhooks

### Facebook Webhook

- **Method:** `POST`
- **Endpoint:** `/webhooks/facebook`
- **HTTP Code:** 200
- **Status:** ✓ PASSED
- **Response:**
```json
```

### Shopify Webhook

- **Method:** `POST`
- **Endpoint:** `/webhooks/shopify`
- **HTTP Code:** 200
- **Status:** ✓ PASSED
- **Response:**
```json
```

### Generic Webhook

- **Method:** `POST`
- **Endpoint:** `/webhooks/generic/test-webhook-id`
- **HTTP Code:** 200
- **Status:** ✓ PASSED
- **Response:**
```json
```


---

## Test Summary

| Metric | Count |
|--------|-------|
| **Total Tests** | 41 |
| **Passed** | 33 |
| **Failed** | 8 |
| **Skipped** | 0 |
| **Success Rate** | 80.49% |

