import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Icon } from '../components/Icon';
import './AppShell.css';

const nav = [
  { to: '/', label: 'Início', icon: 'home' as const, end: true },
  { to: '/clientes', label: 'Clientes', icon: 'users' as const },
  { to: '/produtos', label: 'Produtos', icon: 'box' as const },
  { to: '/pedidos', label: 'Pedidos', icon: 'cart' as const },
  { to: '/usuarios', label: 'Usuários', icon: 'users' as const },
];

/** Layout autenticado: sidebar + topbar + Outlet das rotas de negócio. */
export function AppShell() {
  const { user, logout } = useAuth();

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img src="/assets/distac.png" alt="Distac" className="sidebar-logo" />
        </div>
        <nav className="sidebar-nav">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                isActive ? 'nav-item active' : 'nav-item'
              }
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="shell-main">
        <header className="topbar">
          <div className="topbar-title">DISTAC — VENDAS INTERNAS</div>
          <div className="topbar-user">
            <span>{user?.name}</span>
            <button type="button" className="btn-ghost" onClick={() => logout()}>
              <Icon name="logout" size={16} />
              Sair
            </button>
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
