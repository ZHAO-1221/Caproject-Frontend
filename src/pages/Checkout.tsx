import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/Checkout.css';

type CartItem = {
  id: number;
  name: string;
  price: number;
  qty: number;
  selected: boolean;
};

const CURRENCY = '$';

function formatMoney(value: number): string {
  return `${CURRENCY}${value.toFixed(2)}`;
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 从购物车传递的选中商品数据，如果没有则使用默认数据
  const selectedItems = location.state?.selectedItems || [
    { id: 1, name: 'product', price: 10, qty: 1, selected: true },
    { id: 2, name: 'product', price: 10, qty: 1, selected: true }
  ];
  
  const [items, setItems] = useState<CartItem[]>(selectedItems);

  // 增加商品数量
  const increaseQuantity = (itemId: number) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId 
          ? { ...item, qty: item.qty + 1 }
          : item
      )
    );
  };

  // 减少商品数量
  const decreaseQuantity = (itemId: number) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId && item.qty > 1
          ? { ...item, qty: item.qty - 1 }
          : item
      )
    );
  };

  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.qty, 0), [items]);
  const shipping = useMemo(() => (subtotal > 0 ? 5 : 0), [subtotal]);
  const tax = useMemo(() => +(subtotal * 0.09).toFixed(2), [subtotal]);
  const grandTotal = useMemo(() => subtotal + shipping + tax, [subtotal, shipping, tax]);

  return (
    <div className="checkout-page">
      <Header />

      <div className="checkout-container">
        <div className="checkout-grid">
          <section className="address-section">
            <div className="section-title center">确认收货地址</div>
            <button className="manage-btn">Manage Addresses</button>
            <div className="address-list">
              <div className="address-card">地址1</div>
              <div className="address-card">地址2</div>
              <div className="address-card">地址3</div>
            </div>
          </section>

          <section className="order-section">
            <div className="section-title center">确认订单信息</div>
            <div className="order-wrapper">
              {items.map(item => (
                <div key={item.id} className="order-card">
                  <div className="order-thumb" />
                  <div className="order-info">
                    <div className="order-name">{item.name}</div>
                    <div className="order-price">{formatMoney(item.price)}</div>
                  </div>
                  <div className="order-actions">
                    <button 
                      className="qty-btn" 
                      onClick={() => decreaseQuantity(item.id)}
                      disabled={item.qty <= 1}
                    >
                      -
                    </button>
                    <div className="qty-value">{item.qty}</div>
                    <button 
                      className="qty-btn" 
                      onClick={() => increaseQuantity(item.id)}
                    >
                      +
                    </button>
                    <div className="order-subtotal">{formatMoney(item.price * item.qty)}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="summary-section">
            <div className="summary-card">
              <div className="summary-title">Order Summary</div>
              <div className="summary-row"><span>Subtotal</span><span>{formatMoney(subtotal)}</span></div>
              <div className="summary-row"><span>Shopping Estimate</span><span>{formatMoney(shipping)}</span></div>
              <div className="summary-row"><span>Tax Estimate</span><span>{formatMoney(tax)}</span></div>
              <div className="summary-row"><span>Select Coupon</span><span>▾</span></div>
              <div className="summary-divider" />
              <div className="summary-row grand"><span>Grand Total</span><span>{formatMoney(grandTotal)}</span></div>
              <div className="pay-methods">
                <div className="pay-title">select payment method</div>
                <div className="pay-icons">
                  <span className="pm visa">VISA</span>
                  <span className="pm mc">MC</span>
                  <span className="pm alipay">Alipay</span>
                  <span className="pm gpay">GPay</span>
                  <span className="pm apple">Apple</span>
                  <span className="pm wechat">WeChat</span>
                </div>
              </div>
              <button className="pay-btn">Pay</button>
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Checkout;


