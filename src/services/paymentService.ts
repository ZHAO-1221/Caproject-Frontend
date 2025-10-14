import axios from 'axios';
import authService from './authService';

const API_BASE_URL = '/api';

export interface PaymentRequest {
  paymentMethod: string;
  amount: number;
  orderItems: Array<{
    productId: number;
    quantity: number;
    price: number;
  }>;
  shippingAddress?: string;
}

export interface PaymentResponse {
  success: boolean;
  message?: string;
  transactionId?: string;
  data?: any;
}

export interface WalletBalanceResponse {
  success: boolean;
  message?: string;
  balance?: number;
}

class PaymentService {
  /**
   * 获取用户钱包余额
   */
  async getWalletBalance(): Promise<WalletBalanceResponse> {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...authService.getAuthHeaders()
      };
      
      console.log('=== PaymentService.getWalletBalance 调试信息 ===');
      console.log('请求头:', headers);
      console.log('完整URL:', `${API_BASE_URL}/users/me`);
      
      const response = await axios.get(`${API_BASE_URL}/users/me`, {
        headers
      });
      
      console.log('钱包余额响应:', response.data);
      
      if (response.data && typeof response.data.wallet === 'number') {
        return {
          success: true,
          balance: response.data.wallet
        };
      } else {
        return {
          success: false,
          message: '无法获取钱包余额'
        };
      }
    } catch (error: any) {
      console.error('获取钱包余额失败:', error);
      return {
        success: false,
        message: error.response?.data?.message || '获取钱包余额失败'
      };
    }
  }

  /**
   * 使用钱包支付
   */
  async payWithWallet(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      console.log('=== PaymentService.payWithWallet 调试信息 ===');
      console.log('支付数据:', paymentData);
      
      // 先创建订单
      const orderResult = await this.createOrder(paymentData);
      if (!orderResult.success) {
        return orderResult;
      }
      
      console.log('订单创建成功，订单ID:', orderResult.transactionId);
      
      // 模拟钱包支付处理
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 模拟钱包支付结果（95%成功率，因为已经检查过余额）
      const isSuccessful = Math.random() > 0.05;
      
      if (isSuccessful) {
        console.log('钱包支付成功');
        return {
          success: true,
          transactionId: orderResult.transactionId,
          data: { 
            status: 'completed',
            paymentMethod: 'wallet',
            amount: paymentData.amount,
            orderId: orderResult.transactionId,
            timestamp: new Date().toISOString()
          }
        };
      } else {
        console.log('钱包支付失败');
        return {
          success: false,
          message: '钱包支付处理失败，请重试'
        };
      }
    } catch (error: any) {
      console.error('钱包支付失败:', error);
      return {
        success: false,
        message: error.response?.data?.message || '钱包支付失败'
      };
    }
  }

  /**
   * 创建订单
   */
  async createOrder(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      console.log('=== PaymentService.createOrder 调试信息 ===');
      console.log('订单数据:', paymentData);
      
      // 模拟创建订单API调用
      // 在实际应用中，这里会调用真实的后端API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 生成订单ID
      const orderId = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      
      console.log('创建订单成功，订单ID:', orderId);
      
      return {
        success: true,
        transactionId: orderId,
        data: {
          orderId: orderId,
          status: 'created',
          amount: paymentData.amount,
          paymentMethod: paymentData.paymentMethod,
          items: paymentData.orderItems,
          shippingAddress: paymentData.shippingAddress,
          createdAt: new Date().toISOString()
        }
      };
    } catch (error: any) {
      console.error('创建订单失败:', error);
      return {
        success: false,
        message: error.response?.data?.message || '创建订单失败'
      };
    }
  }

  /**
   * 模拟其他支付方式
   */
  async processPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      console.log('=== PaymentService.processPayment 调试信息 ===');
      console.log('支付方式:', paymentData.paymentMethod);
      console.log('支付金额:', paymentData.amount);
      
      // 先创建订单
      const orderResult = await this.createOrder(paymentData);
      if (!orderResult.success) {
        return orderResult;
      }
      
      console.log('订单创建成功，订单ID:', orderResult.transactionId);
      
      // 模拟支付处理延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟支付结果（90%成功率）
      const isSuccessful = Math.random() > 0.1;
      
      if (isSuccessful) {
        return {
          success: true,
          transactionId: orderResult.transactionId,
          data: { 
            status: 'completed',
            paymentMethod: paymentData.paymentMethod,
            amount: paymentData.amount,
            orderId: orderResult.transactionId,
            timestamp: new Date().toISOString()
          }
        };
      } else {
        return {
          success: false,
          message: '支付处理失败，请重试'
        };
      }
    } catch (error: any) {
      console.error('支付处理失败:', error);
      return {
        success: false,
        message: '支付处理失败'
      };
    }
  }
}

export default new PaymentService();
