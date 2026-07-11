export function chance(percent: number): boolean {
  if (percent < 0 || percent > 100) {
    throw new RangeError('percent must be between 0 and 100');
  }

  return Math.random() * 100 < percent;
}
