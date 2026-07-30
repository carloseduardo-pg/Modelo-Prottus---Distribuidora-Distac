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
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';
import { ClientsService } from './clients.service';

/**
 * REST API for clients.
 */
@Controller('clients')
export class ClientsController {
  constructor(private readonly clients: ClientsService) {}

  /** Lists clients. */
  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.clients.findAll({
      search,
      ...parsePage(page, pageSize),
    });
  }

  /** Returns one client. */
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.clients.findOne(id);
  }

  /** Creates a client. */
  @Post()
  create(@Body() dto: CreateClientDto) {
    return this.clients.create(dto);
  }

  /** Updates a client. */
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClientDto,
  ) {
    return this.clients.update(id, dto);
  }

  /** Deactivates a client. */
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.clients.remove(id);
  }
}
