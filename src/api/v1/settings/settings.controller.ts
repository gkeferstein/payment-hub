/**
 * Settings Controller
 * Handles configuration endpoints for Shadow Mode and Channel settings
 */

import { Request, Response } from 'express';
import { ChannelConfigService } from '../../../infrastructure/config/channel-config.service';
import { ConfigService } from '../../../infrastructure/config/config.service';
import * as fs from 'fs';
import * as path from 'path';
import { createReadStream } from 'fs';

export class SettingsController {
  /**
   * GET /api/v1/settings
   * Get current system settings
   */
  async getSettings(_req: Request, res: Response): Promise<void> {
    try {
      const sandboxMode = ConfigService.isSandboxMode();
      
      // Get all channel configurations from database
      const channels = ['woocommerce', 'pos', 'b2b'];
      const channelConfigs = await Promise.all(
        channels.map(async (channel) => {
          const config = await ChannelConfigService.getChannelConfig(channel);
          return {
            channel: config.channel,
            use_payment_hub: config.use_payment_hub,
            shadow_mode: config.shadow_mode,
            callback_enabled: config.callback_enabled,
          };
        })
      );

      res.status(200).json({
        success: true,
        data: {
          sandbox_mode: sandboxMode,
          channels: channelConfigs,
        },
      });
    } catch (error: any) {
      console.error('Error getting settings:', error);
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Error getting settings',
          code: 'SETTINGS_ERROR',
        },
      });
    }
  }

  /**
   * PUT /api/v1/settings/channels/:channel
   * Update channel configuration
   */
  async updateChannelConfig(req: Request, res: Response): Promise<void> {
    try {
      const { channel } = req.params;
      const { use_payment_hub, shadow_mode, callback_enabled } = req.body;

      // Validate channel
      const validChannels = ['woocommerce', 'pos', 'b2b'];
      if (!validChannels.includes(channel.toLowerCase())) {
        res.status(400).json({
          success: false,
          error: {
            message: `Invalid channel. Must be one of: ${validChannels.join(', ')}`,
            code: 'INVALID_CHANNEL',
          },
        });
        return;
      }

      // Update configuration in database
      const updatedConfig = await ChannelConfigService.updateChannelConfig(channel.toLowerCase(), {
        use_payment_hub: use_payment_hub !== undefined ? Boolean(use_payment_hub) : undefined,
        shadow_mode: shadow_mode !== undefined ? Boolean(shadow_mode) : undefined,
        callback_enabled: callback_enabled !== undefined ? Boolean(callback_enabled) : undefined,
      });

      res.status(200).json({
        success: true,
        message: `Channel ${channel} configuration updated`,
        data: {
          channel: updatedConfig.channel,
          use_payment_hub: updatedConfig.use_payment_hub,
          shadow_mode: updatedConfig.shadow_mode,
          callback_enabled: updatedConfig.callback_enabled,
        },
      });
    } catch (error: any) {
      console.error('Error updating channel config:', error);
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Error updating channel configuration',
          code: 'CHANNEL_CONFIG_ERROR',
        },
      });
    }
  }

  /**
   * GET /api/v1/settings/channels
   * Get all channel configurations
   */
  async getChannelConfigs(_req: Request, res: Response): Promise<void> {
    try {
      const channels = ['woocommerce', 'pos', 'b2b'];
      const configs = await Promise.all(
        channels.map(async (channel) => {
          const config = await ChannelConfigService.getChannelConfig(channel);
          return {
            channel: config.channel,
            use_payment_hub: config.use_payment_hub,
            shadow_mode: config.shadow_mode,
            callback_enabled: config.callback_enabled,
          };
        })
      );

      res.status(200).json({
        success: true,
        data: configs,
      });
    } catch (error: any) {
      console.error('Error getting channel configs:', error);
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Error getting channel configurations',
          code: 'CHANNEL_CONFIGS_ERROR',
        },
      });
    }
  }

  /**
   * GET /api/v1/settings/plugins/:channel/download
   * Download plugin for channel
   */
  async downloadPlugin(req: Request, res: Response): Promise<void> {
    try {
      const { channel } = req.params;

      // Only WooCommerce plugin is available for now
      if (channel.toLowerCase() !== 'woocommerce') {
        res.status(404).json({
          success: false,
          error: {
            message: `Plugin not available for channel: ${channel}`,
            code: 'PLUGIN_NOT_AVAILABLE',
          },
        });
        return;
      }

      // Path to plugin directory (relative to project root)
      const projectRoot = process.cwd();
      const pluginDir = path.join(projectRoot, 'docs/woocommerce-plugin');
      const pluginFile = path.join(pluginDir, 'order-hub-integration.php');

      // Check if plugin file exists
      if (!fs.existsSync(pluginFile)) {
        res.status(404).json({
          success: false,
          error: {
            message: 'Plugin file not found',
            code: 'PLUGIN_NOT_FOUND',
          },
        });
        return;
      }

      // Set headers for file download
      // Include version/timestamp in filename to indicate it's the fixed version
      const version = '1.0.3-https';
      const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="order-hub-integration-${version}-${timestamp}.php"`);
      // Prevent caching
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      // Send the PHP file
      const fileStream = createReadStream(pluginFile);
      fileStream.pipe(res);
    } catch (error: any) {
      console.error('Error downloading plugin:', error);
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Error downloading plugin',
          code: 'PLUGIN_DOWNLOAD_ERROR',
        },
      });
    }
  }
}

export const settingsController = new SettingsController();

