# Kashmir Oil Union API - Quick Reference

## Base URL
```
http://localhost:5000/api/v1
```

## Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error message",
  "details": [ ... ]  // Optional validation errors
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid or missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Authentication

Most endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints Summary

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /auth/admin/login | No | Admin login |
| POST | /auth/dealer/login | No | Dealer login |
| POST | /auth/change-password | Yes | Change password |
| GET | /auth/me | Yes | Get current user |
| PUT | /auth/profile | Yes | Update profile |

### Admin Operations
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /admin/dealers | Admin | List all dealers |
| GET | /admin/dealers/:id | Admin | Get dealer details |
| POST | /admin/dealers | Admin | Create new dealer |
| PUT | /admin/dealers/:id | Admin | Update dealer |
| DELETE | /admin/dealers/:id | Admin | Delete dealer |
| GET | /admin/audit-logs | Admin | Get audit logs |

### Dealer Operations
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /dealer/profile | Dealer | Get own profile |
| GET | /dealer/employees | Dealer | List employees |
| POST | /dealer/employees | Dealer | Create employee |
| PUT | /dealer/employees/:id | Dealer | Update employee |
| POST | /dealer/employees/:id/terminate | Dealer | Terminate employee |
| GET | /dealer/customers | Dealer | List customers |
| POST | /dealer/customers | Dealer | Create customer |
| PUT | /dealer/customers/:id | Dealer | Update customer |
| GET | /dealer/search?query=... | Dealer | Universal search |

### System
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | / | No | API welcome message |
| GET | /health | No | Health check |

## Example Requests

### Login and Get Token

```bash
# Admin Login
curl -X POST http://localhost:5000/api/v1/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kashmiroil.com","password":"admin123"}'

# Save the token from response
export TOKEN="your-token-here"
```

### Create a New Dealer (Admin)

```bash
curl -X POST http://localhost:5000/api/v1/admin/dealers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Dealer",
    "username": "jdealer",
    "email": "john@dealer.com",
    "company_name": "John Petroleum",
    "primary_contact_name": "John Doe",
    "primary_contact_phone": "+91-9876543210",
    "primary_contact_email": "john@dealer.com",
    "address": "123 Street, City"
  }'
```

### Create Employee (Dealer)

```bash
curl -X POST http://localhost:5000/api/v1/dealer/employees \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Jane",
    "last_name": "Smith",
    "phone": "+91-9876543211",
    "email": "jane@example.com",
    "aadhar": "123456789012",
    "position": "Sales Manager",
    "hire_date": "2024-01-15"
  }'
```

### Search (Dealer)

```bash
curl -X GET "http://localhost:5000/api/v1/dealer/search?query=john" \
  -H "Authorization: Bearer $TOKEN"
```

## Rate Limiting

- **Window**: 15 minutes (900,000 ms)
- **Max Requests**: 100 per window per IP

When rate limit is exceeded:
```json
{
  "success": false,
  "error": "Too many requests from this IP, please try again later."
}
```

## Validation Rules

### User
- `email`: Valid email format
- `password`: Minimum 6 characters
- `username`: Required, non-empty
- `name`: Required, non-empty

### Dealer
- `company_name`: Required
- `primary_contact_phone`: Required
- `primary_contact_email`: Valid email
- `address`: Required
- `status`: Must be 'active' or 'suspended'

### Employee
- `first_name`, `last_name`: Required
- `email`: Valid email format
- `aadhar`: Exactly 12 digits
- `phone`: Required
- `hire_date`: ISO 8601 date format

### Customer
- `type`: Must be 'private' or 'government'
- `name_or_entity`: Required
- `email`: Valid email format
- `official_id`: Required (GST/PAN/etc)
- `status`: Must be 'active' or 'inactive'

## Audit Log Actions

The system tracks the following actions:
- `login` - User login
- `reset_password` - Password reset
- `change_password` - Password change
- `create_dealer` - Dealer creation
- `update_dealer` - Dealer update
- `delete_dealer` - Dealer deletion
- `search` - Search operation
- `create_employee` - Employee creation
- `update_employee` - Employee update
- `terminate_employee` - Employee termination
- `create_customer` - Customer creation
- `update_customer` - Customer update
- `update_profile` - Profile update

## Testing with Postman

1. Import the API endpoints into Postman
2. Create an environment with:
   - `baseUrl`: http://localhost:5000/api/v1
   - `token`: (will be set after login)
3. Use the login endpoint and save the token
4. Add `{{token}}` to Authorization header for protected routes

## Error Handling

Common errors and solutions:

| Error | Solution |
|-------|----------|
| "No token provided" | Add Authorization header |
| "Invalid or expired token" | Login again to get new token |
| "Forbidden: Insufficient permissions" | Use correct role (admin/dealer) |
| "Validation failed" | Check request body against validation rules |
| "Email already exists" | Use different email |
| "Username already taken" | Use different username |
