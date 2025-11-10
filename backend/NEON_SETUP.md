# Neon DB Setup Guide for Kashmir Oil Union Backend

## Overview
This backend is configured to work with **Neon DB** (serverless PostgreSQL) with automatic SSL support.

---

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

This will install all required packages including:
- express, pg, bcrypt, jsonwebtoken
- @types/node, @types/express, and other TypeScript definitions

### 2. Set Up Neon Database

#### Create Neon Project
1. Go to [Neon Console](https://console.neon.tech/)
2. Create a new project
3. Name it: `kashmir-oil-union`
4. Copy your connection string

Your connection string will look like:
```
postgresql://user:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### 3. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit `.env` and add your Neon connection string:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Neon Database Configuration (Option 1: Recommended)
DATABASE_URL=postgresql://user:password@your-neon-hostname.neon.tech/kashmir_oil_union?sslmode=require

# OR Option 2: Individual Parameters
# DB_HOST=your-neon-hostname.neon.tech
# DB_PORT=5432
# DB_USER=your_neon_user
# DB_PASSWORD=your_neon_password
# DB_NAME=kashmir_oil_union
# DB_SSL=true

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production_CHANGE_THIS
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your_super_secret_refresh_key_CHANGE_THIS
JWT_REFRESH_EXPIRES_IN=7d

# Bcrypt Configuration
BCRYPT_SALT_ROUNDS=10

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Initialize Database Schema

Connect to your Neon database and run the schema:

**Option A: Using psql**
```bash
psql "postgresql://user:password@your-neon-hostname.neon.tech/kashmir_oil_union?sslmode=require" -f database/schema.sql
psql "postgresql://user:password@your-neon-hostname.neon.tech/kashmir_oil_union?sslmode=require" -f database/seed.sql
```

**Option B: Using Neon SQL Editor**
1. Open Neon Console
2. Go to SQL Editor
3. Copy and paste contents of `database/schema.sql`
4. Execute
5. Copy and paste contents of `database/seed.sql`
6. Execute

### 5. Build and Run

```bash
# Development mode with hot reload
npm run dev

# Production build
npm run build
npm start
```

---

## Neon-Specific Features

### SSL Connection
The backend automatically enables SSL when using `DATABASE_URL` or when `DB_SSL=true`.

```typescript
// Automatically configured in src/config/database.ts
ssl: { rejectUnauthorized: false }
```

### Connection Pooling
Optimized for Neon's serverless architecture:
- Max connections: 20 (configurable)
- Idle timeout: 30 seconds
- Connection timeout: 5 seconds

### Connection String Priority
1. If `DATABASE_URL` is set → uses connection string (recommended for Neon)
2. Otherwise → uses individual DB_* parameters

---

## Testing the Connection

### Check Database Connection

```bash
# In development mode, the server will log connection info
npm run dev
```

You should see:
```
✓ Database connected successfully
✓ Kashmir Oil Union API Server running on port 5000
```

### Test API Endpoint

```bash
curl http://localhost:5000/api/v1/health
```

Expected response:
```json
{
  "success": true,
  "message": "Kashmir Oil Union API is running",
  "timestamp": "2025-11-11T..."
}
```

### Test Admin Login

```bash
curl -X POST http://localhost:5000/api/v1/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@kashmiroil.com",
    "password": "admin123"
  }'
```

---

## Neon Database Management

### Viewing Data
Use Neon's SQL Editor or connect with any PostgreSQL client:

```bash
psql "postgresql://user:password@your-host.neon.tech/kashmir_oil_union?sslmode=require"
```

### Backups
Neon provides automatic backups. You can also export data:

```bash
pg_dump "postgresql://user:password@your-host.neon.tech/kashmir_oil_union?sslmode=require" > backup.sql
```

### Monitoring
- Check Neon Console for connection metrics
- View query performance
- Monitor database size

---

## Migration from Local PostgreSQL to Neon

If you have existing data in local PostgreSQL:

### 1. Export Local Data
```bash
pg_dump -U postgres kashmir_oil_union > local_backup.sql
```

### 2. Import to Neon
```bash
psql "postgresql://user:password@your-host.neon.tech/kashmir_oil_union?sslmode=require" < local_backup.sql
```

---

## Troubleshooting

### Connection Refused
- Verify your DATABASE_URL is correct
- Check that your IP is allowed in Neon's connection settings
- Ensure SSL is enabled (`?sslmode=require`)

### SSL Certificate Error
- The backend uses `rejectUnauthorized: false` for compatibility
- This is safe for Neon's managed SSL certificates

### Too Many Connections
- Reduce `DB_MAX_CONNECTIONS` in .env (default: 20)
- Neon has connection limits based on your plan

### Slow Queries
- Check Neon Console for query performance
- Add indexes as needed (see database/schema.sql)
- Consider upgrading your Neon plan for better performance

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes* | - | Full Neon connection string |
| `DB_HOST` | Yes* | localhost | Neon hostname |
| `DB_PORT` | No | 5432 | PostgreSQL port |
| `DB_USER` | Yes* | postgres | Neon username |
| `DB_PASSWORD` | Yes* | - | Neon password |
| `DB_NAME` | Yes* | kashmir_oil_union | Database name |
| `DB_SSL` | No | true (if DATABASE_URL) | Enable SSL |
| `DB_MAX_CONNECTIONS` | No | 20 | Max pool size |
| `JWT_SECRET` | Yes | - | JWT signing secret |
| `NODE_ENV` | No | development | Environment |
| `PORT` | No | 5000 | Server port |

*Either `DATABASE_URL` OR individual DB_* parameters are required

---

## Production Deployment

### Using DATABASE_URL (Recommended)

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@your-host.neon.tech/kashmir_oil_union?sslmode=require
JWT_SECRET=<strong-secret-here>
JWT_REFRESH_SECRET=<strong-refresh-secret-here>
```

### Security Checklist
- [ ] Change all default secrets in .env
- [ ] Use strong JWT_SECRET (32+ characters)
- [ ] Enable CORS only for your frontend domain
- [ ] Review rate limits based on your needs
- [ ] Enable Neon's IP allowlist if available
- [ ] Use environment-specific Neon branches

---

## Additional Resources

- [Neon Documentation](https://neon.tech/docs)
- [PostgreSQL Connection Strings](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)
- [Node.js pg Library](https://node-postgres.com/)

---

## Support

For issues specific to:
- **Neon DB**: Check [Neon Status](https://neon.tech/status) and [Neon Discord](https://discord.gg/neon)
- **Backend API**: See main README.md and API_REFERENCE.md
