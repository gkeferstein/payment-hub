/**
 * Provider Service
 * Business logic for payment provider management
 */

import { providerRepository } from '../repositories';
import { Provider, CreateProviderInput, UpdateProviderInput, ProviderTestResult, ProviderType, ProviderTestStatus } from '../models';
import crypto from 'crypto';

export class ProviderService {
  async getAllProviders(includeDisabled: boolean = true): Promise<Provider[]> {
    const providers = await providerRepository.findAll(includeDisabled);
    return providers.map(p => this.sanitizeProvider(p));
  }

  async getProviderById(id: string): Promise<Provider | null> {
    const provider = await providerRepository.findById(id);
    return provider ? this.sanitizeProvider(provider) : null;
  }

  async createProvider(input: CreateProviderInput): Promise<Provider> {
    const existing = await providerRepository.findByTypeAndName(input.provider, input.name);
    if (existing) {
      throw new Error(`Provider with name '${input.name}' already exists`);
    }

    const encrypted: CreateProviderInput = {
      ...input,
      api_key: input.api_key ? this.encrypt(input.api_key) : undefined,
      api_secret: input.api_secret ? this.encrypt(input.api_secret) : undefined,
      webhook_secret: input.webhook_secret ? this.encrypt(input.webhook_secret) : undefined,
    };

    const provider = await providerRepository.create(encrypted);
    return this.sanitizeProvider(provider);
  }

  async updateProvider(id: string, input: UpdateProviderInput): Promise<Provider> {
    const existing = await providerRepository.findById(id);
    if (!existing) {
      throw new Error('Provider not found');
    }

    const encrypted: UpdateProviderInput = { ...input };
    if (input.api_key) encrypted.api_key = this.encrypt(input.api_key);
    if (input.api_secret) encrypted.api_secret = this.encrypt(input.api_secret);
    if (input.webhook_secret) encrypted.webhook_secret = this.encrypt(input.webhook_secret);

    const updated = await providerRepository.update(id, encrypted);
    if (!updated) {
      throw new Error('Failed to update provider');
    }
    return this.sanitizeProvider(updated);
  }

  async deleteProvider(id: string): Promise<boolean> {
    return providerRepository.softDelete(id);
  }

  async testProviderConnection(id: string): Promise<ProviderTestResult> {
    const provider = await providerRepository.findById(id);
    if (!provider) {
      throw new Error('Provider not found');
    }

    try {
      let result: ProviderTestResult;
      if (provider.provider === ProviderType.STRIPE) {
        result = await this.testStripeConnection(provider);
      } else if (provider.provider === ProviderType.BTCPAY) {
        result = await this.testBTCPayConnection(provider);
      } else {
        throw new Error(`Unknown provider type: ${provider.provider}`);
      }

      await providerRepository.updateTestStatus(
        id,
        result.success ? ProviderTestStatus.SUCCESS : ProviderTestStatus.FAILED,
        result.message
      );
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Test failed';
      const errorResult: ProviderTestResult = {
        success: false,
        message: errorMsg,
        tested_at: new Date(),
      };
      await providerRepository.updateTestStatus(id, ProviderTestStatus.FAILED, errorResult.message);
      return errorResult;
    }
  }

  private async testStripeConnection(provider: Provider): Promise<ProviderTestResult> {
    const apiKey = provider.api_key ? this.decrypt(provider.api_key) : null;
    if (!apiKey) {
      return { success: false, message: 'API key not configured', tested_at: new Date() };
    }

    try {
      const response = await fetch('https://api.stripe.com/v1/account', {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      });

      if (!response.ok) {
        const error: any = await response.json();
        return { success: false, message: error.error?.message || `HTTP ${response.status}`, tested_at: new Date() };
      }

      const account: any = await response.json();
      return {
        success: true,
        message: 'Connected successfully',
        provider_info: {
          account_id: account.id,
          mode: apiKey.startsWith('sk_live') ? 'live' : 'test',
        },
        tested_at: new Date(),
      };
    } catch (error: any) {
      return { success: false, message: error.message || 'Connection failed', tested_at: new Date() };
    }
  }

  private async testBTCPayConnection(provider: Provider): Promise<ProviderTestResult> {
    const config = provider.config as any;
    const apiKey = provider.api_key ? this.decrypt(provider.api_key) : null;
    if (!apiKey || !config?.server_url || !config?.store_id) {
      return { success: false, message: 'Missing configuration', tested_at: new Date() };
    }

    try {
      const response = await fetch(`${config.server_url}/api/v1/stores/${config.store_id}`, {
        headers: { 'Authorization': `token ${apiKey}` },
      });

      if (!response.ok) {
        return { success: false, message: `HTTP ${response.status}`, tested_at: new Date() };
      }

      const store: any = await response.json();
      return { success: true, message: 'Connected successfully', provider_info: { store_id: store.id }, tested_at: new Date() };
    } catch (error: any) {
      return { success: false, message: error.message, tested_at: new Date() };
    }
  }

  private encrypt(text: string): string {
    const secret = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production';
    const key = crypto.scryptSync(secret, 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  private decrypt(encrypted: string): string {
    const secret = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production';
    const [ivHex, authTagHex, encryptedText] = encrypted.split(':');
    const key = crypto.scryptSync(secret, 'salt', 32);
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  private sanitizeProvider(provider: Provider): Provider {
    return {
      ...provider,
      api_key: provider.api_key ? '***' : undefined,
      api_secret: provider.api_secret ? '***' : undefined,
      webhook_secret: provider.webhook_secret ? '***' : undefined,
    };
  }
}

export const providerService = new ProviderService();
