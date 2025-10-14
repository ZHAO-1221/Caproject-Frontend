import axios from 'axios';
const API_BASE_URL = '/api';

export interface OrderServiceResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

class OrderService {
  async getOrders(userId: number): Promise<OrderServiceResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/order/getOrders/${userId}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Get orders error:', error);
      return { success: false, message: error.response?.data?.message || '获取订单失败' };
    }
  }

  // Local order history helpers
  private LOCAL_KEY = 'orderHistory';

  saveLocalOrder(order: {
    id: string;
    amount: number;
    orderTime: string;
    status: string;
    items: any[];
    productImage?: string;
  }): void {
    try {
      const existing = localStorage.getItem(this.LOCAL_KEY);
      const list = existing ? JSON.parse(existing) : [];
      list.unshift(order);
      localStorage.setItem(this.LOCAL_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to save local order history', e);
    }
  }

  getLocalOrders(): Array<{
    id: string;
    amount: number;
    orderTime: string;
    status: string;
    items: any[];
    productImage?: string;
  }> {
    try {
      const existing = localStorage.getItem(this.LOCAL_KEY);
      return existing ? JSON.parse(existing) : [];
    } catch (e) {
      console.error('Failed to read local order history', e);
      return [];
    }
  }
}

const orderService = new OrderService();
export default orderService;



