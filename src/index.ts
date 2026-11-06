export interface HorspoolOptions {
  maxPattern?: number;
}
export interface FindOptions {
  start?: number;
  maxInput?: number;
  maxMatches?: number;
}
export interface HorspoolSearch {
  readonly pattern: string;
  findAll(text: string, options?: FindOptions): number[];
}
function positive(n: number): void {
  if (!Number.isSafeInteger(n) || n < 1) throw new RangeError('Expected positive integer budget.');
}
/** Boyer-Moore-Horspool bad-character shifts, comparing UTF-16 code units. */
export function createHorspool(pattern: string, options: HorspoolOptions = {}): HorspoolSearch {
  const maxPattern = options.maxPattern ?? 100_000;
  positive(maxPattern);
  if (typeof pattern !== 'string' || !pattern.length || pattern.length > maxPattern)
    throw new TypeError('Expected nonempty bounded pattern.');
  const shifts = new Map<number, number>();
  const length = pattern.length;
  for (let i = 0; i < length - 1; i++) shifts.set(pattern.charCodeAt(i), length - i - 1);
  return {
    pattern,
    findAll(text, query = {}) {
      const { start = 0, maxInput = 1_000_000, maxMatches = 100_000 } = query;
      positive(maxInput);
      positive(maxMatches);
      if (typeof text !== 'string' || text.length > maxInput)
        throw new TypeError('Invalid or oversized text.');
      if (!Number.isSafeInteger(start) || start < 0 || start > text.length)
        throw new RangeError('Invalid start offset.');
      const result: number[] = [];
      let end = start + length - 1;
      while (end < text.length) {
        let j = length - 1;
        while (j >= 0 && pattern.charCodeAt(j) === text.charCodeAt(end - length + 1 + j)) j--;
        if (j < 0) {
          if (result.length >= maxMatches) throw new RangeError('Match budget exceeded.');
          result.push(end - length + 1);
        }
        end += shifts.get(text.charCodeAt(end)) ?? length;
      }
      return result;
    },
  };
}
