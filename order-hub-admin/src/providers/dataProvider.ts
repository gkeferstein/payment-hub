/**
 * Data Provider for React-Admin
 * Connects to Order Hub REST API
 */

import simpleRestProvider from 'ra-data-simple-rest';
import { fetchUtils } from 'react-admin';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';
const API_BASE = `${API_URL}/api/v1`;

// Custom HTTP client with API key authentication
const httpClient = (url: string, options: fetchUtils.Options = {}) => {
  const apiKey = localStorage.getItem('apiKey') || (import.meta as any).env?.VITE_API_KEY || '';
  
  if (!options.headers) {
    options.headers = new Headers({ Accept: 'application/json' });
  }
  
  // Add API key to Authorization header
  (options.headers as Headers).set('Authorization', `Bearer ${apiKey}`);
  
  return fetchUtils.fetchJson(url, options);
};

// Create base provider
const baseProvider = simpleRestProvider(API_BASE, httpClient);

// Custom data provider with response transformations
export const dataProvider = {
  ...baseProvider,
  
  // Override getList to handle our API response format
  getList: async (resource: string, _params: any) => {
    const url = `${API_BASE}/${resource}`;
    
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
    const url = `${API_BASE}/${resource}/${params.id}`;
    const { json } = await httpClient(url);
    
    return {
      data: json.data || json,
    };
  },

  // Override getMany
  getMany: async (resource: string, params: any) => {
    const promises = params.ids.map((id: string) =>
      httpClient(`${API_BASE}/${resource}/${id}`)
    );
    
    const responses = await Promise.all(promises);
    
    return {
      data: responses.map((response) => response.json.data || response.json),
    };
  },

  // Override create
  create: async (resource: string, params: any) => {
    const { json } = await httpClient(`${API_BASE}/${resource}`, {
      method: 'POST',
      body: JSON.stringify(params.data),
    });
    
    return {
      data: json.data || json,
    };
  },

  // Override update
  update: async (resource: string, params: any) => {
    const { json } = await httpClient(`${API_BASE}/${resource}/${params.id}`, {
      method: 'PUT',
      body: JSON.stringify(params.data),
    });
    
    return {
      data: json.data || json,
    };
  },

  // Override delete
  delete: async (resource: string, params: any) => {
    await httpClient(`${API_BASE}/${resource}/${params.id}`, {
      method: 'DELETE',
    });
    
    return {
      data: params.previousData,
    };
  },
};
