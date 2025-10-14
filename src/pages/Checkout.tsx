import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import addressService from '../services/addressService';
import cartService, { CartItem } from '../services/cartService';
import productService from '../services/productService';
import paymentService from '../services/paymentService';
import orderService from '../services/orderService';
import '../styles/Checkout.css';

interface DefaultAddress {
  street: string;
  building: string;
  postal: string;
  city: string;
}

const CURRENCY = '$';

function formatMoney(value: number): string {
  return `${CURRENCY}${value.toFixed(2)}`;
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  
  const [items, setItems] = useState<CartItem[]>([]);
  const [defaultAddress, setDefaultAddress] = useState<DefaultAddress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [walletLoading, setWalletLoading] = useState(false);

  // 加载默认地址和购物车数据
  useEffect(() => {
    loadDefaultAddress();
    loadCartItems();
    loadWalletBalance();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadCartItems = () => {
    // 从cartService获取选中的商品
    const allCartItems = cartService.getCartItems();
    const selectedItems = allCartItems.filter(item => item.selected);
    setItems(selectedItems);
  };

  const loadDefaultAddress = async () => {
    try {
      setLoading(true);
      setError('');

      const username = addressService.getCurrentUsername();
      if (!username) {
        navigate('/login');
        return;
      }

      // 注意：addressService没有getDefaultAddress方法，使用getAddresses获取所有地址然后找默认地址
      const response = await addressService.getAddresses(username);

      if (response.success && Array.isArray(response.data)) {
        // 从地址列表中找到默认地址
        const defaultAddr = response.data.find((addr: any) => addr.isDefault);
        if (defaultAddr) {
          const parsedAddress = addressService.parseAddressText(defaultAddr.locationText);
          setDefaultAddress(parsedAddress);
        } else {
          // 没有默认地址时使用离线数据
          loadOfflineAddress();
        }
      } else {
        // API返回失败时使用离线数据
        loadOfflineAddress();
      }
    } catch (error: any) {
      console.error('Load default address error:', error);
        setError('Failed to load address');
    } finally {
      setLoading(false);
    }
  };

  // 加载离线地址数据
  const loadOfflineAddress = () => {
    const offlineAddress = {
      street: '12 West Coast Road',
      building: 'The Stellar #05-12',
      postal: '126821',
      city: 'Singapore'
    };
    setDefaultAddress(offlineAddress);
  };

  // 加载钱包余额
  const loadWalletBalance = async () => {
    try {
      setWalletLoading(true);
      const response = await paymentService.getWalletBalance();
      
      if (response.success && response.balance !== undefined) {
        setWalletBalance(response.balance);
        console.log('Wallet balance:', response.balance);
      } else {
        console.warn('Failed to get wallet balance:', response.message);
        // Set default balance for testing
        setWalletBalance(1000);
      }
    } catch (error) {
      console.error('Error loading wallet balance:', error);
      // Set default balance for testing
      setWalletBalance(1000);
    } finally {
      setWalletLoading(false);
    }
  };

  const handlePaymentMethodSelect = (method: string) => {
    setSelectedPaymentMethod(method);
  };

  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      alert('Please select a payment method first');
      return;
    }

    try {
      console.log('Processing payment with method:', selectedPaymentMethod);
      
      // 准备支付数据
      const paymentData = {
        paymentMethod: selectedPaymentMethod,
        amount: grandTotal,
        orderItems: items.map(item => ({
          productId: item.id,
          quantity: item.qty,
          price: item.price
        })),
        shippingAddress: defaultAddress ? 
          `${defaultAddress.street}, ${defaultAddress.building}, ${defaultAddress.postal}, ${defaultAddress.city}` : 
          'Default Address'
      };

      let paymentResult;

      if (selectedPaymentMethod === 'wallet') {
        // Check wallet balance
        if (walletBalance < grandTotal) {
          alert(`Insufficient wallet balance! Current balance: ${formatMoney(walletBalance)}, Required: ${formatMoney(grandTotal)}`);
          return;
        }
        
        // Use wallet payment
        paymentResult = await paymentService.payWithWallet(paymentData);
      } else {
        // Other payment methods
        paymentResult = await paymentService.processPayment(paymentData);
      }
      
      if (paymentResult.success) {
        console.log('Payment successful:', paymentResult);
        // Save order information to sessionStorage for payment success page
        sessionStorage.setItem('lastOrder', JSON.stringify({
          orderId: paymentResult.transactionId,
          amount: grandTotal,
          paymentMethod: selectedPaymentMethod,
          items: items,
          timestamp: new Date().toISOString()
        }));
        // Save to local order history for Order History page
        try {
          const orderImage = items[0]?.image || '/images/placeholder.svg';
          orderService.saveLocalOrder({
            id: paymentResult.transactionId || 'UNKNOWN',
            amount: grandTotal,
            orderTime: new Date().toISOString(),
            status: 'Completed',
            items: items,
            productImage: orderImage
          });
        } catch (e) {
          console.error('Failed to save order to local history', e);
        }
        // Payment successful, redirect to success page
        navigate('/payment-success');
      } else {
        console.error('Payment failed:', paymentResult.message);
        alert(`Payment failed: ${paymentResult.message}`);
        // Payment failed, redirect to failure page
        navigate('/payment-failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment processing error, please try again');
      // Payment error, redirect to failure page
      navigate('/payment-failed');
    }
  };

  // Increase product quantity
  const increaseQuantity = (itemId: number) => {
    const stockQuantity = productService.getStockQuantityById(itemId);
    const currentItem = items.find(item => item.id === itemId);
    
    if (currentItem && currentItem.qty < stockQuantity) {
      cartService.updateQuantity(itemId, currentItem.qty + 1);
      loadCartItems(); // Reload cart data
    }
  };

  // Decrease product quantity
  const decreaseQuantity = (itemId: number) => {
    const currentItem = items.find(item => item.id === itemId);
    
    if (currentItem && currentItem.qty > 1) {
      cartService.updateQuantity(itemId, currentItem.qty - 1);
      loadCartItems(); // Reload cart data
    }
  };

  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.qty, 0), [items]);
  const shipping = useMemo(() => (subtotal > 0 ? 5 : 0), [subtotal]);
  const tax = useMemo(() => +(subtotal * 0.09).toFixed(2), [subtotal]);
  const grandTotal = useMemo(() => subtotal + shipping + tax, [subtotal, shipping, tax]);

  return (
    <div className="checkout-page">
      <Header />

      <div className="checkout-container">
        <div className="checkout-grid">
          <section className="address-section">
            <div className="section-title center">Confirm Delivery Address</div>
            <button className="manage-btn" onClick={() => navigate('/address-management')}>Manage Addresses</button>
            <div className="address-list">
              {loading ? (
                <div className="address-card loading">Loading address...</div>
              ) : error ? (
                <div className="address-card error">{error}</div>
              ) : defaultAddress ? (
                <div className="address-card default-address">
                  <div className="address-label">Default Address</div>
                  <div className="address-details">
                    <div className="address-line">{defaultAddress.street}</div>
                    <div className="address-line">{defaultAddress.building}</div>
                    <div className="address-line">{defaultAddress.postal}</div>
                    <div className="address-line">{defaultAddress.city}</div>
                  </div>
                </div>
              ) : (
                <div className="address-card no-address">
                  <div className="no-address-text">No default address</div>
                  <button className="add-address-btn" onClick={() => navigate('/address-management')}>
                    Add Address
                  </button>
                </div>
              )}
            </div>
          </section>

          <section className="order-section">
            <div className="section-title center">Confirm Order Information</div>
            <div className="order-wrapper">
              {items.map(item => (
                <div key={item.id} className="order-card">
                  <div className="order-thumb">
                    <img src={item.image || "/images/placeholder.svg"} alt={item.name} />
                  </div>
                  <div className="order-info">
                    <div className="order-name">{item.name}</div>
                    <div className="order-price">{formatMoney(item.price)}</div>
                  </div>
                  <div className="order-actions">
                    <button 
                      className="qty-btn" 
                      onClick={() => decreaseQuantity(item.id)}
                      disabled={item.qty <= 1}
                    >
                      -
                    </button>
                    <div className="qty-value">{item.qty}</div>
                    <button 
                      className="qty-btn" 
                      onClick={() => increaseQuantity(item.id)}
                      disabled={item.qty >= productService.getStockQuantityById(item.id)}
                    >
                      +
                    </button>
                    <div className="order-subtotal">{formatMoney(item.price * item.qty)}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="summary-section">
            <div className="summary-card">
              <div className="summary-title">Order Summary</div>
              <div className="summary-row"><span>Subtotal</span><span>{formatMoney(subtotal)}</span></div>
              <div className="summary-row"><span>Shopping Estimate</span><span>{formatMoney(shipping)}</span></div>
              <div className="summary-row"><span>Tax Estimate</span><span>{formatMoney(tax)}</span></div>
              <div className="summary-divider" />
              <div className="summary-row grand"><span>Grand Total</span><span>{formatMoney(grandTotal)}</span></div>
              <div className="pay-methods">
                <div className="pay-title">select payment method</div>
                <div className="pay-icons">
                  <span 
                    className={`pm wallet ${selectedPaymentMethod === 'wallet' ? 'selected' : ''} ${walletBalance < grandTotal ? 'insufficient' : ''}`}
                    onClick={() => handlePaymentMethodSelect('wallet')}
                    title={walletLoading ? 'Loading...' : `Balance: ${formatMoney(walletBalance)}`}
                  >
                    My Wallet
                    {!walletLoading && (
                      <div className="wallet-balance">
                        {formatMoney(walletBalance)}
                      </div>
                    )}
                  </span>
                  <span 
                    className={`pm visa ${selectedPaymentMethod === 'visa' ? 'selected' : ''}`}
                    onClick={() => handlePaymentMethodSelect('visa')}
                  >VISA</span>
                  <span 
                    className={`pm mc ${selectedPaymentMethod === 'mc' ? 'selected' : ''}`}
                    onClick={() => handlePaymentMethodSelect('mc')}
                  >MC</span>
                  <span 
                    className={`pm alipay ${selectedPaymentMethod === 'alipay' ? 'selected' : ''}`}
                    onClick={() => handlePaymentMethodSelect('alipay')}
                  >Alipay</span>
                  <span 
                    className={`pm gpay ${selectedPaymentMethod === 'gpay' ? 'selected' : ''}`}
                    onClick={() => handlePaymentMethodSelect('gpay')}
                  >GPay</span>
                  <span 
                    className={`pm apple ${selectedPaymentMethod === 'apple' ? 'selected' : ''}`}
                    onClick={() => handlePaymentMethodSelect('apple')}
                  >Apple</span>
                  <span 
                    className={`pm wechat ${selectedPaymentMethod === 'wechat' ? 'selected' : ''}`}
                    onClick={() => handlePaymentMethodSelect('wechat')}
                  >WeChat</span>
                </div>
              </div>
              <button 
                className="pay-btn" 
                onClick={handlePayment}
                disabled={!selectedPaymentMethod}
              >Pay</button>
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Checkout;


