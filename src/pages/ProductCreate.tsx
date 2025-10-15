import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const ProductCreate: React.FC = () => {
  const navigate = useNavigate();
  
  // Form states
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState('0');
  const [discount, setDiscount] = useState('0');
  const [productImage, setProductImage] = useState<string | null>(null);
  
  // Additional product fields
  const [category, setCategory] = useState('');
  
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
    // 验证必填字段
    if (!productName.trim()) {
      alert('请输入商品名称！');
      return;
    }
    
    if (!price || parseFloat(price) <= 0) {
      alert('请输入有效的价格！');
      return;
    }
    
    try {
      // 创建符合后端API格式的商品对象（文本部分）
      const newProductDTO: ProductDTO = {
        productName: productName,
        productDescription: description || '暂无描述',
        productPrice: parseFloat(price) || 0,
        productStockQuantity: parseInt(stock) || 0,
        productCategory: category || 'dailyNecessities',
        isVisible: 1, // 默认可见
        // imageUrl 为可选占位，实际图片通过 multipart 独立上传
        imageUrl: '/images/placeholder.svg'
      };
      
      console.log('Creating new product:', newProductDTO);
      
      // 如果选择了图片文件，优先调用带图片上传接口
      // 从 input 的 FileReader 只能得到 base64，这里要求直接从 <input type="file"> 获取 File；
      // 因此我们从DOM再取一次文件引用
      const fileInput = document.getElementById('image-upload-input') as HTMLInputElement | null;
      const file = fileInput?.files?.[0] || null;

      let result;
      if (file) {
        result = await productApi.createProductWithImage(newProductDTO, file);
      } else {
        // 无图片时，走文本创建接口
        result = await productApi.createProduct(newProductDTO);
      }
      console.log('Product created successfully:', result);
      
      alert('新商品创建成功！');
      
      // 跳转回ProductManagement页面
      navigate('/product-management');
    } catch (error) {
      console.error('Error creating product:', error);
      alert('创建商品失败。请稍后重试。');
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
      <Header accountPath="/admin-login" />
      
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
              value=""
              readOnly
                className="product-id-input"
              placeholder="Auto generated"
              title="ID 由系统生成，管理员不可编辑"
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
              
              
            </div>
            
            {/* Submit Button */}
            <button className="submit-btn" onClick={handleSubmit}>
              Submit
            </button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ProductCreate;

