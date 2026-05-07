import { describe, it, expect } from 'vitest';
import reducer, {
  addTransaction,
  setTransactions,
  removeTransaction,
} from '@/components/redux/slices/slice_transactions';

describe('transactionSlice', () => {
  it('dedupes entries with the same id on setTransactions', () => {
    const state = reducer(
      { transactions: [] },
      setTransactions([
        { id: 'tx-1', amount: 25 },
        { id: 'tx-1', amount: 30 },
        { id: 'tx-2', amount: 10 },
      ])
    );

    expect(state.transactions).toHaveLength(2);
    expect(state.transactions[0]).toMatchObject({ id: 'tx-1', amount: 25 });
    expect(state.transactions[1]).toMatchObject({ id: 'tx-2', amount: 10 });
  });

  it('normalizes Date objects to ISO strings', () => {
    const dt = new Date('2026-01-20T10:30:00.000Z');
    const state = reducer({ transactions: [] }, setTransactions([{ id: 'tx-1', date: dt }]));

    expect(state.transactions[0].date).toBe('2026-01-20T10:30:00.000Z');
  });

  it('upserts existing transaction by id on addTransaction', () => {
    const initial = {
      transactions: [{ id: 'tx-1', amount: 10 }, { id: 'tx-2', amount: 20 }],
    };

    const state = reducer(initial, addTransaction({ id: 'tx-2', amount: 99 }));

    expect(state.transactions).toHaveLength(2);
    expect(state.transactions[1]).toMatchObject({ id: 'tx-2', amount: 99 });
  });

  it('removes transaction by id', () => {
    const initial = {
      transactions: [{ id: 'tx-1' }, { id: 'tx-2' }],
    };

    const state = reducer(initial, removeTransaction('tx-1'));
    expect(state.transactions).toEqual([{ id: 'tx-2' }]);
  });
});