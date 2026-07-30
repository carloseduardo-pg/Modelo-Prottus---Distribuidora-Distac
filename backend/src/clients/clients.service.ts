import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';

/**
 * CRUD service for clients (construction material stores).
 */
@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lists clients with search and pagination.
   */
  async findAll(params: { search?: string; page?: number; pageSize?: number }) {
    const page = Math.max(1, params.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 20));
    const where: Prisma.ClientWhereInput = params.search
      ? {
          OR: [
            { name: { contains: params.search, mode: 'insensitive' } },
            { document: { contains: params.search, mode: 'insensitive' } },
            { city: { contains: params.search, mode: 'insensitive' } },
          ],
        }
      : {};
    const [total, data] = await this.prisma.$transaction([
      this.prisma.client.count({ where }),
      this.prisma.client.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    return { data, total, page, pageSize };
  }

  /** Returns one client. */
  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({ where: { id } });
    if (!client) throw new NotFoundException('Cliente não encontrado');
    return client;
  }

  /** Creates a client. */
  async create(dto: CreateClientDto) {
    const document = dto.document.replace(/\D/g, '');
    const exists = await this.prisma.client.findUnique({ where: { document } });
    if (exists) throw new ConflictException('Documento já cadastrado');
    return this.prisma.client.create({
      data: {
        name: dto.name,
        document,
        phone: dto.phone,
        email: dto.email,
        city: dto.city,
        state: dto.state?.toUpperCase(),
        active: dto.active ?? true,
      },
    });
  }

  /** Updates a client. */
  async update(id: string, dto: UpdateClientDto) {
    await this.findOne(id);
    const document = dto.document?.replace(/\D/g, '');
    if (document) {
      const conflict = await this.prisma.client.findFirst({
        where: { document, NOT: { id } },
      });
      if (conflict) throw new ConflictException('Documento já cadastrado');
    }
    return this.prisma.client.update({
      where: { id },
      data: {
        name: dto.name,
        document,
        phone: dto.phone,
        email: dto.email,
        city: dto.city,
        state: dto.state?.toUpperCase(),
        active: dto.active,
      },
    });
  }

  /** Deactivates a client. */
  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.client.update({
      where: { id },
      data: { active: false },
    });
  }
}
