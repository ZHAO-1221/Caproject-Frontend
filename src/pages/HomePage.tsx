import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/HomePage.css';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  
  // 轮播图片数组 - 使用真实的广告图片
  const bannerImages = [
    '/images/ad1.png',
    '/images/ad2.png', 
    '/images/ad3.png'
  ];
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // 轮播控制函数
  const goToPrevious = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? bannerImages.length - 1 : prevIndex - 1
    );
  };
  
  const goToNext = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === bannerImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  // 自动轮播功能
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === bannerImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // 每5秒自动切换

    return () => clearInterval(timer);
  }, [bannerImages.length]);

  const categories = [
    {
      id: 1,
      name: 'Daily Necessities',
      image: '/images/Daily_Necessities_img.png',
      key: 'dailyNecessities'
    },
    {
      id: 2,
      name: 'Fashion & Apparel',
      image: '/images/Fashion&Apparel_img.png',
      key: 'fashionApparel'
    },
    {
      id: 3,
      name: 'Electronics',
      image: '/images/Electronics_img.png',
      key: 'electronics'
    },
    {
      id: 4,
      name: 'Home & Kitchen',
      image: '/images/Home&Kitchen_img.png',
      key: 'homeKitchen'
    },
    {
      id: 5,
      name: 'Sports & Outdoors',
      image: '/images/sports&Outdoors_img.png',
      key: 'sportsOutdoors'
    },
    {
      id: 6,
      name: 'Personal Care',
      image: '/images/Personal_Care_img.png',
      key: 'personalCare'
    }
  ];

  const handleCategoryClick = (categoryKey: string) => {
    // 导航到商品浏览页面，并传递分类参数
    navigate(`/products?category=${categoryKey}`);
  };

  return (
    <div className="homepage">
      <Header />
      
      <main className="main-content">
        {/* Hero Banner Section */}
        <section className="hero-banner">
          <div className="banner-container">
            <button className="banner-nav left-arrow" onClick={goToPrevious}>
              <span className="arrow-icon">‹</span>
            </button>
            
            <div className="banner-content">
              <img 
                src={bannerImages[currentImageIndex]}
                alt={`Advertisement ${currentImageIndex + 1} - ${currentImageIndex === 0 ? 'Ad 1' : currentImageIndex === 1 ? 'Ad 2' : 'Ad 3'}`}
                className="hero-image"
              />
            </div>
            
            <button className="banner-nav right-arrow" onClick={goToNext}>
              <span className="arrow-icon">›</span>
            </button>
            
            {/* 轮播指示器 */}
            <div className="banner-indicators">
              {bannerImages.map((_, index) => (
                <button
                  key={index}
                  className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                  onClick={() => setCurrentImageIndex(index)}
                  aria-label={`Go to advertisement ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="categories-section">
          <div className="container">
            <h2 className="categories-title">Categories</h2>
            
            <div className="categories-grid">
              {categories.map((category) => (
                <div 
                  key={category.id} 
                  className="category-card"
                  onClick={() => handleCategoryClick(category.key)}
                >
                  <div className="category-content">
                    <div className="category-text">
                      <h3 className="category-name">{category.name}</h3>
                    </div>
                    <div className="category-image">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="category-img"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
