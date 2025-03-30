import { Router } from 'express';
import { user } from './user_management/users/user.routes';
import { product } from './product_management/product/product.routes';
import { inventory } from './product_management/inventory/inventory.routes';
import { auth } from './user_management/auth/auth.routes';

export const router: Router = Router();

// each route
router.use('/auth', auth);
router.use('/users', user);
router.use('/products', product);
router.use('/', inventory); // product subdomain routes
