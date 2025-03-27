import { inject, injectable } from 'inversify';
import { emitterService } from '../../shared/event_bus/event_emitter';
import { InventoryService } from './inventory.service';
import { TYPES } from './di/inventory.di';

// Event listeners for inventory service
@injectable()
export class InventoryEventListeners {
  private readonly emitter;
  // private readonly inventoryService: InventoryService;
  constructor(@inject(TYPES.InventoryService) private readonly inventoryService: InventoryService) {
    this.emitter = emitterService;
    // this.inventoryService = new InventoryService();
    this.inventoryService = inventoryService;
    this.productListeners();
  }

  private productListeners(): void {
    this.emitter.on(
      'productDeleted',
      async (id: string) => {
        const maxRetries = 3;
        let retryCount = 0;
        while (retryCount < maxRetries) {
          try {
            const inventory = await this.inventoryService.getInventoryByProductId(id);
            await this.inventoryService.deleteInventory(inventory.id);
            break;
          } catch (error) {
            retryCount++;
            await new Promise((resolve) => setTimeout(resolve, 2000)); // retries after 2 seconds;
          }
        }
      },
      // another product deleted action if any
    );
  }
}

// export const inventoryEventListeners = new InventoryEventListeners();
// inventoryEventListeners;
