import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class AdjustInventoryDto {
  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsNumber()
  @Min(0)
  delta: number;
}
