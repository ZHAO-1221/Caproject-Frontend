import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Header.css';

interface HeaderProps {
  hideCart?: boolean;
  onSearch?: (query: string) => void;
  searchValue?: string;
  accountPath?: string; // 点击头像跳转路径，默认 /login
}

const Header: React.FC<HeaderProps> = ({ hideCart = false, onSearch, searchValue, accountPath = '/login' }) => {
  const navigate = useNavigate();
  const [internalSearchQuery, setInternalSearchQuery] = useState('');

  // 使用外部传入的searchValue或内部状态
  const searchQuery = searchValue !== undefined ? searchValue : internalSearchQuery;

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
      if (onSearch) {
        // 如果有自定义搜索处理函数，使用它（本地搜索）
        onSearch(searchQuery.trim());
      } else {
        // 否则默认跳转到products页面
        navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };

  // 处理搜索输入变化
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (onSearch) {
      // 如果有自定义搜索处理函数，实时搜索
      onSearch(value);
    } else {
      setInternalSearchQuery(value);
    }
  };

  return (
    <div className="header">
      <div className="logo" onClick={() => navigate('/easter-egg')}>
        <img src={`${process.env.PUBLIC_URL}/images/group-six-logo.png`} alt="Group Six Logo" />
      </div>
      <div className="home" onClick={() => navigate('/home')}>
        <img className="icon" src={`${process.env.PUBLIC_URL}/images/home-icon.svg`} alt="Home" />
      </div>
      {!hideCart && (
        <div className="shopping-cart" onClick={handleCartClick}>
          <img className="div-icon" src={`${process.env.PUBLIC_URL}/images/cart-icon.svg`} alt="Shopping Cart" />
        </div>
      )}
      <div onClick={() => navigate(accountPath)} style={{ textDecoration: 'none' }}>
        <img className="account-circle-icon" src={`${process.env.PUBLIC_URL}/images/user-icon.svg`} alt="User Account" />
      </div>
      <div className="search-field">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
          />
          {searchQuery && onSearch && (
            <button
              type="button"
              className="clear-search-button"
              onClick={() => onSearch('')}
            >
              ✕
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default Header;

