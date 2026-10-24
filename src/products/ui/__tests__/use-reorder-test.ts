import { act, renderHook } from '@testing-library/react-native';

import type { Product } from '@/products/product-service';
import { useProducts } from '@/products/ui/use-products';
import { useReorderStatuses } from '@/products/ui/use-reorder';
import type { Schedule } from '@/schedules/schedule-service';
import { useSchedules } from '@/schedules/ui/use-schedules';

jest.mock('@/products/ui/use-products', () => ({ useProducts: jest.fn() }));
jest.mock('@/schedules/ui/use-schedules', () => ({
  useSchedules: jest.fn(),
}));

const NOW = new Date(2026, 0, 10, 12, 0);
const MINUTE_MS = 60 * 1000;
const DAY_MS = 24 * 60 * MINUTE_MS;

function product(overrides: Partial<Product>): Product {
  return {
    id: 'product-1',
    name: 'Vitamin D',
    category: 'supplement',
    strength: null,
    unit: null,
    price: null,
    storeLink: null,
    storeLinkTarget: null,
    status: 'active',
    stock: 20,
    packSize: null,
    reorderThreshold: null,
    fasting: false,
    profileImageId: null,
    profileImageFileName: null,
    lastUsedAt: null,
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

function dailySchedule(productId: string): Schedule {
  return {
    id: `schedule-${productId}`,
    productId,
    intervalDays: 1,
    weekdays: null,
    cycle: null,
    rhythmAnchor: null,
    rhythmPausedDays: 0,
    timesOfDay: ['08:00'],
    quantity: 1,
    steps: null,
    startDate: null,
    endDate: null,
    pausedAt: null,
    resumeAt: null,
  };
}

function givenData(products: Product[], schedules: Schedule[]) {
  jest
    .mocked(useProducts)
    .mockReturnValue({ products } as ReturnType<typeof useProducts>);
  jest
    .mocked(useSchedules)
    .mockReturnValue({ schedules } as ReturnType<typeof useSchedules>);
}

beforeEach(() => jest.useFakeTimers({ now: NOW }));
afterEach(() => jest.useRealTimers());

describe('useReorderStatuses', () => {
  it('computes the status of every active product from its schedules', () => {
    // given
    givenData(
      [product({ id: 'a', stock: 20 }), product({ id: 'b', stock: 3 })],
      [dailySchedule('a'), dailySchedule('b')],
    );

    // when
    const { result } = renderHook(() => useReorderStatuses());

    // then
    expect(result.current.a).toMatchObject({ daysLeft: 20, isLow: false });
    expect(result.current.b).toMatchObject({ daysLeft: 3, isLow: true });
  });

  it('skips archived products', () => {
    // given
    givenData([product({ id: 'a', status: 'archived' })], [dailySchedule('a')]);

    // when
    const { result } = renderHook(() => useReorderStatuses());

    // then
    expect(result.current).toEqual({});
  });

  it('returns the same object when nothing changed, also across the minute tick', () => {
    // given
    givenData([product({ id: 'a' })], [dailySchedule('a')]);
    const { result, rerender } = renderHook(() => useReorderStatuses());
    const first = result.current;

    // when
    rerender({});
    act(() => jest.advanceTimersByTime(5 * MINUTE_MS));

    // then
    expect(result.current).toBe(first);
  });

  it('recomputes when the day changes', () => {
    // given
    givenData([product({ id: 'a', stock: 20 })], [dailySchedule('a')]);
    const { result } = renderHook(() => useReorderStatuses());
    const first = result.current;

    // when
    act(() => jest.setSystemTime(new Date(NOW.getTime() + DAY_MS)));
    act(() => jest.advanceTimersByTime(MINUTE_MS));

    // then
    expect(result.current).not.toBe(first);
    expect(result.current.a.reorderAt?.getTime()).toBe(
      (first.a.reorderAt?.getTime() ?? 0) + DAY_MS,
    );
  });

  it('recomputes when the products change', () => {
    // given
    givenData([product({ id: 'a', stock: 20 })], [dailySchedule('a')]);
    const { result, rerender } = renderHook(() => useReorderStatuses());

    // when
    givenData([product({ id: 'a', stock: 2 })], [dailySchedule('a')]);
    rerender({});

    // then
    expect(result.current.a.isLow).toBe(true);
  });
});
