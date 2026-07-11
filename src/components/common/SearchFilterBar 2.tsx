import { ReactNode } from 'react';
import { Search, Filter, Download, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface SearchFilterBarProps {
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onFilter?: () => void;
  onExport?: () => void;
  onRefresh?: () => void;
  filterContent?: ReactNode;
  actions?: ReactNode;
  showFilter?: boolean;
  showExport?: boolean;
  isRefreshing?: boolean;
}

export function SearchFilterBar({
  searchPlaceholder = 'Search ...',
  searchValue,
  onSearchChange,
  onFilter,
  onExport,
  onRefresh,
  filterContent,
  actions,
  showFilter = true,
  showExport = true,
  isRefreshing = false,
}: SearchFilterBarProps) {
  return (
    <div className="flex items-center gap-4">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-fw-bodyLight h-5 w-5" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="fw-input pl-10"
        />
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-fw-secondary" />

      {/* Filter */}
      {showFilter && (onFilter || filterContent) && (
        filterContent || (
          <Button variant="secondary" icon={Filter} onClick={onFilter} size="md">
            Filter
          </Button>
        )
      )}

      {/* Export */}
      {showExport && onExport && (
        <Button variant="secondary" icon={Download} onClick={onExport} size="md">
          Export
        </Button>
      )}

      {/* Refresh */}
      {onRefresh && (
        <Button
          variant="ghost"
          icon={RefreshCw}
          onClick={onRefresh}
          size="md"
          disabled={isRefreshing}
          className={isRefreshing ? 'cursor-not-allowed' : ''}
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      )}

      {/* Custom actions */}
      {actions}
    </div>
  );
}
