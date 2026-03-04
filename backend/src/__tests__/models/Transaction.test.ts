import { TransactionType } from '../../models/Transaction';

describe('Transaction model', () => {
  describe('TransactionType enum', () => {
    it('should have BUY value of "buy"', () => {
      expect(TransactionType.BUY).toBe('buy');
    });

    it('should have SELL value of "sell"', () => {
      expect(TransactionType.SELL).toBe('sell');
    });

    it('should contain exactly 2 entries', () => {
      const keys = Object.keys(TransactionType).filter(k => isNaN(Number(k)));
      expect(keys).toHaveLength(2);
    });
  });
});
