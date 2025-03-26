import { Document, Model, QueryOptions } from 'mongoose';

// a pagination utility function
export interface PaginationResult<T> {
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export async function paginate<T extends Document>(
  model: Model<T>,
  query: QueryOptions,
  limit: number,
  offset: number,
): Promise<PaginationResult<T>> {
  const [data, totalItems] = await Promise.all([
    model.find(query).skip(offset).limit(limit).exec(),
    model.countDocuments(query).exec(),
  ]);

  const totalPages = Math.ceil(totalItems / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  return {
    data,
    totalItems,
    totalPages,
    currentPage,
    limit,
  };
}
