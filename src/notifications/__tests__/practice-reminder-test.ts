import {
  isPracticeData,
  practiceReminderAt,
  practiceTexts,
} from '../practice-reminder';

describe('practiceReminderAt', () => {
  it('plans the reminder a minute ahead', () => {
    // given
    const now = new Date(2026, 0, 10, 12, 0, 0);

    // when
    const result = practiceReminderAt(now);

    // then
    expect(result).toEqual(new Date(2026, 0, 10, 12, 1, 0));
  });
});

describe('isPracticeData', () => {
  it('recognizes a practice notification', () => {
    // when
    const result = isPracticeData({ type: 'practice' });

    // then
    expect(result).toBe(true);
  });

  it.each([{ doseId: 'dose-1' }, { type: 'reorder' }, {}])(
    'rejects %j',
    (data) => {
      // when
      const result = isPracticeData(data);

      // then
      expect(result).toBe(false);
    },
  );
});

describe('practiceTexts', () => {
  it('falls back to an empty body', () => {
    // when
    const result = practiceTexts({ title: 'Time', body: null });

    // then
    expect(result).toEqual({ title: 'Time', body: '' });
  });
});
