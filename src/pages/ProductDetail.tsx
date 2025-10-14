import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import cartService from '../services/cartService';
import productService, { Product as ApiProduct } from '../services/productService';
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

//

const ProductDetail: React.FC = () => {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  
  //

  // Product and reviews data
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // Load product data from API
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const currentProductId = parseInt(productId || '1');
        const response = await productService.getProductById(currentProductId);
        
        if (response.success && response.data) {
          const apiProduct = response.data as any;
                 // Convert absolute image URL to relative URL for proxy access
                 const imageUrl = apiProduct.imageUrl ? 
                   apiProduct.imageUrl.replace(/http:\/\/[^:]+:8080/, '') : 
                   '/images/placeholder.svg';
          
          const transformedProduct = {
            id: apiProduct.productId,
            name: apiProduct.productName,
            price: apiProduct.productPrice,
            image: imageUrl,
            description: apiProduct.productDescription,
            inStock: apiProduct.productStockQuantity > 0,
            stockQuantity: apiProduct.productStockQuantity,
          };
          
          setProduct(transformedProduct);
        } else {
          console.error('Failed to load product:', response.message);
          // Fallback to mock data
          const mockProduct = {
            id: currentProductId,
            name: 'Product Not Found',
            price: 0,
            image: '/images/placeholder.svg',
            description: 'This product could not be loaded.',
            inStock: false,
            stockQuantity: 0,
          };
          setProduct(mockProduct);
        }
      } catch (error) {
        console.error('Error loading product:', error);
        // Fallback to mock data
        const mockProduct = {
          id: parseInt(productId || '1'),
          name: 'Product Not Found',
          price: 0,
          image: '/images/placeholder.svg',
          description: 'This product could not be loaded.',
          inStock: false,
          stockQuantity: 0,
        };
        setProduct(mockProduct);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
    
    const loadReviews = async () => {
      try {
        const currentProductId = parseInt(productId || '1');
        const res = await productService.getProductReviews(currentProductId);
        if (res?.success && Array.isArray(res.data)) {
          const formatDateYMD = (input: any): string => {
            if (!input) return '';
            const dateObj = new Date(input);
            if (isNaN(dateObj.getTime())) {
              // Try to handle strings like "2025,9,15,18,0" -> take first three parts and join with '-'
              const parts = String(input).split(/\D+/).filter(Boolean);
              if (parts.length >= 3) {
                const [y, m, d] = parts.map(Number);
                const mm = String(m).padStart(2, '0');
                const dd = String(d).padStart(2, '0');
                return `${y}-${mm}-${dd}`;
              }
              return String(input);
            }
            const y = dateObj.getFullYear();
            const m = String(dateObj.getMonth() + 1).padStart(2, '0');
            const d = String(dateObj.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
          };
          const mapped: Review[] = res.data.map((rv: any) => {
            const dateText = formatDateYMD(rv?.reviewCreateTime);
            return {
              id: rv.reviewId,
              title: 'Review',
              body: rv.comment || '',
              rating: typeof rv.reviewRank === 'number' ? rv.reviewRank : 0,
              reviewerName: rv.user?.userName || 'Anonymous',
              date: dateText,
              avatar: '/images/user-avatar.svg'
            };
          });
          setReviews(mapped);
        } else {
          setReviews([]);
        }
      } catch (e) {
        console.error('Error loading reviews:', e);
        setReviews([]);
      }
    };

    loadReviews();
    
    // Set filter based on product category - this will be handled in the product loading effect
  }, [productId]);

  //

  //

  //

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

  //

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

  // Compute rating summary based on fetched reviews
  const totalReviews = reviews.length;
  const averageRating = totalReviews
    ? Math.round((reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews) * 10) / 10
    : 0;
  const roundedForStars = Math.round(averageRating);
  const counts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach(r => {
    const val = Math.max(0, Math.min(5, Math.floor(r.rating || 0)));
    counts[val] += 1;
  });
  const perc = (n: number) => (totalReviews ? Math.round((n / totalReviews) * 100) : 0);

  return (
    <div className="product-detail-page">
      <Header />
      
      <div className="main-content">
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

              {/* Customer Reviews Summary */}
              <div className="reviews-summary-card">
                <h3 className="reviews-summary-title">Customer Reviews</h3>
                <div className="rating-overview">
                  <div className="rating-score">
                    <span className="rating-number">{averageRating}</span>
                    <div className="rating-stars">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} className={`star ${i < roundedForStars ? 'filled' : ''}`}>
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="rating-count">({totalReviews} reviews)</span>
                  </div>
                </div>
                <div className="rating-breakdown">
                  <div className="rating-bar">
                    <span className="rating-label">5★</span>
                    <div className="rating-progress">
                      <div className="rating-fill" style={{width: `${perc(counts[5])}%`}}></div>
                    </div>
                    <span className="rating-percentage">{perc(counts[5])}%</span>
                  </div>
                  <div className="rating-bar">
                    <span className="rating-label">4★</span>
                    <div className="rating-progress">
                      <div className="rating-fill" style={{width: `${perc(counts[4])}%`}}></div>
                    </div>
                    <span className="rating-percentage">{perc(counts[4])}%</span>
                  </div>
                  <div className="rating-bar">
                    <span className="rating-label">3★</span>
                    <div className="rating-progress">
                      <div className="rating-fill" style={{width: `${perc(counts[3])}%`}}></div>
                    </div>
                    <span className="rating-percentage">{perc(counts[3])}%</span>
                  </div>
                  <div className="rating-bar">
                    <span className="rating-label">2★</span>
                    <div className="rating-progress">
                      <div className="rating-fill" style={{width: `${perc(counts[2])}%`}}></div>
                    </div>
                    <span className="rating-percentage">{perc(counts[2])}%</span>
                  </div>
                  <div className="rating-bar">
                    <span className="rating-label">1★</span>
                    <div className="rating-progress">
                      <div className="rating-fill" style={{width: `${perc(counts[1])}%`}}></div>
                    </div>
                    <span className="rating-percentage">{perc(counts[1])}%</span>
                  </div>
                  <div className="rating-bar">
                    <span className="rating-label">0★</span>
                    <div className="rating-progress">
                      <div className="rating-fill" style={{width: `${perc(counts[0])}%`}}></div>
                    </div>
                    <span className="rating-percentage">{perc(counts[0])}%</span>
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
                <button className="view-all-reviews-btn" onClick={() => navigate(`/product/${product.id}/reviews`)}>View All Reviews</button>
              </div>
            </div>
          </div>
          <div className="back-to-browse-section">
            <button
              className="back-to-browse-btn"
              onClick={() => navigate('/products')}
            >
              back to product list
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
