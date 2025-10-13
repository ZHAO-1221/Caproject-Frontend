import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import cartService, { CartItem } from '../services/cartService';
import productService from '../services/productService';
import '../styles/Cart.css';

const CURRENCY = '$';

function formatMoney(value: number): string {
  return `${CURRENCY}${value.toFixed(2)}`;
}

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart items from cartService
  useEffect(() => {
    const cartItems = cartService.getCartItems();
    setItems(cartItems);
  }, []);

  const allSelected = useMemo(() => items.length > 0 && items.every(i => i.selected), [items]);

  const subtotal = useMemo(() => items.filter(i => i.selected).reduce((sum, i) => sum + i.price * i.qty, 0), [items]);
  const shipping = useMemo(() => (subtotal > 0 ? 5 : 0), [subtotal]);
  const tax = useMemo(() => +(subtotal * 0.09).toFixed(2), [subtotal]);
  const grandTotal = useMemo(() => subtotal + shipping + tax, [subtotal, shipping, tax]);

  const toggleAll = (checked: boolean) => {
    cartService.toggleAllSelection(checked);
    setItems(cartService.getCartItems());
  };

  const toggleOne = (id: number, checked: boolean) => {
    cartService.toggleItemSelection(id, checked);
    setItems(cartService.getCartItems());
  };

  const changeQty = (id: number, delta: number) => {
    const item = items.find(i => i.id === id);
    if (item) {
      const stockQuantity = productService.getStockQuantity(id);
      const newQty = Math.max(1, Math.min(stockQuantity, item.qty + delta));
      cartService.updateQuantity(id, newQty);
      setItems(cartService.getCartItems());
    }
  };

  const removeItem = (id: number) => {
    cartService.removeFromCart(id);
    setItems(cartService.getCartItems());
  };

  return (
    <div className="cart-page">
      <Header />

      <div className="cart-container">
        <div className="cart-title">My Cart</div>

        <div className="cart-content">
          <div className="cart-list">
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

            {items.length === 0 && (
              <div className="cart-empty">Your cart is empty</div>
            )}

            {items.map(item => (
              <div key={item.id} className="cart-item">
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={item.selected}
                    onChange={(e) => toggleOne(item.id, e.target.checked)}
                  />
                </label>
                <div className="cart-item-thumb">
                  <img src={item.image || "/images/placeholder.svg"} alt={item.name} />
                </div>
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-price">{formatMoney(item.price)}</div>
                </div>
                <div className="cart-item-actions">
                  <button className="qty-btn" aria-label="decrease" onClick={() => changeQty(item.id, -1)} disabled={item.qty <= 1}>-</button>
                  <div className="qty-value">{item.qty}</div>
                  <button 
                    className="qty-btn" 
                    aria-label="increase" 
                    onClick={() => changeQty(item.id, 1)}
                    disabled={item.qty >= productService.getStockQuantity(item.id)}
                  >+</button>
                  <div className="cart-item-subtotal">{formatMoney(item.price * item.qty)}</div>
                  <button className="delete-btn" aria-label="delete" title="Delete" onClick={() => removeItem(item.id)}>
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>

          <aside className="cart-summary">
            <div className="summary-card">
              <div className="summary-title">Order Summary</div>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatMoney(subtotal)}</span>
              </div>
              <div className="summary-row">
                <span>Shopping Estimate</span>
                <span>{formatMoney(shipping)}</span>
              </div>
              <div className="summary-row">
                <span>Tax Estimate</span>
                <span>{formatMoney(tax)}</span>
              </div>

              <div className="summary-divider" />

              <div className="summary-row grand">
                <span>Grand Total</span>
                <span>{formatMoney(grandTotal)}</span>
              </div>

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



