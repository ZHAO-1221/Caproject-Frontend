import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import productService from '../services/productService';
import '../styles/ProductReviewsList.css';

interface ReviewItem {
  id: number;
  body: string;
  rating: number;
  reviewerName: string;
  date: string;
}

const ProductReviewsList: React.FC = () => {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const id = parseInt(productId || '1');
        const res = await productService.getProductReviews(id);
        if (res?.success && Array.isArray(res.data)) {
          const formatDateYMD = (input: any): string => {
            if (!input) return '';
            const dateObj = new Date(input);
            if (isNaN(dateObj.getTime())) {
              const parts = String(input).split(/\D+/).filter(Boolean);
              if (parts.length >= 3) {
                const [y, m, d] = parts.map(Number);
                const mm = String(m).padStart(2, '0');
                const dd = String(d).padStart(2, '0');
                return `${y}-${mm}-${dd}`;
              }
              return String(input);
            }
            const y = dateObj.getFullYear();
            const m = String(dateObj.getMonth() + 1).padStart(2, '0');
            const d = String(dateObj.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
          };
          const toTimestamp = (input: any): number => {
            const d = new Date(input);
            if (!isNaN(d.getTime())) return d.getTime();
            const parts = String(input).split(/\D+/).filter(Boolean);
            if (parts.length >= 3) {
              const [y, m, day] = parts.map(Number);
              return new Date(y, (m || 1) - 1, day || 1).getTime();
            }
            return 0;
          };

          const sorted = [...res.data].sort((a: any, b: any) =>
            toTimestamp(b?.reviewCreateTime) - toTimestamp(a?.reviewCreateTime)
          );

          const mapped: ReviewItem[] = sorted.map((rv: any) => {
            return {
              id: rv.reviewId,
              body: rv.comment || '',
              rating: typeof rv.reviewRank === 'number' ? rv.reviewRank : 0,
              reviewerName: rv.user?.userName || 'Anonymous',
              date: formatDateYMD(rv?.reviewCreateTime)
            };
          });
          setReviews(mapped);
        } else {
          setReviews([]);
        }
      } catch {
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [productId]);

  return (
    <div className="reviews-list-page">
      <Header />
      <div className="main-content">
        <div className="header-row">
          <button className="back-btn" onClick={() => navigate(`/product/${productId}`)}>← Back to product</button>
        </div>

        {loading ? (
          <div className="loading">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="empty">No reviews yet.</div>
        ) : (
          <div className="reviews-list">
            {reviews.map(r => (
              <div key={r.id} className="review-card">
                <div className="review-header">
                  <div className="stars">
                    {Array.from({ length: 5 }, (_, i) => (
                      <span key={i} className={`star ${i < r.rating ? 'filled' : ''}`}>★</span>
                    ))}
                  </div>
                  <div className="meta">
                    <span className="name">{r.reviewerName}</span>
                    <span className="date">{r.date}</span>
                  </div>
                </div>
                <div className="review-body">{r.body}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ProductReviewsList;


