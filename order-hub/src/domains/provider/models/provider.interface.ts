/**
 * Payment Provider Interface
 * Represents a payment provider configuration (Stripe, BTCPay, etc.)
 */

export enum ProviderType {
  STRIPE = 'stripe',
  BTCPAY = 'btcpay',
}

export enum ProviderTestStatus {
  NEVER_TESTED = 'never_tested',
  SUCCESS = 'success',
  FAILED = 'failed',
}

export interface Provider {
  id: string;
  provider: ProviderType;
  name: string;
  description?: string;
  enabled: boolean;
  
  api_key?: string;
  api_secret?: string;
  webhook_secret?: string;
  
  config: Record<string, any>;
  
  last_test_at?: Date;
  last_test_status?: ProviderTestStatus;
  last_test_message?: string;
  
  metadata: Record<string, any>;
  
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface CreateProviderInput {
  provider: ProviderType;
  name: string;
  description?: string;
  enabled?: boolean;
  api_key?: string;
  api_secret?: string;
  webhook_secret?: string;
  config?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface UpdateProviderInput {
  name?: string;
  description?: string;
  enabled?: boolean;
  api_key?: string;
  api_secret?: string;
  webhook_secret?: string;
  config?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface ProviderTestResult {
  success: boolean;
  message: string;
  provider_info?: {
    account_id?: string;
    mode?: string;
    [key: string]: any;
  };
  tested_at: Date;
}
