/**
 * API Key Interface
 */

export interface ApiKey {
  id: string;
  name: string;
  description?: string;
  key_hash: string;
  key_prefix: string;
  channel?: string;
  is_active: boolean;
  expires_at?: Date;
  usage_count: number;
  last_used_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateApiKeyInput {
  name: string;
  description?: string;
  channel?: string;
  expires_at?: Date;
}

export interface CreateApiKeyResult {
  id: string;
  api_key: string; // Only returned once on creation!
  key_prefix: string;
  name: string;
  channel?: string;
  created_at: Date;
}

