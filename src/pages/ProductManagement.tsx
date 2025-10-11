import React, { useState, useMemo } from 'react';
import ProductManagementHeader from '../components/ProductManagementHeader';
import Footer from '../components/Footer';
import '../styles/ProductManagement.css';

type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  size: string;
  gender: string;
  duration: string;
  image: string;
};

type FilterState = {
  priceRange: [number, number];
  categories: string[];
  genders: string[];
  durations: string[];
};

const CURRENCY = '$';

function formatMoney(value: number): string {
  return `${CURRENCY}${value.toFixed(0)}`;
}

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([
    { id: 1, name: 'Text', price: 25, category: 'Clothes', size: 'M', gender: 'Female', duration: '1 month', image: '/images/placeholder.svg' },
    { id: 2, name: 'Text', price: 45, category: 'Clothes', size: 'L', gender: 'Male', duration: '2 months', image: '/images/placeholder.svg' },
    { id: 3, name: 'Text', price: 15, category: 'Accessories', size: 'S', gender: 'Female', duration: '1 month', image: '/images/placeholder.svg' },
    { id: 4, name: 'Text', price: 60, category: 'Clothes', size: 'XL', gender: 'Male', duration: '3 months', image: '/images/placeholder.svg' },
    { id: 5, name: 'Text', price: 80, category: 'Shoes', size: 'M', gender: 'Female', duration: '1 month', image: '/images/placeholder.svg' },
    { id: 6, name: 'Text', price: 35, category: 'Clothes', size: 'S', gender: 'Female', duration: '2 months', image: '/images/placeholder.svg' },
    { id: 7, name: 'Text', price: 20, category: 'Accessories', size: 'L', gender: 'Male', duration: '1 month', image: '/images/placeholder.svg' },
    { id: 8, name: 'Text', price: 90, category: 'Shoes', size: 'XL', gender: 'Male', duration: '3 months', image: '/images/placeholder.svg' },
    { id: 9, name: 'Text', price: 30, category: 'Clothes', size: 'M', gender: 'Female', duration: '1 month', image: '/images/placeholder.svg' },
    { id: 10, name: 'Text', price: 12, category: 'Accessories', size: 'S', gender: 'Female', duration: '2 months', image: '/images/placeholder.svg' },
    { id: 11, name: 'Text', price: 120, category: 'Electronics', size: 'L', gender: 'Male', duration: '6 months', image: '/images/placeholder.svg' },
    { id: 12, name: 'Text', price: 18, category: 'Books', size: 'M', gender: 'Female', duration: '1 year', image: '/images/placeholder.svg' },
    { id: 13, name: 'Text', price: 75, category: 'Home', size: 'XL', gender: 'Male', duration: '3 months', image: '/images/placeholder.svg' },
    { id: 14, name: 'Text', price: 55, category: 'Sports', size: 'S', gender: 'Female', duration: '1 month', image: '/images/placeholder.svg' },
    { id: 15, name: 'Text', price: 40, category: 'Clothes', size: 'L', gender: 'Male', duration: '2 months', image: '/images/placeholder.svg' },
    { id: 16, name: 'Text', price: 22, category: 'Accessories', size: 'M', gender: 'Female', duration: '6 months', image: '/images/placeholder.svg' },
    { id: 17, name: 'Text', price: 95, category: 'Shoes', size: 'S', gender: 'Female', duration: '1 year', image: '/images/placeholder.svg' },
    { id: 18, name: 'Text', price: 150, category: 'Electronics', size: 'XL', gender: 'Male', duration: '3 months', image: '/images/placeholder.svg' },
    { id: 19, name: 'Text', price: 28, category: 'Books', size: 'L', gender: 'Male', duration: '1 month', image: '/images/placeholder.svg' },
    { id: 20, name: 'Text', price: 65, category: 'Home', size: 'M', gender: 'Female', duration: '2 months', image: '/images/placeholder.svg' }
  ]);

  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 150],
    categories: ['Clothes', 'Accessories', 'Shoes', 'Electronics', 'Books', 'Home', 'Sports'],
    genders: ['Male', 'Female'],
    durations: ['1 month', '2 months', '3 months', '6 months', '1 year']
  });

  const [currentPage, setCurrentPage] = useState(2);
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc'>('price-asc');
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);
  const itemsPerPage = 10; // 每页显示10个商品

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // 价格筛选
      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
        return false;
      }
      
      // 类别筛选
      if (!filters.categories.includes(product.category)) {
        return false;
      }
      
      // 性别筛选
      if (!filters.genders.includes(product.gender)) {
        return false;
      }
      
      // 时长筛选
      if (!filters.durations.includes(product.duration)) {
        return false;
      }
      
      return true;
    });
  }, [products, filters]);

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      if (sortBy === 'price-asc') {
        return a.price - b.price; // 升序：价格从低到高
      } else {
        return b.price - a.price; // 降序：价格从高到低
      }
    });
  }, [filteredProducts, sortBy]);

  // 计算总页数
  const totalPages = useMemo(() => {
    return Math.ceil(sortedProducts.length / itemsPerPage);
  }, [sortedProducts.length, itemsPerPage]);

  // 计算当前页显示的产品
  const currentPageProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedProducts.slice(startIndex, endIndex);
  }, [sortedProducts, currentPage, itemsPerPage]);


  const toggleCategory = (category: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
    setCurrentPage(1); // 筛选后回到第一页
  };


  const toggleGender = (gender: string) => {
    setFilters(prev => ({
      ...prev,
      genders: prev.genders.includes(gender)
        ? prev.genders.filter(g => g !== gender)
        : [...prev.genders, gender]
    }));
    setCurrentPage(1); // 筛选后回到第一页
  };

  const toggleDuration = (duration: string) => {
    setFilters(prev => ({
      ...prev,
      durations: prev.durations.includes(duration)
        ? prev.durations.filter(d => d !== duration)
        : [...prev.durations, duration]
    }));
    setCurrentPage(1); // 筛选后回到第一页
  };

  const handlePriceRangeChange = (value: number, index: 0 | 1) => {
    setFilters(prev => ({
      ...prev,
      priceRange: index === 0 ? [value, prev.priceRange[1]] : [prev.priceRange[0], value]
    }));
    setCurrentPage(1); // 筛选后回到第一页
  };

  const editProduct = (id: number) => {
    console.log('Edit product:', id);
    // 这里可以添加编辑产品的逻辑
  };

  const deleteProduct = (id: number) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="product-management-page">
      <ProductManagementHeader />

      <div className="product-management-container">
        <div className="product-management-content">
          {/* 左侧筛选栏 */}
          <aside className={`filter-sidebar ${isFilterCollapsed ? 'collapsed' : ''}`}>
            <div className="filter-header" onClick={() => setIsFilterCollapsed(!isFilterCollapsed)}>
              <img 
                src="/images/menu-icon.svg" 
                alt="Filter" 
                className={`filter-icon ${isFilterCollapsed ? 'collapsed' : ''}`} 
              />
              <span className="filter-title">Filter</span>
            </div>

            <div className="filter-content">
              {/* 价格筛选 */}
              <div className="filter-section">
                <div className="filter-label">Price</div>
                <div className="price-range">
                  <span className="price-min">${filters.priceRange[0]}</span>
                  <input
                    type="range"
                    min="0"
                    max="150"
                    value={filters.priceRange[1]}
                    onChange={(e) => handlePriceRangeChange(parseInt(e.target.value), 1)}
                    className="price-slider"
                  />
                  <span className="price-max">${filters.priceRange[1]}</span>
                </div>
              </div>

              {/* 类别筛选 */}
              <div className="filter-section">
                <div className="filter-label">Category</div>
                {['Clothes', 'Accessories', 'Shoes', 'Electronics', 'Books', 'Home', 'Sports'].map(category => (
                  <label key={category} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={filters.categories.includes(category)}
                      onChange={() => toggleCategory(category)}
                    />
                    <span className="checkbox-label">Label</span>
                    <span className="checkbox-description">Description</span>
                  </label>
                ))}
              </div>
            </div>

          </aside>

          {/* 主内容区域 */}
          <main className="product-main">
            {/* 顶部控制栏 */}
            <div className="product-controls">
              <div className="controls-left">
                {/* 左侧可以添加其他控件 */}
              </div>
              <div className="controls-right">
                <div className="sort-controls">
                  <button 
                    className="sort-btn active"
                    onClick={() => setSortBy(sortBy === 'price-asc' ? 'price-desc' : 'price-asc')}
                  >
                    Price {sortBy === 'price-asc' ? '↑' : '↓'}
                  </button>
                </div>
                <button className="add-product-btn">
                  <span className="add-icon">+</span>
                </button>
              </div>
            </div>

            {/* 产品网格 */}
            <div className="product-grid">
              {currentPageProducts.map(product => (
                <div key={product.id} className="product-card">
                  <div className="product-image">
                    <img src={product.image} alt={product.name} />
                  </div>
                  <div className="product-info">
                    <div className="product-name">{product.name}</div>
                    <div className="product-price">{formatMoney(product.price)}</div>
                  </div>
                  <div className="product-actions">
                    <button 
                      className="edit-btn"
                      onClick={() => editProduct(product.id)}
                    >
                      Edit
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => deleteProduct(product.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 分页 */}
            <div className="pagination">
              <button 
                className="pagination-btn prev"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              >
                ← Previous
              </button>
              <div className="page-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                  <button 
                    key={pageNum}
                    className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}
                {totalPages > 3 && currentPage < totalPages - 2 && (
                  <span className="page-ellipsis">...</span>
                )}
              </div>
              <button 
                className="pagination-btn next"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              >
                Next →
              </button>
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductManagement;
