import { Request, Response, NextFunction } from 'express';
import { CreateProductDTO, ProductStatusDTO, UpdateProductDTO } from './product.dto';
import { validateRequest } from '../../shared/utils/request_validator';
import { ProductService } from './product.service';
import { emitterService } from '../../shared/event_bus/event_emitter';

export class ProductController {
  private readonly productService;
  private readonly emitter;
  constructor() {
    this.productService = new ProductService();
    this.emitter = emitterService;
  }
  async createProduct(req: Request, res: Response, next: NextFunction): Promise<object | unknown> {
    const { _id } = res.locals.user.user;
    try {
      const payload = { ...req.body, createdBy: _id };
      const validated = await validateRequest(CreateProductDTO, payload);
      const product = await this.productService.createProduct(validated);
      return res.status(201).json({
        status: 'success',
        message: 'Product created successfully',
        data: { product },
      });
    } catch (error) {
      next(error);
    }
  }

  async getProduct(req: Request, res: Response, next: NextFunction): Promise<object | unknown> {
    try {
      const id = req.params.id;
      const product = await this.productService.getProduct(id);
      return res.status(200).json({
        status: 'success',
        message: 'Product fetched successfully',
        data: { product },
      });
    } catch (error) {
      next(error);
    }
  }

  async publishProduct(req: Request, res: Response, next: NextFunction): Promise<object | unknown> {
    try {
      const id = req.params.id;
      const validated = await validateRequest(ProductStatusDTO, req.body);
      const product = await this.productService.publishProduct(id, validated);
      return res.status(200).json({
        status: 'success',
        message: 'Product published successfully',
        data: { product },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteProduct(req: Request, res: Response, next: NextFunction): Promise<object | unknown> {
    try {
      const id = req.params.id;
      const [product, inventory] = await Promise.all([
        this.emitter.emitAsync('productDeleted', id),
        this.productService.deleteProduct(id),
      ]);
      return res.status(200).json({
        status: 'success',
        message: 'Product deleted successfully',
        data: { product, inventory },
      });
    } catch (error) {
      next(error);
    }
  }

  async getProducts(req: Request, res: Response, next: NextFunction): Promise<object | unknown> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const page = parseInt(req.query.page as string) || 1;
      const { category, tags, name, status, createdBy } = req.query;
      const query: any = {};
      if (category) {
        query.category = category;
      }
      if (tags) {
        query.tags = tags;
      }
      if (name) {
        query.name = name;
      }
      if (status) {
        query.status = status;
      }
      if (createdBy) {
        query.createdBy = createdBy;
      }
      const products = await this.productService.getProducts(query, limit, page);
      return res.status(200).json({
        status: 'success',
        message: 'Products fetched successfully',
        data: { products },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProduct(req: Request, res: Response, next: NextFunction): Promise<object | unknown> {
    try {
      const id = req.params.id;
      const validated = await validateRequest(UpdateProductDTO, req.body);
      const product = await this.productService.updateProduct(id, validated);
      return res.status(200).json({
        status: 'success',
        message: 'Product updated successfully',
        data: { product },
      });
    } catch (error) {
      next(error);
    }
  }
}
