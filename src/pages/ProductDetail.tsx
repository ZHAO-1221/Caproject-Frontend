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
    
    setReviews(mockReviews);
    
    // Set filter based on product category - this will be handled in the product loading effect
    
    setLoading(false);
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
