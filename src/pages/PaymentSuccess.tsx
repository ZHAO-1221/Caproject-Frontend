import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/PaymentSuccess.css';

interface OrderInfo {
  orderId: string;
  amount: number;
  paymentMethod: string;
  items: any[];
  timestamp: string;
}

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);

  useEffect(() => {
    // 加载订单信息
    const lastOrderStr = sessionStorage.getItem('lastOrder');
    if (lastOrderStr) {
      try {
        const orderData = JSON.parse(lastOrderStr);
        setOrderInfo(orderData);
        console.log('Order information:', orderData);
      } catch (error) {
        console.error('Failed to parse order information:', error);
      }
    }

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/home');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleHomeClick = () => {
    navigate('/home');
  };

  return (
    <div className="payment-success-page">
      <Header />
      
      <div className="payment-success-container">
        <div className="success-icon-container">
          <div className="success-icon">
            <div className="checkmark"></div>
          </div>
        </div>

        <div className="title-container">
          <h1 className="main-title">Payment Success</h1>
          {orderInfo && (
            <div className="order-details">
              <div className="order-info-item">
                <span className="label">Order Number:</span>
                <span className="value">{orderInfo.orderId}</span>
              </div>
              <div className="order-info-item">
                <span className="label">Payment Amount:</span>
                <span className="value">${orderInfo.amount.toFixed(2)}</span>
              </div>
              <div className="order-info-item">
                <span className="label">Payment Method:</span>
                <span className="value">
                  {orderInfo.paymentMethod === 'wallet' ? 'My Wallet' : 
                   orderInfo.paymentMethod === 'visa' ? 'VISA' :
                   orderInfo.paymentMethod === 'mc' ? 'MasterCard' :
                   orderInfo.paymentMethod === 'alipay' ? 'Alipay' :
                   orderInfo.paymentMethod === 'gpay' ? 'Google Pay' :
                   orderInfo.paymentMethod === 'apple' ? 'Apple Pay' :
                   orderInfo.paymentMethod === 'wechat' ? 'WeChat Pay' :
                   orderInfo.paymentMethod}
                </span>
              </div>
              <div className="order-info-item">
                <span className="label">Payment Time:</span>
                <span className="value">{new Date(orderInfo.timestamp).toLocaleString('en-US')}</span>
              </div>
            </div>
          )}
        </div>

        <div className="button-container">
          <button onClick={handleHomeClick} className="homepage-button">
            Back to Homepage
          </button>
          
          <div className="auto-redirect-message">
            Page will automatically redirect to homepage in <span className="countdown">{countdown}</span> seconds
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PaymentSuccess;
