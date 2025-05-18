import { Storage } from '../storage';

describe('Storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('set', () => {
    it('should store data in localStorage', () => {
      const key = 'testKey';
      const value = { test: 'data' };

      Storage.set(key, value);

      expect(localStorage.getItem(key)).toBe(JSON.stringify(value));
    });

    it('should handle null values', () => {
      const key = 'testKey';
      const value = null;

      Storage.set(key, value);

      expect(localStorage.getItem(key)).toBe('null');
    });
  });

  describe('get', () => {
    it('should retrieve data from localStorage', () => {
      const key = 'testKey';
      const value = { test: 'data' };

      localStorage.setItem(key, JSON.stringify(value));

      const result = Storage.get(key);

      expect(result).toEqual(value);
    });

    it('should return null for non-existent keys', () => {
      const result = Storage.get('nonExistentKey');

      expect(result).toBeNull();
    });

    it('should handle invalid JSON', () => {
      const key = 'testKey';
      localStorage.setItem(key, 'invalid json');

      const result = Storage.get(key);

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should remove data from localStorage', () => {
      const key = 'testKey';
      const value = { test: 'data' };

      localStorage.setItem(key, JSON.stringify(value));
      Storage.remove(key);

      expect(localStorage.getItem(key)).toBeNull();
    });
  });

  describe('clear', () => {
    it('should clear all data from localStorage', () => {
      localStorage.setItem('key1', 'value1');
      localStorage.setItem('key2', 'value2');

      Storage.clear();

      expect(localStorage.length).toBe(0);
    });
  });

  describe('has', () => {
    it('should check if key exists in localStorage', () => {
      const key = 'testKey';
      const value = { test: 'data' };

      localStorage.setItem(key, JSON.stringify(value));

      expect(Storage.has(key)).toBe(true);
      expect(Storage.has('nonExistentKey')).toBe(false);
    });
  });

  describe('getAll', () => {
    it('should retrieve all data from localStorage', () => {
      const data = {
        key1: { test: 'data1' },
        key2: { test: 'data2' },
      };

      Object.entries(data).forEach(([key, value]) => {
        localStorage.setItem(key, JSON.stringify(value));
      });

      const result = Storage.getAll();

      expect(result).toEqual(data);
    });

    it('should return empty object when localStorage is empty', () => {
      const result = Storage.getAll();

      expect(result).toEqual({});
    });
  });
}); 