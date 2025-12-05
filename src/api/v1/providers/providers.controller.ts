/**
 * Providers Controller
 */

import { Request, Response } from 'express';
import { providerService } from '../../../domains/provider/services';
import { CreateProviderInput, UpdateProviderInput } from '../../../domains/provider/models';

export class ProvidersController {
  async getAllProviders(req: Request, res: Response): Promise<void> {
    try {
      const includeDisabled = req.query.include_disabled !== 'false';
      const providers = await providerService.getAllProviders(includeDisabled);
      res.status(200).json({ success: true, data: providers });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: 'Failed to get providers', code: 'PROVIDERS_GET_FAILED' } });
    }
  }

  async getProviderById(req: Request, res: Response): Promise<void> {
    try {
      const provider = await providerService.getProviderById(req.params.id);
      if (!provider) {
        res.status(404).json({ success: false, error: { message: 'Provider not found', code: 'PROVIDER_NOT_FOUND' } });
        return;
      }
      res.status(200).json({ success: true, data: provider });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: 'Failed to get provider', code: 'PROVIDER_GET_FAILED' } });
    }
  }

  async createProvider(req: Request, res: Response): Promise<void> {
    try {
      const input: CreateProviderInput = req.body;
      if (!input.provider || !input.name) {
        res.status(400).json({ success: false, error: { message: 'Missing required fields', code: 'VALIDATION_ERROR' } });
        return;
      }
      const provider = await providerService.createProvider(input);
      res.status(201).json({ success: true, data: provider });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { message: error.message, code: 'PROVIDER_CREATION_FAILED' } });
    }
  }

  async updateProvider(req: Request, res: Response): Promise<void> {
    try {
      const input: UpdateProviderInput = req.body;
      const provider = await providerService.updateProvider(req.params.id, input);
      res.status(200).json({ success: true, data: provider });
    } catch (error: any) {
      const statusCode = error.message === 'Provider not found' ? 404 : 400;
      res.status(statusCode).json({ success: false, error: { message: error.message, code: 'PROVIDER_UPDATE_FAILED' } });
    }
  }

  async deleteProvider(req: Request, res: Response): Promise<void> {
    try {
      const deleted = await providerService.deleteProvider(req.params.id);
      if (!deleted) {
        res.status(404).json({ success: false, error: { message: 'Provider not found', code: 'PROVIDER_NOT_FOUND' } });
        return;
      }
      res.status(200).json({ success: true, message: 'Provider deleted' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: 'Failed to delete provider', code: 'PROVIDER_DELETE_FAILED' } });
    }
  }

  async testProvider(req: Request, res: Response): Promise<void> {
    try {
      const result = await providerService.testProviderConnection(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      const statusCode = error.message === 'Provider not found' ? 404 : 500;
      res.status(statusCode).json({ success: false, error: { message: error.message, code: 'PROVIDER_TEST_FAILED' } });
    }
  }
}

export const providersController = new ProvidersController();
