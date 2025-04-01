import 'reflect-metadata';
import { InventoryEventListeners } from './inventory.event_listeners';
import { InventoryService } from './inventory.service';
import { EmitterService } from '../../shared/event_bus/event_emitter';
import { IInventory } from './inventory.model';

describe('InventoryEventListeners', () => {
  let inventoryEventListeners: InventoryEventListeners;
  let inventoryServiceMock: jest.Mocked<InventoryService>;
  let emitterServiceMock: jest.Mocked<EmitterService>;
  
  // Spy on console methods
  let consoleWarnSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;
  // Store event callbacks for testing
  let eventCallbacks: Record<string, Function> = {};

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    eventCallbacks = {};
    
    // Create mock implementations
    inventoryServiceMock = {
      getInventory: jest.fn(),
      deleteInventory: jest.fn()
    } as unknown as jest.Mocked<InventoryService>;
    
    // Create emitter service mock with on method that stores callbacks
    emitterServiceMock = {
      on: jest.fn().mockImplementation((event: string, callback: Function) => {
        eventCallbacks[event] = callback;
        return emitterServiceMock;
      })
    } as unknown as jest.Mocked<EmitterService>;
    
    // Spy on console methods
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    
    // Mock setTimeout for testing retries
    jest.useFakeTimers();
    
    // Create the instance to test
    inventoryEventListeners = new InventoryEventListeners(
      inventoryServiceMock,
      emitterServiceMock
    );
  });

  afterEach(() => {
    jest.useRealTimers();
    consoleWarnSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  describe('Event registration', () => {
    it('should register event listeners on initialization', () => {
      // Assert
      expect(emitterServiceMock.on).toHaveBeenCalledTimes(2);
      expect(emitterServiceMock.on).toHaveBeenCalledWith('productDeleted', expect.any(Function));
      expect(emitterServiceMock.on).toHaveBeenCalledWith('stockLow', expect.any(Function));
    });
  });

  describe('handleProductDeleted', () => {
    it('should successfully delete inventory on first try', async () => {
      // Arrange
      const productId = 'product123';
      const inventoryData = { id: 'inv123', quantity: 10, location: 'Lagos' } as IInventory;
      
      inventoryServiceMock.getInventory.mockResolvedValue(inventoryData);
      inventoryServiceMock.deleteInventory.mockResolvedValue(true as unknown as IInventory);
      
      // Act - trigger the event handler directly
      const result = await eventCallbacks['productDeleted'](productId);
      
      // Assert
      expect(result).toBe(true);
      expect(inventoryServiceMock.getInventory).toHaveBeenCalledWith(productId);
      expect(inventoryServiceMock.deleteInventory).toHaveBeenCalledWith(productId);
      expect(inventoryServiceMock.getInventory).toHaveBeenCalledTimes(1);
      expect(inventoryServiceMock.deleteInventory).toHaveBeenCalledTimes(1);
    });
  });
  describe('handleStockLow', () => {
    it('should not log warning when inventory quantity is at threshold', async () => {
      // Arrange
      const productId = 'product123';
      const atThresholdInventory = { id: 'inv123', quantity: 10, location: 'Lagos' } as IInventory;
      
      inventoryServiceMock.getInventory.mockResolvedValue(atThresholdInventory);
      
      // Act
      const result = await eventCallbacks['stockLow'](productId);
      
      // Assert
      expect(result).toBe(true);
      expect(inventoryServiceMock.getInventory).toHaveBeenCalledWith(productId);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should not log warning when inventory quantity is above threshold', async () => {
      // Arrange
      const productId = 'product123';
      const adequateStockInventory = { id: 'inv123', quantity: 10, location: 'Lagos' } as IInventory;
      
      inventoryServiceMock.getInventory.mockResolvedValue(adequateStockInventory);
      
      // Act
      const result = await eventCallbacks['stockLow'](productId);
      
      // Assert
      expect(result).toBe(true);
      expect(inventoryServiceMock.getInventory).toHaveBeenCalledWith(productId);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should return false when getting inventory fails', async () => {
      // Arrange
      const productId = 'product123';
      
      inventoryServiceMock.getInventory.mockRejectedValue(new Error('Failed to get inventory'));
      
      // Act
      const result = await eventCallbacks['stockLow'](productId);
      
      // Assert
      expect(result).toBe(false);
      expect(inventoryServiceMock.getInventory).toHaveBeenCalledWith(productId);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
    
    it('should handle case when inventory is null', async () => {
      // Arrange
      const productId = 'product123';
      
      inventoryServiceMock.getInventory.mockResolvedValue(null as unknown as IInventory);
      
      // Act
      const result = await eventCallbacks['stockLow'](productId);
      
      // Assert
      expect(result).toBe(true);
      expect(inventoryServiceMock.getInventory).toHaveBeenCalledWith(productId);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  })
});