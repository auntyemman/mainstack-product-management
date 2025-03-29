import { QueryOptions } from 'mongoose';
import { BaseRepository } from '../../shared/database/base.repository';
import { paginate, PaginationResult } from '../../shared/utils/pagination';
import { IInventory, Inventory } from './inventory.model';
import { injectable } from 'inversify';
import { UnprocessableEntityError } from '../../shared/utils/custom_error';

// Inventory Repository class
@injectable()
export class InventoryRepository extends BaseRepository<IInventory> {
  private readonly inventoryModel;
  constructor() {
    super(Inventory);
    this.inventoryModel = Inventory;
  }

  async findMany(
    query: QueryOptions,
    limit: number,
    page: number,
  ): Promise<PaginationResult<IInventory>> {
    const offset = (page - 1) * limit;
    // Using the paginate utility function
    return paginate(this.inventoryModel, query, limit, offset);
  }

  async updateOne(query: QueryOptions, data: Partial<IInventory>): Promise<IInventory> {
    const update = await this.inventoryModel.findOneAndUpdate(query, data, { new: true, runValidators: true }).exec();
    if (!update) {
      throw new UnprocessableEntityError('Failed to update inventory');
    }
    return update;
  }
}
