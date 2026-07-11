import { useState } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onSearch?: (query: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  const clearSearch = () => {
    setSearchQuery('');
    onSearch?.('');
  };

  return (
    <div className="relative">
      {showSearch ? (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-full md:w-[400px] animate-in slide-in-from-right-5">
          <div className="relative">
            <input
              type="text"
              placeholder="Search connections, settings, documentation..."
              className="w-full pl-11 pr-10 py-2.5 text-sm bg-fw-wash border border-fw-secondary rounded-lg
                focus:outline-none focus:ring-2 focus:ring-fw-active focus:border-transparent
                placeholder:text-fw-bodyLight"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onBlur={() => !searchQuery && setShowSearch(false)}
              autoFocus
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-fw-bodyLight" />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-fw-neutral transition-colors"
              >
                <X className="h-4 w-4 text-fw-bodyLight" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowSearch(true)}
          className="p-2 text-fw-bodyLight hover:text-fw-body hover:bg-fw-wash rounded-lg transition-colors duration-200"
        >
          <Search className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}