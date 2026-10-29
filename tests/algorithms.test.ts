import { describe, expect, it } from 'vitest';
import { loopC, loopD, loopE, loopH } from '../src/content/lessons/ch1';
import { sampleGraph } from '../src/content/lessons/ch2';
import { SAMPLE_RECORDS } from '../src/content/lessons/ch6';
import { smallGraph, railGraph } from '../src/content/lessons/ch7';
import { jugBfs } from '../src/widgets/search';
import { BS_ARRAY, bsCost, josephus } from '../src/widgets/shrink';
import { traverse } from '../src/widgets/split';
import { countOps } from '../src/widgets/cost';
import { dijkstra } from '../src/widgets/routes';
import { comparisonCountingFrames, distributionFrames } from '../src/widgets/memory';
import { avlFrames, heapFrames, toTNode } from '../src/widgets/reshape';
import { kadaneFrames, tournament } from '../src/widgets/puzzles';
import type { TNode } from '../src/widgets/kit';

const last = <T>(a: T[]) => a[a.length - 1];

describe('measuring cost', () => {
  it('counts loop iterations', () => {
    expect(countOps(loopC, 6)).toBe(36);
    expect(countOps(loopD, 6)).toBe(15);
    expect(countOps(loopE, 16)).toBe(5);
    // Loop F: 1 + 2 + 4 + 8 + 16 = 31 < 2N
    expect(countOps(loopH, 16)).toBe(31);
  });
});

describe('try everything', () => {
  it('solves the 8/5/3 jug puzzle in 6 pours', () => {
    expect(jugBfs().moves).toBe(6);
  });
  it('has a sample graph with 7 vertices and 9 edges', () => {
    expect(sampleGraph.nodes).toHaveLength(7);
    expect(sampleGraph.edges).toHaveLength(9);
  });
});

describe('make it smaller', () => {
  it('binary search costs on the sample array', () => {
    const costs = BS_ARRAY.map((v) => bsCost(BS_ARRAY, v));
    expect(Math.max(...costs)).toBe(4);
    expect(BS_ARRAY.filter((_, i) => costs[i] === 4)).toEqual([14, 31, 42, 74, 85, 98]);
    expect(costs.reduce((a, b) => a + b, 0)).toBe(41);
  });
  it('Josephus survivors and rounds match the reference example', () => {
    expect(josephus(6).survivor).toBe(5);
    expect(josephus(6).order).toEqual([
      { who: 2, round: 1 },
      { who: 4, round: 1 },
      { who: 6, round: 1 },
      { who: 3, round: 2 },
      { who: 1, round: 2 },
    ]);
    expect(josephus(7).survivor).toBe(7);
    expect(josephus(7).order.find((o) => o.who === 1)?.round).toBe(1);
    for (let n = 1; n <= 64; n++) {
      const m = 2 ** Math.floor(Math.log2(n));
      expect(josephus(n).survivor).toBe(2 * (n - m) + 1);
    }
  });
});

describe('split in two', () => {
  it('traverses the sample tree', async () => {
    const { SAMPLE_TREE } = await import('../src/widgets/split');
    expect(traverse(SAMPLE_TREE, 'pre').join('')).toBe('abdecf');
    expect(traverse(SAMPLE_TREE, 'in').join('')).toBe('dbeacf');
    expect(traverse(SAMPLE_TREE, 'post').join('')).toBe('debfca');
  });
});

describe('change the shape', () => {
  it('builds the sample heap both ways', () => {
    expect(last(heapFrames([1, 8, 6, 5, 3, 7, 4], 'bottom-up')).arr).toEqual([8, 5, 7, 1, 3, 6, 4]);
    expect(last(heapFrames([1, 8, 6, 5, 3, 7, 4], 'top-down')).arr).toEqual([8, 5, 7, 1, 3, 6, 4]);
    expect(last(heapFrames([1, 2, 3], 'bottom-up')).arr).toEqual([3, 2, 1]);
    expect(last(heapFrames([1, 2, 3], 'top-down')).arr).toEqual([3, 1, 2]);
  });
  it('heapsorts', () => {
    expect(last(heapFrames([1, 2, 3, 4, 5], 'heapsort')).arr).toEqual([1, 2, 3, 4, 5]);
    expect(last(heapFrames([5, 3, 9, 1, 7, 2], 'heapsort')).arr).toEqual([1, 2, 3, 5, 7, 9]);
  });
  it('builds the sample AVL trees', () => {
    const pre = (t: TNode | null | undefined): string[] => (t ? [t.label, ...pre(t.left), ...pre(t.right)] : []);
    const a = last(avlFrames([1, 2, 3, 4, 5, 6]));
    expect(a.rotations).toBe(3);
    expect(pre(toTNode(a.root)).join(' ')).toBe('4 2 1 3 5 6');
    const b = avlFrames([3, 10, 13, 4, 16, 8, 6, 14, 9, 7]);
    expect(last(b).rotations).toBe(4);
    expect(pre(toTNode(last(b).root)).join(' ')).toBe('10 6 4 3 8 7 9 14 13 16');
    const kinds = b.filter((f) => f.hot && f.msg.includes('apply')).map((f) => /\((L|R|LR|RL)\)/.exec(f.msg)![1]);
    expect(kinds).toEqual(['L', 'L', 'RL', 'RL']);
  });
});

describe('memory for speed', () => {
  it('comparison counting sort', () => {
    const f = last(comparisonCountingFrames([60, 35, 81, 98, 14, 47]));
    expect(f.count).toEqual([3, 1, 4, 5, 0, 2]);
    expect(f.S).toEqual([14, 35, 47, 60, 81, 98]);
  });
  it('distribution counting is stable', () => {
    const f = last(distributionFrames(SAMPLE_RECORDS, 12, 18));
    expect(f.out.map((r) => r![1]).join('')).toBe('ECHBDGAF');
  });
});

describe('best step first', () => {
  it('Dijkstra on the sample graphs', () => {
    expect(dijkstra(smallGraph, 'a').dist).toEqual({ a: 0, b: 3, c: 7, d: 5, e: 9 });
    expect(dijkstra(railGraph, 'N').dist.G).toBe(7.5);
  });
});

describe('puzzle box', () => {
  it('tournament second largest', () => {
    const t = tournament([3, 1, 2, 5, 6, 8, 9, 4]);
    expect(t.champ).toBe(9);
    expect(t.beaten).toEqual([4, 8, 5]);
    expect(t.second).toBe(8);
  });
  it('maximum subarray', () => {
    expect(last(kadaneFrames([2, -3, 4, -1, -2, 1, 5, -3])).best).toBe(7);
  });
});
