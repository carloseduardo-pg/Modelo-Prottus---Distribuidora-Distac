/** Controles simples de paginação. */
export function PaginationBar({
  page,
  totalPages,
  total,
  onChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) {
    return (
      <p className="pagination-info">
        {total} registro{total === 1 ? '' : 's'}
      </p>
    );
  }
  return (
    <div className="pagination-bar">
      <span>
        Página {page} de {totalPages} · {total} registro{total === 1 ? '' : 's'}
      </span>
      <div className="pagination-actions">
        <button
          type="button"
          className="btn-ghost"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          Anterior
        </button>
        <button
          type="button"
          className="btn-ghost"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
        >
          Próxima
        </button>
      </div>
    </div>
  );
}
