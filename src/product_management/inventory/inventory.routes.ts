import { Router } from 'express';
import { bindMethods } from '../../shared/utils/bind_method';
import { InventoryController } from './inventory.controller';
import { authUser } from '../../shared/middlewares/auth';
import { adminRBAC } from '../../shared/middlewares/admin.RBAC';

export const inventory: Router = Router();
// Bind methods to the controller
const inventoryCont = bindMethods(new InventoryController());
// Routes definition for inventory
inventory.post('/create', authUser, adminRBAC, inventoryCont.createInventory);
inventory.get('/:id', authUser, adminRBAC, inventoryCont.getInventory);
inventory.get('/product/:productId', authUser, adminRBAC, inventoryCont.getIventoryByProductId);
inventory.put('/:id', authUser, adminRBAC, inventoryCont.updateInventory);
inventory.put('/:id/quantity/add', authUser, adminRBAC, inventoryCont.addToProductQuantity);
inventory.put('/:id/quantity/remove', authUser, adminRBAC, inventoryCont.removeFromProductQuantity);
inventory.get('/', authUser, inventoryCont.getInventories);
