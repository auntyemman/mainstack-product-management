import request from 'supertest';
import { createApp } from '../../app';
import { ProductService } from './product.service';
import { PRODUCT_TYPES } from './di/product.di';
import { productContainer } from './di/product.container';
import { NotFoundError } from '../../shared/utils/custom_error';
import { ProductStatus } from './product.dto';
import { Request, Response, NextFunction } from 'express';

// Mock the User Repository and container
const mockUserRepository = {
  // Add any methods you need to mock
  findById: jest.fn().mockResolvedValue({ _id: 'userId', role: 'admin' }),
  findOne: jest.fn().mockResolvedValue({ _id: 'userId', role: 'admin' })
};

const mockUserContainer = {
  get: jest.fn().mockReturnValue(mockUserRepository)
};

// Mock the USER_TYPES
const USER_TYPES = {
  UserRepository: 'UserRepository'
};

// Mock the authentication middleware
jest.mock('../../shared/middlewares/auth', () => ({
  authUser: () => (req: Request, res: Response, next: NextFunction) => {
    // Set user info on request object as middleware would do
    res.locals.user = { id: 'userId', role: 'admin' };
    next();
  }
}));

// Mock user container
jest.mock('../../container', () => ({
  userContainer: mockUserContainer,
  USER_TYPES
}));

// Mock admin RBAC middleware if you're using it
jest.mock('../../shared/middlewares/admin.RBAC', () => (req: Request, res: Response, next: NextFunction) => next());

jest.mock('./product.service'); // Mocking ProductService

describe('ProductController Integration Tests', () => {
  let app: any;
  let productService: ProductService;

  beforeAll(() => {
    app = createApp();
  });

  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
    productService = productContainer.get<ProductService>(PRODUCT_TYPES.ProductService);
  });

  afterAll(async () => {
    if (app && app.close) {
      await app.close();
    }
  });

  it('should create a product', async () => {
    const createProductPayload = { name: 'Test Product', price: 100, category: 'Electronics', tags: ['tag1', 'tag2'] };
    const mockResponse = { ...createProductPayload, _id: '123', createdBy: 'userId' };

    (productService.createProduct as jest.Mock).mockResolvedValue(mockResponse);

    const response = await request(app)
      .post('/api/v1/products')
      .set('Authorization', 'Bearer mock_token')
      .send(createProductPayload);

    expect(response.status).toBe(201);
    expect(response.body.data.name).toBe('Test Product');
    expect(response.body.message).toBe('Product created successfully');
  });

  it('should get a single product', async () => {
    const mockProductData = { _id: '123', name: 'Samsung A22', price: 30000, category: ['smartphones'], tags: ['smart'] };
    (productService.getProduct as jest.Mock).mockResolvedValue(mockProductData);

    const response = await request(app)
      .get('/api/v1/products/123')
      .set('Authorization', 'Bearer mock_token');

    expect(response.status).toBe(200);
    expect(response.body.data._id).toBe('123');
    expect(response.body.message).toBe('Product fetched successfully');
  });

  it('should update a product', async () => {
    const updatedProductData = { name: 'Updated Product', price: 120 };
    const mockUpdatedProduct = { ...updatedProductData, _id: '123' };

    (productService.updateProduct as jest.Mock).mockResolvedValue(mockUpdatedProduct);

    const response = await request(app)
      .put('/api/v1/products/123')
      .set('Authorization', 'Bearer mock_token')
      .send(updatedProductData);

    expect(response.status).toBe(200);
    expect(response.body.data.name).toBe('Updated Product');
    expect(response.body.message).toBe('Product updated successfully');
  });

  it('should publish a product', async () => {
    const mockProductData = { _id: '123', status: ProductStatus.published };
    (productService.publishProduct as jest.Mock).mockResolvedValue(mockProductData);

    const response = await request(app)
      .patch('/api/v1/products/123')
      .set('Authorization', 'Bearer mock_token');

    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe(ProductStatus.published);
    expect(response.body.message).toBe('Product published successfully');
  });

  it('should delete a product', async () => {
    (productService.deleteProduct as jest.Mock).mockResolvedValue({ _id: '123' });

    const response = await request(app)
      .delete('/api/v1/products/123')
      .set('Authorization', 'Bearer mock_token');

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Product deleted successfully');
  });

  it('should return 404 if product not found', async () => {
    (productService.getProduct as jest.Mock).mockRejectedValue(new NotFoundError('Product not found'));

    const response = await request(app)
      .get('/api/v1/products/123')
      .set('Authorization', 'Bearer mock_token');

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Product not found');
  });

  it('should return list of products', async () => {
    const mockProducts = [
      { _id: '123', name: 'Test Product', price: 100 },
      { _id: '124', name: 'Another Product', price: 150 },
    ];
    (productService.getProducts as jest.Mock).mockResolvedValue({ data: mockProducts, total: mockProducts.length });

    const response = await request(app)
      .get('/api/v1/products')
      .set('Authorization', 'Bearer mock_token')
      .query({ page: 1, limit: 10 });

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.message).toBe('Products fetched successfully');
  });
});