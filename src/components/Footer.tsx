import React from 'react';
import '../styles/Footer.css';

const Footer: React.FC = () => {
  return (
    <div className="footer">
      <div className="div-footer">
        <div className="title">
          <a href="/easter-egg" style={{ textDecoration: 'none' }}>
            <div className="footer-logo">
              <img src="/images/group-six-logo.png" alt="Group Six Logo" />
            </div>
          </a>
          <div className="button-list">
            <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">
              <img className="x-logo-icon" src="/images/linkedin-icon.svg" alt="LinkedIn" />
            </a>
            <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer">
              <img className="x-logo-icon" src="/images/youtube-icon.svg" alt="YouTube" />
            </a>
            <a href="https://www.x.com" target="_blank" rel="noopener noreferrer">
              <img className="x-logo-icon" src="/images/x-icon.svg" alt="X (Twitter)" />
            </a>
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
              <img className="x-logo-icon" src="/images/instagram-icon.svg" alt="Instagram" />
            </a>
          </div>
        </div>
        <div className="text-link-list">
          <div className="div-title">
            <div className="text-strong">
              <div className="div-text-strong">Contact us</div>
            </div>
          </div>
          <div className="text-link-list-item">
            <div className="list-item">
              Email: <a href="mailto:GroupSix@gmail.com" style={{ color: '#1e1e1e', textDecoration: 'underline' }}>GroupSix@gmail.com</a>
            </div>
          </div>
          <div className="text-link-list-item">
            <div className="list-item">
              Phone: <a href="tel:+6583956478" style={{ color: '#1e1e1e', textDecoration: 'underline' }}>+65 83956478</a>
            </div>
          </div>
          <div className="text-link-list-item">
            <div className="list-item">Address:</div>
          </div>
          <div className="text-link-list-item">
            <div className="list-item">
              <p className="blank-line">
                <a href="https://maps.google.com/?q=25+Heng+Mui+Keng+Ter,+Singapore+119615" target="_blank" rel="noopener noreferrer" style={{ color: '#1e1e1e', textDecoration: 'underline' }}>
                  25 Heng Mui Keng Ter,
                </a>
              </p>
              <p className="blank-line">
                <a href="https://maps.google.com/?q=25+Heng+Mui+Keng+Ter,+Singapore+119615" target="_blank" rel="noopener noreferrer" style={{ color: '#1e1e1e', textDecoration: 'underline' }}>
                  Singapore 119615
                </a>
              </p>
            </div>
          </div>
        </div>
        <div className="div-text-link-list">
          <div className="title2">
            <div className="text-strong">
              <div className="div-text-strong">Our story</div>
            </div>
          </div>
          <div className="text-link-list-item">
            <div className="list-item">Since 1888</div>
          </div>
          <div className="text-link-list-item">
            <div className="list-item">Century-old shop</div>
          </div>
          <div className="text-link-list-item">
            <div className="list-item">Development features</div>
          </div>
          <div className="text-link-list-item">
            <div className="list-item">Quality choice</div>
          </div>
          <div className="text-link-list-item">
            <div className="list-item">Integrity management</div>
          </div>
        </div>
        <div className="text-link-list2">
          <div className="title2">
            <div className="text-strong">
              <div className="div-text-strong">Terms&Condition</div>
            </div>
          </div>
          <div className="text-link-list-item">
            <div className="list-item">Terms&Conditions</div>
          </div>
          <div className="text-link-list-item">
            <div className="list-item">Privacy Policy</div>
          </div>
          <div className="text-link-list-item">
            <div className="list-item12">Secure payment method</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;

