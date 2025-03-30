import request from 'supertest';
import express from 'express';
import { inventory } from './inventory.routes';

// Create an express app for testing
const app = express();
app.use(express.json());
app.use('/inventory', inventory);

// Mock middleware to always pass
jest.mock('../../common/middlewares/auth', () => ({
  authUser: jest.fn((req, res, next) => next()),
}));

jest.mock('../../common/middlewares/admin.RBAC', () => ({
  adminRBAC: jest.fn((req, res, next) => next()),
}));

// Mock InventoryController methods
jest.mock('./inventory.controller', () => {
  return {
    InventoryController: jest.fn().mockImplementation(() => {
      return {
        createInventory: jest.fn((req, res) =>
          res.status(201).json({ message: 'Inventory created' }),
        ),
        getInventory: jest.fn((req, res) => res.status(200).json({ message: 'Inventory fetched' })),
        getIventoryByProductId: jest.fn((req, res) =>
          res.status(200).json({ message: 'Inventory by product fetched' }),
        ),
        updateInventory: jest.fn((req, res) =>
          res.status(200).json({ message: 'Inventory updated' }),
        ),
        updateQuantity: jest.fn((req, res) =>
          res.status(200).json({ message: 'Quantity added' }),
        ),
        removeFromProductQuantity: jest.fn((req, res) =>
          res.status(200).json({ message: 'Quantity removed' }),
        ),
        getInventories: jest.fn((req, res) =>
          res.status(200).json({ message: 'Inventories fetched' }),
        ),
      };
    }),
  };
});

describe('Inventory Routes', () => {
  it('should create inventory (POST /inventory/create)', async () => {
    const response = await request(app)
      .post('/inventory/create')
      .send({ productId: '123', quantity: 10 });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Inventory created');
  });

  it('should get inventory (GET /inventory/:id)', async () => {
    const response = await request(app).get('/inventory/123');

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Inventory fetched');
  });

  it('should get inventory by product ID (GET /inventory/product/:productId)', async () => {
    const response = await request(app).get('/inventory/product/123');

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Inventory by product fetched');
  });

  it('should update inventory (PUT /inventory/:id)', async () => {
    const response = await request(app).put('/inventory/123').send({ quantity: 20 });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Inventory updated');
  });

  it('should add to product quantity (PUT /inventory/:id/quantity/add)', async () => {
    const response = await request(app).put('/inventory/123/quantity/add').send({ quantity: 5 });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Quantity added');
  });

  it('should remove from product quantity (PUT /inventory/:id/quantity/remove)', async () => {
    const response = await request(app).put('/inventory/123/quantity/remove').send({ quantity: 5 });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Quantity removed');
  });

  it('should get all inventories (GET /inventory)', async () => {
    const response = await request(app).get('/inventory');

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Inventories fetched');
  });
});
