import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/ProductBrowse.css';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  rating?: number;
  category?: string;
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

const ProductBrowse: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get URL parameters
  const categoryParam = searchParams.get('category');
  const searchQuery = searchParams.get('search');
  
  // Filter states
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 100],
    categories: {
      dailyNecessities: categoryParam === 'dailyNecessities' || !categoryParam,
      homeKitchen: categoryParam === 'homeKitchen' || !categoryParam,
      fashionApparel: categoryParam === 'fashionApparel' || !categoryParam,
      sportsOutdoors: categoryParam === 'sportsOutdoors' || !categoryParam,
      electronics: categoryParam === 'electronics' || !categoryParam,
      personalCare: categoryParam === 'personalCare' || !categoryParam,
    }
  });

  // Products and pagination
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'new' | 'priceAsc' | 'priceDesc' | 'rating'>('new');
  const [loading, setLoading] = useState(true);

  // Handle URL parameter changes
  useEffect(() => {
    if (categoryParam) {
      // If there's a specific category, filter by that category
      setFilters(prev => ({
        ...prev,
        categories: {
          dailyNecessities: categoryParam === 'dailyNecessities',
          homeKitchen: categoryParam === 'homeKitchen',
          fashionApparel: categoryParam === 'fashionApparel',
          sportsOutdoors: categoryParam === 'sportsOutdoors',
          electronics: categoryParam === 'electronics',
          personalCare: categoryParam === 'personalCare',
        }
      }));
    } else if (searchQuery) {
      // If there's a search query but no specific category, show all categories
      setFilters(prev => ({
        ...prev,
        categories: {
          dailyNecessities: true,
          homeKitchen: true,
          fashionApparel: true,
          sportsOutdoors: true,
          electronics: true,
          personalCare: true,
        }
      }));
    }
  }, [categoryParam, searchQuery]);

  // Mock products data
  useEffect(() => {
    // Create mock products for different categories
    const mockProducts: Product[] = [
      // Daily Necessities products
      {
        id: 2,
        name: 'hajimi',
        price: 20,
        image: '/images/hajimi.png',
        rating: 5,
        category: 'dailyNecessities'
      },
      ...Array.from({ length: 9 }, (_, index) => ({
        id: index + 3,
        name: `Daily Product ${index + 1}`,
        price: Math.floor(Math.random() * 50) + 10,
        image: '/images/placeholder.svg',
        rating: Math.floor(Math.random() * 5) + 1,
        category: 'dailyNecessities'
      })),
      
      // Home & Kitchen products
      ...Array.from({ length: 10 }, (_, index) => ({
        id: index + 13,
        name: `Kitchen Product ${index + 1}`,
        price: Math.floor(Math.random() * 100) + 20,
        image: '/images/placeholder.svg',
        rating: Math.floor(Math.random() * 5) + 1,
        category: 'homeKitchen'
      })),
      
      // Fashion & Apparel products
      ...Array.from({ length: 10 }, (_, index) => ({
        id: index + 23,
        name: `Fashion Item ${index + 1}`,
        price: Math.floor(Math.random() * 80) + 15,
        image: '/images/placeholder.svg',
        rating: Math.floor(Math.random() * 5) + 1,
        category: 'fashionApparel'
      })),
      
      // Sports & Outdoors products
      ...Array.from({ length: 10 }, (_, index) => ({
        id: index + 33,
        name: `Sports Gear ${index + 1}`,
        price: Math.floor(Math.random() * 120) + 25,
        image: '/images/placeholder.svg',
        rating: Math.floor(Math.random() * 5) + 1,
        category: 'sportsOutdoors'
      })),
      
      // Electronics products
      ...Array.from({ length: 10 }, (_, index) => ({
        id: index + 43,
        name: `Electronics ${index + 1}`,
        price: Math.floor(Math.random() * 200) + 50,
        image: '/images/placeholder.svg',
        rating: Math.floor(Math.random() * 5) + 1,
        category: 'electronics'
      })),
      
      // Personal Care products
      ...Array.from({ length: 10 }, (_, index) => ({
        id: index + 53,
        name: `Personal Care ${index + 1}`,
        price: Math.floor(Math.random() * 40) + 5,
        image: '/images/placeholder.svg',
        rating: Math.floor(Math.random() * 5) + 1,
        category: 'personalCare'
      }))
    ];
    
    setProducts(mockProducts);
    setLoading(false);
  }, []);

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

  // Handle sort change
  const handleSortChange = (sortType: typeof sortBy) => {
    setSortBy(sortType);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Get filtered and sorted products
  const getFilteredProducts = () => {
    let filtered = products.filter(product => {
      // Filter by price range
      const inPriceRange = product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1];
      
      // Filter by category
      const categoryMatch = product.category && filters.categories[product.category as keyof typeof filters.categories];
      
      // Filter by search query
      const searchMatch = !searchQuery || product.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      return inPriceRange && categoryMatch && searchMatch;
    });

    // Sort products
    switch (sortBy) {
      case 'priceAsc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'priceDesc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        // Keep original order for 'new'
        break;
    }

    return filtered;
  };

  const filteredProducts = getFilteredProducts();
  const productsPerPage = 10;
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);

  const sortOptions = [
    { key: 'new', label: 'New', active: sortBy === 'new' },
    { key: 'priceAsc', label: 'Price ascending', active: sortBy === 'priceAsc' },
    { key: 'priceDesc', label: 'Price descending', active: sortBy === 'priceDesc' },
    { key: 'rating', label: 'Rating', active: sortBy === 'rating' },
  ] as const;

  const categories = [
    { key: 'dailyNecessities', label: 'daily necessities' },
    { key: 'homeKitchen', label: 'home&kitchen' },
    { key: 'fashionApparel', label: 'fashion&apparel' },
    { key: 'sportsOutdoors', label: 'sports&outdoors' },
    { key: 'electronics', label: 'electronics' },
    { key: 'personalCare', label: 'personal care' },
  ] as const;

  return (
    <div className="product-browse-page">
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
          
          {/* Back to Home Button */}
          <div className="back-to-home-section">
            <button 
              className="back-to-home-btn"
              onClick={() => navigate('/home')}
            >
              ← Back to Home
            </button>
          </div>
        </div>

        {/* Product Display Area */}
        <div className="product-display-area">
          {/* Sort Options */}
          <div className="sort-section">
            <div className="sort-options">
              {sortOptions.map((option) => (
                <button
                  key={option.key}
                  className={`sort-button ${option.active ? 'active' : ''}`}
                  onClick={() => handleSortChange(option.key)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="product-grid">
            {loading ? (
              <div className="loading-message">Loading products...</div>
            ) : currentProducts.length === 0 ? (
              <div className="no-products">No products found</div>
            ) : (
              currentProducts.map((product) => (
                <div 
                  key={product.id} 
                  className="product-card"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <div className="product-image">
                    <img src={product.image} alt={product.name} />
                  </div>
                  <div className="product-info">
                    <div className="product-name">{product.name}</div>
                    <div className="product-price">${product.price}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ← Previous
              </button>
              
              <div className="page-numbers">
                {/* Always show first page */}
                <button
                  className={`page-number ${currentPage === 1 ? 'active' : ''}`}
                  onClick={() => handlePageChange(1)}
                >
                  1
                </button>
                
                {/* Show ellipsis if current page is far from start */}
                {currentPage > 3 && <span className="ellipsis">...</span>}
                
                {/* Show pages around current page */}
                {currentPage > 2 && currentPage < totalPages - 1 && (
                  <button
                    className={`page-number ${currentPage === currentPage - 1 ? 'active' : ''}`}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    {currentPage - 1}
                  </button>
                )}
                
                {/* Show current page if it's not first or last */}
                {currentPage > 1 && currentPage < totalPages && (
                  <button
                    className="page-number active"
                    onClick={() => handlePageChange(currentPage)}
                  >
                    {currentPage}
                  </button>
                )}
                
                {/* Show next page if current page is not last */}
                {currentPage < totalPages - 1 && (
                  <button
                    className={`page-number ${currentPage === currentPage + 1 ? 'active' : ''}`}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    {currentPage + 1}
                  </button>
                )}
                
                {/* Show ellipsis if current page is far from end */}
                {currentPage < totalPages - 2 && <span className="ellipsis">...</span>}
                
                {/* Always show last page if there are more than 1 pages */}
                {totalPages > 1 && (
                  <button
                    className={`page-number ${currentPage === totalPages ? 'active' : ''}`}
                    onClick={() => handlePageChange(totalPages)}
                  >
                    {totalPages}
                  </button>
                )}
              </div>
              
              <button
                className="pagination-button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductBrowse;
