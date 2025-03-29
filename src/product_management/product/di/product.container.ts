import { Container } from "inversify";
import { ProductRepository } from "../product.repository";
import { ProductService } from "../product.service";
import { ProductController } from "../product.controller";
import { PRODUCT_TYPES } from "./product.types";
import { EmitterService } from "../../../shared/event_bus/event_emitter";
import { EVENT_TYPES } from "../../../shared/event_bus/di/event.di";


export const productContainer = new Container();

// Bind dependencies
productContainer.bind<ProductRepository>(PRODUCT_TYPES.ProductRepository).to(ProductRepository).inSingletonScope();
productContainer.bind<ProductService>(PRODUCT_TYPES.ProductService).to(ProductService).inSingletonScope();
productContainer.bind<ProductController>(PRODUCT_TYPES.ProductController).to(ProductController).inSingletonScope();

// binding from other services to product
productContainer.bind<EmitterService>(EVENT_TYPES.EmitterService).to(EmitterService).inSingletonScope();
