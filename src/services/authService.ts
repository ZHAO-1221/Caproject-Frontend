import axios from 'axios';

const API_BASE_URL = '/api';

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
      const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
      
      // 如果登录成功，保存认证信息
      if (response.data.success) {
        sessionStorage.setItem('isLoggedIn', 'true');
        if (response.data.user) {
          sessionStorage.setItem('user', JSON.stringify(response.data.user));
        }
        if (response.data.token) {
          sessionStorage.setItem('token', response.data.token);
        }
      }
      
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
    } finally {
      // 清理所有认证信息
      sessionStorage.removeItem('isLoggedIn');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
    }
  }

  isLoggedIn(): boolean {
    return sessionStorage.getItem('isLoggedIn') === 'true';
  }

  getAuthHeaders(): { Authorization: string } | {} {
    const token = sessionStorage.getItem('token');
    console.log('=== AuthService.getAuthHeaders 调试信息 ===');
    console.log('从sessionStorage获取的token:', token);
    console.log('token类型:', typeof token);
    console.log('token长度:', token ? token.length : 0);
    
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    console.log('生成的认证头:', headers);
    console.log('认证头是否包含Authorization:', 'Authorization' in headers);
    
    return headers;
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
