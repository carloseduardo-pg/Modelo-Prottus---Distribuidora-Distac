import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import {
  pageResult,
  parsePage,
  skipTake,
  type PageResult,
} from '../common/pagination';

/** Regras de negócio de cliente (CNPJ único; soft-delete se houver pedidos). */
@Injectable()
export class ClientesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Listagem paginada com busca em nome/CNPJ/cidade. */
  async list(
    q?: string,
    page?: string,
    pageSize?: string,
  ): Promise<PageResult<Prisma.ClienteGetPayload<object>>> {
    const params = parsePage(page, pageSize);
    const where: Prisma.ClienteWhereInput = q
      ? {
          OR: [
            { nome: { contains: q, mode: 'insensitive' } },
            { cnpj: { contains: q, mode: 'insensitive' } },
            { cidade: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {};
    const [total, data] = await Promise.all([
      this.prisma.cliente.count({ where }),
      this.prisma.cliente.findMany({
        where,
        orderBy: { nome: 'asc' },
        ...skipTake(params),
      }),
    ]);
    return pageResult(data, total, params);
  }

  /** Lista enxuta para selects de pedido (máx. 100 ativos). */
  listOptions() {
    return this.prisma.cliente.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' },
      take: 100,
      select: { id: true, nome: true, cnpj: true },
    });
  }

  async get(id: string) {
    const row = await this.prisma.cliente.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Cliente não encontrado');
    return row;
  }

  /** Persiste cliente; mapeia P2002 → ConflictException de CNPJ. */
  async create(dto: CreateClienteDto) {
    try {
      return await this.prisma.cliente.create({
        data: {
          nome: dto.nome,
          cnpj: dto.cnpj,
          telefone: dto.telefone,
          email: dto.email,
          cidade: dto.cidade,
          ativo: dto.ativo ?? true,
        },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException('CNPJ já cadastrado');
      }
      throw e;
    }
  }

  async update(id: string, dto: UpdateClienteDto) {
    await this.get(id);
    try {
      return await this.prisma.cliente.update({
        where: { id },
        data: dto,
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException('CNPJ já cadastrado');
      }
      throw e;
    }
  }

  /**
   * Se o cliente já tem pedidos, apenas desativa (`ativo=false`) —
   * hard delete quebraria o histórico de vendas.
   */
  async remove(id: string) {
    await this.get(id);
    const pedidos = await this.prisma.pedido.count({
      where: { clienteId: id },
    });
    if (pedidos > 0) {
      return this.prisma.cliente.update({
        where: { id },
        data: { ativo: false },
      });
    }
    await this.prisma.cliente.delete({ where: { id } });
    return { ok: true };
  }
}
