import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { PedidoStatus } from '@prisma/client';

export class PedidoItemInputDto {
  @IsUUID()
  produtoId!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.001)
  quantidade!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  precoUnitario?: number;
}

export class CreatePedidoDto {
  @IsUUID()
  clienteId!: string;

  @IsOptional()
  @IsEnum(PedidoStatus)
  status?: PedidoStatus;

  @IsOptional()
  @IsString()
  observacao?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PedidoItemInputDto)
  itens!: PedidoItemInputDto[];
}

export class UpdatePedidoDto {
  @IsOptional()
  @IsUUID()
  clienteId?: string;

  @IsOptional()
  @IsEnum(PedidoStatus)
  status?: PedidoStatus;

  @IsOptional()
  @IsString()
  observacao?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PedidoItemInputDto)
  itens?: PedidoItemInputDto[];
}
