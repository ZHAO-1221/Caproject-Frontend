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
    
    try {
      const response = await axios.get(`/api/location/getLocation`, {
        params: { username },
        headers
      });
      
      console.log('响应状态:', response.status);
      console.log('响应头:', response.headers);
      console.log('响应数据:', response.data);
      console.log('响应数据类型:', typeof response.data);
      
      // 确保返回的数据有正确的格式
      if (response.data) {
        console.log('原始API响应数据:', response.data);
        // 如果后端返回的数据已经有code、data、message结构，直接返回
        if (response.data.code && response.data.data) {
          console.log('后端返回标准格式，直接返回');
          return response.data;
        } else {
          // 否则包装成标准格式
          console.log('包装成标准格式');
          return {
            success: true,
            code: response.status,
            data: response.data,
            message: 'Success'
          };
        }
      } else {
        return {
          success: false,
          code: response.status,
          message: 'No data returned'
        };
      }
    } catch (error: any) {
      console.error('地址API调用失败:', error);
      console.error('错误响应:', error.response?.data);
      console.error('错误状态:', error.response?.status);
      
      return {
        success: false,
        code: error.response?.status || 500,
        message: error.response?.data?.message || error.message || 'Network error'
      };
    }
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
    if (!locationText || typeof locationText !== 'string') {
      console.warn('地址文本为空或格式错误:', locationText);
      return { street: '', building: '', postal: '', city: '' };
    }

    console.log('解析地址文本:', locationText);
    
    // 尝试多种分隔符：逗号、分号、换行符
    let parts: string[] = [];
    
    if (locationText.includes(',')) {
      parts = locationText.split(',').map(p => p.trim()).filter(p => p);
    } else if (locationText.includes(';')) {
      parts = locationText.split(';').map(p => p.trim()).filter(p => p);
    } else if (locationText.includes('\n')) {
      parts = locationText.split('\n').map(p => p.trim()).filter(p => p);
    } else {
      // 如果没有分隔符，尝试按空格分割
      parts = locationText.split(/\s+/).filter(p => p);
    }
    
    console.log('分割后的地址部分:', parts);
    
    // 智能解析地址部分
    let street = '';
    let building = '';
    let postal = '';
    let city = '';
    
    if (parts.length >= 4) {
      // 完整格式：street, building, postal, city
      street = parts[0] || '';
      building = parts[1] || '';
      postal = parts[2] || '';
      city = parts.slice(3).join(' ') || '';
    } else if (parts.length === 3) {
      // 三部分格式：可能是 street, building, postal 或 street, postal, city
      // 检查第二部分是否像邮政编码（数字）
      if (/^\d+$/.test(parts[1])) {
        // 格式：street, postal, city
        street = parts[0] || '';
        building = '';
        postal = parts[1] || '';
        city = parts[2] || '';
      } else {
        // 格式：street, building, postal
        street = parts[0] || '';
        building = parts[1] || '';
        postal = parts[2] || '';
        city = '';
      }
    } else if (parts.length === 2) {
      // 两部分格式：可能是 street, postal 或 street, city
      if (/^\d+$/.test(parts[1])) {
        // 格式：street, postal
        street = parts[0] || '';
        building = '';
        postal = parts[1] || '';
        city = '';
      } else {
        // 格式：street, city
        street = parts[0] || '';
        building = '';
        postal = '';
        city = parts[1] || '';
      }
    } else if (parts.length === 1) {
      // 单一部分：可能是完整地址或街道
      street = parts[0] || '';
      building = '';
      postal = '';
      city = '';
    }
    
    const result = { street, building, postal, city };
    console.log('解析结果:', result);
    return result;
  }
}

export default new AddressService();

