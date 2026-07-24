import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import {
  pageResult,
  parsePage,
  skipTake,
  type PageResult,
} from '../common/pagination';

/** Catálogo de produtos (código único; soft-delete se já vendido). */
@Injectable()
export class ProdutosService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    q?: string,
    page?: string,
    pageSize?: string,
  ): Promise<PageResult<Prisma.ProdutoGetPayload<object>>> {
    const params = parsePage(page, pageSize);
    const where: Prisma.ProdutoWhereInput = q
      ? {
          OR: [
            { nome: { contains: q, mode: 'insensitive' } },
            { codigo: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {};
    const [total, data] = await Promise.all([
      this.prisma.produto.count({ where }),
      this.prisma.produto.findMany({
        where,
        orderBy: { nome: 'asc' },
        ...skipTake(params),
      }),
    ]);
    return pageResult(data, total, params);
  }

  /** Options para selects de pedido (máx. 100 ativos, com preço). */
  listOptions() {
    return this.prisma.produto.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' },
      take: 100,
      select: {
        id: true,
        codigo: true,
        nome: true,
        unidade: true,
        preco: true,
      },
    });
  }

  async get(id: string) {
    const row = await this.prisma.produto.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Produto não encontrado');
    return row;
  }

  /** Mapeia P2002 → ConflictException de código. */
  async create(dto: CreateProdutoDto) {
    try {
      return await this.prisma.produto.create({
        data: {
          codigo: dto.codigo,
          nome: dto.nome,
          unidade: dto.unidade,
          preco: dto.preco,
          ativo: dto.ativo ?? true,
        },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException('Código já cadastrado');
      }
      throw e;
    }
  }

  async update(id: string, dto: UpdateProdutoDto) {
    await this.get(id);
    try {
      return await this.prisma.produto.update({
        where: { id },
        data: dto,
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException('Código já cadastrado');
      }
      throw e;
    }
  }

  /**
   * Se o produto já aparece em pedido_item, só desativa —
   * hard delete apagaria histórico de itens.
   */
  async remove(id: string) {
    await this.get(id);
    const itens = await this.prisma.pedidoItem.count({
      where: { produtoId: id },
    });
    if (itens > 0) {
      return this.prisma.produto.update({
        where: { id },
        data: { ativo: false },
      });
    }
    await this.prisma.produto.delete({ where: { id } });
    return { ok: true };
  }
}
