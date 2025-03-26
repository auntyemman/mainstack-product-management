import { IsString, IsNotEmpty, IsOptional, IsArray, IsNumber, IsEnum } from 'class-validator';

// DTOs are used to validate and sanitize data before it is sent to the database
export enum ProductStatus {
  published = 'published',
  unpublished = 'unpublished',
}
export class ProductStatusDTO {
  @IsOptional()
  @IsEnum(ProductStatus)
  status!: ProductStatus;
}

export enum tags {
  wearable = 'wearable',
  smart = 'smart',
  digital = 'digital',
  technology = 'technology',
  affordable = 'affordable',
}

export enum category {
  clothing = 'clothing',
  shoes = 'shoes',
  electronics = 'electronics',
  computers = 'computers',
  smartphones = 'smartphones',
  sports = 'sports',
  accessories = 'accessories',
}

export class CreateProductDTO {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  description!: string;

  @IsNotEmpty()
  @IsNumber()
  price!: number;

  @IsNotEmpty()
  @IsArray()
  @IsEnum(category, { each: true })
  category!: category[];

  @IsNotEmpty()
  @IsArray()
  @IsEnum(tags, { each: true })
  tags!: tags[];

  @IsOptional()
  @IsString()
  status!: ProductStatus;

  @IsOptional()
  @IsString()
  createdBy!: string;
}

export class UpdateProductDTO {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsArray()
  @IsOptional()
  @IsEnum(category, { each: true })
  category?: category[];

  @IsOptional()
  @IsArray()
  @IsEnum(tags, { each: true })
  tags?: tags[];

  @IsOptional()
  @IsString()
  status?: ProductStatus;
}
