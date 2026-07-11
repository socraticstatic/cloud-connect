import { ReactNode, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
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
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleExpand = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <div className={className}>
      <h2 className="text-figma-sm font-medium text-fw-bodyLight tracking-[-0.03em] mb-4">{title}</h2>
      <div className="space-y-2">
        {categories.map((category) => {
          const Icon = category.icon;
          const isSelected = selectedCategories.includes(category.id);
          const isExpanded = expandedCategories.includes(category.id);

          return (
            <div key={category.id}>
              <button
                className={`
                  w-full flex items-center text-left gap-2 px-3 py-2.5 no-rounded border-l-2 transition-all duration-200
                  ${isSelected
                    ? 'border-fw-active text-fw-link'
                    : 'border-transparent text-fw-heading hover:text-fw-body hover:border-fw-secondary'
                  }
                `}
                onClick={() => onCategoryToggle(category.id)}
              >
                <span className="flex-1 text-figma-base font-medium leading-snug text-left">{category.name}</span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(category.id);
                  }}
                  className="p-0.5 cursor-pointer hover:bg-fw-wash transition-colors flex-shrink-0"
                >
                  {isExpanded
                    ? <ChevronDown className="h-4 w-4" />
                    : <ChevronRight className="h-4 w-4" />
                  }
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
