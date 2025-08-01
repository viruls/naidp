import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_USER_API_URL || 'http://localhost:3002';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  emailVerified: boolean;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
  expires_in: number;
}

export interface VerifyResponse {
  valid: boolean;
  user: AuthUser;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  async register(email: string, password: string, firstName: string, lastName: string): Promise<AuthUser> {
    const response = await api.post('/auth/register', {
      email,
      password,
      firstName,
      lastName
    });
    return response.data.user;
  },

  async verifyToken(token: string): Promise<VerifyResponse> {
    const response = await api.post('/auth/verify', { token });
    return response.data;
  }
};