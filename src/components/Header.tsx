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
        <img className="account-circle-icon" src="/images/user-icon.svg" alt="User Account" />
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

