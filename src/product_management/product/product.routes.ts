import { Router } from 'express';
import { ProductController } from './product.controller';
import { authUser } from '../../shared/middlewares/auth';
import { adminRBAC } from '../../shared/middlewares/admin.RBAC';
import { bindMethods } from '../../shared/utils/bind_method';
import { EVENT_TYPES } from '../../shared/event_bus/di/event.di';
import { eventContainer } from '../../shared/event_bus/di/event.container';
import { EmitterService } from '../../shared/event_bus/event_emitter';

// di container
const eventEmitterService = eventContainer.get<EmitterService>(EVENT_TYPES.EmitterService);
const productCont = bindMethods(new ProductController(eventEmitterService));
export const product: Router = Router();
// const productCont = bindMethods(eventEmitterService) as ProductController;

product.post('/create', authUser, adminRBAC, productCont.createProduct);
product.get('/:id', authUser, productCont.getProduct);
product.patch('/publish/:id', authUser, adminRBAC, productCont.publishProduct);
product.delete('/:id', authUser, adminRBAC, productCont.deleteProduct);
product.get('/list', authUser, productCont.getProducts);
product.put('/update/:id', authUser, adminRBAC, productCont.updateProduct);
