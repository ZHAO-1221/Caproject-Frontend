import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/PaymentFailed.css';

const PaymentFailed: React.FC = () => {
  const navigate = useNavigate();

  const handleTryAgain = () => {
    // 返回结算页面重试
    navigate('/checkout');
  };

  const handleBackToCart = () => {
    // 返回购物车页面
    navigate('/cart');
  };

  return (
    <div className="payment-page">
      <Header />
      
      <div className="payment-container">
        <div className="payment-content">
          {/* 失败图标 */}
          <div className="payment-icon failed-icon">
            <div className="icon-circle failed-circle">
              <div className="x-mark">✕</div>
            </div>
          </div>
          
          {/* 失败消息 */}
          <div className="payment-message">
            <h1 className="payment-title">Payment Failed</h1>
          </div>
          
          {/* 操作按钮 */}
          <div className="payment-actions">
            <button 
              className="payment-btn secondary-btn"
              onClick={handleTryAgain}
            >
              Try Again
            </button>
            <button 
              className="payment-btn secondary-btn"
              onClick={handleBackToCart}
            >
              Back to cart
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PaymentFailed;
