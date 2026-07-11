import { useState, useMemo, memo, ReactNode, useRef } from 'react';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download, Settings } from 'lucide-react';
import { downloadCSV } from '../../utils/downloadCSV';
import { ColumnVisibilityPopover, ColumnDefinition } from './ColumnVisibilityPopover';
import { useColumnVisibility } from '../../hooks/useColumnVisibility';

export interface TableColumn<T> {
  id: string;
  label: string;
  sortable?: boolean;
  sortKey?: keyof T;
  width?: string;
  render: (item: T) => ReactNode;
  csvRender?: (item: T) => string;
}

interface EnhancedTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  pageSize?: number;
  showPagination?: boolean;
  stickyHeader?: boolean;
  rowActions?: (item: T) => ReactNode;
  exportFilename?: string;
  showExport?: boolean;
  tableId?: string;
  showColumnManager?: boolean;
  headerActions?: ReactNode;
}

function EnhancedTableComponent<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  emptyMessage = 'No data available',
  pageSize = 50,
  showPagination = true,
  stickyHeader = true,
  rowActions,
  exportFilename = 'export.csv',
  showExport = true,
  tableId,
  showColumnManager = true,
  headerActions,
}: EnhancedTableProps<T>) {
  const [sortField, setSortField] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showColumnPopover, setShowColumnPopover] = useState(false);
  const columnButtonRef = useRef<HTMLButtonElement>(null);

  // Column visibility
  const { visibleColumns, isVisible } = useColumnVisibility(tableId || 'default');

  // Filter columns based on visibility (only if tableId is provided)
  const filteredColumns = useMemo(() => {
    if (!tableId || visibleColumns.length === 0) {
      return columns;
    }
    const filtered = columns.filter(col => isVisible(col.id));

    // Safety check: if no columns are visible but we have columns defined,
    // show all columns (this can happen if stored column IDs don't match actual columns)
    if (filtered.length === 0 && columns.length > 0) {
      console.warn(`[EnhancedTable] No visible columns found for table ${tableId}, showing all columns`);
      return columns;
    }

    return filtered;
  }, [columns, tableId, visibleColumns, isVisible]);

  // Convert columns to column definitions for the popover
  const columnDefinitions: ColumnDefinition[] = useMemo(() => {
    return columns.map(col => ({
      id: col.id,
      label: col.label
    }));
  }, [columns]);

  const handleSort = (column: TableColumn<T>) => {
    if (!column.sortable || !column.sortKey) return;

    if (sortField === column.sortKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(column.sortKey);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const sortedData = useMemo(() => {
    if (!sortField) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const modifier = sortDirection === 'asc' ? 1 : -1;

      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue) * modifier;
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return (aValue - bValue) * modifier;
      }

      return String(aValue).localeCompare(String(bValue)) * modifier;
    });
  }, [data, sortField, sortDirection]);

  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = showPagination ? sortedData.slice(startIndex, endIndex) : sortedData;

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleExport = () => {
    // Export only visible columns
    const columnsToExport = tableId ? filteredColumns : columns;
    const headers = columnsToExport.map(col => col.label).join(',');
    const rows = sortedData.map(item => {
      return columnsToExport.map(col => {
        if (col.csvRender) {
          return `"${col.csvRender(item).replace(/"/g, '""')}"`;
        }
        const value = col.sortKey ? String(item[col.sortKey] ?? '') : '';
        return `"${value.replace(/"/g, '""')}"`;
      }).join(',');
    });

    const csv = [headers, ...rows].join('\n');
    downloadCSV(csv, exportFilename);
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="flex flex-col">
      {showExport && data.length > 0 && (
        <div className="flex justify-end items-center gap-2 mb-3">
          {showExport && (
            <button
              onClick={handleExport}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-fw-body bg-fw-base border border-fw-secondary rounded-md hover:bg-fw-wash focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fw-active"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </button>
          )}
        </div>
      )}
      <div className="w-full overflow-visible">
        <table className="w-full divide-y divide-fw-secondary">
          <thead className={`bg-fw-wash ${stickyHeader ? 'sticky top-0 z-10' : ''}`}>
            <tr>
              {filteredColumns.map((column) => (
                <th
                  key={column.id}
                  scope="col"
                  className={`px-3 py-2 text-left text-xs font-medium text-fw-bodyLight tracking-wider ${
                    column.sortable ? 'cursor-pointer select-none hover:bg-fw-neutral' : ''
                  }`}
                  onClick={() => handleSort(column)}
                  style={column.width ? { width: column.width } : undefined}
                >
                  <div className="flex items-center">
                    {column.label}
                    {column.sortable && (
                      <span className="ml-1">
                        {sortField === column.sortKey ? (
                          sortDirection === 'asc' ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )
                        ) : (
                          <div className="h-4 w-4 opacity-0 group-hover:opacity-50">
                            <ChevronUp className="h-4 w-4" />
                          </div>
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              <th scope="col" className="relative px-6 py-3 w-16">
                {(showColumnManager && tableId) || headerActions ? (
                  <div className="flex items-center justify-end gap-1">
                    {headerActions}
                    {showColumnManager && tableId && (
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
                    )}
                  </div>
                ) : (
                  rowActions && <span className="sr-only">Actions</span>
                )}
              </th>
            </tr>
          </thead>
          <tbody className="bg-fw-base divide-y divide-fw-secondary">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={filteredColumns.length + (rowActions ? 1 : 0)}
                  className="px-3 py-8 text-center text-fw-bodyLight"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => (
                <tr
                  key={keyExtractor(item)}
                  className={`hover:bg-fw-wash ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick?.(item)}
                >
                  {filteredColumns.map((column) => (
                    <td key={column.id} className="px-3 py-2 truncate">
                      {column.render(item)}
                    </td>
                  ))}
                  {rowActions && (
                    <td className="px-3 py-2 text-right text-sm font-medium whitespace-nowrap">
                      <div onClick={(e) => e.stopPropagation()}>
                        {rowActions(item)}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showPagination && totalPages > 1 && (
        <div className="px-6 py-4 border-t border-fw-secondary bg-fw-base">
          <div className="flex items-center justify-between">
            <div className="text-sm text-fw-body">
              Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
              <span className="font-medium">{Math.min(endIndex, sortedData.length)}</span> of{' '}
              <span className="font-medium">{sortedData.length}</span> results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                className="p-2 rounded-md hover:bg-fw-wash disabled:opacity-50 disabled:cursor-not-allowed"
                title="First page"
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-md hover:bg-fw-wash disabled:opacity-50 disabled:cursor-not-allowed"
                title="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex items-center space-x-1">
                {getPageNumbers().map((page, index) =>
                  typeof page === 'number' ? (
                    <button
                      key={index}
                      onClick={() => goToPage(page)}
                      className={`px-3 py-1 rounded-md text-sm ${
                        currentPage === page
                          ? 'bg-fw-ctaPrimary text-fw-linkPrimary'
                          : 'hover:bg-fw-wash text-fw-body'
                      }`}
                    >
                      {page}
                    </button>
                  ) : (
                    <span key={index} className="px-2 text-fw-bodyLight">
                      {page}
                    </span>
                  )
                )}
              </div>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-md hover:bg-fw-wash disabled:opacity-50 disabled:cursor-not-allowed"
                title="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-md hover:bg-fw-wash disabled:opacity-50 disabled:cursor-not-allowed"
                title="Last page"
              >
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Column Visibility Popover */}
      {showColumnPopover && tableId && (
        <ColumnVisibilityPopover
          tableId={tableId}
          allColumns={columnDefinitions}
          onClose={() => setShowColumnPopover(false)}
          anchorEl={columnButtonRef.current}
        />
      )}
    </div>
  );
}

export const EnhancedTable = memo(EnhancedTableComponent) as typeof EnhancedTableComponent;
