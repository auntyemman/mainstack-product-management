import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { NextFunction, Request, Response } from 'express';
import { validateRequest } from '../../shared/utils/request_validator';
import { successResponse } from '../../shared/utils/api_response';
import { IInventory } from './inventory.model';

jest.mock('../../shared/utils/request_validator');
jest.mock('../../shared/utils/api_response');

describe('InventoryController', () => {
  let inventoryService: jest.Mocked<InventoryService>;
  let inventoryController: InventoryController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    inventoryService = {
      createInventory: jest.fn(),
      getInventory: jest.fn(),
      updateInventory: jest.fn(),
      updateQuantity: jest.fn(),
      getInventories: jest.fn(),
      deleteInventory: jest.fn(),
    } as any;

    inventoryController = new InventoryController(inventoryService);

    req = {
      params: { productId: '123' },
      body: {},
    } as Partial<Request>;

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as Partial<Response>;

    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createInventory', () => {
    it('should create inventory and return 201 response', async () => {
      req.body = { quantity: 10, location: "Lagos island warehouse 1" };

      (validateRequest as jest.Mock).mockResolvedValue(req.body);
      inventoryService.createInventory.mockResolvedValue({ quantity: 10, location: "Lagos island warehouse 1" } as IInventory);
      (successResponse as jest.Mock).mockReturnValue({
        statusCode: 201,
        message: 'Inventory created',
        data: { id: 'inv123', quantity: 10, location: "Lagos island warehouse 1" },
      });

      await inventoryController.createInventory(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 201 }));
    });
  });

  describe('getInventory', () => {
    it('should return inventory details', async () => {
      inventoryService.getInventory.mockResolvedValue({ quantity: 10, location: "Lagos island warehouse 1" } as IInventory);
      (successResponse as jest.Mock).mockReturnValue({
        statusCode: 200,
        message: 'Inventory retrieved',
        data: { quantity: 10, location: "Lagos island warehouse 1" },
      });

      await inventoryController.getInventory(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 200 }));
    });
  });

  describe('updateInventory', () => {
    it('should update inventory and return updated data', async () => {
      req.body = { quantity: 20, location: "Lagos island warehouse 1" };
      (validateRequest as jest.Mock).mockResolvedValue(req.body);
      inventoryService.updateInventory.mockResolvedValue({ quantity: 20, location: "Lagos island warehouse 1" } as IInventory);
      (successResponse as jest.Mock).mockReturnValue({
        statusCode: 200,
        message: 'Inventory updated',
        data: { quantity: 20, location: "Lagos island warehouse 1" },
      });

      await inventoryController.updateInventory(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 200 }));
    });
  });

  describe('deleteInventory', () => {
    it('should delete inventory and return success', async () => {
      inventoryService.deleteInventory.mockResolvedValue({} as IInventory);
      (successResponse as jest.Mock).mockReturnValue({
        statusCode: 200,
        message: 'Inventory deleted',
      });

      await inventoryController.deleteInventory(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 200 }));
    });
  });
});