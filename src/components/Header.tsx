//by HuXintian
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Header.css';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // 检查登录状态
  const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';

  // 处理购物车点击
  const handleCartClick = () => {
    if (isLoggedIn) {
      navigate('/cart');
    } else {
      navigate('/login');
    }
  };

  // 处理搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // 处理搜索输入变化
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="header">
      <div className="logo" onClick={() => navigate('/easter-egg')}>
        <img src="/images/group-six-logo.png" alt="Group Six Logo" />
      </div>
      <div className="home" onClick={() => navigate('/home')}>
        <img className="icon" src="/images/home-icon.svg" alt="Home" />
      </div>
      <div className="shopping-cart" onClick={handleCartClick}>
        <img className="div-icon" src="/images/cart-icon.svg" alt="Shopping Cart" />
      </div>
      <a href="/login" style={{ textDecoration: 'none' }}>
        <svg className="account-circle-icon" width="64" height="64" viewBox="0 0 52 53" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.675 37.7625C14.5167 36.3271 16.575 35.1953 18.85 34.3672C21.125 33.5391 23.5084 33.125 26 33.125C28.4917 33.125 30.875 33.5391 33.15 34.3672C35.425 35.1953 37.4834 36.3271 39.325 37.7625C40.5889 36.2535 41.573 34.542 42.2771 32.6281C42.9813 30.7142 43.3334 28.6715 43.3334 26.5C43.3334 21.6049 41.6452 17.4366 38.2688 13.9953C34.8924 10.554 30.8028 8.83333 26 8.83333C21.1973 8.83333 17.1077 10.554 13.7313 13.9953C10.3549 17.4366 8.66671 21.6049 8.66671 26.5C8.66671 28.6715 9.01879 30.7142 9.72296 32.6281C10.4271 34.542 11.4112 36.2535 12.675 37.7625ZM26 28.7083C23.8695 28.7083 22.073 27.963 20.6105 26.4724C19.148 24.9818 18.4167 23.1507 18.4167 20.9792C18.4167 18.8076 19.148 16.9766 20.6105 15.4859C22.073 13.9953 23.8695 13.25 26 13.25C28.1306 13.25 29.9271 13.9953 31.3896 15.4859C32.8521 16.9766 33.5834 18.8076 33.5834 20.9792C33.5834 23.1507 32.8521 24.9818 31.3896 26.4724C29.9271 27.963 28.1306 28.7083 26 28.7083ZM26 48.5833C23.0028 48.5833 20.1862 48.0036 17.55 46.8443C14.9139 45.6849 12.6209 44.1115 10.6709 42.124C8.72087 40.1365 7.17712 37.7993 6.03962 35.1125C4.90212 32.4257 4.33337 29.5549 4.33337 26.5C4.33337 23.4451 4.90212 20.5743 6.03962 17.8875C7.17712 15.2007 8.72087 12.8635 10.6709 10.876C12.6209 8.88854 14.9139 7.3151 17.55 6.15573C20.1862 4.99635 23.0028 4.41667 26 4.41667C28.9973 4.41667 31.8139 4.99635 34.45 6.15573C37.0862 7.3151 39.3792 8.88854 41.3292 10.876C43.2792 12.8635 44.823 15.2007 45.9605 17.8875C47.098 20.5743 47.6667 23.4451 47.6667 26.5C47.6667 29.5549 47.098 32.4257 45.9605 35.1125C44.823 37.7993 43.2792 40.1365 41.3292 42.124C39.3792 44.1115 37.0862 45.6849 34.45 46.8443C31.8139 48.0036 28.9973 48.5833 26 48.5833Z" fill="#FFA065"/>
        </svg>
      </a>
      <div className="search-field">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
          />
        </form>
      </div>
    </div>
  );
};

export default Header;