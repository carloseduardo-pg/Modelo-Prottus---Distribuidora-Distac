import { PartialType } from '@nestjs/mapped-types';
import { CreateClienteDto } from './create-cliente.dto';

/** PATCH parcial de cliente. */
export class UpdateClienteDto extends PartialType(CreateClienteDto) {}
