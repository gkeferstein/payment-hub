/**
 * API Keys Management
 * Create, list, and manage API keys
 */

import { useState, useEffect } from 'react';
import {
  useNotify,
  useRefresh,
} from 'react-admin';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Key, Copy, Trash2, AlertCircle } from 'lucide-react';

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

const getApiKey = () => {
  return localStorage.getItem('apiKey') || (import.meta as any).env?.VITE_API_KEY || '';
};

interface ApiKey {
  id: string;
  name: string;
  description?: string;
  key_prefix: string;
  channel?: string;
  is_active: boolean;
  expires_at?: string;
  usage_count: number;
  last_used_at?: string;
  created_at: string;
  updated_at: string;
}

interface CreateApiKeyResult {
  id: string;
  api_key: string; // Only shown once!
  key_prefix: string;
  name: string;
  description?: string;
  channel?: string;
  created_at: string;
}

// List View
export const ApiKeysList = () => {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refresh = useRefresh();

  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    try {
      setLoading(true);
      const apiKey = getApiKey();
      
      if (!apiKey) {
        throw new Error('No API key found. Please log in again.');
      }
      
      const url = `${getApiBase()}/api-keys`;
      console.log('Fetching API keys from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        credentials: 'omit',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const json = await response.json();
      setKeys(json.data || []);
      setError(null);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch API keys';
      setError(errorMessage);
      console.error('Error loading API keys:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this API key?')) {
      return;
    }

    try {
      const apiKey = getApiKey();
      const response = await fetch(`${getApiBase()}/api-keys/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to deactivate key');
      }

      await loadKeys();
      refresh();
    } catch (err: any) {
      alert('Failed to deactivate key: ' + err.message);
    }
  };

  if (loading) {
    return <div className="p-6">Loading API keys...</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Error loading API keys: {error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">API Keys</h1>
          <p className="text-muted-foreground mt-2">
            Manage API keys for authentication
          </p>
        </div>
        <CreateApiKeyButton onCreated={loadKeys} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active API Keys</CardTitle>
          <CardDescription>
            {keys.length} API key{keys.length !== 1 ? 's' : ''} configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          {keys.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No API keys found. Create your first API key to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {keys.map((key) => (
                <Card key={key.id} className="border-gray-200">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Key className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold">{key.name}</h3>
                          {key.is_active ? (
                            <Badge variant="default">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                          {key.channel && (
                            <Badge variant="outline">{key.channel}</Badge>
                          )}
                        </div>
                        {key.description && (
                          <p className="text-sm text-muted-foreground">{key.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Prefix: <code className="bg-gray-100 px-2 py-1 rounded">{key.key_prefix}</code></span>
                          <span>Used: {key.usage_count} times</span>
                          {key.last_used_at && (
                            <span>Last used: {new Date(key.last_used_at).toLocaleDateString()}</span>
                          )}
                          <span>Created: {new Date(key.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {key.is_active && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeactivate(key.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Deactivate
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Create API Key Component
const CreateApiKeyButton = ({ onCreated }: { onCreated: () => void }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    channel: '',
  });
  const [createdKey, setCreatedKey] = useState<CreateApiKeyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const notify = useNotify();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const apiKey = getApiKey();
      const response = await fetch(`${getApiBase()}/api-keys`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          channel: formData.channel.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to create API key');
      }

      const json = await response.json();
      setCreatedKey(json.data);
      setFormData({ name: '', description: '', channel: '' });
      notify('API key created successfully!', { type: 'success' });
    } catch (err: any) {
      notify('Failed to create API key: ' + err.message, { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyKey = () => {
    if (createdKey?.api_key) {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(createdKey.api_key)
          .then(() => {
            notify('API key copied to clipboard!', { type: 'success' });
          })
          .catch(() => {
            // Fallback: select text for manual copy
            fallbackCopy(createdKey.api_key);
          });
      } else {
        // Fallback for browsers without clipboard API
        fallbackCopy(createdKey.api_key);
      }
    }
  };

  const fallbackCopy = (text: string) => {
    // Create temporary textarea
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      notify('API key copied to clipboard!', { type: 'success' });
    } catch (err) {
      notify('Please manually copy the API key', { type: 'warning' });
    }
    document.body.removeChild(textarea);
  };

  const handleClose = () => {
    setCreatedKey(null);
    setShowDialog(false);
    onCreated();
  };

  return (
    <>
      <Button onClick={() => setShowDialog(true)}>
        <Key className="h-4 w-4 mr-2" />
        Create API Key
      </Button>

      {showDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl m-4">
            <CardHeader>
              <CardTitle>
                {createdKey ? 'API Key Created' : 'Create New API Key'}
              </CardTitle>
              <CardDescription>
                {createdKey
                  ? 'Save this key - it will not be shown again!'
                  : 'Create a new API key for authentication'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {createdKey ? (
                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Important:</strong> This API key will only be shown once. Make sure to copy and save it securely!
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">API Key</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={createdKey.api_key}
                        className="flex-1 bg-gray-100 p-3 rounded font-mono text-sm border-0 focus:outline-none focus:ring-2 focus:ring-primary"
                        onClick={(e) => (e.target as HTMLInputElement).select()}
                      />
                      <Button variant="outline" size="sm" onClick={handleCopyKey} title="Copy to clipboard">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Click on the key to select it, or use the copy button
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Name:</span>
                      <p className="font-medium">{createdKey.name}</p>
                    </div>
                    {createdKey.channel && (
                      <div>
                        <span className="text-muted-foreground">Channel:</span>
                        <p className="font-medium">{createdKey.channel}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground">Prefix:</span>
                      <p className="font-medium font-mono">{createdKey.key_prefix}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Created:</span>
                      <p className="font-medium">{new Date(createdKey.created_at).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button onClick={handleClose}>Done</Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                      placeholder="e.g., WooCommerce Production Key"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                      rows={3}
                      placeholder="Optional description..."
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Channel</label>
                    <select
                      value={formData.channel}
                      onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                    >
                      <option value="">All Channels</option>
                      <option value="woocommerce">WooCommerce</option>
                      <option value="pos">POS System</option>
                      <option value="b2b">B2B Portal</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Creating...' : 'Create API Key'}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

// Export for react-admin
export const ApiKeysCreate = CreateApiKeyButton;
export const ApiKeysListComponent = ApiKeysList;

