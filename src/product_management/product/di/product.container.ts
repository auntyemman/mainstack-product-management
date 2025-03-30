import { Container } from "inversify";
import { ProductRepository } from "../product.repository";
import { ProductService } from "../product.service";
import { ProductController } from "../product.controller";
import { PRODUCT_TYPES } from "./product.di";
import { EmitterService } from "../../../shared/event_bus/event_emitter";
import { EVENT_TYPES } from "../../../shared/event_bus/di/event.di";
import { eventContainer } from "../../../shared/event_bus/di/event.container";


export const productContainer = new Container();

// Bind dependencies
productContainer.bind<ProductRepository>(PRODUCT_TYPES.ProductRepository).to(ProductRepository).inSingletonScope();
productContainer.bind<ProductService>(PRODUCT_TYPES.ProductService).to(ProductService).inSingletonScope();
productContainer.bind<ProductController>(PRODUCT_TYPES.ProductController).to(ProductController).inSingletonScope();

// binding from other services to product
// Use the shared instance of EmitterService from the event bus
productContainer.bind(EVENT_TYPES.EmitterService).toDynamicValue(() => eventContainer.get(EVENT_TYPES.EmitterService));
