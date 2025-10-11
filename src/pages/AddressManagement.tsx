import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import addressService from '../services/addressService';
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
  }, []);

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

      if (response.success && Array.isArray(response.data)) {
        const addressList = response.data.map((loc: any) => {
          const parsed = addressService.parseAddressText(loc.locationText);
          return {
            id: loc.id,
            ...parsed,
            isDefault: loc.isDefault || false
          };
        });
        setAddresses(addressList);
      } else {
        setError(response.message || '加载地址失败');
      }
    } catch (error: any) {
      console.error('Load addresses error:', error);
      setError(error.message || '加载地址失败');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('确定要退出登录吗？')) {
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('isLoggedIn');
      navigate('/logout-success');
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (window.confirm('确定要删除这个地址吗？')) {
      try {
        setError('');
        setSuccess('');

        const response = await addressService.deleteAddress(id);

        if (response.success) {
          setAddresses(prev => prev.filter(addr => addr.id !== id));
          setSuccess('地址删除成功！');
          setTimeout(() => setSuccess(''), 3000);
        } else {
          setError(response.message || '删除失败');
        }
      } catch (error: any) {
        console.error('Delete address error:', error);
        setError(error.message || '删除失败');
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

      if (response.success) {
        // 更新本地状态
        setAddresses(prev => prev.map(addr => ({
          ...addr,
          isDefault: addr.id === id
        })));
        setSuccess('默认地址设置成功！');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.message || '设置默认地址失败');
      }
    } catch (error: any) {
      console.error('Set default address error:', error);
      setError(error.message || '设置默认地址失败');
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.street || !newAddress.building || !newAddress.postal || !newAddress.city) {
      setError('请填写所有必填字段！');
      return;
    }

    if (!/^\d{6}$/.test(newAddress.postal)) {
      setError('请输入有效的6位邮政编码！');
      return;
    }

    try {
      setError('');
      setSuccess('');

      const username = addressService.getCurrentUsername();
      if (!username) {
        navigate('/login');
        return;
      }

      const locationText = addressService.formatAddressText(newAddress);

      const response = await addressService.addAddress({
        username,
        locationText
      });

      if (response.success) {
        // 重新加载地址列表
        await loadAddresses();
        setShowModal(false);
        setNewAddress({ street: '', building: '', postal: '', city: '' });
        setSuccess('地址添加成功！');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.message || '添加失败');
      }
    } catch (error: any) {
      console.error('Add address error:', error);
      setError(error.message || '添加失败');
    }
  };

  return (
    <div className="address-management-page">
      <Header />
      
      <div className="main-content">
        <div className="sidebar">
          <div className="profile-section">
            <div className="profile-picture">
              <img src="/images/user-avatar.svg" alt="User Avatar" />
            </div>
            <div className="profile-name">Tina</div>
          </div>
          <div className="nav-menu">
            <button className="nav-item" onClick={() => navigate('/personal-info')}>
              Account
            </button>
            <button className="nav-item" onClick={() => navigate('/order-history')}>Orders</button>
            <button className="nav-item active">Manage Addresses</button>
            <button className="nav-item">Favourites</button>
            <button className="nav-item">My Coupons</button>
            <button className="nav-item" onClick={handleLogout}>Sign out</button>
          </div>
        </div>
        
        <div className="content-area">
          <h1 className="page-title">Address management</h1>
          
          {loading && <div className="message info-message">加载中...</div>}
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

