import type { FormEvent, ReactNode } from 'react';

type FilterBarProps = {
  children: ReactNode;
  onSubmit: (event: FormEvent) => void;
  onClear?: () => void;
  actions?: ReactNode;
};

/** Standard filter toolbar for paginated resource lists. */
export function FilterBar({ children, onSubmit, onClear, actions }: FilterBarProps) {
  return (
    <form className="filter-bar" onSubmit={onSubmit}>
      <span className="filter-bar__label">Filtrar por:</span>
      {children}
      <div className="filter-bar__actions">
        {onClear ? <button type="button" className="btn btn-outline" onClick={onClear}>Limpar</button> : null}
        <button type="submit" className="btn btn-primary">Filtrar</button>
        {actions}
      </div>
    </form>
  );
}
