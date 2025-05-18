import {
  debounce,
  encrypt,
  decrypt,
  sanitize,
  isInRange,
  formatNumber,
  formatDate,
  isValidEmail,
  isValidURL,
  generateUniqueId,
  copyToClipboard,
  isElementInViewport,
  smoothScrollTo,
  addTooltip,
  removeTooltip,
} from '../helpers';

describe('Helpers', () => {
  describe('debounce', () => {
    jest.useFakeTimers();

    it('should debounce function calls', () => {
      const func = jest.fn();
      const debouncedFunc = debounce(func, 1000);

      debouncedFunc();
      debouncedFunc();
      debouncedFunc();

      expect(func).not.toBeCalled();

      jest.advanceTimersByTime(1000);

      expect(func).toBeCalledTimes(1);
    });
  });

  describe('encrypt/decrypt', () => {
    it('should encrypt and decrypt data', () => {
      const data = 'test data';
      const encrypted = encrypt(data);
      const decrypted = decrypt(encrypted);

      expect(encrypted).not.toBe(data);
      expect(decrypted).toBe(data);
    });
  });

  describe('sanitize', () => {
    it('should remove HTML characters', () => {
      expect(sanitize('<script>alert("test")</script>')).toBe('alert("test")');
    });

    it('should remove JavaScript protocols', () => {
      expect(sanitize('javascript:alert("test")')).toBe('alert("test")');
    });
  });

  describe('isInRange', () => {
    it('should check if value is in range', () => {
      expect(isInRange(5, 1, 10)).toBe(true);
      expect(isInRange(0, 1, 10)).toBe(false);
      expect(isInRange(11, 1, 10)).toBe(false);
    });
  });

  describe('formatNumber', () => {
    it('should format numbers with thousand separators', () => {
      expect(formatNumber(1000)).toBe('1.000');
      expect(formatNumber(1000000)).toBe('1.000.000');
    });
  });

  describe('formatDate', () => {
    it('should format dates', () => {
      const date = new Date('2020-01-01');
      expect(formatDate(date)).toBe('01/01/2020');
    });
  });

  describe('isValidEmail', () => {
    it('should validate email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('invalid-email')).toBe(false);
    });
  });

  describe('isValidURL', () => {
    it('should validate URLs', () => {
      expect(isValidURL('https://example.com')).toBe(true);
      expect(isValidURL('invalid-url')).toBe(false);
    });
  });

  describe('generateUniqueId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateUniqueId();
      const id2 = generateUniqueId();

      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
    });
  });

  describe('copyToClipboard', () => {
    it('should copy text to clipboard', () => {
      const text = 'test text';
      const result = copyToClipboard(text);

      expect(result).toBe(true);
    });
  });

  describe('isElementInViewport', () => {
    it('should check if element is in viewport', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);

      const result = isElementInViewport(element);

      expect(typeof result).toBe('boolean');
    });
  });

  describe('smoothScrollTo', () => {
    it('should scroll to element', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);

      smoothScrollTo(element);

      expect(element.scrollIntoView).toHaveBeenCalled();
    });
  });

  describe('addTooltip/removeTooltip', () => {
    it('should add and remove tooltips', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);

      addTooltip(element, 'test tooltip');
      expect(element.getAttribute('title')).toBe('test tooltip');

      removeTooltip(element);
      expect(element.getAttribute('title')).toBe('');
    });
  });
}); 