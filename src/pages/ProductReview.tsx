import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import productService from '../services/productService';
import authService from '../services/authService';
import '../styles/ProductReview.css';

interface ProductInfo {
  id: number;
  title: string;
  description: string;
  price: number;
  image: string;
}

interface ReviewForm {
  rating: number;
  title: string;
  content: string;
}

const ProductReview: React.FC = () => {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const [reviewForm, setReviewForm] = useState<ReviewForm>({
    rating: 0,
    title: '',
    content: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [productExists, setProductExists] = useState<boolean>(true);
  const [productDetail, setProductDetail] = useState<any>(null);
  const [imgFallbackStep, setImgFallbackStep] = useState<number>(0);
  
  const normalizeImageUrl = (raw: any): string => {
    if (!raw) return '/images/placeholder.svg';
    const url = String(raw);
    // 去掉路径中的 /api 片段，避免后端图片地址包含 /api 导致 404
    if (/^https?:\/\//i.test(url)) {
      return url.replace(/\/api(\/|$)/, '$1');
    }
    return url.replace(/^\/api\//, '/');
  };

  const computeImageSrc = (): string => {
    const id = parseInt(productId || '0');
    const fileName = (() => {
      const fromDetail = productDetail?.imageUrl ? normalizeImageUrl(productDetail.imageUrl) : '';
      if (fromDetail) {
        const parts = fromDetail.split('?')[0].split('#')[0].split('/').filter(Boolean);
        const last = parts.length ? parts[parts.length - 1] : '';
        if (last.includes('.')) return last;
      }
      return id ? `${id}.png` : '';
    })();
    if (!fileName) return '/images/placeholder.svg';
    // 按优先级提供多种候选
    if (imgFallbackStep === 0 && productDetail?.imageUrl) return normalizeImageUrl(productDetail.imageUrl);
    if (imgFallbackStep === 1) return `/api/images/${fileName}`; // 走后端同域代理
    if (imgFallbackStep === 2) return `/images/${fileName}`; // 使用全局代理配置
    return '/images/placeholder.svg';
  };

  // 获取当前用户信息
  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    console.log('ProductReview - Current user:', user);
  }, []);

  // 从后端获取真实商品信息
  useEffect(() => {
    const id = parseInt(productId || '0');
    if (!id) {
      setProductExists(false);
      setError('Invalid product ID');
      return;
    }
    (async () => {
      const res = await productService.getProductById(id);
      if (res.success && res.data) {
        setProductExists(true);
        setProductDetail(res.data);
      } else {
        setProductExists(false);
        setError(res.message || `Product does not exist (ID: ${id})`);
      }
    })();
    // 清理提示
    return () => {
      setError('');
    };
  }, [productId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setReviewForm(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleRatingChange = (rating: number) => {
    setReviewForm(prev => ({
      ...prev,
      rating
    }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productExists) {
      setError('Product does not exist or has been removed, cannot submit review');
      return;
    }

    if (reviewForm.rating === 0) {
      setError('Please select a rating');
      return;
    }
    
    if (!reviewForm.title.trim()) {
      setError('Please enter review title');
      return;
    }
    
    if (!reviewForm.content.trim()) {
      setError('Please enter review content');
      return;
    }

    if (!currentUser) {
      setError('Please login first');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      console.log('=== Submit Review Debug Info ===');
      const id = parseInt(productId || '0');
      console.log('Product ID:', id);
      console.log('Review content:', reviewForm.content);
      console.log('Review rating:', reviewForm.rating);
      console.log('Current user:', currentUser);

      // 调用真实API提交评价
      const result = await productService.addReview(
        id,
        reviewForm.content,
        reviewForm.rating,
        currentUser.userId,
        reviewForm.title
      );

      console.log('Review submission result:', result);

      if (result.success) {
        setSuccess('Review submitted successfully! Thank you for your feedback.');
        // 3秒后跳转回商品页面或订单页面
        setTimeout(() => {
          navigate('/order-history');
        }, 3000);
      } else {
        setError(result.message || 'Submission failed, please try again later');
      }
      
    } catch (error: any) {
      console.error('Submit review error:', error);
      setError('Submission failed, please try again later');
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
    <div className="product-review-page">
      <Header />
      
      <div className="main-content">
        <div className="sidebar">
          <div className="profile-section">
            <div className="profile-picture">
              <img src="/images/user-avatar.svg" alt="User Avatar" />
            </div>
            <div className="profile-name">{currentUser?.userName || 'User'}</div>
          </div>
          <div className="nav-menu">
            <button className="nav-item" onClick={() => navigate('/personal-info')}>
              Account
            </button>
            <button className="nav-item" onClick={() => navigate('/order-history')}>Orders</button>
            <button className="nav-item" onClick={() => navigate('/address-management')}>
              Manage Addresses
            </button>
            <button className="nav-item">My Coupons</button>
            <button className="nav-item" onClick={handleLogout}>Sign out</button>
          </div>
        </div>
        
        <div className="content-area">
          {/* 商品信息区域 */}
          <div className="product-info-section">
            <div className="product-card">
              <div className="product-image">
                <img 
                  src={computeImageSrc()} 
                  alt={productDetail?.productName || 'Product'} 
                  onError={() => setImgFallbackStep((s) => Math.min(s + 1, 3))}
                />
              </div>
              <div className="product-details">
                <h2 className="product-title">{productDetail?.productName || 'Product'}</h2>
                <p className="product-description">{productDetail?.productDescription || ''}</p>
                {productDetail?.productPrice != null && (
                  <div className="product-price">${productDetail.productPrice}</div>
                )}
              </div>
            </div>
          </div>

          {/* 评价提交区域 */}
          <div className="review-section">
            <h1 className="review-title">Review Card</h1>
            
            {/* 星级评分 */}
            <div className="rating-section">
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star ${star <= reviewForm.rating ? 'active' : ''}`}
                    onClick={() => handleRatingChange(star)}
                    disabled={loading}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {/* 评价表单 */}
            <div className="review-form-card">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="review-title" className="form-label">Review title</label>
                  <input
                    type="text"
                    id="review-title"
                    name="title"
                    value={reviewForm.title}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter your review title"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="review-content" className="form-label">Review body</label>
                  <textarea
                    id="review-content"
                    name="content"
                    value={reviewForm.content}
                    onChange={handleInputChange}
                    className="form-textarea"
                    placeholder="Share your experience with this product"
                    rows={4}
                    disabled={loading}
                  />
                </div>

                {/* 用户信息显示 */}
                <div className="user-info-section">
                  <div className="user-avatar">
                    <img src="/images/user-avatar.svg" alt="User Avatar" />
                  </div>
                  <div className="user-details">
                    <div className="user-name">{currentUser?.userName || 'User Name'}</div>
                    <div className="user-review">User Review</div>
                  </div>
                </div>


                {/* 错误和成功消息 */}
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                {/* 提交按钮 */}
                <div className="submit-section">
                  <button
                    type="submit"
                    className="submit-button"
                    disabled={loading}
                  >
                    {loading ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductReview;
