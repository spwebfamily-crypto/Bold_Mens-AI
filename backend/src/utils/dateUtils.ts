import { DateTime } from 'luxon';

export function normaliseTimezone(timezone?: string) {
  if (!timezone) {
    return 'Europe/Lisbon';
  }

  const dateTime = DateTime.now().setZone(timezone);
  return dateTime.isValid ? timezone : 'Europe/Lisbon';
}

export function getTodayKey(timezone?: string) {
  return DateTime.now().setZone(normaliseTimezone(timezone)).toISODate() ?? DateTime.now().toISODate()!;
}

export function getNextMidnight(timezone?: string) {
  return DateTime.now()
    .setZone(normaliseTimezone(timezone))
    .plus({ days: 1 })
    .startOf('day')
    .toUTC()
    .toJSDate();
}

export function getImageDeleteAt() {
  return DateTime.now().plus({ hours: 24 }).toJSDate();
}
