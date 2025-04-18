import { inject, injectable } from 'inversify';
import { EmitterService } from '../../shared/event_bus/event_emitter';
import { InventoryService } from './inventory.service';
import { INVENTORY_TYPES } from './di/inventory.di';
import { EVENT_TYPES } from '../../shared/event_bus/di/event.di';

// Event listeners for inventory service
@injectable()
export class InventoryEventListeners {
  constructor(
    @inject(INVENTORY_TYPES.InventoryService) private readonly inventoryService: InventoryService,
    @inject(EVENT_TYPES.EmitterService) private readonly emitterService: EmitterService,
  ) {
    this.emitterService = emitterService;
    this.inventoryService = inventoryService;
    this.registerListeners();
  }

  /**
   * Register all inventory-related event listeners
   */
  private registerListeners(): void {
    this.emitterService.on('productDeleted', async (productId: string) => {
      return this.handleProductDeleted(productId);
    });

    this.emitterService.on('stockLow', async (productId: string) => {
      return this.handleStockLow(productId);
    });
  }

  /**
   * Handles product deletion by removing its inventory
   */
  private async handleProductDeleted(productId: string): Promise<boolean> {
    const maxRetries = 3;
    let retryCount = 0;

    // retry mechanism for trancient error
    while (retryCount < maxRetries) {
      try {
        await Promise.all([
          this.inventoryService.getInventory(productId),
          this.inventoryService.deleteInventory(productId),
        ]);
        return true; // Success
      } catch (error) {
        retryCount++;
        if (retryCount >= maxRetries) {
          return false; // Fail after retries
        }
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Retry after 2s
        console.log('failed to delete, retry count:', retryCount);
      }
    }
    return false;
  }

  /**
   * Handles low stock notification event
   */
  private async handleStockLow(productId: string): Promise<boolean> {
    try {
      const inventory = await this.inventoryService.getInventory(productId);
      if (inventory && inventory.quantity < 5) {
        console.warn(
          `Stock is low for product ${productId}. Current quantity: ${inventory.quantity}`,
        );
        // TODO: trigger a notification or alert here
      }
      return true;
    } catch (error) {
      return false;
    }
  }

}
