import { DatabaseError } from '../../models/BaseModel';

describe('BaseModel', () => {
  describe('DatabaseError enum', () => {
    it('should have the expected error type values', () => {
      expect(DatabaseError.NOT_FOUND).toBe('NOT_FOUND');
      expect(DatabaseError.DUPLICATE).toBe('DUPLICATE');
      expect(DatabaseError.FOREIGN_KEY_VIOLATION).toBe('FOREIGN_KEY_VIOLATION');
      expect(DatabaseError.CHECK_VIOLATION).toBe('CHECK_VIOLATION');
      expect(DatabaseError.CONNECTION_ERROR).toBe('CONNECTION_ERROR');
      expect(DatabaseError.UNKNOWN_ERROR).toBe('UNKNOWN_ERROR');
    });

    it('should contain exactly 6 entries', () => {
      const keys = Object.keys(DatabaseError).filter(k => isNaN(Number(k)));
      expect(keys).toHaveLength(6);
    });
  });
});
