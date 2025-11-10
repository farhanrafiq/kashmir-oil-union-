import { Router } from 'express';
import { body } from 'express-validator';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validator';

const router = Router();

// Admin Login
router.post(
  '/admin/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate,
  ],
  authController.adminLogin,
);

// Dealer Login
router.post(
  '/dealer/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate,
  ],
  authController.dealerLogin,
);

// Forgot Password
router.post(
  '/forgot-password',
  [body('email').isEmail().withMessage('Valid email is required'), validate],
  authController.forgotPassword,
);

// Logout
router.post('/logout', authenticate, authController.logout);

// Get Current User Profile
router.get('/me', authenticate, authController.getCurrentUser);

// Update Profile
router.put(
  '/profile',
  authenticate,
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('username').optional().notEmpty().withMessage('Username cannot be empty'),
    validate,
  ],
  authController.updateProfile,
);

export default router;
