// Phone number regex: allows +, digits, spaces, dashes, parentheses (max 20 trailing chars)
export const PHONE_REGEX = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{0,20}$/;

// Validate phone number format
export function isValidPhone(phone: string): boolean {
  if (phone.length > 30) return false;
  return PHONE_REGEX.test(phone);
}

// Email validation
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return email.length <= 254 && EMAIL_REGEX.test(email);
}

// URL protocol validation (only http/https)
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

// Valid project statuses
export const VALID_STATUSES = ['draft', 'in_progress', 'completed'] as const;

// Shared project types
export const PROJECT_TYPES = [
  { value: 'new_construction', label: 'New Construction' },
  { value: 'renovation', label: 'Renovation' },
  { value: 'addition', label: 'Addition' },
  { value: 'remodel', label: 'Remodel' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'residential', label: 'Residential' },
  { value: 'multi_family', label: 'Multi-Family' },
  { value: 'custom_home', label: 'Custom Home' },
  { value: 'other', label: 'Other' },
] as const;

// Shared status display maps
export const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  in_progress: 'In Progress',
  completed: 'Completed',
};

export const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
};

// Compute subcategory display numeral (e.g., "3.7")
export function getSubCategoryNumeral(
  mainNumeral: number,
  sortOrder: number
): string {
  return `${mainNumeral}.${sortOrder}`;
}

// Compute tertiary subcategory display numeral (e.g., "3.7.2")
export function getTertiaryNumeral(
  mainNumeral: number,
  parentSortOrder: number,
  childSortOrder: number
): string {
  return `${mainNumeral}.${parentSortOrder}.${childSortOrder}`;
}

// Format name for display: stored Title Case, display ALL CAPS for main categories
export function toAllCaps(name: string): string {
  return name.toUpperCase();
}

// Format main category display: "3 ADVANCED BUILDING ENVELOPE"
export function formatMainCategoryDisplay(
  numeral: number,
  name: string
): string {
  return `${numeral} ${toAllCaps(name)}`;
}

// Format subcategory display: "3.7 Interior Finishes"
export function formatSubCategoryDisplay(
  mainNumeral: number,
  sortOrder: number,
  name: string
): string {
  return `${getSubCategoryNumeral(mainNumeral, sortOrder)} ${name}`;
}

// Concatenate first and last name
export function fullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

// Format address for display
export function formatAddress(parts: {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}): string {
  const lines = [
    parts.line1,
    parts.line2,
    [parts.city, parts.state].filter(Boolean).join(', '),
    parts.postalCode,
  ].filter(Boolean);
  return lines.join('\n');
}

// cn utility for conditional classNames
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// UUID validation
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isValidUUID(id: string): boolean {
  return UUID_REGEX.test(id);
}

// Sanitize auth error messages to prevent information leakage
export function sanitizeAuthError(errorMessage: string): string {
  const msg = errorMessage.toLowerCase();
  if (msg.includes('invalid login') || msg.includes('invalid email') || msg.includes('invalid password') || msg.includes('user not found')) {
    return 'Invalid email or password.';
  }
  if (msg.includes('rate limit') || msg.includes('too many')) {
    return 'Too many attempts. Please try again later.';
  }
  if (msg.includes('email not confirmed')) {
    return 'Please confirm your email address first.';
  }
  return 'An error occurred. Please try again.';
}
