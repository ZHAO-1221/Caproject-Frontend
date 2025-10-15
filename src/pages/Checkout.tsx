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

interface AddressOption {
  id: number;
  locationText: string;
  isDefault: boolean;
  parsed: DefaultAddress;
}

const CURRENCY = '$';

function formatMoney(value: number): string {
  return `${CURRENCY}${value.toFixed(2)}`;
}

function getImageUrl(imageUrl?: string): string {
  // 如果没有提供图片URL，则返回一个默认的占位图路径
  if (!imageUrl) {
    return '/images/placeholder.svg';
  }

  // `package.json` 中的 `proxy` 配置会自动将开发环境中的相对路径请求
  // 转发到后端服务器。因此，我们只需要直接返回路径即可。
  // 这个逻辑同时适用于完整的外部URL（例如来自CDN）和后端的相对路径。
  return imageUrl;
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  
  const [items, setItems] = useState<CartItem[]>([]);
  const [defaultAddress, setDefaultAddress] = useState<DefaultAddress | null>(null);
  const [addressOptions, setAddressOptions] = useState<AddressOption[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
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

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showAddressDropdown && !target.closest('.address-display-container')) {
        setShowAddressDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAddressDropdown]);

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
        console.error('User not logged in, redirecting to login page');
        navigate('/login');
        return;
      }

      console.log('=== Loading user addresses ===');
      console.log('Current username:', username);
      console.log('User login status:', sessionStorage.getItem('isLoggedIn'));
      console.log('User full info:', sessionStorage.getItem('user'));
      
      const response = await addressService.getAddresses(username);
      console.log('Address API response:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', Object.keys(response || {}));

      // 检查响应格式
      if (response && (response.success || response.code === 200)) {
        const addressData = response.data;
        console.log('Address data:', addressData);
        console.log('Address data type:', typeof addressData);
        console.log('Is array:', Array.isArray(addressData));
        
        console.log('Checking address data conditions:');
        console.log('- addressData exists:', !!addressData);
        console.log('- addressData is array:', Array.isArray(addressData));
        console.log('- addressData length:', Array.isArray(addressData) ? addressData.length : 'N/A');
        console.log('- condition result:', Array.isArray(addressData) && addressData.length > 0);
        
        if (Array.isArray(addressData) && addressData.length > 0) {
          console.log('✅ Successfully loaded address list, total', addressData.length, 'addresses');
          
          // 处理所有地址选项，过滤无效数据
          const validAddresses = addressData.filter((addr: any) => {
            const isValid = validateAddressData(addr);
            if (!isValid) {
              console.warn('Skipping invalid address:', addr);
            }
            return isValid;
          });

          if (validAddresses.length === 0) {
            console.log('❌ No valid address data found');
            // Add some test address data for debugging
            console.log('Adding test address data for debugging');
            const testAddresses = [
              {
                id: 1,
                locationText: '123 Main Street, Building A, 12345, Test City',
                isDefault: true
              }
            ];
            
            const testOptions: AddressOption[] = testAddresses.map((addr: any) => {
              const parsed = addressService.parseAddressText(addr.locationText);
              console.log('Parsing test address:', addr.locationText, '->', parsed);
              return {
                id: addr.id,
                locationText: addr.locationText,
                isDefault: addr.isDefault,
                parsed: parsed
              };
            });
            
            setAddressOptions(testOptions);
            setDefaultAddress(testOptions[0].parsed);
            setSelectedAddressId(testOptions[0].id);
            console.log('✅ Using test address data');
            return;
          }

          const options: AddressOption[] = validAddresses.map((addr: any) => {
            // 获取地址ID（支持多种字段名）
            const addressId = addr.id || addr.addressId || addr.locationId;
            // 获取地址文本（支持多种字段名）
            const addressText = addr.locationText || addr.address || addr.fullAddress || addr.text;
            // 获取默认状态（API返回的是defaultAddress字段）
            const isDefault = addr.isDefault || addr.default || addr.defaultAddress || false;
            
            const parsed = addressService.parseAddressText(addressText);
            console.log('Parsing address:', addressText, '->', parsed);
            console.log('Address ID:', addressId, 'Is default:', isDefault);
            return {
              id: addressId,
              locationText: addressText,
              isDefault: isDefault,
              parsed: parsed
            };
          });

          setAddressOptions(options);

          // 找到默认地址
          const defaultAddr = options.find(addr => addr.isDefault);
          if (defaultAddr) {
            setDefaultAddress(defaultAddr.parsed);
            setSelectedAddressId(defaultAddr.id);
            console.log('✅ Set default address:', defaultAddr.parsed);
          } else if (options.length > 0) {
            // 如果没有默认地址，使用第一个地址
            setDefaultAddress(options[0].parsed);
            setSelectedAddressId(options[0].id);
            console.log('⚠️ No default address, using first address:', options[0].parsed);
          } else {
            console.log('❌ Address list is empty');
            setError('You have not added any addresses yet, please add an address first');
          }
        } else {
          console.log('❌ Address data format error or empty:', addressData);
          setError('Address data format error, please try again later');
        }
      } else {
        console.warn('❌ API call failed:', response);
        setError(`Failed to get addresses: ${response?.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('❌ Error loading addresses:', error);
      setError(`Failed to load addresses: ${error.message || 'Network error'}`);
    } finally {
      setLoading(false);
    }
  };

  // 清除地址数据（不再使用硬编码的离线地址）
  const clearAddressData = () => {
    setDefaultAddress(null);
    setAddressOptions([]);
    setSelectedAddressId(null);
  };

  // 处理地址选择
  const handleAddressSelect = (addressId: number) => {
    const selectedAddress = addressOptions.find(addr => addr.id === addressId);
    if (selectedAddress) {
      setSelectedAddressId(addressId);
      setDefaultAddress(selectedAddress.parsed);
      setShowAddressDropdown(false); // 选择后关闭下拉菜单
      console.log('Selected address:', selectedAddress.parsed);
    }
  };

  // 切换下拉选择器显示状态
  const toggleAddressDropdown = () => {
    setShowAddressDropdown(!showAddressDropdown);
  };

  // 获取当前选中的地址
  const getCurrentAddress = (): AddressOption | null => {
    return addressOptions.find(addr => addr.id === selectedAddressId) || null;
  };

  // 刷新地址列表
  const refreshAddresses = () => {
    console.log('User manually refreshed address list');
    loadDefaultAddress();
  };

  // 验证地址数据
  const validateAddressData = (address: any): boolean => {
    console.log('Validating address data:', address);
    
    if (!address || typeof address !== 'object') {
      console.warn('Invalid address data - not an object:', address);
      return false;
    }

    // Check if there is an id field (can be id, addressId, etc.)
    const hasId = address.id || address.addressId || address.locationId;
    if (!hasId) {
      console.warn('Address missing ID field:', address);
      return false;
    }

    // Check address text field (can be locationText, address, fullAddress, etc.)
    const addressText = address.locationText || address.address || address.fullAddress || address.text;
    if (!addressText) {
      console.warn('Address missing text field:', address);
      return false;
    }

    if (typeof addressText !== 'string' || addressText.trim().length === 0) {
      console.warn('Invalid address text:', addressText);
      return false;
    }

    console.log('✅ Address data validation passed:', { id: hasId, text: addressText });
    return true;
  };

  // 加载钱包余额
  const loadWalletBalance = async () => {
    try {
      setWalletLoading(true);
      const response = await paymentService.getWalletBalance(true);
      
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
          const userStr = sessionStorage.getItem('user');
          const currentUser = userStr ? JSON.parse(userStr) : null;
          const userId = currentUser?.userId;
          orderService.saveLocalOrder({
            id: paymentResult.transactionId || 'UNKNOWN',
            amount: grandTotal,
            orderTime: new Date().toISOString(),
            status: 'Completed',
            items: items,
            productImage: orderImage,
            userId
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
            <div className="address-controls">
              <button className="manage-btn" onClick={() => navigate('/address-management')}>Manage Addresses</button>
              <button className="refresh-btn" onClick={refreshAddresses} disabled={loading}>
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
            <div className="address-list">
              {loading ? (
                <div className="address-card loading">Loading addresses...</div>
              ) : error ? (
                <div className="address-card error">
                  <div className="error-message">{error}</div>
                  <button className="retry-btn" onClick={refreshAddresses}>Retry</button>
                </div>
              ) : addressOptions.length > 0 ? (
                <div className="address-display-container">
                  {/* 显示当前选中的地址 */}
                  <div className="current-address-card">
                    <div className="address-header">
                      <div className="address-label">
                        {getCurrentAddress()?.isDefault ? 'Default Address' : 'Delivery Address'}
                      </div>
                      {addressOptions.length > 1 && (
                        <button 
                          className="change-address-btn"
                          onClick={toggleAddressDropdown}
                        >
                          {showAddressDropdown ? 'Collapse' : 'Change Address'}
                        </button>
                      )}
                    </div>
                    <div className="address-details">
                      <div className="address-line">{defaultAddress?.street}</div>
                      <div className="address-line">{defaultAddress?.building}</div>
                      <div className="address-line">{defaultAddress?.postal}</div>
                      <div className="address-line">{defaultAddress?.city}</div>
                    </div>
                  </div>

                  {/* 下拉选择器 */}
                  {showAddressDropdown && addressOptions.length > 1 && (
                    <div className="address-dropdown">
                      <div className="dropdown-title">Select Other Address</div>
                      {addressOptions
                        .filter(addr => addr.id !== selectedAddressId)
                        .map((address) => (
                          <div 
                            key={address.id} 
                            className="dropdown-address-item"
                            onClick={() => handleAddressSelect(address.id)}
                          >
                            <div className="dropdown-address-label">
                              {address.isDefault ? 'Default Address' : 'Address'}
                            </div>
                            <div className="dropdown-address-details">
                              <div className="address-line">{address.parsed.street}</div>
                              <div className="address-line">{address.parsed.building}</div>
                              <div className="address-line">{address.parsed.postal}</div>
                              <div className="address-line">{address.parsed.city}</div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
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
                  <div className="no-address-text">No available addresses</div>
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
                    <img src={getImageUrl(item.image) || "/images/placeholder.svg"} alt={item.name} />
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


