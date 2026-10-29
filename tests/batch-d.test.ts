import { describe, expect, it } from 'vitest';
import { streetGraph } from '../src/content/lessons/ch7x';
import { worstCaseDrops } from '../src/widgets/puzzles-extra';
import { dijkstra } from '../src/widgets/routes';

describe('one-way streets', () => {
  it('shortest times from vertex 1 follow arrows only', () => {
    expect(dijkstra(streetGraph, '1').dist).toEqual({ '1': 0, '2': 2, '3': 5, '4': 4, '5': 8, '6': 7, '7': 8, '8': 9 });
  });
});

describe('drop test', () => {
  it('worst-case drops for 1, 2 and many devices', () => {
    expect(worstCaseDrops(20, 1)).toBe(20);
    expect(worstCaseDrops(36, 2)).toBe(8);
    expect(worstCaseDrops(100, 2)).toBe(14);
    expect(worstCaseDrops(100, 7)).toBe(7);
  });
});
