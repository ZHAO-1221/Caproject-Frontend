import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/PasswordResetConfirmation.css';

const PasswordResetConfirmation: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="password-reset-page">
      <Header />
      
      <div className="confirmation-container">
        <div className="title-container">
          <h1 className="main-title">Don't Worry</h1>
          <p className="instruction-text">
            we have sent an email to your mailbox to help you retrieve or reset your password
          </p>
        </div>

        <div className="button-section">
          <div className="resend-section">
            <div className="prompt-text">Didn't receive the email? Please check here</div>
            <button 
              onClick={() => navigate('/forgot-password')}
              className="action-button"
            >
              <div className="div-button">Resend Email</div>
            </button>
          </div>

          <div className="signin-section">
            <div className="prompt-text">Already recovered or reset your password? Please check here</div>
            <button 
              onClick={() => navigate('/login')}
              className="action-button"
            >
              <div className="div-button">Sign In</div>
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PasswordResetConfirmation;

