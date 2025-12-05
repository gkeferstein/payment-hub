/**
 * Providers Routes
 * Defines routes for provider management endpoints
 */

import { Router } from 'express';
import { providersController } from './providers.controller';
import {
  authenticateApiKey,
  apiRateLimiter,
} from '../../middleware';

const router = Router();

// All routes require authentication
// TODO: Add admin-only middleware for provider management
router.use(authenticateApiKey);

// GET /api/v1/providers - Get all providers
router.get('/', apiRateLimiter, (req, res) =>
  providersController.getAllProviders(req, res)
);

// GET /api/v1/providers/:id - Get provider by ID
router.get('/:id', apiRateLimiter, (req, res) =>
  providersController.getProviderById(req, res)
);

// POST /api/v1/providers - Create provider
router.post('/', apiRateLimiter, (req, res) =>
  providersController.createProvider(req, res)
);

// PUT /api/v1/providers/:id - Update provider
router.put('/:id', apiRateLimiter, (req, res) =>
  providersController.updateProvider(req, res)
);

// DELETE /api/v1/providers/:id - Delete provider
router.delete('/:id', apiRateLimiter, (req, res) =>
  providersController.deleteProvider(req, res)
);

// POST /api/v1/providers/:id/test - Test provider connection
router.post('/:id/test', apiRateLimiter, (req, res) =>
  providersController.testProvider(req, res)
);

export default router;

