import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

/**
 * CRUD service for products.
 */
@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lists products with search and pagination.
   */
  async findAll(params: { search?: string; page?: number; pageSize?: number }) {
    const page = Math.max(1, params.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 20));
    const where: Prisma.ProductWhereInput = params.search
      ? {
          OR: [
            { name: { contains: params.search, mode: 'insensitive' } },
            { sku: { contains: params.search, mode: 'insensitive' } },
          ],
        }
      : {};
    const [total, data] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    return { data, total, page, pageSize };
  }

  /** Returns one product. */
  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Produto não encontrado');
    return product;
  }

  /** Creates a product. */
  async create(dto: CreateProductDto) {
    const sku = dto.sku.trim().toUpperCase();
    const exists = await this.prisma.product.findUnique({ where: { sku } });
    if (exists) throw new ConflictException('SKU já cadastrado');
    return this.prisma.product.create({
      data: {
        sku,
        name: dto.name,
        unit: dto.unit.toUpperCase(),
        price: dto.price,
        active: dto.active ?? true,
      },
    });
  }

  /** Updates a product. */
  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);
    const sku = dto.sku?.trim().toUpperCase();
    if (sku) {
      const conflict = await this.prisma.product.findFirst({
        where: { sku, NOT: { id } },
      });
      if (conflict) throw new ConflictException('SKU já cadastrado');
    }
    return this.prisma.product.update({
      where: { id },
      data: {
        sku,
        name: dto.name,
        unit: dto.unit?.toUpperCase(),
        price: dto.price,
        active: dto.active,
      },
    });
  }

  /** Deactivates a product. */
  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data: { active: false },
    });
  }
}
