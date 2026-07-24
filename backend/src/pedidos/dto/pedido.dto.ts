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

/** Linha de item no create/update; `precoUnitario` opcional usa preço do produto. */
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

/** Criação de pedido com pelo menos um item. */
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

/**
 * Atualização parcial; se `itens` vier, substitui o conjunto inteiro
 * (delete + createMany no service).
 */
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
