import { inject, injectable } from 'inversify';
import { EmitterService } from '../../shared/event_bus/event_emitter';
import { InventoryService } from './inventory.service';
import { INVENTORY_TYPES } from './di/inventory.di';
import { EVENT_TYPES } from '../../shared/event_bus/di/event.di';

// Event listeners for inventory service
@injectable()
export class InventoryEventListeners {
  private readonly emitter;
  constructor(@inject(INVENTORY_TYPES.InventoryService) private readonly inventoryService: InventoryService, @inject(EVENT_TYPES.EmitterService) emitterService: EmitterService) {
    this.emitter = emitterService;
    this.inventoryService = inventoryService;
    this.productListeners();
  }

  private productListeners(): void {
    // actions with retry strategy
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
