export function roundTo(num: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(num * factor) / factor;
}

export function createTimestamp(date: Date): string {
  const zeroLead = (str: number) => ('0' + str).slice(-2);

  return `${date.getFullYear()}-${zeroLead(date.getMonth() + 1)}-${zeroLead(
    date.getDate(),
  )} ${zeroLead(date.getHours())}:${zeroLead(date.getMinutes())}`;
}
