import { useEffect, useState, type FormEvent } from 'react';
import { Modal } from '../components/Modal';
import { PaginationBar } from '../components/PaginationBar';
import { produtosApi } from '../lib/resources';
import { money, type Produto } from '../lib/types';

const empty = {
  codigo: '',
  nome: '',
  unidade: 'UN',
  preco: '0',
  ativo: true,
};

export function ProdutosPage() {
  const [rows, setRows] = useState<Produto[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState('');
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Produto | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  async function load(search = q, pageNum = page) {
    setError('');
    try {
      const res = await produtosApi.list({ q: search || undefined, page: pageNum });
      setRows(res.data);
      setPage(res.page);
      setTotalPages(res.totalPages);
      setTotal(res.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao listar');
    }
  }

  useEffect(() => {
    void load(q, page);
  }, [page]);

  function openCreate() {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  }

  function openEdit(row: Produto) {
    setEditing(row);
    setForm({
      codigo: row.codigo,
      nome: row.nome,
      unidade: row.unidade,
      preco: String(row.preco),
      ativo: row.ativo,
    });
    setOpen(true);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        codigo: form.codigo.trim(),
        nome: form.nome.trim(),
        unidade: form.unidade.trim(),
        preco: Number(form.preco),
        ativo: form.ativo,
      };
      if (editing) await produtosApi.update(editing.id, payload);
      else await produtosApi.create(payload);
      setOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(row: Produto) {
    if (!confirm(`Excluir/desativar produto "${row.nome}"?`)) return;
    try {
      await produtosApi.remove(row.id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  }

  return (
    <section>
      <h1 className="module-title">PRODUTOS</h1>
      <div className="crud-toolbar">
        <input
          placeholder="Buscar código ou nome"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setPage(1);
              void load(q, 1);
            }
          }}
        />
        <button
          type="button"
          className="btn-ghost"
          onClick={() => {
            setPage(1);
            void load(q, 1);
          }}
        >
          Buscar
        </button>
        <button type="button" className="btn-primary" onClick={openCreate}>
          Novo produto
        </button>
      </div>
      {error ? <p className="page-error">{error}</p> : null}
      <table className="data-table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Nome</th>
            <th>Unidade</th>
            <th>Preço</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.codigo}</td>
              <td>{row.nome}</td>
              <td>{row.unidade}</td>
              <td>{money(row.preco)}</td>
              <td>
                <span className={`badge ${row.ativo ? 'badge-ok' : 'badge-off'}`}>
                  {row.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </td>
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
              <td colSpan={6}>Nenhum produto nesta página.</td>
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
        title={editing ? 'Editar produto' : 'Novo produto'}
        open={open}
        onClose={() => setOpen(false)}
      >
        <form className="form-grid" onSubmit={onSubmit}>
          <label>
            Código *
            <input
              required
              value={form.codigo}
              onChange={(e) => setForm({ ...form, codigo: e.target.value })}
            />
          </label>
          <label>
            Nome *
            <input
              required
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
            />
          </label>
          <label>
            Unidade *
            <input
              required
              value={form.unidade}
              onChange={(e) => setForm({ ...form, unidade: e.target.value })}
            />
          </label>
          <label>
            Preço *
            <input
              required
              type="number"
              min={0}
              step="0.01"
              value={form.preco}
              onChange={(e) => setForm({ ...form, preco: e.target.value })}
            />
          </label>
          <label>
            Ativo
            <select
              value={form.ativo ? '1' : '0'}
              onChange={(e) => setForm({ ...form, ativo: e.target.value === '1' })}
            >
              <option value="1">Sim</option>
              <option value="0">Não</option>
            </select>
          </label>
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
