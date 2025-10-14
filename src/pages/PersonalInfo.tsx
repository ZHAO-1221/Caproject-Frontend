import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import userService, { UserProfile } from '../services/userService';
import addressService from '../services/addressService';
import authService from '../services/authService';
import { logNetworkRequest, logNetworkResponse, logNetworkError } from '../utils/networkDebug';
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

  // 加载用户信息和第一条地址作为默认地址
  useEffect(() => {
    loadUserProfile();
    loadFirstAddress();
  }, []);

  // 监听页面焦点变化，当从其他页面返回时重新加载地址
  useEffect(() => {
    const handleFocus = () => {
      console.log('页面获得焦点，重新加载地址信息');
      loadFirstAddress();
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
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

      console.log('=== 获取用户个人信息 ===');
      console.log('前端发送给后端的数据:', { username });
      console.log('请求URL:', `/api/users/me?`);
      
      const response = await userService.getUserProfile(username);
      
      console.log('后端返回给前端的数据:', response);
      
      if (response.success && response.data) {
        const profile = response.data;
        console.log('=== 处理用户信息数据 ===');
        console.log('原始后端数据:', profile);
        
        setUserInfo(prev => ({
          ...prev,
          name: profile.userName || '',
          email: profile.userEmail || '',
          password: '************',
          phone: profile.userPhone || '',
          gender: profile.userGender || 'Unknown',
          avatar: profile.userProfileUrl || '/images/user-avatar.svg',
          introduce: profile.userIntroduce || '',
          wallet: profile.wallet || 0,
          // 保留现有的地址信息，不重置
          address: prev.address
        }));
        
        console.log('=== 映射后的用户信息 ===');
        console.log('用户名:', profile.userName);
        console.log('邮箱:', profile.userEmail);
        console.log('电话:', profile.userPhone);
        console.log('性别:', profile.userGender);
        console.log('头像:', profile.userProfileUrl);
        console.log('介绍:', profile.userIntroduce);
        console.log('钱包:', profile.wallet);
      } else {
        setError(response.message || '加载用户信息失败');
      }
    } catch (error: any) {
      console.log('=== 获取用户信息错误 ===');
      console.log('错误对象:', error);
      console.log('错误消息:', error.message);
      console.log('错误响应:', error.response);
      if (error.response) {
        console.log('错误状态码:', error.response.status);
        console.log('错误响应数据:', error.response.data);
        console.log('错误响应头:', error.response.headers);
      }
      setError(error.message || '加载用户信息失败');
    } finally {
      setLoading(false);
    }
  };

  const loadFirstAddress = async () => {
    try {
      const username = userService.getCurrentUsername();
      if (!username) {
        return;
      }

      console.log('=== 获取用户地址信息 ===');
      console.log('前端发送给后端的数据:', { username });
      console.log('请求URL:', `/api/location/getLocation/?username=${username}`);
      
      const response = await addressService.getAddresses(username);
      
      console.log('后端返回给前端的数据:', response);

      if (response.code === 200 && response.data && Array.isArray(response.data) && response.data.length > 0) {
        // 查找默认地址，如果没有默认地址则使用第一条地址
        const defaultAddress = response.data.find((addr: any) => addr.defaultAddress === true) || response.data[0];
        const firstAddress: any = defaultAddress;
        console.log('=== 处理地址数据 ===');
        console.log('找到的默认地址数据:', firstAddress);
        console.log('是否为默认地址:', firstAddress.defaultAddress);
        
        const parsed = addressService.parseAddressText(firstAddress.locationText);
        console.log('解析后的地址:', parsed);
        
        setUserInfo(prev => ({
          ...prev,
          address: {
            street: parsed.street,
            building: parsed.building,
            postal: parsed.postal,
            country: parsed.city
          }
        }));
        
        console.log('=== 地址设置完成 ===');
        console.log('设置的地址信息:', {
          street: parsed.street,
          building: parsed.building,
          postal: parsed.postal,
          country: parsed.city
        });
      } else {
        console.log('=== 地址数据为空 ===');
        console.log('响应成功:', response.success);
        console.log('响应数据:', response.data);
        console.log('是否为数组:', Array.isArray(response.data));
        console.log('数组长度:', response.data && Array.isArray(response.data) ? response.data.length : 0);
      }
    } catch (error: any) {
      console.log('=== 获取地址信息错误 ===');
      console.log('错误对象:', error);
      console.log('错误消息:', error.message);
      console.log('错误响应:', error.response);
      if (error.response) {
        console.log('错误状态码:', error.response.status);
        console.log('错误响应数据:', error.response.data);
        console.log('错误响应头:', error.response.headers);
      }
    }
  };

  const handleLogout = async () => {
    if (window.confirm('确定要退出登录吗？')) {
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

