# 🌐 CORS Setup Guide - Step by Step

## What is CORS?

CORS (Cross-Origin Resource Sharing) controls which websites can access your backend API.

**Problem**: Your frontend (vercel.app) and backend (railway.app) are on different domains.  
**Solution**: Tell your backend to allow requests from your frontend domain.

---

## 🚦 **Two-Stage Approach**

### Stage 1: During Deployment (OPEN)
Allow all origins temporarily while setting up:

```bash
CORS_ORIGIN=*
SOCKET_IO_CORS_ORIGIN=*
FRONTEND_URL=https://your-app.vercel.app
```

✅ **Why?** Makes testing easier during setup  
⚠️ **Security**: Change this after frontend is deployed!

---

### Stage 2: After Frontend Deployed (SECURE)
Lock down to your specific domain:

```bash
CORS_ORIGIN=https://your-app.vercel.app
SOCKET_IO_CORS_ORIGIN=https://your-app.vercel.app
FRONTEND_URL=https://your-app.vercel.app
```

✅ **Secure**: Only your frontend can access backend  
✅ **Production-ready**

---

## 📋 **Step-by-Step CORS Setup**

### Step 1: Deploy Backend with Open CORS

In **Railway/Render**, set these environment variables:

```bash
# Server
NODE_ENV=production
PORT=5000

# Database (get from MongoDB Atlas)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/chatbot_platform

# Redis (get from Upstash)
REDIS_URL=redis://default:pass@host.upstash.io:6379

# Security
JWT_SECRET=your_random_32_character_secret

# CORS - OPEN (temporarily)
CORS_ORIGIN=*
SOCKET_IO_CORS_ORIGIN=*
FRONTEND_URL=http://localhost:3000

# Optional
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

✅ **Deploy** and get your backend URL (e.g., `https://keplero-backend.railway.app`)

---

### Step 2: Deploy Frontend

In **Vercel**, set these environment variables:

```bash
NEXT_PUBLIC_API_URL=https://keplero-backend.railway.app/api/v1
NEXT_PUBLIC_SOCKET_URL=https://keplero-backend.railway.app
```

✅ **Deploy** and get your frontend URL (e.g., `https://keplero-ai.vercel.app`)

---

### Step 3: Update Backend CORS (Secure)

Go back to **Railway/Render** and update these 3 variables:

```bash
# Change from: *
# To: your-actual-frontend-url
CORS_ORIGIN=https://keplero-ai.vercel.app
SOCKET_IO_CORS_ORIGIN=https://keplero-ai.vercel.app
FRONTEND_URL=https://keplero-ai.vercel.app
```

✅ **Save** - Railway will automatically redeploy

---

## 🎯 **Quick Copy-Paste**

### For Railway Variables Tab:

**Initial Deployment (Open CORS):**
```
CORS_ORIGIN=*
SOCKET_IO_CORS_ORIGIN=*
FRONTEND_URL=http://localhost:3000
```

**After Frontend Deployed (Replace with YOUR URLs):**
```
CORS_ORIGIN=https://YOUR-APP.vercel.app
SOCKET_IO_CORS_ORIGIN=https://YOUR-APP.vercel.app
FRONTEND_URL=https://YOUR-APP.vercel.app
```

---

## ⚠️ **Important CORS Rules**

### ✅ DO:
- Use exact URL: `https://your-app.vercel.app`
- Match protocol: `https` (not `http`)
- Remove trailing slash: ❌ `https://app.vercel.app/`
- Use your actual Vercel URL

### ❌ DON'T:
- Leave as `*` in production (security risk!)
- Add trailing slashes
- Mix http/https
- Include `/api/v1` at the end

---

## 🔍 **How to Check CORS is Working**

### 1. Open Browser Developer Tools
```
Chrome: F12 → Console
Safari: Cmd+Option+C → Console
```

### 2. Visit Your Frontend
Go to `https://your-app.vercel.app`

### 3. Check for CORS Errors
❌ **Bad** (CORS not configured):
```
Access to fetch at 'https://backend.railway.app/api/v1/...' 
from origin 'https://frontend.vercel.app' has been blocked by CORS policy
```

✅ **Good** (CORS working):
```
No CORS errors in console
API calls succeed
Data loads properly
```

---

## 🌍 **Multiple Domains (Advanced)**

If you have multiple domains (staging + production):

```bash
# Comma-separated list (no spaces!)
CORS_ORIGIN=https://app.vercel.app,https://staging.vercel.app,https://custom-domain.com
```

**Example:**
```bash
CORS_ORIGIN=https://keplero-ai.vercel.app,https://kepleroai.com,https://staging.kepleroai.com
```

---

## 🐛 **Troubleshooting CORS Issues**

### Problem: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Check:**
1. ✅ `CORS_ORIGIN` is set in backend
2. ✅ URL matches exactly (no typos)
3. ✅ No trailing slash
4. ✅ Protocol matches (https/http)
5. ✅ Backend redeployed after changing CORS

**Quick Fix:**
```bash
# Temporarily set to * to test
CORS_ORIGIN=*

# If it works, problem is URL mismatch
# Update to correct URL
```

---

### Problem: "Preflight request doesn't pass"

**Solution:**
Make sure both are set:
```bash
CORS_ORIGIN=https://your-app.vercel.app
SOCKET_IO_CORS_ORIGIN=https://your-app.vercel.app
```

---

### Problem: Works locally but not in production

**Check:**
```bash
# Local
CORS_ORIGIN=http://localhost:3000

# Production
CORS_ORIGIN=https://your-app.vercel.app
```

You need **different values** for local vs production!

---

## 📱 **Testing CORS**

### Test 1: Health Check (No CORS needed)
```bash
curl https://your-backend.railway.app/api/v1/health
```

Should return:
```json
{"status": "ok", "message": "Server is running"}
```

### Test 2: Frontend to Backend
1. Open your frontend: `https://your-app.vercel.app`
2. Try to login
3. Check browser console for errors

✅ **Working**: No CORS errors, login succeeds  
❌ **Not Working**: CORS errors in console

---

## 🎓 **Understanding the CORS Variables**

### `CORS_ORIGIN`
- Controls which domains can make API requests
- Used by Express.js `cors()` middleware
- Checked on every API call

### `SOCKET_IO_CORS_ORIGIN`
- Controls which domains can connect to WebSocket
- Used by Socket.IO
- For real-time features (chat, notifications)

### `FRONTEND_URL`
- Used for redirects (e.g., password reset emails)
- Used for generating links
- Not directly related to CORS, but should match

---

## ✅ **Final Checklist**

- [ ] Backend deployed with `CORS_ORIGIN=*` (initial)
- [ ] Frontend deployed to Vercel
- [ ] Got frontend URL from Vercel
- [ ] Updated backend `CORS_ORIGIN` with frontend URL
- [ ] Updated `SOCKET_IO_CORS_ORIGIN` with frontend URL
- [ ] Updated `FRONTEND_URL` with frontend URL
- [ ] Tested login on frontend
- [ ] No CORS errors in browser console
- [ ] Changed from `*` to specific URL (security!)

---

## 💡 **Pro Tip: Environment-Specific CORS**

Most platforms let you set different env vars per environment:

**Development (localhost):**
```bash
CORS_ORIGIN=http://localhost:3000
```

**Staging:**
```bash
CORS_ORIGIN=https://staging-app.vercel.app
```

**Production:**
```bash
CORS_ORIGIN=https://app.vercel.app
```

Railway automatically uses the same env vars, but Vercel lets you set per environment!

---

## 🆘 **Still Having Issues?**

1. **Check Railway Logs**: Look for CORS-related errors
2. **Check Browser Console**: See exact error message
3. **Verify URLs**: Copy-paste from Vercel/Railway (no typos!)
4. **Try `*` temporarily**: If it works, URL is wrong
5. **Restart Backend**: After changing CORS, redeploy

---

## 📞 **Quick Reference**

| Variable | Purpose | Example |
|----------|---------|---------|
| `CORS_ORIGIN` | Allow API requests from | `https://app.vercel.app` |
| `SOCKET_IO_CORS_ORIGIN` | Allow WebSocket from | `https://app.vercel.app` |
| `FRONTEND_URL` | For redirects/links | `https://app.vercel.app` |

**All 3 should have the same value in production!**

---

**You're all set! 🚀 Your backend will now accept requests from your frontend securely.**

