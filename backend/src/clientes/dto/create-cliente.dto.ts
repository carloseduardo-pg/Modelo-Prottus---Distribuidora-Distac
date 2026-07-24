import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

/** Payload de criação de cliente (CNPJ único no banco). */
export class CreateClienteDto {
  @IsString()
  @MinLength(2)
  nome!: string;

  @IsString()
  @MinLength(14)
  cnpj!: string;

  @IsOptional()
  @IsString()
  telefone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @MinLength(2)
  cidade!: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
