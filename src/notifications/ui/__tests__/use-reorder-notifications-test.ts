import { act, renderHook } from '@testing-library/react-native';

import { translate } from '@/commons/ui/testing/test-i18n';
import {
  cancelReorderAlert,
  getReorderAlertedAt,
  scheduleReorderAlert,
  showReorderAlert,
} from '@/notifications/notification-service';
import { useReorderNotifications } from '@/notifications/ui/use-reorder-notifications';
import type { Product } from '@/products/product-service';
import { useProducts } from '@/products/ui/use-products';
import type { Schedule } from '@/schedules/schedule-service';
import { useSchedules } from '@/schedules/ui/use-schedules';

jest.mock('@/notifications/notification-service', () => ({
  cancelReorderAlert: jest.fn().mockResolvedValue(undefined),
  getReorderAlertedAt: jest.fn(),
  scheduleReorderAlert: jest.fn().mockResolvedValue(undefined),
  showReorderAlert: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('@/products/ui/use-products', () => ({ useProducts: jest.fn() }));
jest.mock('@/schedules/ui/use-schedules', () => ({ useSchedules: jest.fn() }));

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

async function renderNotifications() {
  const hook = renderHook(() => useReorderNotifications());
  await act(async () => {});
  return hook;
}

beforeEach(() => {
  jest.useFakeTimers({ now: NOW });
  jest.clearAllMocks();
  jest.mocked(getReorderAlertedAt).mockReturnValue(null);
});
afterEach(() => jest.useRealTimers());

describe('useReorderNotifications', () => {
  it('shows the alert right away when the stock is already low', async () => {
    // given
    givenData(
      [product({ id: 'a', stock: 3, price: '20 PLN' })],
      [dailySchedule('a')],
    );

    // when
    await renderNotifications();

    // then
    expect(showReorderAlert).toHaveBeenCalledTimes(1);
    expect(showReorderAlert).toHaveBeenCalledWith(
      { productId: 'a', canAddPack: false },
      {
        title: translate('notification.reorderTitle'),
        body: translate('notification.reorderBodyWithPrice', {
          name: 'Vitamin D',
          price: '20 PLN',
        }),
      },
    );
    expect(scheduleReorderAlert).not.toHaveBeenCalled();
  });

  it('schedules the alert for 9:00 on the day the stock gets low', async () => {
    // given
    givenData([product({ id: 'a', stock: 20 })], [dailySchedule('a')]);

    // when
    await renderNotifications();

    // then
    expect(scheduleReorderAlert).toHaveBeenCalledTimes(1);
    expect(scheduleReorderAlert).toHaveBeenCalledWith(
      { productId: 'a', canAddPack: false },
      new Date(2026, 0, 23, 9, 0),
      expect.objectContaining({
        title: translate('notification.reorderTitle'),
      }),
    );
  });

  it('tells the notification it can add a pack when the pack size is known', async () => {
    // given
    givenData(
      [product({ id: 'a', stock: 3, packSize: 30 })],
      [dailySchedule('a')],
    );

    // when
    await renderNotifications();

    // then
    expect(showReorderAlert).toHaveBeenCalledWith(
      { productId: 'a', canAddPack: true },
      expect.anything(),
    );
  });

  it('cancels the alert of a product without a stock estimate', async () => {
    // given
    givenData([product({ id: 'a', stock: null })], [dailySchedule('a')]);

    // when
    await renderNotifications();

    // then
    expect(cancelReorderAlert).toHaveBeenCalledWith('a');
    expect(showReorderAlert).not.toHaveBeenCalled();
    expect(scheduleReorderAlert).not.toHaveBeenCalled();
  });

  it('does not alert twice about the same low-stock episode', async () => {
    // given
    jest.mocked(getReorderAlertedAt).mockReturnValue(new Date(2026, 0, 9, 9));
    givenData([product({ id: 'a', stock: 3 })], [dailySchedule('a')]);

    // when
    await renderNotifications();

    // then
    expect(showReorderAlert).not.toHaveBeenCalled();
    expect(cancelReorderAlert).not.toHaveBeenCalled();
  });

  it('does not reschedule on a rerender or the minute tick when nothing changed', async () => {
    // given
    givenData([product({ id: 'a', stock: 20 })], [dailySchedule('a')]);
    const { rerender } = await renderNotifications();
    jest.mocked(scheduleReorderAlert).mockClear();
    jest.mocked(cancelReorderAlert).mockClear();

    // when
    rerender({});
    await act(async () => jest.advanceTimersByTime(5 * MINUTE_MS));

    // then
    expect(scheduleReorderAlert).not.toHaveBeenCalled();
    expect(cancelReorderAlert).not.toHaveBeenCalled();
  });

  it('plans the alerts again when the day changes', async () => {
    // given
    givenData([product({ id: 'a', stock: 20 })], [dailySchedule('a')]);
    await renderNotifications();
    jest.mocked(scheduleReorderAlert).mockClear();

    // when
    jest.setSystemTime(new Date(NOW.getTime() + DAY_MS));
    await act(async () => jest.advanceTimersByTime(MINUTE_MS));

    // then
    expect(scheduleReorderAlert).toHaveBeenCalledTimes(1);
  });

  it('plans the alert again when the stock changes', async () => {
    // given
    givenData([product({ id: 'a', stock: 20 })], [dailySchedule('a')]);
    const { rerender } = await renderNotifications();
    jest.mocked(showReorderAlert).mockClear();

    // when
    givenData([product({ id: 'a', stock: 3 })], [dailySchedule('a')]);
    rerender({});
    await act(async () => {});

    // then
    expect(showReorderAlert).toHaveBeenCalledTimes(1);
  });
});
