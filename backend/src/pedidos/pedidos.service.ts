import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PedidoStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreatePedidoDto,
  PedidoItemInputDto,
  UpdatePedidoDto,
} from './dto/pedido.dto';
import {
  pageResult,
  parsePage,
  skipTake,
  type PageResult,
} from '../common/pagination';

const includePedido = {
  cliente: true,
  itens: { include: { produto: true } },
} satisfies Prisma.PedidoInclude;

type PedidoFull = Prisma.PedidoGetPayload<{ include: typeof includePedido }>;

@Injectable()
export class PedidosService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    q?: string,
    status?: PedidoStatus,
    page?: string,
    pageSize?: string,
  ): Promise<PageResult<PedidoFull>> {
    const params = parsePage(page, pageSize);
    const where: Prisma.PedidoWhereInput = {
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { observacao: { contains: q, mode: 'insensitive' } },
              { cliente: { nome: { contains: q, mode: 'insensitive' } } },
              { cliente: { cnpj: { contains: q, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };
    const [total, data] = await Promise.all([
      this.prisma.pedido.count({ where }),
      this.prisma.pedido.findMany({
        where,
        include: includePedido,
        orderBy: { data: 'desc' },
        ...skipTake(params),
      }),
    ]);
    return pageResult(data, total, params);
  }

  async get(id: string) {
    const row = await this.prisma.pedido.findUnique({
      where: { id },
      include: includePedido,
    });
    if (!row) throw new NotFoundException('Pedido não encontrado');
    return row;
  }

  private async buildItens(itens: PedidoItemInputDto[]) {
    const produtoIds = itens.map((i) => i.produtoId);
    const produtos = await this.prisma.produto.findMany({
      where: { id: { in: produtoIds }, ativo: true },
    });
    if (produtos.length !== new Set(produtoIds).size) {
      throw new BadRequestException('Produto inválido ou inativo em um item');
    }
    const byId = new Map(produtos.map((p) => [p.id, p]));
    return itens.map((item) => {
      const produto = byId.get(item.produtoId)!;
      const precoUnitario =
        item.precoUnitario ?? Number(produto.preco);
      const quantidade = item.quantidade;
      const subtotal = Number((quantidade * precoUnitario).toFixed(2));
      return {
        produtoId: item.produtoId,
        quantidade,
        precoUnitario,
        subtotal,
      };
    });
  }

  async create(dto: CreatePedidoDto) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id: dto.clienteId },
    });
    if (!cliente || !cliente.ativo) {
      throw new BadRequestException('Cliente inválido ou inativo');
    }
    const itens = await this.buildItens(dto.itens);
    // subtotal/total também são reforçados por triggers no PostgreSQL
    const total = Number(
      itens.reduce((acc, i) => acc + Number(i.subtotal), 0).toFixed(2),
    );
    return this.prisma.pedido.create({
      data: {
        clienteId: dto.clienteId,
        status: dto.status ?? PedidoStatus.rascunho,
        observacao: dto.observacao,
        total,
        itens: { create: itens },
      },
      include: includePedido,
    });
  }

  async update(id: string, dto: UpdatePedidoDto) {
    const atual = await this.get(id);
    if (atual.status === PedidoStatus.cancelado) {
      throw new BadRequestException('Pedido cancelado não pode ser editado');
    }

    if (dto.clienteId) {
      const cliente = await this.prisma.cliente.findUnique({
        where: { id: dto.clienteId },
      });
      if (!cliente || !cliente.ativo) {
        throw new BadRequestException('Cliente inválido ou inativo');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      let total = Number(atual.total);
      if (dto.itens) {
        const itens = await this.buildItens(dto.itens);
        total = Number(
          itens.reduce((acc, i) => acc + Number(i.subtotal), 0).toFixed(2),
        );
        await tx.pedidoItem.deleteMany({ where: { pedidoId: id } });
        await tx.pedidoItem.createMany({
          data: itens.map((i) => ({ ...i, pedidoId: id })),
        });
      }

      return tx.pedido.update({
        where: { id },
        data: {
          clienteId: dto.clienteId,
          status: dto.status,
          observacao: dto.observacao,
          total,
        },
        include: includePedido,
      });
    });
  }

  async remove(id: string) {
    await this.get(id);
    await this.prisma.pedido.delete({ where: { id } });
    return { ok: true };
  }
}
