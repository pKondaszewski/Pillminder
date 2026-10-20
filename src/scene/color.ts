const HEX_CHANNEL_RADIX = 16;
const RGB_FUNCTION = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/;

type Rgb = [number, number, number];

export function mixColors(from: string, to: string, share: number): string {
  const start = parseRgb(from);
  const end = parseRgb(to);
  const channels = start.map((value, index) =>
    Math.round(value + (end[index] - value) * share),
  );
  return `#${channels.map(hexChannel).join('')}`;
}

export function withAlpha(color: string, alpha: number): string {
  const [red, green, blue] = parseRgb(color);
  return `rgba(${red},${green},${blue},${alpha})`;
}

function parseRgb(color: string): Rgb {
  const fromFunction = RGB_FUNCTION.exec(color);
  if (fromFunction) {
    return [
      Number(fromFunction[1]),
      Number(fromFunction[2]),
      Number(fromFunction[3]),
    ];
  }
  const digits = expandShortHex(color.replace('#', ''));
  if (!/^[0-9a-f]{6}([0-9a-f]{2})?$/i.test(digits)) {
    throw new Error(`Unsupported color: ${color}`);
  }
  return [0, 2, 4].map((offset) =>
    parseInt(digits.slice(offset, offset + 2), HEX_CHANNEL_RADIX),
  ) as Rgb;
}

function expandShortHex(digits: string): string {
  return digits.length === 3 || digits.length === 4
    ? [...digits].map((digit) => digit + digit).join('')
    : digits;
}

function hexChannel(value: number): string {
  return value.toString(HEX_CHANNEL_RADIX).padStart(2, '0');
}
