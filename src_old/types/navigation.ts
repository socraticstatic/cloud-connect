import { ReactNode } from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon?: LucideIcon;
  subItems?: NavigationItem[];
}

export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  count?: number;
  disabled?: boolean;
  category?: string;
}