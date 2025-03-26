import { ProductService } from './product.service';
import { ProductRepository } from './product.repository';
import { IProduct } from './product.model';
import { BadRequestError, APIError, NotFoundError } from '../../shared/utils/custom_error';
import { PaginationResult } from '../../shared/utils/pagination';

// Mock ProductRepository
jest.mock('./product.repository');

describe('ProductService', () => {
  let productService: ProductService;
  let productRepository: jest.Mocked<ProductRepository>;

  beforeEach(() => {
    // Initialize ProductService and its dependencies
    productRepository = new ProductRepository() as jest.Mocked<ProductRepository>;
    productService = new ProductService();

    // Override the productRepository with the mocked one
    (productService as any).productRepository = productRepository;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createProduct', () => {
    it('should create a product successfully', async () => {
      const productData: IProduct = {
        name: 'Test Product',
        category: [],
        tags: [],
      } as unknown as IProduct;

      // Mock repository methods
      productRepository.findByName.mockResolvedValue(null);
      productRepository.create.mockResolvedValue(productData);

      const result = await productService.createProduct(productData);

      expect(result).toEqual(productData);
      expect(productRepository.findByName).toHaveBeenCalledWith('Test Product');
      expect(productRepository.create).toHaveBeenCalledWith(productData);
    });

    it('should throw BadRequestError if the product already exists', async () => {
      const productData: IProduct = {
        name: 'Test Product',
        category: [],
        tags: [],
      } as unknown as IProduct;

      // Mock repository methods
      productRepository.findByName.mockResolvedValue(productData);

      await expect(productService.createProduct(productData)).rejects.toThrow(BadRequestError);
      expect(productRepository.findByName).toHaveBeenCalledWith('Test Product');
      expect(productRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('getProduct', () => {
    it('should return a product if it exists', async () => {
      const productData: IProduct = {
        name: 'Test Product',
        category: [],
        tags: [],
      } as unknown as IProduct;

      // Mock repository methods
      productRepository.findById.mockResolvedValue(productData);

      const result = await productService.getProduct('productId');

      expect(result).toEqual(productData);
      expect(productRepository.findById).toHaveBeenCalledWith('productId');
    });

    it('should throw NotFoundError if the product does not exist', async () => {
      // Mock repository methods
      productRepository.findById.mockResolvedValue(null);

      await expect(productService.getProduct('productId')).rejects.toThrow(NotFoundError);
      expect(productRepository.findById).toHaveBeenCalledWith('productId');
    });
  });

  describe('publishProduct', () => {
    it('should publish a product successfully', async () => {
      const productData: IProduct = {
        name: 'Test Product',
        category: [],
        tags: [],
      } as unknown as IProduct;

      // Mock repository methods
      productRepository.update.mockResolvedValue(productData);

      const result = await productService.publishProduct('productId', productData);

      expect(result).toEqual(productData);
      expect(productRepository.update).toHaveBeenCalledWith('productId', productData);
    });

    it('should throw APIError if publishing fails', async () => {
      const productData: IProduct = {
        name: 'Test Product',
        category: [],
        tags: [],
      } as unknown as IProduct;

      // Mock repository methods
      productRepository.update.mockResolvedValue(null);

      await expect(productService.publishProduct('productId', productData)).rejects.toThrow(
        APIError,
      );
      expect(productRepository.update).toHaveBeenCalledWith('productId', productData);
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product successfully', async () => {
      const productData: IProduct = {
        name: 'Test Product',
        category: [],
        tags: [],
      } as unknown as IProduct;

      // Mock repository methods
      productRepository.delete.mockResolvedValue(productData);

      const result = await productService.deleteProduct('productId');

      expect(result).toEqual(productData);
      expect(productRepository.delete).toHaveBeenCalledWith('productId');
    });

    it('should throw APIError if deletion fails', async () => {
      // Mock repository methods
      productRepository.delete.mockResolvedValue(null);

      await expect(productService.deleteProduct('productId')).rejects.toThrow(APIError);
      expect(productRepository.delete).toHaveBeenCalledWith('productId');
    });
  });

  describe('getProducts', () => {
    it('should return a paginated list of products', async () => {
      const query = {};
      const limit = 10;
      const page = 1;
      const products: PaginationResult<IProduct> = {
        data: [],
        totalItems: 0,
        totalPages: 1,
        currentPage: 1,
        limit,
      };

      // Mock repository methods
      productRepository.findMany.mockResolvedValue(products);

      const result = await productService.getProducts(query, limit, page);

      expect(result).toEqual(products);
      expect(productRepository.findMany).toHaveBeenCalledWith(query, limit, page);
    });
  });

  describe('updateProduct', () => {
    it('should update a product successfully', async () => {
      const productData: IProduct = {
        name: 'Updated Product',
        category: [],
        tags: [],
      } as unknown as IProduct;

      // Mock repository methods
      productRepository.update.mockResolvedValue(productData);

      const result = await productService.updateProduct('productId', productData);

      expect(result).toEqual(productData);
      expect(productRepository.update).toHaveBeenCalledWith('productId', productData);
    });

    it('should throw APIError if update fails', async () => {
      const productData: IProduct = {
        name: 'Updated Product',
        category: [],
        tags: [],
      } as unknown as IProduct;

      // Mock repository methods
      productRepository.update.mockResolvedValue(null);

      await expect(productService.updateProduct('productId', productData)).rejects.toThrow(
        APIError,
      );
      expect(productRepository.update).toHaveBeenCalledWith('productId', productData);
    });
  });
});
