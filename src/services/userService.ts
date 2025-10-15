import axios from 'axios';
import authService from './authService';
const API_BASE_URL = '/api/users';
const AVATAR_API = '/api/avatars';

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

export interface UpdateWalletRequest {
  amount: number;
  operation: 'add' | 'deduct';
  description?: string;
}

export interface UpdateWalletResponse {
  success: boolean;
  message?: string;
  newBalance?: number;
}

// 预设头像条目
export interface PresetAvatarItem {
  id: number;
  url: string;
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
        // 用户名更新完成，不需要重新登录
        if (updates.userName) {
          console.log('用户名已更新，更新完成');
        }
        
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
      console.log('=== UserService.updatePassword 调试信息 ===');
      console.log('密码更新数据:', { username: passwordData.username, oldPassword: '***', newPassword: '***' });
      
      // 使用 /api/users/me 端点更新密码
      const response = await axios.put(`${API_BASE_URL}/me`, {
        userPassword: passwordData.newPassword
      }, {
        headers: {
          'Content-Type': 'application/json',
          ...authService.getAuthHeaders()
        }
      });
      
      console.log('密码更新响应:', response.data);
      
      // 后端直接返回用户对象，需要包装为期望的格式
      if (response.data && response.data.userId) {
        return {
          success: true,
          data: response.data,
          message: '密码更新成功'
        };
      } else {
        return {
          success: false,
          message: '密码更新失败'
        };
      }
    } catch (error: any) {
      console.error('密码更新错误:', error);
      if (error.response) {
        return {
          success: false,
          message: error.response.data?.message || '密码更新失败'
        };
      }
      return {
        success: false,
        message: '网络错误，请稍后重试'
      };
    }
  }

  /**
   * 更新钱包余额
   */
  async updateWalletBalance(walletData: UpdateWalletRequest): Promise<UpdateWalletResponse> {
    try {
      console.log('=== UserService.updateWalletBalance Debug Info ===');
      console.log('Wallet update data:', walletData);
      
      const response = await axios.put(`${API_BASE_URL}/wallet`, walletData, {
        headers: {
          'Content-Type': 'application/json',
          ...authService.getAuthHeaders()
        }
      });
      
      console.log('Wallet update response:', response.data);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          newBalance: response.data.newBalance,
          message: response.data.message
        };
      } else {
        return {
          success: false,
          message: response.data?.message || '钱包余额更新失败'
        };
      }
    } catch (error: any) {
      console.error('Failed to update wallet balance:', error);
      return {
        success: false,
        message: error.response?.data?.message || '钱包余额更新失败，请稍后重试'
      };
    }
  }

  /**
   * 获取预设头像列表
   */
  async listAvatars(): Promise<PresetAvatarItem[]> {
    try {
      console.log('=== 调用头像API ===');
      console.log('API URL:', AVATAR_API);
      
      const authHeaders = authService.getAuthHeaders();
      console.log('请求头:', authHeaders);
      
      // 检查是否有有效的认证信息
      const token = sessionStorage.getItem('token');
      const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
      console.log('登录状态:', isLoggedIn);
      console.log('Token存在:', !!token);
      
      const response = await axios.get(AVATAR_API, {
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        }
      });
      
      console.log('后端返回的头像数据:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        // 规范化后端返回的URL：去空格，缺少路径则补 /avatars/
        return response.data.map((item: any) => {
          const rawUrl: string = (item.url || '').toString().trim().replace(/\s+/g, '');
          const normalized = rawUrl.startsWith('/avatars/')
            ? rawUrl
            : (rawUrl.includes('/') ? rawUrl : `/avatars/${rawUrl}`);
          return { id: item.id, url: normalized.replace(/\/+/g, '/') };
        });
      }
      
      // 如果后端返回格式不对，使用本地备用
      console.log('后端返回格式不对，使用本地备用头像');
      return this.getLocalAvatars();
    } catch (error: any) {
      console.error('获取头像列表失败:', error);
      console.error('错误详情:', error.response?.data);
      console.log('使用本地备用头像');
      return this.getLocalAvatars();
    }
  }

  /**
   * 获取本地备用头像列表（使用后端API路径）
   */
  private getLocalAvatars(): PresetAvatarItem[] {
    return [
      { id: 1, url: '/avatars/image_001.png' },
      { id: 2, url: '/avatars/image_002.png' },
      { id: 3, url: '/avatars/image_003.png' },
      { id: 4, url: '/avatars/image_004.png' },
      { id: 5, url: '/avatars/image_005.png' },
      { id: 6, url: '/avatars/image_006.png' },
      { id: 7, url: '/avatars/image_007.png' },
      { id: 8, url: '/avatars/image_008.png' },
      { id: 9, url: '/avatars/image_009.png' },
      { id: 10, url: '/avatars/image_010.png' },
      { id: 11, url: '/avatars/image_011.png' },
      { id: 12, url: '/avatars/image_012.png' },
      { id: 13, url: '/avatars/image_013.png' },
      { id: 14, url: '/avatars/image_014.png' },
      { id: 15, url: '/avatars/image_015.png' }
    ];
  }

  /**
   * 通过文件名更新头像（后端会拼接为 /avatars/<filename>）
   */
  async updateAvatarByFilename(filename: string): Promise<UserProfileResponse> {
    const response = await axios.put(`${API_BASE_URL}/me/avatar`, { filename }, {
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeaders()
      }
    });
    if (response.data && response.data.userId) {
      return { success: true, data: response.data };
    }
    return { success: false, message: '更新失败' };
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

  // 下面的头像相关旧实现已移除，统一使用上方与后端匹配的 AVATAR_API 和 /api/users/me/avatar
}

export default new UserService();

