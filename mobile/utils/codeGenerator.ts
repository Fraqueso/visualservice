import { supabase } from '../services/supabase';

// Characters that are unambiguous (no 0/O, 1/I/L confusion)
const CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 12;

/**
 * Generate a random verification code
 * Format: 12 alphanumeric characters (e.g., ABC123XYZ789)
 */
export function generateCode(): string {
  let code = '';
  const charsetLength = CHARSET.length;

  for (let i = 0; i < CODE_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * charsetLength);
    code += CHARSET[randomIndex];
  }

  return code;
}

/**
 * Generate a unique verification code (checks database for collisions)
 * Retries up to 5 times if collision detected
 */
export async function generateUniqueCode(): Promise<string> {
  const maxRetries = 5;

  for (let i = 0; i < maxRetries; i++) {
    const code = generateCode();

    // Check if code exists in database
    const { data, error } = await supabase
      .from('photos')
      .select('code')
      .eq('code', code)
      .maybeSingle();

    if (error) {
      console.error('Code uniqueness check error:', error);
      // Continue and hope for the best (collision is rare)
      return code;
    }

    if (!data) {
      // Code is unique
      return code;
    }

    console.log(`Code collision detected (attempt ${i + 1}), retrying...`);
  }

  // Fallback: return a code anyway (collision probability is extremely low)
  console.warn('Max retries reached, returning potentially non-unique code');
  return generateCode();
}

/**
 * Format verification code for display (add dashes for readability)
 * ABC123XYZ789 -> ABC1-23XY-Z789
 */
export function formatCodeForDisplay(code: string): string {
  if (code.length !== CODE_LENGTH) return code;
  return `${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8)}`;
}

/**
 * Parse a formatted code back to raw format
 * ABC1-23XY-Z789 -> ABC123XYZ789
 */
export function parseFormattedCode(formattedCode: string): string {
  return formattedCode.replace(/-/g, '').toUpperCase();
}

/**
 * Validate a verification code format
 */
export function isValidCode(code: string): boolean {
  const cleanCode = parseFormattedCode(code);

  if (cleanCode.length !== CODE_LENGTH) return false;

  // Check all characters are in charset
  for (const char of cleanCode) {
    if (!CHARSET.includes(char)) return false;
  }

  return true;
}

/**
 * Generate verification URL for a code
 */
export function getVerificationUrl(code: string): string {
  return `https://visualservice.app/verify/${code}`;
}
