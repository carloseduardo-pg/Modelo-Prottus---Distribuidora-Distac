import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { parsePage } from '../common/pagination';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { ProductsService } from './products.service';

/**
 * REST API for products.
 */
@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  /** Lists products. */
  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.products.findAll({
      search,
      ...parsePage(page, pageSize),
    });
  }

  /** Returns one product. */
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.products.findOne(id);
  }

  /** Creates a product. */
  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.products.create(dto);
  }

  /** Updates a product. */
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.products.update(id, dto);
  }

  /** Deactivates a product. */
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.products.remove(id);
  }
}
