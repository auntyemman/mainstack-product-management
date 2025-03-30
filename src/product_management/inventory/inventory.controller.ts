import { NextFunction, Request, Response } from 'express';
import { InventoryService } from './inventory.service';
import { validateRequest } from '../../shared/utils/request_validator';
import { CreateInventoryDTO, UpdateInventoryDTO, UpdateInventoryQuntityDTO } from './inventory.dto';
import { inject, injectable } from 'inversify';
import { INVENTORY_TYPES } from './di/inventory.di';
import { successResponse } from '../../shared/utils/api_response';

// Controller class for inventory service
@injectable()
export class InventoryController {;
  constructor(@inject(INVENTORY_TYPES.InventoryService) private readonly inventoryService: InventoryService) {
    this.inventoryService = inventoryService;
  }

  async createInventory(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    const productId = req.params.productId;
    try {
      const data = req.body;
      const validated = await validateRequest(CreateInventoryDTO, data);
      const inventory = await this.inventoryService.createInventory(productId, validated);
      const response = successResponse(201, `Inventory created successfully for product id ${productId}`, inventory);
      return res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  // get the invetory for a product
  async getInventory(req: Request, res: Response, next: NextFunction): Promise<Response | unknown> {
    try {
      const productId = req.params.productId;
      const inventory = await this.inventoryService.getInventory(productId);
      const response = successResponse(200, 'Product inventory fetched successfully', inventory);
      return res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateInventory(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | unknown> {
    try {
      const productId = req.params.productId;
      const validated = await validateRequest(UpdateInventoryDTO, req.body);
      const inventory = await this.inventoryService.updateInventory(productId, validated);
      const response = successResponse(200, 'Product inventory updated successfully', inventory);
      return res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  // adds a given quantity from an existing inventory
  async updateQuantity(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | unknown> {
    try {
      const productId = req.params.productId
      const { quantity } = await validateRequest(UpdateInventoryQuntityDTO, req.body);
      const inventory = await this.inventoryService.updateQuantity(productId, quantity);
      const response = successResponse(200, `Inventory quantity updated by ${quantity} successfully`, inventory);

      return res.status(response.statusCode).json(response)
    } catch (error) {
      next(error);
    }
  }

  async getInventories(req: Request, res: Response, next: NextFunction): Promise<Response | unknown> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const page = parseInt(req.query.page as string) || 1;
      const query: any = {};
      const inventories = await this.inventoryService.getInventories(query, limit, page);
      const response = successResponse(200, 'All products inventories fetched successfully', inventories);
      return res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  async deleteInventory(req: Request, res: Response, next: NextFunction): Promise<Response | unknown> {
    try {
      const productId = req.params.productId;
      const inventory = await this.inventoryService.deleteInventory(productId);
      const response = successResponse(200, 'Products inventory deleted successfully', inventory);
      return res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }
}
