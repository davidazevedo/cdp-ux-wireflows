import { Validation } from '../validation';

describe('Validation', () => {
  describe('isValidCPF', () => {
    it('should validate correct CPF numbers', () => {
      expect(Validation.isValidCPF('529.982.247-25')).toBe(true);
      expect(Validation.isValidCPF('52998224725')).toBe(true);
    });

    it('should reject invalid CPF numbers', () => {
      expect(Validation.isValidCPF('123.456.789-00')).toBe(false);
      expect(Validation.isValidCPF('111.111.111-11')).toBe(false);
      expect(Validation.isValidCPF('000.000.000-00')).toBe(false);
    });

    it('should reject CPF numbers with incorrect length', () => {
      expect(Validation.isValidCPF('123.456.789-0')).toBe(false);
      expect(Validation.isValidCPF('123.456.789-000')).toBe(false);
    });

    it('should reject non-numeric CPF numbers', () => {
      expect(Validation.isValidCPF('abc.def.ghi-jk')).toBe(false);
    });
  });

  describe('isValidNIS', () => {
    it('should validate correct NIS numbers', () => {
      expect(Validation.isValidNIS('123.45678.90-1')).toBe(true);
      expect(Validation.isValidNIS('12345678901')).toBe(true);
    });

    it('should reject invalid NIS numbers', () => {
      expect(Validation.isValidNIS('123.45678.90-2')).toBe(false);
      expect(Validation.isValidNIS('12345678902')).toBe(false);
    });

    it('should reject NIS numbers with incorrect length', () => {
      expect(Validation.isValidNIS('123.45678.90')).toBe(false);
      expect(Validation.isValidNIS('123456789012')).toBe(false);
    });

    it('should reject non-numeric NIS numbers', () => {
      expect(Validation.isValidNIS('abc.defgh.ij-k')).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(Validation.isValidEmail('test@example.com')).toBe(true);
      expect(Validation.isValidEmail('test.name@example.com')).toBe(true);
      expect(Validation.isValidEmail('test+name@example.com')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(Validation.isValidEmail('test@')).toBe(false);
      expect(Validation.isValidEmail('@example.com')).toBe(false);
      expect(Validation.isValidEmail('test@example')).toBe(false);
      expect(Validation.isValidEmail('test.example.com')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should validate correct phone numbers', () => {
      expect(Validation.isValidPhone('(11) 99999-9999')).toBe(true);
      expect(Validation.isValidPhone('11999999999')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(Validation.isValidPhone('(11) 9999-9999')).toBe(false);
      expect(Validation.isValidPhone('1199999999')).toBe(false);
      expect(Validation.isValidPhone('(11) 99999-999')).toBe(false);
      expect(Validation.isValidPhone('1199999999')).toBe(false);
    });
  });

  describe('isValidDate', () => {
    it('should validate correct dates', () => {
      expect(Validation.isValidDate('01/01/2020')).toBe(true);
      expect(Validation.isValidDate('31/12/2020')).toBe(true);
    });

    it('should reject invalid dates', () => {
      expect(Validation.isValidDate('32/01/2020')).toBe(false);
      expect(Validation.isValidDate('01/13/2020')).toBe(false);
      expect(Validation.isValidDate('01/01/20')).toBe(false);
      expect(Validation.isValidDate('01-01-2020')).toBe(false);
    });
  });

  describe('isValidURL', () => {
    it('should validate correct URLs', () => {
      expect(Validation.isValidURL('https://example.com')).toBe(true);
      expect(Validation.isValidURL('http://example.com')).toBe(true);
      expect(Validation.isValidURL('https://example.com/path')).toBe(true);
      expect(Validation.isValidURL('https://example.com/path?query=value')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(Validation.isValidURL('example.com')).toBe(false);
      expect(Validation.isValidURL('https://')).toBe(false);
      expect(Validation.isValidURL('https://example')).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    it('should validate correct passwords', () => {
      expect(Validation.isValidPassword('Test@123')).toBe(true);
      expect(Validation.isValidPassword('Test123!@#')).toBe(true);
    });

    it('should reject invalid passwords', () => {
      expect(Validation.isValidPassword('test123')).toBe(false);
      expect(Validation.isValidPassword('Test123')).toBe(false);
      expect(Validation.isValidPassword('test@123')).toBe(false);
      expect(Validation.isValidPassword('Test@')).toBe(false);
    });
  });

  describe('isValidName', () => {
    it('should validate correct names', () => {
      expect(Validation.isValidName('John Doe')).toBe(true);
      expect(Validation.isValidName('John')).toBe(true);
      expect(Validation.isValidName('John da Silva')).toBe(true);
    });

    it('should reject invalid names', () => {
      expect(Validation.isValidName('John123')).toBe(false);
      expect(Validation.isValidName('John@Doe')).toBe(false);
      expect(Validation.isValidName('')).toBe(false);
    });
  });
}); 