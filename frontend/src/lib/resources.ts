import { apiFetch } from './api';
import type {
  Client,
  DashboardSummary,
  Order,
  OrderStatus,
  PageResult,
  Product,
  User,
} from './types';

export type { User };

function qs(params: Record<string, string | number | undefined>) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : '';
}

/**
 * Typed Distac resource facades.
 * Every call goes through `apiFetch` (cookies + silent refresh).
 */
export const dashboardApi = {
  summary: () => apiFetch<DashboardSummary>('/dashboard/summary'),
};

export const clientsApi = {
  list: (opts?: { search?: string; page?: number; pageSize?: number }) =>
    apiFetch<PageResult<Client>>(
      `/clients${qs({
        search: opts?.search,
        page: opts?.page ?? 1,
        pageSize: opts?.pageSize ?? 20,
      })}`,
    ),
  options: () =>
    apiFetch<PageResult<Pick<Client, 'id' | 'name' | 'document' | 'active'>>>(
      `/clients${qs({ page: 1, pageSize: 100 })}`,
    ),
  create: (body: {
    name: string;
    document: string;
    phone?: string | null;
    email?: string | null;
    city?: string | null;
    state?: string | null;
    active: boolean;
  }) =>
    apiFetch<Client>('/clients', { method: 'POST', body: JSON.stringify(body) }),
  update: (
    id: string,
    body: Partial<{
      name: string;
      document: string;
      phone: string | null;
      email: string | null;
      city: string | null;
      state: string | null;
      active: boolean;
    }>,
  ) =>
    apiFetch<Client>(`/clients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  remove: (id: string) =>
    apiFetch<unknown>(`/clients/${id}`, { method: 'DELETE' }),
};

export const productsApi = {
  list: (opts?: { search?: string; page?: number; pageSize?: number }) =>
    apiFetch<PageResult<Product>>(
      `/products${qs({
        search: opts?.search,
        page: opts?.page ?? 1,
        pageSize: opts?.pageSize ?? 20,
      })}`,
    ),
  options: () =>
    apiFetch<
      PageResult<Pick<Product, 'id' | 'sku' | 'name' | 'price' | 'unit' | 'active'>>
    >(`/products${qs({ page: 1, pageSize: 100 })}`),
  create: (body: {
    sku: string;
    name: string;
    unit: string;
    price: number;
    active: boolean;
  }) =>
    apiFetch<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  update: (
    id: string,
    body: Partial<{
      sku: string;
      name: string;
      unit: string;
      price: number;
      active: boolean;
    }>,
  ) =>
    apiFetch<Product>(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  remove: (id: string) =>
    apiFetch<unknown>(`/products/${id}`, { method: 'DELETE' }),
};

export const ordersApi = {
  list: (opts?: {
    search?: string;
    status?: OrderStatus | '';
    page?: number;
    pageSize?: number;
  }) =>
    apiFetch<PageResult<Order>>(
      `/orders${qs({
        search: opts?.search,
        status: opts?.status,
        page: opts?.page ?? 1,
        pageSize: opts?.pageSize ?? 20,
      })}`,
    ),
  create: (body: {
    clientId: string;
    status?: OrderStatus;
    notes?: string;
    items: { productId: string; quantity: number; unitPrice?: number }[];
  }) =>
    apiFetch<Order>('/orders', { method: 'POST', body: JSON.stringify(body) }),
  update: (
    id: string,
    body: {
      clientId?: string;
      status?: OrderStatus;
      notes?: string;
      items?: { productId: string; quantity: number; unitPrice?: number }[];
    },
  ) =>
    apiFetch<Order>(`/orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  remove: (id: string) =>
    apiFetch<unknown>(`/orders/${id}`, { method: 'DELETE' }),
};

export const usersApi = {
  list: (opts?: { search?: string; page?: number; pageSize?: number }) =>
    apiFetch<PageResult<User>>(
      `/users${qs({
        search: opts?.search,
        page: opts?.page ?? 1,
        pageSize: opts?.pageSize ?? 20,
      })}`,
    ),
  create: (body: {
    name: string;
    email: string;
    password: string;
    active: boolean;
  }) =>
    apiFetch<User>('/users', { method: 'POST', body: JSON.stringify(body) }),
  update: (
    id: string,
    body: Partial<{
      name: string;
      email: string;
      password: string;
      active: boolean;
    }>,
  ) =>
    apiFetch<User>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  remove: (id: string) =>
    apiFetch<unknown>(`/users/${id}`, { method: 'DELETE' }),
};
