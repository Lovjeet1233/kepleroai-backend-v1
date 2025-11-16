# 🔐 Backend Environment Variables Guide

## Required Environment Variables for Deployment

### ✅ Copy these to Railway/Render/Fly.io

---

## 🔴 **CRITICAL - Must Set These First**

### 1. Server Configuration
```bash
NODE_ENV=production
PORT=5000
```

### 2. Database (MongoDB Atlas - Free)
```bash
# Get from: https://cloud.mongodb.com
# Format: mongodb+srv://username:password@cluster.mongodb.net/database?options
MONGODB_URI=mongodb+srv://keplero_admin:YOUR_PASSWORD@cluster.xxxxx.mongodb.net/chatbot_platform?retryWrites=true&w=majority
```

### 3. Redis Cache (Upstash - Free)
```bash
# Get from: https://console.upstash.com
# Format: redis://default:password@host:port
REDIS_URL=redis://default:YOUR_REDIS_PASSWORD@your-redis.upstash.io:6379
```

### 4. JWT Authentication
```bash
# Generate a random 32+ character string
# Use: openssl rand -hex 32
JWT_SECRET=your_super_secret_random_32_character_minimum_string_here
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d
```

---

## 🌐 **CORS Configuration (IMPORTANT!)**

### During Setup (Before Frontend Deployed)
```bash
# Allow all origins temporarily
CORS_ORIGIN=*
SOCKET_IO_CORS_ORIGIN=*
```

### After Frontend Deployed (SECURE)
```bash
# Replace with your actual Vercel URL
CORS_ORIGIN=https://your-app.vercel.app
SOCKET_IO_CORS_ORIGIN=https://your-app.vercel.app

# For multiple domains (comma-separated):
# CORS_ORIGIN=https://your-app.vercel.app,https://custom-domain.com
```

### Frontend URL (for email links, redirects, etc.)
```bash
FRONTEND_URL=https://your-app.vercel.app
```

---

## 🟡 **OPTIONAL - But Recommended**

### File Storage (Cloudinary - Free)
```bash
# Get from: https://cloudinary.com/console
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
MAX_KNOWLEDGE_BASE_SIZE=104857600
```

**OR use AWS S3** (if you prefer):
```bash
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

### Email Configuration (Gmail SMTP - Free)
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=KepleroAI

# How to get Gmail App Password:
# 1. Go to: https://myaccount.google.com/security
# 2. Enable 2-Step Verification
# 3. Go to App Passwords
# 4. Generate password for "Mail"
# 5. Use that 16-character password here
```

### Python RAG Service (Optional - if deployed)
```bash
# If you deploy Python RAG service separately
RAG_API_URL=https://your-python-rag-service.onrender.com

# If not using RAG, leave as localhost (it will be ignored)
RAG_API_URL=http://localhost:8000
```

### Communication API (Optional)
```bash
# If you have a separate communication service for calls/SMS
COMM_API_URL=https://your-comm-service.onrender.com

# If not using, leave as localhost
COMM_API_URL=http://localhost:8000
```

---

## 🟢 **OPTIONAL - Nice to Have**

### Rate Limiting
```bash
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### File Upload Limits
```bash
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=pdf,docx,csv,txt,tsv
```

### Logging
```bash
LOG_LEVEL=info
```

### Scheduled Jobs
```bash
ENABLE_SCHEDULED_JOBS=true
```

### Encryption
```bash
# Generate: openssl rand -hex 16
ENCRYPTION_KEY=your_32_character_encryption_key_change_in_prod
```

### API Version
```bash
API_VERSION=v1
```

---

## 🔵 **EXTERNAL INTEGRATIONS (Optional)**

### WhatsApp Business API
```bash
WHATSAPP_API_URL=https://graph.facebook.com/v17.0
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token
```

### Facebook Integration
```bash
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
```

### Shopify Integration
```bash
SHOPIFY_API_KEY=your_shopify_api_key
SHOPIFY_API_SECRET=your_shopify_api_secret
```

### Stripe (Billing)
```bash
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

---

## 📋 **Complete Environment Variables Template**

Copy this entire block and fill in your values:

```bash
# ==============================================
# SERVER CONFIGURATION (REQUIRED)
# ==============================================
NODE_ENV=production
PORT=5000

# ==============================================
# DATABASE (REQUIRED)
# ==============================================
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatbot_platform?retryWrites=true&w=majority

# ==============================================
# REDIS (REQUIRED)
# ==============================================
REDIS_URL=redis://default:password@host.upstash.io:6379

# ==============================================
# JWT AUTHENTICATION (REQUIRED)
# ==============================================
JWT_SECRET=your_random_32_character_secret_key_here
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d

# ==============================================
# CORS CONFIGURATION (REQUIRED)
# ==============================================
CORS_ORIGIN=https://your-app.vercel.app
SOCKET_IO_CORS_ORIGIN=https://your-app.vercel.app
FRONTEND_URL=https://your-app.vercel.app

# ==============================================
# FILE STORAGE (OPTIONAL - Cloudinary)
# ==============================================
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
MAX_KNOWLEDGE_BASE_SIZE=104857600

# ==============================================
# EMAIL CONFIGURATION (OPTIONAL)
# ==============================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=KepleroAI

# ==============================================
# EXTERNAL APIS (OPTIONAL)
# ==============================================
RAG_API_URL=http://localhost:8000
COMM_API_URL=http://localhost:8000

# ==============================================
# SECURITY & LIMITS (OPTIONAL)
# ==============================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=pdf,docx,csv,txt,tsv
ENCRYPTION_KEY=your_32_char_encryption_key
LOG_LEVEL=info
ENABLE_SCHEDULED_JOBS=true
API_VERSION=v1
```

---

## 🚀 **How to Set Environment Variables**

### Railway
1. Go to your Railway project
2. Click on your backend service
3. Click **"Variables"** tab
4. Click **"+ New Variable"**
5. Add each variable one by one
6. **OR** click **"RAW Editor"** and paste all at once

### Render
1. Go to your Render dashboard
2. Select your web service
3. Click **"Environment"** in left sidebar
4. Click **"Add Environment Variable"**
5. Add each variable
6. Click **"Save Changes"**

### Fly.io
```bash
fly secrets set MONGODB_URI="your_value"
fly secrets set REDIS_URL="your_value"
fly secrets set JWT_SECRET="your_value"
# ... repeat for all variables
```

---

## ⚠️ **CORS Troubleshooting**

### Issue: Frontend can't connect to backend
**Error**: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Solution**:
1. Make sure `CORS_ORIGIN` includes your frontend URL
2. Don't include trailing slash: ✅ `https://app.vercel.app` ❌ `https://app.vercel.app/`
3. Use exact URL (check https vs http)

### Multiple Domains
If you have multiple domains (production + staging):
```bash
CORS_ORIGIN=https://app.vercel.app,https://staging.vercel.app,https://custom-domain.com
```

### Development + Production
During development, you might want:
```bash
# In development
CORS_ORIGIN=http://localhost:3000

# In production
CORS_ORIGIN=https://your-app.vercel.app
```

---

## 🔒 **Security Best Practices**

### 1. **JWT_SECRET**
- Use a strong random string (32+ characters)
- Generate with: `openssl rand -hex 32`
- NEVER commit to Git
- NEVER share publicly

### 2. **CORS_ORIGIN**
- Start with `*` for testing
- Change to specific domain in production
- Don't use `*` in production (security risk)

### 3. **Database URL**
- Use strong password
- Restrict IP access in MongoDB Atlas
- Use connection pooling

### 4. **API Keys**
- Store in environment variables
- Rotate regularly
- Use different keys for dev/prod

---

## 📊 **Priority Checklist**

### ✅ Minimum to Deploy (Must Have)
- [ ] `NODE_ENV=production`
- [ ] `PORT=5000`
- [ ] `MONGODB_URI` (from MongoDB Atlas)
- [ ] `REDIS_URL` (from Upstash)
- [ ] `JWT_SECRET` (random string)
- [ ] `CORS_ORIGIN` (your Vercel URL)
- [ ] `SOCKET_IO_CORS_ORIGIN` (your Vercel URL)
- [ ] `FRONTEND_URL` (your Vercel URL)

### 🟡 Nice to Have
- [ ] Cloudinary credentials (for file uploads)
- [ ] Email SMTP settings (for notifications)
- [ ] Rate limiting settings

### 🟢 Optional
- [ ] External API integrations
- [ ] WhatsApp, Facebook, Shopify
- [ ] Stripe billing

---

## 🧪 **Testing Your Setup**

After deploying, test your backend:

### 1. Health Check
```bash
curl https://your-backend.railway.app/api/v1/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Server is running",
  "timestamp": "2025-11-16T..."
}
```

### 2. CORS Test
Open browser console on your frontend and check for CORS errors.

### 3. Database Connection
Check logs in Railway/Render for "MongoDB connected" message.

---

## 💡 **Pro Tips**

1. **Copy from Local**: If your app works locally, copy from your local `.env`
2. **Test Gradually**: Add required variables first, test, then add optional ones
3. **Use Placeholders**: For unused services, use `http://localhost:8000`
4. **Check Logs**: Railway/Render logs show which variables are missing
5. **Update CORS Last**: Set `CORS_ORIGIN=*` first, deploy frontend, then update with actual URL

---

## 🆘 **Common Errors**

### Error: "Cannot connect to MongoDB"
- Check `MONGODB_URI` format
- Verify password doesn't have special characters (URL encode if needed)
- Check MongoDB Atlas IP whitelist

### Error: "Redis connection failed"
- Verify `REDIS_URL` format
- Check Upstash dashboard for correct URL
- Ensure Redis database is active

### Error: "CORS policy error"
- Check `CORS_ORIGIN` matches frontend URL exactly
- Remove trailing slashes
- Verify https vs http

### Error: "JWT malformed"
- Ensure `JWT_SECRET` is set
- Check it's at least 32 characters
- Don't include quotes in the value

---

## 📝 **Quick Copy-Paste for Railway**

Go to Railway → Variables → RAW Editor and paste:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/chatbot_platform?retryWrites=true&w=majority
REDIS_URL=redis://default:pass@host.upstash.io:6379
JWT_SECRET=change_this_to_a_random_32_character_string
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d
CORS_ORIGIN=*
SOCKET_IO_CORS_ORIGIN=*
FRONTEND_URL=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=pdf,docx,csv,txt,tsv
LOG_LEVEL=info
ENABLE_SCHEDULED_JOBS=true
API_VERSION=v1
RAG_API_URL=http://localhost:8000
COMM_API_URL=http://localhost:8000
ENCRYPTION_KEY=change_this_32_char_key
```

**Then update**:
- `MONGODB_URI` with your MongoDB Atlas connection string
- `REDIS_URL` with your Upstash Redis URL
- `JWT_SECRET` with a random string
- `CORS_ORIGIN` and `FRONTEND_URL` after frontend is deployed

---

**Need help?** Check Railway/Render logs for specific error messages!

