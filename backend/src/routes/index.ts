import { Router } from 'express';
import authRoutes from './auth.routes';
import adminRoutes from './admin.routes';
import dealerRoutes from './dealer.routes';
import userRoutes from './user.routes';
import universalRoutes from './universal.routes';

const router = Router();

// Mount route modules
// Authentication routes: /auth/*
router.use('/auth', authRoutes);

// User management routes: /users/*
router.use('/users', userRoutes);

// Admin routes: /dealers/* (for dealer CRUD)
router.use('/dealers', adminRoutes);

// Admin routes: /admin/* (for admin-specific like audit logs)
router.use('/admin', adminRoutes);

// Dealer routes: /employees/* and /customers/*
router.use('/employees', dealerRoutes);
router.use('/customers', dealerRoutes);

// Dealer routes: /dealer/* (for dealer-specific like audit logs)
router.use('/dealer', dealerRoutes);

// Universal routes: /search and /check-aadhar
router.use('/', universalRoutes);

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Kashmir Oil Union API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
