/**
 * Form validation utilities for LaundryShare
 */

/**
 * Validates email format using RFC 5322 simplified regex
 * @param email - Email string to validate
 * @returns Error message if invalid, null if valid
 */
export function validateEmail(email: string): string | null {
  if (!email) {
    return 'Email is required';
  }

  // RFC 5322 simplified email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }

  return null;
}

/**
 * Validates password strength
 * Requirements: Minimum 8 characters
 * @param password - Password string to validate
 * @returns Error message if invalid, null if valid
 */
export function validatePassword(password: string): string | null {
  if (!password) {
    return 'Password is required';
  }

  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }

  return null;
}

/**
 * Validates confirm password matches original password
 * @param password - Original password
 * @param confirmPassword - Confirmation password to match
 * @returns Error message if invalid, null if valid
 */
export function validateConfirmPassword(
  password: string,
  confirmPassword: string
): string | null {
  if (!confirmPassword) {
    return 'Please confirm your password';
  }

  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }

  return null;
}

/**
 * Validates phone number format
 * Supports French format (0X XX XX XX XX) and E.164 (+XXXXXXXXXXX)
 * @param phone - Phone string to validate
 * @returns Error message if invalid, null if valid (empty is valid since phone is optional)
 */
export function validatePhone(phone: string): string | null {
  if (!phone || phone.trim() === '') {
    return null; // Phone is optional
  }

  const cleaned = phone.replace(/\s/g, '');

  // French format: 0X XX XX XX XX (10 digits starting with 0)
  const frenchRegex = /^0[1-9][0-9]{8}$/;

  // E.164 format: +XXXXXXXXXXX (+ followed by 7-15 digits)
  const e164Regex = /^\+[1-9][0-9]{6,14}$/;

  if (frenchRegex.test(cleaned) || e164Regex.test(cleaned)) {
    return null;
  }

  return 'Please enter a valid phone number (e.g., 06 12 34 56 78 or +33612345678)';
}
