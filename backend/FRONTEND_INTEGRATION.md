# Frontend Integration Guide

## Overview

This guide explains how to integrate your React frontend with the Kashmir Oil Union backend API.

## Backend API Configuration

The backend API is available at:
- **Development**: `http://localhost:5000/api/v1`
- **Production**: `https://api.yourdomain.com/api/v1`

## Frontend Setup

### 1. Install Axios (or fetch alternative)

```bash
cd .. # Go back to root project
npm install axios
```

### 2. Create API Service

Update your `services/api.ts` file to use the real backend:

```typescript
import axios, { AxiosInstance } from 'axios';
import { User, Dealer, Employee, Customer, AuditLog } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

class ApiService {
  private api: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include token
    this.api.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.clearToken();
          window.location.href = '/';
        }
        return Promise.reject(error);
      }
    );

    // Load token from localStorage
    this.token = localStorage.getItem('authToken');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  // Auth APIs
  async adminLogin(email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await this.api.post('/auth/admin/login', { email, password });
    const { user, token } = response.data.data;
    this.setToken(token);
    return { user, token };
  }

  async dealerLogin(email: string, password: string): Promise<{ user: User; token: string; requiresPasswordChange?: boolean }> {
    const response = await this.api.post('/auth/dealer/login', { email, password });
    const { user, token, requiresPasswordChange } = response.data.data;
    this.setToken(token);
    return { user, token, requiresPasswordChange };
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<User> {
    const response = await this.api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data.data.user;
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.api.get('/auth/me');
    return response.data.data.user;
  }

  async updateProfile(name: string, username: string): Promise<User> {
    const response = await this.api.put('/auth/profile', { name, username });
    return response.data.data.user;
  }

  async logout(): Promise<void> {
    this.clearToken();
  }

  // Admin APIs
  async getDealers(): Promise<Dealer[]> {
    const response = await this.api.get('/admin/dealers');
    return response.data.data.dealers;
  }

  async getDealerById(id: string): Promise<Dealer> {
    const response = await this.api.get(`/admin/dealers/${id}`);
    return response.data.data.dealer;
  }

  async createDealer(dealerData: any): Promise<{ dealer: Dealer; tempPassword: string }> {
    const response = await this.api.post('/admin/dealers', dealerData);
    return response.data.data;
  }

  async updateDealer(id: string, updates: Partial<Dealer>): Promise<Dealer> {
    const response = await this.api.put(`/admin/dealers/${id}`, updates);
    return response.data.data.dealer;
  }

  async deleteDealer(id: string): Promise<void> {
    await this.api.delete(`/admin/dealers/${id}`);
  }

  async getAuditLogs(limit: number = 100): Promise<AuditLog[]> {
    const response = await this.api.get('/admin/audit-logs', { params: { limit } });
    return response.data.data.logs;
  }

  // Dealer APIs
  async getDealerProfile(): Promise<Dealer> {
    const response = await this.api.get('/dealer/profile');
    return response.data.data.dealer;
  }

  async getEmployees(): Promise<Employee[]> {
    const response = await this.api.get('/dealer/employees');
    return response.data.data.employees;
  }

  async createEmployee(employeeData: any): Promise<Employee> {
    const response = await this.api.post('/dealer/employees', employeeData);
    return response.data.data.employee;
  }

  async updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee> {
    const response = await this.api.put(`/dealer/employees/${id}`, updates);
    return response.data.data.employee;
  }

  async terminateEmployee(id: string, terminationDate: string, terminationReason: string): Promise<Employee> {
    const response = await this.api.post(`/dealer/employees/${id}/terminate`, {
      termination_date: terminationDate,
      termination_reason: terminationReason,
    });
    return response.data.data.employee;
  }

  async getCustomers(): Promise<Customer[]> {
    const response = await this.api.get('/dealer/customers');
    return response.data.data.customers;
  }

  async createCustomer(customerData: any): Promise<Customer> {
    const response = await this.api.post('/dealer/customers', customerData);
    return response.data.data.customer;
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
    const response = await this.api.put(`/dealer/customers/${id}`, updates);
    return response.data.data.customer;
  }

  async universalSearch(query: string): Promise<{ employees: any[]; customers: any[]; totalResults: number }> {
    const response = await this.api.get('/dealer/search', { params: { query } });
    return response.data.data;
  }
}

export const api = new ApiService();
```

### 3. Environment Variables

Create `.env` in your frontend root:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

For production:
```env
VITE_API_URL=https://api.yourdomain.com/api/v1
```

### 4. Update AuthContext

Update `context/AuthContext.tsx` to use real API:

```typescript
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, isAdmin: boolean) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuth = async () => {
      try {
        const currentUser = await api.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        // Not logged in
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string, isAdmin: boolean) => {
    try {
      const result = isAdmin 
        ? await api.adminLogin(email, password)
        : await api.dealerLogin(email, password);
      
      setUser(result.user);
      
      // Check if password change is required
      if ('requiresPasswordChange' in result && result.requiresPasswordChange) {
        // Handle force password change
        // You can add a state or navigation logic here
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 5. Update Components to Use Real API

Example for AdminDashboard:

```typescript
import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Dealer } from '../../types';

const AdminDashboard: React.FC = () => {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDealers();
  }, []);

  const loadDealers = async () => {
    try {
      setLoading(true);
      const data = await api.getDealers();
      setDealers(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load dealers');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDealer = async (dealerData: any) => {
    try {
      const result = await api.createDealer(dealerData);
      alert(`Dealer created! Temporary password: ${result.tempPassword}`);
      loadDealers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create dealer');
    }
  };

  // ... rest of component
};
```

## Error Handling

Add global error handling:

```typescript
// utils/errorHandler.ts
export const handleApiError = (error: any): string => {
  if (error.response) {
    // Server responded with error
    return error.response.data.error || 'An error occurred';
  } else if (error.request) {
    // Request made but no response
    return 'Server not responding. Please try again.';
  } else {
    // Something else happened
    return error.message || 'An unexpected error occurred';
  }
};
```

## CORS Configuration

Ensure your backend `.env` has the correct CORS origin:

```env
CORS_ORIGIN=http://localhost:5173,http://localhost:3000,https://yourdomain.com
```

## Testing the Integration

1. **Start Backend**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend**:
   ```bash
   cd ..  # back to root
   npm run dev
   ```

3. **Test Login**:
   - Admin: `admin@kashmiroil.com` / `admin123`
   - Dealer: `dealer@kashmirpetroleum.com` / `dealer123`

## Common Issues

### 1. CORS Errors
**Problem**: Browser blocks requests
**Solution**: Add your frontend URL to backend CORS_ORIGIN

### 2. 401 Unauthorized
**Problem**: Token expired or invalid
**Solution**: Implement token refresh or force re-login

### 3. Network Error
**Problem**: Backend not running
**Solution**: Ensure backend is running on port 5000

### 4. 404 Not Found
**Problem**: Wrong API endpoint
**Solution**: Check API_BASE_URL and endpoint paths

## Production Deployment

### Frontend Build

```bash
# Build frontend
npm run build

# Preview production build
npm run preview
```

### Environment Variables for Production

Update `.env.production`:
```env
VITE_API_URL=https://api.yourdomain.com/api/v1
```

## Security Best Practices

1. **Never commit .env files** - Add to .gitignore
2. **Use HTTPS in production** - Required for secure tokens
3. **Implement token refresh** - For better UX
4. **Handle token expiration** - Auto-logout on 401
5. **Validate user input** - Both frontend and backend
6. **Sanitize data** - Prevent XSS attacks

## API Response Caching (Optional)

For better performance, implement caching:

```typescript
// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const cachedRequest = async (key: string, fetcher: () => Promise<any>) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  const data = await fetcher();
  cache.set(key, { data, timestamp: Date.now() });
  return data;
};
```

## Next Steps

1. Replace all mock data imports with real API calls
2. Add loading states and error handling to all components
3. Implement proper form validation
4. Add confirmation dialogs for destructive actions
5. Implement search debouncing for better performance
6. Add pagination for large data sets
7. Implement real-time updates (optional: WebSockets)

## Support

For integration issues:
1. Check browser console for errors
2. Check network tab for API calls
3. Check backend logs
4. Verify environment variables
