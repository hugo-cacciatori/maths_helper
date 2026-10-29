import { describe, expect, it } from 'vitest';
import { ZIGZAG_KEYS } from '../src/content/lessons/ch5x';
import { avlFrames } from '../src/widgets/reshape';
import { breakEven, closestPair, everyPairCost, HEAP9, heapMinFrames, minAvlNodes, plainBstFrames, thinTree } from '../src/widgets/reshape-extra';

const last = <T>(a: T[]) => a[a.length - 1];

describe('sort first?', () => {
  it('closest pair after sorting matches the every-pair answer', () => {
    const xs = [31.5, 2, 77, 30, 55.5, 12, 90];
    let best = Infinity;
    for (let i = 0; i < xs.length; i++) for (let j = i + 1; j < xs.length; j++) best = Math.min(best, Math.abs(xs[i] - xs[j]));
    expect(closestPair(xs).gap).toBe(best);
    expect(everyPairCost(7)).toBe(21);
  });
  it('break-even number of searches', () => {
    expect(breakEven(1e3)).toBe(21);
    expect(breakEven(1e6)).toBe(40);
  });
});

describe('tree heights', () => {
  it('thinnest balanced trees', () => {
    expect([0, 1, 2, 3, 4, 5].map(minAvlNodes)).toEqual([1, 2, 4, 7, 12, 20]);
    const count = (t: ReturnType<typeof thinTree>): number => (t ? 1 + count(t.left ?? null) + count(t.right ?? null) : 0);
    expect(count(thinTree(4))).toBe(12);
  });
  it('zigzag keys: chain vs balanced', () => {
    expect(last(plainBstFrames(ZIGZAG_KEYS)).height).toBe(10);
    const h = (t: { left: unknown; right: unknown } | null): number => (t ? 1 + Math.max(h(t.left as never), h(t.right as never)) : -1);
    expect(h(last(avlFrames(ZIGZAG_KEYS)).root)).toBe(3);
  });
});

describe('heap tricks', () => {
  it('finds and deletes the smallest key of a max-heap', () => {
    const f = heapMinFrames(HEAP9);
    expect(last(f).comps).toBe(Math.ceil(HEAP9.length / 2) - 1);
    expect(last(f).arr).toEqual([9, 7, 8, 4, 5, 6, 2, 3]);
  });
});
