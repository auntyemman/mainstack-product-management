import request from 'supertest';
import { createApp } from '../../app';
import { InventoryService } from './inventory.service';
import { UnprocessableEntityError, NotFoundError } from '../../shared/utils/custom_error';
import { Request, Response, NextFunction } from 'express';
// Mock the authentication middleware
jest.mock('../../shared/middlewares/auth', () => ({
  authUser: () => (req: Request, res: Response, next: NextFunction) => next()
}));

jest.mock('../../shared/middlewares/admin.RBAC', () => (req: Request, res: Response, next: NextFunction) => next());

jest.mock('./inventory.service'); // Mock InventoryService
jest.mock('./inventory.repository'); // Mock InventoryRepository

describe('InventoryController Integration Tests', () => {
  let app: any;

  beforeAll(() => {
    app = createApp();
  });

  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
  });

  it('should create inventory successfully', async () => {
    const mockInventoryService = InventoryService as jest.Mocked<typeof InventoryService>;
    const productId = 'product123';
    const mockData = { quantity: 10, location: 'Warehouse A' };

    // Mock the service method
    (mockInventoryService.prototype.createInventory as jest.Mock).mockResolvedValue({
      product: productId,
      ...mockData,
    });

    const response = await request(app)
      .post(`/api/v1/products/${productId}/inventory`)  // Fixed path to match route
      .send(mockData)
      .expect(201);

    expect(response.body.status).toBe('success');
    expect(response.body.message).toBe(`Inventory created successfully for product id ${productId}`);
    expect(response.body.data.product).toBe(productId);
    expect(response.body.data.quantity).toBe(10);
  });

  it('should fail to create inventory if inventory already exists', async () => {
    const mockInventoryService = InventoryService as jest.Mocked<typeof InventoryService>;
    const productId = 'product123';
    const mockData = { quantity: 10, location: 'Warehouse A' };

    // Mock the service to throw an error
    (mockInventoryService.prototype.createInventory as jest.Mock).mockRejectedValue(
      new UnprocessableEntityError('Failed to create inventory'),
    );

    const response = await request(app)
      .post(`/api/v1/products/${productId}/inventory`)
      .send(mockData)
      .expect(422);

    expect(response.body.status).toBe('error');
    expect(response.body.message).toBe('Failed to create inventory');
  });

  it('should get inventory successfully', async () => {
    const mockInventoryService = InventoryService as jest.Mocked<typeof InventoryService>;
    const productId = 'product123';
    const mockInventory = { product: productId, quantity: 100, location: 'Warehouse A' };

    // Mock the service method
    (mockInventoryService.prototype.getInventory as jest.Mock).mockResolvedValue(mockInventory);

    const response = await request(app)
      .get(`/api/v1/products/${productId}/inventory`)
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.message).toBe('Product inventory fetched successfully');
    expect(response.body.data.product).toBe(productId);
    expect(response.body.data.quantity).toBe(100);
  });

  it('should fail to get inventory if not found', async () => {
    const mockInventoryService = InventoryService as jest.Mocked<typeof InventoryService>;
    const productId = 'product123';

    // Mock the service to throw an error
    (mockInventoryService.prototype.getInventory as jest.Mock).mockRejectedValue(
      new NotFoundError('Inventory not found'),
    );

    const response = await request(app)
      .get(`/api/v1/products/${productId}/inventory`)
      .expect(404);

    expect(response.body.status).toBe('error');
    expect(response.body.message).toBe('Inventory not found');
  });

  it('should update inventory successfully', async () => {
    const mockInventoryService = InventoryService as jest.Mocked<typeof InventoryService>;
    const productId = 'product123';
    const mockData = { quantity: 200, location: 'Warehouse B' };
    const mockUpdatedInventory = { ...mockData, product: productId };

    // Mock the service method
    (mockInventoryService.prototype.updateInventory as jest.Mock).mockResolvedValue(mockUpdatedInventory);

    const response = await request(app)
      .put(`/api/v1/products/${productId}/inventory`)
      .send(mockData)
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.message).toBe('Product inventory updated successfully');
    expect(response.body.data.product).toBe(productId);
    expect(response.body.data.quantity).toBe(200);
  });

  it('should fail to update inventory if invalid data', async () => {
    const mockInventoryService = InventoryService as jest.Mocked<typeof InventoryService>;
    const productId = 'product123';
    const mockData = { quantity: -10, location: 'Warehouse B' };

    // Mock the service to throw an error
    (mockInventoryService.prototype.updateInventory as jest.Mock).mockRejectedValue(
      new UnprocessableEntityError('Failed to update inventory'),
    );

    const response = await request(app)
      .put(`/api/v1/products/${productId}/inventory`)
      .send(mockData)
      .expect(422);

    expect(response.body.status).toBe('error');
    expect(response.body.message).toBe('Failed to update inventory');
  });

  it('should update inventory quantity successfully', async () => {
    const mockInventoryService = InventoryService as jest.Mocked<typeof InventoryService>;
    const productId = 'product123';
    const mockData = { quantity: 100 };

    // Mock the service method
    (mockInventoryService.prototype.updateQuantity as jest.Mock).mockResolvedValue({
      product: productId,
      ...mockData,
    });

    const response = await request(app)
      .patch(`/api/v1/products/${productId}/inventory`)
      .send(mockData)
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.message).toBe(`Inventory quantity updated by ${mockData.quantity} successfully`);
    expect(response.body.data.product).toBe(productId);
    expect(response.body.data.quantity).toBe(100);
  });

  it('should delete inventory successfully', async () => {
    const mockInventoryService = InventoryService as jest.Mocked<typeof InventoryService>;
    const productId = 'product123';

    // Mock the service method
    (mockInventoryService.prototype.deleteInventory as jest.Mock).mockResolvedValue({
      product: productId,
      quantity: 100,
      location: 'Warehouse A',
    });

    const response = await request(app)
      .delete(`/api/v1/products/${productId}/inventory`)
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.message).toBe('Products inventory deleted successfully');
    expect(response.body.data.product).toBe(productId);
  });

  it('should fail to delete inventory if not found', async () => {
    const mockInventoryService = InventoryService as jest.Mocked<typeof InventoryService>;
    const productId = 'product123';

    // Mock the service to throw an error
    (mockInventoryService.prototype.deleteInventory as jest.Mock).mockRejectedValue(
      new UnprocessableEntityError('Failed to delete inventory'),
    );

    const response = await request(app)
      .delete(`/api/v1/products/${productId}/inventory`)
      .expect(422);

    expect(response.body.status).toBe('error');
    expect(response.body.message).toBe('Failed to delete inventory');
  });

  it('should get all inventories successfully', async () => {
    const mockInventoryService = InventoryService as jest.Mocked<typeof InventoryService>;
    const mockInventories = [
      { product: 'product123', quantity: 100, location: 'Warehouse A' },
      { product: 'product456', quantity: 200, location: 'Warehouse B' },
    ];

    // Mock the service method
    (mockInventoryService.prototype.getInventories as jest.Mock).mockResolvedValue(mockInventories);

    const response = await request(app)
      .get(`/api/v1/inventories`)
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.message).toBe('All products inventories fetched successfully');
    expect(response.body.data.length).toBeGreaterThan(0);
  });
});