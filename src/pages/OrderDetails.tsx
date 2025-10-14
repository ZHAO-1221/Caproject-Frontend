import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import userService from '../services/userService';
import orderService from '../services/orderService';
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

  const getImageCode = (url: string | undefined): string => {
    if (!url) return '';
    try {
      // 提取 URL 或相对路径中的文件名，例如 200012.png
      const pathname = url.replace(/^https?:\/\/[^/]+/, '');
      const parts = pathname.split('?')[0].split('#')[0].split('/').filter(Boolean);
      return parts.length ? parts[parts.length - 1] : '';
    } catch {
      return '';
    }
  };

  useEffect(() => {
    if (orderId) {
      loadOrderDetails(orderId);
    } else {
      setError('Invalid order ID');
      setLoading(false);
    }
  }, [orderId]);

  const loadOrderDetails = async (orderNumber: string) => {
    try {
      setLoading(true);
      setError('');
      // 从本地订单历史中查找该订单
      const localOrders = orderService.getLocalOrders();
      const found = localOrders.find(o => o.id === orderNumber);
      if (found) {
        const mapped: OrderDetails = {
          id: 0,
          orderNumber: found.id,
          orderTime: new Date(found.orderTime).toLocaleString('en-US'),
          totalPrice: found.amount,
          status: found.status,
          items: (found.items || []).map((it: any, idx: number) => ({
            id: idx + 1,
            productId: it.id ?? it.productId,
            productName: it.name ?? it.productName ?? 'Product',
            unitPrice: it.price ?? it.unitPrice ?? 0,
            quantity: it.qty ?? it.quantity ?? 1,
            productImage: it.image ?? it.productImage ?? '/images/placeholder.svg'
          }))
        };
        setOrder(mapped);
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
                      <div className="item-image-code">Image Code: {getImageCode(item.productImage)}</div>
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
