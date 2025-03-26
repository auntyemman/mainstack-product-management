import { QueryOptions } from 'mongoose';
import { BaseRepository } from '../../shared/configs/base.repository';
import { IProduct, Product } from './product.model';
import { paginate, PaginationResult } from '../../shared/utils/pagination';

export class ProductRepository extends BaseRepository<IProduct> {
  private readonly productModel;

  constructor() {
    super(Product);
    this.productModel = Product;
  }

  async findByName(name: string): Promise<IProduct | null> {
    return this.productModel.findOne({ name });
  }

  async findMany(
    query: QueryOptions,
    limit: number,
    page: number,
  ): Promise<PaginationResult<IProduct>> {
    const offset = (page - 1) * limit;
    // Using the paginate utility function
    return paginate(this.productModel, query, limit, offset);
  }
}
