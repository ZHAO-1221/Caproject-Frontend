//By (HU XINTIAN)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import addressService from '../services/addressService';
import userService from '../services/userService';
import '../styles/AddressManagement.css';

interface Address {
  id: number;
  street: string;
  building: string;
  postal: string;
  city: string;
  isDefault: boolean;
}

const AddressManagement: React.FC = () => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userInfo, setUserInfo] = useState({
    name: 'User',
    avatar: '/images/user-avatar.svg'
  });

  const [showModal, setShowModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: '',
    building: '',
    postal: '',
    city: ''
  });

  // 加载地址列表
  useEffect(() => {
    loadAddresses();
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await userService.getUserProfile('');
      let avatarUrl = '/images/user-avatar.svg';
      if (profile.data?.userProfileUrl) {
        let cleanUrl = profile.data.userProfileUrl.replace(/\s+/g, '');
        if (!cleanUrl.includes('/')) {
          cleanUrl = '/images/' + cleanUrl;
        }
        avatarUrl = cleanUrl.replace(/\/+/g, '/');
      }
      setUserInfo({
        name: profile.data?.userName || 'User',
        avatar: avatarUrl
      });
    } catch (error) {
      console.log('Failed to load user information:', error);
    }
  };

  const loadAddresses = async () => {
    try {
      setLoading(true);
      setError('');

      const username = addressService.getCurrentUsername();
      if (!username) {
        navigate('/login');
        return;
      }

      const response = await addressService.getAddresses(username);

      // 检查后端返回的格式：{code: 200, data: [...], message: "获取地址列表成功"}
      if (response.code === 200 && Array.isArray(response.data)) {
        const addressList = response.data.map((loc: any) => {
          const parsed = addressService.parseAddressText(loc.locationText);
          return {
            id: loc.locationId || loc.id, // 使用locationId字段
            ...parsed,
            isDefault: loc.defaultAddress || loc.isDefault || false
          };
        });
        setAddresses(addressList);
      } else {
        setError(response.message || 'Failed to get address list');
        setAddresses([]);
      }
    } catch (error: any) {
      console.error('Load addresses error:', error);
      setError('Network error, please try again later');
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };


  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('isLoggedIn');
      navigate('/logout-success');
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        setError('');
        setSuccess('');

        const response = await addressService.deleteAddress(id);

        if (response.code === 200) {
          setAddresses(prev => prev.filter(addr => addr.id !== id));
          setSuccess('Address deleted successfully!');
          setTimeout(() => setSuccess(''), 3000);
        } else {
          setError(response.message || 'Delete failed');
        }
      } catch (error: any) {
        console.error('Delete address error:', error);
        setError(error.message || 'Delete failed');
      }
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      setError('');
      setSuccess('');

      const username = addressService.getCurrentUsername();
      if (!username) {
        navigate('/login');
        return;
      }

      const response = await addressService.setDefaultAddress(id, username);

      if (response.code === 200) {
        // 更新本地状态
        setAddresses(prev => prev.map(addr => ({
          ...addr,
          isDefault: addr.id === id
        })));
        setSuccess('Default address set successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.message || 'Failed to set default address');
      }
    } catch (error: any) {
      console.error('Set default address error:', error);
      setError(error.message || 'Failed to set default address');
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.street || !newAddress.building || !newAddress.postal || !newAddress.city) {
      setError('Please fill in all required fields!');
      return;
    }

    if (!/^\d{6}$/.test(newAddress.postal)) {
      setError('Please enter a valid 6-digit postal code!');
      return;
    }

    try {
      setError('');
      setSuccess('');

      const userId = addressService.getCurrentUserId();
      if (!userId) {
        setError('Unable to get user ID, please log in again');
        navigate('/login');
        return;
      }

      const locationText = addressService.formatAddressText(newAddress);

      console.log('=== Address addition debug info ===');
      console.log('User ID:', userId);
      console.log('Address info:', newAddress);
      console.log('Formatted address text:', locationText);
      
      // 发送后端期望的数据格式
      const addressData = {
        userId: Number(userId),
        locationText: `${newAddress.street}, ${newAddress.building}, ${newAddress.postal}, ${newAddress.city}`,
        postal: Number(newAddress.postal) // 后端期望postal是整数类型
      };
      
      console.log('Data sent to backend:', addressData);

      const response = await addressService.addAddress(addressData);

      console.log('Backend response:', response);

      // 检查后端返回的格式：{code: 200, data: locationId, message: "地址添加成功"}
      if (response.code === 200) {
        setSuccess(response.message || 'Address added successfully!');
        // 重新加载地址列表
        await loadAddresses();
        setShowModal(false);
        setNewAddress({ street: '', building: '', postal: '', city: '' });
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.message || 'Add failed');
      }
    } catch (error: any) {
      console.error('Add address error:', error);
      setError(error.message || 'Add failed');
    }
  };

  return (
    <div className="address-management-page">
      <Header />
      
      <div className="main-content">
        <div className="sidebar">
          <div className="profile-section">
            <div className="profile-picture">
              <img 
                key={userInfo.avatar}
                src={userInfo.avatar} 
                alt="User Avatar"
                onError={(e) => {
                  e.currentTarget.src = '/images/user-avatar.svg';
                }}
              />
            </div>
            <div className="profile-name">{userInfo.name}</div>
          </div>
          <div className="nav-menu">
            <button className="nav-item" onClick={() => navigate('/personal-info')}>
              Account
            </button>
            <button className="nav-item" onClick={() => navigate('/order-history')}>Orders</button>
            <button className="nav-item active">Manage Addresses</button>
            <button className="nav-item" onClick={handleLogout}>Sign out</button>
          </div>
        </div>
        
        <div className="content-area">
          <h1 className="page-title">Address management</h1>
          
          {loading && <div className="message info-message">Loading...</div>}
          {error && <div className="message error-message">{error}</div>}
          {success && <div className="message success-message">{success}</div>}
          
          <div className="address-section">
            {addresses.map((address, index) => (
              <div key={address.id} className="address-item">
                <div className={`address-label ${address.isDefault ? 'default' : ''}`}>
                  Shipping address {address.isDefault ? '' : index}
                </div>
                <div className="address-details">
                  {address.street}<br />
                  {address.building}<br />
                  {address.postal}<br />
                  {address.city}
                </div>
                <div className="address-actions">
                  <button className="delete-button" onClick={() => handleDeleteAddress(address.id)}>
                    Delete
                  </button>
                  <button className="edit-button">Edit</button>
                  {!address.isDefault && (
                    <button className="default-button" onClick={() => handleSetDefault(address.id)}>
                      Set as Default
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            <button 
              className="add-address-button"
              onClick={() => setShowModal(true)}
              disabled={addresses.length >= 5}
            >
              {addresses.length >= 5 ? 'Maximum 5 addresses reached' : 'Add new address'}
            </button>
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      {showModal && (
        <div className="modal" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Add New Address</h2>
              <span className="close" onClick={() => setShowModal(false)}>&times;</span>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleAddAddress(); }}>
              <div className="form-group">
                <label className="form-label" htmlFor="street">Street Address *</label>
                <input
                  type="text"
                  id="street"
                  className="form-input"
                  placeholder="e.g., 12 West Coast Road 05-12"
                  value={newAddress.street}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, street: e.target.value }))}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="building">Building/Unit *</label>
                <input
                  type="text"
                  id="building"
                  className="form-input"
                  placeholder="e.g., The Stellar 12#05-12"
                  value={newAddress.building}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, building: e.target.value }))}
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="postalCode">Postal Code *</label>
                  <input
                    type="text"
                    id="postalCode"
                    className="form-input"
                    placeholder="e.g., 126821"
                    value={newAddress.postal}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, postal: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="city">City *</label>
                  <input
                    type="text"
                    id="city"
                    className="form-input"
                    placeholder="e.g., Singapore"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                    required
                  />
                </div>
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AddressManagement;

