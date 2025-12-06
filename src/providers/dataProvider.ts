/**
 * Data Provider for React-Admin
 * Connects to Order Hub REST API
 */

import simpleRestProvider from 'ra-data-simple-rest';
import { fetchUtils } from 'react-admin';

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

// Custom HTTP client with API key authentication
const httpClient = (url: string, options: fetchUtils.Options = {}) => {
  const apiKey = localStorage.getItem('apiKey') || (import.meta as any).env?.VITE_API_KEY || '';
  
  if (!options.headers) {
    options.headers = new Headers({ Accept: 'application/json' });
  }
  
  // Add API key to Authorization header (backend expects Bearer token)
  (options.headers as Headers).set('Authorization', `Bearer ${apiKey}`);
  
  // Use runtime API base URL
  const apiBase = getApiBase();
  const fullUrl = url.startsWith('http') ? url : `${apiBase}/${url.replace(/^\//, '')}`;
  return fetchUtils.fetchJson(fullUrl, options);
};

// Create base provider - will use getApiBase() at runtime
const baseProvider = simpleRestProvider(getApiBase(), httpClient);

// Custom data provider with response transformations
export const dataProvider = {
  ...baseProvider,
  
  // Override getList to handle our API response format
  getList: async (resource: string, _params: any) => {
    const url = `${getApiBase()}/${resource}`;
    
    try {
      const { json } = await httpClient(url);
      const data = json.data || json;
      const items = Array.isArray(data) ? data : [data];
      
      return {
        data: items,
        total: items.length,
      };
    } catch (error) {
      console.error('Error fetching list:', error);
      return {
        data: [],
        total: 0,
      };
    }
  },

  // Override getOne
  getOne: async (resource: string, params: any) => {
    let url = `${getApiBase()}/${resource}/${params.id}`;
    
    // For orders, automatically include payments
    if (resource === 'orders') {
      url += '?include=payments';
    }
    
    const { json } = await httpClient(url);
    
    return {
      data: json.data || json,
    };
  },

  // Override getMany
  getMany: async (resource: string, params: any) => {
    const promises = params.ids.map((id: string) =>
      httpClient(`${getApiBase()}/${resource}/${id}`)
    );
    
    const responses = await Promise.all(promises);
    
    return {
      data: responses.map((response) => response.json.data || response.json),
    };
  },

  // Override create
  create: async (resource: string, params: any) => {
    const { json } = await httpClient(`${getApiBase()}/${resource}`, {
      method: 'POST',
      body: JSON.stringify(params.data),
    });
    
    return {
      data: json.data || json,
    };
  },

  // Override update
  update: async (resource: string, params: any) => {
    const { json } = await httpClient(`${getApiBase()}/${resource}/${params.id}`, {
      method: 'PUT',
      body: JSON.stringify(params.data),
    });
    
    return {
      data: json.data || json,
    };
  },

  // Override delete
  delete: async (resource: string, params: any) => {
    await httpClient(`${getApiBase()}/${resource}/${params.id}`, {
      method: 'DELETE',
    });
    
    return {
      data: params.previousData,
    };
  },
};
