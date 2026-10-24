import { cancelReorderAlert } from '@/notifications/notification-service';

import { removeCategoryProducts } from '../product-orchestrator';
import { deleteProduct, listProductIdsByCategory } from '../product-service';

jest.mock('@/doses/dose-service', () => ({
  cancelFutureDosesForSchedules: jest.fn().mockResolvedValue(undefined),
  cancelPendingReminders: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('@/images/image-service', () => ({
  deleteImageFiles: jest.fn(),
  getImageFileNamesByProduct: jest.fn().mockResolvedValue([]),
}));
jest.mock('@/notes/note-service', () => ({}));
jest.mock('@/notifications/notification-service', () => ({
  cancelReorderAlert: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('@/schedules/schedule-service', () => ({
  getSchedulesByProduct: jest.fn().mockResolvedValue([]),
}));
jest.mock('../product-service', () => ({
  deleteProduct: jest.fn().mockResolvedValue(undefined),
  listProductIdsByCategory: jest.fn(),
}));

describe('removeCategoryProducts', () => {
  beforeEach(() => jest.clearAllMocks());

  it('removes every product of the category with the usual cleanup', async () => {
    // given
    jest.mocked(listProductIdsByCategory).mockResolvedValue(['a', 'b']);

    // when
    const result = await removeCategoryProducts('Vitamins');

    // then
    expect(result).toEqual(['a', 'b']);
    expect(deleteProduct).toHaveBeenCalledWith('a');
    expect(deleteProduct).toHaveBeenCalledWith('b');
    expect(cancelReorderAlert).toHaveBeenCalledTimes(2);
  });

  it('does nothing for a category without products', async () => {
    // given
    jest.mocked(listProductIdsByCategory).mockResolvedValue([]);

    // when
    const result = await removeCategoryProducts('Empty');

    // then
    expect(result).toEqual([]);
    expect(deleteProduct).not.toHaveBeenCalled();
  });
});
