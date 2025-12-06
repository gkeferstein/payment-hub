/**
 * API Keys Controller
 * Handles API key management endpoints
 */

import { Request, Response } from 'express';
import { ApiKeyService } from '../../../infrastructure/auth/api-key.service';

export class ApiKeysController {
  private service: ApiKeyService;

  constructor() {
    this.service = new ApiKeyService();
  }

  /**
   * POST /api/v1/api-keys
   * Create a new API key
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, description, channel, expires_at } = req.body;

      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Name is required',
            code: 'VALIDATION_ERROR',
          },
        });
        return;
      }

      const result = await this.service.create({
        name: name.trim(),
        description: description?.trim(),
        channel: channel?.trim(),
        expires_at: expires_at ? new Date(expires_at) : undefined,
      });

      res.status(201).json({
        success: true,
        message: 'API key created successfully. Save this key - it will not be shown again!',
        data: {
          id: result.record.id,
          api_key: result.apiKey, // Only shown once!
          key_prefix: result.record.key_prefix,
          name: result.record.name,
          description: result.record.description,
          channel: result.record.channel,
          created_at: result.record.created_at,
        },
      });
    } catch (error: any) {
      console.error('Error creating API key:', error);
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Error creating API key',
          code: 'API_KEY_CREATE_ERROR',
        },
      });
    }
  }

  /**
   * GET /api/v1/api-keys
   * List all API keys (without actual keys)
   */
  async list(_req: Request, res: Response): Promise<void> {
    try {
      const keys = await this.service.list();

      res.status(200).json({
        success: true,
        data: keys,
      });
    } catch (error: any) {
      console.error('Error listing API keys:', error);
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Error listing API keys',
          code: 'API_KEY_LIST_ERROR',
        },
      });
    }
  }

  /**
   * DELETE /api/v1/api-keys/:id
   * Deactivate an API key
   */
  async deactivate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await this.service.deactivate(id);

      res.status(200).json({
        success: true,
        message: 'API key deactivated successfully',
      });
    } catch (error: any) {
      console.error('Error deactivating API key:', error);
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Error deactivating API key',
          code: 'API_KEY_DEACTIVATE_ERROR',
        },
      });
    }
  }

  /**
   * DELETE /api/v1/api-keys/:id/delete
   * Permanently delete an API key
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await this.service.delete(id);

      res.status(200).json({
        success: true,
        message: 'API key deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting API key:', error);
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Error deleting API key',
          code: 'API_KEY_DELETE_ERROR',
        },
      });
    }
  }
}

export const apiKeysController = new ApiKeysController();

