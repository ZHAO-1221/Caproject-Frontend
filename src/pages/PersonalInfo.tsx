import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import userService, { UserProfile } from '../services/userService';
import addressService from '../services/addressService';
import authService from '../services/authService';
import '../styles/PersonalInfo.css';

interface UserInfo {
  name: string;
  email: string;
  password: string;
  phone: string;
  gender: string;
  avatar?: string;
  introduce?: string;
  wallet?: number;
  address: {
    street: string;
    building: string;
    postal: string;
    country: string;
  };
}

const PersonalInfo: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '',
    email: '',
    password: '************',
    phone: '',
    gender: 'Unknown',
    avatar: '/images/user-avatar.svg',
    introduce: '',
    wallet: 0,
    address: {
      street: '',
      building: '',
      postal: '',
      country: ''
    }
  });

  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // 加载用户信息和默认地址
  useEffect(() => {
    loadUserProfile();
    loadDefaultAddress();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      const username = userService.getCurrentUsername();
      if (!username) {
        navigate('/login');
        return;
      }

      const response = await userService.getUserProfile(username);
      
      if (response.success && response.data) {
        const profile = response.data;
        setUserInfo({
          name: profile.username,
          email: profile.email,
          password: '************',
          phone: profile.phone,
          gender: profile.gender || 'Unknown',
          avatar: profile.profileUrl || '/images/user-avatar.svg',
          introduce: profile.introduce || '',
          wallet: profile.wallet || 0,
          address: {
            street: '',
            building: '',
            postal: '',
            country: ''
          }
        });
      } else {
        setError(response.message || 'Failed to load user profile');
      }
    } catch (error: any) {
      console.error('Load profile error:', error);
      setError(error.message || 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const loadDefaultAddress = async () => {
    try {
      const username = userService.getCurrentUsername();
      if (!username) {
        return;
      }

      const response = await addressService.getDefaultAddress(username);

      if (response.success && response.data) {
        const loc: any = response.data;
        const parsed = addressService.parseAddressText(loc.locationText);
        setUserInfo(prev => ({
          ...prev,
          address: {
            street: parsed.street,
            building: parsed.building,
            postal: parsed.postal,
            country: parsed.city
          }
        }));
      }
    } catch (error: any) {
      console.error('Load default address error:', error);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('isLoggedIn');
      navigate('/logout-success');
    }
  };

  const handleEdit = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditValue(field === 'password' ? '' : currentValue);
  };

  const handleSave = async (field: string) => {
    if (!editValue.trim()) {
      alert('请输入有效值！');
      return;
    }

    try {
      setError('');
      setSuccess('');

      const username = userService.getCurrentUsername();
      if (!username) {
        navigate('/login');
        return;
      }

      // 准备更新数据
      const updates: any = { username };

      if (field === 'email') {
        updates.email = editValue;
      } else if (field === 'phone') {
        updates.phone = editValue;
      } else if (field === 'gender') {
        updates.gender = editValue;
      } else if (field === 'introduce') {
        updates.introduce = editValue;
      } else if (field === 'password') {
        // 密码更新单独处理
        setEditingField(null);
        setEditValue('');
        return;
      }

      // 调用API更新
      const response = await userService.updateUserProfile(updates);

      if (response.success) {
        setUserInfo(prev => ({
          ...prev,
          [field]: editValue
        }));
        setSuccess('更新成功');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.message || '更新失败');
      }
    } catch (error: any) {
      console.error('Update profile error:', error);
      setError(error.message || '更新失败');
    } finally {
      setEditingField(null);
      setEditValue('');
    }
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValue('');
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        alert('请选择图片文件！');
        return;
      }
      
      // 检查文件大小 (限制为2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('图片大小不能超过2MB！');
        return;
      }

      // 创建FileReader来预览图片
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUserInfo(prev => ({
          ...prev,
          avatar: result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="personal-info-page">
      <Header />
      
      <div className="main-content">
        <div className="sidebar">
          <div className="profile-section">
            <div className="profile-picture" onClick={handleAvatarClick}>
              <img src={userInfo.avatar} alt="User Avatar" />
              <div className="avatar-overlay">
                <span className="change-avatar-text">点击更换头像</span>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <div className="profile-name">{userInfo.name}</div>
          </div>
          <div className="nav-menu">
            <button className="nav-item active">Account</button>
            <button className="nav-item" onClick={() => navigate('/order-history')}>Orders</button>
            <button className="nav-item" onClick={() => navigate('/address-management')}>
              Manage Addresses
            </button>
            <button className="nav-item">My Coupons</button>
            <button className="nav-item" onClick={handleLogout}>Sign out</button>
          </div>
        </div>
        
        <div className="content-area">
          <h1 className="page-title">Personal Information</h1>
          
          {loading && <div className="message info-message">加载中...</div>}
          {error && <div className="message error-message">{error}</div>}
          {success && <div className="message success-message">{success}</div>}
          
          <div className="info-section">
            <div className="info-item">
              <div className="info-label">Name</div>
              <div className="info-content">
                {editingField === 'name' ? (
                  <>
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="edit-input"
                    />
                    <button className="edit-button" onClick={() => handleSave('name')}>Save</button>
                    <button className="cancel-button" onClick={handleCancel}>Cancel</button>
                  </>
                ) : (
                  <>
                    <div className="info-value">{userInfo.name}</div>
                    <button className="edit-button" onClick={() => handleEdit('name', userInfo.name)}>Edit</button>
                  </>
                )}
              </div>
            </div>
            
            <div className="info-item">
              <div className="info-label">Email</div>
              <div className="info-content">
                {editingField === 'email' ? (
                  <>
                    <input
                      type="email"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="edit-input"
                    />
                    <button className="edit-button" onClick={() => handleSave('email')}>Save</button>
                    <button className="cancel-button" onClick={handleCancel}>Cancel</button>
                  </>
                ) : (
                  <>
                    <div className="info-value">{userInfo.email}</div>
                    <button className="edit-button" onClick={() => handleEdit('email', userInfo.email)}>Edit</button>
                  </>
                )}
              </div>
            </div>
            
            <div className="info-item">
              <div className="info-label">Password</div>
              <div className="info-content">
                {editingField === 'password' ? (
                  <>
                    <input
                      type="password"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="edit-input"
                      placeholder="Enter new password"
                    />
                    <button className="edit-button" onClick={() => handleSave('password')}>Save</button>
                    <button className="cancel-button" onClick={handleCancel}>Cancel</button>
                  </>
                ) : (
                  <>
                    <div className="info-value">{userInfo.password}</div>
                    <button className="edit-button" onClick={() => handleEdit('password', userInfo.password)}>Edit</button>
                  </>
                )}
              </div>
            </div>
            
            <div className="info-item">
              <div className="info-label">Contact number</div>
              <div className="info-content">
                {editingField === 'phone' ? (
                  <>
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="edit-input"
                    />
                    <button className="edit-button" onClick={() => handleSave('phone')}>Save</button>
                    <button className="cancel-button" onClick={handleCancel}>Cancel</button>
                  </>
                ) : (
                  <>
                    <div className="info-value">{userInfo.phone}</div>
                    <button className="edit-button" onClick={() => handleEdit('phone', userInfo.phone)}>Edit</button>
                  </>
                )}
              </div>
            </div>
            
            <div className="info-item">
              <div className="info-label">
                Shipping address
                <span className="default-tag">default</span>
              </div>
              <div className="info-content">
                <div className="address-content">
                  <div className="address-line">{userInfo.address.street}</div>
                  <div className="address-line">{userInfo.address.building}</div>
                  <div className="address-line">{userInfo.address.postal}</div>
                  <div className="address-line">{userInfo.address.country}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PersonalInfo;

