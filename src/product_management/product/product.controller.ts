import { Request, Response, NextFunction } from 'express';
import { CreateProductDTO, ProductStatusDTO, UpdateProductDTO } from './product.dto';
import { validateRequest } from '../../shared/utils/request_validator';
import { ProductService } from './product.service';
import { inject, injectable } from 'inversify';
import { PRODUCT_TYPES } from './di/product.di';
import { successResponse } from '../../shared/utils/api_response';

@injectable()
export class ProductController {
  constructor(
    @inject(PRODUCT_TYPES.ProductService) private readonly productService: ProductService,
  ) {
    this.productService = productService;
  }
  async createProduct(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | unknown> {
    const userId = res.locals.user._id;
    try {
      const payload = { ...req.body, createdBy: userId.toString() };
      const validated = await validateRequest(CreateProductDTO, payload);
      const product = await this.productService.createProduct(validated);

      const response = successResponse(201, 'Product created successfully', product);
      return res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getProduct(req: Request, res: Response, next: NextFunction): Promise<Response | unknown> {
    try {
      const id = req.params.id;
      const product = await this.productService.getProduct(id);
      const response = successResponse(200, 'Product fetched successfully', product);
      return res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  async publishProduct(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | unknown> {
    try {
      const id = req.params.id;
      const product = await this.productService.publishProduct(id);
      const response = successResponse(200, 'Product published successfully', product);
      return res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  async deleteProduct(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | unknown> {
    try {
      const id = req.params.id;
      const product = await this.productService.deleteProduct(id);
      const response = successResponse(200, 'Product deleted successfully', product);
      return res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getProducts(req: Request, res: Response, next: NextFunction): Promise<Response | unknown> {
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
      const response = successResponse(200, 'Products fetched successfully', products);
      return res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateProduct(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | unknown> {
    try {
      const id = req.params.id;
      const validated = await validateRequest(UpdateProductDTO, req.body);
      const product = await this.productService.updateProduct(id, validated);
      const response = successResponse(200, 'Product updated successfully', product);
      return res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }
}
