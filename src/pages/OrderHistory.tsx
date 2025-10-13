import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import userService from '../services/userService';
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

  // 模拟订单数据
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError('');

      // 模拟加载延迟
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 模拟订单数据
      const mockOrders: Order[] = [
        {
          id: 1,
          orderNumber: 'ORD-2024-001',
          orderTime: '2024-01-15 14:30:25',
          price: 50,
          productImage: '/images/placeholder.svg',
          status: 'Completed'
        },
        {
          id: 2,
          orderNumber: 'ORD-2024-002',
          orderTime: '2024-01-20 09:15:42',
          price: 50,
          productImage: '/images/placeholder.svg',
          status: 'Completed'
        },
        {
          id: 3,
          orderNumber: 'ORD-2024-003',
          orderTime: '2024-01-25 16:45:18',
          price: 50,
          productImage: '/images/placeholder.svg',
          status: 'Completed'
        }
      ];

      setOrders(mockOrders);
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
              <img src="/images/user-avatar.svg" alt="User Avatar" />
            </div>
            <div className="profile-name">Tina</div>
          </div>
          <div className="nav-menu">
            <button className="nav-item" onClick={() => navigate('/personal-info')}>
              Account
            </button>
            <button className="nav-item active">Orders</button>
            <button className="nav-item" onClick={() => navigate('/address-management')}>
              Manage Addresses
            </button>
            <button className="nav-item">My Coupons</button>
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
                <div key={order.id} className="order-item" onClick={() => navigate(`/order-details/${order.id}`)}>
                  <div className="order-image">
                    <img src={order.productImage} alt="Product" />
                  </div>
                  <div className="order-details">
                    <div className="order-number">Order ID: {order.orderNumber}</div>
                    <div className="order-time">Order Time: {order.orderTime}</div>
                    <div className="order-status">Status: {order.status}</div>
                  </div>
                  <div className="order-price">${order.price}</div>
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
