import type { Schedule } from '@/schedules/schedule-service';
import { formatDate, formatTime } from '@/ui/commons/format-date';

import type { ReorderStatus } from '../dto/reorder-status';
import {
  lastUsedText,
  rhythmSummary,
  stockAmountText,
  stockSummary,
  supplyHint,
  wholeDaysLeft,
} from '../product-text';

const NOW = new Date(2026, 9, 18, 12, 0);

const t = (key: string, options?: Record<string, string | number>) =>
  options ? `${key} ${JSON.stringify(options)}` : key;

function reorder(overrides: Partial<ReorderStatus>): ReorderStatus {
  return {
    dailyConsumption: 1,
    daysLeft: 17.2,
    runOutAt: new Date(2026, 10, 4),
    reorderAt: new Date(2026, 9, 28),
    isLow: false,
    ...overrides,
  };
}

function schedule(overrides: Partial<Schedule>): Schedule {
  return {
    id: 's1',
    productId: 'p1',
    intervalDays: 1,
    timesOfDay: ['08:00', '20:00'],
    quantity: 1,
    startDate: null,
    endDate: null,
    pausedAt: null,
    resumeAt: null,
    ...overrides,
  };
}

describe('wholeDaysLeft', () => {
  it('rounds a partial day up', () => {
    // when
    const days = wholeDaysLeft(3.1);

    // then
    expect(days).toBe(4);
  });
});

describe('stockAmountText', () => {
  it('uses the short unit name', () => {
    // when
    const text = stockAmountText(18, 'tablet', t);

    // then
    expect(text).toBe('products.unitShort.tablet {"count":18}');
  });

  it('falls back to pieces without a unit', () => {
    // when
    const text = stockAmountText(18, null, t);

    // then
    expect(text).toBe('products.pieces {"count":18}');
  });
});

describe('stockSummary', () => {
  const product = { stock: 18, unit: 'tablet', status: 'active' } as const;

  it('shows the bar with units and whole days when a schedule consumes the stock', () => {
    // when
    const summary = stockSummary(product, reorder({ daysLeft: 17.2 }), t);

    // then
    expect(summary).toEqual({
      kind: 'bar',
      daysLeft: 17.2,
      label:
        'products.unitShort.tablet {"count":18} · products.daysCount {"count":18}',
    });
  });

  it('shows only a caption when the stock is not tracked', () => {
    // when
    const summary = stockSummary({ ...product, stock: null }, undefined, t);

    // then
    expect(summary).toEqual({
      kind: 'caption',
      label: 'products.stockUntracked',
    });
  });

  it('mentions the missing schedule when there is nothing to consume the stock', () => {
    // when
    const summary = stockSummary(product, reorder({ daysLeft: null }), t);

    // then
    expect(summary).toEqual({
      kind: 'caption',
      label: 'products.unitShort.tablet {"count":18} · products.noSchedule',
    });
  });

  it('shows just the amount for an archived product', () => {
    // when
    const summary = stockSummary(
      { ...product, status: 'archived' },
      undefined,
      t,
    );

    // then
    expect(summary).toEqual({
      kind: 'caption',
      label: 'products.unitShort.tablet {"count":18}',
    });
  });
});

describe('supplyHint', () => {
  it('tells when the stock lasts and when to order', () => {
    // when
    const hint = supplyHint(reorder({}), NOW, t, formatDate);

    // then
    expect(hint).toBe(
      'products.supplyLastsUntil {"date":"04.11.2026"} · products.supplyOrderBy {"date":"28.10.2026"}',
    );
  });

  it('says to order now once the reorder date has passed', () => {
    // when
    const hint = supplyHint(
      reorder({ reorderAt: new Date(2026, 9, 10) }),
      NOW,
      t,
      formatDate,
    );

    // then
    expect(hint).toBe(
      'products.supplyLastsUntil {"date":"04.11.2026"} · products.supplyOrderNow',
    );
  });

  it('has no hint without an estimate', () => {
    // when
    const hint = supplyHint(
      reorder({ runOutAt: null, reorderAt: null, daysLeft: null }),
      NOW,
      t,
      formatDate,
    );

    // then
    expect(hint).toBeNull();
  });
});

describe('rhythmSummary', () => {
  it('has a message for a product without a schedule', () => {
    // when
    const text = rhythmSummary([], t);

    // then
    expect(text).toBe('products.noSchedule');
  });

  it('describes a single schedule with its times', () => {
    // when
    const text = rhythmSummary([schedule({})], t);

    // then
    expect(text).toBe('schedule.daily · 08:00, 20:00');
  });

  it('describes a schedule repeating every few days', () => {
    // when
    const text = rhythmSummary([schedule({ intervalDays: 3 })], t);

    // then
    expect(text).toBe('schedule.everyXDays {"days":3} · 08:00, 20:00');
  });

  it('counts the schedules when there are several', () => {
    // when
    const text = rhythmSummary([schedule({}), schedule({ id: 's2' })], t);

    // then
    expect(text).toBe('products.schedulesCount {"count":2}');
  });
});

describe('lastUsedText', () => {
  it.each([
    [null, 'products.neverUsed'],
    [new Date(2026, 9, 18, 7, 58), 'products.lastUsedToday {"time":"07:58"}'],
    [
      new Date(2026, 9, 17, 22, 5),
      'products.lastUsedYesterday {"time":"22:05"}',
    ],
    [
      new Date(2026, 9, 10, 9, 0),
      'products.lastUsedOn {"date":"10.10.2026","time":"09:00"}',
    ],
  ])('describes %s', (lastUsedAt, expected) => {
    // when
    const text = lastUsedText(lastUsedAt, NOW, t, formatDate, formatTime);

    // then
    expect(text).toBe(expected);
  });
});
