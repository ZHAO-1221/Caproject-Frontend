import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

export interface RegistrationRequest {
  username: string;
  email: string;
  password: string;
  phone?: string;
}

export interface RegistrationResponse {
  success: boolean;
  message: string;
  user?: {
    username: string;
    email: string;
    userType: number;
  };
}

class RegistrationService {
  /**
   * 用户注册
   */
  async register(data: RegistrationRequest): Promise<RegistrationResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/register/new`, data);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data;
      }
      throw new Error('网络错误，请稍后重试');
    }
  }

  /**
   * 检查用户名是否可用
   */
  async checkUsernameAvailable(username: string): Promise<boolean> {
    try {
      // 这个功能可以后续添加专门的API
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 检查邮箱是否可用
   */
  async checkEmailAvailable(email: string): Promise<boolean> {
    try {
      // 这个功能可以后续添加专门的API
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default new RegistrationService();

