import { Model, Document } from 'mongoose';
import { BaseRepository } from './base.repository';

// Mock the Mongoose model
const mockModel = {
  create: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
};

interface ITestDocument extends Document {
  name: string;
}

describe('BaseRepository', () => {
  let baseRepository: BaseRepository<ITestDocument>;

  beforeEach(() => {
    baseRepository = new BaseRepository<ITestDocument>(
      mockModel as unknown as Model<ITestDocument>,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a document', async () => {
    // Create a mock for the document with a 'save' method
    const mockDocument = {
      save: jest.fn().mockResolvedValueOnce({ name: 'Test Document' }),
    };

    // Mock the model constructor to return the mockDocument
    // Here, mockModel is mocked to behave like a constructor
    const mockModel = jest.fn(() => mockDocument);

    // Create an instance of BaseRepository with the mocked model
    const baseRepository = new BaseRepository(mockModel as any);

    // Call the create method
    const result = await baseRepository.create({});

    // Assertions
    expect(mockModel).toHaveBeenCalledWith({});
    expect(mockDocument.save).toHaveBeenCalled();
    expect(result).toEqual({ name: 'Test Document' });
  });

  it('should find a document by ID', async () => {
    const mockDocument = { name: 'Test Document' };
    (mockModel.findById as jest.Mock).mockReturnValueOnce({
      exec: jest.fn().mockResolvedValueOnce(mockDocument),
    });

    const result = await baseRepository.findById('12345');

    expect(mockModel.findById).toHaveBeenCalledWith('12345');
    expect(result).toEqual(mockDocument);
  });

  it('should find one document by query', async () => {
    const mockDocument = { name: 'Test Document' };
    (mockModel.findOne as jest.Mock).mockReturnValueOnce({
      exec: jest.fn().mockResolvedValueOnce(mockDocument),
    });

    const result = await baseRepository.findOne({ name: 'Test Document' });

    expect(mockModel.findOne).toHaveBeenCalledWith({ name: 'Test Document' });
    expect(result).toEqual(mockDocument);
  });

  it('should find all documents', async () => {
    const mockDocuments = [{ name: 'Test Document 1' }, { name: 'Test Document 2' }];
    (mockModel.find as jest.Mock).mockReturnValueOnce({
      exec: jest.fn().mockResolvedValueOnce(mockDocuments),
    });

    const result = await baseRepository.findAll();

    expect(mockModel.find).toHaveBeenCalled();
    expect(result).toEqual(mockDocuments);
  });

  it('should update a document by ID', async () => {
    const mockDocument = { name: 'Updated Document' };
    (mockModel.findByIdAndUpdate as jest.Mock).mockReturnValueOnce({
      exec: jest.fn().mockResolvedValueOnce(mockDocument),
    });

    const result = await baseRepository.update('12345', { name: 'Updated Document' });

    expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
      '12345',
      { name: 'Updated Document' },
      { new: true },
    );
    expect(result).toEqual(mockDocument);
  });

  it('should delete a document by ID', async () => {
    const mockDocument = { name: 'Deleted Document' };
    (mockModel.findByIdAndDelete as jest.Mock).mockReturnValueOnce({
      exec: jest.fn().mockResolvedValueOnce(mockDocument),
    });

    const result = await baseRepository.delete('12345');

    expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith('12345');
    expect(result).toEqual(mockDocument);
  });
});
