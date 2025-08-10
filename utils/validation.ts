// Validation utilities for forms and data

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class Validator {
  // Email validation
  static email(email: string): ValidationResult {
    const errors: string[] = [];
    
    if (!email) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Please enter a valid email address');
    }
    
    return { isValid: errors.length === 0, errors };
  }

  // Password validation
  static password(password: string): ValidationResult {
    const errors: string[] = [];
    
    if (!password) {
      errors.push('Password is required');
    } else {
      if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
      }
      if (!/(?=.*[a-z])/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
      }
      if (!/(?=.*[A-Z])/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
      }
      if (!/(?=.*\d)/.test(password)) {
        errors.push('Password must contain at least one number');
      }
    }
    
    return { isValid: errors.length === 0, errors };
  }

  // Store name validation
  static storeName(name: string): ValidationResult {
    const errors: string[] = [];
    
    if (!name) {
      errors.push('Store name is required');
    } else {
      if (name.length < 2) {
        errors.push('Store name must be at least 2 characters long');
      }
      if (name.length > 100) {
        errors.push('Store name must be less than 100 characters');
      }
      if (!/^[a-zA-Z0-9\s\-'&.]+$/.test(name)) {
        errors.push('Store name contains invalid characters');
      }
    }
    
    return { isValid: errors.length === 0, errors };
  }

  // Store slug validation
  static storeSlug(slug: string): ValidationResult {
    const errors: string[] = [];
    
    if (!slug) {
      errors.push('Store URL is required');
    } else {
      if (slug.length < 3) {
        errors.push('Store URL must be at least 3 characters long');
      }
      if (slug.length > 63) {
        errors.push('Store URL must be less than 63 characters');
      }
      if (!/^[a-z0-9-]+$/.test(slug)) {
        errors.push('Store URL can only contain lowercase letters, numbers, and hyphens');
      }
      if (slug.startsWith('-') || slug.endsWith('-')) {
        errors.push('Store URL cannot start or end with a hyphen');
      }
      if (slug.includes('--')) {
        errors.push('Store URL cannot contain consecutive hyphens');
      }
      
      // Reserved words
      const reserved = ['www', 'api', 'admin', 'dashboard', 'app', 'mail', 'ftp', 'localhost', 'staging', 'dev'];
      if (reserved.includes(slug)) {
        errors.push('This URL is reserved and cannot be used');
      }
    }
    
    return { isValid: errors.length === 0, errors };
  }

  // Product validation
  static product(product: { name: string; price: number; description?: string }): ValidationResult {
    const errors: string[] = [];
    
    if (!product.name) {
      errors.push('Product name is required');
    } else if (product.name.length > 200) {
      errors.push('Product name must be less than 200 characters');
    }
    
    if (product.price === undefined || product.price === null) {
      errors.push('Product price is required');
    } else if (product.price < 0) {
      errors.push('Product price cannot be negative');
    } else if (product.price > 999999.99) {
      errors.push('Product price cannot exceed $999,999.99');
    }
    
    if (product.description && product.description.length > 2000) {
      errors.push('Product description must be less than 2000 characters');
    }
    
    return { isValid: errors.length === 0, errors };
  }

  // File validation
  static imageFile(file: File): ValidationResult {
    const errors: string[] = [];
    
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      errors.push('Please upload a valid image file (JPEG, PNG, WebP, or GIF)');
    }
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      errors.push('Image size must be less than 10MB');
    }
    
    return { isValid: errors.length === 0, errors };
  }

  // Phone number validation
  static phone(phone: string): ValidationResult {
    const errors: string[] = [];
    
    if (phone && !/^\+?[\d\s\-\(\)]+$/.test(phone)) {
      errors.push('Please enter a valid phone number');
    }
    
    return { isValid: errors.length === 0, errors };
  }

  // URL validation
  static url(url: string): ValidationResult {
    const errors: string[] = [];
    
    if (url) {
      try {
        new URL(url);
      } catch {
        errors.push('Please enter a valid URL');
      }
    }
    
    return { isValid: errors.length === 0, errors };
  }
}

// Sanitization utilities
export class Sanitizer {
  static text(input: string): string {
    return input.trim().replace(/\s+/g, ' ');
  }

  static slug(input: string): string {
    return input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  static price(input: string | number): number {
    const num = typeof input === 'string' ? parseFloat(input) : input;
    return Math.round(num * 100) / 100; // Round to 2 decimal places
  }
}