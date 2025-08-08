import { describe, expect, it } from 'vitest';
import { getBaseUrl, isServer } from './Helpers';

describe('Helpers', () => {
  describe('getBaseUrl', () => {
    it('should return localhost URL when no environment variables are set', () => {
      expect(getBaseUrl()).toBe('http://localhost:3000');
    });
  });

  describe('isServer', () => {
    it('should return true when running on server', () => {
      expect(isServer()).toBe(true);
    });
  });
});
