# AI Behavior & Knowledge Base API Documentation

## Base URL
```
http://localhost:5000/api/v1
```

## Authentication
All endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 1. AI Behavior Endpoints

### Get AI Behavior Configuration
```http
GET /ai-behavior
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "userId": "...",
    "knowledgeBaseId": "...",
    "chatAgent": {
      "improvements": "",
      "systemPrompt": "You are a helpful AI assistant...",
      "humanOperator": {
        "escalationRules": [],
        "availability": {
          "alwaysAvailable": false,
          "schedule": {}
        }
      }
    },
    "voiceAgent": {
      "improvements": "",
      "systemPrompt": "You are a helpful AI voice assistant...",
      "humanOperator": {
        "phoneNumber": "",
        "escalationRules": [],
        "availability": {
          "alwaysAvailable": false,
          "schedule": {}
        }
      }
    }
  }
}
```

### Update Chat Agent Improvements
```http
PATCH /ai-behavior/chat-agent/improvements
Content-Type: application/json

{
  "improvements": "Be more friendly and professional, answer questions about pricing clearly"
}
```

### Update Chat Agent System Prompt
```http
PATCH /ai-behavior/chat-agent/prompt
Content-Type: application/json

{
  "systemPrompt": "You are a helpful AI assistant designed to provide excellent customer service. Be friendly, professional, and helpful."
}
```

### Update Chat Agent Human Operator
```http
PATCH /ai-behavior/chat-agent/human-operator
Content-Type: application/json

{
  "escalationRules": [
    "Customer requests to speak with a manager",
    "Complex technical issue",
    "Refund request over $500"
  ],
  "availability": {
    "alwaysAvailable": false,
    "schedule": {
      "monday": { "enabled": true, "from": "09:00", "to": "17:00" },
      "tuesday": { "enabled": true, "from": "09:00", "to": "17:00" },
      "wednesday": { "enabled": true, "from": "09:00", "to": "17:00" },
      "thursday": { "enabled": true, "from": "09:00", "to": "17:00" },
      "friday": { "enabled": true, "from": "09:00", "to": "17:00" },
      "saturday": { "enabled": false, "from": "09:00", "to": "17:00" },
      "sunday": { "enabled": false, "from": "09:00", "to": "17:00" }
    }
  }
}
```

### Update Voice Agent Improvements
```http
PATCH /ai-behavior/voice-agent/improvements
Content-Type: application/json

{
  "improvements": "Speak clearly and at a moderate pace, be empathetic when handling complaints"
}
```

### Update Voice Agent System Prompt
```http
PATCH /ai-behavior/voice-agent/prompt
Content-Type: application/json

{
  "systemPrompt": "You are a helpful AI voice assistant. Speak clearly, be empathetic, and provide concise answers."
}
```

### Update Voice Agent Human Operator
```http
PATCH /ai-behavior/voice-agent/human-operator
Content-Type: application/json

{
  "phoneNumber": "+1 (555) 123-4567",
  "escalationRules": [
    "Caller is angry or frustrated",
    "Request for billing support",
    "Technical issue beyond AI's knowledge"
  ],
  "availability": {
    "alwaysAvailable": true,
    "schedule": {}
  }
}
```

### Link Knowledge Base to AI Behavior
```http
PATCH /ai-behavior/knowledge-base
Content-Type: application/json

{
  "knowledgeBaseId": "KNOWLEDGE_BASE_ID_HERE"
}
```

---

## 2. Knowledge Base Endpoints

### Create Knowledge Base
```http
POST /training/knowledge-bases
Content-Type: application/json

{
  "name": "My Knowledge Base"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Knowledge base created",
  "data": {
    "_id": "...",
    "userId": "...",
    "name": "My Knowledge Base",
    "collectionName": "kb_1234567890_my_knowledge_base",
    "faqs": [],
    "websites": [],
    "files": []
  }
}
```

**Note:** This automatically creates a collection in Python RAG system with the `collectionName`.

### Get All Knowledge Bases
```http
GET /training/knowledge-bases
```

### Add FAQ
```http
POST /training/knowledge-bases/:kbId/faqs
Content-Type: application/json

{
  "question": "What are your business hours?",
  "answer": "We are open Monday to Friday, 9 AM to 5 PM EST."
}
```

### Add Website URLs
```http
POST /training/knowledge-bases/:kbId/websites/urls
Content-Type: application/json

{
  "urls": [
    "https://www.example.com",
    "https://www.example.com/about",
    "https://www.example.com/pricing"
  ]
}
```

**Note:** This automatically ingests the URLs into Python RAG system.

### Upload File (PDF or Excel)
```http
POST /training/knowledge-bases/:kbId/files
Content-Type: multipart/form-data

file: [PDF or Excel file]
```

**Note:** This automatically ingests the file into Python RAG system.

---

## 3. Chatbot Endpoints

### Chat with AI (Text)
```http
POST /chatbot/chat
Content-Type: application/json

{
  "query": "What are your business hours?",
  "knowledgeBaseId": "OPTIONAL_KB_ID",
  "threadId": "OPTIONAL_THREAD_ID"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "query": "What are your business hours?",
    "answer": "We are open Monday to Friday, 9 AM to 5 PM EST.",
    "retrieved_docs": ["Document 1", "Document 2"],
    "context": "...",
    "thread_id": "..."
  }
}
```

**How it works:**
- Uses the chat agent system prompt from AI Behavior
- If `knowledgeBaseId` is provided, uses that knowledge base's collection
- Otherwise, uses the default knowledge base linked in AI Behavior
- Combines the agent prompt + knowledge base context for the system prompt

### Voice Chat with AI
```http
POST /chatbot/voice-chat
Content-Type: application/json

{
  "query": "What are your business hours?",
  "knowledgeBaseId": "OPTIONAL_KB_ID",
  "threadId": "OPTIONAL_THREAD_ID"
}
```

**How it works:**
- Uses the voice agent system prompt from AI Behavior
- Same logic as chat endpoint but with voice-optimized prompts

---

## Python RAG Integration

The system integrates with Python RAG service running on `http://localhost:8000`

### When Python RAG is Called:

1. **Knowledge Base Creation** → Creates collection via `/rag/create_collection`
2. **Adding Website URLs** → Ingests via `/rag/data_ingestion` with `url_links`
3. **Uploading PDF Files** → Ingests via `/rag/data_ingestion` with `pdf_files`
4. **Uploading Excel Files** → Ingests via `/rag/data_ingestion` with `excel_files`
5. **Chatbot Query** → Queries via `/rag/chat` with `collection_name` and `system_prompt`

### System Prompt Combination:

The final system prompt sent to Python RAG is:
```
[Chat/Voice Agent Prompt] + [Knowledge Base Context]
```

For example:
```
You are a helpful AI assistant designed to provide excellent customer service. Be friendly, professional, and helpful.

Knowledge Base Context:
[Retrieved documents from knowledge base]
```

---

## Example Workflow

1. **Create Knowledge Base:**
```bash
curl -X POST http://localhost:5000/api/v1/training/knowledge-bases \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Customer Support KB"}'
```

2. **Add Website URLs:**
```bash
curl -X POST http://localhost:5000/api/v1/training/knowledge-bases/KB_ID/websites/urls \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"urls": ["https://www.example.com"]}'
```

3. **Upload PDF:**
```bash
curl -X POST http://localhost:5000/api/v1/training/knowledge-bases/KB_ID/files \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@document.pdf"
```

4. **Configure Chat Agent:**
```bash
curl -X PATCH http://localhost:5000/api/v1/ai-behavior/chat-agent/prompt \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"systemPrompt": "You are a friendly customer service AI."}'
```

5. **Link Knowledge Base:**
```bash
curl -X PATCH http://localhost:5000/api/v1/ai-behavior/knowledge-base \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"knowledgeBaseId": "KB_ID"}'
```

6. **Chat with AI:**
```bash
curl -X POST http://localhost:5000/api/v1/chatbot/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "What are your services?"}'
```

---

## Environment Variables Required

Add to your `.env` file:
```env
RAG_API_URL=http://localhost:8000
```

Make sure your Python RAG service is running on port 8000 before using these endpoints.

