import { ReactNode } from 'react';
import { MarketplaceCategory } from '../../types/connection';

interface CategoryGridProps {
  categories: MarketplaceCategory[];
  selectedCategories: string[];
  onCategoryToggle: (categoryId: string) => void;
  title?: string;
  className?: string;
}

export function CategoryGrid({
  categories,
  selectedCategories,
  onCategoryToggle,
  title = "Categories",
  className = ""
}: CategoryGridProps) {
  return (
    <div className={className}>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
      <div className="grid grid-cols-2 gap-3">
        {categories.map((category) => {
          const Icon = category.icon;
          const isSelected = selectedCategories.includes(category.id);
          
          return (
            <button
              key={category.id}
              className={`
                p-3 rounded-lg text-left transition-all duration-200
                border border-gray-100 hover:shadow-sm hover:border-gray-200
                ${isSelected ? `bg-${category.color}-50 border-${category.color}-200` : 'bg-white'}
              `}
              onClick={() => onCategoryToggle(category.id)}
            >
              <div className={`p-2 rounded-lg bg-${category.color}-50 text-${category.color}-600 w-fit mb-2`}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-medium text-gray-900">{category.name}</h3>
              <p className="text-xs text-gray-500 line-clamp-1 mt-1">{category.description}</p>
              {category.count > 0 && (
                <div className="mt-2">
                  <span className={`text-xs font-medium rounded-full px-2 py-0.5 bg-${category.color}-50 text-${category.color}-700`}>
                    {category.count} item{category.count !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}