import axios from 'axios';

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
        message: error.response?.data?.message || '获取商品失败'
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
        message: error.response?.data?.message || '获取商品失败'
      };
    }
  }

  // Get product details by ID
  async getProductById(productId: number): Promise<ProductResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/getProductById/${productId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Get product by ID error:', error);
      return {
        success: false,
        message: error.response?.data?.message || '获取商品详情失败'
      };
    }
  }

  // Get product reviews
  async getProductReviews(productId: number): Promise<any> {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/getReviewsByProductId/${productId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Get product reviews error:', error);
      return {
        success: false,
        message: error.response?.data?.message || '获取商品评论失败'
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
        message: error.response?.data?.message || '添加到购物车失败'
      };
    }
  }

  // Add a review for a product
  async addReview(productId: number, comment: string, reviewRank: number, userId?: number): Promise<any> {
    try {
      const url = userId 
        ? `${API_BASE_URL}/products/addReviewToProduct/${productId}`
        : `${API_BASE_URL}/products/test/addReviewToProduct/${productId}`;
      
      const response = await axios.post(url, { comment, reviewRank });
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Add review error:', error);
      return {
        success: false,
        message: error.response?.data?.message || '添加评论失败'
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
