import { NextFunction, Request, Response } from 'express';
import { InventoryService } from './inventory.service';
import { validateRequest } from '../../shared/utils/request_validator';
import { CreateInventoryDTO, UpdateInventoryDTO, UpdateInventoryQuntityDTO } from './inventory.dto';
import { inject, injectable } from 'inversify';
import { INVENTORY_TYPES } from './di/inventory.di';

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
  ): Promise<object | unknown> {
    try {
      const data = req.body;
      const validated = await validateRequest(CreateInventoryDTO, data);
      const inventory = await this.inventoryService.createInventory(validated);
      return res.status(201).json({
        status: 'success',
        message: 'Inventory created successfully',
        data: { inventory },
      });
    } catch (error) {
      next(error);
    }
  }

  async getInventory(req: Request, res: Response, next: NextFunction): Promise<object | unknown> {
    try {
      const id = req.params.id;
      const inventory = await this.inventoryService.getInventory(id);
      return res.status(200).json({
        status: 'success',
        message: 'Inventory fetched successfully',
        data: { inventory },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateInventory(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<object | unknown> {
    try {
      const id = req.params.id;
      const validated = await validateRequest(UpdateInventoryDTO, req.body);
      const inventory = await this.inventoryService.updateInventory(id, validated);
      return res.status(200).json({
        status: 'success',
        message: 'Inventory updated successfully',
        data: { inventory },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Adds a given quantity to an existing inventory
   * @example
   * curl -X PUT \
   *   http://localhost:3000/api/v1/inventory/add/quantity \
   *   -H 'Content-Type: application/json' \
   *   -d '{"productId": "61c7c5c5f1e7f39d94937f2c","quantity": 10}'
   * @param {Request} req - The express request object
   * @param {Response} res - The express response object
   * @param {NextFunction} next - The express next function
   * @returns {Promise<object | unknown>} - The response object
   */
  async addToProductQuantity(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<object | unknown> {
    try {
      const { productId, quantity } = await validateRequest(UpdateInventoryQuntityDTO, req.body);
      const inventory = await this.inventoryService.addToProductQuantity(productId, quantity);
      return res.status(200).json({
        status: 'success',
        message: 'Inventory quantity added successfully',
        data: { inventory },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Removes a given quantity from an existing inventory
   * @example
   * curl -X PUT \
   *   http://localhost:3000/api/v1/inventory/remove/quantity \
   *   -H 'Content-Type: application/json' \
   *   -d '{"productId": "61c7c5c5f1e7f39d94937f2c","quantity": 10}'
   * @param {Request} req - The express request object
   * @param {Response} res - The express response object
   * @param {NextFunction} next - The express next function
   * @returns {Promise<object | unknown>} - The response object
   */
  async removeFromProductQuantity(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<object | unknown> {
    try {
      const { productId, quantity } = await validateRequest(UpdateInventoryQuntityDTO, req.body);
      const inventory = await this.inventoryService.removeFromProductQuantity(productId, quantity);
      return res.status(200).json({
        status: 'success',
        message: 'Inventory quantity removed successfully',
        data: { inventory },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetches a single inventory by its product id
   * @example
   * curl -X GET \
   *   http://localhost:3000/api/v1/inventory/product/61c7c5c5f1e7f39d94937f2c
   * @param {Request} req - The express request object
   * @param {Response} res - The express response object
   * @param {NextFunction} next - The express next function
   * @returns {Promise<object | unknown>} - The response object
   */
  async getIventoryByProductId(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<object | unknown> {
    try {
      const productId = req.params.productId;
      const inventory = await this.inventoryService.getInventoryByProductId(productId);
      return res.status(200).json({
        status: 'success',
        message: 'Inventory fetched successfully',
        data: { inventory },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetches all inventories
   * @example
   * curl -X GET \
   *   http://localhost:3000/api/v1/inventory?limit=10&page=1
   * @param {Request} req - The express request object
   * @param {Response} res - The express response object
   * @param {NextFunction} next - The express next function
   * @returns {Promise<object | unknown>} - The response object
   */
  async getInventories(req: Request, res: Response, next: NextFunction): Promise<object | unknown> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const page = parseInt(req.query.page as string) || 1;
      const query: any = {};
      const inventories = await this.inventoryService.getInventories(query, limit, page);
      return res.status(200).json({
        status: 'success',
        message: 'Inventories fetched successfully',
        data: { inventories },
      });
    } catch (error) {
      next(error);
    }
  }
}
