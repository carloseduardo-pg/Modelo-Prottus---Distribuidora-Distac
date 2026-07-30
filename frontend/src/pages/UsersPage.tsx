import { useEffect, useState, type FormEvent } from 'react';
import { DataTable } from '../components/DataTable';
import { FilterBar } from '../components/FilterBar';
import { Modal } from '../components/Modal';
import { StatusToggle } from '../components/StatusToggle';
import { usersApi, type User } from '../lib/resources';

const empty = { name: '', email: '', password: '', active: true };

/** Users CRUD backed by the English `/users` resource. */
export function UsersPage() {
  const [rows, setRows] = useState<User[]>([]); const [page, setPage] = useState(1); const [total, setTotal] = useState(0);
  const [search, setSearch] = useState(''); const [draft, setDraft] = useState(''); const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState(empty); const [open, setOpen] = useState(false); const [error, setError] = useState(''); const pageSize = 20;
  async function load(nextPage = page, nextSearch = search) { try { const result = await usersApi.list({ page: nextPage, pageSize, search: nextSearch }); setRows(result.data); setTotal(result.total); setPage(result.page); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Erro ao carregar usuários'); } }
  useEffect(() => { void load(); }, []);
  function edit(row?: User) { setEditing(row ?? null); setForm(row ? { name: row.name, email: row.email, password: '', active: row.active } : empty); setError(''); setOpen(true); }
  async function save() {
    if (!form.name.trim() || !form.email.trim() || (!editing && !form.password)) { setError('Preencha os campos obrigatórios'); return; }
    const payload = { name: form.name.trim(), email: form.email.trim(), active: form.active, ...(form.password ? { password: form.password } : {}) };
    try { if (editing) await usersApi.update(editing.id, payload); else await usersApi.create({ ...payload, password: form.password }); setOpen(false); await load(); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Erro ao salvar usuário'); }
  }
  function filter(event: FormEvent) { event.preventDefault(); setSearch(draft); void load(1, draft); }
  return <section><h1 className="module-title">USUÁRIOS</h1>
    <FilterBar onSubmit={filter} onClear={() => { setDraft(''); setSearch(''); void load(1, ''); }} actions={<button type="button" className="btn btn-primary" onClick={() => edit()}>Novo</button>}><input placeholder="Nome ou e-mail" value={draft} onChange={(event) => setDraft(event.target.value)} /></FilterBar>
    {error ? <p className="form-error">{error}</p> : null}
    <DataTable rows={rows} rowKey={(row) => row.id} columns={[{ key: 'name', header: 'Nome', render: (row) => row.name }, { key: 'email', header: 'E-mail', render: (row) => row.email }, { key: 'active', header: 'Status', render: (row) => <span className={`badge ${row.active ? 'badge--success' : 'badge--danger'}`}>{row.active ? 'ATIVO' : 'INATIVO'}</span> }, { key: 'actions', header: 'Ações', render: (row) => <div className="row-actions"><button className="btn btn-ghost" onClick={() => edit(row)}>Editar</button><button className="btn btn-ghost" onClick={() => void usersApi.remove(row.id).then(() => load())}>Desativar</button></div> }]} />
    <div className="pagination"><span>{total} registro(s) — página {page}</span><button className="btn btn-outline" disabled={page <= 1} onClick={() => void load(page - 1)}>Anterior</button><button className="btn btn-outline" disabled={page * pageSize >= total} onClick={() => void load(page + 1)}>Próxima</button></div>
    <Modal open={open} title={editing ? 'Editar usuário' : 'Novo usuário'} onClose={() => setOpen(false)} footer={<><button className="btn btn-outline" onClick={() => setOpen(false)}>Cancelar</button><button className="btn btn-primary" onClick={() => void save()}>Salvar</button></>}>{error ? <div className="form-error">{error}</div> : null}<div className="form-field"><label>Nome *</label><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></div><div className="form-field"><label>E-mail *</label><input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></div><div className="form-field"><label>Senha {!editing ? '*' : ''}</label><input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></div><div className="form-field"><label>Status *</label><StatusToggle active={form.active} onChange={(active) => setForm({ ...form, active })} /></div></Modal>
  </section>;
}
