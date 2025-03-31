import { InventoryService } from './inventory.service';
import { InventoryRepository } from './inventory.repository';
import { IInventory } from './inventory.model';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnprocessableEntityError,
} from '../../shared/utils/custom_error';
import { PaginationResult } from '../../shared/utils/pagination';

// Mock the InventoryRepository class
jest.mock('./inventory.repository');

// DTOs for the test
const createInventoryDTO = { quantity: 10, location: 'Warehouse A' };
const updateInventoryDTO = { quantity: 15, location: 'Warehouse B' };

describe('InventoryService', () => {
  let inventoryService: InventoryService;
  let inventoryRepo: InventoryRepository;

  beforeEach(() => {
    inventoryRepo = new InventoryRepository() as jest.Mocked<InventoryRepository>;
    inventoryService = new InventoryService(inventoryRepo);
  });

  // Test createInventory
  describe('createInventory', () => {
    it('should create an inventory for a product successfully', async () => {
      const productId = '123';
      const inventoryData = { ...createInventoryDTO, product: productId }; // Merge DTO and productId
      const createdInventory: Partial<IInventory> = { ...inventoryData, id: 'inventoryId' };

      inventoryRepo.findOne = jest.fn().mockResolvedValue(null); // No existing inventory
      inventoryRepo.create = jest.fn().mockResolvedValue(createdInventory);

      const result = await inventoryService.createInventory(productId, inventoryData);

      expect(result).toEqual(createdInventory);
      expect(inventoryRepo.create).toHaveBeenCalledWith(inventoryData);
    });

    it('should throw ConflictError if inventory already exists for the product', async () => {
      const productId = '123';
      const inventoryData = { ...createInventoryDTO, product: productId };

      inventoryRepo.findOne = jest.fn().mockResolvedValue(inventoryData); // Existing inventory

      await expect(inventoryService.createInventory(productId, inventoryData)).rejects.toThrow(
        new ConflictError('Inventory already exists for this product'),
      );
    });

    it('should throw UnprocessableEntityError if inventory creation fails', async () => {
      const productId = '123';
      const inventoryData = { ...createInventoryDTO, product: productId };

      inventoryRepo.findOne = jest.fn().mockResolvedValue(null); // No existing inventory
      inventoryRepo.create = jest.fn().mockResolvedValue(null); // Creation fails

      await expect(inventoryService.createInventory(productId, inventoryData)).rejects.toThrow(
        new UnprocessableEntityError('Failed to create inventory'),
      );
    });
  });

  // Test getInventory
  describe('getInventory', () => {
    it('should return the inventory for the product', async () => {
      const productId = '123';
      const inventoryData: Partial<IInventory> = { ...createInventoryDTO, product: productId };

      inventoryRepo.findOne = jest.fn().mockResolvedValue(inventoryData);

      const result = await inventoryService.getInventory(productId);

      expect(result).toEqual(inventoryData);
      expect(inventoryRepo.findOne).toHaveBeenCalledWith({ product: productId });
    });

    it('should throw NotFoundError if inventory is not found', async () => {
      const productId = '123';

      inventoryRepo.findOne = jest.fn().mockResolvedValue(null); // Inventory not found

      await expect(inventoryService.getInventory(productId)).rejects.toThrow(
        new NotFoundError('Inventory not found'),
      );
    });
  });

  // Test getInventories
  describe('getInventories', () => {
    it('should return paginated inventories', async () => {
      const query = {};
      const limit = 10;
      const page = 1;
      const currentPage = 1;
      const paginationResult: PaginationResult<IInventory> = {
        data: [
          { product: '123', quantity: 10, location: 'Lagos', _id: '13jsd93' },
        ] as unknown as IInventory[],
        currentPage,
        limit,
        totalItems: 1,
        totalPages: 1,
      };

      inventoryRepo.findMany = jest.fn().mockResolvedValue(paginationResult);

      const result = await inventoryService.getInventories(query, limit, page);

      expect(result).toEqual(paginationResult);
      expect(inventoryRepo.findMany).toHaveBeenCalledWith(query, limit, page);
    });

    it('should throw UnprocessableEntityError if getting inventories fails', async () => {
      const query = {};
      const limit = 10;
      const page = 1;

      inventoryRepo.findMany = jest.fn().mockResolvedValue(null); // Fetching inventories fails

      await expect(inventoryService.getInventories(query, limit, page)).rejects.toThrow(
        new UnprocessableEntityError('Failed to get inventories'),
      );
    });
  });

  // Test updateInventory
  describe('updateInventory', () => {
    it('should update inventory successfully', async () => {
      const productId = '123';
      const updateData = { ...updateInventoryDTO, product: productId };
      const updatedInventory: Partial<IInventory> = { ...updateData, id: 'inventoryId' };

      inventoryRepo.updateOne = jest.fn().mockResolvedValue(updatedInventory);

      const result = await inventoryService.updateInventory(productId, updateData);

      expect(result).toEqual(updatedInventory);
      expect(inventoryRepo.updateOne).toHaveBeenCalledWith({ product: productId }, updateData);
    });

    it('should throw UnprocessableEntityError if inventory update fails', async () => {
      const productId = '123';
      const updateData = { ...updateInventoryDTO, product: productId };

      inventoryRepo.updateOne = jest.fn().mockResolvedValue(null); // Update fails

      await expect(inventoryService.updateInventory(productId, updateData)).rejects.toThrow(
        new UnprocessableEntityError('Failed to update inventory'),
      );
    });
  });

  // Test updateQuantity
  describe('updateQuantity', () => {
    it('should update the quantity of inventory successfully', async () => {
      const productId = '123';
      const quantity = 5;
      const existingInventory: Partial<IInventory> = { product: productId, quantity: 10 };
      const updatedInventory: Partial<IInventory> = { ...existingInventory, quantity: 15 };

      inventoryRepo.findOne = jest.fn().mockResolvedValue(existingInventory);
      inventoryRepo.update = jest.fn().mockResolvedValue(updatedInventory);

      const result = await inventoryService.updateQuantity(productId, quantity);

      expect(result).toEqual(updatedInventory);
      expect(inventoryRepo.findOne).toHaveBeenCalledWith({ product: productId });
      expect(inventoryRepo.update).toHaveBeenCalledWith(existingInventory.id, updatedInventory);
    });

    it('should throw BadRequestError if insufficient stock during quantity update', async () => {
      const productId = '123';
      const quantity = -15; // Trying to remove more than available

      const existingInventory: Partial<IInventory> = { product: productId, quantity: 10 };

      inventoryRepo.findOne = jest.fn().mockResolvedValue(existingInventory);

      await expect(inventoryService.updateQuantity(productId, quantity)).rejects.toThrow(
        new BadRequestError('Insufficient stock unit'),
      );
    });

    it('should throw NotFoundError if inventory is not found during quantity update', async () => {
      const productId = '123';
      const quantity = 5;

      inventoryRepo.findOne = jest.fn().mockResolvedValue(null); // Inventory not found

      await expect(inventoryService.updateQuantity(productId, quantity)).rejects.toThrow(
        new NotFoundError('Inventory not found'),
      );
    });

    it('should throw UnprocessableEntityError if updating inventory fails', async () => {
      const productId = '123';
      const quantity = 5;

      inventoryRepo.findOne = jest.fn().mockResolvedValue({ product: productId, quantity: 10 });
      inventoryRepo.update = jest.fn().mockResolvedValue(null); // Update fails

      await expect(inventoryService.updateQuantity(productId, quantity)).rejects.toThrow(
        new UnprocessableEntityError('Failed to update inventory'),
      );
    });
  });

  // Test deleteInventory
  describe('deleteInventory', () => {
    it('should delete inventory successfully', async () => {
      const productId = '123';
      const deletedInventory: Partial<IInventory> = { product: productId, quantity: 10 };

      inventoryRepo.deleteOne = jest.fn().mockResolvedValue(deletedInventory);

      const result = await inventoryService.deleteInventory(productId);

      expect(result).toEqual(deletedInventory);
      expect(inventoryRepo.deleteOne).toHaveBeenCalledWith({ product: productId });
    });

    it('should throw UnprocessableEntityError if inventory deletion fails', async () => {
      const productId = '123';

      inventoryRepo.deleteOne = jest.fn().mockResolvedValue(null); // Deletion fails

      await expect(inventoryService.deleteInventory(productId)).rejects.toThrow(
        new UnprocessableEntityError('Failed to delete inventory'),
      );
    });
  });
});
