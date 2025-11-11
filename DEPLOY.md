# ✅ SIMPLE RENDER DEPLOYMENT GUIDE

## Step 1: Create New Web Service on Render

1. Go to https://dashboard.render.com
2. Click **"New +"** button
3. Select **"Web Service"**
4. Connect your GitHub: `farhanrafiq/kashmir-oil-union-`

## Step 2: Fill in These EXACT Settings

**Basic Settings:**
- **Name**: `kashmir-oil-union-backend` (or any name you want)
- **Region**: Choose closest to you
- **Branch**: `main`
- **Root Directory**: `backend`

**Build & Deploy Settings:**
- **Build Command**: 
  ```
  npm run build
  ```

- **Start Command**: 
  ```
  npm start
  ```

## Step 3: Add Environment Variables

Click **"Advanced"** then **"Add Environment Variable"** for each:

**Required (You MUST add these):**
```
DATABASE_URL = your-neon-database-url-here
JWT_SECRET = any-random-32-character-string-here
NODE_ENV = production
```

**Optional (Copy as-is):**
```
PORT = 5000
JWT_EXPIRES_IN = 24h
JWT_REFRESH_SECRET = another-random-32-character-string
CORS_ORIGIN = *
```

## Step 4: Click "Create Web Service"

That's it! Render will:
1. Install all packages
2. Build your backend
3. Start the server
4. Give you a URL like: `https://your-app.onrender.com`

## Step 5: Test Your Backend

After deployment completes, visit:
```
https://your-app.onrender.com/api/health
```

You should see:
```json
{
  "success": true,
  "message": "Kashmir Oil Union API is running",
  "timestamp": "2024-11-11T..."
}
```

---

## 🔥 Quick Reference

**What you need:**
1. Neon database URL (get from https://console.neon.tech)
2. Any random 32-character string for JWT_SECRET
3. That's it!

**Render will handle:**
- Installing Node.js
- Installing packages (npm install)
- Building TypeScript (tsc)
- Starting server
- HTTPS certificate
- Everything else!

---

## 🚨 IMPORTANT: Get Your Database URL

1. Go to https://console.neon.tech
2. Create new project (or use existing)
3. Copy connection string - looks like:
   ```
   postgresql://username:password@host.neon.tech/dbname?sslmode=require
   ```
4. Paste this as `DATABASE_URL` in Render

**That's literally it!** 🎉
