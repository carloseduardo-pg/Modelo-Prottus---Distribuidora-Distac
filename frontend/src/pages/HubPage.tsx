import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../lib/resources';
import { money, type DashboardSummary } from '../lib/types';

const tiles = [
  { to: '/pedidos', title: 'Pedidos', description: 'Registrar e acompanhar vendas' },
  { to: '/clientes', title: 'Clientes', description: 'Gerenciar lojas atendidas' },
  { to: '/produtos', title: 'Produtos', description: 'Manter o catálogo Distac' },
  { to: '/usuarios', title: 'Usuários', description: 'Gerenciar vendedores internos' },
];

/** Module hub with dashboard-summary cards (Design System Distac). */
export function HubPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    void dashboardApi
      .summary()
      .then(setSummary)
      .catch(() => setSummary(null));
  }, []);

  return (
    <section>
      <h1 className="module-title">INÍCIO</h1>
      {summary ? (
        <div className="summary-grid">
          <Link to="/clientes" className="summary-card">
            <span>CLIENTES</span>
            <strong>{summary.clients}</strong>
          </Link>
          <Link to="/produtos" className="summary-card">
            <span>PRODUTOS</span>
            <strong>{summary.products}</strong>
          </Link>
          <Link to="/pedidos" className="summary-card">
            <span>PEDIDOS</span>
            <strong>{summary.orders}</strong>
          </Link>
          <Link to="/pedidos" className="summary-card">
            <span>CONFIRMADOS</span>
            <strong>{summary.confirmed}</strong>
          </Link>
          <Link to="/pedidos" className="summary-card">
            <span>RASCUNHOS</span>
            <strong>{summary.drafts}</strong>
          </Link>
          <Link to="/pedidos" className="summary-card">
            <span>CANCELADOS</span>
            <strong>{summary.cancelled}</strong>
          </Link>
        </div>
      ) : null}
      <div className="tile-grid">
        {tiles.map((tile) => (
          <Link key={tile.to} to={tile.to} className="tile">
            <strong>{tile.title}</strong>
            <span>{tile.description}</span>
          </Link>
        ))}
      </div>
      {summary?.recent?.length ? (
        <section className="hub-section">
          <h2 className="module-title">PEDIDOS RECENTES</h2>
          <div className="card data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Cliente</th>
                  <th>Status</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {summary.recent.map((order) => (
                  <tr key={order.id}>
                    <td>{order.number}</td>
                    <td>{order.client?.name ?? '—'}</td>
                    <td>{order.status}</td>
                    <td>{money(order.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </section>
  );
}
