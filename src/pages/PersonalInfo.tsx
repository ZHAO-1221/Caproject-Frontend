import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import userService, { PresetAvatarItem } from '../services/userService';
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
  const [avatarList, setAvatarList] = useState<PresetAvatarItem[]>([]);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // 加载用户信息和第一条地址作为默认地址
  useEffect(() => {
    loadUserProfile();
    loadFirstAddress();
    loadAvatars();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
        setUserInfo(prev => ({
          ...prev,
          name: profile.userName || '',
          email: profile.userEmail || '',
          password: '************',
          phone: profile.userPhone || '',
          gender: profile.userGender || 'Unknown',
          // 只有在没有头像或头像为默认头像时才更新；统一使用 /avatars/ 前缀并进行 URL 编码
          avatar: profile.userProfileUrl ? 
          (() => {
            const raw = profile.userProfileUrl.trim();
            const hasSlash = raw.includes('/');
            const built = hasSlash ? encodeURI(raw) : ('/avatars/' + encodeURIComponent(raw));
            return built.replace(/\/+/g, '/');
          })() : 
          (prev.avatar === '/images/user-avatar.svg' ? '/images/user-avatar.svg' : prev.avatar),
          introduce: profile.userIntroduce || '',
          wallet: profile.wallet || 0,
          // 保留现有的地址信息，不重置
          address: prev.address
        }));
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

  const loadAvatars = async () => {
    try {
      const list = await userService.listAvatars();
      console.log('=== 后端返回的头像列表 ===');
      console.log('原始头像列表:', list);
      console.log('头像列表长度:', list.length);
      
      // 如果后端返回的数据有问题，使用本地头像列表作为备用
      if (!list || list.length === 0 || list.every((item: PresetAvatarItem) => item.url === list[0].url)) {
        console.log('后端返回的头像列表有问题，使用本地头像列表');
        const localAvatars = [
          { id: 1, url: 'image_001 .png' },
          { id: 2, url: 'image_002.png' },
          { id: 3, url: 'image_003.png' },
          { id: 4, url: 'image_004.png' },
          { id: 5, url: 'image_005.png' },
          { id: 6, url: 'image_006.png' },
          { id: 7, url: 'image_007.png' },
          { id: 8, url: 'image_008.png' },
          { id: 9, url: 'image_009.png' },
          { id: 10, url: 'image_010.png' },
          { id: 11, url: 'image_011.png' },
          { id: 12, url: 'image_012.png' },
          { id: 13, url: 'image_013.png' },
          { id: 14, url: 'image_014.png' },
          { id: 15, url: 'image_015.png' }
        ];
        setAvatarList(localAvatars);
        return;
      }
      
      list.forEach((item: PresetAvatarItem, index: number) => {
        console.log(`头像${index + 1}:`, {
          id: item.id,
          url: item.url,
          cleanUrl: item.url.replace(/\s+/g, ''),
          displayUrl: item.url.replace(/\s+/g, '').includes('/') ? item.url.replace(/\s+/g, '') : '/images/' + item.url.replace(/\s+/g, '')
        });
      });
      setAvatarList(list);
    } catch (e) {
      console.warn('加载预设头像失败', e);
      console.error('错误详情:', e);
      
      // 如果后端调用失败，使用本地头像列表
      console.log('使用本地头像列表作为备用');
      const localAvatars = [
        { id: 1, url: 'image_001 .png' },
        { id: 2, url: 'image_002.png' },
        { id: 3, url: 'image_003.png' },
        { id: 4, url: 'image_004.png' },
        { id: 5, url: 'image_005.png' },
        { id: 6, url: 'image_006.png' },
        { id: 7, url: 'image_007.png' },
        { id: 8, url: 'image_008.png' },
        { id: 9, url: 'image_009.png' },
        { id: 10, url: 'image_010.png' },
        { id: 11, url: 'image_011.png' },
        { id: 12, url: 'image_012.png' },
        { id: 13, url: 'image_013.png' },
        { id: 14, url: 'image_014.png' },
        { id: 15, url: 'image_015.png' }
      ];
      setAvatarList(localAvatars);
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
        const firstAddress: any = response.data.find((addr: any) => addr.defaultAddress === true) || response.data[0];
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

      // 准备更新数据，使用后端期望的字段名
      const updates: any = {};

      if (field === 'email') {
        updates.userEmail = editValue;
      } else if (field === 'phone') {
        updates.userPhone = editValue;
      } else if (field === 'gender') {
        updates.userGender = editValue;
      } else if (field === 'introduce') {
        updates.userIntroduce = editValue;
      } else if (field === 'name') {
        updates.userName = editValue;
      } else if (field === 'password') {
        // 密码更新需要特殊处理
        const currentUsername = userService.getCurrentUsername();
        if (!currentUsername) {
          setError('无法获取当前用户信息');
          setEditingField(null);
          setEditValue('');
          return;
        }

        // 获取当前密码
        const oldPassword = prompt('请输入当前密码：');
        if (!oldPassword) {
          setEditingField(null);
          setEditValue('');
          return;
        }

        // 获取新密码
        const newPassword = prompt('请输入新密码（至少6位）：');
        if (!newPassword) {
          setEditingField(null);
          setEditValue('');
          return;
        }

        // 验证新密码长度
        if (newPassword.length < 6) {
          alert('新密码长度至少需要6位！');
          setEditingField(null);
          setEditValue('');
          return;
        }

        // 确认新密码
        const confirmPassword = prompt('请再次输入新密码：');
        if (!confirmPassword) {
          setEditingField(null);
          setEditValue('');
          return;
        }

        // 验证两次输入的新密码是否一致
        if (newPassword !== confirmPassword) {
          alert('两次输入的新密码不一致，请重新操作！');
          setEditingField(null);
          setEditValue('');
          return;
        }

        try {
          // 调用密码更新API
          const passwordResponse = await userService.updatePassword({
            username: currentUsername,
            oldPassword: oldPassword,
            newPassword: newPassword
          });

          if (passwordResponse.success) {
            alert('密码更新成功！\n\n为了安全起见，您需要重新登录。\n\n点击确定后将跳转到登录页面。');
            
            // 清除当前认证信息
            sessionStorage.removeItem('user');
            sessionStorage.removeItem('isLoggedIn');
            sessionStorage.removeItem('token');
            
            // 跳转到登录页面
            navigate('/login', { replace: true });
          } else {
            alert(`密码更新失败：${passwordResponse.message || '未知错误'}`);
          }
        } catch (error: any) {
          console.error('密码更新错误:', error);
          alert(`密码更新失败：${error.message || '网络错误，请稍后重试'}`);
        }

        setEditingField(null);
        setEditValue('');
        return;
      }

      // 调用API更新
      const response = await userService.updateUserProfile(updates);

      if (response.success) {
        // 根据字段名正确更新状态
        setUserInfo(prev => ({
          ...prev,
          ...(field === 'email' && { email: editValue }),
          ...(field === 'phone' && { phone: editValue }),
          ...(field === 'gender' && { gender: editValue }),
          ...(field === 'introduce' && { introduce: editValue }),
          ...(field === 'name' && { name: editValue })
        }));
        
        // 如果更新了用户名，弹出alert提醒重新登录
        if (field === 'name') {
          console.log('用户名已更新，需要重新登录');
          setSuccess('用户名更新成功');
          
          // 弹出alert提醒用户重新登录
          alert('用户名已更新成功！\n\n由于安全原因，您需要重新登录以获取新的认证令牌。\n\n点击确定后将跳转到登录页面。');
          
          // 清除当前认证信息
          sessionStorage.removeItem('user');
          sessionStorage.removeItem('isLoggedIn');
          sessionStorage.removeItem('token');
          
          // 跳转到登录页面
          navigate('/login', { replace: true });
          return; // 提前返回，不执行后续的成功提示
        }
        
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

  const handleAvatarClick = async () => {
    // 打开头像选择弹出框并加载头像列表
    setShowAvatarPicker(true);
    try {
      await loadAvatars();
    } catch (error) {
      console.error('加载头像列表失败:', error);
    }
  };

  const handleChooseAvatar = async (avatarUrl: string) => {
    console.log('=== 头像选择调试信息 ===');
    console.log('选择的头像URL:', avatarUrl);
    console.log('当前用户头像状态:', userInfo.avatar);
    
    // 清理URL中的空格和特殊字符
    let cleanUrl = avatarUrl.replace(/\s+/g, ''); // 移除所有空格
    
    // 如果URL不包含路径分隔符，说明只是文件名，需要添加完整路径
    if (!cleanUrl.includes('/')) {
      cleanUrl = '/images/' + cleanUrl;
    }
    
    // 修复双斜杠问题
    cleanUrl = cleanUrl.replace(/\/+/g, '/');
    
    console.log('清理后的URL:', cleanUrl);
    
    // 立即更新前端显示
    setUserInfo(prev => {
      console.log('更新前头像:', prev.avatar);
      const newState = { ...prev, avatar: cleanUrl };
      console.log('更新后头像:', newState.avatar);
      return newState;
    });
    
    // 保存到localStorage以便Header组件同步
    localStorage.setItem('userAvatar', cleanUrl);
    
    setShowAvatarPicker(false);
    setSuccess('头像已更新');
    setTimeout(() => setSuccess(''), 2000);
    
    // 异步更新后端
    try {
      const parts = cleanUrl.split('/');
      const filename = decodeURIComponent(parts[parts.length - 1]);
      console.log('URL分割结果:', parts);
      console.log('提取的文件名:', filename);
      
      const resp = await userService.updateAvatarByFilename(filename);
      console.log('后端更新响应:', resp);
      
      if (resp.success && resp.data?.userProfileUrl) {
        console.log('后端返回的完整URL:', resp.data.userProfileUrl);
        // 规范化后端返回的 URL：编码并在为文件名时加 /avatars/
        let cleanBackendUrl = resp.data.userProfileUrl.trim();
        if (!cleanBackendUrl.includes('/')) {
          cleanBackendUrl = '/avatars/' + encodeURIComponent(cleanBackendUrl);
        } else {
          cleanBackendUrl = encodeURI(cleanBackendUrl);
        }
        cleanBackendUrl = cleanBackendUrl.replace(/\/+/g, '/');
        setUserInfo(prev => ({ ...prev, avatar: cleanBackendUrl }));
        
        // 更新localStorage中的头像
        localStorage.setItem('userAvatar', cleanBackendUrl);
      } else {
        console.log('后端更新失败或未返回URL');
      }
    } catch (error) {
      console.error('后端更新异常:', error);
    }
  };


  return (
    <div className="personal-info-page">
      <Header />
      
      <div className="main-content">
        <div className="sidebar">
          <div className="profile-section">
            <div className="profile-picture" onClick={handleAvatarClick}>
              <img 
                key={userInfo.avatar} // 添加key强制重新渲染
                src={userInfo.avatar} 
                alt="User Avatar" 
                onLoad={() => console.log('头像加载成功:', userInfo.avatar)}
                onError={(e) => {
                  console.log('头像加载失败:', userInfo.avatar);
                  e.currentTarget.src = '/images/user-avatar.svg';
                }}
              />
              <div className="avatar-overlay">
                <span className="change-avatar-text">点击更换头像</span>
              </div>
            </div>
            {/* 头像选择弹层 */}
            {showAvatarPicker && (
              <div className="avatar-picker-modal">
                <div className="avatar-picker">
                  <div className="avatar-picker-header">
                    <span>选择头像</span>
                    <button className="close-button" onClick={() => setShowAvatarPicker(false)}>×</button>
                  </div>
                  <div className="avatar-grid">
                    {avatarList.length === 0 ? (
                      <div style={{ padding: '12px', color: '#999', gridColumn: '1 / -1', textAlign: 'center' }}>
                        正在加载头像列表...
                      </div>
                    ) : (
                      avatarList.map(item => {
                        // 清理URL中的空格
                        let displayUrl = item.url.replace(/\s+/g, '');
                        // 标准化：若无路径则加 /avatars/，再统一编码并去重斜杠
                        if (!displayUrl.includes('/')) {
                          displayUrl = '/avatars/' + displayUrl;
                        }
                        displayUrl = encodeURI(displayUrl).replace(/\/+/g, '/');
                        
                        console.log(`头像${item.id}显示URL:`, displayUrl, '原始URL:', item.url);
                        
                        return (
                          <button
                            key={item.id}
                            className="avatar-item"
                            onClick={() => handleChooseAvatar(displayUrl)}
                          >
                            <img 
                              src={displayUrl} 
                              alt={`avatar-${item.id}`}
                              onLoad={() => console.log(`头像${item.id}加载成功:`, displayUrl)}
                              onError={(e) => {
                                console.log(`头像${item.id}加载失败:`, displayUrl);
                                e.currentTarget.src = '/images/user-avatar.svg';
                              }}
                            />
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}
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

