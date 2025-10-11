import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService, { LoginRequest } from '../services/authService';
import '../styles/Login.css';

const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginRequest>({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // 检查是否已登录
  useEffect(() => {
    if (authService.isLoggedIn()) {
      navigate('/personal-info');
    }
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // 清除错误信息
    if (error) setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 清除之前的消息
    setError('');
    setSuccess('');

    // 验证输入
    if (!formData.username.trim() || !formData.password.trim()) {
      setError('请填写用户名和密码');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.login(formData);
      
      if (response.success && response.user) {
        setSuccess('登录成功！正在跳转...');
        
        // 保存用户信息到sessionStorage
        authService.setUserSession(response.user);
        
        // 延迟跳转到个人信息页面
        setTimeout(() => {
          navigate('/personal-info');
        }, 1500);
      } else {
        setError(response.message || '登录失败，请检查用户名和密码');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || '网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };


  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  const handleSignUp = () => {
    navigate('/registration');
  };

  return (
    <div className="login-container">
      {/* Header */}
      <div className="header">
        <a href="/easter-egg" style={{ textDecoration: 'none' }}>
          <div className="logo">
            <img src="/images/group-six-logo.png" alt="Group Six Logo" />
          </div>
        </a>
        <div className="home">
          <img className="icon" src="/images/home-icon.svg" alt="Home" />
        </div>
        <div className="shopping-cart">
          <img className="div-icon" src="/images/cart-icon.svg" alt="Shopping Cart" />
        </div>
        <a href="/login" style={{ textDecoration: 'none' }}>
          <img className="account-circle-icon" src="/images/user-icon.svg" alt="User Account" />
        </a>
        <div className="search-field">
          <div className="search">Search</div>
        </div>
        <div className="icon-button">
          <div className="menu">
            <img className="icon2" src="/images/menu-icon.svg" alt="Menu" />
          </div>
        </div>
      </div>

      {/* Login Form */}
      <div className="login-form">
        <div className="welcome-container">
          <p className="welcome-back">Welcome back!</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="input-field">
            <div className="label">User name/Email</div>
            <div className="input">
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="input-value"
                placeholder="Enter your username or email"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="input-field">
            <div className="label">Password</div>
            <div className="input">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="input-value"
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="button-container">
            <button
              type="submit"
              className={`button button-primary ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              <div className="button-text">
                {loading ? 'Signing in...' : 'Sign in'}
              </div>
            </button>
          </div>
        </form>

        {/* Messages */}
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="forgot-password">
          Can not remember your password? Please check here
        </div>

        <div className="find-password-container">
          <button
            onClick={handleForgotPassword}
            className="find-password-button"
            disabled={loading}
          >
            <div className="button-text">Find Password</div>
          </button>
        </div>

        <div className="signup-section">
          <div className="signup-text">
            Do not have an account yet? Please check here
          </div>
          <div className="signup-button-container">
            <button
              onClick={handleSignUp}
              className="signup-button"
              disabled={loading}
            >
              <div className="button-text">Sign Up Here</div>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="footer">
        <div className="div-footer">
          <div className="title">
            <a href="/easter-egg" style={{ textDecoration: 'none' }}>
              <div className="footer-logo">
                <img src="/images/group-six-logo.png" alt="Group Six Logo" />
              </div>
            </a>
            <div className="button-list">
              <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">
                <img className="x-logo-icon" src="/images/linkedin-icon.svg" alt="LinkedIn" />
              </a>
              <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer">
                <img className="x-logo-icon" src="/images/youtube-icon.svg" alt="YouTube" />
              </a>
              <a href="https://www.x.com" target="_blank" rel="noopener noreferrer">
                <img className="x-logo-icon" src="/images/x-icon.svg" alt="X (Twitter)" />
              </a>
              <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
                <img className="x-logo-icon" src="/images/instagram-icon.svg" alt="Instagram" />
              </a>
            </div>
          </div>
          <div className="text-link-list">
            <div className="div-title">
              <div className="text-strong">
                <div className="div-text-strong">Contact us</div>
              </div>
            </div>
            <div className="text-link-list-item">
              <div className="list-item">
                Email: <a href="mailto:GroupSix@gmail.com" style={{ color: '#1e1e1e', textDecoration: 'underline' }}>GroupSix@gmail.com</a>
              </div>
            </div>
            <div className="text-link-list-item">
              <div className="list-item">
                Phone: <a href="tel:+6583956478" style={{ color: '#1e1e1e', textDecoration: 'underline' }}>+65 83956478</a>
              </div>
            </div>
            <div className="text-link-list-item">
              <div className="list-item">Address:</div>
            </div>
            <div className="text-link-list-item">
              <div className="list-item">
                <p className="blank-line">
                  <a href="https://maps.google.com/?q=25+Heng+Mui+Keng+Ter,+Singapore+119615" target="_blank" rel="noopener noreferrer" style={{ color: '#1e1e1e', textDecoration: 'underline' }}>
                    25 Heng Mui Keng Ter,
                  </a>
                </p>
                <p className="blank-line">
                  <a href="https://maps.google.com/?q=25+Heng+Mui+Keng+Ter,+Singapore+119615" target="_blank" rel="noopener noreferrer" style={{ color: '#1e1e1e', textDecoration: 'underline' }}>
                    Singapore 119615
                  </a>
                </p>
              </div>
            </div>
          </div>
          <div className="div-text-link-list">
            <div className="title2">
              <div className="text-strong">
                <div className="div-text-strong">Our story</div>
              </div>
            </div>
            <div className="text-link-list-item">
              <div className="list-item">Since 1888</div>
            </div>
            <div className="text-link-list-item">
              <div className="list-item">Centry-old shop</div>
            </div>
            <div className="text-link-list-item">
              <div className="list-item">Development features</div>
            </div>
            <div className="text-link-list-item">
              <div className="list-item">Quality choice</div>
            </div>
            <div className="text-link-list-item">
              <div className="list-item">Intergrity managment</div>
            </div>
          </div>
          <div className="text-link-list2">
            <div className="title2">
              <div className="text-strong">
                <div className="div-text-strong">Terms&Condition</div>
              </div>
            </div>
            <div className="text-link-list-item">
              <div className="list-item">Terms&Conditions</div>
            </div>
            <div className="text-link-list-item">
              <div className="list-item">Privacy Policy</div>
            </div>
            <div className="text-link-list-item">
              <div className="list-item12">Secure payment method</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
