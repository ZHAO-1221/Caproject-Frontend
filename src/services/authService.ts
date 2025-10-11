import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: {
    username: string;
    email: string;
    name: string;
    role: string;
    loginTime: number;
  };
}

export interface User {
  username: string;
  email: string;
  name: string;
  role: string;
  loginTime: number;
}

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, credentials);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data;
      }
      throw new Error('网络错误，请稍后重试');
    }
  }

  async logout(): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/logout`);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  isLoggedIn(): boolean {
    return sessionStorage.getItem('isLoggedIn') === 'true';
  }

  getCurrentUser(): User | null {
    const userStr = sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  setUserSession(user: User): void {
    sessionStorage.setItem('user', JSON.stringify(user));
    sessionStorage.setItem('isLoggedIn', 'true');
  }

  clearUserSession(): void {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('isLoggedIn');
  }
}

export default new AuthService();
