export function getSubdomain(): string | null {
  if (typeof window === 'undefined') return null;
  
  const hostname = window.location.hostname;
  
  // Check for query parameter first (for development)
  const urlParams = new URLSearchParams(window.location.search);
  const storeParam = urlParams.get('store');
  if (storeParam) {
    return storeParam;
  }
  
  // Handle subdomain.localhost format for development
  if (hostname.endsWith('.localhost')) {
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      return parts[0]; // Return the subdomain part
    }
  }
  
  // Skip plain localhost and IP addresses
  if (hostname === 'localhost' || hostname.startsWith('127.0.0.1') || !hostname.includes('.')) {
    return null;
  }
  
  const parts = hostname.split('.');
  
  // If there are more than 2 parts, first part is subdomain
  if (parts.length > 2) {
    return parts[0];
  }
  
  return null;
}

export function getAppMode(): 'landing' | 'dashboard' | 'storefront' {
  if (typeof window === 'undefined') return 'landing';
  
  const pathname = window.location.pathname;
  const subdomain = getSubdomain();
  
  // Dashboard mode: /dashboard path or dashboard subdomain
  if (pathname.startsWith('/dashboard') || subdomain === 'dashboard') {
    return 'dashboard';
  }
  
  // Storefront mode: any other subdomain or store query param
  if (subdomain && subdomain !== 'www' && subdomain !== 'dashboard') {
    return 'storefront';
  }
  
  // Landing page: main domain
  return 'landing';
}

export function generateStoreUrl(subdomain: string): string {
  if (typeof window === 'undefined') return '';
  
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = window.location.port ? `:${window.location.port}` : '';
  
  // For localhost/development, use subdomain.localhost:port format
  if (hostname === 'localhost' || hostname.startsWith('127.0.0.1')) {
    return `${protocol}//${subdomain}.localhost${port}`;
  }
  
  // For other development environments (gitpod, codespaces), use query parameter
  if (hostname.includes('gitpod') || hostname.includes('codespaces')) {
    return `${protocol}//${hostname}${port}?store=${subdomain}`;
  }
  
  // For production, use subdomain
  const domain = hostname.includes('.') ? hostname.split('.').slice(-2).join('.') : hostname;
  return `${protocol}//${subdomain}.${domain}`;
}