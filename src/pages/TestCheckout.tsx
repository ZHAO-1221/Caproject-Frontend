import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/Checkout.css';

const TestCheckout: React.FC = () => {
  const [selectedPayment, setSelectedPayment] = useState('credit-card');

  // 模拟购物车数据
  const cartItems = [
    {
      id: 1,
      name: 'Wireless Headphones',
      price: 99.99,
      quantity: 1,
      image: '/images/placeholder.svg'
    },
    {
      id: 2,
      name: 'Smart Watch',
      price: 199.99,
      quantity: 1,
      image: '/images/placeholder.svg'
    }
  ];

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 10.00;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <div className="checkout-page">
      <Header />
      
      <main className="main-content">
        <div className="container">
          <div style={{
            backgroundColor: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <strong style={{ color: '#856404' }}>⚠️ 测试模式 - 只读页面</strong>
            <p style={{ color: '#856404', margin: '5px 0 0 0', fontSize: '14px' }}>
              此页面仅用于测试UI界面，不会修改任何数据或执行实际支付操作
            </p>
          </div>
          <h1 className="checkout-title">Checkout (Test Mode)</h1>
          
          <div className="checkout-content">
            {/* 地址信息 */}
            <div className="checkout-section">
              <h2>Shipping Address</h2>
              <div className="address-info">
                <p><strong>Default Address:</strong></p>
                <p>12 West Coast Road</p>
                <p>The Stellar #05-12</p>
                <p>Singapore 126821</p>
                <button className="btn btn-secondary">Change Address</button>
              </div>
            </div>

            {/* 支付方式 */}
            <div className="checkout-section">
              <h2>Payment Method</h2>
              <div className="payment-methods">
                <label className="payment-option">
                  <input
                    type="radio"
                    name="payment"
                    value="credit-card"
                    checked={selectedPayment === 'credit-card'}
                    onChange={(e) => setSelectedPayment(e.target.value)}
                  />
                  <span>Credit Card</span>
                </label>
                <label className="payment-option">
                  <input
                    type="radio"
                    name="payment"
                    value="paypal"
                    checked={selectedPayment === 'paypal'}
                    onChange={(e) => setSelectedPayment(e.target.value)}
                  />
                  <span>PayPal</span>
                </label>
                <label className="payment-option">
                  <input
                    type="radio"
                    name="payment"
                    value="bank-transfer"
                    checked={selectedPayment === 'bank-transfer'}
                    onChange={(e) => setSelectedPayment(e.target.value)}
                  />
                  <span>Bank Transfer</span>
                </label>
              </div>
            </div>

            {/* 订单摘要 */}
            <div className="checkout-section">
              <h2>Order Summary</h2>
              <div className="order-items">
                {cartItems.map((item) => (
                  <div key={item.id} className="order-item">
                    <img src={item.image} alt={item.name} className="item-image" />
                    <div className="item-details">
                      <h3>{item.name}</h3>
                      <p>Quantity: {item.quantity}</p>
                      <p className="item-price">${item.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="order-totals">
                <div className="total-line">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="total-line">
                  <span>Shipping:</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="total-line">
                  <span>Tax:</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="total-line total-final">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* 结账按钮 */}
            <div className="checkout-actions">
              <button className="btn btn-primary btn-large" disabled style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                Complete Order (Test Mode - Disabled)
              </button>
              <button className="btn btn-secondary" disabled style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                Back to Cart (Test Mode - Disabled)
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TestCheckout;
