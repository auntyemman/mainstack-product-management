import { Container } from 'inversify';
import { InventoryRepository } from '../inventory.repository';
import { InventoryService } from '../inventory.service';
import { InventoryController } from '../inventory.controller';
import { InventoryEventListeners } from '../inventory.event_listeners';
import { INVENTORY_TYPES } from './inventory.di';
import { EmitterService } from '../../../shared/event_bus/event_emitter';
import { EVENT_TYPES } from '../../../shared/event_bus/di/event.di';

// Create a DI container
const inventoryContainer = new Container();

// Bind dependencies
inventoryContainer.bind<InventoryRepository>(INVENTORY_TYPES.InventoryRepository).to(InventoryRepository).inSingletonScope();
inventoryContainer.bind<InventoryService>(INVENTORY_TYPES.InventoryService).to(InventoryService).inSingletonScope();
inventoryContainer.bind<InventoryController>(INVENTORY_TYPES.InventoryController).to(InventoryController).inSingletonScope();
inventoryContainer.bind<InventoryEventListeners>(INVENTORY_TYPES.InventoryEventListeners).to(InventoryEventListeners).inSingletonScope();

// binding from other services to inventory
inventoryContainer.bind<EmitterService>(EVENT_TYPES.EmitterService).to(EmitterService).inSingletonScope();

export { inventoryContainer };
