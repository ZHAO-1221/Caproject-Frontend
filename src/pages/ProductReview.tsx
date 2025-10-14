import React, { useState, useRef, useEffect } from 'react';
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
  images: File[];
}

const ProductReview: React.FC = () => {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [reviewForm, setReviewForm] = useState<ReviewForm>({
    rating: 0,
    title: '',
    content: '',
    images: []
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [productExists, setProductExists] = useState<boolean>(true);
  const [productDetail, setProductDetail] = useState<any>(null);

  // 获取当前用户信息
  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    console.log('ProductReview - 当前用户:', user);
  }, []);

  // 从后端获取真实商品信息
  useEffect(() => {
    const id = parseInt(productId || '0');
    if (!id) {
      setProductExists(false);
      setError('无效的商品ID');
      return;
    }
    (async () => {
      const res = await productService.getProductById(id);
      if (res.success && res.data) {
        setProductExists(true);
        setProductDetail(res.data);
      } else {
        setProductExists(false);
        setError(res.message || `商品不存在（ID: ${id}）`);
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).slice(0, 5 - reviewForm.images.length); // 最多5张图片
      setReviewForm(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
    }
  };

  const removeImage = (index: number) => {
    setReviewForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productExists) {
      setError('商品不存在或已下架，无法提交评价');
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

      console.log('=== 提交评价调试信息 ===');
      const id = parseInt(productId || '0');
      console.log('商品ID:', id);
      console.log('评价内容:', reviewForm.content);
      console.log('评价等级:', reviewForm.rating);
      console.log('当前用户:', currentUser);

      // 调用真实API提交评价
      const result = await productService.addReview(
        id,
        reviewForm.content,
        reviewForm.rating,
        currentUser.userId
      );

      console.log('评价提交结果:', result);

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
                <img src={productDetail?.imageUrl || '/images/placeholder.svg'} alt={productDetail?.productName || 'Product'} />
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

                {/* 图片上传 */}
                <div className="image-upload-section">
                  <label className="form-label">Image</label>
                  <div className="image-upload-area">
                    <div className="image-preview">
                      {reviewForm.images.length > 0 ? (
                        <div className="image-grid">
                          {reviewForm.images.map((image, index) => (
                            <div key={index} className="preview-item">
                              <img 
                                src={URL.createObjectURL(image)} 
                                alt={`Preview ${index + 1}`}
                                className="preview-image"
                              />
                              <button
                                type="button"
                                className="remove-image"
                                onClick={() => removeImage(index)}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          {reviewForm.images.length < 5 && (
                            <div className="upload-placeholder" onClick={() => fileInputRef.current?.click()}>
                              <div className="upload-icon">+</div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="upload-placeholder" onClick={() => fileInputRef.current?.click()}>
                          <img src="/images/placeholder.svg" alt="Upload" className="placeholder-image" />
                          <div className="upload-icon">+</div>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      multiple
                      style={{ display: 'none' }}
                    />
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
