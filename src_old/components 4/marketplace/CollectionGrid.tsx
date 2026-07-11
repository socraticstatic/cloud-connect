import { ReactNode } from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';
import { MarketplaceCategory } from '../../types/connection';

interface CollectionGridProps {
  collections: MarketplaceCategory[];
  selectedCategories: string[];
  onCategoryToggle: (categoryId: string) => void;
  className?: string;
}

export function CollectionGrid({
  collections,
  selectedCategories,
  onCategoryToggle,
  className = ""
}: CollectionGridProps) {
  return (
    <div className={className}>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Featured Collections</h2>
      <div className="grid grid-cols-1 gap-3">
        {collections.map((collection) => {
          const Icon = collection.icon;
          const isSelected = selectedCategories.includes(collection.id);
          
          return (
            <button
              key={collection.id}
              className={`
                p-3 rounded-lg text-left transition-all duration-200
                border border-gray-100 hover:shadow-sm hover:border-gray-200
                ${isSelected ? `bg-${collection.color}-50 border-${collection.color}-200` : 'bg-white'}
              `}
              onClick={() => onCategoryToggle(collection.id)}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg bg-${collection.color}-50 text-${collection.color}-600 shrink-0`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900">{collection.name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-1">{collection.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}