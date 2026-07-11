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
      <h2 className="text-figma-base font-medium text-fw-heading tracking-[-0.03em] mb-4">Featured Collections</h2>
      <div className="grid grid-cols-1 gap-3">
        {collections.map((collection) => {
          const Icon = collection.icon;
          const isSelected = selectedCategories.includes(collection.id);

          return (
            <button
              key={collection.id}
              className={`
                p-3 rounded-2xl text-left transition-all duration-200
                border border-fw-secondary hover:shadow-sm hover:border-fw-secondary
                ${isSelected ? `bg-${collection.color}-50 border-${collection.color}-200` : 'bg-fw-base'}
              `}
              onClick={() => onCategoryToggle(collection.id)}
            >
              <div className="flex items-start space-x-3">
                <div className={`w-10 h-10 rounded-lg bg-${collection.color}-50 text-${collection.color}-600 flex items-center justify-center shrink-0`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-figma-base font-medium text-fw-heading">{collection.name}</h3>
                  <p className="text-figma-sm text-fw-bodyLight line-clamp-2 mt-1">{collection.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
