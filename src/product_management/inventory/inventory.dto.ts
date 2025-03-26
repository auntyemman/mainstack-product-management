import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

// DTOs are used to validate and sanitize data before it is sent to the database
export class CreateInventoryDTO {
  @IsNotEmpty()
  @IsString()
  product!: string;

  @IsNotEmpty()
  @IsNumber()
  quantity!: number;

  @IsNotEmpty()
  @IsString()
  location!: string;
}
export class UpdateInventoryDTO {
  @IsString()
  @IsOptional()
  product?: string;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsString()
  location?: string;
}

export class UpdateInventoryQuntityDTO {
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsNotEmpty()
  @IsNumber()
  quantity!: number;
}
