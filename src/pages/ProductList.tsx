import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ProductList.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ProductList = () => {
  return (
    <div className="product-list">
      <Header />
      <Footer />
      <div className="filter-menu">
        <div className="filter-title"><div className="product-list-text">Filter</div></div>
        <div className="section">
          <div className="label3">
            <div className="label4">Price</div>
            <div className="slider-output">
              <div className="prefix">$</div>
              <div className="prefix">0-100</div>
            </div>
          </div>
          <div className="slider">
            <div className="block">
              <div className="knob-start" />
              <div className="product-list-slider" />
              <div className="knob-start" />
            </div>
          </div>
        </div>
        <div className="section">
          <div className="text">
            <div className="product-list-text">Category</div>
          </div>
          <div className="product-list-checkbox-group">
            <div className="checkbox-field">
              <div className="checkbox-and-label">
                <div className="checkbox">
                  <div className="x">
                    <img className="icon6" alt="check" src="/images/Check_icon.png" />
                  </div>
                </div>
                <div className="label">daily necessities</div>
              </div>
            </div>
            <div className="checkbox-field">
              <div className="checkbox-and-label">
                <div className="checkbox">
                  <div className="x">
                    <img className="icon6" alt="check" src="/images/Check_icon.png" />
                  </div>
                </div>
                <div className="label">home&kitchen</div>
              </div>
            </div>
            <div className="checkbox-field">
              <div className="checkbox-and-label">
                <div className="checkbox">
                  <div className="x">
                    <img className="icon6" alt="check" src="/images/Check_icon.png" />
                  </div>
                </div>
                <div className="label">fashion&apparel</div>
              </div>
            </div>
            <div className="checkbox-field">
              <div className="checkbox-and-label">
                <div className="checkbox">
                  <div className="x">
                    <img className="icon6" alt="check" src="/images/Check_icon.png" />
                  </div>
                </div>
                <div className="label">sports&outdoors</div>
              </div>
            </div>
            <div className="checkbox-field">
              <div className="checkbox-and-label">
                <div className="checkbox">
                  <div className="x">
                    <img className="icon6" alt="check" src="/images/Check_icon.png" />
                  </div>
                </div>
                <div className="label">electronics</div>
              </div>
            </div>
            <div className="checkbox-field">
              <div className="checkbox-and-label">
                <div className="checkbox">
                  <div className="x">
                    <img className="icon6" alt="check" src="/images/Check_icon.png" />
                  </div>
                </div>
                <div className="label">personal care</div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
      <div className="section-product-grid">
        <div className="filter-bar">
          <div className="tag-toggle-group">
            <div className="tag-toggle">
              <div className="x">
                <img className="icon6" alt="new" src="/images/Check_icon.png" />
              </div>
              <div className="product-list-tag">New</div>
            </div>
            <div className="product-list-tag-toggle">
              <div className="product-list-tag">Price ascending</div>
            </div>
            <div className="product-list-tag-toggle">
              <div className="product-list-tag">Price descending</div>
            </div>
            <div className="product-list-tag-toggle">
              <div className="product-list-tag">Rating</div>
            </div>
          </div>
        </div>
        <div className="card-grid">
          {[...Array(10)].map((_, i) => (
            <div className="product-info-card" key={i}>
              <img className="image-icon" alt="product" src="/images/blanklogo.png" />
              <div className="body">
                <div className="text-strong">
                  <div className="label">Text</div>
                </div>
                <div className="text">
                  <div className="product-list-text-strong">$0</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="product-list-div">
        <b className="b">1</b>
        <b className="product-list-b">2</b>
        <b className="b2">3</b>
        <b className="b3">......</b>
      </div>
    </div>
  );
};

export default ProductList;
