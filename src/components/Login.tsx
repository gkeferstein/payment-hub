/**
 * Custom Login Component
 * API Key only login (no password required)
 */

import { useState } from 'react';
import { useLogin, useNotify } from 'react-admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Key } from 'lucide-react';

export const Login = () => {
  const [apiKey, setApiKey] = useState('');
  const login = useLogin();
  const notify = useNotify();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      notify('API Key is required', { type: 'error' });
      return;
    }

    setLoading(true);
    try {
      await login({ username: apiKey.trim(), password: '' });
    } catch (error: any) {
      notify(error.message || 'Login failed', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Key className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Order Hub Admin</CardTitle>
          <CardDescription>
            Enter your API Key to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium mb-2">
                API Key
              </label>
              <input
                id="apiKey"
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                autoFocus
                disabled={loading}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Your API key is used for authentication. No password required.
              </p>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading || !apiKey.trim()}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>First time?</strong> Use the Initial Admin Key that was created during setup.
              Check the migration logs or contact your administrator.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

