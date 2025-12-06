/**
 * API Key Service
 * Business logic for API key management
 */

import { db } from '../database/connection';
import { ApiKeyRepository } from './api-key.repository';
import { CreateApiKeyInput, ApiKey } from './api-key.interface';

export class ApiKeyService {
  private repository: ApiKeyRepository;

  constructor() {
    this.repository = new ApiKeyRepository(db);
  }

  /**
   * Create a new API key
   * Returns the plain key (only shown once!)
   */
  async create(input: CreateApiKeyInput): Promise<{ apiKey: string; record: Omit<ApiKey, 'key_hash'> }> {
    const { apiKey, record } = await this.repository.create(input);
    
    // Return without hash
    const { key_hash, ...recordWithoutHash } = record;
    
    return {
      apiKey,
      record: recordWithoutHash,
    };
  }

  /**
   * Validate an API key
   */
  async validate(plainKey: string): Promise<ApiKey | null> {
    return this.repository.validate(plainKey);
  }

  /**
   * List all API keys (without hashes)
   */
  async list(): Promise<Omit<ApiKey, 'key_hash'>[]> {
    return this.repository.list();
  }

  /**
   * Deactivate an API key
   */
  async deactivate(id: string): Promise<void> {
    await this.repository.deactivate(id);
  }

  /**
   * Delete an API key
   */
  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}

