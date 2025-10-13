import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import cartService from '../services/cartService';
import '../styles/ProductDetail.css';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  inStock: boolean;
  stockQuantity?: number;
}

interface Review {
  id: number;
  title: string;
  body: string;
  rating: number;
  reviewerName: string;
  date: string;
  avatar: string;
}

interface FilterState {
  priceRange: [number, number];
  categories: {
    dailyNecessities: boolean;
    homeKitchen: boolean;
    fashionApparel: boolean;
    sportsOutdoors: boolean;
    electronics: boolean;
    personalCare: boolean;
  };
}

const ProductDetail: React.FC = () => {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  
  // Filter states - will be initialized based on product category
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 100],
    categories: {
      dailyNecessities: false,
      homeKitchen: false,
      fashionApparel: false,
      sportsOutdoors: false,
      electronics: false,
      personalCare: false,
    }
  });

  // Product and reviews data
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // Mock product data
  useEffect(() => {
    // Mock products data
    const mockProducts: { [key: number]: Product } = {
      1: {
        id: 1,
        name: 'Text Heading',
        price: 50,
        image: '/images/placeholder.svg',
        description: 'Description',
        inStock: false, // 库存不足
        stockQuantity: 0,
      },
      2: {
        id: 2,
        name: 'hajimi',
        price: 20,
        image: '/images/hajimi.png',
        description: 'A special product for testing purposes',
        inStock: true, // 有库存，库存为2
        stockQuantity: 2,
      }
    };
    
    const currentProductId = parseInt(productId || '1');
    const mockProduct = mockProducts[currentProductId] || mockProducts[1];
    
    const mockReviews: Review[] = [
      {
        id: 1,
        title: 'Review title',
        body: 'Review body',
        rating: 5,
        reviewerName: 'Reviewer name',
        date: 'Date',
        avatar: '/images/user-avatar.svg'
      },
      {
        id: 2,
        title: 'Review title',
        body: 'Review body',
        rating: 4,
        reviewerName: 'Reviewer name',
        date: 'Date',
        avatar: '/images/user-avatar.svg'
      },
      {
        id: 3,
        title: 'Review title',
        body: 'Review body',
        rating: 5,
        reviewerName: 'Reviewer name',
        date: 'Date',
        avatar: '/images/user-avatar.svg'
      }
    ];
    
    setProduct(mockProduct);
    setReviews(mockReviews);
    
    // Set filter based on product category
    if (mockProduct) {
      const categoryKey = getProductCategoryKey(mockProduct.id);
      setFilters(prev => ({
        ...prev,
        categories: {
          dailyNecessities: categoryKey === 'dailyNecessities',
          homeKitchen: categoryKey === 'homeKitchen',
          fashionApparel: categoryKey === 'fashionApparel',
          sportsOutdoors: categoryKey === 'sportsOutdoors',
          electronics: categoryKey === 'electronics',
          personalCare: categoryKey === 'personalCare',
        }
      }));
    }
    
    setLoading(false);
  }, [productId]);

  // Helper function to get category key based on product ID
  const getProductCategoryKey = (productId: number): string => {
    // Map product IDs to their categories
    if (productId === 2) return 'dailyNecessities'; // hajimi
    if (productId >= 3 && productId <= 12) return 'dailyNecessities';
    if (productId >= 13 && productId <= 22) return 'homeKitchen';
    if (productId >= 23 && productId <= 32) return 'fashionApparel';
    if (productId >= 33 && productId <= 42) return 'sportsOutdoors';
    if (productId >= 43 && productId <= 52) return 'electronics';
    if (productId >= 53 && productId <= 62) return 'personalCare';
    return 'dailyNecessities'; // default
  };

  // Handle price range change
  const handlePriceRangeChange = (newRange: [number, number]) => {
    setFilters(prev => ({
      ...prev,
      priceRange: newRange
    }));
  };

  // Handle category filter change
  const handleCategoryChange = (category: keyof FilterState['categories']) => {
    setFilters(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: !prev.categories[category]
      }
    }));
  };

  // Handle quantity change
  const handleQuantityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setQuantity(parseInt(event.target.value));
  };

  // Handle add to cart
  const handleAddToCart = () => {
    // Check if user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    
    if (!isLoggedIn) {
      // Redirect to login page if not logged in
      navigate('/login');
      return;
    }
    
    if (product?.inStock) {
      // Add to cart using cartService
      cartService.addToCart(
        product.id,
        product.name,
        product.price,
        quantity,
        product.image
      );
      
      console.log(`Added ${quantity} of product ${product.id} to cart`);
      alert(`Added ${quantity} of ${product.name} to cart!`);
    }
  };

  const categories = [
    { key: 'dailyNecessities', label: 'daily necessities' },
    { key: 'homeKitchen', label: 'home&kitchen' },
    { key: 'fashionApparel', label: 'fashion&apparel' },
    { key: 'sportsOutdoors', label: 'sports&outdoors' },
    { key: 'electronics', label: 'electronics' },
    { key: 'personalCare', label: 'personal care' },
  ] as const;

  // Generate quantity options (always show 10 options)
  const quantityOptions = Array.from({ length: 10 }, (_, i) => i + 1);

  if (loading) {
    return (
      <div className="product-detail-page">
        <Header />
        <div className="loading-container">
          <div className="loading-message">Loading product...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-page">
        <Header />
        <div className="error-container">
          <div className="error-message">Product not found</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <Header />
      
      <div className="main-content">
        {/* Filter Sidebar */}
        <div className="filter-sidebar">
          <h3 className="filter-title">Filter</h3>
          
          {/* Price Filter */}
          <div className="filter-section">
            <label className="filter-label">Price</label>
            <div className="price-range-container">
              <div className="price-slider-wrapper">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.priceRange[0]}
                  onChange={(e) => handlePriceRangeChange([parseInt(e.target.value), filters.priceRange[1]])}
                  className="price-slider price-slider-min"
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.priceRange[1]}
                  onChange={(e) => handlePriceRangeChange([filters.priceRange[0], parseInt(e.target.value)])}
                  className="price-slider price-slider-max"
                />
              </div>
              <div className="price-range-labels">
                <span className="price-min">${filters.priceRange[0]}</span>
                <span className="price-max">${filters.priceRange[1]}</span>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="filter-section">
            <label className="filter-label">Category</label>
            <div className="category-list">
              {categories.map((category) => (
                <label key={category.key} className="category-item">
                  <input
                    type="checkbox"
                    checked={filters.categories[category.key]}
                    onChange={() => handleCategoryChange(category.key)}
                    className="category-checkbox"
                  />
                  <span className="category-label">{category.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Back to Browse Button */}
          <div className="back-to-browse-section">
            <button 
              className="back-to-browse-btn"
              onClick={() => navigate('/products')}
            >
              ← Back to Products
            </button>
          </div>
        </div>

        {/* Product Content Area */}
        <div className="product-content-area">
          <div className="product-main-section">
            {/* Product Details */}
            <div className="product-details">
              <div className="product-image-section">
                <div className="product-image">
                  <img src={product.image} alt={product.name} />
                </div>
              </div>
              
            <div className="product-info-section">
              <div className="product-title-price-row">
                <h1 className="product-title">{product.name}</h1>
                <div className="product-price">${product.price}</div>
              </div>
              
              <div className="stock-quantity-row">
                <div className="stock-section">
                  {!product.inStock ? (
                    <span className="stock-status">Out of Stock</span>
                  ) : (
                    <span className="stock-status in-stock">
                      In Stock ({product.stockQuantity} available)
                    </span>
                  )}
                </div>
                
                <div className="product-actions">
                  <div className="quantity-section">
                    <label className="quantity-label">Quantity</label>
                    <select 
                      className="quantity-select"
                      value={quantity}
                      onChange={handleQuantityChange}
                    >
                      {quantityOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="cart-section">
                    <button 
                      className="add-to-cart-btn"
                      onClick={handleAddToCart}
                      disabled={!product.inStock || quantity > (product.stockQuantity || 0)}
                    >
                      Add to{'\n'}cart
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="product-description">{product.description}</div>
            </div>
            </div>

            {/* Product Specifications & Reviews Section */}
            <div className="product-specs-section">
              {/* Product Specifications */}
              <div className="specs-card">
                <h3 className="specs-title">Product Specifications</h3>
                <div className="specs-list">
                  <div className="spec-item">
                    <span className="spec-label">Brand:</span>
                    <span className="spec-value">Group Six</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Category:</span>
                    <span className="spec-value">Daily Necessities</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">SKU:</span>
                    <span className="spec-value">GS-001</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Weight:</span>
                    <span className="spec-value">0.5 kg</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Dimensions:</span>
                    <span className="spec-value">20 x 15 x 10 cm</span>
                  </div>
                </div>
              </div>

              {/* Customer Reviews Summary */}
              <div className="reviews-summary-card">
                <h3 className="reviews-summary-title">Customer Reviews</h3>
                <div className="rating-overview">
                  <div className="rating-score">
                    <span className="rating-number">4.2</span>
                    <div className="rating-stars">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} className={`star ${i < 4 ? 'filled' : ''}`}>
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="rating-count">(127 reviews)</span>
                  </div>
                </div>
                <div className="rating-breakdown">
                  <div className="rating-bar">
                    <span className="rating-label">5★</span>
                    <div className="rating-progress">
                      <div className="rating-fill" style={{width: '60%'}}></div>
                    </div>
                    <span className="rating-percentage">60%</span>
                  </div>
                  <div className="rating-bar">
                    <span className="rating-label">4★</span>
                    <div className="rating-progress">
                      <div className="rating-fill" style={{width: '25%'}}></div>
                    </div>
                    <span className="rating-percentage">25%</span>
                  </div>
                  <div className="rating-bar">
                    <span className="rating-label">3★</span>
                    <div className="rating-progress">
                      <div className="rating-fill" style={{width: '10%'}}></div>
                    </div>
                    <span className="rating-percentage">10%</span>
                  </div>
                  <div className="rating-bar">
                    <span className="rating-label">2★</span>
                    <div className="rating-progress">
                      <div className="rating-fill" style={{width: '3%'}}></div>
                    </div>
                    <span className="rating-percentage">3%</span>
                  </div>
                  <div className="rating-bar">
                    <span className="rating-label">1★</span>
                    <div className="rating-progress">
                      <div className="rating-fill" style={{width: '2%'}}></div>
                    </div>
                    <span className="rating-percentage">2%</span>
                  </div>
                </div>
              </div>

              {/* Recent Reviews */}
              <div className="recent-reviews-card">
                <h3 className="recent-reviews-title">Recent Reviews</h3>
                <div className="recent-reviews-list">
                  {reviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="review-item">
                      <div className="review-header">
                        <div className="review-rating">
                          {Array.from({ length: 5 }, (_, i) => (
                            <span key={i} className={`star ${i < review.rating ? 'filled' : ''}`}>
                              ★
                            </span>
                          ))}
                        </div>
                        <div className="review-meta">
                          <span className="reviewer-name">{review.reviewerName}</span>
                          <span className="review-date">{review.date}</span>
                        </div>
                      </div>
                      <h4 className="review-title">{review.title}</h4>
                      <p className="review-body">{review.body}</p>
                    </div>
                  ))}
                </div>
                <button className="view-all-reviews-btn">View All Reviews</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
