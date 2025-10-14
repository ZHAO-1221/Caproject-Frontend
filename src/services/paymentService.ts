import axios from 'axios';
import authService from './authService';

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
      
      console.log('=== PaymentService.getWalletBalance Debug Info ===');
      console.log('Request headers:', headers);
      console.log('Full URL:', `/api/users/me`);
      
      const response = await axios.get(`/api/users/me`, {
        headers
      });
      
      console.log('Wallet balance response:', response.data);
      
      if (response.data && typeof response.data.wallet === 'number') {
        return {
          success: true,
          balance: response.data.wallet
        };
      } else {
        return {
          success: false,
          message: 'Unable to get wallet balance'
        };
      }
    } catch (error: any) {
      console.error('Failed to get wallet balance:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get wallet balance'
      };
    }
  }

  /**
   * Use wallet payment
   */
  async payWithWallet(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      console.log('=== PaymentService.payWithWallet Debug Info ===');
      console.log('Payment data:', paymentData);
      
      // Create order first
      const orderResult = await this.createOrder(paymentData);
      if (!orderResult.success) {
        return orderResult;
      }
      
      console.log('Order created successfully, Order ID:', orderResult.transactionId);
      
      // Simulate wallet payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate wallet payment result (95% success rate, since balance has been checked)
      const isSuccessful = Math.random() > 0.05;
      
      if (isSuccessful) {
        console.log('Wallet payment successful');
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
        console.log('Wallet payment failed');
        return {
          success: false,
          message: 'Wallet payment processing failed, please try again'
        };
      }
    } catch (error: any) {
      console.error('Wallet payment failed:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Wallet payment failed'
      };
    }
  }

  /**
   * Create order
   */
  async createOrder(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      console.log('=== PaymentService.createOrder Debug Info ===');
      console.log('Order data:', paymentData);
      
      // Simulate create order API call
      // In actual application, this would call real backend API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate order ID
      const orderId = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      
      console.log('Order created successfully, Order ID:', orderId);
      
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
      console.error('Failed to create order:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create order'
      };
    }
  }

  /**
   * Simulate other payment methods
   */
  async processPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      console.log('=== PaymentService.processPayment Debug Info ===');
      console.log('Payment method:', paymentData.paymentMethod);
      console.log('Payment amount:', paymentData.amount);
      
      // Create order first
      const orderResult = await this.createOrder(paymentData);
      if (!orderResult.success) {
        return orderResult;
      }
      
      console.log('Order created successfully, Order ID:', orderResult.transactionId);
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate payment result (90% success rate)
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
          message: 'Payment processing failed, please try again'
        };
      }
    } catch (error: any) {
      console.error('Payment processing failed:', error);
      return {
        success: false,
        message: 'Payment processing failed'
      };
    }
  }
}

export default new PaymentService();
