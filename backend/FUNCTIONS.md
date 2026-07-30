# Índice de exports — backend Distac

Gerado a partir dos JSDoc dos módulos listados. Atualize ao exportar API pública nova.

## common

| Export | Arquivo | Responsabilidade |
|--------|---------|------------------|
| `PageParams` | `src/common/pagination.ts` | Params de paginação já normalizados |
| `PageResult` | `src/common/pagination.ts` | Envelope padrão das listagens REST |
| `parsePage` | `src/common/pagination.ts` | Normaliza query page/pageSize (máx. 100) |
| `pageResult` | `src/common/pagination.ts` | Monta envelope data/total/pages |
| `skipTake` | `src/common/pagination.ts` | Converte PageParams em skip/take Prisma |
| `IS_PUBLIC_KEY` | `src/common/public.decorator.ts` | Metadata key do JwtAuthGuard |
| `Public` | `src/common/public.decorator.ts` | Decorator de rota sem JWT |

## config

| Export | Arquivo | Responsabilidade |
|--------|---------|------------------|
| `EnvironmentVariables` | `src/config/env.validation.ts` | Shape tipado do `.env` |
| `validateEnv` | `src/config/env.validation.ts` | Valida env no boot |

## prisma

| Export | Arquivo | Responsabilidade |
|--------|---------|------------------|
| `PrismaService` | `src/prisma/prisma.service.ts` | Cliente Prisma injetável |
| `PrismaModule` | `src/prisma/prisma.module.ts` | Expõe PrismaService globalmente |

## auth

| Export | Arquivo | Responsabilidade |
|--------|---------|------------------|
| `AuthService` | `src/auth/auth.service.ts` | Login, refresh, me; seed demo opcional |
| `AuthController` | `src/auth/auth.controller.ts` | Sessão via cookies httpOnly |
| `AuthModule` | `src/auth/auth.module.ts` | Módulo JWT + export do guard |
| `JwtStrategy` | `src/auth/jwt.strategy.ts` | Cookie + usuário ativo |
| `JwtPayload` | `src/auth/jwt.strategy.ts` | Tipo do payload JWT |
| `JwtAuthGuard` | `src/auth/jwt-auth.guard.ts` | Zero Trust global; `@Public()` libera |
| `LoginDto` | `src/auth/dto/login.dto.ts` | Body de POST /auth/login |

## users

| Export | Arquivo | Responsabilidade |
|--------|---------|------------------|
| `UsersService` | `src/users/users.service.ts` | CRUD vendedores |
| `UsersController` | `src/users/users.controller.ts` | REST /api/users |
| `UsersModule` | `src/users/users.module.ts` | Feature module |

## clients

| Export | Arquivo | Responsabilidade |
|--------|---------|------------------|
| `ClientsService` | `src/clients/clients.service.ts` | CRUD clients |
| `ClientsController` | `src/clients/clients.controller.ts` | REST /api/clients |
| `ClientsModule` | `src/clients/clients.module.ts` | Feature module |

## products

| Export | Arquivo | Responsabilidade |
|--------|---------|------------------|
| `ProductsService` | `src/products/products.service.ts` | CRUD products |
| `ProductsController` | `src/products/products.controller.ts` | REST /api/products |
| `ProductsModule` | `src/products/products.module.ts` | Feature module |

## orders

| Export | Arquivo | Responsabilidade |
|--------|---------|------------------|
| `OrdersService` | `src/orders/orders.service.ts` | CRUD orders; total via trigger |
| `OrdersController` | `src/orders/orders.controller.ts` | REST /api/orders |
| `OrdersModule` | `src/orders/orders.module.ts` | Feature module |

## dashboard

| Export | Arquivo | Responsabilidade |
|--------|---------|------------------|
| `DashboardService` | `src/dashboard/dashboard.service.ts` | Summary para o hub |
| `DashboardController` | `src/dashboard/dashboard.controller.ts` | GET /api/dashboard/summary |
| `DashboardModule` | `src/dashboard/dashboard.module.ts` | Feature module |
