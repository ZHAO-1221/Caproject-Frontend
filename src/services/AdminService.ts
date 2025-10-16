import axios from 'axios';

// API基础URL - 应该与后端服务器地址匹配
// 开发环境通过 CRA 代理到后端，避免CORS
const API_BASE_URL = '/api';

// ==================== 认证相关接口 ====================

// 登录请求接口
export interface LoginRequest {
  username: string;
  password: string;
}

// 登录响应接口
export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    username: string;
    email: string;
    userType: number;
  };
}

/**
 * 管理员登录
 * 对应API: POST /api/admin/auth/login
 * @param username 用户名（员工编号）
 * @param password 密码
 */
export const adminLogin = async (username: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await axios.post<any>(
      `${API_BASE_URL}/admin/auth/login`,
      { username, password },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('API Response - adminLogin:', response.data);

    // 兼容不同后端返回格式：有的只返回 { token }
    const data: any = response.data || {};
    const token: string | undefined = data.token || data?.data?.token;
    const user = data.user || data?.data?.user;
    const success: boolean = typeof data.success === 'boolean' ? data.success : !!token;

    if (success && token) {
      localStorage.setItem('adminToken', token);
      if (user) {
        localStorage.setItem('adminUser', JSON.stringify(user));
      }
      return {
        success: true,
        message: 'OK',
        token,
        user
      };
    }

    return {
      success: false,
      message: data?.message || '登录失败，请检查用户名和密码'
    };
  } catch (error: any) {
    console.error('Error during admin login:', error);

    // 返回错误信息
    return {
      success: false,
      message: error.response?.data?.message || '登录失败，请检查用户名和密码'
    };
  }
};

/**
 * 管理员登出
 */
export const adminLogout = (): void => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  console.log('Admin logged out successfully');
};

/**
 * 检查管理员是否已登录
 */
export const isAdminLoggedIn = (): boolean => {
  return !!localStorage.getItem('adminToken');
};

/**
 * 获取管理员Token
 */
export const getAdminToken = (): string | null => {
  return localStorage.getItem('adminToken');
};

// 统一获取管理员鉴权请求头
const getAdminAuthHeaders = (): Record<string, string> => {
  const token = getAdminToken();
  if (!token) return {};
  // 兼容不同后端校验方式：同时带上 Authorization 与 token 头
  return {
    Authorization: `Bearer ${token}`,
    token: token
  };
};

// ==================== 商品管理接口 ====================

// 商品DTO接口 - 对应后端的ProductRequestDTO
export interface ProductDTO {
  productId?: number;
  productName: string;
  productDescription: string;
  productPrice: number;
  productStockQuantity: number;
  productCategory: string;
  isVisible: number;
  imageUrl: string;
}

// 完整的商品接口 - 对应后端的Product实体
export interface Product {
  productId: number;
  productName: string;
  productDescription: string;
  productPrice: number;
  productStockQuantity: number;
  productCategory: string;
  isVisible: number;
  imageUrl: string;
  reviews?: any[];
  orderItems?: any[];
  shoppingCarts?: any[];
  user?: any;
}

/**
 * 获取所有商品（管理员接口）
 * 对应API: GET /api/admin/products/getAllProducts
 */
export const getAllProducts = async (): Promise<ProductDTO[]> => {
  try {
    const response = await axios.get<Product[]>(
      `${API_BASE_URL}/admin/products/getAllProducts`,
      { headers: { ...getAdminAuthHeaders() } }
    );
    console.log('API Response - getAllProducts:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching all products:', error);
    throw new Error(error.response?.data?.message || '获取商品列表失败');
  }
};

/**
 * 创建新商品（管理员接口）
 * 对应API: POST /api/admin/products/createProduct
 * @param productDTO 商品数据传输对象
 */
export const createProduct = async (productDTO: ProductDTO): Promise<Product> => {
  try {
    const response = await axios.post<Product>(
      `${API_BASE_URL}/admin/products/createProduct`,
      productDTO,
      {
        headers: {
          'Content-Type': 'application/json',
          ...getAdminAuthHeaders()
        }
      }
    );
    console.log('API Response - createProduct:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating product:', error);
    throw new Error(error.response?.data?.message || '创建商品失败');
  }
};

/**
 * 更新商品信息（管理员接口）
 * 对应API: PUT /api/admin/products/updateProduct/{id}
 * @param productId 商品ID
 * @param productDTO 更新的商品数据
 */
export const updateProduct = async (productId: number, productDTO: ProductDTO): Promise<Product> => {
  try {
    const response = await axios.put<Product>(
      `${API_BASE_URL}/admin/products/updateProduct/${productId}`,
      productDTO,
      {
        headers: {
          'Content-Type': 'application/json',
          ...getAdminAuthHeaders()
        }
      }
    );
    console.log('API Response - updateProduct:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error updating product:', error);
    throw new Error(error.response?.data?.message || '更新商品失败');
  }
};

/**
 * 删除商品（管理员接口）
 * 对应API: DELETE /api/admin/products/deleteProduct/{id}
 * @param productId 商品ID
 */
export const deleteProduct = async (productId: number): Promise<void> => {
  try {
    await axios.delete(
      `${API_BASE_URL}/admin/products/deleteProduct/${productId}`,
      { headers: { ...getAdminAuthHeaders() } }
    );
    console.log('Product deleted successfully:', productId);
  } catch (error: any) {
    console.error('Error deleting product:', error);
    throw new Error(error.response?.data?.message || '删除商品失败');
  }
};

/**
 * 更新商品库存（管理员接口）
 * 对应API: PATCH /api/admin/products/updateStock/{id}
 * @param productId 商品ID
 * @param stockQuantity 新的库存数量
 */
export const updateStock = async (productId: number, stockQuantity: number): Promise<Product> => {
  try {
    const response = await axios.patch<Product>(
      `${API_BASE_URL}/admin/products/updateStock/${productId}`,
      { stockQuantity },
      {
        headers: {
          'Content-Type': 'application/json',
          ...getAdminAuthHeaders()
        }
      }
    );
    console.log('API Response - updateStock:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error updating stock:', error);
    throw new Error(error.response?.data?.message || '更新库存失败');
  }
};

/**
 * 设置商品可见性（管理员接口）
 * 对应API: PATCH /api/admin/products/setVisibility/{id}
 * @param productId 商品ID
 * @param isVisible 是否可见 (1: 可见, 0: 不可见)
 */
export const setVisibility = async (productId: number, isVisible: boolean): Promise<Product> => {
  try {
    const response = await axios.patch<Product>(
      `${API_BASE_URL}/admin/products/setVisibility/${productId}`,
      { isVisible: isVisible ? 1 : 0 },
      {
        headers: {
          'Content-Type': 'application/json',
          ...getAdminAuthHeaders()
        }
      }
    );
    console.log('API Response - setVisibility:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error setting visibility:', error);
    throw new Error(error.response?.data?.message || '设置可见性失败');
  }
};

/**
 * 获取分页商品列表（管理员接口）
 * 对应API: GET /api/admin/products
 * @param page 页码（从0开始）
 * @param size 每页数量
 */
export const getProductsPaged = async (page: number = 0, size: number = 10): Promise<any> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/products`, {
      params: { page, size },
      headers: { ...getAdminAuthHeaders() }
    });
    console.log('API Response - getProductsPaged:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching products paged:', error);
    throw new Error(error.response?.data?.message || '获取分页商品列表失败');
  }
};

/**
 * 创建商品并同时上传图片（multipart/form-data）
 * 对应API: POST /api/admin/products/createProductWithImage
 * form-data 字段：
 *  - product: JSON (ProductRequestDTO)
 *  - image: file(binary)
 */
export const createProductWithImage = async (
  productDTO: ProductDTO,
  imageFile: File
): Promise<Product> => {
  try {
    const form = new FormData();
    // 将DTO作为JSON Blob传入“product”字段（与后端OpenAPI一致）
    const productBlob = new Blob([JSON.stringify(productDTO)], { type: 'application/json' });
    form.append('product', productBlob);
    form.append('image', imageFile);

    const response = await axios.post<Product>(
      `${API_BASE_URL}/admin/products/createProductWithImage`,
      form,
      {
        headers: {
          ...getAdminAuthHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error creating product with image:', error);
    throw new Error(error.response?.data?.message || '创建商品图片失败');
  }
};

/**
 * 拉取所有分页商品并合并（管理员接口）
 * 会连续请求直至 last=true
 */
export const getAllProductsAllPages = async (pageSize: number = 100): Promise<Product[]> => {
  const all: Product[] = [];
  let page = 0;
  // 容错：最多请求100页，避免意外循环
  for (let i = 0; i < 100; i++) {
    const res = await getProductsPaged(page, pageSize);
    const content = (res && res.content) ? res.content : [];
    all.push(...content);
    const last: boolean = !!res?.last || content.length < pageSize;
    if (last) break;
    page += 1;
  }
  return all;
};

/**
 * 更新商品图片（管理员接口）
 * 对应API: POST /api/admin/products/updateImage/{id}
 * form-data 字段：image 或 file 或 picture
 */
export const updateProductImage = async (
  productId: number,
  imageFile: File
): Promise<Product> => {
  try {
    const form = new FormData();
    form.append('image', imageFile);

    const response = await axios.post<Product>(
      `${API_BASE_URL}/admin/products/updateImage/${productId}`,
      form,
      {
        headers: {
          ...getAdminAuthHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error updating product image:', error);
    throw new Error(error.response?.data?.message || '更新商品图片失败');
  }
};

// 导出所有API函数
export default {
  // 认证相关
  adminLogin,
  adminLogout,
  isAdminLoggedIn,
  getAdminToken,
  // 商品管理
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  setVisibility,
  getProductsPaged,
  getAllProductsAllPages,
  createProductWithImage,
  updateProductImage
};

