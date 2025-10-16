/**
 * 购物车服务
 * 负责管理用户的购物车数据，包括添加、删除、更新商品等操作
 * by zhou fushun
 */
import productService from './productService';
import authService, { UserInfo } from './authService';

/**
 * 购物车商品接口
 */
export interface CartItem {
  id: number;        // 商品ID
  name: string;      // 商品名称
  price: number;     // 商品价格
  qty: number;       // 商品数量
  selected: boolean; // 是否选中
  image?: string;    // 商品图片
}

/**
 * 扩展用户信息接口，包含用户ID
 */
interface ExtendedUserInfo extends UserInfo {
  userId?: number;
}

/**
 * 购物车服务类
 * 提供购物车的各种操作方法
 */
class CartService {
  private cartKey = 'shoppingCart'; // localStorage中存储购物车数据的键名

  /**
   * 获取购物车中的所有商品
   * @returns 购物车商品列表
   */
  getCartItems(): CartItem[] {
    try {
      const cartData = localStorage.getItem(this.cartKey);
      return cartData ? JSON.parse(cartData) : [];
    } catch (error) {
      console.error('Error loading cart items:', error);
      return [];
    }
  }

  /**
   * 检查用户是否已登录
   * @returns 是否已登录
   */
  private isUserLoggedIn(): boolean {
    const currentUser = authService.getCurrentUser() as ExtendedUserInfo;
    return !!(currentUser && currentUser.userId);
  }

  /**
   * 从后端同步购物车数据
   * @returns 同步结果
   */
  async syncCartFromBackend(): Promise<{success: boolean, message?: string}> {
    try {
      if (!this.isUserLoggedIn()) {
        return { success: false, message: 'User not logged in' };
      }

      const currentUser = authService.getCurrentUser() as ExtendedUserInfo;
      // 这里需要后端提供获取用户购物车的API
      // 暂时返回成功，实际实现需要后端支持
      console.log('Syncing cart from backend for user:', currentUser?.userId);
      return { success: true };
    } catch (error) {
      console.error('Error syncing cart from backend:', error);
      return { success: false, message: 'Failed to sync cart from backend' };
    }
  }

  /**
   * 添加商品到购物车
   * @param productId 商品ID
   * @param productName 商品名称
   * @param price 商品价格
   * @param quantity 商品数量
   * @param image 商品图片URL
   * @returns 添加结果
   */
  async addToCart(productId: number, productName: string, price: number, quantity: number, image?: string): Promise<{success: boolean, message?: string}> {
    try {
      // 先更新本地购物车
      const cartItems = this.getCartItems();
      const existingItemIndex = cartItems.findIndex(item => item.id === productId);

      if (existingItemIndex > -1) {
        // 如果商品已存在，增加数量
        cartItems[existingItemIndex].qty += quantity;
      } else {
        // 如果商品不存在，添加新商品
        cartItems.push({
          id: productId,
          name: productName,
          price: price,
          qty: quantity,
          selected: true,
          image: image
        });
      }

      this.saveCartItems(cartItems);

      // 同步到后端数据库
      if (this.isUserLoggedIn()) {
        const currentUser = authService.getCurrentUser() as ExtendedUserInfo;
        const result = await productService.addToCart(productId, quantity, currentUser!.userId!);
        if (!result.success) {
          console.warn('Failed to sync cart to backend:', result.message);
          return { success: false, message: result.message };
        }
      } else {
        console.log('User not logged in, cart saved locally only');
      }

      return { success: true };
    } catch (error) {
      console.error('Error adding to cart:', error);
      return { success: false, message: 'Failed to add item to cart' };
    }
  }

  /**
   * 更新购物车中商品的数量
   * @param productId 商品ID
   * @param quantity 新的数量
   * @returns 更新结果
   */
  async updateQuantity(productId: number, quantity: number): Promise<{success: boolean, message?: string}> {
    try {
      const cartItems = this.getCartItems();
      const itemIndex = cartItems.findIndex(item => item.id === productId);
      
      if (itemIndex > -1) {
        if (quantity <= 0) {
          // 如果数量为0或负数，移除商品
          cartItems.splice(itemIndex, 1);
        } else {
          cartItems[itemIndex].qty = quantity;
        }
        this.saveCartItems(cartItems);

        // 同步到后端数据库
        if (this.isUserLoggedIn()) {
          if (quantity <= 0) {
            // 移除商品的后端同步逻辑（需要后端支持）
            console.log('Item removed from cart, backend sync needed');
          } else {
            // 更新数量的后端同步逻辑（需要后端支持）
            console.log('Quantity updated, backend sync needed');
          }
        } else {
          console.log('User not logged in, cart updated locally only');
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating quantity:', error);
      return { success: false, message: 'Failed to update quantity' };
    }
  }

  /**
   * 从购物车中移除指定商品
   * @param productId 商品ID
   * @returns 移除结果
   */
  async removeFromCart(productId: number): Promise<{success: boolean, message?: string}> {
    try {
      const cartItems = this.getCartItems();
      const filteredItems = cartItems.filter(item => item.id !== productId);
      this.saveCartItems(filteredItems);

      // 同步到后端数据库
      if (this.isUserLoggedIn()) {
        // 移除商品的后端同步逻辑（需要后端支持）
        console.log('Item removed from cart, backend sync needed');
      } else {
        console.log('User not logged in, cart updated locally only');
      }

      return { success: true };
    } catch (error) {
      console.error('Error removing from cart:', error);
      return { success: false, message: 'Failed to remove item from cart' };
    }
  }

  /**
   * 切换单个商品的选中状态
   * @param productId 商品ID
   * @param selected 是否选中
   */
  toggleItemSelection(productId: number, selected: boolean): void {
    const cartItems = this.getCartItems();
    const itemIndex = cartItems.findIndex(item => item.id === productId);
    
    if (itemIndex > -1) {
      cartItems[itemIndex].selected = selected;
      this.saveCartItems(cartItems);
    }
  }

  /**
   * 切换所有商品的选中状态
   * @param selected 是否选中
   */
  toggleAllSelection(selected: boolean): void {
    const cartItems = this.getCartItems();
    cartItems.forEach(item => {
      item.selected = selected;
    });
    this.saveCartItems(cartItems);
  }

  /**
   * 清空购物车
   */
  clearCart(): void {
    localStorage.removeItem(this.cartKey);
  }

  /**
   * 立即清空当前购物车（用于初始化）
   */
  clearCurrentCart(): void {
    localStorage.removeItem(this.cartKey);
    console.log('Current cart cleared');
  }

  /**
   * 保存购物车数据到本地存储
   * @param items 购物车商品列表
   */
  private saveCartItems(items: CartItem[]): void {
    try {
      localStorage.setItem(this.cartKey, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving cart items:', error);
    }
  }

  /**
   * 获取购物车中商品的总数量
   * @returns 商品总数量
   */
  getTotalItems(): number {
    const cartItems = this.getCartItems();
    return cartItems.reduce((total, item) => total + item.qty, 0);
  }

  /**
   * 获取购物车中选中商品的总价格
   * @returns 总价格
   */
  getTotalPrice(): number {
    const cartItems = this.getCartItems();
    return cartItems
      .filter(item => item.selected)
      .reduce((total, item) => total + (item.price * item.qty), 0);
  }

  /**
   * 移除已购买的商品（支付成功后调用）
   * @param purchasedItems 已购买的商品列表
   */
  removePurchasedItems(purchasedItems: CartItem[]): void {
    const cartItems = this.getCartItems();
    const purchasedIds = purchasedItems.map(item => item.id);
    
    // 过滤掉已购买的商品
    const remainingItems = cartItems.filter(item => !purchasedIds.includes(item.id));
    
    this.saveCartItems(remainingItems);
    console.log(`Removed ${purchasedItems.length} purchased items from cart. Remaining items: ${remainingItems.length}`);
  }
}

export default new CartService();
