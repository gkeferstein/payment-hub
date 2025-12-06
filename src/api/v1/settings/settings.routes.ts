/**
 * Settings Routes
 * Configuration endpoints for Shadow Mode and Channels
 */

import { Router } from 'express';
import { settingsController } from './settings.controller';
import { authenticateApiKey } from '../../middleware';

const router = Router();

// All routes require authentication
router.use(authenticateApiKey);

// GET /api/v1/settings - Get all settings
router.get('/', (req, res) => settingsController.getSettings(req, res));

// GET /api/v1/settings/channels - Get all channel configurations
router.get('/channels', (req, res) => settingsController.getChannelConfigs(req, res));

// PUT /api/v1/settings/channels/:channel - Update channel configuration
router.put('/channels/:channel', (req, res) => settingsController.updateChannelConfig(req, res));

// GET /api/v1/settings/plugins/:channel/download - Download plugin for channel
router.get('/plugins/:channel/download', (req, res) => settingsController.downloadPlugin(req, res));

export default router;

