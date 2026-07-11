import { Search, X } from 'lucide-react';

interface LinkSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function LinkSearchBar({ searchQuery, setSearchQuery }: LinkSearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <input
        type="text"
        placeholder="Search links..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-9 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue text-sm"
      />
      {searchQuery && (
        <button
          onClick={() => setSearchQuery('')}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-500"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}