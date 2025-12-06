/**
 * Settings Resource
 * Configuration UI for Shadow Mode and Channel settings
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { TestTube, ShoppingCart, Store, Building2, AlertCircle, CheckCircle2, Loader2, Download } from 'lucide-react';

// API Base URL - Use HTTPS for production, HTTP for localhost
// Force runtime evaluation by using a function that can't be optimized away
const getApiBase = (): string => {
  try {
    // Runtime check - access window.location directly (can't be optimized)
    const loc = (globalThis as any).window?.location;
    if (loc) {
      // If protocol is HTTPS, use HTTPS API
      if (loc.protocol === 'https:') {
        return 'https://paymentsapi.mojo-institut.de/api/v1';
      }
      // For production domains (not localhost), use HTTPS
      const host = loc.hostname || '';
      if (host && host !== 'localhost' && host !== '127.0.0.1' && !host.match(/^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)/)) {
        return 'https://paymentsapi.mojo-institut.de/api/v1';
      }
    }
  } catch (e) {
    // Fallback if window is not available
  }
  // Default to HTTP for localhost/SSR
  return 'http://localhost:3000/api/v1';
};

interface ChannelConfig {
  channel: string;
  use_payment_hub: boolean;
  shadow_mode: boolean;
  callback_enabled: boolean;
}

interface SettingsData {
  sandbox_mode: boolean;
  channels: ChannelConfig[];
}

const getApiKey = () => {
  return localStorage.getItem('apiKey') || (import.meta as any).env?.VITE_API_KEY || '';
};

const fetchSettings = async (): Promise<SettingsData | null> => {
  try {
    const apiKey = getApiKey();
    const response = await fetch(`${getApiBase()}/settings`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      credentials: 'omit',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    return json.data || json;
  } catch (error) {
    console.error('Error fetching settings:', error);
    return null;
  }
};

const updateChannelConfig = async (
  channel: string,
  config: Partial<ChannelConfig>
): Promise<ChannelConfig | null> => {
  try {
    const apiKey = getApiKey();
    const response = await fetch(`${getApiBase()}/settings/channels/${channel}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      credentials: 'omit',
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    return json.data || json;
  } catch (error) {
    console.error('Error updating channel config:', error);
    return null;
  }
};

const downloadPlugin = async (channel: string): Promise<void> => {
  try {
    const apiKey = getApiKey();
    // Add cache-busting parameter to force fresh download
    const cacheBustTimestamp = Date.now();
    const response = await fetch(`${getApiBase()}/settings/plugins/${channel}/download?t=${cacheBustTimestamp}&v=1.0.1`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      credentials: 'omit',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Always use the correct filename with version
    const version = '1.0.2-http-fix';
    const dateString = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const filename = `order-hub-integration-${version}-${dateString}.php`;

    // Create blob and download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error downloading plugin:', error);
    alert('Failed to download plugin. Please check your connection and try again.');
  }
};

const ToggleSwitch = ({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        ${checked ? 'bg-blue-600' : 'bg-gray-200'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
          ${checked ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  );
};

const ChannelCard = ({
  channel,
  config,
  onUpdate,
  loading,
  onDownloadPlugin,
}: {
  channel: string;
  config: ChannelConfig;
  onUpdate: (channel: string, updates: Partial<ChannelConfig>) => Promise<void>;
  loading: boolean;
  onDownloadPlugin: (channel: string) => Promise<void>;
}) => {
  const [localConfig, setLocalConfig] = useState(config);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleToggle = async (field: keyof ChannelConfig, value: boolean) => {
    const newConfig = { ...localConfig, [field]: value };
    setLocalConfig(newConfig);
    setIsUpdating(true);
    await onUpdate(channel, { [field]: value });
    setIsUpdating(false);
  };

  const getChannelIcon = () => {
    switch (channel.toLowerCase()) {
      case 'woocommerce':
        return <ShoppingCart className="h-5 w-5" />;
      case 'pos':
        return <Store className="h-5 w-5" />;
      case 'b2b':
        return <Building2 className="h-5 w-5" />;
      default:
        return <ShoppingCart className="h-5 w-5" />;
    }
  };

  const getChannelName = () => {
    switch (channel.toLowerCase()) {
      case 'woocommerce':
        return 'WooCommerce';
      case 'pos':
        return 'POS System';
      case 'b2b':
        return 'B2B Portal';
      default:
        return channel;
    }
  };

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getChannelIcon()}
          {getChannelName()}
        </CardTitle>
        <CardDescription>
          Configure {getChannelName()} integration settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isUpdating && (
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            Updating...
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="text-sm font-medium">Use Payment Hub</label>
              <p className="text-xs text-muted-foreground">
                Enable Payment Hub processing for this channel
              </p>
            </div>
            <ToggleSwitch
              checked={localConfig.use_payment_hub}
              onChange={(checked) => handleToggle('use_payment_hub', checked)}
              disabled={loading || isUpdating}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="text-sm font-medium">Shadow Mode</label>
              <p className="text-xs text-muted-foreground">
                Monitor only - no active processing or callbacks
              </p>
            </div>
            <ToggleSwitch
              checked={localConfig.shadow_mode}
              onChange={(checked) => handleToggle('shadow_mode', checked)}
              disabled={loading || isUpdating || !localConfig.use_payment_hub}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="text-sm font-medium">Enable Callbacks</label>
              <p className="text-xs text-muted-foreground">
                Send status updates back to the channel
              </p>
            </div>
            <ToggleSwitch
              checked={localConfig.callback_enabled}
              onChange={(checked) => handleToggle('callback_enabled', checked)}
              disabled={loading || isUpdating || !localConfig.use_payment_hub || localConfig.shadow_mode}
            />
          </div>
        </div>

        {localConfig.shadow_mode && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 p-3 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Shadow Mode is active - monitoring only, no callbacks will be sent
            </p>
          </div>
        )}

        {localConfig.use_payment_hub && !localConfig.shadow_mode && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 p-3 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Active mode - Payment Hub is processing payments for this channel
            </p>
          </div>
        )}

        {/* Download Plugin Button for WooCommerce */}
        {channel.toLowerCase() === 'woocommerce' && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label className="text-sm font-medium">WooCommerce Plugin</label>
                <p className="text-xs text-muted-foreground">
                  Download the integration plugin for WooCommerce (v1.0.1 - Fixed Nonce Issue)
                </p>
              </div>
              <button
                onClick={() => onDownloadPlugin(channel)}
                disabled={loading || isUpdating}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Download className="h-4 w-4" />
                Download Plugin
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const Settings = () => {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = async () => {
    setLoading(true);
    setError(null);
    const data = await fetchSettings();
    if (data) {
      setSettings(data);
    } else {
      setError('Failed to load settings. Please check your API connection.');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleChannelUpdate = async (channel: string, updates: Partial<ChannelConfig>) => {
    const updated = await updateChannelConfig(channel, updates);
    if (updated && settings) {
      setSettings({
        ...settings,
        channels: settings.channels.map((c) =>
          c.channel === channel ? { ...c, ...updated } : c
        ),
      });
    } else {
      // Reload on error
      await loadSettings();
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading settings...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadSettings}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-6">
        <p>No settings data available</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure Payment Hub settings and channel integrations
        </p>
      </div>

      {/* Sandbox Mode Status */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Sandbox Mode
          </CardTitle>
          <CardDescription>
            Sandbox mode is controlled via environment variable (SANDBOX_MODE)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Badge variant={settings.sandbox_mode ? 'default' : 'secondary'}>
              {settings.sandbox_mode ? 'Active' : 'Inactive'}
            </Badge>
            <p className="text-sm text-muted-foreground">
              {settings.sandbox_mode
                ? 'All payment providers are in sandbox/test mode. No real payments will be processed.'
                : 'Payment providers are using live/production mode.'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Channel Configurations */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Channel Configurations</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {settings.channels.map((channelConfig) => (
            <ChannelCard
              key={channelConfig.channel}
              channel={channelConfig.channel}
              config={channelConfig}
              onUpdate={handleChannelUpdate}
              loading={loading}
              onDownloadPlugin={downloadPlugin}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;
