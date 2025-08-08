// Utility functions for routing and subdomain handling

export function getSubdomain(): string | null {
  if (typeof window === 'undefined') return null;
  
  const hostname = window.location.hostname;
  
  // Check for query parameter first (for development)
  const urlParams = new URLSearchParams(window.location.search);
  const storeParam = urlParams.get('store');
  if (storeParam) {
    return sanitizeSubdomain(storeParam);
  }
  
  // Skip development environments that aren't actual subdomains
  if (hostname.includes('localhost') || 
      hostname.includes('127.0.0.1') || 
      hostname.includes('.preview') ||
      hostname.includes('gitpod') ||
      hostname.includes('codespaces') ||
      hostname.includes('bolt.new') ||
      hostname.includes('stackblitz') ||
      !hostname.includes('.')) {
    return null;
  }
  
  // Handle subdomain.localhost format for development
  if (hostname.endsWith('.localhost')) {
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      return sanitizeSubdomain(parts[0]); // Return the subdomain part
    }
  }
  
  const parts = hostname.split('.');
  
  // If there are more than 2 parts, first part is subdomain
  if (parts.length > 2) {
    return sanitizeSubdomain(parts[0]);
  }
  
  return null;
}

export function sanitizeSubdomain(subdomain: string): string | null {
  if (!subdomain) return null;
  
  // Remove any non-alphanumeric characters except hyphens
  const sanitized = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');
  
  // Check if it's a valid subdomain format
  if (sanitized.length < 1 || sanitized.length > 63) {
    return null;
  }
  
  // Must start and end with alphanumeric character
  if (!/^[a-z0-9].*[a-z0-9]$/.test(sanitized) && sanitized.length > 1) {
    return null;
  }
  
  // Single character must be alphanumeric
  if (sanitized.length === 1 && !/^[a-z0-9]$/.test(sanitized)) {
    return null;
  }
  
  return sanitized;
}

export function isValidSubdomain(subdomain: string): boolean {
  return sanitizeSubdomain(subdomain) === subdomain;
}

export function getAppMode(): 'landing' | 'dashboard' | 'storefront' {
  if (typeof window === 'undefined') return 'landing';
  
  const pathname = window.location.pathname;
  const subdomain = getSubdomain();
  
  // Dashboard mode: /dashboard path or dashboard subdomain
  if (pathname.startsWith('/dashboard') || subdomain === 'dashboard') {
    return 'dashboard';
  }
  
  // Storefront mode: any other valid subdomain or store query param
  if (subdomain && subdomain !== 'www' && subdomain !== 'dashboard') {
    return 'storefront';
  }
  
  // Landing page: main domain
  return 'landing';
}

export function generateStoreUrl(slug: string): string {
  if (typeof window === 'undefined') return '';
  
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = window.location.port ? `:${window.location.port}` : '';
  
  // For localhost/development, use subdomain.localhost:port format
  if (hostname === 'localhost' || hostname.startsWith('127.0.0.1')) {
    // For development, use query parameter to avoid subdomain issues
    return `${protocol}//${hostname}${port}?store=${slug}`;
  }
  
  // For other development environments (gitpod, codespaces), use query parameter
  if (hostname.includes('gitpod') || hostname.includes('codespaces') || hostname.includes('bolt.new')) {
    return `${protocol}//${hostname}${port}?store=${slug}`;
  }
  
  // For production, use subdomain
  const domain = hostname.includes('.') ? hostname.split('.').slice(-2).join('.') : hostname;
  return `${protocol}//${slug}.${domain}`;
}

export function generateSlugFromName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .substring(0, 63); // Limit length
}