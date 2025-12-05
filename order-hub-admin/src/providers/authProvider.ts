/**
 * Authentication Provider
 * Handles API key authentication for the admin dashboard
 */

import { AuthProvider } from 'react-admin';

export const authProvider: AuthProvider = {
  // Called when the user attempts to log in
  login: ({ username }) => {
    // We only use the username as API key, password is ignored but required by the form
    if (!username) {
      return Promise.reject(new Error('API Key is required'));
    }
    // Store the API key in localStorage
    localStorage.setItem('apiKey', username);
    return Promise.resolve();
  },

  // Called when the user clicks on the logout button
  logout: () => {
    localStorage.removeItem('apiKey');
    return Promise.resolve();
  },

  // Called when the API returns an error
  checkError: ({ status }) => {
    if (status === 401 || status === 403) {
      localStorage.removeItem('apiKey');
      return Promise.reject();
    }
    return Promise.resolve();
  },

  // Called when the user navigates to a new location, to check for authentication
  checkAuth: () => {
    return localStorage.getItem('apiKey')
      ? Promise.resolve()
      : Promise.reject();
  },

  // Called when the user navigates to a new location, to check for permissions / roles
  getPermissions: () => Promise.resolve(),

  // Optional: Get user identity
  getIdentity: () =>
    Promise.resolve({
      id: 'admin',
      fullName: 'Admin User',
    }),
};
