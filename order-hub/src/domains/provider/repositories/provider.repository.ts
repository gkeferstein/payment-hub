/**
 * Provider Repository
 * Database operations for payment providers
 */

import { db } from '../../../infrastructure/database';
import { Provider, CreateProviderInput, UpdateProviderInput, ProviderType } from '../models';

export class ProviderRepository {
  private readonly table = 'payment_providers';

  async findAll(includeDisabled: boolean = true): Promise<Provider[]> {
    const query = db(this.table).whereNull('deleted_at');
    if (!includeDisabled) {
      query.where('enabled', true);
    }
    return query.select('*').orderBy('created_at', 'desc');
  }

  async findById(id: string): Promise<Provider | null> {
    const provider = await db(this.table).where({ id }).whereNull('deleted_at').first();
    return provider || null;
  }

  async findByTypeAndName(provider: ProviderType, name: string): Promise<Provider | null> {
    const result = await db(this.table).where({ provider, name }).whereNull('deleted_at').first();
    return result || null;
  }

  async create(input: CreateProviderInput): Promise<Provider> {
    const [provider] = await db(this.table).insert({
      provider: input.provider,
      name: input.name,
      description: input.description,
      enabled: input.enabled !== undefined ? input.enabled : true,
      api_key: input.api_key,
      api_secret: input.api_secret,
      webhook_secret: input.webhook_secret,
      config: JSON.stringify(input.config || {}),
      metadata: JSON.stringify(input.metadata || {}),
      created_at: new Date(),
      updated_at: new Date(),
    }).returning('*');
    return provider;
  }

  async update(id: string, input: UpdateProviderInput): Promise<Provider | null> {
    const updateData: any = { updated_at: new Date() };
    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.enabled !== undefined) updateData.enabled = input.enabled;
    if (input.api_key !== undefined) updateData.api_key = input.api_key;
    if (input.api_secret !== undefined) updateData.api_secret = input.api_secret;
    if (input.webhook_secret !== undefined) updateData.webhook_secret = input.webhook_secret;
    if (input.config !== undefined) updateData.config = JSON.stringify(input.config);
    if (input.metadata !== undefined) updateData.metadata = JSON.stringify(input.metadata);

    const [provider] = await db(this.table).where({ id }).whereNull('deleted_at').update(updateData).returning('*');
    return provider || null;
  }

  async updateTestStatus(id: string, status: string, message?: string): Promise<void> {
    await db(this.table).where({ id }).update({
      last_test_at: new Date(),
      last_test_status: status,
      last_test_message: message,
      updated_at: new Date(),
    });
  }

  async softDelete(id: string): Promise<boolean> {
    const count = await db(this.table).where({ id }).whereNull('deleted_at').update({
      deleted_at: new Date(),
      updated_at: new Date(),
    });
    return count > 0;
  }
}

export const providerRepository = new ProviderRepository();
