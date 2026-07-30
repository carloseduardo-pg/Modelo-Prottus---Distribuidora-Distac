import { useEffect, useState, type FormEvent } from 'react';
import { DataTable } from '../components/DataTable';
import { FilterBar } from '../components/FilterBar';
import { Modal } from '../components/Modal';
import { PaginationBar } from '../components/PaginationBar';
import { StatusToggle } from '../components/StatusToggle';
import { clientsApi } from '../lib/resources';
import type { Client } from '../lib/types';

const empty = {
  name: '',
  document: '',
  phone: '',
  email: '',
  city: '',
  state: 'PE',
  active: true,
};
const pageSize = 20;

/** Clients CRUD backed by the English `/clients` resource. */
export function ClientsPage() {
  const [rows, setRows] = useState<Client[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');

  async function load(nextPage = page, nextSearch = search) {
    try {
      const result = await clientsApi.list({
        page: nextPage,
        pageSize,
        search: nextSearch,
      });
      setRows(result.data);
      setTotal(result.total);
      setPage(result.page);
      setError('');
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Erro ao carregar clientes',
      );
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function create() {
    setEditing(null);
    setForm(empty);
    setError('');
    setOpen(true);
  }

  function edit(row: Client) {
    setEditing(row);
    setForm({
      name: row.name,
      document: row.document,
      phone: row.phone ?? '',
      email: row.email ?? '',
      city: row.city ?? '',
      state: row.state ?? 'PE',
      active: row.active,
    });
    setError('');
    setOpen(true);
  }

  async function save() {
    if (!form.name.trim() || !form.document.trim()) {
      setError('Preencha: Nome, Documento');
      return;
    }
    const payload = {
      ...form,
      name: form.name.trim(),
      document: form.document.trim(),
      phone: form.phone || undefined,
      email: form.email || null,
      city: form.city || undefined,
      state: form.state || undefined,
    };
    try {
      if (editing) await clientsApi.update(editing.id, payload);
      else await clientsApi.create(payload);
      setOpen(false);
      await load();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Erro ao salvar cliente',
      );
    }
  }

  function filter(event: FormEvent) {
    event.preventDefault();
    setSearch(draft);
    void load(1, draft);
  }

  return (
    <section>
      <h1 className="module-title">CLIENTES</h1>
      <FilterBar
        onSubmit={filter}
        onClear={() => {
          setDraft('');
          setSearch('');
          void load(1, '');
        }}
        actions={
          <button type="button" className="btn btn-primary" onClick={create}>
            Novo
          </button>
        }
      >
        <input
          placeholder="Nome, documento ou cidade"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
      </FilterBar>
      {error && !open ? <p className="form-error">{error}</p> : null}
      <DataTable
        rows={rows}
        rowKey={(row) => row.id}
        columns={[
          { key: 'name', header: 'Nome', render: (row) => row.name },
          { key: 'document', header: 'Documento', render: (row) => row.document },
          { key: 'city', header: 'Cidade', render: (row) => row.city ?? '—' },
          { key: 'phone', header: 'Telefone', render: (row) => row.phone ?? '—' },
          {
            key: 'active',
            header: 'Status',
            render: (row) => (
              <span
                className={`badge ${row.active ? 'badge--success' : 'badge--danger'}`}
              >
                {row.active ? 'ATIVO' : 'INATIVO'}
              </span>
            ),
          },
          {
            key: 'actions',
            header: 'Ações',
            render: (row) => (
              <div className="row-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => edit(row)}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() =>
                    void clientsApi.remove(row.id).then(() => load())
                  }
                >
                  Desativar
                </button>
              </div>
            ),
          },
        ]}
      />
      <PaginationBar
        page={page}
        pageSize={pageSize}
        total={total}
        onChange={(next) => void load(next)}
      />
      <Modal
        open={open}
        title={editing ? 'Editar cliente' : 'Novo cliente'}
        onClose={() => setOpen(false)}
        footer={
          <>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => void save()}
            >
              Salvar
            </button>
          </>
        }
      >
        {error && open ? <div className="form-error">{error}</div> : null}
        {(
          [
            ['name', 'Nome *'],
            ['document', 'Documento *'],
            ['phone', 'Telefone'],
            ['email', 'E-mail'],
            ['city', 'Cidade'],
            ['state', 'UF'],
          ] as const
        ).map(([field, label]) => (
          <div className="form-field" key={field}>
            <label>{label}</label>
            <input
              type={field === 'email' ? 'email' : 'text'}
              maxLength={field === 'state' ? 2 : undefined}
              value={form[field]}
              onChange={(event) =>
                setForm({
                  ...form,
                  [field]:
                    field === 'state'
                      ? event.target.value.toUpperCase()
                      : event.target.value,
                })
              }
            />
          </div>
        ))}
        <div className="form-field">
          <label>Status *</label>
          <StatusToggle
            active={form.active}
            onChange={(active) => setForm({ ...form, active })}
          />
        </div>
      </Modal>
    </section>
  );
}
