/**
 * Slug utilities for generating friendly URLs
 * Supports Hebrew character slugs (modern browsers handle them well)
 */

/**
 * Generate a URL-friendly slug from a Hebrew name
 * Keeps Hebrew characters, replaces spaces with hyphens, removes special chars
 */
export function generateSlug(name: string): string {
  return name
    .trim()
    // Remove quotes, parentheses, and other special characters
    .replace(/['"״׳()[\]{}]/g, '')
    // Replace multiple spaces or special characters with single hyphen
    .replace(/[\s\-–—_]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Lowercase for consistency (Hebrew doesn't have case, but for any transliterated text)
    .toLowerCase();
}

/**
 * Generate a unique slug by appending ID if needed
 * This ensures no collisions for people/parties with the same name
 */
export function generateUniqueSlug(name: string, id: number): string {
  const baseSlug = generateSlug(name);
  // Always append ID for uniqueness
  return `${baseSlug}-${id}`;
}

/**
 * Extract ID from a slug (if it ends with -{number})
 */
export function extractIdFromSlug(slug: string): number | null {
  const match = slug.match(/-(\d+)$/);
  if (match) {
    return parseInt(match[1], 10);
  }
  return null;
}

/**
 * Check if a string is a numeric ID
 */
export function isNumericId(value: string): boolean {
  return /^\d+$/.test(value);
}

/**
 * Parse a URL parameter that could be either an ID or a slug
 * Returns the numeric ID
 */
export function parseIdOrSlug(param: string): number | null {
  // If it's a pure number, return it as ID
  if (isNumericId(param)) {
    return parseInt(param, 10);
  }
  
  // Try to extract ID from slug
  return extractIdFromSlug(param);
}

// MK name-based slug lookup (for backwards compatibility and SEO)
// This will be populated from data at build time
const mkSlugToId = new Map<string, number>();
const mkIdToSlug = new Map<number, string>();

const partySlugToId = new Map<string, number>();
const partyIdToSlug = new Map<number, string>();

/**
 * Register an MK's slug mapping
 */
export function registerMkSlug(id: number, name: string): void {
  const slug = generateUniqueSlug(name, id);
  mkSlugToId.set(slug, id);
  mkIdToSlug.set(id, slug);
}

/**
 * Register a party's slug mapping
 */
export function registerPartySlug(id: number, name: string): void {
  const slug = generateUniqueSlug(name, id);
  partySlugToId.set(slug, id);
  partyIdToSlug.set(id, slug);
}

/**
 * Get MK ID from slug
 */
export function getMkIdFromSlug(slug: string): number | null {
  // First check the slug map
  if (mkSlugToId.has(slug)) {
    return mkSlugToId.get(slug)!;
  }
  // Fallback to extracting ID from slug
  return extractIdFromSlug(slug);
}

/**
 * Get MK slug from ID
 */
export function getMkSlug(id: number, name?: string): string {
  if (mkIdToSlug.has(id)) {
    return mkIdToSlug.get(id)!;
  }
  // Generate slug if name is provided
  if (name) {
    const slug = generateUniqueSlug(name, id);
    mkSlugToId.set(slug, id);
    mkIdToSlug.set(id, slug);
    return slug;
  }
  // Fallback to ID-only
  return id.toString();
}

/**
 * Get party ID from slug
 */
export function getPartyIdFromSlug(slug: string): number | null {
  if (partySlugToId.has(slug)) {
    return partySlugToId.get(slug)!;
  }
  return extractIdFromSlug(slug);
}

/**
 * Get party slug from ID
 */
export function getPartySlug(id: number, name?: string): string {
  if (partyIdToSlug.has(id)) {
    return partyIdToSlug.get(id)!;
  }
  if (name) {
    const slug = generateUniqueSlug(name, id);
    partySlugToId.set(slug, id);
    partyIdToSlug.set(id, slug);
    return slug;
  }
  return id.toString();
}

/**
 * Generate URL path for an MK profile
 */
export function getMkPath(id: number, name?: string): string {
  const slug = getMkSlug(id, name);
  return `/mks/${slug}`;
}

/**
 * Generate URL path for a party page
 */
export function getPartyPath(id: number, name?: string): string {
  const slug = getPartySlug(id, name);
  return `/parties/${slug}`;
}
