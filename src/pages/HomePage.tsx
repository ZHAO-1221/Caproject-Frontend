import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/HomePage.css';

const HomePage = () => {
  return (
    <div className="examples-home-page">
      <Header />
      <div className="arrow-left-parent">
        <div className="arrow-left">
          <img className="icon" alt="prev" src="/images/Arrow left.png" />
        </div>
        <div className="hero-actions-wrapper">
          <img className="hero-actions-icon" alt="hero" src="/images/blanklogo.png" />
        </div>
        <div className="arrow-left">
          <img className="icon" alt="next" src="/images/Arrow right.png" />
        </div>
      </div>

      <div className="card-grid-testimonials-wrapper">
        <div className="card-grid-testimonials">
          <div className="text-content-heading">
            <div className="heading">Categories</div>
          </div>
          <div className="card-grid">
            <div className="testimonial-card">
              <div className="text-heading">
                <div className="examples-home-page-text-heading">Daily Necessities</div>
              </div>
              <div className="avatar-block">
                <div className="info">
                  <div className="title" />
                  <div className="description">Description</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="text-heading">
                <div className="examples-home-page-text-heading">{`Fashion & Apparel`}</div>
              </div>
              <div className="examples-home-page-avatar-block">
                <div className="avatar" />
                <div className="info">
                  <div className="title" />
                  <div className="examples-home-page-description" />
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="text-heading">
                <div className="examples-home-page-text-heading">Electronics</div>
              </div>
              <div className="avatar-block2">
                <div className="info">
                  <div className="title" />
                  <div className="examples-home-page-description" />
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="text-heading">
                <div className="examples-home-page-text-heading">{`Home & Kitchen`}</div>
              </div>
              <div className="avatar-block2">
                <div className="info">
                  <div className="title" />
                  <div className="examples-home-page-description" />
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="text-heading">
                <div className="examples-home-page-text-heading">{`Sports & Outdoors`}</div>
              </div>
              <div className="avatar-block2">
                <div className="info">
                  <div className="title" />
                  <div className="examples-home-page-description" />
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="text-heading">
                <div className="examples-home-page-text-heading">Personal Care</div>
              </div>
              <div className="avatar-block2">
                <div className="info">
                  <div className="title" />
                  <div className="examples-home-page-description" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="component-wrapper">
        <div className="component">
          <div className="payment-methodmastercard">
            <div className="base" />
            <img className="mastercard-icon" alt="Mastercard" src="/123/images/Mastercard.png" />
          </div>
          <div className="payment-methodalipay">
            <div className="base" />
            <img className="alipay-icon" alt="Alipay" src="/123/images/Alipay.png" />
          </div>
          <div className="payment-methodgooglepay">
            <div className="base" />
            <img className="googlepay-icon" alt="GooglePay" src="/123/images/GooglePay.png" />
          </div>
          <div className="payment-methodwechat">
            <div className="base" />
            <img className="wechat-icon" alt="WeChat" src="/123/images/WeChat.png" />
          </div>
          <div className="payment-methodapplepay">
            <div className="base" />
            <img className="applepay-icon" alt="ApplePay" src="/123/images/ApplePay.png" />
          </div>
          <div className="payment-methodvisa">
            <div className="base" />
            <img className="visa-logo-icon" alt="Visa" src="/123/images/Visa.png" />
          </div>
        </div>
      </div>

      <Footer />

      <img className="image-8-icon" alt="pc" src="/images/Personal Care_img.png" />
      <img className="image-7-icon" alt="sports" src="/images/sports&Outdoors_img.png" />
      <img className="image-6-icon" alt="daily" src="/images/Daily Necessities_img.png" />
      <img className="image-5-icon" alt="fashion" src="/images/Fashion&Apparel_img.png" />
      <img className="image-10-icon" alt="electronics" src="/images/Electronics_img.png" />
      <img className="image-9-icon" alt="homekitchen" src="/images/Home&Kitchen_img.png" />

    </div>
  );
};

export default HomePage;
