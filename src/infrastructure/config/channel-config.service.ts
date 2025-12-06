/**
 * Channel Configuration Service
 * Manages feature flags and routing decisions for channels
 * Allows parallel operation: existing direct Stripe connection + Payment Hub
 * 
 * Now uses database persistence instead of in-memory storage
 */

import { db } from '../database/connection';

export interface ChannelConfig {
  channel: string; // 'woocommerce', 'pos', etc.
  use_payment_hub: boolean; // If true, route through Payment Hub
  shadow_mode: boolean; // If true, only monitor (read-only), don't interfere
  callback_enabled: boolean; // If true, send callbacks back to channel
}

export class ChannelConfigService {
  /**
   * Get configuration for a channel from database
   */
  static async getChannelConfig(channel: string): Promise<ChannelConfig> {
    try {
      const result = await db('channel_configs')
        .where('channel', channel.toLowerCase())
        .first();
      
      if (result) {
        return {
          channel: result.channel,
          use_payment_hub: result.use_payment_hub,
          shadow_mode: result.shadow_mode,
          callback_enabled: result.callback_enabled,
        };
      }
      
      // Default: shadow mode (monitoring only, no interference)
      return {
        channel: channel.toLowerCase(),
        use_payment_hub: false,
        shadow_mode: true,
        callback_enabled: false,
      };
    } catch (error) {
      console.error(`Error getting channel config for ${channel}:`, error);
      // Fallback to defaults on error
      return {
        channel: channel.toLowerCase(),
        use_payment_hub: false,
        shadow_mode: true,
        callback_enabled: false,
      };
    }
  }

  /**
   * Synchronous version for backward compatibility (uses defaults if DB unavailable)
   * Use async version when possible
   */
  static getChannelConfigSync(channel: string): ChannelConfig {
    // Return defaults - async version should be used instead
    return {
      channel: channel.toLowerCase(),
      use_payment_hub: false,
      shadow_mode: true,
      callback_enabled: false,
    };
  }

  /**
   * Check if channel should use Payment Hub for processing
   */
  static async shouldUsePaymentHub(channel: string): Promise<boolean> {
    const config = await this.getChannelConfig(channel);
    return config.use_payment_hub && !config.shadow_mode;
  }

  /**
   * Check if channel is in shadow mode (monitoring only)
   */
  static async isShadowMode(channel: string): Promise<boolean> {
    const config = await this.getChannelConfig(channel);
    return config.shadow_mode;
  }

  /**
   * Check if callbacks should be sent to channel
   */
  static async shouldSendCallbacks(channel: string): Promise<boolean> {
    const config = await this.getChannelConfig(channel);
    return config.callback_enabled && !config.shadow_mode;
  }

  /**
   * Update channel configuration in database
   */
  static async updateChannelConfig(channel: string, config: Partial<ChannelConfig>): Promise<ChannelConfig> {
    const channelName = channel.toLowerCase();
    
    try {
      const existing = await db('channel_configs')
        .where('channel', channelName)
        .first();
      
      const updateData: any = {
        updated_at: db.fn.now(),
      };
      
      if (config.use_payment_hub !== undefined) {
        updateData.use_payment_hub = Boolean(config.use_payment_hub);
      }
      if (config.shadow_mode !== undefined) {
        updateData.shadow_mode = Boolean(config.shadow_mode);
      }
      if (config.callback_enabled !== undefined) {
        updateData.callback_enabled = Boolean(config.callback_enabled);
      }
      
      if (existing) {
        // Update existing record
        await db('channel_configs')
          .where('channel', channelName)
          .update(updateData);
      } else {
        // Insert new record
        await db('channel_configs').insert({
          channel: channelName,
          use_payment_hub: config.use_payment_hub !== undefined ? Boolean(config.use_payment_hub) : false,
          shadow_mode: config.shadow_mode !== undefined ? Boolean(config.shadow_mode) : true,
          callback_enabled: config.callback_enabled !== undefined ? Boolean(config.callback_enabled) : false,
          created_at: db.fn.now(),
          updated_at: db.fn.now(),
        });
      }
      
      // Return updated config
      return await this.getChannelConfig(channel);
    } catch (error) {
      console.error(`Error updating channel config for ${channel}:`, error);
      throw error;
    }
  }
}









