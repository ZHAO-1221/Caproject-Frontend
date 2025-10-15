import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/AdminHeader';
import Footer from '../components/Footer';
import '../styles/ProductEdit.css';
import * as productApi from '../services/AdminService';
import { ProductDTO } from '../services/AdminService';

interface Review {
  id: number;
  title: string;
  body: string;
  rating: number;
  reviewerName: string;
  date: string;
  avatar: string;
}

const ProductEdit: React.FC = () => {
  const navigate = useNavigate();
  const { productId: urlProductId } = useParams<{ productId: string }>();
  
  // Form states
  const [productName, setProductName] = useState('Text Heading');
  const [price, setPrice] = useState('');
  const [productId, setProductId] = useState('');
  const [description, setDescription] = useState('Text');
  const [stock, setStock] = useState('0');
  const [discount, setDiscount] = useState('0');
  const [productImage, setProductImage] = useState<string | null>(null);
  
  // Additional product fields
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [sku, setSku] = useState('');
  const [weight, setWeight] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [additionalLabel, setAdditionalLabel] = useState('');
  
  // Reviews
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: 1,
      title: 'Review title',
      body: 'Review body',
      rating: 3,
      reviewerName: 'Reviewer name',
      date: 'Date',
      avatar: '/images/user-avatar.svg'
    },
    {
      id: 2,
      title: 'Review title',
      body: 'Review body',
      rating: 3,
      reviewerName: 'Reviewer name',
      date: 'Date',
      avatar: '/images/user-avatar.svg'
    },
    {
      id: 3,
      title: 'Review title',
      body: 'Review body',
      rating: 3,
      reviewerName: 'Reviewer name',
      date: 'Date',
      avatar: '/images/user-avatar.svg'
    },
    {
      id: 4,
      title: 'Review title',
      body: 'Review body',
      rating: 4,
      reviewerName: 'Reviewer name',
      date: 'Date',
      avatar: '/images/user-avatar.svg'
    },
    {
      id: 5,
      title: 'Review title',
      body: 'Review body',
      rating: 5,
      reviewerName: 'Reviewer name',
      date: 'Date',
      avatar: '/images/user-avatar.svg'
    },
    {
      id: 6,
      title: 'Review title',
      body: 'Review body',
      rating: 2,
      reviewerName: 'Reviewer name',
      date: 'Date',
      avatar: '/images/user-avatar.svg'
    },
    {
      id: 7,
      title: 'Review title',
      body: 'Review body',
      rating: 4,
      reviewerName: 'Reviewer name',
      date: 'Date',
      avatar: '/images/user-avatar.svg'
    },
    {
      id: 8,
      title: 'Review title',
      body: 'Review body',
      rating: 3,
      reviewerName: 'Reviewer name',
      date: 'Date',
      avatar: '/images/user-avatar.svg'
    }
  ]);
  
  // Review pagination
  const [currentReviewPage, setCurrentReviewPage] = useState(1);
  const reviewsPerPage = 3;
  
  // Load product data from localStorage on mount
  useEffect(() => {
    const loadProduct = async () => {
      if (urlProductId) {
        try {
          console.log(`Loading product with ID: ${urlProductId}`);
          
          // 从API获取所有商品，然后找到对应的商品
          const products = await productApi.getAllProducts();
          const product = products.find((p: ProductDTO) => p.productId === parseInt(urlProductId));
          
          if (product) {
            console.log('Loading product for editing:', product);
            setProductName(product.productName || '');
            setPrice(product.productPrice?.toString() || '');
            setProductId(product.productId?.toString() || '');
            setDescription(product.productDescription || '');
            setStock(product.productStockQuantity?.toString() || '0');
            setCategory(product.productCategory || '');
            setProductImage(product.imageUrl || null);
            // Note: 后端没有discount, brand, sku, weight, dimensions等字段
            // 这些字段保持默认值或可以考虑从其他地方获取
          } else {
            console.log('Product not found in API, using defaults');
          }
        } catch (error) {
          console.error('Error loading product:', error);
          alert('无法加载商品数据。请确保后端服务正在运行。');
        }
      }
    };
    
    loadProduct();
  }, [urlProductId]);
  
  // Handle delete review
  const handleDeleteReview = (reviewId: number) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this review?');
    if (confirmDelete) {
      const newReviews = reviews.filter(review => review.id !== reviewId);
      setReviews(newReviews);
      
      // If current page becomes empty after deletion, go to previous page
      const newTotalPages = Math.ceil(newReviews.length / reviewsPerPage);
      if (currentReviewPage > newTotalPages && newTotalPages > 0) {
        setCurrentReviewPage(newTotalPages);
      }
    }
  };
  
  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if file is an image
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setProductImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        alert('Please select an image file');
      }
    }
  };

  // Handle image click
  const handleImageClick = () => {
    document.getElementById('image-upload-input')?.click();
  };

  // Handle submit
  const handleSubmit = async () => {
    const productIdNum = parseInt(urlProductId || '0');
    
    // 验证必填字段
    if (!productName || !price) {
      alert('请填写商品名称和价格！');
      return;
    }
    
    try {
      // 创建符合后端API格式的商品对象（文本部分）
      const updatedProductDTO: ProductDTO = {
        productId: productIdNum,
        productName: productName,
        productDescription: description,
        productPrice: parseFloat(price) || 0,
        productStockQuantity: parseInt(stock) || 0,
        productCategory: category || 'dailyNecessities',
        isVisible: 1, // 默认可见
        // 图片通过专门的multipart接口处理，文本接口保留占位
        imageUrl: '/images/product-placeholder.jpg'
      };

      console.log('Updating product:', updatedProductDTO);
      
      // 调用后端API更新商品
      let result = await productApi.updateProduct(productIdNum, updatedProductDTO);

      // 如果选择了图片文件，同时调用上传图片接口以覆盖图片
      const fileInput = document.getElementById('image-upload-input') as HTMLInputElement | null;
      const file = fileInput?.files?.[0] || null;
      if (file) {
        try {
          await productApi.createProductWithImage(updatedProductDTO, file);
        } catch (e) {
          console.error('Uploading image failed, product text updated already:', e);
        }
      }
      console.log('Product updated successfully:', result);
      
      alert('商品信息更新成功！');
      
      // 跳转回ProductManagement页面
      navigate('/product-management');
    } catch (error) {
      console.error('Error updating product:', error);
      alert('更新商品失败。请稍后重试。');
    }
  };
  
  // Render stars
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} className={`star ${index < rating ? 'filled' : ''}`}>
        ★
      </span>
    ));
  };
  
  // Calculate reviews for current page
  const totalReviewPages = Math.ceil(reviews.length / reviewsPerPage);
  const startReviewIndex = (currentReviewPage - 1) * reviewsPerPage;
  const currentReviews = reviews.slice(startReviewIndex, startReviewIndex + reviewsPerPage);
  
  // Handle review page change
  const handleReviewPageChange = (page: number) => {
    setCurrentReviewPage(page);
  };
  
  return (
    <div className="product-edit-page">
      <Header hideCart={true} accountPath="/admin-login" />
      
      {/* Back Button */}
      <button className="back-button" onClick={() => navigate('/product-management')}>
        <span className="back-arrow">←</span>
      </button>
      
      <div className="main-content">
        {/* Center Content */}
        <div className="center-content">
          {/* Product Image */}
          <div className="product-image-area">
            <input
              type="file"
              id="image-upload-input"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            <div 
              className="product-image-placeholder" 
              onClick={handleImageClick}
              style={{
                backgroundImage: productImage ? `url(${productImage})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                cursor: 'pointer'
              }}
            >
              {!productImage && (
                <div className="upload-hint">
                  <span className="upload-icon">📷</span>
                  <span className="upload-text">Click to upload image</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Product Info Form */}
          <div className="product-info-form">
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="product-heading editable-heading"
              placeholder="Enter product name"
            />
            <div className="product-id-wrapper">
              <span className="product-id-label">Product ID:</span>
              <input
                type="text"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="product-id-input"
                placeholder="Enter ID"
              />
            </div>
            <div className="price-wrapper">
              <span className="price-symbol">$</span>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="product-price editable-price"
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="product-description editable-description"
              placeholder="Enter description"
            />
            
            {/* Label Dropdowns Grid */}
            <div className="dropdowns-grid">
              {/* Stock Input */}
              <div className="dropdown-group">
                <label className="dropdown-label">Stock</label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="custom-input"
                  placeholder="0"
                  min="0"
                  step="1"
                />
              </div>
              
              {/* Discount Input */}
              <div className="dropdown-group">
                <label className="dropdown-label">Discount</label>
                <div className="discount-input-wrapper">
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (e.target.value === '' || (value >= 0 && value <= 100)) {
                        setDiscount(e.target.value);
                      }
                    }}
                    className="custom-input discount-input"
                    placeholder="0"
                    min="0"
                    max="100"
                    step="1"
                  />
                  <span className="discount-percent">%</span>
                </div>
              </div>
              
              {/* Category Select */}
              <div className="dropdown-group">
                <label className="dropdown-label">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="custom-input"
                >
                  <option value="dailyNecessities">daily necessities</option>
                  <option value="homeKitchen">home&kitchen</option>
                  <option value="fashionApparel">fashion&apparel</option>
                  <option value="sportsOutdoors">sports&outdoors</option>
                  <option value="electronics">electronics</option>
                  <option value="personalCare">personal care</option>
                </select>
              </div>
              
              {/* Label Input */}
              <div className="dropdown-group">
                <label className="dropdown-label">Label</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="custom-input"
                  placeholder="Enter label"
                />
              </div>
              
              {/* Label Input */}
              <div className="dropdown-group">
                <label className="dropdown-label">Label</label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="custom-input"
                  placeholder="Enter label"
                />
              </div>
              
              {/* Label Input */}
              <div className="dropdown-group">
                <label className="dropdown-label">Label</label>
                <input
                  type="text"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="custom-input"
                  placeholder="Enter label"
                />
              </div>
              
              {/* Label Input */}
              <div className="dropdown-group">
                <label className="dropdown-label">Label</label>
                <input
                  type="text"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  className="custom-input"
                  placeholder="Enter label"
                />
              </div>
              
              {/* Additional Label Input */}
              <div className="dropdown-group">
                <label className="dropdown-label">Label</label>
                <input
                  type="text"
                  value={additionalLabel}
                  onChange={(e) => setAdditionalLabel(e.target.value)}
                  className="custom-input"
                  placeholder="Enter label"
                />
              </div>
            </div>
            
            {/* Submit Button */}
            <button className="submit-btn" onClick={handleSubmit}>
              Submit
            </button>
          </div>
        </div>
        
        {/* Right Sidebar - Latest Reviews */}
        <div className="right-sidebar">
          <h3 className="reviews-title">Latest reviews</h3>
          <div className="reviews-list">
            {currentReviews.map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <div className="review-stars">
                    {renderStars(review.rating)}
                  </div>
                  <button 
                    className="review-delete-btn"
                    onClick={() => handleDeleteReview(review.id)}
                  >
                    Delete
                  </button>
                </div>
                <h4 className="review-title">{review.title}</h4>
                <p className="review-body">{review.body}</p>
                <div className="reviewer-info">
                  <img src={review.avatar} alt="Reviewer" className="reviewer-avatar" />
                  <div className="reviewer-details">
                    <div className="reviewer-name">{review.reviewerName}</div>
                    <div className="review-date">{review.date}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Review Pagination */}
          {totalReviewPages > 1 && (
            <div className="review-pagination">
              <button
                className="review-page-btn"
                onClick={() => handleReviewPageChange(currentReviewPage - 1)}
                disabled={currentReviewPage === 1}
              >
                ←
              </button>
              <span className="review-page-info">
                {currentReviewPage} / {totalReviewPages}
              </span>
              <button
                className="review-page-btn"
                onClick={() => handleReviewPageChange(currentReviewPage + 1)}
                disabled={currentReviewPage === totalReviewPages}
              >
                →
              </button>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ProductEdit;

