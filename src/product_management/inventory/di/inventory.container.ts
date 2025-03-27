import { Container } from 'inversify';
import { InventoryRepository } from '../inventory.repository';
import { InventoryService } from '../inventory.service';
import { InventoryController } from '../inventory.controller';
import { InventoryEventListeners } from '../inventory.event_listeners';
import { TYPES } from './inventory.di';

// Create a DI container
const inventoryContainer = new Container();

// Bind dependencies
inventoryContainer.bind<InventoryRepository>(TYPES.InventoryRepository).to(InventoryRepository).inSingletonScope();
inventoryContainer.bind<InventoryService>(TYPES.InventoryService).to(InventoryService).inSingletonScope();
inventoryContainer.bind<InventoryController>(TYPES.InventoryController).to(InventoryController).inSingletonScope();
inventoryContainer.bind<InventoryEventListeners>(TYPES.InventoryEventListeners).to(InventoryEventListeners).inSingletonScope();

export { inventoryContainer };
