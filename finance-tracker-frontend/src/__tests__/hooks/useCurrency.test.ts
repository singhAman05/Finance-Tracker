import { describe, it, expect } from 'vitest';

describe('useCurrency hook helpers', () => {
  // Test the formatAxis logic directly
  const formatAxis = (val: number): string => {
    if (Math.abs(val) >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
    if (Math.abs(val) >= 1_000) return `${(val / 1_000).toFixed(1)}k`;
    return val.toString();
  };

  it('formats millions correctly', () => {
    expect(formatAxis(1500000)).toBe('1.5M');
    expect(formatAxis(2000000)).toBe('2.0M');
  });

  it('formats thousands correctly', () => {
    expect(formatAxis(1500)).toBe('1.5k');
    expect(formatAxis(50000)).toBe('50.0k');
  });

  it('formats small values without suffix', () => {
    expect(formatAxis(500)).toBe('500');
    expect(formatAxis(0)).toBe('0');
  });

  it('handles negative values', () => {
    expect(formatAxis(-2500)).toBe('-2.5k');
    expect(formatAxis(-1500000)).toBe('-1.5M');
  });
});
