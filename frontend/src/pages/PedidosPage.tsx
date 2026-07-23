import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Modal } from '../components/Modal';
import { PaginationBar } from '../components/PaginationBar';
import { clientesApi, pedidosApi, produtosApi } from '../lib/resources';
import {
  money,
  type Pedido,
  type PedidoStatus,
  type Produto,
} from '../lib/types';

type ClienteOpt = { id: string; nome: string; cnpj: string };
type ProdutoOpt = Pick<Produto, 'id' | 'codigo' | 'nome' | 'unidade' | 'preco'>;

type ItemForm = {
  produtoId: string;
  quantidade: string;
  precoUnitario: string;
};

const emptyItem = (): ItemForm => ({
  produtoId: '',
  quantidade: '1',
  precoUnitario: '',
});

export function PedidosPage() {
  const [rows, setRows] = useState<Pedido[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [clientes, setClientes] = useState<ClienteOpt[]>([]);
  const [produtos, setProdutos] = useState<ProdutoOpt[]>([]);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState<PedidoStatus | ''>('');
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Pedido | null>(null);
  const [saving, setSaving] = useState(false);
  const [clienteId, setClienteId] = useState('');
  const [status, setStatus] = useState<PedidoStatus>('rascunho');
  const [observacao, setObservacao] = useState('');
  const [itens, setItens] = useState<ItemForm[]>([emptyItem()]);

  async function load(
    search = q,
    statusValue = statusFilter,
    pageNum = page,
  ) {
    setError('');
    try {
      const res = await pedidosApi.list({
        q: search || undefined,
        status: statusValue,
        page: pageNum,
      });
      setRows(res.data);
      setPage(res.page);
      setTotalPages(res.totalPages);
      setTotal(res.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao listar');
    }
  }

  useEffect(() => {
    void load(q, statusFilter, page);
  }, [page]);

  useEffect(() => {
    void clientesApi.options().then(setClientes);
    void produtosApi.options().then(setProdutos);
  }, []);

  const totalPreview = useMemo(() => {
    return itens.reduce((acc, item) => {
      const produto = produtos.find((p) => p.id === item.produtoId);
      const preco =
        item.precoUnitario !== ''
          ? Number(item.precoUnitario)
          : produto
            ? Number(produto.preco)
            : 0;
      return acc + Number(item.quantidade || 0) * preco;
    }, 0);
  }, [itens, produtos]);

  function openCreate() {
    setEditing(null);
    setClienteId(clientes[0]?.id || '');
    setStatus('rascunho');
    setObservacao('');
    setItens([emptyItem()]);
    setOpen(true);
  }

  function openEdit(row: Pedido) {
    setEditing(row);
    setClienteId(row.clienteId);
    setStatus(row.status);
    setObservacao(row.observacao || '');
    setItens(
      row.itens.map((i) => ({
        produtoId: i.produtoId,
        quantidade: String(i.quantidade),
        precoUnitario: String(i.precoUnitario),
      })),
    );
    setOpen(true);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!clienteId) {
      setError('Selecione um cliente');
      return;
    }
    if (itens.some((i) => !i.produtoId || Number(i.quantidade) <= 0)) {
      setError('Preencha todos os itens do pedido');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        clienteId,
        status,
        observacao: observacao.trim() || undefined,
        itens: itens.map((i) => ({
          produtoId: i.produtoId,
          quantidade: Number(i.quantidade),
          precoUnitario:
            i.precoUnitario === '' ? undefined : Number(i.precoUnitario),
        })),
      };
      if (editing) await pedidosApi.update(editing.id, payload);
      else await pedidosApi.create(payload);
      setOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(row: Pedido) {
    if (!confirm('Excluir este pedido?')) return;
    try {
      await pedidosApi.remove(row.id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  }

  return (
    <section>
      <h1 className="module-title">PEDIDOS</h1>
      <div className="crud-toolbar">
        <input
          placeholder="Buscar cliente ou observação"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setPage(1);
              void load(q, statusFilter, 1);
            }
          }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as PedidoStatus | '')}
        >
          <option value="">Todos os status</option>
          <option value="rascunho">Rascunho</option>
          <option value="confirmado">Confirmado</option>
          <option value="cancelado">Cancelado</option>
        </select>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => {
            setPage(1);
            void load(q, statusFilter, 1);
          }}
        >
          Buscar
        </button>
        <button type="button" className="btn-primary" onClick={openCreate}>
          Novo pedido
        </button>
      </div>
      {error ? <p className="page-error">{error}</p> : null}
      <table className="data-table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Cliente</th>
            <th>Status</th>
            <th>Itens</th>
            <th>Total</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{new Date(row.data).toLocaleString('pt-BR')}</td>
              <td>
                {row.cliente && 'nome' in row.cliente
                  ? row.cliente.nome
                  : row.clienteId}
              </td>
              <td>
                <span className={`badge badge-${row.status}`}>{row.status}</span>
              </td>
              <td>{row.itens?.length ?? 0}</td>
              <td>{money(row.total)}</td>
              <td className="row-actions">
                <button type="button" className="btn-ghost" onClick={() => openEdit(row)}>
                  Editar
                </button>
                <button type="button" className="btn-danger" onClick={() => void onDelete(row)}>
                  Excluir
                </button>
              </td>
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr>
              <td colSpan={6}>Nenhum pedido nesta página.</td>
            </tr>
          ) : null}
        </tbody>
      </table>
      <PaginationBar
        page={page}
        totalPages={totalPages}
        total={total}
        onChange={setPage}
      />

      <Modal
        title={editing ? 'Editar pedido' : 'Novo pedido'}
        open={open}
        onClose={() => setOpen(false)}
        wide
      >
        <form className="form-grid" onSubmit={onSubmit}>
          <label>
            Cliente *
            <select
              required
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
            >
              <option value="">Selecione</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </label>
          <label>
            Status *
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as PedidoStatus)}
            >
              <option value="rascunho">Rascunho</option>
              <option value="confirmado">Confirmado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </label>
          <label>
            Observação
            <textarea
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
            />
          </label>

          <div className="items-editor">
            <strong>Itens do pedido</strong>
            {itens.map((item, idx) => (
              <div className="items-row" key={idx}>
                <select
                  required
                  value={item.produtoId}
                  onChange={(e) => {
                    const next = [...itens];
                    const produto = produtos.find((p) => p.id === e.target.value);
                    next[idx] = {
                      ...next[idx],
                      produtoId: e.target.value,
                      precoUnitario: produto ? String(produto.preco) : '',
                    };
                    setItens(next);
                  }}
                >
                  <option value="">Produto</option>
                  {produtos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.codigo} — {p.nome}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={0.001}
                  step="0.001"
                  required
                  placeholder="Qtd"
                  value={item.quantidade}
                  onChange={(e) => {
                    const next = [...itens];
                    next[idx] = { ...next[idx], quantidade: e.target.value };
                    setItens(next);
                  }}
                />
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="Preço unit."
                  value={item.precoUnitario}
                  onChange={(e) => {
                    const next = [...itens];
                    next[idx] = { ...next[idx], precoUnitario: e.target.value };
                    setItens(next);
                  }}
                />
                <button
                  type="button"
                  className="btn-danger"
                  disabled={itens.length === 1}
                  onClick={() => setItens(itens.filter((_, i) => i !== idx))}
                >
                  Remover
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setItens([...itens, emptyItem()])}
            >
              Adicionar item
            </button>
            <div>
              Total estimado: <strong>{money(totalPreview)}</strong>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Salvando…' : 'Salvar'}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
