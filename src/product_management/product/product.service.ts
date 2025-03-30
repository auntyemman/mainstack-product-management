import { ProductRepository } from './product.repository';
import { IProduct } from './product.model';
import { APIError, BadRequestError, ConflictError, NotFoundError, UnprocessableEntityError } from '../../shared/utils/custom_error';
import { QueryOptions } from 'mongoose';
import { PaginationResult } from '../../shared/utils/pagination';
import { inject, injectable } from 'inversify';
import { PRODUCT_TYPES } from './di/product.di';
import { ProductStatus } from './product.dto';

@injectable()
export class ProductService {
  constructor(@inject(PRODUCT_TYPES.ProductRepository) private readonly productRepository: ProductRepository) {
    this.productRepository = productRepository;
  }

  async createProduct(data: IProduct): Promise<IProduct> {
    const existingProduct = await this.productRepository.findByName(data.name);
    if (existingProduct) {
      throw new ConflictError('Product already exists');
    }
    const product = await this.productRepository.create(data);
    if (!product) {
      throw new APIError('Failed to create product');
    }
    return product;
  }

  async getProduct(id: string): Promise<IProduct> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    return product;
  }

  async publishProduct(id: string): Promise<IProduct> {
    const updatedProduct = await this.productRepository.update(id, { status: ProductStatus.published });
    if (!updatedProduct) {
      throw new UnprocessableEntityError('Failed to publish product');
    }
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<IProduct> {
    const product = await this.productRepository.delete(id);
    if (!product) {
      throw new UnprocessableEntityError('Failed to delete product, could not find product');
    }
    return product;
  }

  async getProducts(
    query: QueryOptions,
    limit: number,
    page: number,
  ): Promise<PaginationResult<IProduct>> {
    // Call the repository method which uses the pagination utility
    return this.productRepository.findMany(query, limit, page);
  }

  async updateProduct(id: string, data: IProduct): Promise<IProduct> {
    const product = await this.productRepository.update(id, data);
    if (!product) {
      throw new APIError('Failed to update product');
    }
    return product;
  }
}
