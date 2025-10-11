import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/Cart.css';

type CartItem = {
  id: number;
  name: string;
  price: number; // 单价
  qty: number;   // 数量
  selected: boolean;
};

const CURRENCY = '$';

function formatMoney(value: number): string {
  return `${CURRENCY}${value.toFixed(2)}`;
}

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([
    { id: 1, name: 'product', price: 10, qty: 1, selected: true },
    { id: 2, name: 'product', price: 10, qty: 1, selected: true }
  ]);

  const allSelected = useMemo(() => items.length > 0 && items.every(i => i.selected), [items]);

  const subtotal = useMemo(() => items.filter(i => i.selected).reduce((sum, i) => sum + i.price * i.qty, 0), [items]);
  const shipping = useMemo(() => (subtotal > 0 ? 5 : 0), [subtotal]);
  const tax = useMemo(() => +(subtotal * 0.09).toFixed(2), [subtotal]);
  const grandTotal = useMemo(() => subtotal + shipping + tax, [subtotal, shipping, tax]);

  const toggleAll = (checked: boolean) => {
    setItems(prev => prev.map(i => ({ ...i, selected: checked })));
  };

  const toggleOne = (id: number, checked: boolean) => {
    setItems(prev => prev.map(i => (i.id === id ? { ...i, selected: checked } : i)));
  };

  const changeQty = (id: number, delta: number) => {
    setItems(prev => prev.map(i => (i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)));
  };

  const removeItem = (id: number) => {
    setItems(prev => prev.filter(i => i.id !== id));
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
              <span className="select-all-text">全选</span>
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
                  <img src="/images/placeholder.svg" alt="product" />
                </div>
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-price">{formatMoney(item.price)}</div>
                </div>
                <div className="cart-item-actions">
                  <button className="qty-btn" aria-label="decrease" onClick={() => changeQty(item.id, -1)} disabled={item.qty <= 1}>-</button>
                  <div className="qty-value">{item.qty}</div>
                  <button className="qty-btn" aria-label="increase" onClick={() => changeQty(item.id, 1)}>+</button>
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



