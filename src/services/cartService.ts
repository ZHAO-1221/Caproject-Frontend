// 购物车服务
export interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
  selected: boolean;
  image?: string;
}

class CartService {
  private cartKey = 'shoppingCart';

  // 获取购物车商品
  getCartItems(): CartItem[] {
    try {
      const cartData = localStorage.getItem(this.cartKey);
      return cartData ? JSON.parse(cartData) : [];
    } catch (error) {
      console.error('Error loading cart items:', error);
      return [];
    }
  }

  // 添加商品到购物车
  addToCart(productId: number, productName: string, price: number, quantity: number, image?: string): void {
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
  }

  // 更新商品数量
  updateQuantity(productId: number, quantity: number): void {
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
    }
  }

  // 移除商品
  removeFromCart(productId: number): void {
    const cartItems = this.getCartItems();
    const filteredItems = cartItems.filter(item => item.id !== productId);
    this.saveCartItems(filteredItems);
  }

  // 切换商品选中状态
  toggleItemSelection(productId: number, selected: boolean): void {
    const cartItems = this.getCartItems();
    const itemIndex = cartItems.findIndex(item => item.id === productId);
    
    if (itemIndex > -1) {
      cartItems[itemIndex].selected = selected;
      this.saveCartItems(cartItems);
    }
  }

  // 切换全选状态
  toggleAllSelection(selected: boolean): void {
    const cartItems = this.getCartItems();
    cartItems.forEach(item => {
      item.selected = selected;
    });
    this.saveCartItems(cartItems);
  }

  // 清空购物车
  clearCart(): void {
    localStorage.removeItem(this.cartKey);
  }

  // 立即清空当前购物车（用于初始化）
  clearCurrentCart(): void {
    localStorage.removeItem(this.cartKey);
    console.log('Current cart cleared');
  }

  // 保存购物车数据
  private saveCartItems(items: CartItem[]): void {
    try {
      localStorage.setItem(this.cartKey, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving cart items:', error);
    }
  }

  // 获取购物车商品总数
  getTotalItems(): number {
    const cartItems = this.getCartItems();
    return cartItems.reduce((total, item) => total + item.qty, 0);
  }

  // 获取购物车总价
  getTotalPrice(): number {
    const cartItems = this.getCartItems();
    return cartItems
      .filter(item => item.selected)
      .reduce((total, item) => total + (item.price * item.qty), 0);
  }

  // 移除已购买的商品（支付成功后调用）
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
