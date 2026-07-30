/** Domain types mirroring the Distac English API (Decimals may arrive as string|number). */

export type Client = {
  id: string;
  name: string;
  document: string;
  phone: string | null;
  email: string | null;
  city: string | null;
  state: string | null;
  active: boolean;
};

export type Product = {
  id: string;
  sku: string;
  name: string;
  unit: string;
  price: string | number;
  active: boolean;
};

export type User = {
  id: string;
  name: string;
  email: string;
  active: boolean;
};

export type OrderStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

export type OrderItem = {
  id: string;
  productId: string;
  quantity: string | number;
  unitPrice: string | number;
  lineTotal: string | number;
  product?: Pick<Product, 'id' | 'sku' | 'name' | 'unit'>;
};

export type Order = {
  id: string;
  number: string;
  clientId: string;
  userId: string;
  orderedAt: string;
  status: OrderStatus;
  notes: string | null;
  total: string | number;
  client: Pick<Client, 'id' | 'name' | 'document'> | { id: string; name: string };
  user?: Pick<User, 'id' | 'name' | 'email'>;
  items: OrderItem[];
  itemsCount?: number;
};

export type PageResult<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages?: number;
};

export type DashboardSummary = {
  clients: number;
  products: number;
  orders: number;
  confirmed: number;
  drafts: number;
  cancelled: number;
  recent: Order[];
};

/** Formats a monetary value in pt-BR / BRL. */
export function money(value: string | number) {
  const n = typeof value === 'string' ? Number(value) : value;
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
