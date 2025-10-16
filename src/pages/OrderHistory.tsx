//by WengYuhao
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import userService from '../services/userService';
import orderService from '../services/orderService';
import '../styles/OrderHistory.css';

interface Order {
  id: number;
  orderNumber: string;
  orderTime: string;
  price: number;
  productImage: string;
  status: string;
}

const OrderHistory: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userInfo, setUserInfo] = useState({
    name: 'User',
    avatar: '/images/user-avatar.svg'
  });

  const formatPrice = (value: number | string): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (!isFinite(num)) return '0.00';
    return num.toFixed(2);
  };

  useEffect(() => {
    loadOrders();
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
      console.log('加载用户信息失败:', error);
    }
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError('');

      // Load from local order history for current user only
      const userStr = sessionStorage.getItem('user');
      const currentUser = userStr ? JSON.parse(userStr) : null;
      const currentUserId = currentUser?.userId;

      const localOrders = Number.isFinite(currentUserId)
        ? orderService.getLocalOrdersByUser(currentUserId)
        : orderService.getLocalOrders();
      const mappedLocal: Order[] = localOrders.map((o, idx) => ({
        id: idx + 1,
        orderNumber: o.id,
        orderTime: new Date(o.orderTime).toLocaleString('en-US'),
        price: o.amount,
        productImage: o.productImage || '/images/placeholder.svg',
        status: o.status
      }));

      setOrders(mappedLocal);
    } catch (error: any) {
      console.error('Load orders error:', error);
      setError('Failed to load orders');
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

  return (
    <div className="order-history-page">
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
            <button className="nav-item active">Orders</button>
            <button className="nav-item" onClick={() => navigate('/address-management')}>
              Manage Addresses
            </button>
            <button className="nav-item" onClick={handleLogout}>Sign out</button>
          </div>
        </div>
        
        <div className="content-area">
          <h1 className="page-title">Order History</h1>
          
          {loading && <div className="message info-message">Loading...</div>}
          {error && <div className="message error-message">{error}</div>}
          
          <div className="orders-section">
            {orders.length === 0 && !loading ? (
              <div className="no-orders">
                <p>No order records</p>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="order-item" onClick={() => navigate(`/order-details/${encodeURIComponent(order.orderNumber)}`)}>
                  <div className="order-image">
                    <img src={order.productImage} alt="Product" />
                  </div>
                  <div className="order-details">
                    <div className="order-number">Order ID: {order.orderNumber}</div>
                    <div className="order-time">Order Time: {order.orderTime}</div>
                    <div className="order-status">Status: {order.status}</div>
                  </div>
                  <div className="order-price">${formatPrice(order.price)}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default OrderHistory;
