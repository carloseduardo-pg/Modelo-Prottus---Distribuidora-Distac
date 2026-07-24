import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

/** Payload de criação de produto (código único). */
export class CreateProdutoDto {
  @IsString()
  @MinLength(1)
  codigo!: string;

  @IsString()
  @MinLength(2)
  nome!: string;

  @IsString()
  @MinLength(1)
  unidade!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  preco!: number;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
