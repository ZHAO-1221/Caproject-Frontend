import axios from 'axios';

const API_BASE_URL = 'http://172.20.10.11:8080/api';

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
}

const orderService = new OrderService();
export default orderService;



