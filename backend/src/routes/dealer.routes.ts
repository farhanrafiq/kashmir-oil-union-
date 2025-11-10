import { Router } from 'express';
import { body, query } from 'express-validator';
import { dealerController } from '../controllers/dealer.controller';
import { universalController } from '../controllers/universal.controller';
import { authenticate, authorizeRole } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { UserRole } from '../types';

const router = Router();

// Dealer-specific routes (require dealer authentication)
router.get(
  '/profile',
  authenticate,
  authorizeRole(UserRole.DEALER),
  dealerController.getProfile,
);

router.get(
  '/audit-logs',
  authenticate,
  authorizeRole(UserRole.DEALER),
  dealerController.getDealerAuditLogs,
);

// Check Aadhar - Available to all authenticated users (will be mounted at /employees/check-aadhar)
router.get(
  '/check-aadhar',
  authenticate,
  [query('aadhar').notEmpty().withMessage('Aadhar number is required'), validate],
  universalController.checkAadhar,
);

// Employee routes (require dealer authentication)
router.get(
  '/',
  authenticate,
  authorizeRole(UserRole.DEALER),
  dealerController.getEmployees,
);

router.post(
  '/',
  authenticate,
  authorizeRole(UserRole.DEALER),
  [
    body('first_name').notEmpty().withMessage('First name is required'),
    body('last_name').notEmpty().withMessage('Last name is required'),
    body('phone').notEmpty().withMessage('Phone is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('aadhar')
      .isLength({ min: 12, max: 12 })
      .withMessage('Aadhar must be 12 digits'),
    body('position').notEmpty().withMessage('Position is required'),
    body('hire_date').isISO8601().withMessage('Valid hire date is required'),
    validate,
  ],
  dealerController.createEmployee,
);

router.patch(
  '/:employeeId',
  authenticate,
  authorizeRole(UserRole.DEALER),
  [
    body('first_name').optional().notEmpty().withMessage('First name cannot be empty'),
    body('last_name').optional().notEmpty().withMessage('Last name cannot be empty'),
    body('phone').optional().notEmpty().withMessage('Phone cannot be empty'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('position').optional().notEmpty().withMessage('Position cannot be empty'),
    validate,
  ],
  dealerController.updateEmployee,
);

router.post(
  '/:employeeId/terminate',
  authenticate,
  authorizeRole(UserRole.DEALER),
  [
    body('termination_date').isISO8601().withMessage('Valid termination date is required'),
    body('termination_reason').notEmpty().withMessage('Termination reason is required'),
    validate,
  ],
  dealerController.terminateEmployee,
);

// Customer routes
router.get(
  '/',
  authenticate,
  authorizeRole(UserRole.DEALER),
  dealerController.getCustomers,
);

router.post(
  '/',
  authenticate,
  authorizeRole(UserRole.DEALER),
  [
    body('type')
      .isIn(['private', 'government'])
      .withMessage('Type must be private or government'),
    body('name_or_entity').notEmpty().withMessage('Name or entity is required'),
    body('phone').notEmpty().withMessage('Phone is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('official_id').notEmpty().withMessage('Official ID is required'),
    body('address').notEmpty().withMessage('Address is required'),
    validate,
  ],
  dealerController.createCustomer,
);

router.patch(
  '/:customerId',
  authenticate,
  authorizeRole(UserRole.DEALER),
  [
    body('type')
      .optional()
      .isIn(['private', 'government'])
      .withMessage('Type must be private or government'),
    body('name_or_entity').optional().notEmpty().withMessage('Name or entity cannot be empty'),
    body('phone').optional().notEmpty().withMessage('Phone cannot be empty'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('official_id').optional().notEmpty().withMessage('Official ID cannot be empty'),
    body('address').optional().notEmpty().withMessage('Address cannot be empty'),
    body('status')
      .optional()
      .isIn(['active', 'inactive'])
      .withMessage('Status must be active or inactive'),
    validate,
  ],
  dealerController.updateCustomer,
);

export default router;
