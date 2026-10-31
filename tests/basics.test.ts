import { describe, expect, it } from 'vitest';
import { chapters } from '../src/content';
import { SCAN_VALUES } from '../src/content/lessons/ch0';
import { halvings, humanTime, scanFrames } from '../src/widgets/basics';

describe('guided path', () => {
  it('opens with Start here and a warm-up in every later chapter but the first', () => {
    expect(chapters[0].id).toBe('start');
    expect(chapters[0].lessons.every((l) => l.warmup)).toBe(true);
    for (const ch of chapters.slice(2)) expect(ch.lessons[0].warmup, ch.id).toBe(true);
  });

  it('counts halvings as the whole part of log2', () => {
    expect(halvings(100)).toEqual([100, 50, 25, 12, 6, 3, 1]);
    for (const n of [1, 2, 7, 64, 1000]) expect(halvings(n).length - 1).toBe(Math.floor(Math.log2(n)));
  });

  it('scans for the largest with n - 1 comparisons', () => {
    const last = scanFrames(SCAN_VALUES).at(-1)!;
    expect(SCAN_VALUES[last.best]).toBe(Math.max(...SCAN_VALUES));
    expect(scanFrames(SCAN_VALUES)).toHaveLength(SCAN_VALUES.length + 1);
  });

  it('turns step counts into readable times', () => {
    expect(humanTime(1e12)).toBe('17 min');
    expect(humanTime(10)).toBe('instant');
    expect(humanTime(2 ** 100)).toBe('longer than the age of the universe');
  });
});
