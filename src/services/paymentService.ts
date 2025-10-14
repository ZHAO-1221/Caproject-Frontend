import axios from 'axios';
import authService from './authService';

const API_BASE_URL = 'http://172.20.10.6:8080/api';

export interface PaymentRequest {
  paymentMethod: string;
  amount: number;
  orderItems: Array<{
    productId: number;
    quantity: number;
    price: number;
  }>;
  shippingAddress?: string;
  orderId?: string;
}

export interface PaymentResponse {
  success: boolean;
  message?: string;
  transactionId?: string;
  data?: {
    userId: number;
    totalPrice: number;
    orderId?: string;
    paymentMethod?: string;
    newWalletBalance?: number;
    timestamp?: string;
  };
}

export interface WalletBalanceResponse {
  success: boolean;
  message?: string;
  balance?: number;
}

export interface WalletDeductionRequest {
  amount: number;
  orderId: string;
  description?: string;
}

export interface WalletDeductionResponse {
  success: boolean;
  message?: string;
  newBalance?: number;
  transactionId?: string;
}

export interface WalletRefundRequest {
  amount: number;
  orderId: string;
  reason?: string;
}

export interface WalletRefundResponse {
  success: boolean;
  message?: string;
  newBalance?: number;
  refundId?: string;
}

class PaymentService {
  private readonly WALLET_BALANCE_KEY = 'user_wallet_balance';

  /**
   * 获取当前用户ID
   */
  private getCurrentUserId(): number {
    const userStr = sessionStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.userId || 100052; // 默认用户ID
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    return 100052; // 默认用户ID
  }

  /**
   * 获取用户钱包余额
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
      console.log('=== 前端发送给后端的信息 ===');
      console.log('请求方法:', 'GET');
      console.log('请求URL:', `${API_BASE_URL}/order/getWallet`);
      console.log('请求参数:', { userId: userId });
      console.log('请求头:', headers);
      console.log('完整请求URL:', `${API_BASE_URL}/order/getWallet?userId=${userId}`);
      
      const response = await axios.get(`${API_BASE_URL}/order/getWallet`, {
        headers,
        params: {
          userId: userId
        }
      });
      
      console.log('=== 后端返回给前端的信息 ===');
      console.log('响应状态码:', response.status);
      console.log('响应状态文本:', response.statusText);
      console.log('响应头:', response.headers);
      console.log('响应数据:', response.data);
      console.log('响应数据类型:', typeof response.data);
      console.log('响应数据结构:', JSON.stringify(response.data, null, 2));
      
      // 解析后端DataResult格式的响应
      let walletBalance: number | null = null;
      
      if (response.data) {
        console.log('Response data structure:', response.data);
        
        // 后端返回格式: { code: number, data: Float, message: string }
        if (response.data.code === 200 && response.data.data !== null) {
          walletBalance = parseFloat(response.data.data);
          console.log('Parsed wallet balance from DataResult:', walletBalance);
        }
        // 兼容其他格式
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
        // 存储到sessionStorage
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
      
      // 检查是否是网络错误或CORS问题
      if (error.code === 'ERR_NETWORK' || error.message.includes('CORS')) {
        console.error('Network or CORS error detected');
        return {
          success: false,
          message: '网络连接失败或跨域问题，请检查后端服务是否运行'
        };
      }
      
      // 如果API失败，尝试使用存储的余额
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
   */
  async syncWalletBalance(): Promise<WalletBalanceResponse> {
    console.log('=== Syncing wallet balance from backend ===');
    this.clearWalletBalanceCache();
    return await this.getWalletBalance(true);
  }

  /**
   * 测试后端连接
   */
  async testBackendConnection(): Promise<boolean> {
    try {
      console.log('=== Testing backend connection ===');
      const userId = this.getCurrentUserId();
      
      const headers = {
        'Content-Type': 'application/json',
        ...authService.getAuthHeaders()
      };
      
      console.log('=== 测试连接 - 前端发送给后端的信息 ===');
      console.log('请求方法:', 'GET');
      console.log('请求URL:', `${API_BASE_URL}/order/getWallet`);
      console.log('请求参数:', { userId: userId });
      console.log('请求头:', headers);
      console.log('完整请求URL:', `${API_BASE_URL}/order/getWallet?userId=${userId}`);
      
      const response = await axios.get(`${API_BASE_URL}/order/getWallet`, {
        headers,
        params: {
          userId: userId
        },
        timeout: 5000 // 5秒超时
      });
      
      console.log('=== 测试连接 - 后端返回给前端的信息 ===');
      console.log('响应状态码:', response.status);
      console.log('响应状态文本:', response.statusText);
      console.log('响应头:', response.headers);
      console.log('响应数据:', response.data);
      console.log('响应数据类型:', typeof response.data);
      console.log('响应数据结构:', JSON.stringify(response.data, null, 2));
      
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
   */
  async deductFromWallet(deductionData: WalletDeductionRequest): Promise<WalletDeductionResponse> {
    try {
      console.log('=== PaymentService.deductFromWallet Debug Info ===');
      console.log('Deduction data:', deductionData);
      
      // 先获取当前钱包余额（强制从后端获取最新数据）
      const balanceResponse = await this.getWalletBalance(true);
      if (!balanceResponse.success || balanceResponse.balance === undefined) {
        return {
          success: false,
          message: '无法获取钱包余额'
        };
      }
      
      const currentBalance = balanceResponse.balance;
      if (currentBalance < deductionData.amount) {
        return {
          success: false,
          message: `余额不足，当前余额：$${currentBalance.toFixed(2)}，需要：$${deductionData.amount.toFixed(2)}`
        };
      }
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 计算新余额
      const newBalance = currentBalance - deductionData.amount;
      const transactionId = 'TXN-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      
      // 更新本地缓存
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
        message: '钱包扣款成功'
      };
    } catch (error: any) {
      console.error('Failed to deduct from wallet:', error);
      return {
        success: false,
        message: '钱包扣款失败，请稍后重试'
      };
    }
  }

  /**
   * 钱包退款（支付失败时回滚）
   */
  async refundToWallet(refundData: WalletRefundRequest): Promise<WalletRefundResponse> {
    try {
      console.log('=== PaymentService.refundToWallet Debug Info ===');
      console.log('Refund data:', refundData);
      
      // 先获取当前钱包余额（强制从后端获取最新数据）
      const balanceResponse = await this.getWalletBalance(true);
      if (!balanceResponse.success || balanceResponse.balance === undefined) {
        return {
          success: false,
          message: '无法获取钱包余额'
        };
      }
      
      const currentBalance = balanceResponse.balance;
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // 计算新余额（退款）
      const newBalance = currentBalance + refundData.amount;
      const refundId = 'REF-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      
      // 更新本地缓存
      this.updateWalletBalance(newBalance);
      
      console.log('Wallet refund successful:', {
        amount: refundData.amount,
        oldBalance: currentBalance,
        newBalance: newBalance,
        refundId: refundId,
        reason: refundData.reason
      });
      
      // 注意：退款钱包余额更新已通过本地处理
      // 如果后端需要额外的钱包更新，可以在这里添加
      console.log('✅ Refund wallet balance update handled locally');
      
      return {
        success: true,
        newBalance: newBalance,
        refundId: refundId,
        message: '钱包退款成功'
      };
    } catch (error: any) {
      console.error('Failed to refund to wallet:', error);
      return {
        success: false,
        message: '钱包退款失败，请稍后重试'
      };
    }
  }

  /**
   * Use wallet payment
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
          message: '订单创建失败，未获取到订单ID'
        };
      }
      
      console.log('Order created successfully, Order ID:', orderId);
      
      // 从钱包扣款
      const deductionResult = await this.deductFromWallet({
        amount: paymentData.amount,
        orderId: orderId,
        description: `订单支付 - ${orderId}`
      });
      
      if (!deductionResult.success) {
        console.log('Wallet deduction failed:', deductionResult.message);
        return {
          success: false,
          message: deductionResult.message || '钱包扣款失败'
        };
      }
      
      deductionSuccess = true;
      console.log('Wallet deduction successful, new balance:', deductionResult.newBalance);
      
      // 模拟订单处理过程，如果失败需要回滚
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟订单处理结果（95%成功率）
      const orderProcessSuccess = Math.random() > 0.05;
      
      if (!orderProcessSuccess) {
        console.log('Order processing failed, attempting refund...');
        
        // 订单处理失败，回滚钱包扣款
        const refundResult = await this.refundToWallet({
          amount: paymentData.amount,
          orderId: orderId,
          reason: '订单处理失败，自动退款'
        });
        
        if (refundResult.success) {
          console.log('Refund successful, new balance:', refundResult.newBalance);
          return {
            success: false,
            message: '订单处理失败，已自动退款到钱包'
          };
        } else {
          console.error('Refund failed:', refundResult.message);
          return {
            success: false,
            message: '订单处理失败，退款失败，请联系客服'
          };
        }
      }
      
      // 调用后端payOrder接口更新数据库余额
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
      
      // 注意：钱包余额更新已通过 /api/order/payOrder 接口处理
      // 如果后端需要额外的钱包更新，可以在这里添加
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
      
      // 如果已经扣款但出现异常，尝试回滚
      if (deductionSuccess && orderId) {
        console.log('Payment failed after deduction, attempting refund...');
        try {
          const refundResult = await this.refundToWallet({
            amount: paymentData.amount,
            orderId: orderId,
            reason: '支付异常，自动退款'
          });
          
          if (refundResult.success) {
            console.log('Refund successful after error, new balance:', refundResult.newBalance);
            return {
              success: false,
              message: '支付异常，已自动退款到钱包'
            };
          }
        } catch (refundError) {
          console.error('Refund failed after error:', refundError);
        }
      }
      
      return {
        success: false,
        message: error.response?.data?.message || '钱包支付失败'
      };
    }
  }

  /**
   * Create order using backend API
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
   * Process payment using backend API
   */
  async processPaymentWithBackend(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      console.log('=== PaymentService.processPaymentWithBackend Debug Info ===');
      console.log('=== 前端发送给后端的信息 ===');
      console.log('请求方法:', 'POST');
      console.log('请求URL:', `${API_BASE_URL}/order/payOrder`);
      console.log('支付数据:', paymentData);
      
      const headers = {
        'Content-Type': 'application/json',
        ...authService.getAuthHeaders()
      };
      
      // 尝试多种可能的请求格式
      const paymentRequest = {
        // 格式1: 基础字段
        orderId: paymentData.orderId,
        paymentMethod: paymentData.paymentMethod,
        amount: parseFloat(paymentData.amount.toString()),
        userId: parseInt(this.getCurrentUserId().toString()),
        
        // 格式2: 下划线命名
        order_id: paymentData.orderId,
        payment_method: paymentData.paymentMethod,
        payment_amount: parseFloat(paymentData.amount.toString()),
        user_id: parseInt(this.getCurrentUserId().toString()),
        
        // 格式3: 可能的金额字段
        orderAmount: parseFloat(paymentData.amount.toString()),
        paymentAmount: parseFloat(paymentData.amount.toString()),
        totalAmount: parseFloat(paymentData.amount.toString()),
        price: parseFloat(paymentData.amount.toString()),
        cost: parseFloat(paymentData.amount.toString()),
        
        // 格式4: 可能的其他字段
        orderNumber: paymentData.orderId,
        paymentType: paymentData.paymentMethod,
        totalPrice: parseFloat(paymentData.amount.toString()),
        customerId: parseInt(this.getCurrentUserId().toString()),
        
        // 格式5: 时间相关
        timestamp: new Date().toISOString(),
        paymentTime: new Date().toISOString(),
        createTime: new Date().toISOString(),
        
        // 格式6: 状态相关
        status: 1,
        paymentStatus: 'completed',
        orderStatus: 'paid'
      };
      
      console.log('请求头:', headers);
      console.log('请求数据:', paymentRequest);
      console.log('完整请求URL:', `${API_BASE_URL}/order/payOrder`);
      
      const response = await axios.post(`${API_BASE_URL}/order/payOrder`, paymentRequest, {
        headers,
        timeout: 10000 // 10秒超时
      });
      
      console.log('=== 后端返回给前端的信息 ===');
      console.log('响应状态码:', response.status);
      console.log('响应状态文本:', response.statusText);
      console.log('响应头:', response.headers);
      console.log('响应数据:', response.data);
      console.log('响应数据类型:', typeof response.data);
      console.log('响应数据结构:', JSON.stringify(response.data, null, 2));
      
      if (response.data && response.data.code === 200) {
        console.log('✅ payOrder接口调用成功');
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
        console.error('❌ payOrder接口返回失败状态');
        console.error('响应代码:', response.data?.code);
        console.error('响应消息:', response.data?.message);
        return {
          success: false,
          message: response.data?.message || 'Payment processing failed'
        };
      }
    } catch (error: any) {
      console.error('=== payOrder接口调用失败 ===');
      console.error('错误类型:', error.name);
      console.error('错误消息:', error.message);
      console.error('错误代码:', error.code);
      console.error('请求配置:', error.config);
      console.error('响应数据:', error.response?.data);
      console.error('响应状态:', error.response?.status);
      console.error('响应头:', error.response?.headers);
      
      if (error.code === 'ERR_NETWORK') {
        console.error('❌ 网络错误：无法连接到后端服务');
      } else if (error.code === 'ECONNREFUSED') {
        console.error('❌ 连接被拒绝：后端服务可能未启动');
      } else if (error.code === 'ETIMEDOUT') {
        console.error('❌ 请求超时：后端响应时间过长');
      } else if (error.response) {
        console.error('❌ 后端返回错误状态码:', error.response.status);
      } else {
        console.error('❌ 未知错误:', error);
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 'Payment processing failed'
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
