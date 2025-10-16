//by SunWenjing
import axios from 'axios';
import authService from './authService';
const API_BASE_URL = '/api';

// Product Service - manages product information and inventory
export interface Product {
  productId: number;
  productName: string;
  productPrice: number;
  imageUrl: string;
  productDescription: string;
  productStockQuantity: number;
  productCategory: string;
  isVisible: number;
}

export interface ProductResponse {
  success: boolean;
  message?: string;
  data?: Product | Product[];
}

class ProductService {
  // Get all visible products
  async getVisibleProducts(): Promise<ProductResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/getVisibleProducts`);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Get visible products error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'fail to get product'
      };
    }
  }

  // Get paginated products
  async getProductsPaged(page: number = 0, size: number = 10): Promise<ProductResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/products`, {
        params: { page, size }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Get products paged error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'fail to get product'
      };
    }
  }

  // Get product details by ID
  async getProductById(productId: number): Promise<ProductResponse> {
    try {
      // 先尝试路径参数形式
      try {
        const response = await axios.get(`${API_BASE_URL}/products/getProductById/${productId}`);
        return { success: true, data: response.data };
      } catch (errPath: any) {
        // 再尝试 query 参数形式
        const response = await axios.get(`${API_BASE_URL}/products/getProductById`, {
          params: { productId }
        });
        return { success: true, data: response.data };
      }
    } catch (error: any) {
      console.error('Get product by ID error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'fail to get product detail'
      };
    }
  }

  // Get product reviews
  async getProductReviews(productId: number): Promise<any> {
    try {
      console.log('=== get review ===');
      console.log('ID:', productId);
      console.log('URL:', `${API_BASE_URL}/products/getReviewsByProductId/${productId}`);
      
      // 先尝试路径参数形式
      try {
        const response = await axios.get(`${API_BASE_URL}/products/getReviewsByProductId/${productId}`);
        console.log('review response:', response.data);
        return { success: true, data: response.data };
      } catch (errPath: any) {
        console.log('path error try to use query:', errPath.message);
        // 再尝试 query 参数形式
        const response = await axios.get(`${API_BASE_URL}/products/getReviewsByProductId`, {
          params: { productId }
        });
        console.log('Query response:', response.data);
        return { success: true, data: response.data };
      }
    } catch (error: any) {
      console.error('Get product reviews error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'fail to get product review'
      };
    }
  }

  // Add product to cart
  async addToCart(productId: number, quantity: number, userId?: number): Promise<any> {
    try {
      const url = userId 
        ? `${API_BASE_URL}/products/addToCart/${productId}?userId=${userId}`
        : `${API_BASE_URL}/products/test/addToCart/${productId}`;
      
      const response = await axios.post(url, { quantity });
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Add to cart error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'fail to add in cart'
      };
    }
  }

  // Add a review for a product
  async addReview(productId: number, comment: string, reviewRank: number, userId?: number, title?: string): Promise<any> {
    try {
      const url = userId 
        ? `${API_BASE_URL}/products/addReviewToProduct/${productId}`
        : `${API_BASE_URL}/products/test/addReviewToProduct/${productId}`;
      
      const headers = {
        'Content-Type': 'application/json',
        ...authService.getAuthHeaders()
      };
      const payload: any = { comment, reviewRank };
      if (userId) {
        payload.userId = userId;
      }
      if (title) {
        payload.title = title;
      }
      const response = await axios.post(url, payload, { headers });
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Add review error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.response?.data?.error || `fail to add review（${error.response?.status || 'unknown state'}）`
      };
    }
  }

  // Check whether a product is in stock
  isInStock(product: Product): boolean {
    return product.productStockQuantity > 0;
  }

  // Get the stock quantity of a product
  getStockQuantity(product: Product): number {
    return product.productStockQuantity;
  }

  // Get stock quantity by product ID (compatibility with older code)
  getStockQuantityById(productId: number): number {
    // This method should fetch product info from the API; returns a placeholder for now
    // In real usage, fetch the product first, then call getStockQuantity
    return 10; // default stock
  }
}

export default new ProductService();
