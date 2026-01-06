import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from '../../src/utils/validators';

describe('validators', () => {
  describe('validateEmail', () => {
    it('returns error for empty email', () => {
      expect(validateEmail('')).toBe('Email is required');
    });

    it('returns error for invalid email format', () => {
      expect(validateEmail('invalid')).toBe('Please enter a valid email address');
      expect(validateEmail('invalid@')).toBe('Please enter a valid email address');
      expect(validateEmail('@domain.com')).toBe('Please enter a valid email address');
      expect(validateEmail('user@domain')).toBe('Please enter a valid email address');
    });

    it('returns null for valid email', () => {
      expect(validateEmail('user@example.com')).toBeNull();
      expect(validateEmail('test.user@domain.co.uk')).toBeNull();
      expect(validateEmail('user+tag@example.org')).toBeNull();
    });
  });

  describe('validatePassword', () => {
    it('returns error for empty password', () => {
      expect(validatePassword('')).toBe('Password is required');
    });

    it('returns error for short password', () => {
      expect(validatePassword('1234567')).toBe('Password must be at least 8 characters');
      expect(validatePassword('short')).toBe('Password must be at least 8 characters');
    });

    it('returns null for valid password', () => {
      expect(validatePassword('12345678')).toBeNull();
      expect(validatePassword('longpassword123')).toBeNull();
    });
  });

  describe('validateConfirmPassword', () => {
    it('returns error for empty confirm password', () => {
      expect(validateConfirmPassword('password123', '')).toBe('Please confirm your password');
    });

    it('returns error when passwords do not match', () => {
      expect(validateConfirmPassword('password123', 'different')).toBe('Passwords do not match');
    });

    it('returns null when passwords match', () => {
      expect(validateConfirmPassword('password123', 'password123')).toBeNull();
    });
  });
});
