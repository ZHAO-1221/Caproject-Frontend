//by HuXintian
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/LogoutSuccess.css';

const LogoutSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="logout-success-page">
      <Header />
      
      <div className="logout-success-container">
        <div className="success-icon-container">
          <div className="success-icon">
            <div className="checkmark"></div>
          </div>
        </div>

        <div className="title-container">
          <h1 className="main-title">Log out success</h1>
        </div>

        <div className="button-container">
          <button onClick={handleLoginClick} className="homepage-button">
            Back to Login
          </button>
          
          <div className="auto-redirect-message">
            Page will automatically redirect to login page in <span className="countdown">{countdown}</span> seconds
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LogoutSuccess;

