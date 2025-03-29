import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateInventoryDTO {

  @IsNotEmpty()
  @IsNumber()
  quantity!: number;

  @IsNotEmpty()
  @IsString()
  location!: string;
}
export class UpdateInventoryDTO {

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
