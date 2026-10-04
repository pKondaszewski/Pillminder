import { type DoseState, planDoseTransition } from '../dose-transition';

const NOW = new Date(2026, 0, 10, 12, 0);

describe('planDoseTransition', () => {
  it('does nothing when the dose is already in the target state', () => {
    // given
    const dose = { state: 'skipped' as const, takenQuantity: null };

    // when
    const transition = planDoseTransition(dose, 'skipped', 1, NOW);

    // then
    expect(transition).toBeNull();
  });

  it.each<DoseState>(['pending', 'skipped'])(
    'deducts the schedule quantity when taking a %s dose',
    (from) => {
      // given
      const dose = { state: from, takenQuantity: null };

      // when
      const transition = planDoseTransition(dose, 'taken', 2, NOW);

      // then
      expect(transition).toEqual({
        state: 'taken',
        takenAt: NOW,
        takenQuantity: 2,
        stockDelta: -2,
      });
    },
  );

  it('does not touch stock when skipping a pending dose', () => {
    // given
    const dose = { state: 'pending' as const, takenQuantity: null };

    // when
    const transition = planDoseTransition(dose, 'skipped', 2, NOW);

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
    const transition = planDoseTransition(dose, 'pending', 2, NOW);

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
      const transition = planDoseTransition(dose, target, 1, NOW);

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
    const transition = planDoseTransition(dose, 'pending', 5, NOW);

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
      const transition = planDoseTransition(dose, 'taken', 2, PLANNED_AT);

      // then
      expect(transition?.takenAt).toEqual(PLANNED_AT);
      expect(transition?.stockDelta).toBe(-2);
    },
  );

  it('restores the snapshot quantity and clears takenAt when a taken dose is corrected to skipped', () => {
    // given
    const dose = { state: 'taken' as const, takenQuantity: 3 };

    // when
    const transition = planDoseTransition(dose, 'skipped', 1, PLANNED_AT);

    // then
    expect(transition).toEqual({
      state: 'skipped',
      takenAt: null,
      takenQuantity: null,
      stockDelta: 3,
    });
  });
});
