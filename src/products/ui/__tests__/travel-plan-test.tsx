import '@/commons/ui/testing/test-i18n';

import { fireEvent, render, screen } from '@testing-library/react-native';

import type { TravelPlanEntry } from '@/products/product-service';
import { TravelPlan } from '@/products/ui/travel-plan';

const ENTRIES: TravelPlanEntry[] = [
  {
    id: 'p1',
    name: 'Vitamin D',
    category: 'supplement',
    profileImageFileName: null,
    title: 'Vitamin D',
    pack: '7 pcs',
    verdict: 'enough',
    runOutOffsetDays: null,
  },
];

jest.mock('@/products/ui/use-travel-plan', () => ({
  useTravelPlan: () => ENTRIES,
}));
jest.mock('@/commons/ui/use-format-date', () => ({
  useDateLocale: () => 'en',
}));
jest.mock('@/commons/ui/product-avatar', () => ({ ProductAvatar: () => null }));
jest.mock('@/products/ui/trip-scene', () => ({ TripScene: () => null }));
jest.mock('@/products/ui/trip-range-sheet', () => ({
  TripRangeSheet: () => null,
}));

describe('TravelPlan', () => {
  it('opens the product when its block is pressed', () => {
    // given
    const onOpenProduct = jest.fn();
    render(<TravelPlan onOpenProduct={onOpenProduct} />);

    // when
    fireEvent.press(screen.getByText('Vitamin D'));

    // then
    expect(onOpenProduct).toHaveBeenCalledWith('p1');
  });
});
