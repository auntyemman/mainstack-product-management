import { IsString, IsNotEmpty, IsOptional, IsNumber, IsInt } from 'class-validator';

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
  @IsNotEmpty()
  @IsNumber()
  @IsInt()
  quantity!: number;
}
