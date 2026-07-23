export type Cliente = {
  id: string;
  nome: string;
  cnpj: string;
  telefone: string | null;
  email: string | null;
  cidade: string;
  ativo: boolean;
};

export type Produto = {
  id: string;
  codigo: string;
  nome: string;
  unidade: string;
  preco: string | number;
  ativo: boolean;
};

export type PedidoStatus = 'rascunho' | 'confirmado' | 'cancelado';

export type PedidoItem = {
  id: string;
  produtoId: string;
  quantidade: string | number;
  precoUnitario: string | number;
  subtotal: string | number;
  produto?: Produto;
};

export type Pedido = {
  id: string;
  clienteId: string;
  data: string;
  status: PedidoStatus;
  observacao: string | null;
  total: string | number;
  cliente?: Cliente | { id: string; nome: string } | null;
  itens: PedidoItem[];
  itensCount?: number;
};

export type PageResult<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type DashboardSummary = {
  clientes: number;
  produtos: number;
  pedidos: number;
  confirmados: number;
  rascunhos: number;
  cancelados: number;
  recentes: Pedido[];
};

export function money(value: string | number) {
  const n = typeof value === 'string' ? Number(value) : value;
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
