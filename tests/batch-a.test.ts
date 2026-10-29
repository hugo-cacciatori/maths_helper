import { describe, expect, it } from 'vitest';
import { cubesSpec, minSpec } from '../src/content/lessons/ch1x';
import { bestMinutes, celebrityFrames, chainFrames, pairPlanMinutes, polyCosts } from '../src/widgets/cost-extra';
import { CLIQUE_GRAPH, cliqueFrames, partitionFrames } from '../src/widgets/search-extra';

const last = <T>(a: T[]) => a[a.length - 1];

describe('recursion counting', () => {
  it('sums cubes with 2(n-1) multiplications', () => {
    const f = last(chainFrames(cubesSpec, 4));
    expect(f.values[4]).toBe(100);
    expect(f.ops).toBe(6);
    expect(last(chainFrames(cubesSpec, 10)).ops).toBe(18);
  });
  it('finds the minimum with k-1 comparisons', () => {
    const f = last(chainFrames(minSpec, 7));
    expect(f.values[7]).toBe(1);
    expect(f.ops).toBe(6);
  });
});

describe('who knows whom', () => {
  const KNOWS = [
    [0, 1, 0, 1, 0, 0],
    [1, 0, 1, 1, 0, 1],
    [0, 0, 0, 1, 1, 0],
    [0, 0, 0, 0, 0, 0],
    [1, 0, 0, 1, 0, 1],
    [0, 1, 0, 1, 1, 0],
  ];
  it('finds the celebrity in 3(n-1) questions', () => {
    const f = last(celebrityFrames(KNOWS));
    expect(f.verdict).toBe(true);
    expect(f.cand).toBe(3);
    expect(f.questions).toBe(15);
  });
  it('detects a group without a celebrity', () => {
    const k = KNOWS.map((r) => [...r]);
    k[3][4] = 1;
    expect(last(celebrityFrames(k)).verdict).toBe(false);
  });
});

describe('grill', () => {
  it('pair plan vs optimum', () => {
    expect([1, 2, 3, 4, 5].map(pairPlanMinutes)).toEqual([2, 2, 4, 4, 6]);
    expect([1, 2, 3, 4, 5].map(bestMinutes)).toEqual([2, 2, 3, 4, 5]);
  });
});

describe('polynomial and subsets', () => {
  it('multiplication counts', () => {
    expect(polyCosts(10)).toEqual({ scratch: 55, incremental: 19, horner: 10 });
  });
  it('equal-sum split of 3 1 4 2 2', () => {
    expect(partitionFrames([3, 1, 4, 2, 2], false).frames).toHaveLength(32);
    expect(last(partitionFrames([3, 1, 4, 2, 2], false).frames).found).toHaveLength(4);
    expect(last(partitionFrames([3, 1, 4, 2, 2], true).frames).found).toHaveLength(2);
  });
  it('finds the only 4-clique', () => {
    const f = cliqueFrames(CLIQUE_GRAPH, 4);
    expect(f).toHaveLength(15);
    expect(last(f).checks).toBe(90);
    expect(last(f).found).toEqual([['b', 'c', 'd', 'f']]);
  });
});
