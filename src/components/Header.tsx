import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Header.css';

const Header: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="header">
      <a href="/easter-egg" style={{ textDecoration: 'none' }}>
        <div className="logo">
          <img src="/images/group-six-logo.png" alt="Group Six Logo" />
        </div>
      </a>
      <div className="home" onClick={() => navigate('/')}>
        <img className="icon" src="/images/home-icon.svg" alt="Home" />
      </div>
      <div className="shopping-cart">
        <img className="div-icon" src="/images/cart-icon.svg" alt="Shopping Cart" />
      </div>
      <a href="/login" style={{ textDecoration: 'none' }}>
        <img className="account-circle-icon" src="/images/user-icon.svg" alt="User Account" />
      </a>
      <div className="search-field">
        <div className="search">Search</div>
      </div>
      <div className="icon-button">
        <div className="menu">
          <img className="icon2" src="/images/menu-icon.svg" alt="Menu" />
        </div>
      </div>
    </div>
  );
};

export default Header;

