import { type AdherenceDose, calculateAdherence } from '../dose-adherence';

const NOW = new Date(2026, 0, 10, 12, 0);
const FROM = new Date(2026, 0, 1);
const TO = new Date(2026, 0, 11);

function dose(
  state: AdherenceDose['state'],
  plannedAt: Date,
  productId = 'a',
): AdherenceDose {
  return { productId, plannedAt, state };
}

describe('calculateAdherence', () => {
  it('counts taken, skipped and missed doses and computes the rate', () => {
    // given
    const doses = [
      dose('taken', new Date(2026, 0, 2, 8)),
      dose('taken', new Date(2026, 0, 3, 8)),
      dose('skipped', new Date(2026, 0, 4, 8)),
      dose('pending', new Date(2026, 0, 5, 8)),
    ];

    // when
    const { total } = calculateAdherence(doses, FROM, TO, NOW);

    // then
    expect(total).toEqual({
      taken: 2,
      skipped: 1,
      missed: 1,
      upcoming: 0,
      due: 4,
      rate: 0.5,
    });
  });

  it('keeps pending doses planned in the future out of the denominator', () => {
    // given
    const doses = [
      dose('taken', new Date(2026, 0, 9, 8)),
      dose('pending', new Date(2026, 0, 10, 20)),
      dose('pending', new Date(2026, 0, 10, 12, 0)),
    ];

    // when
    const { total } = calculateAdherence(doses, FROM, TO, NOW);

    // then
    expect(total).toMatchObject({ taken: 1, missed: 0, upcoming: 2, due: 1 });
    expect(total.rate).toBe(1);
  });

  it('treats a pending dose planned in the past as missed', () => {
    // given
    const doses = [dose('pending', new Date(2026, 0, 10, 11, 59))];

    // when
    const { total } = calculateAdherence(doses, FROM, TO, NOW);

    // then
    expect(total).toMatchObject({ missed: 1, due: 1, rate: 0 });
  });

  it('includes the start of the range and excludes the end', () => {
    // given
    const doses = [
      dose('taken', new Date(2026, 0, 1, 0, 0)),
      dose('taken', new Date(2025, 11, 31, 23, 59)),
      dose('taken', new Date(2026, 0, 11, 0, 0)),
    ];

    // when
    const { total } = calculateAdherence(doses, FROM, TO, NOW);

    // then
    expect(total.taken).toBe(1);
  });

  it('assigns doses to the period by plannedAt, not takenAt', () => {
    // given
    const doses = [dose('taken', new Date(2025, 11, 31, 23, 0))];

    // when
    const { total } = calculateAdherence(doses, FROM, TO, NOW);

    // then
    expect(total.due).toBe(0);
  });

  it('reports each product separately next to the total', () => {
    // given
    const doses = [
      dose('taken', new Date(2026, 0, 2, 8), 'a'),
      dose('skipped', new Date(2026, 0, 3, 8), 'a'),
      dose('taken', new Date(2026, 0, 2, 9), 'b'),
    ];

    // when
    const report = calculateAdherence(doses, FROM, TO, NOW);

    // then
    expect(report.byProduct.a).toMatchObject({ taken: 1, due: 2, rate: 0.5 });
    expect(report.byProduct.b).toMatchObject({ taken: 1, due: 1, rate: 1 });
    expect(report.total).toMatchObject({ taken: 2, due: 3 });
  });

  it('returns zero counts and a null rate for an empty period', () => {
    // given
    const doses: AdherenceDose[] = [];

    // when
    const report = calculateAdherence(doses, FROM, TO, NOW);

    // then
    expect(report.byProduct).toEqual({});
    expect(report.total).toEqual({
      taken: 0,
      skipped: 0,
      missed: 0,
      upcoming: 0,
      due: 0,
      rate: null,
    });
  });

  it('returns a null rate when only future doses exist', () => {
    // given
    const doses = [dose('pending', new Date(2026, 0, 10, 18))];

    // when
    const { total } = calculateAdherence(doses, FROM, TO, NOW);

    // then
    expect(total).toMatchObject({ upcoming: 1, due: 0, rate: null });
  });
});
