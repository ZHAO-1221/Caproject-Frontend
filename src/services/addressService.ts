import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/address';

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
  username: string;
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
      const response = await axios.get(`${API_BASE_URL}/list`, {
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
   * 添加新地址
   */
  async addAddress(data: AddAddressRequest): Promise<AddressResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/add`, data);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data;
      }
      throw new Error('网络错误，请稍后重试');
    }
  }

  /**
   * 更新地址
   */
  async updateAddress(id: number, data: UpdateAddressRequest): Promise<AddressResponse> {
    try {
      const response = await axios.put(`${API_BASE_URL}/update/${id}`, data);
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
      const response = await axios.delete(`${API_BASE_URL}/delete/${id}`);
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
      const response = await axios.put(`${API_BASE_URL}/set-default/${id}`, null, {
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
   * 获取默认地址
   */
  async getDefaultAddress(username: string): Promise<AddressResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/default`, {
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

