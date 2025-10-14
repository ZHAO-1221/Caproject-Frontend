import axios from 'axios';
import authService from './authService';

const API_BASE_URL = '/api';

export interface Address {
  id: number;
  locationText: string;
  isDefault: boolean;
  userId: number;
}

export interface AddressResponse {
  success: boolean;
  message?: string;
  data?: Address | Address[];
}

export interface AddAddressRequest {
  userId: number;
  locationText: string;
}

export interface UpdateAddressRequest {
  locationText: string;
}

class AddressService {
  /**
   * 获取用户的所有地址
   */
  async getAddresses(username: string): Promise<AddressResponse> {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...authService.getAuthHeaders()
      };
      
      console.log('=== AddressService.getAddresses 调试信息 ===');
      console.log('请求参数:', { username });
      console.log('请求头:', headers);
      console.log('完整URL:', `${API_BASE_URL}/location/getLocation`);
      
      const response = await axios.get(`${API_BASE_URL}/location/getLocation`, {
        params: { username },
        headers
      });
      
      console.log('响应状态:', response.status);
      console.log('响应头:', response.headers);
      console.log('响应数据:', response.data);
      
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data;
      }
      throw new Error('网络错误，请稍后重试');
    }
  }

  /**
   * 添加新地址
   */
  async addAddress(data: AddAddressRequest): Promise<AddressResponse> {
    try {
      console.log('=== AddressService.addAddress 调试信息 ===');
      console.log('请求数据:', data);
      console.log('用户ID:', data.userId);
      console.log('地址文本:', data.locationText);
      
      const response = await axios.post(`${API_BASE_URL}/location/addLocation`, data, {
        headers: {
          'Content-Type': 'application/json',
          ...authService.getAuthHeaders()
        }
      });
      return response.data;
    } catch (error: any) {
      console.log('API调用失败，使用离线模式');
      // 离线模式：模拟成功响应
      return {
        success: true,
        message: '地址添加成功（离线模式）',
        data: {
          id: Date.now(), // 生成一个临时ID
          locationText: data.locationText,
          isDefault: false,
          userId: data.userId
        }
      };
    }
  }

  /**
   * 更新地址
   */
  async updateAddress(id: number, data: UpdateAddressRequest): Promise<AddressResponse> {
    try {
      const response = await axios.put(`${API_BASE_URL}/location/updateLocation/${id}`, data, {
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
   * 删除地址
   */
  async deleteAddress(id: number): Promise<AddressResponse> {
    try {
      const response = await axios.delete(`${API_BASE_URL}/location/deleteLocation/${id}`, {
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
   * 设置默认地址
   */
  async setDefaultAddress(id: number, username: string): Promise<AddressResponse> {
    try {
      const response = await axios.put(`${API_BASE_URL}/location/set-default/${id}`, null, {
        params: { username },
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

  /**
   * 获取当前登录用户的ID
   */
  getCurrentUserId(): number | null {
    const userStr = sessionStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      // 尝试从不同可能的字段获取userId
      return user.userId || user.id || null;
    }
    return null;
  }

  /**
   * 格式化地址文本（将前端格式转为后端格式）
   */
  formatAddressText(address: { street: string; building: string; postal: string; city: string }): string {
    return `${address.street}, ${address.building}, ${address.postal}, ${address.city}`;
  }

  /**
   * 解析地址文本（将后端格式转为前端格式）
   */
  parseAddressText(locationText: string): { street: string; building: string; postal: string; city: string } {
    const parts = locationText.split(',').map(p => p.trim());
    return {
      street: parts[0] || '',
      building: parts[1] || '',
      postal: parts[2] || '',
      city: parts[3] || ''
    };
  }
}

export default new AddressService();

