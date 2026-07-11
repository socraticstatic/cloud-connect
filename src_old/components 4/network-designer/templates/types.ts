import { DivideIcon as LucideIcon } from 'lucide-react';
import { NetworkNode, NetworkEdge } from '../../../types';

interface PreviewIcon {
  icon: typeof LucideIcon;
  color: string;
}

export interface PreviewColumn {
  type: 'col';
  icons: PreviewIcon[];
}

export interface Template {
  name: string;
  description: string;
  preview: {
    icons: PreviewColumn[];
  };
  nodes: NetworkNode[];
  edges: NetworkEdge[];
}

interface TemplateGroup {
  name: string;
  description: string;
  templates: Template[];
}