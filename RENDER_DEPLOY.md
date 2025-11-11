# Render Deploy Configuration
# For Kashmir Oil Union Management System

## Backend Service Configuration
- **Build Command**: `cd backend && npm install && npm run build`
- **Start Command**: `cd backend && npm start`
- **Environment**: Node
- **Port**: Auto-detected from PORT environment variable (default: 5000)

## Environment Variables Required

### Required Variables:
```
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
JWT_SECRET=<generate-strong-secret-min-32-chars>
JWT_REFRESH_SECRET=<generate-strong-secret-min-32-chars>
NODE_ENV=production
PORT=5000
```

### Optional Variables (with defaults):
```
CORS_ORIGIN=https://your-frontend-domain.com
BCRYPT_SALT_ROUNDS=10
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Frontend Deployment (Render Static Site)
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`

## Database Setup (Neon)
1. Create database at console.neon.tech
2. Copy connection string
3. Add to Render environment as DATABASE_URL
4. Run migrations: `npm run migrate` (one-time)

## Post-Deployment Steps
1. Verify backend health: `https://your-backend.onrender.com/api/health`
2. Update CORS_ORIGIN with frontend URL
3. Test API endpoints
4. Check logs for errors

## Troubleshooting
- If build fails: Check Node version (20+ required)
- If database connection fails: Verify DATABASE_URL format
- If CORS errors: Update CORS_ORIGIN environment variable
