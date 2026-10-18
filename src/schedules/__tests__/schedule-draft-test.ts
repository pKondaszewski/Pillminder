import { scheduleDraftErrors } from '../schedule-draft';

const VALID = {
  productId: 'p1',
  timesOfDay: ['08:00'],
  startDate: null,
  endDate: null,
};

describe('scheduleDraftErrors', () => {
  it('has no errors for a complete draft', () => {
    // given
    const draft = VALID;

    // when
    const result = scheduleDraftErrors(draft);

    // then
    expect(result).toEqual({});
  });

  it('reports a missing product and missing times', () => {
    // given
    const draft = { ...VALID, productId: '', timesOfDay: [] };

    // when
    const result = scheduleDraftErrors(draft);

    // then
    expect(result).toEqual({
      product: 'schedule.productRequired',
      times: 'schedule.timesRequired',
    });
  });

  it('reports an end date before the start date', () => {
    // given
    const draft = {
      ...VALID,
      startDate: new Date(2026, 9, 22),
      endDate: new Date(2026, 9, 21),
    };

    // when
    const result = scheduleDraftErrors(draft);

    // then
    expect(result).toEqual({ period: 'schedule.periodInvalid' });
  });
});
