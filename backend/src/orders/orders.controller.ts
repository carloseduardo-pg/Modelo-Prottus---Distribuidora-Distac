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
  Req,
} from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { parsePage } from '../common/pagination';
import { CreateOrderDto, UpdateOrderDto } from './dto/order.dto';
import { OrdersService } from './orders.service';

type AuthRequest = { user: { id: string } };

/**
 * REST API for sales orders.
 */
@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  /** Lists orders. */
  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('status') status?: OrderStatus,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.orders.findAll({
      search,
      status,
      ...parsePage(page, pageSize),
    });
  }

  /** Returns one order. */
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.orders.findOne(id);
  }

  /** Creates an order for the logged-in seller. */
  @Post()
  create(@Req() req: AuthRequest, @Body() dto: CreateOrderDto) {
    return this.orders.create(req.user.id, dto);
  }

  /** Updates an order. */
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderDto,
  ) {
    return this.orders.update(id, dto);
  }

  /** Cancels an order. */
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.orders.remove(id);
  }
}
