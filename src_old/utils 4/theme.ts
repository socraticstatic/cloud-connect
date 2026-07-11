/**
 * Utility functions for working with design tokens and themes
 */

/**
 * Sets a CSS custom property on the document root
 * @param property - The CSS property name (without --) 
 * @param value - The value to set
 */
function setCSSVariable(property: string, value: string): void {
  document.documentElement.style.setProperty(`--${property}`, value);
}

/**
 * Gets a CSS custom property from the document root
 * @param property - The CSS property name (without --)
 * @returns The property value
 */
function getCSSVariable(property: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(`--${property}`)
    .trim();
}

/**
 * Applies a theme by setting multiple CSS variables at once
 * @param theme - Object containing property-value pairs
 */
export function applyTheme(theme: Record<string, string>): void {
  Object.entries(theme).forEach(([property, value]) => {
    setCSSVariable(property, value);
  });
}

/**
 * Converts a hex color to RGB values
 * @param hex - Hex color code
 * @returns RGB values as an object
 */
function hexToRGB(hex: string): { r: number; g: number; b: number } {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return { r, g, b };
}

/**
 * Creates a CSS rgba color string
 * @param hex - Hex color code
 * @param alpha - Alpha value (0-1)
 * @returns CSS rgba string
 */
function hexToRGBA(hex: string, alpha: number): string {
  const { r, g, b } = hexToRGB(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Determines if a color is light or dark
 * @param hex - Hex color code
 * @returns Boolean indicating if color is light
 */
function isLightColor(hex: string): boolean {
  const { r, g, b } = hexToRGB(hex);
  // Calculate perceived brightness using the formula: (0.299*R + 0.587*G + 0.114*B)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128;
}

/**
 * Gets appropriate text color (black or white) based on background color
 * @param bgHex - Background color hex code
 * @returns Text color hex code
 */
function getContrastTextColor(bgHex: string): string {
  return isLightColor(bgHex) ? '#000000' : '#ffffff';
}