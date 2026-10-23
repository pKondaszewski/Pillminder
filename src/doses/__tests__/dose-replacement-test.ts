import { planPendingReplacement } from '../dose-replacement';
import type { Dose, NewDoseSlot } from '../dose-repository';

const NOW = new Date(2026, 9, 24, 0, 28);

function dose(id: string, plannedAt: Date): Dose {
  return {
    id,
    productId: 'product',
    scheduleId: 'schedule',
    plannedAt,
    state: 'pending',
    takenAt: null,
    takenQuantity: null,
    snoozedUntil: null,
  };
}

function slot(plannedAt: Date): NewDoseSlot {
  return { productId: 'product', scheduleId: 'schedule', plannedAt };
}

describe('planPendingReplacement', () => {
  it("removes today's overdue pending dose whose slot left the schedule", () => {
    // given
    const overdue = dose('old', new Date(2026, 9, 24, 0, 25));
    const slots = [slot(new Date(2026, 9, 24, 0, 30))];

    // when
    const plan = planPendingReplacement([overdue], slots, NOW);

    // then
    expect(plan.removedIds).toEqual(['old']);
    expect(plan.kept).toEqual([]);
    expect(plan.newSlots).toEqual(slots);
  });

  it("keeps today's overdue pending dose whose slot is still in the schedule", () => {
    // given
    const overdue = dose('same', new Date(2026, 9, 24, 0, 25));
    const slots = [slot(new Date(2026, 9, 24, 0, 25))];

    // when
    const plan = planPendingReplacement([overdue], slots, NOW);

    // then
    expect(plan.removedIds).toEqual([]);
    expect(plan.kept).toEqual([]);
    expect(plan.newSlots).toEqual([]);
  });

  it('does not recreate a today slot that is already past and has no pending dose', () => {
    // given
    const slots = [slot(new Date(2026, 9, 24, 0, 20))];

    // when
    const plan = planPendingReplacement([], slots, NOW);

    // then
    expect(plan.newSlots).toEqual([]);
  });

  it('replaces upcoming doses: removes the old time, keeps the unchanged one, adds the new one', () => {
    // given
    const upcomingOld = dose('old', new Date(2026, 9, 25, 8));
    const upcomingSame = dose('same', new Date(2026, 9, 25, 20));
    const slots = [
      slot(new Date(2026, 9, 25, 20)),
      slot(new Date(2026, 9, 25, 9)),
    ];

    // when
    const plan = planPendingReplacement(
      [upcomingOld, upcomingSame],
      slots,
      NOW,
    );

    // then
    expect(plan.removedIds).toEqual(['old']);
    expect(plan.kept).toEqual([upcomingSame]);
    expect(plan.newSlots).toEqual([slots[1]]);
  });
});
