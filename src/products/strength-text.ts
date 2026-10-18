const UNIT_SPELLINGS: Record<string, string> = {
  mg: 'mg',
  g: 'g',
  µg: 'µg',
  μg: 'µg',
  ug: 'µg',
  mcg: 'µg',
  iu: 'IU',
  'j.m.': 'IU',
  jm: 'IU',
  ml: 'ml',
  '%': '%',
};

const AMOUNT_WITH_UNIT = buildAmountWithUnitPattern();

export function normalizeStrength(text: string): string {
  return text
    .trim()
    .replace(AMOUNT_WITH_UNIT, (_, amount: string, unit: string) => {
      const normalizedUnit = UNIT_SPELLINGS[unit.toLowerCase()];
      return normalizedUnit === '%'
        ? `${amount}%`
        : `${amount} ${normalizedUnit}`;
    });
}

function buildAmountWithUnitPattern(): RegExp {
  const units = Object.keys(UNIT_SPELLINGS)
    .sort((a, b) => b.length - a.length)
    .map((unit) => unit.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  return new RegExp(
    `(?<![\\p{L}\\d.,])(\\d+(?:[.,]\\d+)?)\\s*(${units})(?![\\p{L}\\d])`,
    'giu',
  );
}
