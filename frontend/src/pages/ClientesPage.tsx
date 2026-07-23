import { useEffect, useState, type FormEvent } from 'react';
import { Modal } from '../components/Modal';
import { PaginationBar } from '../components/PaginationBar';
import { clientesApi } from '../lib/resources';
import type { Cliente } from '../lib/types';

const empty = {
  nome: '',
  cnpj: '',
  telefone: '',
  email: '',
  cidade: '',
  ativo: true,
};

export function ClientesPage() {
  const [rows, setRows] = useState<Cliente[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState('');
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  async function load(search = q, pageNum = page) {
    setError('');
    try {
      const res = await clientesApi.list({ q: search || undefined, page: pageNum });
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

  function openEdit(row: Cliente) {
    setEditing(row);
    setForm({
      nome: row.nome,
      cnpj: row.cnpj,
      telefone: row.telefone || '',
      email: row.email || '',
      cidade: row.cidade,
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
        nome: form.nome.trim(),
        cnpj: form.cnpj.trim(),
        telefone: form.telefone.trim() || undefined,
        email: form.email.trim() || undefined,
        cidade: form.cidade.trim(),
        ativo: form.ativo,
      };
      if (editing) {
        await clientesApi.update(editing.id, payload);
      } else {
        await clientesApi.create({
          ...payload,
          telefone: payload.telefone ?? null,
          email: payload.email ?? null,
        });
      }
      setOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(row: Cliente) {
    if (!confirm(`Excluir/desativar cliente "${row.nome}"?`)) return;
    try {
      await clientesApi.remove(row.id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  }

  return (
    <section>
      <h1 className="module-title">CLIENTES</h1>
      <div className="crud-toolbar">
        <input
          placeholder="Buscar nome, CNPJ ou cidade"
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
          Novo cliente
        </button>
      </div>
      {error ? <p className="page-error">{error}</p> : null}
      <table className="data-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>CNPJ</th>
            <th>Cidade</th>
            <th>Telefone</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.nome}</td>
              <td>{row.cnpj}</td>
              <td>{row.cidade}</td>
              <td>{row.telefone || '—'}</td>
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
              <td colSpan={6}>Nenhum cliente nesta página.</td>
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
        title={editing ? 'Editar cliente' : 'Novo cliente'}
        open={open}
        onClose={() => setOpen(false)}
      >
        <form className="form-grid" onSubmit={onSubmit}>
          <label>
            Nome *
            <input
              required
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
            />
          </label>
          <label>
            CNPJ *
            <input
              required
              minLength={14}
              value={form.cnpj}
              onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
            />
          </label>
          <label>
            Cidade *
            <input
              required
              value={form.cidade}
              onChange={(e) => setForm({ ...form, cidade: e.target.value })}
            />
          </label>
          <label>
            Telefone
            <input
              value={form.telefone}
              onChange={(e) => setForm({ ...form, telefone: e.target.value })}
            />
          </label>
          <label>
            E-mail
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
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
