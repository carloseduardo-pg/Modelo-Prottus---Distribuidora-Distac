import { plainToInstance } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';

/** Variáveis de ambiente tipadas — falha cedo se .env estiver incompleto. */
export class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  PORT!: number;

  @IsString()
  @IsNotEmpty()
  CORS_ORIGIN!: string;

  @IsIn(['development', 'production', 'test'])
  NODE_ENV!: 'development' | 'production' | 'test';

  @IsString()
  @IsNotEmpty()
  JWT_ACCESS_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_SECRET!: string;

  @IsString()
  @IsOptional()
  JWT_ACCESS_EXPIRES?: string;

  @IsString()
  @IsOptional()
  JWT_REFRESH_EXPIRES?: string;
}

export function validateEnv(config: Record<string, unknown>) {
  const normalized = {
    ...config,
    PORT: config.PORT ? Number(config.PORT) : 3000,
    NODE_ENV: config.NODE_ENV || 'development',
    CORS_ORIGIN: config.CORS_ORIGIN || 'http://localhost:5173',
    JWT_ACCESS_EXPIRES: config.JWT_ACCESS_EXPIRES || '15m',
    JWT_REFRESH_EXPIRES: config.JWT_REFRESH_EXPIRES || '7d',
  };

  const validated = plainToInstance(EnvironmentVariables, normalized, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    const messages = errors
      .map((e) => Object.values(e.constraints || {}).join(', '))
      .join('; ');
    throw new Error(`Config inválida (.env): ${messages}`);
  }

  const access = validated.JWT_ACCESS_SECRET;
  const refresh = validated.JWT_REFRESH_SECRET;
  if (
    access.includes('change-in-prod') ||
    refresh.includes('change-in-prod')
  ) {
    if (validated.NODE_ENV === 'production') {
      throw new Error('Substitua os secrets JWT antes de produção');
    }
    console.warn(
      '[segurança] JWT secrets ainda são de desenvolvimento — troque em produção',
    );
  }

  return validated;
}
