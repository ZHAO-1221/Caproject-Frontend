import axios from 'axios';
import authService from './authService';

export interface Address {
  id: number;
  locationText: string;
  isDefault: boolean;
  userId: number;
}

export interface AddressResponse {
  code: number;
  message?: string;
  data?: Address | Address[] | number;
  success?: boolean; // 保持向后兼容
}

export interface AddAddressRequest {
  userId: number;
  locationText: string;
  postalCode?: string;
  city?: string;
}

export interface UpdateAddressRequest {
  locationText: string;
}

class AddressService {
  /**
   * 获取用户的所有地址
   */
  async getAddresses(username: string): Promise<AddressResponse> {
    const headers = {
      'Content-Type': 'application/json',
      ...authService.getAuthHeaders()
    };
    
    console.log('=== AddressService.getAddresses 调试信息 ===');
    console.log('请求参数:', { username });
    console.log('请求头:', headers);
    console.log('完整URL:', `/api/location/getLocation`);
    
    const response = await axios.get(`/api/location/getLocation`, {
      params: { username },
      headers
    });
    
    console.log('响应状态:', response.status);
    console.log('响应头:', response.headers);
    console.log('响应数据:', response.data);
    
    return response.data;
  }

  /**
   * 添加新地址
   */
  async addAddress(data: AddAddressRequest): Promise<AddressResponse> {
    console.log('=== AddressService.addAddress 调试信息 ===');
    console.log('请求数据:', data);
    console.log('用户ID:', data.userId);
    console.log('地址文本:', data.locationText);
    
    const response = await axios.post(`/api/location/addLocation`, data, {
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeaders()
      }
    });
    return response.data;
  }

  /**
   * 更新地址
   */
  async updateAddress(id: number, data: UpdateAddressRequest): Promise<AddressResponse> {
    try {
      const response = await axios.put(`/api/location/updateLocation/${id}`, data, {
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
      const response = await axios.delete(`/api/location/deleteLocation/${id}`, {
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
      const response = await axios.put(`/api/location/set-default/${id}`, null, {
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
    // 后端要求的格式：完整的地址字符串，用空格分隔各个部分
    return `${address.street} ${address.building} ${address.postal} ${address.city}`.trim();
  }

  /**
   * 解析地址文本（将后端格式转为前端格式）
   */
  parseAddressText(locationText: string): { street: string; building: string; postal: string; city: string } {
    // 后端格式：用逗号分隔的地址字符串
    const parts = locationText.split(',').map(p => p.trim()).filter(p => p);
    
    // 假设格式为：street building postal city
    // 如果只有3个部分，可能是缺少building或city
    if (parts.length >= 4) {
      return {
        street: parts[0] || '',
        building: parts[1] || '',
        postal: parts[2] || '',
        city: parts.slice(3).join(' ') || '' // city可能包含空格，所以用剩余部分
      };
    } else if (parts.length === 3) {
      return {
        street: parts[0] || '',
        building: parts[1] || '',
        postal: parts[2] || '',
        city: ''
      };
    } else if (parts.length === 2) {
      return {
        street: parts[0] || '',
        building: '',
        postal: parts[1] || '',
        city: ''
      };
    } else {
      return {
        street: parts[0] || '',
        building: '',
        postal: '',
        city: ''
      };
    }
  }
}

export default new AddressService();

