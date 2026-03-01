// Phone number regex: allows +, digits, spaces, dashes, parentheses
export const PHONE_REGEX = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\./0-9]*$/;

// Validate phone number format
export function isValidPhone(phone: string): boolean {
  return PHONE_REGEX.test(phone);
}

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
