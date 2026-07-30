import type { ReactNode } from 'react';

type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyMessage?: string;
};

/** Responsive data table used by Distac resource listing pages. */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  emptyMessage = 'Nenhum registro encontrado.',
}: DataTableProps<T>) {
  return (
    <div className="card data-table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => <th key={column.key}>{column.header}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={columns.length}>{emptyMessage}</td></tr>
          ) : rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((column) => <td key={column.key}>{column.render(row)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
