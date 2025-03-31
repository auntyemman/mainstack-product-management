import request from 'supertest';
import { Container } from 'inversify';
import { InventoryEventListeners } from './inventory.event_listeners';
import { InventoryService } from './inventory.service';
import { EmitterService } from '../../shared/event_bus/event_emitter';
import { INVENTORY_TYPES } from './di/inventory.di';
import { EVENT_TYPES } from '../../shared/event_bus/di/event.di';
import { createApp } from '../../app';

describe('Inventory Event Listeners Integration Test', () => {
  let container: Container;
  let inventoryEventListeners: InventoryEventListeners;
  let inventoryService: InventoryService;
  let emitterService: EmitterService;
  let app: any;

  beforeAll(async () => {
    // Initialize the container and services
    container = new Container();
    inventoryService = { 
      getInventory: jest.fn(),
      deleteInventory: jest.fn(),
    } as unknown as InventoryService;

    emitterService = { 
      emit: jest.fn(),
      on: jest.fn(),
    } as unknown as EmitterService;

    // Bind the services to the container
    container.bind(INVENTORY_TYPES.InventoryService).toConstantValue(inventoryService);
    container.bind(EVENT_TYPES.EmitterService).toConstantValue(emitterService);

    // Instantiate the event listeners
    inventoryEventListeners = container.get(InventoryEventListeners);

    // Set up the app
    app = createApp();
  });

  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test to avoid cross-test pollution
  });

  it('should handle productDeleted event and delete inventory', async () => {
    const productId = 'product123';

    // Mock successful response from inventory service
    (inventoryService.getInventory as jest.Mock).mockResolvedValue({ product: productId, quantity: 100 });
    (inventoryService.deleteInventory as jest.Mock).mockResolvedValue(true);

    // Trigger the event via HTTP
    await request(app)
      .delete(`/api/v1/products/${productId}`) // Example route that triggers event
      .send({ productId });

    // Ensure the inventoryService methods were called
    expect(inventoryService.getInventory).toHaveBeenCalledWith(productId);
    expect(inventoryService.deleteInventory).toHaveBeenCalledWith(productId);
  });

  it('should retry up to 3 times if deleting inventory fails', async () => {
    const productId = 'product123';

    // Mock inventory service methods to simulate transient errors
    (inventoryService.getInventory as jest.Mock).mockResolvedValue({ product: productId, quantity: 100 });
    (inventoryService.deleteInventory as jest.Mock)
      .mockRejectedValueOnce(new Error('Transient error'))  // First attempt fails
      .mockResolvedValue(true); // Second attempt succeeds

    // Trigger the event via HTTP
    await request(app)
      .post(`/api/v1/products/${productId}`)
      .send({ productId });

    // Ensure the retry logic is triggered and methods are called
    expect(inventoryService.getInventory).toHaveBeenCalledWith(productId);
    expect(inventoryService.deleteInventory).toHaveBeenCalledTimes(2); // Retry 2 times
  });

  it('should handle stockLow event and check inventory quantity', async () => {
    const productId = 'product123';

    // Mock the inventory service
    (inventoryService.getInventory as jest.Mock).mockResolvedValue({ product: productId, quantity: 3 });

    // Trigger the event via HTTP
    await request(app)
      .post('/events/stockLow')
      .send({ productId });

    // Ensure getInventory is called
    expect(inventoryService.getInventory).toHaveBeenCalledWith(productId);
  });

  it('should handle stockLow event and not notify if stock is sufficient', async () => {
    const productId = 'product123';

    // Mock the inventory service
    (inventoryService.getInventory as jest.Mock).mockResolvedValue({ product: productId, quantity: 10 });

    // Trigger the event via HTTP
    await request(app)
      .post('/events/stockLow')
      .send({ productId });

    // Ensure getInventory is called
    expect(inventoryService.getInventory).toHaveBeenCalledWith(productId);
  });
});
