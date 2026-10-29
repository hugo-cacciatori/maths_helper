import { describe, expect, it } from 'vitest';
import { GLASSES_MIXED, GLASSES_START, WALK_KEYS } from '../src/content/lessons/ch3x';
import { REBUILD_IN, REBUILD_POST, SELECT_VALUES } from '../src/content/lessons/ch4x';
import type { TNode } from '../src/widgets/kit';
import { bstFrom, glassTarget, halveAll, inorder, maxPath, riverDone, riverMove } from '../src/widgets/shrink-extra';
import { nutsBoltsFrames, quickSelectFrames, rebuild } from '../src/widgets/split-extra';

const last = <T>(a: T[]) => a[a.length - 1];

describe('river crossing', () => {
  it('moves n soldiers in 4n crossings', () => {
    for (const n of [1, 2, 5]) {
      let s = { left: { kids: 2, soldiers: n }, right: { kids: 0, soldiers: 0 }, boat: 'left' as const, crossings: 0 } as Parameters<typeof riverMove>[0];
      for (let i = 0; i < n; i++) for (const l of ['kids2', 'kid1', 'soldier', 'kid1'] as const) s = riverMove(s, l)!;
      expect(riverDone(s, n)).toBe(true);
      expect(s.crossings).toBe(4 * n);
    }
  });
  it('refuses impossible loads', () => {
    const s = { left: { kids: 0, soldiers: 1 }, right: { kids: 2, soldiers: 0 }, boat: 'left' as const, crossings: 0 };
    expect(riverMove(s, 'kid1')).toBeNull();
  });
});

describe('fewest moves', () => {
  const misplacedFull = (g: boolean[]) => g.filter((full, i) => full && !glassTarget(g.length)[i]).length;
  it('glasses', () => {
    expect(misplacedFull(GLASSES_START)).toBe(2);
    expect(misplacedFull(GLASSES_MIXED)).toBe(2);
  });
  it('halving cuts', () => {
    const cuts = (n: number) => {
      let p = [n];
      let c = 0;
      while (p.some((x) => x > 1)) {
        p = halveAll(p);
        c++;
      }
      return c;
    };
    expect(cuts(10)).toBe(4);
    expect(cuts(100)).toBe(7);
    expect(cuts(64)).toBe(6);
  });
});

describe('search-tree walks', () => {
  it('largest key and orders', () => {
    const t = bstFrom(WALK_KEYS);
    expect(maxPath(t)).toEqual(['50', '70', '80', '90']);
    expect(inorder(t).map(Number)).toEqual([...WALK_KEYS].sort((a, b) => a - b));
    expect(inorder(bstFrom([5, 3, 8, 1, 4, 9]))).toEqual(inorder(bstFrom([4, 1, 8, 3, 9, 5])));
  });
});

describe('nuts and bolts', () => {
  it('matches every pair', () => {
    const f = last(nutsBoltsFrames([3, 6, 1, 5, 2, 4, 7], [4, 1, 7, 6, 3, 5, 2]));
    expect(f.nuts).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(f.bolts).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(f.matched).toHaveLength(7);
  });
});

describe('rebuild and select', () => {
  it('rebuilds the tree from in-order and post-order', () => {
    const pre = (t: TNode | null | undefined): string[] => (t ? [t.id, ...pre(t.left), ...pre(t.right)] : []);
    const t = rebuild(REBUILD_IN, REBUILD_POST);
    expect(pre(t).join(' ')).toBe('2 3 9 0 1 4 8 7 6 5');
    expect(inorder(t)).toEqual(REBUILD_IN);
  });
  it('finds every k-th largest', () => {
    const sorted = [...SELECT_VALUES].sort((a, b) => b - a);
    for (let k = 1; k <= SELECT_VALUES.length; k++) {
      const f = last(quickSelectFrames(SELECT_VALUES, k));
      expect(f.arr[f.found!]).toBe(sorted[k - 1]);
    }
  });
});
