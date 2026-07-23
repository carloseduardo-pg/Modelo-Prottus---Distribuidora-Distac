import { apiFetch } from './api';
import type {
  Cliente,
  DashboardSummary,
  PageResult,
  Pedido,
  PedidoStatus,
  Produto,
} from './types';

function qs(params: Record<string, string | number | undefined>) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : '';
}

export const dashboardApi = {
  summary: () => apiFetch<DashboardSummary>('/dashboard/summary'),
};

export const clientesApi = {
  list: (opts?: { q?: string; page?: number; pageSize?: number }) =>
    apiFetch<PageResult<Cliente>>(
      `/clientes${qs({
        q: opts?.q,
        page: opts?.page ?? 1,
        pageSize: opts?.pageSize ?? 20,
      })}`,
    ),
  options: () =>
    apiFetch<Pick<Cliente, 'id' | 'nome' | 'cnpj'>[]>('/clientes/options/all'),
  create: (body: {
    nome: string;
    cnpj: string;
    telefone?: string | null;
    email?: string | null;
    cidade: string;
    ativo: boolean;
  }) =>
    apiFetch<Cliente>('/clientes', { method: 'POST', body: JSON.stringify(body) }),
  update: (
    id: string,
    body: Partial<{
      nome: string;
      cnpj: string;
      telefone: string | null;
      email: string | null;
      cidade: string;
      ativo: boolean;
    }>,
  ) =>
    apiFetch<Cliente>(`/clientes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  remove: (id: string) =>
    apiFetch<unknown>(`/clientes/${id}`, { method: 'DELETE' }),
};

export const produtosApi = {
  list: (opts?: { q?: string; page?: number; pageSize?: number }) =>
    apiFetch<PageResult<Produto>>(
      `/produtos${qs({
        q: opts?.q,
        page: opts?.page ?? 1,
        pageSize: opts?.pageSize ?? 20,
      })}`,
    ),
  options: () =>
    apiFetch<
      Pick<Produto, 'id' | 'codigo' | 'nome' | 'unidade' | 'preco'>[]
    >('/produtos/options/all'),
  create: (body: {
    codigo: string;
    nome: string;
    unidade: string;
    preco: number;
    ativo: boolean;
  }) =>
    apiFetch<Produto>('/produtos', { method: 'POST', body: JSON.stringify(body) }),
  update: (
    id: string,
    body: Partial<{
      codigo: string;
      nome: string;
      unidade: string;
      preco: number;
      ativo: boolean;
    }>,
  ) =>
    apiFetch<Produto>(`/produtos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  remove: (id: string) =>
    apiFetch<unknown>(`/produtos/${id}`, { method: 'DELETE' }),
};

export const pedidosApi = {
  list: (opts?: {
    q?: string;
    status?: PedidoStatus | '';
    page?: number;
    pageSize?: number;
  }) =>
    apiFetch<PageResult<Pedido>>(
      `/pedidos${qs({
        q: opts?.q,
        status: opts?.status,
        page: opts?.page ?? 1,
        pageSize: opts?.pageSize ?? 20,
      })}`,
    ),
  create: (body: {
    clienteId: string;
    status?: PedidoStatus;
    observacao?: string;
    itens: { produtoId: string; quantidade: number; precoUnitario?: number }[];
  }) =>
    apiFetch<Pedido>('/pedidos', { method: 'POST', body: JSON.stringify(body) }),
  update: (
    id: string,
    body: {
      clienteId?: string;
      status?: PedidoStatus;
      observacao?: string;
      itens?: { produtoId: string; quantidade: number; precoUnitario?: number }[];
    },
  ) =>
    apiFetch<Pedido>(`/pedidos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  remove: (id: string) =>
    apiFetch<unknown>(`/pedidos/${id}`, { method: 'DELETE' }),
};
