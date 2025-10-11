import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ProductDetail.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ProductDetail = () => {
  return (
    <div className="product-detail-v20">
      <Header />
      <Footer />
      <div className="page-product">
        <div className="section">
          <img className="image-icon" alt="product" src="/123/images/blanklogo.png" />
          <div className="column">
            <div className="body">
              <div className="title4">
                <div className="text-strong">
                  <div className="product-detail-v20-text-heading">Text Heading</div>
                </div>
                <div className="price">
                  <div className="text-price">
                    <div className="product-detail-v20-price">
                      <b className="b">$</b>
                      <b className="product-detail-v20-b">50</b>
                    </div>
                  </div>
                </div>
              </div>
              <b className="b2">库存不足</b>
              <div className="text">
                <div className="product-detail-v20-text">
                  <p className="blank-line">Description</p>
                  <p className="blank-line">&nbsp;</p>
                  <p className="blank-line">&nbsp;</p>
                  <p className="blank-line">&nbsp;</p>
                  <p className="blank-line">&nbsp;</p>
                  <p className="blank-line">&nbsp;</p>
                  <p className="blank-line">&nbsp;</p>
                  <p className="blank-line">&nbsp;</p>
                </div>
              </div>
            </div>
            <div className="fields">
              <div className="select-field">
                <div className="label">Quantity</div>
                <div className="select">
                  <div className="value">Value</div>
                  <div className="chevron-down">
                    <img className="icon3" alt="chevron" src="/images/Chevron down.png" />
                  </div>
                </div>
              </div>
            </div>
            <div className="button">
              <div className="product-detail-v20-button">Add to cart</div>
            </div>
          </div>
          <div className="product-detail-v20-icon-button">
            <div className="menu">
              <img className="icon4" alt="fav" src="/images/Favourite_icon.png" />
            </div>
          </div>
        </div>
      </div>
      <div className="card-grid-reviews">
        <div className="text-heading2">
          <div className="product-detail-v20-text-heading">Latest reviews</div>
        </div>
        <div className="card-grid">
          {[...Array(3)].map((_, idx) => (
            <div className="review-card" key={idx}>
              <div className="rating">
                {[...Array(5)].map((_, i) => (
                  <div className="menu" key={i}>
                    <img className="icon5" alt="star" src="/images/Favourite_icon.png" />
                  </div>
                ))}
              </div>
              <div className="review-body">
                <div className="product-detail-v20-price">
                  <div className="product-detail-v20-text-heading">Review title</div>
                </div>
                <div className="text2">
                  <div className="text3">Review body</div>
                </div>
              </div>
              <div className="avatar-block">
                <div className="avatar">
                  <img className="shape-icon" alt="avatar" src="/images/blanklogo.png" />
                </div>
                <div className="info">
                  <div className="title5">Reviewer name</div>
                  <div className="product-detail-v20-description">Date</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
