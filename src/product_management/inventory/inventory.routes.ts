import { Router } from 'express';
import { bindMethods } from '../../shared/utils/bind_method';
import { InventoryController } from './inventory.controller';
import { authUser } from '../../shared/middlewares/auth';
import { adminRBAC } from '../../shared/middlewares/admin.RBAC';
import { inventoryContainer } from './di/inventory.container';
import { INVENTORY_TYPES } from './di/inventory.di';
import { UserRepository } from '../../user_management/users/user.repository';
import { USER_TYPES } from '../../user_management/users/di/user.types';
import { userContainer } from '../../user_management/users/di/user.container';

export const inventory: Router = Router();
// Retrieve the singleton controller from the container
const inventoryController = inventoryContainer.get(INVENTORY_TYPES.InventoryController);
const inventoryCont = bindMethods(inventoryController) as InventoryController;

// Pass userRepository into the middleware
const userRepository = userContainer.get<UserRepository>(USER_TYPES.UserRepository);
const authMiddleware = authUser(userRepository);

// Routes definition for inventory, a subdomain of the product service
inventory.post(
  '/products/:productId/inventory',
  authMiddleware,
  adminRBAC,
  inventoryCont.createInventory,
);
inventory.get(
  '/products/:productId/inventory',
  authMiddleware,
  adminRBAC,
  inventoryCont.getInventory,
);
inventory.put(
  '/products/:productId/inventory',
  authMiddleware,
  adminRBAC,
  inventoryCont.updateInventory,
);
inventory.patch(
  '/products/:productId/inventory',
  authMiddleware,
  adminRBAC,
  inventoryCont.updateQuantity,
);
inventory.delete(
  '/products/:productId/inventory',
  authMiddleware,
  adminRBAC,
  inventoryCont.deleteInventory,
);
inventory.get('/inventories', authMiddleware, adminRBAC, inventoryCont.getInventories);
