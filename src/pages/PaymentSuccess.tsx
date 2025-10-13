import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/PaymentSuccess.css';

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
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
