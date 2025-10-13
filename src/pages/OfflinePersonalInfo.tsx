import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/PersonalInfo.css';

const OfflinePersonalInfo: React.FC = () => {
  const navigate = useNavigate();
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // 离线用户数据
  const [userInfo, setUserInfo] = useState({
    name: 'Admin User',
    email: 'admin@example.com',
    password: '************',
    phone: '+65 1234 5678',
    gender: 'Male',
    avatar: '/images/user-avatar.svg',
    introduce: 'This is a demo user profile for testing purposes.',
    wallet: 1000.50,
    address: {
      street: '12 West Coast Road',
      building: 'The Stellar #05-12',
      postal: '126821',
      country: 'Singapore'
    }
  });

  const handleEdit = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const handleSave = (field: string) => {
    setUserInfo(prev => ({
      ...prev,
      [field]: editValue
    }));
    setEditingField(null);
    setEditValue('');
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValue('');
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('isLoggedIn');
      navigate('/logout-success');
    }
  };

  return (
    <div className="personal-info-page">
      <Header />
      
      <main className="main-content">
        <div className="container">
          <div className="profile-section">
            <div className="profile-header">
              <h1>Personal Information</h1>
              <p>Offline Mode - No network required</p>
            </div>

            <div className="profile-content">
              <div className="profile-info">
                <div className="info-item">
                  <label>Name:</label>
                  {editingField === 'name' ? (
                    <div className="edit-mode">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="edit-input"
                      />
                      <button onClick={() => handleSave('name')} className="btn btn-primary">Save</button>
                      <button onClick={handleCancel} className="btn btn-secondary">Cancel</button>
                    </div>
                  ) : (
                    <div className="display-mode">
                      <span>{userInfo.name}</span>
                      <button onClick={() => handleEdit('name', userInfo.name)} className="btn btn-edit">Edit</button>
                    </div>
                  )}
                </div>

                <div className="info-item">
                  <label>Email:</label>
                  {editingField === 'email' ? (
                    <div className="edit-mode">
                      <input
                        type="email"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="edit-input"
                      />
                      <button onClick={() => handleSave('email')} className="btn btn-primary">Save</button>
                      <button onClick={handleCancel} className="btn btn-secondary">Cancel</button>
                    </div>
                  ) : (
                    <div className="display-mode">
                      <span>{userInfo.email}</span>
                      <button onClick={() => handleEdit('email', userInfo.email)} className="btn btn-edit">Edit</button>
                    </div>
                  )}
                </div>

                <div className="info-item">
                  <label>Password:</label>
                  <div className="display-mode">
                    <span>{userInfo.password}</span>
                    <button onClick={() => handleEdit('password', '')} className="btn btn-edit">Edit</button>
                  </div>
                </div>

                <div className="info-item">
                  <label>Contact number:</label>
                  {editingField === 'phone' ? (
                    <div className="edit-mode">
                      <input
                        type="tel"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="edit-input"
                      />
                      <button onClick={() => handleSave('phone')} className="btn btn-primary">Save</button>
                      <button onClick={handleCancel} className="btn btn-secondary">Cancel</button>
                    </div>
                  ) : (
                    <div className="display-mode">
                      <span>{userInfo.phone}</span>
                      <button onClick={() => handleEdit('phone', userInfo.phone)} className="btn btn-edit">Edit</button>
                    </div>
                  )}
                </div>

                <div className="info-item">
                  <label>Gender:</label>
                  {editingField === 'gender' ? (
                    <div className="edit-mode">
                      <select
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="edit-input"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      <button onClick={() => handleSave('gender')} className="btn btn-primary">Save</button>
                      <button onClick={handleCancel} className="btn btn-secondary">Cancel</button>
                    </div>
                  ) : (
                    <div className="display-mode">
                      <span>{userInfo.gender}</span>
                      <button onClick={() => handleEdit('gender', userInfo.gender)} className="btn btn-edit">Edit</button>
                    </div>
                  )}
                </div>

                <div className="info-item">
                  <label>Introduction:</label>
                  {editingField === 'introduce' ? (
                    <div className="edit-mode">
                      <textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="edit-input"
                        rows={3}
                      />
                      <button onClick={() => handleSave('introduce')} className="btn btn-primary">Save</button>
                      <button onClick={handleCancel} className="btn btn-secondary">Cancel</button>
                    </div>
                  ) : (
                    <div className="display-mode">
                      <span>{userInfo.introduce}</span>
                      <button onClick={() => handleEdit('introduce', userInfo.introduce)} className="btn btn-edit">Edit</button>
                    </div>
                  )}
                </div>

                <div className="info-item">
                  <label>Wallet Balance:</label>
                  <div className="display-mode">
                    <span className="wallet-amount">${userInfo.wallet.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="address-section">
                <h3>Default Address</h3>
                <div className="address-info">
                  <p><strong>Street:</strong> {userInfo.address.street}</p>
                  <p><strong>Building:</strong> {userInfo.address.building}</p>
                  <p><strong>Postal Code:</strong> {userInfo.address.postal}</p>
                  <p><strong>Country:</strong> {userInfo.address.country}</p>
                </div>
                <button className="btn btn-secondary">Manage Addresses</button>
              </div>

              <div className="actions">
                <button onClick={handleLogout} className="btn btn-danger">Sign out</button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OfflinePersonalInfo;
