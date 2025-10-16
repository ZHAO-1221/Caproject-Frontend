import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import Header from '../components/AdminHeader';
import Footer from '../components/Footer';
import '../styles/ProductManagement.css';
import * as adminApi from '../services/AdminService';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  rating?: number;
  category?: string;
  productId?: string;
  description?: string;
  stock?: number;
  isVisible?: number; // 1: 可见, 0: 隐藏
}

interface FilterState {
  priceRange: [number, number];
  timeFilter: string;
  clothesType: string;
  gender: string;
  labels: {
    label1: boolean;
    label2: boolean;
    label3: boolean;
  };
  categories: {
    dailyNecessities: boolean;
    homeKitchen: boolean;
    fashionApparel: boolean;
    sportsOutdoors: boolean;
    electronics: boolean;
    personalCare: boolean;
  };
  sizes: {
    small: boolean;
    medium: boolean;
    large: boolean;
  };
}

const ProductManagement: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  
  // Get URL parameters
  const categoryParam = searchParams.get('category');
  const searchQuery = searchParams.get('search');
  
  // Filter states
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 100],
    timeFilter: 'With 1 month',
    clothesType: 'Clothes',
    gender: 'Female',
    labels: {
      label1: true,
      label2: true,
      label3: true,
    },
    categories: {
      dailyNecessities: categoryParam === 'dailyNecessities' || !categoryParam,
      homeKitchen: categoryParam === 'homeKitchen' || !categoryParam,
      fashionApparel: categoryParam === 'fashionApparel' || !categoryParam,
      sportsOutdoors: categoryParam === 'sportsOutdoors' || !categoryParam,
      electronics: categoryParam === 'electronics' || !categoryParam,
      personalCare: categoryParam === 'personalCare' || !categoryParam,
    },
    sizes: {
      small: true,
      medium: true,
      large: true,
    }
  });

  // Products and pagination
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'new' | 'priceAsc' | 'priceDesc' | 'rating'>('new');
  const [loading, setLoading] = useState(true);
  const [priceSort, setPriceSort] = useState<'none' | 'asc' | 'desc'>('none');
  const [maxPrice, setMaxPrice] = useState(100);
  const [localSearchQuery, setLocalSearchQuery] = useState('');

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [localSearchQuery]);

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

  // 将商品接口(ProductDTO)转换为本页展示用的Product格式
  const convertVisibleToProduct = (api: any): Product => {
    // 将后端返回的绝对图片URL转换为相对路径，便于前端代理
    const imageUrl = api.imageUrl
      ? api.imageUrl.replace(/http:\/\/[^:]+:8080/, '')
      : '/images/placeholder.svg';
    return {
      id: api.productId,
      name: api.productName,
      price: api.productPrice,
      image: imageUrl,
      rating: 4,
      category: api.productCategory, // 如 'daily necessities' 等
      productId: String(api.productId),
      description: api.productDescription,
      stock: api.productStockQuantity,
      isVisible: api.isVisible // 1: 可见, 0: 隐藏
    };
  };

  // Function to load products from backend API
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching all products from backend API...');
      // 使用管理员API获取所有商品（包括隐藏的）
      const allProducts = await adminApi.getAllProducts();
      const fetchedProducts: Product[] = Array.isArray(allProducts)
        ? allProducts.map(convertVisibleToProduct)
        : [];
      console.log('Received products from API:', fetchedProducts.length);
      console.log('Converted products:', fetchedProducts);
      
      // 计算最大价格
      const calculatedMaxPrice = fetchedProducts.length > 0 
        ? Math.max(...fetchedProducts.map((p: Product) => p.price))
        : 100;
      console.log('Calculated max price:', calculatedMaxPrice);
      
      setMaxPrice(calculatedMaxPrice);
      setProducts(fetchedProducts);
      
      // 更新价格范围的最大值
      setFilters(prev => ({
        ...prev,
        priceRange: [0, calculatedMaxPrice]
      }));
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading products from API:', error);
      setLoading(false);
      // 如果API调用失败，可以选择显示错误消息或使用本地mock数据
      alert('Failed to load product data from server. Please ensure the backend service is running.');
    }
  }, []);

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Restore sort state on mount
  useEffect(() => {
    const savedSortState = localStorage.getItem('savedSortState');
    if (savedSortState) {
      try {
        const { sortBy: savedSortBy, priceSort: savedPriceSort } = JSON.parse(savedSortState);
        console.log('Restoring sort state:', { savedSortBy, savedPriceSort });
        setSortBy(savedSortBy);
        setPriceSort(savedPriceSort);
        // 清除保存的状态
        localStorage.removeItem('savedSortState');
      } catch (error) {
        console.error('Error restoring sort state:', error);
      }
    }
  }, []);

  // Reload products when returning to this page
  useEffect(() => {
    loadProducts();
  }, [location.key, loadProducts]);

  // Reload products when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadProducts();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', loadProducts);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', loadProducts);
    };
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

  // Handle price sort toggle
  const handlePriceSort = () => {
    if (priceSort === 'none' || priceSort === 'desc') {
      setPriceSort('asc');
      setSortBy('priceAsc');
    } else {
      setPriceSort('desc');
      setSortBy('priceDesc');
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle delete product
  const handleDeleteProduct = async (productId: number) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this product?');
    if (confirmDelete) {
      try {
        console.log(`Deleting product with ID: ${productId}`);
        
        // 调用后端API删除商品
        await adminApi.deleteProduct(productId);
        console.log('Product deleted successfully from backend');
        
        // 从本地状态中移除商品
        setProducts(prevProducts => 
          prevProducts.filter(product => product.id !== productId)
        );
        
        alert('Product deleted successfully!');
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product. Please try again later.');
      }
    }
  };

  // Handle toggle product visibility
  const handleToggleVisibility = async (productId: number, currentVisibility: number) => {
    try {
      const newVisibility = currentVisibility === 1 ? 0 : 1;
      const action = newVisibility === 1 ? 'Show' : 'Hide';
      
      console.log(`Toggling visibility for product ${productId}: ${currentVisibility} -> ${newVisibility}`);
      
      // 调用后端API设置商品可见性
      await adminApi.setVisibility(productId, newVisibility === 1);
      console.log('Product visibility updated successfully');
      
      // 更新本地状态
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === productId 
            ? { ...product, isVisible: newVisibility }
            : product
        )
      );
      
      alert(`Product has been ${action}!`);
    } catch (error) {
      console.error('Error toggling product visibility:', error);
      alert('Failed to toggle product visibility. Please try again later.');
    }
  };

  // Get filtered and sorted products
  const getFilteredProducts = () => {
    if (localSearchQuery) {
      console.log(`Searching for: "${localSearchQuery}"`);
    }
    
    let filtered = products.filter(product => {
      // Filter by price range
      const inPriceRange = product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1];
      
      // Map API category text to filter keys
      let categoryMatch = true;
      if (product.category) {
        const map: Record<string, keyof FilterState['categories']> = {
          'daily necessities': 'dailyNecessities',
          'home&kitchen': 'homeKitchen',
          'fashion&apparel': 'fashionApparel',
          'sports&outdoors': 'sportsOutdoors',
          'electronics': 'electronics',
          'personal care': 'personalCare'
        };
        const key = map[(product.category || '').trim().toLowerCase() as keyof typeof map] as keyof FilterState['categories'] | undefined;
        if (key) {
          categoryMatch = !!filters.categories[key];
        }
      }
      
      // Filter by search query (search in both name and productId)
      const nameMatch = product.name.toLowerCase().includes((localSearchQuery || '').toLowerCase());
      const idMatch = (product as any).productId && (product as any).productId.toLowerCase().includes((localSearchQuery || '').toLowerCase());
      const searchMatch = !localSearchQuery || nameMatch || idMatch;
      
      if (localSearchQuery && searchMatch) {
        console.log(`Found match: ${product.name} (ID: ${(product as any).productId || 'N/A'})`);
      }
      
      return inPriceRange && categoryMatch && searchMatch;
    });

    console.log(`Sorting by: ${sortBy}, Total products before sort:`, filtered.length);

    // Sort products
    switch (sortBy) {
      case 'priceAsc':
        filtered.sort((a, b) => {
          const priceA = typeof a.price === 'number' ? a.price : parseFloat(a.price) || 0;
          const priceB = typeof b.price === 'number' ? b.price : parseFloat(b.price) || 0;
          return priceA - priceB;
        });
        console.log('Sorted ascending, first 3 prices:', filtered.slice(0, 3).map(p => p.price));
        break;
      case 'priceDesc':
        filtered.sort((a, b) => {
          const priceA = typeof a.price === 'number' ? a.price : parseFloat(a.price) || 0;
          const priceB = typeof b.price === 'number' ? b.price : parseFloat(b.price) || 0;
          return priceB - priceA;
        });
        console.log('Sorted descending, first 3 prices:', filtered.slice(0, 3).map(p => p.price));
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
    <div className="product-management-page">
      <Header 
        onSearch={setLocalSearchQuery}
        searchValue={localSearchQuery}
        accountPath="/admin-login"
      />
      
      <div className="main-content">
        {/* Filter Sidebar */}
        <div className="filter-sidebar">
          {/* Header */}
          <div className="filter-header">
            <h3 className="filter-title">Filter</h3>
          </div>
          {/* Price Filter */}
          <div className="filter-section">
            <label className="filter-label">Price</label>
            <div className="price-range-container">
              <div className="price-slider-wrapper">
                <input
                  type="range"
                  min="0"
                  max={maxPrice}
                  value={filters.priceRange[0]}
                  onChange={(e) => handlePriceRangeChange([parseInt(e.target.value), filters.priceRange[1]])}
                  className="price-slider price-slider-min"
                />
                <input
                  type="range"
                  min="0"
                  max={maxPrice}
                  value={filters.priceRange[1]}
                  onChange={(e) => handlePriceRangeChange([filters.priceRange[0], parseInt(e.target.value)])}
                  className="price-slider price-slider-max"
                />
              </div>
              <div className="price-range-labels">
                <span className="price-min">$0</span>
                <input
                  readOnly
                  className="price-max-display"
                  value={`$${filters.priceRange[1]}`}
                />
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

          {/* Back to Home */}
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
            <div className="add-product-btn-container">
              <button 
                className="add-product-btn"
                onClick={() => {
                  // 保存当前的排序状态
                  localStorage.setItem('savedSortState', JSON.stringify({
                    sortBy: sortBy,
                    priceSort: priceSort
                  }));
                  navigate('/product-create');
                }}
                title="Add New Product"
              >
                ⊕
              </button>
            </div>
            <div className="sort-options">
              <div className="sort-dropdown">
                <button 
                  className={`sort-dropdown-btn ${priceSort !== 'none' ? 'active' : ''}`}
                  onClick={handlePriceSort}
                >
                  Price {priceSort === 'asc' ? '▲' : priceSort === 'desc' ? '▼' : '▼'}
                </button>
              </div>
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
                  className={`product-card ${product.isVisible === 0 ? 'product-hidden' : ''}`}
                >
                  <div className="product-image">
                    <img src={product.image} alt={product.name} />
                  </div>
                  <div className="product-info">
                    <div className="product-text-info">
                      <div className="product-name">{product.name}</div>
                      <div className="product-id-display">
                        ID: {(product as any).productId || ''}
                      </div>
                    </div>
                    <div className="product-actions-wrapper">
                      <div className="product-actions">
                        <button 
                          className={`visibility-btn ${
                            (product.stock || 0) <= 0 ? 'out-of-stock' : 
                            product.isVisible === 1 ? 'visible' : 'invisible'
                          }`}
                          onClick={() => handleToggleVisibility(product.id, product.isVisible || 0)}
                          disabled={(product.stock || 0) <= 0}
                          title={
                            (product.stock || 0) <= 0 ? 'Product is invisible to users (Out of stock)' :
                            product.isVisible === 1 ? 'Click to hide product from users' : 
                            'Click to show product to users'
                          }
                        >
                          {(product.stock || 0) <= 0 ? 'Out of Stock' : 
                           product.isVisible === 1 ? 'Visible' : 'Invisible'}
                        </button>
                        <button 
                          className="edit-btn"
                          onClick={() => {
                            // 确保商品信息存在于localStorage
                            const storedProducts = JSON.parse(localStorage.getItem('products') || '[]');
                            const existingProduct = storedProducts.find((p: any) => p.id === product.id);
                            
                            if (!existingProduct) {
                              // 如果localStorage中没有，添加完整的商品信息
                              storedProducts.push(product);
                              localStorage.setItem('products', JSON.stringify(storedProducts));
                              console.log('Added product to localStorage:', product);
                            }
                            
                            // 保存当前的排序状态
                            localStorage.setItem('savedSortState', JSON.stringify({
                              sortBy: sortBy,
                              priceSort: priceSort
                            }));
                            
                            navigate(`/product-edit/${product.id}`);
                          }}
                        >
                          Edit
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="product-price">${product.price}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          <div className="pagination">
            <button
              className="pagination-button prev-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ← Previous
            </button>
            
            <div className="page-numbers">
              {/* 始终显示第一页 */}
              {currentPage > 2 && (
                <>
                  <button
                    className="page-number"
                    onClick={() => handlePageChange(1)}
                  >
                    1
                  </button>
                  {currentPage > 3 && <span className="ellipsis">......</span>}
                </>
              )}
              
              {/* 显示当前页前一页 */}
              {currentPage > 1 && (
                <button
                  className="page-number"
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  {currentPage - 1}
                </button>
              )}
              
              {/* 显示当前页 */}
              <button className="page-number active">
                {currentPage}
              </button>
              
              {/* 显示当前页后一页 */}
              {currentPage < totalPages && (
                <button
                  className="page-number"
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  {currentPage + 1}
                </button>
              )}
              
              {/* 显示省略号和最后一页 */}
              {currentPage < totalPages - 1 && (
                <>
                  {currentPage < totalPages - 2 && <span className="ellipsis">......</span>}
                  <button
                    className="page-number"
                    onClick={() => handlePageChange(totalPages)}
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>
            
            <button
              className="pagination-button next-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductManagement;

