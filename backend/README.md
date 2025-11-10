# Kashmir Oil Union - Backend API

A comprehensive RESTful API backend for the Kashmir Oil Union Management System built with Node.js, Express, TypeScript, and PostgreSQL.

## Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Admin, Dealer)
  - Secure password hashing with bcrypt
  - Temporary password management

- **Admin Functionality**
  - Create, read, update, delete dealer accounts
  - View all audit logs
  - Manage dealer status (active/suspended)

- **Dealer Functionality**
  - Manage employees (CRUD operations)
  - Manage customers (CRUD operations)
  - Employee termination with reason tracking
  - Universal search across employees and customers
  - View dealer profile

- **Security Features**
  - Helmet.js for security headers
  - Rate limiting
  - CORS configuration
  - Input validation with express-validator
  - SQL injection prevention with parameterized queries

- **Logging & Monitoring**
  - Winston logger for structured logging
  - Morgan for HTTP request logging
  - Comprehensive audit trail

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 16 (Neon DB compatible)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Validation**: express-validator
- **Logging**: Winston, Morgan
- **Security**: Helmet, CORS, express-rate-limit
- **Containerization**: Docker & Docker Compose

## Prerequisites

- Node.js 20 or higher
- PostgreSQL 16 or higher (or Neon DB account)
- npm or yarn
- Docker (optional, for containerized deployment)

## Database Options

This backend supports two database configurations:

1. **Neon DB** (Recommended for production) - Serverless PostgreSQL
   - See [NEON_SETUP.md](./NEON_SETUP.md) for detailed setup
   - No local database installation required
   - Automatic SSL and backups
   - Scalable and managed

2. **Local PostgreSQL** - Traditional PostgreSQL installation
   - Good for local development
   - Full control over database

## Installation

### Local Development Setup

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration values.

4. **Set up Database**

   **Option A: Neon DB (Recommended)**
   ```bash
   # See NEON_SETUP.md for detailed instructions
   # Add your Neon connection string to .env:
   DATABASE_URL=postgresql://user:password@your-host.neon.tech/kashmir_oil_union?sslmode=require
   
   # Then run schema via psql or Neon SQL Editor
   psql "your-neon-connection-string" < database/schema.sql
   psql "your-neon-connection-string" < database/seed.sql
   ```

   **Option B: Local PostgreSQL**
   ```bash
   createdb kashmir_oil_union
   psql kashmir_oil_union < database/schema.sql
   psql kashmir_oil_union < database/seed.sql
   ```

5. **Run in development mode**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   npm start
   ```

### Docker Setup

1. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with production values.

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **View logs**
   ```bash
   docker-compose logs -f api
   ```

4. **Stop services**
   ```bash
   docker-compose down
   ```

## API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Endpoints

#### Admin Login
```http
POST /api/v1/auth/admin/login
Content-Type: application/json

{
  "email": "admin@kashmiroil.com",
  "password": "admin123"
}
```

#### Dealer Login
```http
POST /api/v1/auth/dealer/login
Content-Type: application/json

{
  "email": "dealer@example.com",
  "password": "password123"
}
```

#### Change Password
```http
POST /api/v1/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpass",
  "newPassword": "newpass123"
}
```

#### Get Current User
```http
GET /api/v1/auth/me
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/v1/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Name",
  "username": "newusername"
}
```

### Admin Endpoints

All admin endpoints require admin authentication.

#### Get All Dealers
```http
GET /api/v1/admin/dealers
Authorization: Bearer <admin-token>
```

#### Get Dealer by ID
```http
GET /api/v1/admin/dealers/:id
Authorization: Bearer <admin-token>
```

#### Create Dealer
```http
POST /api/v1/admin/dealers
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@dealer.com",
  "company_name": "Doe Petroleum",
  "primary_contact_name": "John Doe",
  "primary_contact_phone": "+91-9876543210",
  "primary_contact_email": "john@dealer.com",
  "address": "123 Main St, City"
}
```

#### Update Dealer
```http
PUT /api/v1/admin/dealers/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "company_name": "Updated Company Name",
  "status": "suspended"
}
```

#### Delete Dealer
```http
DELETE /api/v1/admin/dealers/:id
Authorization: Bearer <admin-token>
```

#### Get Audit Logs
```http
GET /api/v1/admin/audit-logs?limit=100
Authorization: Bearer <admin-token>
```

### Dealer Endpoints

All dealer endpoints require dealer authentication.

#### Get Dealer Profile
```http
GET /api/v1/dealer/profile
Authorization: Bearer <dealer-token>
```

#### Get All Employees
```http
GET /api/v1/dealer/employees
Authorization: Bearer <dealer-token>
```

#### Create Employee
```http
POST /api/v1/dealer/employees
Authorization: Bearer <dealer-token>
Content-Type: application/json

{
  "first_name": "Jane",
  "last_name": "Smith",
  "phone": "+91-9876543211",
  "email": "jane@example.com",
  "aadhar": "123456789012",
  "position": "Sales Executive",
  "hire_date": "2024-01-15"
}
```

#### Update Employee
```http
PUT /api/v1/dealer/employees/:id
Authorization: Bearer <dealer-token>
Content-Type: application/json

{
  "first_name": "Jane",
  "last_name": "Doe",
  "position": "Senior Sales Executive"
}
```

#### Terminate Employee
```http
POST /api/v1/dealer/employees/:id/terminate
Authorization: Bearer <dealer-token>
Content-Type: application/json

{
  "termination_date": "2024-12-31",
  "termination_reason": "Resignation"
}
```

#### Get All Customers
```http
GET /api/v1/dealer/customers
Authorization: Bearer <dealer-token>
```

#### Create Customer
```http
POST /api/v1/dealer/customers
Authorization: Bearer <dealer-token>
Content-Type: application/json

{
  "type": "government",
  "name_or_entity": "Municipal Corporation",
  "contact_person": "John Manager",
  "phone": "+91-9876543212",
  "email": "contact@municipal.gov",
  "official_id": "GST123456789",
  "address": "Government Complex, City"
}
```

#### Update Customer
```http
PUT /api/v1/dealer/customers/:id
Authorization: Bearer <dealer-token>
Content-Type: application/json

{
  "name_or_entity": "Updated Corporation Name",
  "status": "inactive"
}
```

#### Universal Search
```http
GET /api/v1/dealer/search?query=john
Authorization: Bearer <dealer-token>
```

### Health Check
```http
GET /api/v1/health
```

## Database Schema

### Tables

- **users** - User accounts (admin and dealer)
- **dealers** - Dealer company information
- **employees** - Employee records
- **customers** - Customer records
- **audit_logs** - System audit trail

See `database/schema.sql` for complete schema definition.

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm test` - Run tests (to be implemented)

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   ├── app.ts          # Express app setup
│   └── server.ts       # Server entry point
├── database/           # SQL schemas and seeds
├── logs/              # Application logs
├── .env.example       # Environment variables template
├── Dockerfile         # Docker image definition
├── docker-compose.yml # Docker services configuration
├── package.json       # Dependencies and scripts
└── tsconfig.json      # TypeScript configuration
```

## Security Considerations

1. **Always change default passwords** in production
2. **Use strong JWT secrets** (at least 32 characters)
3. **Enable HTTPS** in production
4. **Regularly update dependencies** for security patches
5. **Configure proper CORS origins** for your frontend
6. **Use environment variables** for sensitive data
7. **Implement proper backup strategies** for the database

## Default Credentials (Seed Data)

**Admin:**
- Email: admin@kashmiroil.com
- Password: admin123

**Sample Dealer:**
- Email: dealer@kashmirpetroleum.com
- Password: dealer123

**⚠️ IMPORTANT:** Change these credentials immediately in production!

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify database exists: `psql -l`

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process or change PORT in .env
```

### Docker Issues
```bash
# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# View logs
docker-compose logs -f
```

## Contributing

1. Follow TypeScript best practices
2. Write meaningful commit messages
3. Add tests for new features
4. Update documentation as needed

## License

ISC

## Support

For issues and questions, please open an issue in the repository.
