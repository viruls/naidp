import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_ADMIN_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Client management
export interface Client {
  id: string;
  name: string;
  type: 'saml' | 'oidc' | 'oauth2';
  clientId: string;
  redirectUris: string[];
  allowedScopes: string[];
  metadata?: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientRequest {
  name: string;
  type: 'saml' | 'oidc' | 'oauth2';
  clientId: string;
  clientSecret?: string;
  redirectUris: string[];
  allowedScopes: string[];
  metadata?: Record<string, any>;
}

export const clientService = {
  async getClients(page = 1, limit = 50, type?: string) {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (type) params.append('type', type);
    
    const response = await api.get(`/api/clients?${params}`);
    return response.data;
  },

  async getClient(id: string) {
    const response = await api.get(`/api/clients/${id}`);
    return response.data;
  },

  async createClient(client: CreateClientRequest) {
    const response = await api.post('/api/clients', client);
    return response.data;
  },

  async updateClient(id: string, updates: Partial<Client>) {
    const response = await api.put(`/api/clients/${id}`, updates);
    return response.data;
  },

  async deleteClient(id: string) {
    const response = await api.delete(`/api/clients/${id}`);
    return response.data;
  },

  async rotateSecret(id: string) {
    const response = await api.post(`/api/clients/${id}/rotate-secret`);
    return response.data;
  }
};

// User management
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export const userService = {
  async getUsers(page = 1, limit = 50) {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    const response = await api.get(`/api/users?${params}`);
    return response.data;
  },

  async getUser(id: string) {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  },

  async createUser(user: CreateUserRequest) {
    const response = await api.post('/api/users', user);
    return response.data;
  },

  async updateUser(id: string, updates: Partial<User>) {
    const response = await api.put(`/api/users/${id}`, updates);
    return response.data;
  },

  async deleteUser(id: string) {
    const response = await api.delete(`/api/users/${id}`);
    return response.data;
  },

  async changePassword(id: string, currentPassword: string, newPassword: string) {
    const response = await api.post(`/api/users/${id}/change-password`, {
      currentPassword,
      newPassword
    });
    return response.data;
  }
};