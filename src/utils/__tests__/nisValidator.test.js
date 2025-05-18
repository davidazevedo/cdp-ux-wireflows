import { NISValidator } from '../nisValidator';

describe('NISValidator', () => {
  describe('validate', () => {
    it('should validate correct NIS numbers', () => {
      expect(NISValidator.validate('123.45678.90-1')).toBe(true);
      expect(NISValidator.validate('12345678901')).toBe(true);
    });

    it('should reject invalid NIS numbers', () => {
      expect(NISValidator.validate('123.45678.90-2')).toBe(false);
      expect(NISValidator.validate('12345678902')).toBe(false);
    });

    it('should reject NIS numbers with incorrect length', () => {
      expect(NISValidator.validate('123.45678.90')).toBe(false);
      expect(NISValidator.validate('123456789012')).toBe(false);
    });

    it('should reject non-numeric NIS numbers', () => {
      expect(NISValidator.validate('abc.defgh.ij-k')).toBe(false);
    });
  });

  describe('format', () => {
    it('should format NIS numbers correctly', () => {
      expect(NISValidator.format('12345678901')).toBe('123.45678.90-1');
    });

    it('should handle partial NIS numbers', () => {
      expect(NISValidator.format('123')).toBe('123');
      expect(NISValidator.format('1234')).toBe('123.4');
      expect(NISValidator.format('12345')).toBe('123.45');
      expect(NISValidator.format('123456')).toBe('123.456');
      expect(NISValidator.format('1234567')).toBe('123.4567');
      expect(NISValidator.format('12345678')).toBe('123.45678');
      expect(NISValidator.format('123456789')).toBe('123.45678.9');
      expect(NISValidator.format('1234567890')).toBe('123.45678.90');
    });

    it('should remove non-numeric characters', () => {
      expect(NISValidator.format('123.45678.90-1')).toBe('123.45678.90-1');
    });
  });

  describe('clean', () => {
    it('should remove non-numeric characters', () => {
      expect(NISValidator.clean('123.45678.90-1')).toBe('12345678901');
    });

    it('should handle invalid inputs', () => {
      expect(NISValidator.clean('')).toBe('');
      expect(NISValidator.clean(null)).toBe('');
      expect(NISValidator.clean(undefined)).toBe('');
    });
  });
}); 