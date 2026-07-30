import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../lib/resources';
import type { DashboardSummary } from '../lib/types';

const tiles = [
  { to: '/pedidos', title: 'Pedidos', description: 'Registrar e acompanhar vendas' },
  { to: '/clientes', title: 'Clientes', description: 'Gerenciar lojas atendidas' },
  { to: '/produtos', title: 'Produtos', description: 'Manter o catálogo Distac' },
  { to: '/usuarios', title: 'Usuários', description: 'Gerenciar vendedores internos' },
];

/** Module hub with optional dashboard-summary cards. */
export function HubPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  useEffect(() => { void dashboardApi.summary().then(setSummary).catch(() => setSummary(null)); }, []);
  return <section>
    <h1 className="module-title">INÍCIO</h1>
    {summary ? <div className="summary-grid"><Link to="/clientes" className="summary-card"><span>CLIENTES</span><strong>{summary.clients}</strong></Link><Link to="/produtos" className="summary-card"><span>PRODUTOS</span><strong>{summary.products}</strong></Link><Link to="/pedidos" className="summary-card"><span>PEDIDOS</span><strong>{summary.orders}</strong></Link></div> : null}
    <div className="tile-grid">{tiles.map((tile) => <Link key={tile.to} to={tile.to} className="tile"><strong>{tile.title}</strong><span>{tile.description}</span></Link>)}</div>
  </section>;
}
