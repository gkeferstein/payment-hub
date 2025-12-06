/**
 * API Key Repository
 * Handles database operations for API keys
 */

import { Knex } from 'knex';
import { ApiKey, CreateApiKeyInput } from './api-key.interface';
import * as crypto from 'crypto';

export class ApiKeyRepository {
  constructor(private db: Knex) {}

  /**
   * Hash an API key using SHA-256
   */
  private hashKey(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex');
  }

  /**
   * Generate a secure random API key
   */
  generateApiKey(): string {
    // Generate 32 bytes of random data, encode as base64url (URL-safe)
    const randomBytes = crypto.randomBytes(32);
    return randomBytes.toString('base64url');
  }

  /**
   * Create a new API key
   * Returns the plain key (only shown once!) and metadata
   */
  async create(input: CreateApiKeyInput): Promise<{ apiKey: string; record: ApiKey }> {
    // Generate secure random key
    const plainKey = this.generateApiKey();
    const keyHash = this.hashKey(plainKey);
    const keyPrefix = plainKey.substring(0, 8);

    const [record] = await this.db('api_keys')
      .insert({
        name: input.name,
        description: input.description || null,
        key_hash: keyHash,
        key_prefix: keyPrefix,
        channel: input.channel || null,
        is_active: true,
        expires_at: input.expires_at || null,
      })
      .returning('*');

    return {
      apiKey: plainKey, // Only returned once!
      record: this.mapToApiKey(record),
    };
  }

  /**
   * Find API key by hash
   */
  async findByHash(keyHash: string): Promise<ApiKey | null> {
    const record = await this.db('api_keys')
      .where('key_hash', keyHash)
      .where('is_active', true)
      .where(function() {
        this.whereNull('expires_at').orWhere('expires_at', '>', new Date());
      })
      .first();

    if (!record) {
      return null;
    }

    // Update usage tracking
    await this.db('api_keys')
      .where('id', record.id)
      .update({
        usage_count: this.db.raw('usage_count + 1'),
        last_used_at: new Date(),
      });

    return this.mapToApiKey(record);
  }

  /**
   * Validate an API key
   */
  async validate(plainKey: string): Promise<ApiKey | null> {
    const keyHash = this.hashKey(plainKey);
    return this.findByHash(keyHash);
  }

  /**
   * List all API keys (without hashes)
   */
  async list(): Promise<Omit<ApiKey, 'key_hash'>[]> {
    const records = await this.db('api_keys')
      .select('id', 'name', 'description', 'key_prefix', 'channel', 'is_active', 'expires_at', 'usage_count', 'last_used_at', 'created_at', 'updated_at')
      .orderBy('created_at', 'desc');

    return records.map(r => ({
      id: r.id,
      name: r.name,
      description: r.description,
      key_prefix: r.key_prefix,
      channel: r.channel,
      is_active: r.is_active,
      expires_at: r.expires_at ? new Date(r.expires_at) : undefined,
      usage_count: r.usage_count,
      last_used_at: r.last_used_at ? new Date(r.last_used_at) : undefined,
      created_at: new Date(r.created_at),
      updated_at: new Date(r.updated_at),
    }));
  }

  /**
   * Deactivate an API key
   */
  async deactivate(id: string): Promise<void> {
    await this.db('api_keys')
      .where('id', id)
      .update({ is_active: false });
  }

  /**
   * Delete an API key
   */
  async delete(id: string): Promise<void> {
    await this.db('api_keys')
      .where('id', id)
      .delete();
  }

  /**
   * Map database record to ApiKey interface
   */
  private mapToApiKey(record: any): ApiKey {
    return {
      id: record.id,
      name: record.name,
      description: record.description,
      key_hash: record.key_hash,
      key_prefix: record.key_prefix,
      channel: record.channel,
      is_active: record.is_active,
      expires_at: record.expires_at ? new Date(record.expires_at) : undefined,
      usage_count: record.usage_count,
      last_used_at: record.last_used_at ? new Date(record.last_used_at) : undefined,
      created_at: new Date(record.created_at),
      updated_at: new Date(record.updated_at),
    };
  }
}

