import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/ForgotPassword.css';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSendEmail = async () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');
    
    // TODO: Implement send email API call
    setTimeout(() => {
      setLoading(false);
      setEmailSent(true);
      setSuccess('Verification code sent to your email');
    }, 1000);
  };

  const handleNextStep = () => {
    if (!verificationCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    // TODO: Verify code with backend
    navigate('/password-reset-confirmation');
  };

  return (
    <div className="forgot-password-page">
      <Header />
      
      <div className="forgot-password-container">
        <div className="title-container">
          <p className="find-password-title">Find Password</p>
        </div>

        <div className="input-section">
          <div className="email-section">
            <div className="label">Email</div>
            <div className="input-row">
              <div className="input">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  className="input-value"
                  placeholder="Enter your email"
                  disabled={emailSent}
                  required
                />
              </div>
              <button 
                onClick={handleSendEmail} 
                className="send-email-button"
                disabled={loading || emailSent}
              >
                <div className="div-button">
                  {loading ? 'Sending...' : emailSent ? 'Sent' : 'Send Email'}
                </div>
              </button>
            </div>
          </div>

          <div className="verification-section">
            <div className="label">Verification code</div>
            <div className="input">
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => {
                  setVerificationCode(e.target.value);
                  setError('');
                }}
                className="input-value"
                placeholder="Enter verification code"
                disabled={!emailSent}
                required
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="next-step-section">
            <button 
              onClick={handleNextStep}
              className="next-step-button"
              disabled={!emailSent || !verificationCode}
            >
              <div className="div-button">Next Step</div>
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ForgotPassword;

