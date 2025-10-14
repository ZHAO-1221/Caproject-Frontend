import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService, { LoginRequest } from '../services/authService';
import Header from '../components/Header';
import Footer from '../components/Footer';
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
      const credentials = {
        username: formData.username.trim(),
        password: formData.password.trim()
      };
      const response = await authService.login(credentials);
      
      if (response.success && response.user) {
        setSuccess('登录成功！正在跳转...');
        
        // authService.login() 已经自动保存了认证信息，无需重复调用setUserSession
        
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
      <Header />

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

      <Footer />
    </div>
  );
};

export default Login;
