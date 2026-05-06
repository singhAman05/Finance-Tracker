import { validateUUID, validatePhone, validateEmail } from '../../utils/validationUtils';

describe('validationUtils', () => {
  describe('validateUUID', () => {
    it('accepts a valid UUID', () => {
      expect(validateUUID('550e8400-e29b-41d4-a716-446655440000', 'id')).toBe(
        '550e8400-e29b-41d4-a716-446655440000'
      );
    });

    it('rejects an invalid UUID', () => {
      expect(() => validateUUID('not-a-uuid', 'id')).toThrow('must be a valid UUID');
    });

    it('rejects empty string', () => {
      expect(() => validateUUID('', 'id')).toThrow('is required');
    });

    it('rejects non-string values', () => {
      expect(() => validateUUID(123, 'id')).toThrow('is required');
    });
  });

  describe('validatePhone', () => {
    it('accepts valid E.164 phone numbers', () => {
      expect(validatePhone('+14155552671')).toBe('+14155552671');
    });

    it('rejects phone without + prefix', () => {
      expect(() => validatePhone('14155552671')).toThrow('E.164 format');
    });

    it('rejects too short phone numbers', () => {
      expect(() => validatePhone('+1234')).toThrow('too short');
    });
  });

  describe('validateEmail', () => {
    it('accepts valid email', () => {
      expect(validateEmail('user@example.com')).toBe('user@example.com');
    });

    it('rejects invalid email', () => {
      expect(() => validateEmail('not-an-email')).toThrow('Invalid email');
    });
  });
});
