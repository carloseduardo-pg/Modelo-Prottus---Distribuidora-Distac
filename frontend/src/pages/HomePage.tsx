import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Icon } from '../components/Icon';
import { dashboardApi } from '../lib/resources';
import { money, type DashboardSummary } from '../lib/types';
import './HomePage.css';

export function HomePage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await dashboardApi.summary();
        if (alive) setSummary(data);
      } catch (e) {
        if (alive) {
          setError(e instanceof Error ? e.message : 'Falha ao carregar resumo');
        }
      } finally {
        if (alive) setLoading(false);
      }
    }
    void load();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className="home">
      <header className="home-intro">
        <p className="home-kicker">Distribuidora Distac · Pernambuco</p>
        <h1 className="module-title">VENDAS INTERNAS</h1>
        <p className="home-lead">
          Olá, <strong>{user?.name || 'vendedor'}</strong>. Este sistema apoia o
          time interno da Distac no cadastro de lojas clientes, no catálogo de
          materiais de construção e no registro de pedidos com itens — do
          rascunho à confirmação.
        </p>
      </header>

      <div className="home-metrics" aria-live="polite">
        {loading ? (
          <p className="home-muted">Carregando números do banco…</p>
        ) : error ? (
          <p className="home-error">{error}</p>
        ) : summary ? (
          <>
            <Link to="/clientes" className="metric">
              <span className="metric-label">Clientes</span>
              <span className="metric-value">{summary.clientes}</span>
              <span className="metric-hint">Lojas cadastradas</span>
            </Link>
            <Link to="/produtos" className="metric">
              <span className="metric-label">Produtos</span>
              <span className="metric-value">{summary.produtos}</span>
              <span className="metric-hint">Itens no catálogo</span>
            </Link>
            <Link to="/pedidos" className="metric">
              <span className="metric-label">Pedidos</span>
              <span className="metric-value">{summary.pedidos}</span>
              <span className="metric-hint">
                {summary.confirmados} confirmados · {summary.rascunhos} rascunhos
              </span>
            </Link>
          </>
        ) : null}
      </div>

      <div className="home-grid">
        <section className="home-block">
          <h2 className="home-block-title">O QUE O SISTEMA FAZ</h2>
          <ul className="home-list">
            <li>
              Mantém o cadastro das <strong>lojas clientes</strong> (CNPJ,
              cidade, contato).
            </li>
            <li>
              Organiza o <strong>catálogo de produtos</strong> com código,
              unidade e preço de referência.
            </li>
            <li>
              Registra <strong>pedidos de venda</strong> com várias linhas
              (produto, quantidade, preço e subtotal).
            </li>
            <li>
              Controla o status do pedido:{' '}
              <strong>rascunho</strong>, <strong>confirmado</strong> ou{' '}
              <strong>cancelado</strong>.
            </li>
          </ul>
        </section>

        <section className="home-block">
          <h2 className="home-block-title">COMO USAR</h2>
          <ol className="home-steps">
            <li>
              <span className="step-num">1</span>
              <div>
                <strong>Cadastre ou revise clientes</strong>
                <p>Lojas de material de construção atendidas pela Distac.</p>
              </div>
            </li>
            <li>
              <span className="step-num">2</span>
              <div>
                <strong>Mantenha o catálogo de produtos</strong>
                <p>Preço e unidade usados ao montar o pedido.</p>
              </div>
            </li>
            <li>
              <span className="step-num">3</span>
              <div>
                <strong>Crie o pedido</strong>
                <p>
                  Escolha o cliente, adicione itens e avance o status quando a
                  venda estiver fechada.
                </p>
              </div>
            </li>
          </ol>
        </section>
      </div>

      <section className="home-block">
        <h2 className="home-block-title">MÓDULOS</h2>
        <div className="home-modules">
          <Link to="/clientes" className="module-link">
            <Icon name="users" size={20} />
            <div>
              <strong>Clientes</strong>
              <p>CRUD de lojas — busca, incluir, editar e desativar.</p>
            </div>
          </Link>
          <Link to="/produtos" className="module-link">
            <Icon name="box" size={20} />
            <div>
              <strong>Produtos</strong>
              <p>CRUD do catálogo — código, unidade e preço.</p>
            </div>
          </Link>
          <Link to="/pedidos" className="module-link">
            <Icon name="cart" size={20} />
            <div>
              <strong>Pedidos</strong>
              <p>Vendas com itens, totais e filtro por status.</p>
            </div>
          </Link>
        </div>
      </section>

      <section className="home-block">
        <div className="home-block-head">
          <h2 className="home-block-title">PEDIDOS RECENTES</h2>
          <Link to="/pedidos" className="home-link-all">
            Ver todos
          </Link>
        </div>
        {loading ? (
          <p className="home-muted">Carregando…</p>
        ) : summary && summary.recentes.length > 0 ? (
          <table className="home-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Cliente</th>
                <th>Status</th>
                <th>Itens</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {summary.recentes.map((p) => (
                <tr key={p.id}>
                  <td>{new Date(p.data).toLocaleDateString('pt-BR')}</td>
                  <td>
                    {p.cliente && 'nome' in p.cliente
                      ? p.cliente.nome
                      : p.clienteId}
                  </td>
                  <td>
                    <span className={`badge badge-${p.status}`}>{p.status}</span>
                  </td>
                  <td>{p.itensCount ?? p.itens?.length ?? 0}</td>
                  <td>{money(p.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="home-muted">
            Nenhum pedido ainda. Vá em <Link to="/pedidos">Pedidos</Link> e
            registre o primeiro.
          </p>
        )}
      </section>
    </section>
  );
}
