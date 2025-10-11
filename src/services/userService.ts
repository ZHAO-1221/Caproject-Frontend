import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/user';

export interface UserProfile {
  userId: number;
  username: string;
  email: string;
  phone: string;
  gender: string;
  birthday?: string;
  introduce?: string;
  profileUrl?: string;
  wallet?: number;
  userType: number;
  registerTime?: string;
  lastLoginTime?: string;
}

export interface UserProfileResponse {
  success: boolean;
  message?: string;
  data?: UserProfile;
}

export interface UpdateProfileRequest {
  username: string;
  email?: string;
  phone?: string;
  gender?: string;
  introduce?: string;
  profileUrl?: string;
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
      const response = await axios.get(`${API_BASE_URL}/profile`, {
        params: { username }
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
   * 更新用户信息
   */
  async updateUserProfile(updates: UpdateProfileRequest): Promise<UserProfileResponse> {
    try {
      const response = await axios.put(`${API_BASE_URL}/profile`, updates);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data;
      }
      throw new Error('网络错误，请稍后重试');
    }
  }

  /**
   * 更新密码
   */
  async updatePassword(passwordData: UpdatePasswordRequest): Promise<UserProfileResponse> {
    try {
      const response = await axios.put(`${API_BASE_URL}/password`, passwordData);
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

