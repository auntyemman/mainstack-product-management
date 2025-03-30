import { Router } from 'express';
import { ProductController } from './product.controller';
import { authUser } from '../../shared/middlewares/auth';
import { adminRBAC } from '../../shared/middlewares/admin.RBAC';
import { bindMethods } from '../../shared/utils/bind_method';
import { EVENT_TYPES } from '../../shared/event_bus/di/event.di';
import { eventContainer } from '../../shared/event_bus/di/event.container';
import { EmitterService } from '../../shared/event_bus/event_emitter';
import { userContainer } from '../../user_management/users/di/user.container';
import { UserRepository } from '../../user_management/users/user.repository';
import { USER_TYPES } from '../../user_management/users/di/user.types';
import { productContainer } from './di/product.container';
import { PRODUCT_TYPES } from './di/product.di';

// di container
const productController = productContainer.get<ProductController>(PRODUCT_TYPES.ProductController);
const productCont = bindMethods(productController) as ProductController;
export const product: Router = Router();

// Pass userRepository into the middleware
const userRepository = userContainer.get<UserRepository>(USER_TYPES.UserRepository);
const authMiddleware = authUser(userRepository);

product.post('/', authMiddleware, adminRBAC, productCont.createProduct);
product.get('/:id', authMiddleware, productCont.getProduct);
product.patch('/:id', authMiddleware, adminRBAC, productCont.publishProduct);
product.delete('/:id', authMiddleware, adminRBAC, productCont.deleteProduct);
product.get('/', authMiddleware, productCont.getProducts);
product.put('/:id', authMiddleware, adminRBAC, productCont.updateProduct);
