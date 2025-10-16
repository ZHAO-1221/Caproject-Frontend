// By (HU XINTIAN)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import registrationService from '../services/registrationService';
import '../styles/Registration.css';

interface RegistrationForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

const Registration: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegistrationForm>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    label: '',
    color: ''
  });

  // 计算密码强度
  const calculatePasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    let label = '';
    let color = '';

    if (password.length === 0) {
      return { score: 0, label: '', color: '' };
    }

    // 长度检查
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;

    // 字符类型检查
    if (/[a-z]/.test(password)) score += 1; // 小写字母
    if (/[A-Z]/.test(password)) score += 1; // 大写字母
    if (/[0-9]/.test(password)) score += 1; // 数字
    if (/[^A-Za-z0-9]/.test(password)) score += 1; // 特殊字符

    // 根据分数确定强度和颜色
    if (score <= 2) {
      label = 'Weak';
      color = '#ff4444';
    } else if (score <= 4) {
      label = 'Medium';
      color = '#ffaa00';
    } else if (score <= 6) {
      label = 'Strong';
      color = '#00aa44';
    } else {
      label = 'Very Strong';
      color = '#0066cc';
    }

    return { score, label, color };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // 对电话号码输入进行特殊处理，只允许数字且最多8位
    if (name === 'phone') {
      // 只保留数字
      const numericValue = value.replace(/\D/g, '');
      // 限制为最多8位
      const limitedValue = numericValue.slice(0, 8);
      
      setFormData(prev => ({
        ...prev,
        [name]: limitedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // 如果是密码字段，计算密码强度
    if (name === 'password') {
      const strength = calculatePasswordStrength(value);
      setPasswordStrength(strength);
    }
    
    if (error) setError('');
  };


  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.username.trim() || !formData.email.trim() || !formData.password || !formData.confirmPassword || !formData.phone.trim()) {
      setError('Please fill in all fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Phone number validation
    if (formData.phone.length !== 8) {
      setError('Phone number must be exactly 8 digits');
      return;
    }

    // Password validation
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.password.length > 28) {
      setError('Password must be 28 characters or less');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // 调用注册API
      const response = await registrationService.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone: formData.phone
      });

      if (response.success) {
        setSuccess('Registration successful! Redirecting to login...');
        // 2秒后跳转到登录页
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(response.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message || 'Network error, please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-page">
      <Header />
      
      <div className="registration-container">
        <div className="create-account-title">
          <p className="create-account-text">Create a new account</p>
          <p className="quick-easy-text">It's quick and easy <span role="img" aria-label="kiss">😘</span></p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleRegister}>
          <div className="input-field">
            <div className="label">User name</div>
            <div className="input">
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="input-value"
                placeholder="Enter your username"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="input-field">
            <div className="label">Email</div>
            <div className="input">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="input-value"
                placeholder="Enter your email (e.g., user@example.com)"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="input-field">
            <div className="label">Phone Number</div>
            <div className="input">
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="input-value"
                placeholder="Enter 8-digit phone number"
                maxLength={8}
                pattern="[0-9]{8}"
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
                placeholder="Enter your password (6-28 characters)"
                maxLength={28}
                required
                disabled={loading}
              />
            </div>
            {/* 密码强度指示器 */}
            {formData.password && (
              <div className="password-strength-container">
                <div className="password-strength-bar">
                  <div 
                    className="password-strength-fill"
                    style={{
                      width: `${(passwordStrength.score / 7) * 100}%`,
                      backgroundColor: passwordStrength.color
                    }}
                  ></div>
                </div>
                <div 
                  className="password-strength-label"
                  style={{ color: passwordStrength.color }}
                >
                  {passwordStrength.label}
                </div>
              </div>
            )}
          </div>

          <div className="input-field">
            <div className="label">Confirm your password</div>
            <div className="input">
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="input-value"
                placeholder="Confirm your password"
                required
                disabled={loading}
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="header-auth">
            <button 
              type="submit" 
              className="button2"
              disabled={loading}
            >
              <div className="div-button">{loading ? 'Registering...' : 'Register'}</div>
            </button>
          </div>
        </form>

        <div className="already-have-account">If you already have a account, please check here</div>

        <div className="div-header-auth">
          <button 
            onClick={() => navigate('/login')} 
            className="button4"
            disabled={loading}
          >
            <div className="div-button">Sign in</div>
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Registration;