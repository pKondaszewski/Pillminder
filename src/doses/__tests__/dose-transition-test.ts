import { type DoseState, planDoseTransition } from '../dose-transition';

const NOW = new Date(2026, 0, 10, 12, 0);

describe('planDoseTransition', () => {
  it('does nothing when the dose is already in the target state', () => {
    // given
    const dose = { state: 'skipped' as const, takenQuantity: null };

    // when
    const transition = planDoseTransition(dose, 'skipped', 1, NOW, null);

    // then
    expect(transition).toBeNull();
  });

  it.each<DoseState>(['pending', 'skipped'])(
    'deducts the schedule quantity when taking a %s dose',
    (from) => {
      // given
      const dose = { state: from, takenQuantity: null };

      // when
      const transition = planDoseTransition(dose, 'taken', 2, NOW, null);

      // then
      expect(transition).toEqual({
        state: 'taken',
        takenAt: NOW,
        takenQuantity: 2,
        stockDelta: -2,
      });
    },
  );

  it.each<[string, number | null, number | null, number]>([
    ['enough stock', 10, 3, -3],
    ['exactly the stock', 3, 3, -3],
    ['too little stock', 1, 1, -1],
    ['empty stock', 0, 0, -0],
    ['untracked stock', null, 3, -3],
  ])(
    'records what the stock allowed when taking a dose of 3 with %s',
    (_, stock, takenQuantity, stockDelta) => {
      // given
      const dose = { state: 'pending' as const, takenQuantity: null };

      // when
      const transition = planDoseTransition(dose, 'taken', 3, NOW, stock);

      // then
      expect(transition).toMatchObject({ takenQuantity, stockDelta });
    },
  );

  it('gives back zero when a dose was taken from an empty stock', () => {
    // given
    const dose = { state: 'taken' as const, takenQuantity: 0 };

    // when
    const transition = planDoseTransition(dose, 'pending', 3, NOW, 0);

    // then
    expect(transition?.stockDelta).toBe(0);
  });

  it('does not touch stock when skipping a pending dose', () => {
    // given
    const dose = { state: 'pending' as const, takenQuantity: null };

    // when
    const transition = planDoseTransition(dose, 'skipped', 2, NOW, null);

    // then
    expect(transition).toEqual({
      state: 'skipped',
      takenAt: null,
      takenQuantity: null,
      stockDelta: 0,
    });
  });

  it('does not touch stock when restoring a skipped dose to pending', () => {
    // given
    const dose = { state: 'skipped' as const, takenQuantity: null };

    // when
    const transition = planDoseTransition(dose, 'pending', 2, NOW, null);

    // then
    expect(transition?.stockDelta).toBe(0);
    expect(transition?.state).toBe('pending');
  });

  it.each<DoseState>(['pending', 'skipped'])(
    'restores exactly taken_quantity when moving a taken dose to %s',
    (target) => {
      // given
      const dose = { state: 'taken' as const, takenQuantity: 3 };

      // when
      const transition = planDoseTransition(dose, target, 1, NOW, null);

      // then
      expect(transition).toEqual({
        state: target,
        takenAt: null,
        takenQuantity: null,
        stockDelta: 3,
      });
    },
  );

  it('restores one unit for legacy taken doses without a quantity snapshot', () => {
    // given
    const dose = { state: 'taken' as const, takenQuantity: null };

    // when
    const transition = planDoseTransition(dose, 'pending', 5, NOW, null);

    // then
    expect(transition?.stockDelta).toBe(1);
  });
});

describe('planDoseTransition for a past dose correction', () => {
  const PLANNED_AT = new Date(2026, 0, 9, 8, 0);

  it.each<DoseState>(['pending', 'skipped'])(
    'records the planned time as takenAt when a %s dose is corrected to taken',
    (from) => {
      // given
      const dose = { state: from, takenQuantity: null };

      // when
      const transition = planDoseTransition(dose, 'taken', 2, PLANNED_AT, null);

      // then
      expect(transition?.takenAt).toEqual(PLANNED_AT);
      expect(transition?.stockDelta).toBe(-2);
    },
  );

  it('restores the snapshot quantity and clears takenAt when a taken dose is corrected to skipped', () => {
    // given
    const dose = { state: 'taken' as const, takenQuantity: 3 };

    // when
    const transition = planDoseTransition(dose, 'skipped', 1, PLANNED_AT, null);

    // then
    expect(transition).toEqual({
      state: 'skipped',
      takenAt: null,
      takenQuantity: null,
      stockDelta: 3,
    });
  });
});
