import { QueryOptions } from 'mongoose';
import { APIError, NotFoundError } from '../../shared/utils/custom_error';
import { PaginationResult } from '../../shared/utils/pagination';
import { IInventory } from './inventory.model';
import { InventoryRepository } from './inventory.repository';
import { inject, injectable } from 'inversify';
import { TYPES } from './di/inventory.di';

// Service layer class for Inventory where the business logic is implemented
@injectable()
export class InventoryService {
  // private readonly inventoryRepo: InventoryRepository;

  constructor(@inject(TYPES.InventoryRepository) private readonly inventoryRepo: InventoryRepository) {
    // this.inventoryRepo = new InventoryRepository();
    this.inventoryRepo = inventoryRepo;
  }


  async createInventory(data: IInventory): Promise<IInventory> {
    const inventory = await this.inventoryRepo.create(data);
    if (!inventory) {
      throw new APIError('Failed to create inventory');
    }
    return inventory;
  }

  async getInventory(id: string): Promise<IInventory> {
    const inventory = await this.inventoryRepo.findById(id);
    if (!inventory) {
      throw new NotFoundError('Inventory not found');
    }
    return inventory;
  }

  async getInventories(
    query: QueryOptions,
    limit: number,
    page: number,
  ): Promise<PaginationResult<IInventory>> {
    // Using the paginate utility function
    const inventories = await this.inventoryRepo.findMany(query, limit, page);
    if (!inventories) {
      throw new APIError('Failed to get inventories');
    }
    return inventories;
  }

  async updateInventory(id: string, data: IInventory): Promise<IInventory> {
    const inventory = await this.inventoryRepo.update(id, data);
    if (!inventory) {
      throw new APIError('Failed to update inventory');
    }
    return inventory;
  }

  async addToProductQuantity(productId: string, quantity: number): Promise<IInventory> {
    const inventory = await this.inventoryRepo.findOne({ product: productId });
    if (!inventory) {
      throw new NotFoundError('Inventory not found');
    }
    // increase the product quantity
    inventory.quantity += quantity;
    const updated = await this.inventoryRepo.update(inventory.id, inventory);
    if (!updated) {
      throw new APIError('Failed to update inventory');
    }
    return inventory;
  }

  async removeFromProductQuantity(productId: string, quantity: number): Promise<IInventory> {
    const inventory = await this.inventoryRepo.findOne({ product: productId });
    if (!inventory) {
      throw new NotFoundError('Inventory not found');
    }
    if (inventory.quantity < quantity) {
      throw new APIError('Insufficient stock unit');
    }
    // decrease the product quantity
    inventory.quantity -= quantity;

    const updated = await this.inventoryRepo.update(inventory.id, inventory);
    if (!updated) {
      throw new APIError('Failed to update inventory');
    }
    return inventory;
  }

  async getInventoryByProductId(productId: string): Promise<IInventory> {
    const inventory = await this.inventoryRepo.findOne({ product: productId });
    if (!inventory) {
      throw new NotFoundError('Inventory not found');
    }
    return inventory;
  }

  async deleteInventory(id: string): Promise<IInventory> {
    const inventory = await this.inventoryRepo.delete(id);
    if (!inventory) {
      throw new APIError('Failed to delete inventory');
    }
    return inventory;
  }
}
