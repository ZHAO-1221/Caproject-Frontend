// 商品服务 - 管理商品信息和库存
export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  inStock: boolean;
  stockQuantity?: number;
}

class ProductService {
  // 模拟商品数据
  private products: { [key: number]: Product } = {
    1: {
      id: 1,
      name: 'Text Heading',
      price: 50,
      image: '/images/placeholder.svg',
      description: 'Description',
      inStock: false,
      stockQuantity: 0,
    },
    2: {
      id: 2,
      name: 'hajimi',
      price: 20,
      image: '/images/hajimi.png',
      description: 'A special product for testing purposes',
      inStock: true,
      stockQuantity: 2,
    }
  };

  // 获取商品信息
  getProduct(productId: number): Product | null {
    return this.products[productId] || null;
  }

  // 获取商品库存数量
  getStockQuantity(productId: number): number {
    const product = this.products[productId];
    return product ? (product.stockQuantity || 0) : 0;
  }

  // 检查商品是否有库存
  isInStock(productId: number): boolean {
    const product = this.products[productId];
    return product ? product.inStock : false;
  }

  // 获取所有商品
  getAllProducts(): Product[] {
    return Object.values(this.products);
  }
}

export default new ProductService();
