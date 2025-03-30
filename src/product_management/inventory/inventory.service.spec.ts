import { InventoryService } from './inventory.service';
import { InventoryRepository } from './inventory.repository';
import { IInventory } from './inventory.model';
import { APIError, NotFoundError } from '../../shared/utils/custom_error';
import { PaginationResult } from '../../shared/utils/pagination';

// Mock InventoryRepository
jest.mock('./inventory.repository');

describe('InventoryService', () => {
  let inventoryService: InventoryService;
  let inventoryRepository: jest.Mocked<InventoryRepository>;

  beforeEach(() => {
    // Initialize InventoryService and its dependencies
    inventoryRepository = new InventoryRepository() as jest.Mocked<InventoryRepository>;
    inventoryService = new InventoryService();

    // Override the inventoryRepo with the mocked one
    (inventoryService as any).inventoryRepo = inventoryRepository;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createInventory', () => {
    it('should create inventory successfully', async () => {
      const inventoryData: IInventory = { product: 'productId', quantity: 10 } as IInventory;

      // Mock repository methods
      inventoryRepository.create.mockResolvedValue(inventoryData);

      const result = await inventoryService.createInventory(inventoryData);

      expect(result).toEqual(inventoryData);
      expect(inventoryRepository.create).toHaveBeenCalledWith(inventoryData);
    });

    it('should throw APIError if inventory creation fails', async () => {
      const inventoryData: IInventory = { product: 'productId', quantity: 10 } as IInventory;

      // Mock repository methods
      inventoryRepository.create.mockResolvedValue(null as unknown as IInventory);

      await expect(inventoryService.createInventory(inventoryData)).rejects.toThrow(APIError);
      expect(inventoryRepository.create).toHaveBeenCalledWith(inventoryData);
    });
  });

  describe('getInventory', () => {
    it('should return an inventory if it exists', async () => {
      const inventoryData: IInventory = { product: 'productId', quantity: 10 } as IInventory;

      // Mock repository methods
      inventoryRepository.findById.mockResolvedValue(inventoryData);

      const result = await inventoryService.getInventory('inventoryId');

      expect(result).toEqual(inventoryData);
      expect(inventoryRepository.findById).toHaveBeenCalledWith('inventoryId');
    });

    it('should throw NotFoundError if inventory does not exist', async () => {
      // Mock repository methods
      inventoryRepository.findById.mockResolvedValue(null);

      await expect(inventoryService.getInventory('inventoryId')).rejects.toThrow(NotFoundError);
      expect(inventoryRepository.findById).toHaveBeenCalledWith('inventoryId');
    });
  });

  describe('getInventories', () => {
    it('should return a paginated list of inventories', async () => {
      const query = {};
      const limit = 10;
      const page = 1;
      const inventories: PaginationResult<IInventory> = {
        data: [],
        totalItems: 0,
        totalPages: 1,
        currentPage: 1,
        limit,
      };

      // Mock repository methods
      inventoryRepository.findMany.mockResolvedValue(inventories);

      const result = await inventoryService.getInventories(query, limit, page);

      expect(result).toEqual(inventories);
      expect(inventoryRepository.findMany).toHaveBeenCalledWith(query, limit, page);
    });

    it('should throw APIError if getting inventories fails', async () => {
      const query = {};
      const limit = 10;
      const page = 1;

      // Mock repository methods
      inventoryRepository.findMany.mockResolvedValue(
        null as unknown as PaginationResult<IInventory>,
      );

      await expect(inventoryService.getInventories(query, limit, page)).rejects.toThrow(APIError);
      expect(inventoryRepository.findMany).toHaveBeenCalledWith(query, limit, page);
    });
  });

  describe('updateInventory', () => {
    it('should update an inventory successfully', async () => {
      const inventoryData: IInventory = { product: 'productId', quantity: 20 } as IInventory;

      // Mock repository methods
      inventoryRepository.update.mockResolvedValue(inventoryData);

      const result = await inventoryService.updateInventory('inventoryId', inventoryData);

      expect(result).toEqual(inventoryData);
      expect(inventoryRepository.update).toHaveBeenCalledWith('inventoryId', inventoryData);
    });

    it('should throw APIError if inventory update fails', async () => {
      const inventoryData: IInventory = { product: 'productId', quantity: 20 } as IInventory;

      // Mock repository methods
      inventoryRepository.update.mockResolvedValue(null);

      await expect(inventoryService.updateInventory('inventoryId', inventoryData)).rejects.toThrow(
        APIError,
      );
      expect(inventoryRepository.update).toHaveBeenCalledWith('inventoryId', inventoryData);
    });
  });

  describe('updateQuantity', () => {
    it('should add to product quantity successfully', async () => {
      const inventoryData: IInventory = {
        id: 'inventoryId',
        product: 'productId',
        quantity: 10,
      } as IInventory;
      const updatedInventoryData: IInventory = { ...inventoryData, quantity: 15 } as IInventory;

      // Mock repository methods
      inventoryRepository.findOne.mockResolvedValue(inventoryData);
      inventoryRepository.update.mockResolvedValue(updatedInventoryData);

      const result = await inventoryService.updateQuantity('productId', 5);

      expect(result).toEqual(updatedInventoryData);
      expect(inventoryRepository.findOne).toHaveBeenCalledWith({ product: 'productId' });
      expect(inventoryRepository.update).toHaveBeenCalledWith('inventoryId', updatedInventoryData);
    });

    it('should throw NotFoundError if inventory is not found', async () => {
      // Mock repository methods
      inventoryRepository.findOne.mockResolvedValue(null);

      await expect(inventoryService.updateQuantity('productId', 5)).rejects.toThrow(NotFoundError);
      expect(inventoryRepository.findOne).toHaveBeenCalledWith({ product: 'productId' });
    });
  });

  describe('removeFromProductQuantity', () => {
    it('should remove from product quantity successfully', async () => {
      const inventoryData: IInventory = {
        id: 'inventoryId',
        product: 'productId',
        quantity: 10,
      } as IInventory;
      const updatedInventoryData: IInventory = { ...inventoryData, quantity: 5 } as IInventory;

      // Mock repository methods
      inventoryRepository.findOne.mockResolvedValue(inventoryData);
      inventoryRepository.update.mockResolvedValue(updatedInventoryData);

      const result = await inventoryService.removeFromProductQuantity('productId', 5);

      expect(result).toEqual(updatedInventoryData);
      expect(inventoryRepository.findOne).toHaveBeenCalledWith({ product: 'productId' });
      expect(inventoryRepository.update).toHaveBeenCalledWith('inventoryId', updatedInventoryData);
    });

    it('should throw APIError if insufficient stock', async () => {
      const inventoryData: IInventory = {
        id: 'inventoryId',
        product: 'productId',
        quantity: 2,
      } as IInventory;

      // Mock repository methods
      inventoryRepository.findOne.mockResolvedValue(inventoryData);

      await expect(inventoryService.removeFromProductQuantity('productId', 5)).rejects.toThrow(
        APIError,
      );
      expect(inventoryRepository.findOne).toHaveBeenCalledWith({ product: 'productId' });
    });
  });

  describe('deleteInventory', () => {
    it('should delete inventory successfully', async () => {
      const inventoryData: IInventory = { product: 'productId', quantity: 10 } as IInventory;

      // Mock repository methods
      inventoryRepository.delete.mockResolvedValue(inventoryData);

      const result = await inventoryService.deleteInventory('inventoryId');

      expect(result).toEqual(inventoryData);
      expect(inventoryRepository.delete).toHaveBeenCalledWith('inventoryId');
    });

    it('should throw APIError if deletion fails', async () => {
      // Mock repository methods
      inventoryRepository.delete.mockResolvedValue(null);

      await expect(inventoryService.deleteInventory('inventoryId')).rejects.toThrow(APIError);
      expect(inventoryRepository.delete).toHaveBeenCalledWith('inventoryId');
    });
  });
});
