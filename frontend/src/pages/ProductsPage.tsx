import { useEffect, useState, type FormEvent } from 'react';
import { DataTable } from '../components/DataTable';
import { FilterBar } from '../components/FilterBar';
import { Modal } from '../components/Modal';
import { StatusToggle } from '../components/StatusToggle';
import { productsApi } from '../lib/resources';
import { money, type Product } from '../lib/types';

const empty = { sku: '', name: '', unit: 'UN', price: '', active: true };

/** Products CRUD backed by the English `/products` resource. */
export function ProductsPage() {
  const [rows, setRows] = useState<Product[]>([]); const [page, setPage] = useState(1); const [total, setTotal] = useState(0);
  const [search, setSearch] = useState(''); const [draft, setDraft] = useState(''); const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(empty); const [open, setOpen] = useState(false); const [error, setError] = useState(''); const pageSize = 20;
  async function load(nextPage = page, nextSearch = search) {
    try { const result = await productsApi.list({ page: nextPage, pageSize, search: nextSearch }); setRows(result.data); setTotal(result.total); setPage(result.page); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Erro ao carregar produtos'); }
  }
  useEffect(() => { void load(); }, []);
  function create() { setEditing(null); setForm(empty); setError(''); setOpen(true); }
  function edit(row: Product) { setEditing(row); setForm({ sku: row.sku, name: row.name, unit: row.unit, price: String(row.price), active: row.active }); setError(''); setOpen(true); }
  async function save() {
    if (!form.sku.trim() || !form.name.trim() || !form.unit.trim() || !form.price || Number.isNaN(Number(form.price))) { setError('Preencha: SKU, Nome, Unidade e Preço'); return; }
    const payload = { sku: form.sku.trim(), name: form.name.trim(), unit: form.unit.trim(), price: Number(form.price), active: form.active };
    try { if (editing) await productsApi.update(editing.id, payload); else await productsApi.create(payload); setOpen(false); await load(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Erro ao salvar produto'); }
  }
  function filter(event: FormEvent) { event.preventDefault(); setSearch(draft); void load(1, draft); }
  return <section>
    <h1 className="module-title">PRODUTOS</h1>
    <FilterBar onSubmit={filter} onClear={() => { setDraft(''); setSearch(''); void load(1, ''); }} actions={<button type="button" className="btn btn-primary" onClick={create}>Novo</button>}><input placeholder="SKU ou nome" value={draft} onChange={(event) => setDraft(event.target.value)} /></FilterBar>
    {error ? <p className="form-error">{error}</p> : null}
    <DataTable rows={rows} rowKey={(row) => row.id} columns={[
      { key: 'sku', header: 'SKU', render: (row) => row.sku }, { key: 'name', header: 'Nome', render: (row) => row.name }, { key: 'unit', header: 'Unidade', render: (row) => row.unit }, { key: 'price', header: 'Preço', render: (row) => money(row.price) },
      { key: 'active', header: 'Status', render: (row) => <span className={`badge ${row.active ? 'badge--success' : 'badge--danger'}`}>{row.active ? 'ATIVO' : 'INATIVO'}</span> },
      { key: 'actions', header: 'Ações', render: (row) => <div className="row-actions"><button className="btn btn-ghost" onClick={() => edit(row)}>Editar</button><button className="btn btn-ghost" onClick={() => void productsApi.remove(row.id).then(() => load())}>Desativar</button></div> },
    ]} />
    <div className="pagination"><span>{total} registro(s) — página {page}</span><button className="btn btn-outline" disabled={page <= 1} onClick={() => void load(page - 1)}>Anterior</button><button className="btn btn-outline" disabled={page * pageSize >= total} onClick={() => void load(page + 1)}>Próxima</button></div>
    <Modal open={open} title={editing ? 'Editar produto' : 'Novo produto'} onClose={() => setOpen(false)} footer={<><button className="btn btn-outline" onClick={() => setOpen(false)}>Cancelar</button><button className="btn btn-primary" onClick={() => void save()}>Salvar</button></>}>
      {(['sku', 'name', 'unit'] as const).map((field) => <div className="form-field" key={field}><label>{({ sku: 'SKU *', name: 'Nome *', unit: 'Unidade *' })[field]}</label><input value={form[field]} onChange={(event) => setForm({ ...form, [field]: event.target.value })} /></div>)}
      <div className="form-field"><label>Preço *</label><input type="number" min="0" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} /></div>
      <div className="form-field"><label>Status *</label><StatusToggle active={form.active} onChange={(active) => setForm({ ...form, active })} /></div>
    </Modal>
  </section>;
}
