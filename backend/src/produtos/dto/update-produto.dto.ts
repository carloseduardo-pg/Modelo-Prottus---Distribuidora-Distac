import { PartialType } from '@nestjs/mapped-types';
import { CreateProdutoDto } from './create-produto.dto';

/** PATCH parcial de produto. */
export class UpdateProdutoDto extends PartialType(CreateProdutoDto) {}
