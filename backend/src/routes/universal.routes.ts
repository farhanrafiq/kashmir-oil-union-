import { Router } from 'express';
import { query } from 'express-validator';
import { universalController } from '../controllers/universal.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validator';

const router = Router();

// Universal Search - accessible to all authenticated users
// GET /api/v1/search?q=<query>
router.get(
  '/search',
  authenticate,
  [query('q').notEmpty().withMessage('Search query is required'), validate],
  universalController.universalSearch,
);

export default router;
