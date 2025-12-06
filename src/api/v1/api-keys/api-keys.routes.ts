/**
 * API Keys Routes
 * Endpoints for API key management
 */

import { Router } from 'express';
import { apiKeysController } from './api-keys.controller';
import { authenticateApiKey } from '../../middleware';

const router = Router();

// All routes require authentication
router.use(authenticateApiKey);

// POST /api/v1/api-keys - Create new API key
router.post('/', (req, res) => apiKeysController.create(req, res));

// GET /api/v1/api-keys - List all API keys
router.get('/', (req, res) => apiKeysController.list(req, res));

// DELETE /api/v1/api-keys/:id - Deactivate API key
router.delete('/:id', (req, res) => apiKeysController.deactivate(req, res));

// DELETE /api/v1/api-keys/:id/delete - Permanently delete API key
router.delete('/:id/delete', (req, res) => apiKeysController.delete(req, res));

export default router;

