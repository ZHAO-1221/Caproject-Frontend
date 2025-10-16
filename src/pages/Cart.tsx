/**
 * Cart Page Component
 * by zhou fushun
 */
import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import cartService, { CartItem } from '../services/cartService';
import productService from '../services/productService';
import '../styles/Cart.css';

// 货币符号常量
const CURRENCY = '$';

/**
 * 格式化金额显示
 * @param value 金额数值
 * @returns 格式化后的金额字符串
 */
function formatMoney(value: number): string {
  return `${CURRENCY}${value.toFixed(2)}`;
}

/**
 * 获取商品图片URL，如果没有则返回占位图
 * @param imageUrl 图片URL
 * @returns 有效的图片URL
 */
function getImageUrl(imageUrl?: string): string {
  if (!imageUrl) {
    return '/images/placeholder.svg';
  }

  return imageUrl;
}

/**
 * 购物车页面组件
 * 显示用户购物车中的商品，支持选择、数量修改、删除等操作
 */
const Cart: React.FC = () => {
  const navigate = useNavigate();
  // 购物车商品列表状态
  const [items, setItems] = useState<CartItem[]>([]);

  /**
   * 组件挂载时加载购物车数据
   * 先尝试从后端同步数据，然后加载本地数据
   */
  useEffect(() => {
    const loadCartItems = async () => {
      // 先尝试从后端同步购物车数据
      const syncResult = await cartService.syncCartFromBackend();
      if (syncResult.success) {
        console.log('Cart synced from backend successfully');
      } else {
        console.warn('Failed to sync cart from backend:', syncResult.message);
      }
      
      // 加载本地购物车数据
      const cartItems = cartService.getCartItems();
      setItems(cartItems);
    };

    loadCartItems();
  }, []);

  // 计算是否所有商品都被选中
  const allSelected = useMemo(() => items.length > 0 && items.every(i => i.selected), [items]);

  // 计算选中商品的小计金额
  const subtotal = useMemo(() => items.filter(i => i.selected).reduce((sum, i) => sum + i.price * i.qty, 0), [items]);
  // 计算运费（有商品时固定5元）
  const shipping = useMemo(() => (subtotal > 0 ? 5 : 0), [subtotal]);
  // 计算税费（9%税率）
  const tax = useMemo(() => +(subtotal * 0.09).toFixed(2), [subtotal]);
  // 计算总金额
  const grandTotal = useMemo(() => subtotal + shipping + tax, [subtotal, shipping, tax]);

  /**
   * 切换所有商品的选中状态
   * @param checked 是否选中
   */
  const toggleAll = (checked: boolean) => {
    cartService.toggleAllSelection(checked);
    setItems(cartService.getCartItems());
  };

  /**
   * 切换单个商品的选中状态
   * @param id 商品ID
   * @param checked 是否选中
   */
  const toggleOne = (id: number, checked: boolean) => {
    cartService.toggleItemSelection(id, checked);
    setItems(cartService.getCartItems());
  };

  /**
   * 修改商品数量
   * @param id 商品ID
   * @param delta 数量变化量（正数增加，负数减少）
   */
  const changeQty = async (id: number, delta: number) => {
    const item = items.find(i => i.id === id);
    if (item) {
      // 获取商品库存数量
      const stockQuantity = productService.getStockQuantityById(id);
      // 计算新数量，确保在1到库存数量之间
      const newQty = Math.max(1, Math.min(stockQuantity, item.qty + delta));
      
      try {
        const result = await cartService.updateQuantity(id, newQty);
        if (result.success) {
          setItems(cartService.getCartItems());
        } else {
          console.error('Failed to update quantity:', result.message);
          alert(`Failed to update quantity: ${result.message}`);
        }
      } catch (error) {
        console.error('Error updating quantity:', error);
        alert('Error occurred while updating quantity');
      }
    }
  };

  /**
   * 从购物车中移除商品
   * @param id 商品ID
   */
  const removeItem = async (id: number) => {
    try {
      const result = await cartService.removeFromCart(id);
      if (result.success) {
        setItems(cartService.getCartItems());
      } else {
        console.error('Failed to remove item:', result.message);
        alert(`Failed to remove item: ${result.message}`);
      }
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Error occurred while removing item');
    }
  };

  return (
    <div className="cart-page">
      <Header />

      <div className="cart-container">
        {/* 购物车标题 */}
        <div className="cart-title">My Cart</div>

        <div className="cart-content">
          {/* 购物车商品列表 */}
          <div className="cart-list">
            {/* 全选控制区域 */}
            <div className="cart-list-header">
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => toggleAll(e.target.checked)}
                />
              </label>
              <span className="select-all-text">Select All</span>
            </div>

            {/* 购物车为空时的提示 */}
            {items.length === 0 && (
              <div className="cart-empty">Your cart is empty</div>
            )}

            {/* 购物车商品列表 */}
            {items.map(item => (
              <div key={item.id} className="cart-item">
                {/* 商品选择复选框 */}
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={item.selected}
                    onChange={(e) => toggleOne(item.id, e.target.checked)}
                  />
                </label>
                {/* 商品缩略图 */}
                <div className="cart-item-thumb">
                  <img src={getImageUrl(item.image) || "/images/placeholder.svg"} alt={item.name} />
                </div>
                {/* 商品信息 */}
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-price">{formatMoney(item.price)}</div>
                </div>
                {/* 商品操作区域 */}
                <div className="cart-item-actions">
                  {/* 减少数量按钮 */}
                  <button className="qty-btn" aria-label="decrease" onClick={() => changeQty(item.id, -1)} disabled={item.qty <= 1}>-</button>
                  {/* 当前数量显示 */}
                  <div className="qty-value">{item.qty}</div>
                  {/* 增加数量按钮 */}
                  <button 
                    className="qty-btn" 
                    aria-label="increase" 
                    onClick={() => changeQty(item.id, 1)}
                    disabled={item.qty >= productService.getStockQuantityById(item.id)}
                  >+</button>
                  {/* 商品小计 */}
                  <div className="cart-item-subtotal">{formatMoney(item.price * item.qty)}</div>
                  {/* 删除按钮 */}
                  <button className="delete-btn" aria-label="delete" title="Delete" onClick={() => removeItem(item.id)}>
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 订单摘要侧边栏 */}
          <aside className="cart-summary">
            <div className="summary-card">
              <div className="summary-title">Order Summary</div>
              {/* 小计 */}
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatMoney(subtotal)}</span>
              </div>
              {/* 运费估算 */}
              <div className="summary-row">
                <span>Shopping Estimate</span>
                <span>{formatMoney(shipping)}</span>
              </div>
              {/* 税费估算 */}
              <div className="summary-row">
                <span>Tax Estimate</span>
                <span>{formatMoney(tax)}</span>
              </div>

              <div className="summary-divider" />

              {/* 总金额 */}
              <div className="summary-row grand">
                <span>Grand Total</span>
                <span>{formatMoney(grandTotal)}</span>
              </div>

              {/* 结算按钮 */}
              <button className="checkout-btn" onClick={() => navigate('/checkout', { state: { selectedItems: items.filter(item => item.selected) } })}>Checkout</button>
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Cart;



