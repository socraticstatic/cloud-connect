// Dynamic template loader to enable code splitting

interface TemplateInfo {
  id: string;
  importTemplate: () => Promise<any>;
}

// Registry of template info objects
const templateRegistry: Record<string, TemplateInfo> = {
  'cloud-router': {
    id: 'cloud-router',
    importTemplate: () => import('./cloud-router')
  },
  'vpn-to-cloud': {
    id: 'vpn-to-cloud',
    importTemplate: () => import('./vpn-to-cloud')
  },
  'internet-to-cloud': {
    id: 'internet-to-cloud',
    importTemplate: () => import('./internet-to-cloud')
  },
  'hybrid-multi-cloud': {
    id: 'hybrid-multi-cloud',
    importTemplate: () => import('./hybrid-multi-cloud')
  },
  'datacenter-cloud': {
    id: 'datacenter-cloud',
    importTemplate: () => import('./datacenter-cloud')
  },
  'cloud-to-cloud-local': {
    id: 'cloud-to-cloud-local',
    importTemplate: () => import('./cloud-to-cloud-local')
  },
  'cloud-to-cloud-inter-region': {
    id: 'cloud-to-cloud-inter-region',
    importTemplate: () => import('./cloud-to-cloud-inter-region')
  }
};

// Cache loaded templates to avoid reloading
const templateCache: Record<string, any> = {};

/**
 * Load a template by ID
 */
export async function loadTemplate(templateId: string): Promise<any> {
  // Return from cache if already loaded
  if (templateCache[templateId]) {
    return templateCache[templateId];
  }

  // Check if the template exists in the registry
  const templateInfo = templateRegistry[templateId];
  if (!templateInfo) {
    throw new Error(`Template not found: ${templateId}`);
  }

  try {
    // Dynamically import the template
    const module = await templateInfo.importTemplate();
    
    // Cache and return the template
    const template = module[Object.keys(module)[0]]; // Get the default export
    templateCache[templateId] = template;
    return template;
  } catch (error) {
    console.error(`Failed to load template: ${templateId}`, error);
    throw error;
  }
}

/**
 * Get a list of all available template IDs
 */
export function getAvailableTemplateIds(): string[] {
  return Object.keys(templateRegistry);
}

/**
 * Preload a specific template
 */
function preloadTemplate(templateId: string): void {
  if (templateRegistry[templateId]) {
    // Start loading but don't wait for completion
    templateRegistry[templateId].importTemplate().then(module => {
      const template = module[Object.keys(module)[0]];
      templateCache[templateId] = template;
    }).catch(error => {
      console.warn(`Failed to preload template: ${templateId}`, error);
    });
  }
}

/**
 * Preload frequently used templates
 */
export function preloadCommonTemplates(): void {
  // Preload the most commonly used templates
  preloadTemplate('internet-to-cloud');
  preloadTemplate('cloud-router');
}