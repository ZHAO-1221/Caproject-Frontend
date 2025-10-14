import axios from 'axios';
import authService from './authService';

const API_BASE_URL = 'http://172.20.10.11:8080/api/users';

export interface UserProfile {
  userId: number;
  userPhone: string;
  userEmail: string;
  userType: number;
  userRegisterTime: string;
  userLastLoginTime: string;
  userName: string;
  userGender: string;
  userBirthday: string;
  userIntroduce: string;
  userProfileUrl: string;
  wallet: number;
}

export interface UserProfileResponse {
  success: boolean;
  message?: string;
  data?: UserProfile;
}

export interface UpdateProfileRequest {
  userPhone?: string;
  userEmail?: string;
  userPassword?: string;
  userLastLoginTime?: string;
  userName?: string;
  userGender?: string;
  userBirthday?: string;
  userIntroduce?: string;
  userProfileUrl?: string;
}

export interface UpdatePasswordRequest {
  username: string;
  oldPassword: string;
  newPassword: string;
}

class UserService {
  /**
   * 获取用户信息
   */
  async getUserProfile(username: string): Promise<UserProfileResponse> {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...authService.getAuthHeaders()
      };
      
      console.log('=== UserService.getUserProfile 调试信息 ===');
      console.log('请求参数:', { username });
      console.log('请求头:', headers);
      console.log('完整URL:', `${API_BASE_URL}/me`);
      
      const response = await axios.get(`${API_BASE_URL}/me`, {
        headers
      });
      
      console.log('响应状态:', response.status);
      console.log('响应头:', response.headers);
      console.log('响应数据:', response.data);
      
      // 后端直接返回 User 对象，这里规范为 { success, data }
      const user = response.data as UserProfile;
      return {
        success: true,
        data: user
      };
    } catch (error: any) {
      if (error.response) {
        // 尝试从后端错误中提取 message
        const backend = error.response.data;
        return {
          success: false,
          message: (backend && (backend.message || backend.error)) || '加载用户信息失败'
        };
      }
      return { success: false, message: '网络错误，请稍后重试' };
    }
  }

  /**
   * 更新用户信息
   */
  async updateUserProfile(updates: UpdateProfileRequest): Promise<UserProfileResponse> {
    try {
      const response = await axios.put(`${API_BASE_URL}/me`, updates, {
        headers: {
          'Content-Type': 'application/json',
          ...authService.getAuthHeaders()
        }
      });
      
      // 后端直接返回用户对象，需要包装为期望的格式
      if (response.data && response.data.userId) {
        return {
          success: true,
          data: response.data
        };
      } else {
        return {
          success: false,
          message: '更新失败'
        };
      }
    } catch (error: any) {
      if (error.response) {
        return {
          success: false,
          message: error.response.data?.message || '更新失败'
        };
      }
      return {
        success: false,
        message: '网络错误，请稍后重试'
      };
    }
  }

  /**
   * 更新密码
   */
  async updatePassword(passwordData: UpdatePasswordRequest): Promise<UserProfileResponse> {
    try {
      const response = await axios.put(`${API_BASE_URL}/password`, passwordData, {
        headers: {
          'Content-Type': 'application/json',
          ...authService.getAuthHeaders()
        }
      });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data;
      }
      throw new Error('网络错误，请稍后重试');
    }
  }

  /**
   * 获取当前登录用户的用户名
   */
  getCurrentUsername(): string | null {
    const userStr = sessionStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.username;
    }
    return null;
  }
}

export default new UserService();

