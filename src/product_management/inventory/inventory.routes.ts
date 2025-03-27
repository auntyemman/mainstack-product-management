import { Router } from 'express';
import { bindMethods } from '../../shared/utils/bind_method';
import { InventoryController } from './inventory.controller';
import { authUser } from '../../shared/middlewares/auth';
import { adminRBAC } from '../../shared/middlewares/admin.RBAC';
import { inventoryContainer } from './di/inventory.container';
import { INVENTORY_TYPES } from './di/inventory.di';

// Retrieve the singleton controller from the container
const inventoryController = inventoryContainer.get(INVENTORY_TYPES.InventoryController);
export const inventory: Router = Router();
// Bind methods to the controller
// const inventoryCont = bindMethods(new InventoryController());
// Bind methods to the controller
const inventoryCont = bindMethods(inventoryController) as InventoryController;


// Routes definition for inventory
inventory.post('/create', authUser, adminRBAC, inventoryCont.createInventory);
inventory.get('/:id', authUser, adminRBAC, inventoryCont.getInventory);
inventory.get('/product/:productId', authUser, adminRBAC, inventoryCont.getIventoryByProductId);
inventory.put('/:id', authUser, adminRBAC, inventoryCont.updateInventory);
inventory.put('/:id/quantity/add', authUser, adminRBAC, inventoryCont.addToProductQuantity);
inventory.put('/:id/quantity/remove', authUser, adminRBAC, inventoryCont.removeFromProductQuantity);
inventory.get('/', authUser, inventoryCont.getInventories);
