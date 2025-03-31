import { ProductService } from './product.service';
import { ProductRepository } from './product.repository';
import { EmitterService } from '../../shared/event_bus/event_emitter';
import { IProduct } from './product.model';
import { ConflictError, NotFoundError, UnprocessableEntityError } from '../../shared/utils/custom_error';
import { ProductStatus } from './product.dto';
import { PaginationResult } from '../../shared/utils/pagination';

jest.mock('./product.repository');
jest.mock('../../shared/event_bus/event_emitter');

describe('ProductService', () => {
  let productService: ProductService;
  let mockProductRepository: jest.Mocked<ProductRepository>;
  let mockEmitterService: jest.Mocked<EmitterService>;

  beforeEach(() => {
    mockProductRepository = new ProductRepository() as jest.Mocked<ProductRepository>;
    mockEmitterService = new EmitterService() as jest.Mocked<EmitterService>;

    productService = new ProductService(mockEmitterService, mockProductRepository);
  });

  describe('createProduct', () => {
    it('should successfully create a new product', async () => {
      const productData = {
        _id: '1',
        name: 'Test Product',
        price: 100,
        status: ProductStatus.unpublished,
      } as IProduct;

      mockProductRepository.findByName.mockResolvedValue(null); // No product with the same name exists
      mockProductRepository.create.mockResolvedValue(productData);

      const createdProduct = await productService.createProduct(productData);

      expect(mockProductRepository.findByName).toHaveBeenCalledWith(productData.name);
      expect(mockProductRepository.create).toHaveBeenCalledWith(productData);
      expect(createdProduct).toEqual(productData);
    });

    it('should throw an error if product already exists', async () => {
      const productData: IProduct = {
        _id: '1',
        name: 'Test Product',
        price: 100,
        status: ProductStatus.unpublished,
      } as IProduct;

      mockProductRepository.findByName.mockResolvedValue(productData); // Product already exists

      await expect(productService.createProduct(productData))
        .rejects
        .toThrow(new ConflictError('Product already exists'));
    });

    it('should throw an error if product creation fails', async () => {
      const productData: IProduct = {
        _id: '1',
        name: 'Test Product',
        price: 100,
        status: ProductStatus.unpublished,
      } as IProduct;

      mockProductRepository.findByName.mockResolvedValue(null); // No product with the same name exists
      // mockProductRepository.create.mockResolvedValue(null); // Product creation failed

      await expect(productService.createProduct(productData))
        .rejects
        .toThrow(new UnprocessableEntityError('Failed to create product'));
    });
  });

  describe('getProduct', () => {
    it('should successfully fetch a product by ID', async () => {
      const productId = '1';
      const product: IProduct = {
        _id: productId,
        name: 'Test Product',
        price: 100,
        status: ProductStatus.unpublished,
      } as IProduct;

      mockProductRepository.findById.mockResolvedValue(product);

      const fetchedProduct = await productService.getProduct(productId);

      expect(mockProductRepository.findById).toHaveBeenCalledWith(productId);
      expect(fetchedProduct).toEqual(product);
    });

    it('should throw an error if product is not found', async () => {
      const productId = '1';

      mockProductRepository.findById.mockResolvedValue(null); // Product not found

      await expect(productService.getProduct(productId))
        .rejects
        .toThrow(new NotFoundError('Product not found'));
    });
  });

  describe('publishProduct', () => {
    it('should successfully publish a product', async () => {
      const productId = '1';
      const updatedProduct: IProduct = {
        _id: productId,
        name: 'Test Product',
        price: 100,
        status: ProductStatus.published,
      } as IProduct;

      mockProductRepository.update.mockResolvedValue(updatedProduct);

      const result = await productService.publishProduct(productId);

      expect(mockProductRepository.update).toHaveBeenCalledWith(productId, { status: ProductStatus.published });
      expect(result).toEqual(updatedProduct);
    });

    it('should throw an error if product publishing fails', async () => {
      const productId = '1';

      mockProductRepository.update.mockResolvedValue(null); // Product update failed

      await expect(productService.publishProduct(productId))
        .rejects
        .toThrowError(new UnprocessableEntityError('Failed to publish product'));
    });
  });

  describe('deleteProduct', () => {
    it('should successfully delete a product', async () => {
      const productId = '1';
      const deletedProduct: IProduct = {
        _id: productId,
        name: 'Test Product',
        price: 100,
      } as IProduct;

      // mockEmitterService.emitAsync.mockResolvedValue(true); // Event emitted successfully
      mockProductRepository.delete.mockResolvedValue(deletedProduct);

      const result = await productService.deleteProduct(productId);

      expect(mockEmitterService.emitAsync).toHaveBeenCalledWith('productDeleted', productId);
      expect(mockProductRepository.delete).toHaveBeenCalledWith(productId);
      expect(result).toEqual(deletedProduct);
    });

    it('should throw an error if product deletion fails', async () => {
      const productId = '1';

      // mockEmitterService.emitAsync.mockResolvedValue(null); // Event emitted successfully
      mockProductRepository.delete.mockResolvedValue(null); // Deletion failed

      await expect(productService.deleteProduct(productId))
        .rejects
        .toThrow(new UnprocessableEntityError('Failed to delete product or could not find product'));
    });
  });

  describe('getProducts', () => {
    it('should return paginated list of products', async () => {
      const query = {};
      const limit = 10;
      const page = 1;
      const paginationResult: PaginationResult<IProduct> = {
        data: [],
        totalItems: 0,
        currentPage: page,
        totalPages: 1,
        limit,
      };

      mockProductRepository.findMany.mockResolvedValue(paginationResult);

      const result = await productService.getProducts(query, limit, page);

      expect(mockProductRepository.findMany).toHaveBeenCalledWith(query, limit, page);
      expect(result).toEqual(paginationResult);
    });
  });

  describe('updateProduct', () => {
    it('should successfully update a product', async () => {
      const productId = '1';
      const productData: IProduct = {
        _id: productId,
        name: 'Updated Product',
        price: 150,
    } as IProduct;

      mockProductRepository.update.mockResolvedValue(productData);

      const result = await productService.updateProduct(productId, productData);

      expect(mockProductRepository.update).toHaveBeenCalledWith(productId, productData);
      expect(result).toEqual(productData);
    });

    it('should throw an error if product update fails', async () => {
      const productId = '1';
      const productData: IProduct = {
        _id: productId,
        name: 'Updated Product',
        price: 150,
      } as IProduct;

      mockProductRepository.update.mockResolvedValue(null); // Product update failed

      await expect(productService.updateProduct(productId, productData))
        .rejects
        .toThrow(new UnprocessableEntityError('Failed to update product'));
    });
  });
});
