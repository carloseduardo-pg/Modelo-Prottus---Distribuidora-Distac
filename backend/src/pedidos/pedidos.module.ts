import { Module } from '@nestjs/common';
import { PedidosController } from './pedidos.controller';
import { PedidosService } from './pedidos.service';

/** Feature module de pedidos. */
@Module({
  controllers: [PedidosController],
  providers: [PedidosService],
})
export class PedidosModule {}
