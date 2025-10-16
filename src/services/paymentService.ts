/**
 * 支付服务
 * 负责处理各种支付方式，包括钱包支付、第三方支付等
 * by zhou fushun
 */
import axios from 'axios';
import authService from './authService';

const API_BASE_URL = '/api'; // API基础URL

/**
 * 支付请求接口
 */
export interface PaymentRequest {
  paymentMethod: string;  // 支付方式
  amount: number;         // 支付金额
  orderItems: Array<{     // 订单商品列表
    productId: number;    // 商品ID
    quantity: number;     // 商品数量
    price: number;        // 商品价格
  }>;
  shippingAddress?: string; // 收货地址
  orderId?: string;        // 订单ID
}

/**
 * 支付响应接口
 */
export interface PaymentResponse {
  success: boolean;       // 是否成功
  message?: string;       // 响应消息
  transactionId?: string; // 交易ID
  data?: {               // 响应数据
    userId: number;       // 用户ID
    totalPrice: number;   // 总价格
    orderId?: string;     // 订单ID
    paymentMethod?: string; // 支付方式
    newWalletBalance?: number; // 新钱包余额
    timestamp?: string;   // 时间戳
  };
}

/**
 * 钱包余额响应接口
 */
export interface WalletBalanceResponse {
  success: boolean;  // 是否成功
  message?: string;  // 响应消息
  balance?: number;  // 钱包余额
}

/**
 * 钱包扣款请求接口
 */
export interface WalletDeductionRequest {
  amount: number;        // 扣款金额
  orderId: string;       // 订单ID
  description?: string;  // 扣款描述
}

/**
 * 钱包扣款响应接口
 */
export interface WalletDeductionResponse {
  success: boolean;      // 是否成功
  message?: string;      // 响应消息
  newBalance?: number;   // 新余额
  transactionId?: string; // 交易ID
}

/**
 * 钱包退款请求接口
 */
export interface WalletRefundRequest {
  amount: number;        // 退款金额
  orderId: string;       // 订单ID
  reason?: string;       // 退款原因
}

/**
 * 钱包退款响应接口
 */
export interface WalletRefundResponse {
  success: boolean;      // 是否成功
  message?: string;      // 响应消息
  newBalance?: number;   // 新余额
  refundId?: string;     // 退款ID
}

/**
 * 支付服务类
 * 提供各种支付相关的方法
 */
class PaymentService {
  private readonly WALLET_BALANCE_KEY = 'user_wallet_balance'; // 钱包余额存储键名

  /**
   * 获取当前用户ID
   * @returns 用户ID
   */
  private getCurrentUserId(): number {
    const userStr = sessionStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log('=== Get User ID Debug Info ===');
        console.log('User data:', user);
        console.log('User ID field:', user.userId || user.id);
        return user.userId || user.id || 100052; // Default user ID
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    console.log('User data not found, using default user ID: 100052');
    return 100052; // Default user ID
  }

  /**
   * 获取用户钱包余额
   * @param forceRefresh 是否强制刷新
   * @returns 钱包余额响应
   */
  async getWalletBalance(forceRefresh = false): Promise<WalletBalanceResponse> {
    try {
      // 只有在不强制刷新时才使用缓存
      if (!forceRefresh) {
        const storedBalance = sessionStorage.getItem(this.WALLET_BALANCE_KEY);
        if (storedBalance !== null) {
          const balance = parseFloat(storedBalance);
          if (!isNaN(balance)) {
            console.log('Using stored wallet balance:', balance);
            return {
              success: true,
              balance: balance
            };
          }
        }
      }

      const headers = {
        'Content-Type': 'application/json',
        ...authService.getAuthHeaders()
      };
      
      const userId = this.getCurrentUserId();
      console.log('=== PaymentService.getWalletBalance Debug Info ===');
      console.log('=== Frontend to Backend Request Info ===');
      console.log('Request method:', 'GET');
      console.log('Request URL:', `${API_BASE_URL}/order/getWallet`);
      console.log('Request params:', { userId: userId });
      console.log('Request headers:', headers);
      console.log('Full request URL:', `${API_BASE_URL}/order/getWallet?userId=${userId}`);
      
      const response = await axios.get(`${API_BASE_URL}/order/getWallet`, {
        headers,
        params: {
          userId: userId
        }
      });
      
      console.log('=== Backend to Frontend Response Info ===');
      console.log('Response status:', response.status);
      console.log('Response status text:', response.statusText);
      console.log('Response headers:', response.headers);
      console.log('Response data:', response.data);
      console.log('Response data type:', typeof response.data);
      console.log('Response data structure:', JSON.stringify(response.data, null, 2));
      
      // Parse backend DataResult format response
      let walletBalance: number | null = null;
      
      if (response.data) {
        console.log('Response data structure:', response.data);
        
        // Backend response format: { code: number, data: Float, message: string }
        if (response.data.code === 200 && response.data.data !== null) {
          walletBalance = parseFloat(response.data.data);
          console.log('Parsed wallet balance from DataResult:', walletBalance);
        }
        // Compatible with other formats
        else if (typeof response.data.wallet === 'number') {
          walletBalance = response.data.wallet;
        }
        else if (typeof response.data.balance === 'number') {
          walletBalance = response.data.balance;
        }
        else if (typeof response.data === 'number') {
          walletBalance = response.data;
        }
        else if (response.data.data && typeof response.data.data.wallet === 'number') {
          walletBalance = response.data.data.wallet;
        }
      }
      
      if (walletBalance !== null) {
        // Store to sessionStorage
        sessionStorage.setItem(this.WALLET_BALANCE_KEY, walletBalance.toString());
        
        return {
          success: true,
          balance: walletBalance
        };
      } else {
        return {
          success: false,
          message: 'Unable to get wallet balance from response'
        };
      }
    } catch (error: any) {
      console.error('Failed to get wallet balance:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      // Check if it's a network error or CORS issue
      if (error.code === 'ERR_NETWORK' || error.message.includes('CORS')) {
        console.error('Network or CORS error detected');
        return {
          success: false,
          message: 'Network connection failed or CORS issue, please check if backend service is running'
        };
      }
      
      // If API fails, try using stored balance
      const storedBalance = sessionStorage.getItem(this.WALLET_BALANCE_KEY);
      if (storedBalance !== null) {
        const balance = parseFloat(storedBalance);
        if (!isNaN(balance)) {
          console.log('API failed, using stored balance:', balance);
          return {
            success: true,
            balance: balance
          };
        }
      }
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to get wallet balance'
      };
    }
  }

  /**
   * 更新本地钱包余额
   * @param newBalance 新的余额
   */
  updateWalletBalance(newBalance: number): void {
    sessionStorage.setItem(this.WALLET_BALANCE_KEY, newBalance.toString());
    console.log('Updated stored wallet balance:', newBalance);
  }

  /**
   * 清除钱包余额存储
   */
  clearWalletBalanceCache(): void {
    sessionStorage.removeItem(this.WALLET_BALANCE_KEY);
    console.log('Cleared stored wallet balance');
  }

  /**
   * 同步钱包余额（强制从后端获取最新数据）
   * @returns 钱包余额响应
   */
  async syncWalletBalance(): Promise<WalletBalanceResponse> {
    console.log('=== Syncing wallet balance from backend ===');
    this.clearWalletBalanceCache();
    return await this.getWalletBalance(true);
  }

  /**
   * 强制刷新钱包余额（清除缓存并重新获取）
   * @returns 钱包余额响应
   */
  async forceRefreshWalletBalance(): Promise<WalletBalanceResponse> {
    console.log('=== Force Refresh Wallet Balance ===');
    // Clear all related cache
    this.clearWalletBalanceCache();
    sessionStorage.removeItem('user_wallet_balance');
    localStorage.removeItem('user_wallet_balance');
    
    // Force get latest data from backend
    const result = await this.getWalletBalance(true);
    
    if (result.success && result.balance !== undefined) {
      console.log('✅ Wallet balance refresh successful:', result.balance);
    } else {
      console.error('❌ Wallet balance refresh failed:', result.message);
    }
    
    return result;
  }

  /**
   * 测试后端连接
   * @returns 连接是否成功
   */
  async testBackendConnection(): Promise<boolean> {
    try {
      console.log('=== Testing backend connection ===');
      const userId = this.getCurrentUserId();
      
      const headers = {
        'Content-Type': 'application/json',
        ...authService.getAuthHeaders()
      };
      
      console.log('=== Test Connection - Frontend to Backend Request Info ===');
      console.log('Request method:', 'GET');
      console.log('Request URL:', `${API_BASE_URL}/order/getWallet`);
      console.log('Request params:', { userId: userId });
      console.log('Request headers:', headers);
      console.log('Full request URL:', `${API_BASE_URL}/order/getWallet?userId=${userId}`);
      
      const response = await axios.get(`${API_BASE_URL}/order/getWallet`, {
        headers,
        params: {
          userId: userId
        },
        timeout: 5000 // 5秒超时
      });
      
      console.log('=== Test Connection - Backend to Frontend Response Info ===');
      console.log('Response status:', response.status);
      console.log('Response status text:', response.statusText);
      console.log('Response headers:', response.headers);
      console.log('Response data:', response.data);
      console.log('Response data type:', typeof response.data);
      console.log('Response data structure:', JSON.stringify(response.data, null, 2));
      
      return true;
    } catch (error: any) {
      console.error('Backend connection test failed:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status
      });
      
      return false;
    }
  }

  /**
   * 从钱包扣款
   * @param deductionData 扣款数据
   * @returns 扣款响应
   */
  async deductFromWallet(deductionData: WalletDeductionRequest): Promise<WalletDeductionResponse> {
    try {
      console.log('=== PaymentService.deductFromWallet Debug Info ===');
      console.log('Deduction data:', deductionData);
      
      // First get current wallet balance (force get latest data from backend)
      const balanceResponse = await this.getWalletBalance(true);
      if (!balanceResponse.success || balanceResponse.balance === undefined) {
        return {
          success: false,
          message: 'Unable to get wallet balance'
        };
      }
      
      const currentBalance = balanceResponse.balance;
      if (currentBalance < deductionData.amount) {
        return {
          success: false,
          message: `Insufficient balance, current balance: $${currentBalance.toFixed(2)}, required: $${deductionData.amount.toFixed(2)}`
        };
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Calculate new balance
      const newBalance = currentBalance - deductionData.amount;
      const transactionId = 'TXN-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      
      // Update local cache
      this.updateWalletBalance(newBalance);
      
      console.log('Wallet deduction successful:', {
        amount: deductionData.amount,
        oldBalance: currentBalance,
        newBalance: newBalance,
        transactionId: transactionId
      });
      
      return {
        success: true,
        newBalance: newBalance,
        transactionId: transactionId,
        message: 'Wallet deduction successful'
      };
    } catch (error: any) {
      console.error('Failed to deduct from wallet:', error);
      return {
        success: false,
        message: 'Wallet deduction failed, please try again later'
      };
    }
  }

  /**
   * 钱包退款（支付失败时回滚）
   * @param refundData 退款数据
   * @returns 退款响应
   */
  async refundToWallet(refundData: WalletRefundRequest): Promise<WalletRefundResponse> {
    try {
      console.log('=== PaymentService.refundToWallet Debug Info ===');
      console.log('Refund data:', refundData);
      
      // First get current wallet balance (force get latest data from backend)
      const balanceResponse = await this.getWalletBalance(true);
      if (!balanceResponse.success || balanceResponse.balance === undefined) {
        return {
          success: false,
          message: 'Unable to get wallet balance'
        };
      }
      
      const currentBalance = balanceResponse.balance;
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Calculate new balance (refund)
      const newBalance = currentBalance + refundData.amount;
      const refundId = 'REF-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      
      // Update local cache
      this.updateWalletBalance(newBalance);
      
      console.log('Wallet refund successful:', {
        amount: refundData.amount,
        oldBalance: currentBalance,
        newBalance: newBalance,
        refundId: refundId,
        reason: refundData.reason
      });
      
      // Note: Refund wallet balance update handled locally
      // If backend needs additional wallet updates, add here
      console.log('✅ Refund wallet balance update handled locally');
      
      return {
        success: true,
        newBalance: newBalance,
        refundId: refundId,
        message: 'Wallet refund successful'
      };
    } catch (error: any) {
      console.error('Failed to refund to wallet:', error);
      return {
        success: false,
        message: 'Wallet refund failed, please try again later'
      };
    }
  }

  /**
   * 使用钱包支付
   * @param paymentData 支付数据
   * @returns 支付响应
   */
  async payWithWallet(paymentData: PaymentRequest): Promise<PaymentResponse> {
    let orderId: string | undefined = undefined;
    let deductionSuccess = false;
    
    try {
      console.log('=== PaymentService.payWithWallet Debug Info ===');
      console.log('Payment data:', paymentData);
      
      // Create order first
      const orderResult = await this.createOrder(paymentData);
      if (!orderResult.success) {
        return orderResult;
      }
      
      orderId = orderResult.transactionId;
      if (!orderId) {
        return {
          success: false,
          message: 'Order creation failed, order ID not obtained'
        };
      }
      
      console.log('Order created successfully, Order ID:', orderId);
      
      // Deduct from wallet
      const deductionResult = await this.deductFromWallet({
        amount: paymentData.amount,
        orderId: orderId,
        description: `Order payment - ${orderId}`
      });
      
      if (!deductionResult.success) {
        console.log('Wallet deduction failed:', deductionResult.message);
        return {
          success: false,
          message: deductionResult.message || 'Wallet deduction failed'
        };
      }
      
      deductionSuccess = true;
      console.log('Wallet deduction successful, new balance:', deductionResult.newBalance);
      
      // Simulate order processing, rollback if failed
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate order processing result (95% success rate)
      const orderProcessSuccess = Math.random() > 0.05;
      
      if (!orderProcessSuccess) {
        console.log('Order processing failed, attempting refund...');
        
        // Order processing failed, rollback wallet deduction
        const refundResult = await this.refundToWallet({
          amount: paymentData.amount,
          orderId: orderId,
          reason: 'Order processing failed, automatic refund'
        });
        
        if (refundResult.success) {
          console.log('Refund successful, new balance:', refundResult.newBalance);
          return {
            success: false,
            message: 'Order processing failed, automatically refunded to wallet'
          };
        } else {
          console.error('Refund failed:', refundResult.message);
          return {
            success: false,
            message: 'Order processing failed, refund failed, please contact customer service'
          };
        }
      }
      
      // Call backend payOrder interface to update database balance
      const payOrderResult = await this.processPaymentWithBackend({
        orderId: orderId,
        paymentMethod: 'wallet',
        amount: paymentData.amount,
        orderItems: paymentData.orderItems
      });
      
      if (!payOrderResult.success) {
        console.warn('Failed to update backend database via payOrder, but payment was successful');
      } else {
        console.log('✅ Backend database updated successfully via payOrder');
      }
      
      // Note: Wallet balance update handled by /api/order/payOrder interface
      // If backend needs additional wallet updates, add here
      console.log('✅ Wallet balance update handled by payOrder interface');
      
      return {
        success: true,
        transactionId: orderId,
        data: { 
          userId: this.getCurrentUserId(),
          totalPrice: paymentData.amount,
          orderId: orderId,
          paymentMethod: 'wallet',
          newWalletBalance: deductionResult.newBalance,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error: any) {
      console.error('Wallet payment failed:', error);
      
      // If deduction was successful but exception occurred, try rollback
      if (deductionSuccess && orderId) {
        console.log('Payment failed after deduction, attempting refund...');
        try {
          const refundResult = await this.refundToWallet({
            amount: paymentData.amount,
            orderId: orderId,
            reason: 'Payment exception, automatic refund'
          });
          
          if (refundResult.success) {
            console.log('Refund successful after error, new balance:', refundResult.newBalance);
            return {
              success: false,
              message: 'Payment exception, automatically refunded to wallet'
            };
          }
        } catch (refundError) {
          console.error('Refund failed after error:', refundError);
        }
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 'Wallet payment failed'
      };
    }
  }

  /**
   * 使用后端API创建订单
   * @param paymentData 支付数据
   * @returns 支付响应
   */
  async createOrder(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      console.log('=== PaymentService.createOrder Debug Info ===');
      console.log('Order data:', paymentData);
      
      const headers = {
        'Content-Type': 'application/json',
        ...authService.getAuthHeaders()
      };
      
      // Prepare order data according to API spec
      const orderRequest = {
        userId: this.getCurrentUserId(),
        orderTime: new Date().toISOString(),
        orderStatus: 1, // 1 = pending
        discountId: null,
        couponId: null,
        deliveryType: 1, // 1 = standard delivery
        deliveryLocation: paymentData.shippingAddress || 'Default Address',
        items: paymentData.orderItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.price
        }))
      };
      
      console.log('Order request:', orderRequest);
      console.log('Full URL:', `${API_BASE_URL}/order/createOrder`);
      
      const response = await axios.post(`${API_BASE_URL}/order/createOrder`, orderRequest, {
        headers
      });
      
      console.log('Order creation response:', response.data);
      
      if (response.data && response.data.code === 200) {
        const orderId = response.data.data?.orderId || 'ORD-' + Date.now();
        
        return {
          success: true,
          transactionId: orderId,
          data: {
            userId: this.getCurrentUserId(),
            totalPrice: paymentData.amount,
            orderId: orderId,
            paymentMethod: paymentData.paymentMethod,
            timestamp: new Date().toISOString()
          }
        };
      } else {
        return {
          success: false,
          message: response.data?.message || 'Failed to create order'
        };
      }
    } catch (error: any) {
      console.error('Failed to create order:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create order'
      };
    }
  }

  /**
   * 使用后端API处理支付
   * @param paymentData 支付数据
   * @returns 支付响应
   */
  async processPaymentWithBackend(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      console.log('=== PaymentService.processPaymentWithBackend Debug Info ===');
      console.log('=== Frontend to Backend Request Info ===');
      console.log('Request method:', 'POST');
      console.log('Request URL:', `${API_BASE_URL}/order/payOrder`);
      console.log('Payment data:', paymentData);
      
      const headers = {
        'Content-Type': 'application/json',
        ...authService.getAuthHeaders()
      };
      
      // Try multiple possible request formats
      const paymentRequest = {
        // Format 1: Basic fields
        orderId: paymentData.orderId,
        paymentMethod: paymentData.paymentMethod,
        amount: parseFloat(paymentData.amount.toString()),
        userId: parseInt(this.getCurrentUserId().toString()),
        
        // Format 2: Underscore naming
        order_id: paymentData.orderId,
        payment_method: paymentData.paymentMethod,
        payment_amount: parseFloat(paymentData.amount.toString()),
        user_id: parseInt(this.getCurrentUserId().toString()),
        
        // Format 3: Possible amount fields
        orderAmount: parseFloat(paymentData.amount.toString()),
        paymentAmount: parseFloat(paymentData.amount.toString()),
        totalAmount: parseFloat(paymentData.amount.toString()),
        price: parseFloat(paymentData.amount.toString()),
        cost: parseFloat(paymentData.amount.toString()),
        
        // Format 4: Possible other fields
        orderNumber: paymentData.orderId,
        paymentType: paymentData.paymentMethod,
        totalPrice: parseFloat(paymentData.amount.toString()),
        customerId: parseInt(this.getCurrentUserId().toString()),
        
        // Format 5: Time related
        timestamp: new Date().toISOString(),
        paymentTime: new Date().toISOString(),
        createTime: new Date().toISOString(),
        
        // Format 6: Status related
        status: 1,
        paymentStatus: 'completed',
        orderStatus: 'paid'
      };
      
      console.log('Request headers:', headers);
      console.log('Request data:', paymentRequest);
      console.log('Full request URL:', `${API_BASE_URL}/order/payOrder`);
      
      const response = await axios.post(`${API_BASE_URL}/order/payOrder`, paymentRequest, {
        headers,
        timeout: 10000 // 10 second timeout
      });
      
      console.log('=== Backend to Frontend Response Info ===');
      console.log('Response status:', response.status);
      console.log('Response status text:', response.statusText);
      console.log('Response headers:', response.headers);
      console.log('Response data:', response.data);
      console.log('Response data type:', typeof response.data);
      console.log('Response data structure:', JSON.stringify(response.data, null, 2));
      
      if (response.data && response.data.code === 200) {
        console.log('✅ payOrder interface call successful');
        return {
          success: true,
          transactionId: paymentData.orderId,
          data: {
            userId: this.getCurrentUserId(),
            totalPrice: paymentData.amount,
            orderId: paymentData.orderId,
            paymentMethod: paymentData.paymentMethod,
            timestamp: new Date().toISOString()
          }
        };
      } else {
        console.error('❌ payOrder interface returned failure status');
        console.error('Response code:', response.data?.code);
        console.error('Response message:', response.data?.message);
        return {
          success: false,
          message: response.data?.message || 'Payment processing failed'
        };
      }
    } catch (error: any) {
      console.error('=== payOrder interface call failed ===');
      console.error('Error type:', error.name);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      console.error('Request config:', error.config);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      console.error('Response headers:', error.response?.headers);
      
      if (error.code === 'ERR_NETWORK') {
        console.error('❌ Network error: Unable to connect to backend service');
      } else if (error.code === 'ECONNREFUSED') {
        console.error('❌ Connection refused: Backend service may not be started');
      } else if (error.code === 'ETIMEDOUT') {
        console.error('❌ Request timeout: Backend response time too long');
      } else if (error.response) {
        console.error('❌ Backend returned error status code:', error.response.status);
      } else {
        console.error('❌ Unknown error:', error);
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 'Payment processing failed'
      };
    }
  }

  /**
   * 模拟其他支付方式
   * @param paymentData 支付数据
   * @returns 支付响应
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
            userId: this.getCurrentUserId(),
            totalPrice: paymentData.amount,
            orderId: orderResult.transactionId,
            paymentMethod: paymentData.paymentMethod,
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
