//by MoYundi
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/AdminHeader';
import Footer from '../components/Footer';
import '../styles/AdminLogin.css';
import { adminLogin } from '../services/AdminService';

interface AdminLoginForm {
  employeeNumber: string;
  password: string;
}

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<AdminLoginForm>({
    employeeNumber: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: AdminLoginForm) => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.employeeNumber.trim() || !formData.password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const result = await adminLogin(
        formData.employeeNumber,
        formData.password
      );

      if (result.success) {
        alert('Admin login successful!');
        navigate('/product-management');
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <Header />
      
      <div className="admin-login-container">
        <div className="title-container">
          <p className="admin-title">Background management system</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="input-field">
            <div className="label">Employee Number</div>
            <div className="input">
              <input
                type="text"
                name="employeeNumber"
                value={formData.employeeNumber}
                onChange={handleInputChange}
                className="input-value"
                placeholder="Enter your employee number"
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

          {error && <div className="error-message">{error}</div>}

          <div className="header-auth">
            <button 
              type="submit" 
              className="button2"
              disabled={loading}
            >
              <div className="div-button">{loading ? 'Signing in...' : 'Sign in'}</div>
            </button>
          </div>
        </form>

        <div className="forgot-password">Can not remember your password? Please check here</div>

        <div className="div-header-auth">
          <button 
            onClick={() => navigate('/forgot-password')}
            className="button4"
            disabled={loading}
          >
            <div className="div-button">Find Password</div>
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminLogin;

