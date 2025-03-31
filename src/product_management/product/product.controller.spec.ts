import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { category, CreateProductDTO, tags, UpdateProductDTO } from './product.dto';
import { validateRequest } from '../../shared/utils/request_validator';
import { successResponse } from '../../shared/utils/api_response';
import { Request, Response, NextFunction } from 'express';
import { IProduct } from './product.model';
import { PaginationResult } from '../../shared/utils/pagination';

// Mock dependencies
jest.mock('../../shared/utils/request_validator');
jest.mock('../../shared/utils/api_response');

describe('ProductController', () => {
  let productController: ProductController;
  let productServiceMock: jest.Mocked<ProductService>;
  let reqMock: Partial<Request>;
  let resMock: Partial<Response>;
  let nextMock: jest.MockedFunction<NextFunction>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup mocks
    productServiceMock = {
      createProduct: jest.fn(),
      getProduct: jest.fn(),
      publishProduct: jest.fn(),
      deleteProduct: jest.fn(),
      getProducts: jest.fn(),
      updateProduct: jest.fn()
    } as unknown as jest.Mocked<ProductService>;

    // Mock request, response, next
    jsonMock = jest.fn().mockReturnValue({});
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    
    reqMock = {
      body: {},
      params: {},
      query: {}
    };
    
    resMock = {
      status: statusMock,
      locals: {
        user: {
          _id: 'user123'
        }
      }
    };
    
    nextMock = jest.fn();
    
    // Mock success response
    (successResponse as jest.Mock).mockImplementation((statusCode, message, data) => ({
      statusCode,
      message,
      data,
      success: true
    }));

    // Initialize controller with mocked service
    productController = new ProductController(productServiceMock);
  });

  describe('createProduct', () => {
    it('should create a product successfully', async () => {
      // Arrange
      const productDto: CreateProductDTO = {
        name: 'Test Product',
        price: 100,
        description: 'Test Description',
        category: [category.electronics],
        tags: [tags.smart]
      };
      
      const createdProduct = {
        id: 'prod123',
        ...productDto,
        createdBy: 'user123'
      } as IProduct;
      
      reqMock.body = productDto;
      
      (validateRequest as jest.Mock).mockResolvedValue({
        ...productDto,
        createdBy: 'user123'
      });
      
      productServiceMock.createProduct.mockResolvedValue(createdProduct);

      // Act
      await productController.createProduct(reqMock as Request, resMock as Response, nextMock);

      // Assert
      expect(validateRequest).toHaveBeenCalledWith(CreateProductDTO, {
        ...productDto,
        createdBy: 'user123'
      });
      expect(productServiceMock.createProduct).toHaveBeenCalledWith({
        ...productDto,
        createdBy: 'user123'
      });
      expect(successResponse).toHaveBeenCalledWith(201, 'Product created successfully', createdProduct);
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalled();
    });

    it('should handle errors and pass to next middleware', async () => {
      // Arrange
      const error = new Error('Validation failed');
      (validateRequest as jest.Mock).mockRejectedValue(error);

      // Act
      await productController.createProduct(reqMock as Request, resMock as Response, nextMock);

      // Assert
      expect(nextMock).toHaveBeenCalledWith(error);
    });
  });

  describe('getProduct', () => {
    it('should fetch a product by id successfully', async () => {
      // Arrange
      const productId = 'prod123';
      const product = {
        id: productId,
        name: 'Test Product',
        price: 100
      } as IProduct;
      
      reqMock.params = { id: productId };
      productServiceMock.getProduct.mockResolvedValue(product);

      // Act
      await productController.getProduct(reqMock as Request, resMock as Response, nextMock);

      // Assert
      expect(productServiceMock.getProduct).toHaveBeenCalledWith(productId);
      expect(successResponse).toHaveBeenCalledWith(200, 'Product fetched successfully', product);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalled();
    });

    it('should handle errors when fetching product', async () => {
      // Arrange
      const error = new Error('Product not found');
      reqMock.params = { id: 'nonexistent' };
      productServiceMock.getProduct.mockRejectedValue(error);

      // Act
      await productController.getProduct(reqMock as Request, resMock as Response, nextMock);

      // Assert
      expect(nextMock).toHaveBeenCalledWith(error);
    });
  });

  describe('publishProduct', () => {
    it('should publish a product successfully', async () => {
      // Arrange
      const productId = 'prod123';
      const publishedProduct = {
        id: productId,
        name: 'Test Product',
        status: 'published'
      } as IProduct;
      
      reqMock.params = { id: productId };
      productServiceMock.publishProduct.mockResolvedValue(publishedProduct);

      // Act
      await productController.publishProduct(reqMock as Request, resMock as Response, nextMock);

      // Assert
      expect(productServiceMock.publishProduct).toHaveBeenCalledWith(productId);
      expect(successResponse).toHaveBeenCalledWith(200, 'Product published successfully', publishedProduct);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalled();
    });

    it('should handle errors when publishing product', async () => {
      // Arrange
      const error = new Error('Failed to publish product');
      reqMock.params = { id: 'prod123' };
      productServiceMock.publishProduct.mockRejectedValue(error);

      // Act
      await productController.publishProduct(reqMock as Request, resMock as Response, nextMock);

      // Assert
      expect(nextMock).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product successfully', async () => {
      // Arrange
      const productId = 'prod123';
      const deletedProduct = {
        id: productId,
        name: 'Test Product',
      } as IProduct;
      
      reqMock.params = { id: productId };
      productServiceMock.deleteProduct.mockResolvedValue(deletedProduct);

      // Act
      await productController.deleteProduct(reqMock as Request, resMock as Response, nextMock);

      // Assert
      expect(productServiceMock.deleteProduct).toHaveBeenCalledWith(productId);
      expect(successResponse).toHaveBeenCalledWith(200, 'Product deleted successfully', deletedProduct);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalled();
    });

    it('should handle errors when deleting product', async () => {
      // Arrange
      const error = new Error('Failed to delete product');
      reqMock.params = { id: 'prod123' };
      productServiceMock.deleteProduct.mockRejectedValue(error);

      // Act
      await productController.deleteProduct(reqMock as Request, resMock as Response, nextMock);

      // Assert
      expect(nextMock).toHaveBeenCalledWith(error);
    });
  });

  describe('getProducts', () => {
    it('should fetch products with default pagination', async () => {
      // Arrange
      const data = [
        { id: 'prod1', name: 'Product 1' },
        { id: 'prod2', name: 'Product 2' }
      ];
      const products = {
        data: data,
        totalItems: 2,
        totalPages: 1,
        currentPage: 1,
        limit: 10
      } as PaginationResult<IProduct>
    //   const products = [
    //     { id: 'prod1', name: 'Product 1' },
    //     { id: 'prod2', name: 'Product 2' }
    //   ] as PaginationResult<IProduct>;
      
      reqMock.query = {};
      productServiceMock.getProducts.mockResolvedValue(products);
      

      // Act
      await productController.getProducts(reqMock as Request, resMock as Response, nextMock);

      // Assert
      expect(productServiceMock.getProducts).toHaveBeenCalledWith({}, 10, 1);
      expect(successResponse).toHaveBeenCalledWith(200, 'Products fetched successfully', products);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalled();
    });

    it('should fetch products with specified filters and pagination', async () => {
      // Arrange
      const data = [
        { id: 'prod1', name: 'Product 1' },
        { id: 'prod2', name: 'Product 2' }
      ];
      const products = {
        data: data,
        totalItems: 2,
        totalPages: 1,
        currentPage: 1,
        limit: 10
      } as PaginationResult<IProduct>
      
      reqMock.query = {
        limit: '5',
        page: '2',
        category: 'electronics',
        tags: 'new',
        name: 'Product',
        status: 'active',
        createdBy: 'user123'
      };
      
      productServiceMock.getProducts.mockResolvedValue(products);

      // Act
      await productController.getProducts(reqMock as Request, resMock as Response, nextMock);

      // Assert
      expect(productServiceMock.getProducts).toHaveBeenCalledWith({
        category: 'electronics',
        tags: 'new',
        name: 'Product',
        status: 'active',
        createdBy: 'user123'
      }, 5, 2);
      expect(successResponse).toHaveBeenCalledWith(200, 'Products fetched successfully', products);
    });

    it('should handle errors when fetching products', async () => {
      // Arrange
      const error = new Error('Database error');
      productServiceMock.getProducts.mockRejectedValue(error);

      // Act
      await productController.getProducts(reqMock as Request, resMock as Response, nextMock);

      // Assert
      expect(nextMock).toHaveBeenCalledWith(error);
    });
  });

  describe('updateProduct', () => {
    it('should update a product successfully', async () => {
      // Arrange
      const productId = 'prod123';
      const updateDto: UpdateProductDTO = {
        name: 'Updated Product',
        price: 150
      };
      
      const updatedProduct = {
        id: productId,
        ...updateDto
      } as IProduct;
      
      reqMock.params = { id: productId };
      reqMock.body = updateDto;
      
      (validateRequest as jest.Mock).mockResolvedValue(updateDto);
      productServiceMock.updateProduct.mockResolvedValue(updatedProduct);

      // Act
      await productController.updateProduct(reqMock as Request, resMock as Response, nextMock);

      // Assert
      expect(validateRequest).toHaveBeenCalledWith(UpdateProductDTO, updateDto);
      expect(productServiceMock.updateProduct).toHaveBeenCalledWith(productId, updateDto);
      expect(successResponse).toHaveBeenCalledWith(200, 'Product updated successfully', updatedProduct);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalled();
    });

    it('should handle validation errors when updating product', async () => {
      // Arrange
      const error = new Error('Validation failed');
      reqMock.params = { id: 'prod123' };
      reqMock.body = { price: -100 }; // Invalid price
      
      (validateRequest as jest.Mock).mockRejectedValue(error);

      // Act
      await productController.updateProduct(reqMock as Request, resMock as Response, nextMock);

      // Assert
      expect(nextMock).toHaveBeenCalledWith(error);
    });
  });
});