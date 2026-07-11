import { ReactNode, useState, useRef, useMemo, useCallback } from 'react';
import { ChevronUp, ChevronDown, Settings } from 'lucide-react';
import { ColumnVisibilityPopover, ColumnDefinition } from './ColumnVisibilityPopover';
import { useColumnVisibility } from '../../hooks/useColumnVisibility';
import { OverflowMenu } from './OverflowMenu';

/**
 * DataTable - The standard table component.
 *
 * Pattern (from Connections ListView):
 * - Hub: rounded-lg border border-fw-secondary overflow-hidden
 * - Optional toolbar slot (SearchFilterBar) inside border, above headers
 * - <table> with table-fixed, w-full
 * - <thead> with bg-fw-wash, border-b, sortable headers with chevrons
 * - Gear icon column with ColumnVisibilityPopover
 * - <tbody> with divide-y for row separators
 * - Rows with hover:bg-fw-wash, transition-colors
 * - Cells with px-6, overflow-hidden, text-ellipsis
 * - Actions column w-16 with flex justify-end for overflow menu
 */

export interface DataTableColumn<T> {
  id: string;
  label: string;
  sortable?: boolean;
  render: (item: T) => ReactNode;
}

export interface DataTableAction {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: 'danger';
}

interface DataTableProps<T> {
  tableId: string;
  columns: DataTableColumn<T>[];
  data: T[];
  keyField: keyof T;
  toolbar?: ReactNode;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (field: string) => void;
  onRowClick?: (item: T) => void;
  actions?: (item: T) => DataTableAction[];
  emptyState?: ReactNode;
}

export function DataTable<T>({
  tableId,
  columns,
  data,
  keyField,
  toolbar,
  sortField,
  sortDirection = 'asc',
  onSort,
  onRowClick,
  actions,
  emptyState,
}: DataTableProps<T>) {
  const [showColumnPopover, setShowColumnPopover] = useState(false);
  const columnButtonRef = useRef<HTMLButtonElement>(null);
  const { isVisible, visibleColumns } = useColumnVisibility(tableId);

  const allColumnDefs: ColumnDefinition[] = useMemo(
    () => columns.map(c => ({ id: c.id, label: c.label })),
    [columns]
  );

  const displayColumns = useMemo(
    () => visibleColumns.length === 0 ? columns : columns.filter(c => isVisible(c.id)),
    [columns, visibleColumns, isVisible]
  );

  const handleHeaderClick = useCallback(
    (col: DataTableColumn<T>) => {
      if (col.sortable && onSort) onSort(col.id);
    },
    [onSort]
  );

  return (
    <div className="rounded-lg border border-fw-secondary overflow-hidden">
      {/* Toolbar (SearchFilterBar) inside border */}
      {toolbar && (
        <div className="px-6 py-4 border-b border-fw-secondary">
          {toolbar}
        </div>
      )}

      {/* Table */}
      <table className="w-full table-fixed">
        <thead className="bg-fw-wash border-b border-fw-secondary">
          <tr>
            {displayColumns.map((col) => {
              const isSorted = sortField === col.id;
              return (
                <th
                  key={col.id}
                  scope="col"
                  className="px-6 h-12 text-left text-[14px] font-medium text-fw-heading whitespace-nowrap overflow-hidden text-ellipsis align-middle"
                >
                  {col.sortable && onSort ? (
                    <button
                      onClick={() => handleHeaderClick(col)}
                      className="group inline-flex items-center space-x-1"
                    >
                      <span>{col.label}</span>
                      <span className="flex flex-col">
                        <ChevronUp
                          className={`h-3 w-3 ${
                            isSorted && sortDirection === 'asc'
                              ? 'text-fw-body'
                              : 'text-fw-bodyLight group-hover:text-fw-body'
                          }`}
                        />
                        <ChevronDown
                          className={`h-3 w-3 -mt-1 ${
                            isSorted && sortDirection === 'desc'
                              ? 'text-fw-body'
                              : 'text-fw-bodyLight group-hover:text-fw-body'
                          }`}
                        />
                      </span>
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              );
            })}
            {/* Gear / Actions column */}
            <th scope="col" className="w-16 px-6 h-12 align-middle">
              <div className="flex justify-end">
                <button
                  ref={columnButtonRef}
                  onClick={() => setShowColumnPopover(!showColumnPopover)}
                  className="p-2 text-fw-bodyLight hover:text-fw-body rounded-full hover:bg-fw-neutral transition-colors"
                  title="Manage Columns"
                >
                  <Settings className="h-5 w-5" />
                </button>
              </div>
            </th>
          </tr>
        </thead>

        <tbody className="bg-fw-base divide-y divide-fw-secondary">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={displayColumns.length + 1}
                className="px-6 py-4 text-center text-[14px] text-fw-bodyLight"
              >
                {emptyState || 'No data available'}
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr
                key={String(item[keyField])}
                onClick={() => onRowClick?.(item)}
                className={`hover:bg-fw-wash transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {displayColumns.map((col) => (
                  <td
                    key={col.id}
                    className="px-6 py-4 text-[14px] text-fw-body whitespace-nowrap overflow-hidden text-ellipsis"
                  >
                    {col.render(item)}
                  </td>
                ))}
                <td className="w-16 px-6 py-4">
                  <div className="flex justify-end" onClick={e => e.stopPropagation()}>
                    {actions && (
                      <OverflowMenu items={actions(item)} />
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Column Visibility Popover */}
      {showColumnPopover && (
        <ColumnVisibilityPopover
          tableId={tableId}
          allColumns={allColumnDefs}
          onClose={() => setShowColumnPopover(false)}
          anchorEl={columnButtonRef.current}
        />
      )}
    </div>
  );
}
