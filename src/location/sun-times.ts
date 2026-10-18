import type { Coords } from './dto/coords';

export interface SunTimes {
  sunrise: Date;
  noon: Date;
  sunset: Date;
}

const MS_PER_MINUTE = 60 * 1000;
const MINUTES_PER_DAY = 24 * 60;
const MS_PER_DAY = MINUTES_PER_DAY * MS_PER_MINUTE;
const UNIX_EPOCH_JULIAN_DAY = 2440587.5;
const J2000_JULIAN_DAY = 2451545;
const DAYS_PER_CENTURY = 36525;
// Sun's centre 50' below the horizon: 34' of refraction plus 16' of the radius
const SUNRISE_ZENITH_DEGREES = 90.833;

// NOAA solar calculator (Meeus), accurate to about a minute below 72° latitude.
// Returns null for polar day and polar night, when there is no sunrise or sunset.
export function sunTimes(
  date: Date,
  { latitude, longitude }: Coords,
): SunTimes | null {
  const dayStartUtc = Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const { declination, equationOfTimeMinutes } = solarPosition(
    dayStartUtc + MS_PER_DAY / 2,
  );

  const latitudeRad = toRadians(latitude);
  const cosHourAngle =
    Math.cos(toRadians(SUNRISE_ZENITH_DEGREES)) /
      (Math.cos(latitudeRad) * Math.cos(declination)) -
    Math.tan(latitudeRad) * Math.tan(declination);
  if (cosHourAngle > 1 || cosHourAngle < -1) return null;

  const hourAngleMinutes = toDegrees(Math.acos(cosHourAngle)) * 4;
  const noonMinutes =
    MINUTES_PER_DAY / 2 - 4 * longitude - equationOfTimeMinutes;
  const at = (minutes: number) =>
    new Date(dayStartUtc + Math.round(minutes * MS_PER_MINUTE));

  return {
    sunrise: at(noonMinutes - hourAngleMinutes),
    noon: at(noonMinutes),
    sunset: at(noonMinutes + hourAngleMinutes),
  };
}

function solarPosition(instantMs: number): {
  declination: number;
  equationOfTimeMinutes: number;
} {
  const julianCenturies =
    (instantMs / MS_PER_DAY + UNIX_EPOCH_JULIAN_DAY - J2000_JULIAN_DAY) /
    DAYS_PER_CENTURY;

  const meanLongitude = toRadians(
    (280.46646 +
      julianCenturies * (36000.76983 + julianCenturies * 0.0003032)) %
      360,
  );
  const meanAnomaly = toRadians(
    357.52911 + julianCenturies * (35999.05029 - 0.0001537 * julianCenturies),
  );
  const eccentricity =
    0.016708634 -
    julianCenturies * (0.000042037 + 0.0000001267 * julianCenturies);

  const equationOfCenter = toRadians(
    Math.sin(meanAnomaly) *
      (1.914602 - julianCenturies * (0.004817 + 0.000014 * julianCenturies)) +
      Math.sin(2 * meanAnomaly) * (0.019993 - 0.000101 * julianCenturies) +
      Math.sin(3 * meanAnomaly) * 0.000289,
  );
  const trueLongitude = meanLongitude + equationOfCenter;
  const apparentLongitude =
    trueLongitude -
    toRadians(
      0.00569 +
        0.00478 * Math.sin(toRadians(125.04 - 1934.136 * julianCenturies)),
    );

  const meanObliquity =
    23 +
    (26 +
      (21.448 -
        julianCenturies *
          (46.815 + julianCenturies * (0.00059 - julianCenturies * 0.001813))) /
        60) /
      60;
  const obliquity = toRadians(
    meanObliquity +
      0.00256 * Math.cos(toRadians(125.04 - 1934.136 * julianCenturies)),
  );

  const declination = Math.asin(
    Math.sin(obliquity) * Math.sin(apparentLongitude),
  );

  const y = Math.tan(obliquity / 2) ** 2;
  const equationOfTimeMinutes =
    4 *
    toDegrees(
      y * Math.sin(2 * meanLongitude) -
        2 * eccentricity * Math.sin(meanAnomaly) +
        4 *
          eccentricity *
          y *
          Math.sin(meanAnomaly) *
          Math.cos(2 * meanLongitude) -
        0.5 * y * y * Math.sin(4 * meanLongitude) -
        1.25 * eccentricity * eccentricity * Math.sin(2 * meanAnomaly),
    );

  return { declination, equationOfTimeMinutes };
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}
