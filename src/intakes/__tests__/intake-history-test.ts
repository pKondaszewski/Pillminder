import type { Intake } from '../dto/intake-output';
import { intakeDayKeys, recentIntakeCount } from '../intake-history';

const NOW = new Date(2026, 9, 22, 12, 0);

function at(day: number, hours = 9): Intake {
  return {
    id: `${day}-${hours}`,
    productId: 'p',
    takenAt: new Date(2026, 9, day, hours),
    quantity: 1,
    productName: 'Ibuprofen',
    category: 'medication',
    unit: null,
    profileImageFileName: null,
  };
}

describe('intakeDayKeys', () => {
  it('lists each day with an intake once', () => {
    // given
    const intakes = [at(20, 8), at(20, 21), at(18)];

    // when
    const days = intakeDayKeys(intakes);

    // then
    expect([...days].sort()).toEqual(['2026-10-18', '2026-10-20']);
  });

  it('is empty without intakes', () => {
    // when
    const days = intakeDayKeys([]);

    // then
    expect(days.size).toBe(0);
  });
});

describe('recentIntakeCount', () => {
  it('counts intakes from today and the 13 days before', () => {
    // given
    const intakes = [at(22, 8), at(9, 0), at(8, 23)];

    // when
    const count = recentIntakeCount(intakes, NOW);

    // then
    expect(count).toBe(2);
  });

  it('ignores intakes later than now', () => {
    // given
    const intakes = [at(22, 8), at(22, 18)];

    // when
    const count = recentIntakeCount(intakes, NOW);

    // then
    expect(count).toBe(1);
  });
});
