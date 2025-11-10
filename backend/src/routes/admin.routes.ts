import { Router } from 'express';
import { body } from 'express-validator';
import { adminController } from '../controllers/admin.controller';
import { authenticate, authorizeRole } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { UserRole } from '../types';

const router = Router();

// All routes require admin authentication
router.use(authenticate);
router.use(authorizeRole(UserRole.ADMIN));

// Get all dealers (admin route at /dealers)
router.get('/', adminController.getAllDealers);

// Get dealer by ID
router.get('/:dealerId', adminController.getDealerById);

// Create new dealer
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('company_name').notEmpty().withMessage('Company name is required'),
    body('primary_contact_name').notEmpty().withMessage('Primary contact name is required'),
    body('primary_contact_phone').notEmpty().withMessage('Primary contact phone is required'),
    body('primary_contact_email')
      .isEmail()
      .withMessage('Valid primary contact email is required'),
    body('address').notEmpty().withMessage('Address is required'),
    validate,
  ],
  adminController.createDealer,
);

// Update dealer
router.patch(
  '/:dealerId',
  [
    body('company_name').optional().notEmpty().withMessage('Company name cannot be empty'),
    body('primary_contact_name')
      .optional()
      .notEmpty()
      .withMessage('Primary contact name cannot be empty'),
    body('primary_contact_phone')
      .optional()
      .notEmpty()
      .withMessage('Primary contact phone cannot be empty'),
    body('primary_contact_email')
      .optional()
      .isEmail()
      .withMessage('Valid primary contact email is required'),
    body('address').optional().notEmpty().withMessage('Address cannot be empty'),
    body('status')
      .optional()
      .isIn(['active', 'suspended'])
      .withMessage('Status must be active or suspended'),
    validate,
  ],
  adminController.updateDealer,
);

// Delete dealer
router.delete('/:dealerId', adminController.deleteDealer);

// Reset dealer password (admin route at /dealers/reset-password)
router.post(
  '/reset-password',
  [body('userId').notEmpty().withMessage('User ID is required'), validate],
  adminController.resetDealerPassword,
);

// Get audit logs (admin route at /admin/audit-logs)
router.get('/audit-logs', adminController.getAuditLogs);

export default router;
