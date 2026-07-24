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
| `EnvironmentVariables` | `src/config/env.validation.ts` | Shape tipado do `.env` (inclui `SEED_DEMO_USER_ON_BOOT`) |
| `validateEnv` | `src/config/env.validation.ts` | Valida env no boot; bloqueia secrets fracos em prod |

## prisma

| Export | Arquivo | Responsabilidade |
|--------|---------|------------------|
| `PrismaService` | `src/prisma/prisma.service.ts` | Cliente Prisma injetável (connect/disconnect) |
| `PrismaModule` | `src/prisma/prisma.module.ts` | Expõe PrismaService globalmente |

## auth

| Export | Arquivo | Responsabilidade |
|--------|---------|------------------|
| `AuthService` | `src/auth/auth.service.ts` | Login, refresh, me; seed demo só se `SEED_DEMO_USER_ON_BOOT` |
| `AuthController` | `src/auth/auth.controller.ts` | Sessão via cookies httpOnly |
| `AuthModule` | `src/auth/auth.module.ts` | Módulo JWT + export do guard |
| `JwtStrategy` | `src/auth/jwt.strategy.ts` | Strategy Passport lendo cookie access_token |
| `JwtPayload` | `src/auth/jwt.strategy.ts` | Tipo do payload JWT |
| `JwtAuthGuard` | `src/auth/jwt-auth.guard.ts` | Zero Trust: JWT por padrão; `@Public()` libera |
| `LoginDto` | `src/auth/dto/login.dto.ts` | Body de POST /auth/login |

## clientes

| Export | Arquivo | Responsabilidade |
|--------|---------|------------------|
| `ClientesService` | `src/clientes/clientes.service.ts` | CRUD; soft-desativa se houver pedidos |
| `ClientesController` | `src/clientes/clientes.controller.ts` | REST /api/clientes |
| `ClientesModule` | `src/clientes/clientes.module.ts` | Feature module |
| `CreateClienteDto` | `src/clientes/dto/create-cliente.dto.ts` | Payload create (CNPJ único) |
| `UpdateClienteDto` | `src/clientes/dto/update-cliente.dto.ts` | PATCH parcial |

## produtos

| Export | Arquivo | Responsabilidade |
|--------|---------|------------------|
| `ProdutosService` | `src/produtos/produtos.service.ts` | CRUD; soft-desativa se houver itens |
| `ProdutosController` | `src/produtos/produtos.controller.ts` | REST /api/produtos |
| `ProdutosModule` | `src/produtos/produtos.module.ts` | Feature module |
| `CreateProdutoDto` | `src/produtos/dto/create-produto.dto.ts` | Payload create (código único) |
| `UpdateProdutoDto` | `src/produtos/dto/update-produto.dto.ts` | PATCH parcial |

## pedidos

| Export | Arquivo | Responsabilidade |
|--------|---------|------------------|
| `PedidosService` | `src/pedidos/pedidos.service.ts` | Pedidos/itens; total reforçado por trigger |
| `PedidosController` | `src/pedidos/pedidos.controller.ts` | REST /api/pedidos |
| `PedidosModule` | `src/pedidos/pedidos.module.ts` | Feature module |
| `PedidoItemInputDto` | `src/pedidos/dto/pedido.dto.ts` | Linha de item (preço opcional) |
| `CreatePedidoDto` | `src/pedidos/dto/pedido.dto.ts` | Create com ≥1 item |
| `UpdatePedidoDto` | `src/pedidos/dto/pedido.dto.ts` | Update; itens substitui o conjunto |

## dashboard

| Export | Arquivo | Responsabilidade |
|--------|---------|------------------|
| `DashboardService` | `src/dashboard/dashboard.service.ts` | Counts + recentes para Home |
| `DashboardController` | `src/dashboard/dashboard.controller.ts` | GET /api/dashboard/summary |
| `DashboardModule` | `src/dashboard/dashboard.module.ts` | Feature module |
