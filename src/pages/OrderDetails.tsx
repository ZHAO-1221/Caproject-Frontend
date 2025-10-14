import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import userService from '../services/userService';
import '../styles/OrderDetails.css';

interface OrderItem {
  id: number;
  productId?: number; // 优先使用真实商品ID
  productName: string;
  unitPrice: number;
  quantity: number;
  productImage: string;
}

interface OrderDetails {
  id: number;
  orderNumber: string;
  orderTime: string;
  totalPrice: number;
  status: string;
  items: OrderItem[];
}

const OrderDetails: React.FC = () => {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (orderId) {
      loadOrderDetails(parseInt(orderId));
    } else {
      setError('Invalid order ID');
      setLoading(false);
    }
  }, [orderId]);

  const loadOrderDetails = async (id: number) => {
    try {
      setLoading(true);
      setError('');

      // 模拟加载延迟
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 模拟订单详情数据
      const mockOrderDetails: { [key: number]: OrderDetails } = {
        1: {
          id: 1,
          orderNumber: 'ORD-2024-001',
          orderTime: '2024-01-15 14:30:25',
          totalPrice: 150,
          status: 'Completed',
          items: [
            {
              id: 1,
              productName: 'Product Name',
              unitPrice: 50,
              quantity: 1,
              productImage: '/images/placeholder.svg'
            },
            {
              id: 2,
              productName: 'Title',
              unitPrice: 50,
              quantity: 1,
              productImage: '/images/placeholder.svg'
            },
            {
              id: 3,
              productName: 'Title',
              unitPrice: 50,
              quantity: 1,
              productImage: '/images/placeholder.svg'
            }
          ]
        },
        2: {
          id: 2,
          orderNumber: 'ORD-2024-002',
          orderTime: '2024-01-20 09:15:42',
          totalPrice: 200,
          status: 'Completed',
          items: [
            {
              id: 4,
              productName: 'Premium Product',
              unitPrice: 100,
              quantity: 2,
              productImage: '/images/placeholder.svg'
            }
          ]
        },
        3: {
          id: 3,
          orderNumber: 'ORD-2024-003',
          orderTime: '2024-01-25 16:45:18',
          totalPrice: 75,
          status: 'Completed',
          items: [
            {
              id: 5,
              productName: 'Featured Product',
              unitPrice: 75,
              quantity: 1,
              productImage: '/images/placeholder.svg'
            }
          ]
        }
      };

      const orderDetails = mockOrderDetails[id];
      if (orderDetails) {
        setOrder(orderDetails);
      } else {
        setError('Order not found');
      }
    } catch (error: any) {
      console.error('Load order details error:', error);
      setError('Failed to load order details');
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

  const handleBackToOrders = () => {
    navigate('/order-history');
  };

  if (loading) {
    return (
      <div className="order-details-page">
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
              <button className="nav-item active" onClick={() => navigate('/order-history')}>Orders</button>
              <button className="nav-item" onClick={() => navigate('/address-management')}>
                Manage Addresses
              </button>
              <button className="nav-item" onClick={handleLogout}>Sign out</button>
            </div>
          </div>
          <div className="content-area">
            <div className="loading-message">Loading...</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-details-page">
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
              <button className="nav-item active" onClick={() => navigate('/order-history')}>Orders</button>
              <button className="nav-item" onClick={() => navigate('/address-management')}>
                Manage Addresses
              </button>
              <button className="nav-item" onClick={handleLogout}>Sign out</button>
            </div>
          </div>
          <div className="content-area">
            <div className="error-message">{error}</div>
            <button className="back-button" onClick={handleBackToOrders}>
              Back to Order List
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="order-details-page">
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
            <button className="nav-item" onClick={handleLogout}>Sign out</button>
          </div>
        </div>
        
        <div className="content-area">
          <div className="page-header">
            <h1 className="page-title">Order Details</h1>
            <button className="back-button" onClick={handleBackToOrders}>
              ← Back to Order List
            </button>
          </div>
          
          <div className="order-details-container">
            {/* 订单摘要头部 */}
            <div className="order-summary-header">
              <div className="order-info">
                <div className="order-number">Order ID: {order.orderNumber}</div>
                <div className="order-time">Order Time: {order.orderTime}</div>
                <div className="order-status">Status: {order.status}</div>
              </div>
              <div className="order-total">
                <div className="total-label">Total</div>
                <div className="total-price">${order.totalPrice}</div>
              </div>
            </div>

            {/* 商品列表 */}
            <div className="order-items-section">
              <h2 className="section-title">Order Items</h2>
              <div className="items-list">
                {order.items.map((item) => (
                  <div key={item.id} className="order-item">
                    <div className="item-image">
                      <img src={item.productImage} alt={item.productName} />
                    </div>
                    <div className="item-details">
                      <div className="item-name">{item.productName}</div>
                    </div>
                    <div className="item-price-quantity">
                      <div className="item-price">${item.unitPrice}</div>
                      <div className="item-quantity">Quantity: {item.quantity}</div>
                    </div>
                    <div className="item-actions">
                      <button 
                        className="review-button"
                        onClick={() => navigate(`/product-review/${item.productId ?? item.id}`)}
                      >
                        Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 订单总计 */}
            <div className="order-summary-footer">
              <div className="summary-row">
                <span className="summary-label">Total Items:</span>
                <span className="summary-value">{order.items.reduce((sum, item) => sum + item.quantity, 0)} items</span>
              </div>
              <div className="summary-row total-row">
                <span className="summary-label">Order Total:</span>
                <span className="summary-value total-price">${order.totalPrice}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default OrderDetails;
