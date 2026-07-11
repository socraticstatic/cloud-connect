import { ReactNode, useState, useRef, useMemo } from 'react';
import { ChevronUp, ChevronDown, Settings } from 'lucide-react';
import { ColumnVisibilityPopover, ColumnDefinition } from './ColumnVisibilityPopover';
import { useColumnVisibility } from '../../hooks/useColumnVisibility';

interface Column<T> {
  id: string;
  label: string;
  sortable?: boolean;
  sortKey?: keyof T;
  render: (item: T) => ReactNode;
  width?: string;
  exportValue?: (item: T) => string;
}

interface BaseTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  sortField?: keyof T;
  sortDirection?: 'asc' | 'desc';
  onSort?: (field: keyof T) => void;
  onRowClick?: (item: T) => void;
  rowClassName?: (item: T) => string;
  actions?: (item: T) => ReactNode;
  emptyState?: ReactNode;
  title?: string;
  tableId?: string;
  showColumnManager?: boolean;
}

export function BaseTable<T>({
  columns,
  data,
  keyField,
  sortField,
  sortDirection,
  onSort,
  onRowClick,
  rowClassName,
  actions,
  emptyState,
  title,
  tableId,
  showColumnManager = true
}: BaseTableProps<T>) {
  const [showColumnPopover, setShowColumnPopover] = useState(false);
  const columnButtonRef = useRef<HTMLButtonElement>(null);

  // Column visibility
  const { visibleColumns, isVisible } = useColumnVisibility(tableId || 'default');

  // Filter columns based on visibility
  const filteredColumns = useMemo(() => {
    if (!tableId || visibleColumns.length === 0) {
      return columns;
    }
    return columns.filter(col => isVisible(col.id));
  }, [columns, tableId, visibleColumns, isVisible]);

  // Convert columns to column definitions for the popover
  const columnDefinitions: ColumnDefinition[] = useMemo(() => {
    return columns.map(col => ({
      id: col.id,
      label: col.label
    }));
  }, [columns]);
  return (
    <>
      {/* Table Header */}
      {title && (
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-fw-heading">{title}</h3>
        </div>
      )}

      {/* Table */}
      <div className="bg-fw-base rounded-lg border border-fw-secondary overflow-hidden">
        <div className="min-w-full divide-y divide-fw-secondary">
        <div className="bg-fw-wash">
          <div className="min-w-full table">
            <div className="table-header-group">
              <div className="table-row">
                {filteredColumns.map((column) => (
                  <div
                    key={column.id}
                    scope="col"
                    className="table-cell px-6 py-3 text-left text-xs font-medium text-fw-bodyLight uppercase tracking-wider whitespace-nowrap"
                    style={column.width ? { width: column.width } : undefined}
                    role="columnheader"
                    aria-sort={
                      column.sortKey === sortField
                        ? sortDirection === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                    }
                  >
                    {column.sortable && column.sortKey ? (
                      <button
                        onClick={() => onSort?.(column.sortKey as keyof T)}
                        className="group inline-flex items-center space-x-1"
                      >
                        <span>{column.label}</span>
                        <span className="flex flex-col">
                          <ChevronUp
                            className={`h-3 w-3 ${
                              column.sortKey === sortField && sortDirection === 'asc'
                                ? 'text-fw-body'
                                : 'text-fw-bodyLight group-hover:text-fw-body'
                            }`}
                          />
                          <ChevronDown
                            className={`h-3 w-3 -mt-1 ${
                              column.sortKey === sortField && sortDirection === 'desc'
                                ? 'text-fw-body'
                                : 'text-fw-bodyLight group-hover:text-fw-body'
                            }`}
                          />
                        </span>
                      </button>
                    ) : (
                      column.label
                    )}
                  </div>
                ))}
                <div scope="col" className="table-cell relative px-6 py-3 w-16">
                  {showColumnManager && tableId ? (
                    <div className="flex justify-end">
                      <button
                        ref={columnButtonRef}
                        onClick={() => setShowColumnPopover(!showColumnPopover)}
                        className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100 transition-colors"
                        title="Manage Columns"
                        aria-label="Manage table columns"
                      >
                        <Settings className="h-5 w-5" />
                        <span className="sr-only">{filteredColumns.length}/{columns.length} visible</span>
                      </button>
                    </div>
                  ) : (
                    actions && <span className="sr-only">Actions</span>
                  )}
                </div>
              </div>
            </div>
            <div className="table-row-group bg-fw-base divide-y divide-fw-secondary">
              {data.length === 0 ? (
                <div className="table-row">
                  <div
                    colSpan={filteredColumns.length + (actions ? 1 : 0)}
                    className="table-cell px-6 py-4 text-center text-sm text-fw-bodyLight"
                  >
                    {emptyState || 'No data available'}
                  </div>
                </div>
              ) : (
                data.map((item, rowIndex) => (
                  <div
                    key={String(item[keyField])}
                    onClick={() => onRowClick?.(item)}
                    className={`
                      table-row transition-colors duration-150
                      ${onRowClick ? 'cursor-pointer' : ''}
                      ${rowClassName?.(item) || 'hover:bg-fw-wash'}
                    `}
                    role="row"
                    aria-rowindex={rowIndex + 1}
                  >
                    {filteredColumns.map((column) => (
                      <div 
                        key={column.id} 
                        className="table-cell px-6 py-4 whitespace-nowrap"
                        role="gridcell"
                      >
                        {column.render(item)}
                      </div>
                    ))}
                    {actions && (
                      <div 
                        className="table-cell px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                        onClick={e => e.stopPropagation()}
                        role="gridcell"
                      >
                        {actions(item)}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Column Visibility Popover */}
      {showColumnPopover && tableId && (
        <ColumnVisibilityPopover
          tableId={tableId}
          allColumns={columnDefinitions}
          onClose={() => setShowColumnPopover(false)}
          anchorEl={columnButtonRef.current}
        />
      )}
    </>
  );
}