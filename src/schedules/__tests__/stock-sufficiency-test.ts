import type { ReorderStatus } from '@/products/dto/reorder-status';

import { describeStockSufficiency } from '../stock-sufficiency';

const RUN_OUT_AT = new Date(2026, 11, 20);

const t = (key: string, options?: Record<string, string | number>) =>
  key.startsWith('unit.')
    ? key
    : `${key}|${options?.amount ?? ''}|${options?.date ?? ''}`;
const formatDate = () => '20.12.2026';

function status(overrides: Partial<ReorderStatus>): ReorderStatus {
  return {
    daysLeft: 60,
    runOutAt: RUN_OUT_AT,
    reorderAt: null,
    isLow: false,
    ...overrides,
  };
}

describe('describeStockSufficiency', () => {
  it('says until when the stock lasts', () => {
    // given
    const input = {
      stock: 64,
      unit: null,
      status: status({}),
      hasEndDate: false,
    };

    // when
    const result = describeStockSufficiency(input, t, formatDate);

    // then
    expect(result).toEqual({
      message: 'schedule.stockLasts|64|20.12.2026',
      warning: false,
    });
  });

  it('warns when the stock is low', () => {
    // given
    const input = {
      stock: 3,
      unit: null,
      status: status({ daysLeft: 3, isLow: true }),
      hasEndDate: false,
    };

    // when
    const result = describeStockSufficiency(input, t, formatDate);

    // then
    expect(result).toEqual({
      message: 'schedule.stockLow|3|20.12.2026',
      warning: true,
    });
  });

  it('formats the amount with the product unit', () => {
    // given
    const input = {
      stock: 64,
      unit: 'capsule' as const,
      status: status({}),
      hasEndDate: false,
    };

    // when
    const result = describeStockSufficiency(input, t, formatDate);

    // then
    expect(result?.message).toBe('schedule.stockLasts|unit.capsule|20.12.2026');
  });

  it('says the stock covers a course that ends before it runs out', () => {
    // given
    const input = {
      stock: 20,
      unit: null,
      status: status({ daysLeft: null, runOutAt: null }),
      hasEndDate: true,
    };

    // when
    const result = describeStockSufficiency(input, t, formatDate);

    // then
    expect(result).toEqual({
      message: 'schedule.stockCoversCourse|20|',
      warning: false,
    });
  });

  it('says nothing without tracked stock', () => {
    // given
    const input = {
      stock: null,
      unit: null,
      status: status({ daysLeft: null, runOutAt: null }),
      hasEndDate: true,
    };

    // when
    const result = describeStockSufficiency(input, t, formatDate);

    // then
    expect(result).toBeNull();
  });

  it('says nothing for an open-ended schedule that never consumes stock', () => {
    // given
    const input = {
      stock: 20,
      unit: null,
      status: status({ daysLeft: null, runOutAt: null }),
      hasEndDate: false,
    };

    // when
    const result = describeStockSufficiency(input, t, formatDate);

    // then
    expect(result).toBeNull();
  });
});
