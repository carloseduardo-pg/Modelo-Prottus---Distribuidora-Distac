# Frontend Distac — Vendas Internas

React + Vite + TypeScript. Marca Distac. Sessão via cookies httpOnly (sem JWT no `localStorage`).

Docs: [`../docs/projeto/seguranca.md`](../docs/projeto/seguranca.md) · [`../docs/projeto/design-system.md`](../docs/projeto/design-system.md)

## Estrutura

```
src/
  auth/         sessão (perfil em state; token só no cookie)
  components/   shell, modal, ícones, paginação
  pages/        login, início, clientes, produtos, pedidos
  lib/          api (credentials: include) + resources
  styles/       tokens Distac + CRUD
```

## Comandos

```bash
npm install
npm run dev
```

UI: http://127.0.0.1:5173
