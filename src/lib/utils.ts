export function roundTo(num: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(num * factor) / factor;
}

export function createTimestamp(date: Date, includeTime = true): string {
  const zeroLead = (str: number) => ('0' + str).slice(-2);

  if (includeTime) {
    return `${date.getFullYear()}-${zeroLead(date.getMonth() + 1)}-${zeroLead(
      date.getDate(),
    )} ${zeroLead(date.getHours())}:${zeroLead(date.getMinutes())}`;
  }

  return `${date.getFullYear()}-${zeroLead(date.getMonth() + 1)}-${zeroLead(
    date.getDate(),
  )}`;
}

export function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const zeroLead = (str: string | number) => ('0' + str).slice(-2);

const isLeapYear = (year: number) => new Date(year, 1, 29).getDate() === 29;

/**
 *
 * @param year
 * @param startMonth 1-12
 * @param monthly
 * @param quarter 1-4
 */
export function generateTimeRange(
  year: number,
  startMonth?: number,
  monthly = false,
  quarter?: number,
): { startTime: number; endTime: number } {
  if (startMonth !== undefined && (startMonth < 1 || startMonth > 12)) {
    throw new Error('[startMonth] must be between 1 and 12');
  }

  if (quarter !== undefined && (quarter < 1 || quarter > 4)) {
    throw new Error('[quarter] must be between 1 and 4');
  }

  let _startMonth = startMonth ? startMonth - 1 : 0;
  let endMonth = monthly
    ? _startMonth
    : _startMonth === 0
    ? 11
    : _startMonth - 1;

  if (quarter !== undefined) {
    endMonth = ((quarter - 1) * 3 + 2 + _startMonth) % 12;
    _startMonth = ((quarter - 1) * 3 + _startMonth) % 12;
  }

  const startYear =
    startMonth && _startMonth < startMonth - 1 ? year + 1 : year;
  const endYear = startMonth && endMonth < startMonth - 1 ? year + 1 : year;

  const endDay = [
    31,
    isLeapYear(endYear) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];

  return {
    startTime: new Date(
      `${startYear}-${zeroLead(_startMonth + 1)}-01T00:00:00`,
    ).getTime(),
    endTime: new Date(
      `${endYear}-${zeroLead(endMonth + 1)}-${endDay[endMonth]}T23:59:59`,
    ).getTime(),
  };
}

export function generateDateRange(
  startOn: Date,
  endOn: Date,
): { startTime: number; endTime: number } {
  return {
    startTime: new Date(
      `${createTimestamp(startOn, false)}T00:00:00`,
    ).getTime(),
    endTime: new Date(`${createTimestamp(endOn, false)}T23:59:59`).getTime(),
  };
}
