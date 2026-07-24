# Índice de exports — frontend Distac

Camada compartilhada (`lib/`, `auth/`, `components/`). Pages não entram neste índice.

## lib

| Export | Arquivo | Responsabilidade |
|--------|---------|------------------|
| `AuthUser` | `src/lib/api.ts` | Tipo do perfil autenticado |
| `apiFetch` | `src/lib/api.ts` | HTTP com cookies; refresh automático em 401 |
| `loginRequest` | `src/lib/api.ts` | POST /auth/login |
| `logoutRequest` | `src/lib/api.ts` | POST /auth/logout |
| `meRequest` | `src/lib/api.ts` | GET /auth/me |
| `dashboardApi` | `src/lib/resources.ts` | Facade do summary |
| `clientesApi` | `src/lib/resources.ts` | Facade CRUD/options clientes |
| `produtosApi` | `src/lib/resources.ts` | Facade CRUD/options produtos |
| `pedidosApi` | `src/lib/resources.ts` | Facade CRUD pedidos |
| `Cliente` / `Produto` / `Pedido*` / `PageResult` / `DashboardSummary` | `src/lib/types.ts` | Tipos de domínio espelhando a API |
| `money` | `src/lib/types.ts` | Formata BRL pt-BR |

## auth

| Export | Arquivo | Responsabilidade |
|--------|---------|------------------|
| `AuthProvider` | `src/auth/AuthContext.tsx` | Sessão React sem JWT no localStorage |
| `useAuth` | `src/auth/AuthContext.tsx` | Hook de sessão |
| `ProtectedRoute` | `src/auth/ProtectedRoute.tsx` | Gate de rotas autenticadas |

## components

| Export | Arquivo | Responsabilidade |
|--------|---------|------------------|
| `AppShell` | `src/components/AppShell.tsx` | Layout sidebar + topbar + Outlet |
| `Modal` | `src/components/Modal.tsx` | Dialog modal (backdrop fecha) |
| `PaginationBar` | `src/components/PaginationBar.tsx` | Controles de paginação de listagens |
| `Icon` | `src/components/Icon.tsx` | Ícone SVG outline (sem emoji) |
