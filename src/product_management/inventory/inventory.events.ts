import { emitterService } from '../../shared/configs/event_emitter';
import { InventoryService } from './inventory.service';

// Event listeners for inventory service
// Used to decouple the system
export class InventoryEventListeners {
  private readonly emitter;
  private readonly inventoryService;
  constructor() {
    this.emitter = emitterService;
    this.inventoryService = new InventoryService();
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

export const inventoryEventListeners = new InventoryEventListeners();
inventoryEventListeners;
