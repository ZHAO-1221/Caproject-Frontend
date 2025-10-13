import axios from 'axios';

const API_BASE_URL = '/api';

// 商品服务 - 管理商品信息和库存
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
  // 获取所有可见商品
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

  // 获取分页商品
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

  // 根据ID获取商品详情
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

  // 获取商品评论
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

  // 添加商品到购物车
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

  // 添加商品评论
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

  // 检查商品是否有库存
  isInStock(product: Product): boolean {
    return product.productStockQuantity > 0;
  }

  // 获取商品库存数量
  getStockQuantity(product: Product): number {
    return product.productStockQuantity;
  }

  // 根据商品ID获取库存数量（兼容旧代码）
  getStockQuantityById(productId: number): number {
    // 这个方法需要从API获取商品信息，暂时返回一个默认值
    // 在实际使用中，应该先获取商品信息再调用getStockQuantity
    return 10; // 默认库存
  }
}

export default new ProductService();
