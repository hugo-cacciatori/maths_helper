import { cleanup, fireEvent, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { StepView } from '../src/components/LessonPlayer';
import { allLessons } from '../src/content';
import { addConstQ, compareQ, doublingSumQ, loopD, oddSumQ, quadrupleQ, rangeCompsQ, symmetricCompsQ, triangleQ, twoCallsQ } from '../src/content/lessons/ch1';
import { cubeMultsQ, cubesSpec } from '../src/content/lessons/ch1x';
import { bsMaxQ, josephusQ, nimMoveQ } from '../src/content/lessons/ch3';
import { masterQ, powerMultsQ } from '../src/content/lessons/ch4';
import { kthQ } from '../src/content/lessons/ch4x';
import { avlRotationsQ, heapQ } from '../src/content/lessons/ch5';
import { closestGapQ, minAvlQ, productQ } from '../src/content/lessons/ch5x';
import { routeQ, smallGraph } from '../src/content/lessons/ch7';
import { maxRunQ, pilesQ, weighingsQ } from '../src/content/lessons/ch8';
import { twoDevicesQ } from '../src/content/lessons/ch8x';
import type { TNode } from '../src/widgets/kit';
import { worstCaseDrops } from '../src/widgets/puzzles-extra';
import { avlFrames, toTNode } from '../src/widgets/reshape';
import { traverse } from '../src/widgets/split';
import { quickSelectFrames } from '../src/widgets/split-extra';
import { choiceOf, rng } from '../src/lib/random';
import type { QuestionStep } from '../src/lib/types';
import { chainFrames } from '../src/widgets/cost-extra';
import { countOps } from '../src/widgets/cost';
import { bsCost, josephus } from '../src/widgets/shrink';

afterEach(cleanup);

const num = (q: QuestionStep) => (q.kind === 'number' ? q.answer : NaN);
const range = (lo: number, hi: number) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

describe('random source', () => {
  it('is reproducible and stays in range', () => {
    const a = rng(42);
    const b = rng(42);
    for (let i = 0; i < 1000; i++) {
      const x = a.int(3, 9);
      expect(b.int(3, 9)).toBe(x);
      expect(x).toBeGreaterThanOrEqual(3);
      expect(x).toBeLessThanOrEqual(9);
    }
    const seen = new Set(range(0, 999).map(() => a.int(1, 6)));
    expect(seen.size).toBe(6);
  });
  it('places the right option exactly once', () => {
    const r = rng(7);
    for (let i = 0; i < 100; i++) {
      const { options, answer } = choiceOf(r, 'x', ['a', 'x', 'b', 'a']);
      expect(options[answer]).toBe('x');
      expect(options.filter((o) => o === 'x')).toHaveLength(1);
      expect(new Set(options).size).toBe(options.length);
    }
  });
});

describe('generated answers match the reference code', () => {
  it('measuring cost', () => {
    for (const k of range(2, 5)) expect(num(quadrupleQ(k))).toBeCloseTo(4 ** k);
    for (const N of range(4, 12)) expect(num(triangleQ(N))).toBe(countOps(loopD, N));
    for (const k of range(20, 600)) expect(num(oddSumQ(k))).toBe(sum(range(1, k).map((i) => 2 * i - 1)));
    for (const k of range(5, 14)) expect(num(doublingSumQ(k))).toBe(sum(range(1, k).map((i) => 2 ** i)));
    for (const n of range(5, 40)) expect(num(rangeCompsQ(n))).toBe(2 * (n - 1));
    for (const n of range(4, 30)) expect(num(symmetricCompsQ(n))).toBe(sum(range(0, n - 2).flatMap((i) => range(i + 1, n - 1)).map(() => 1)));
    for (const c of range(2, 9))
      for (const N of [20, 77, 200]) {
        let x = 0;
        for (let n = 2; n <= N; n++) x += c;
        expect(num(addConstQ(c, N))).toBe(x);
      }
    const calls = (n: number): number => (n === 0 ? 1 : 1 + 2 * calls(n - 1));
    for (const n of range(3, 8)) expect(num(twoCallsQ(n))).toBe(calls(n));
    for (const n of range(5, 40)) expect(num(cubeMultsQ(n))).toBe(chainFrames(cubesSpec, n).at(-1)?.ops);
  });

  it('growth comparisons follow the degrees, not the coefficients', () => {
    const q = (a: number, p: number, b: number, d: number) => {
      const s = compareQ(a, p, b, d);
      return s.kind === 'choice' ? s.answer : -1;
    };
    expect(q(50, 2, 1, 2)).toBe(0);
    expect(q(50, 1, 1, 3)).toBe(1);
    expect(q(1, 4, 50, 2)).toBe(2);
  });

  it('make it smaller', () => {
    for (const n of [20, 31, 32, 33, 100, 1000, 4095, 4096, 5000]) {
      const A = range(1, n).map((i) => 2 * i);
      const worst = Math.max(...A.map((v) => bsCost(A, v)), ...range(0, n).map((i) => bsCost(A, 2 * i + 1)));
      expect(num(bsMaxQ(n))).toBe(worst);
    }
    for (const n of range(20, 120)) expect(num(josephusQ(n))).toBe(josephus(n).survivor);
    for (const m of range(2, 7))
      for (const n of range(20, 150)) {
        if ((n - 1) % (m + 1) === 0) continue;
        const take = num(nimMoveQ(n, m));
        expect(take).toBeGreaterThanOrEqual(1);
        expect(take).toBeLessThanOrEqual(m);
        expect((n - take - 1) % (m + 1)).toBe(0); // leaves a losing position
      }
  });

  it('split in two', () => {
    const mults = (n: number): number => (n === 1 ? 0 : mults(Math.floor(n / 2)) + 1 + (n % 2));
    for (const n of range(10, 200)) expect(num(powerMultsQ(n))).toBe(mults(n));
    for (const a of range(1, 9))
      for (const b of range(2, 4))
        for (const d of range(0, 3)) {
          const q = masterQ(a, b, d);
          const expected = Math.log(a) < d * Math.log(b) - 1e-9 ? 0 : Math.abs(Math.log(a) - d * Math.log(b)) < 1e-9 ? 1 : 2;
          expect(q.kind === 'choice' && q.answer, `${a} ${b} ${d}`).toBe(expected);
        }
    const r = rng(3);
    for (let t = 0; t < 200; t++) {
      const vals = r.shuffle(range(1, 40)).slice(0, 9);
      const k = r.int(2, 5);
      const found = quickSelectFrames(vals, k).at(-1)!;
      expect(num(kthQ(vals, k))).toBe(found.arr[found.found!]);
    }
  });

  it('change the shape', () => {
    const r = rng(5);
    for (let t = 0; t < 200; t++) {
      const keys = r.shuffle(range(1, 30)).slice(0, 7);
      const q = heapQ(keys);
      const heap = q.kind === 'sequence' ? q.answer.map(Number) : [];
      expect([...heap].sort((x, y) => x - y)).toEqual([...keys].sort((x, y) => x - y));
      heap.forEach((v, i) => i > 0 && expect(heap[Math.floor((i - 1) / 2)]).toBeGreaterThanOrEqual(v));

      const avlKeys = r.shuffle(range(1, 40)).slice(0, 6);
      expect(num(avlRotationsQ(avlKeys))).toBeGreaterThanOrEqual(0);
      const root = toTNode(avlFrames(avlKeys).at(-1)!.root);
      const height = (n: TNode | null | undefined): number => (n ? 1 + Math.max(height(n.left), height(n.right)) : 0);
      const check = (n: TNode | null | undefined): void => {
        if (!n) return;
        expect(Math.abs(height(n.left) - height(n.right))).toBeLessThanOrEqual(1);
        check(n.left);
        check(n.right);
      };
      check(root);
      expect(traverse(root, 'in').map(Number)).toEqual([...avlKeys].sort((x, y) => x - y));

      const vals = r.shuffle(range(1, 99)).slice(0, 8);
      const gaps = vals.flatMap((x, i) => vals.slice(i + 1).map((y) => Math.abs(x - y)));
      expect(num(closestGapQ(vals))).toBe(Math.min(...gaps));
    }
    const N = (h: number): number => (h === 0 ? 1 : h === 1 ? 2 : N(h - 1) + N(h - 2) + 1);
    for (const h of range(2, 9)) expect(num(minAvlQ(h))).toBe(N(h));
    for (const n of range(10, 199)) expect(num(productQ(n))).toBe(Math.max(...range(1, n - 1).map((a) => a * (n - a))));
  });

  it('best step first', () => {
    // Every simple path from a, by depth-first enumeration.
    const best = (w: number[], target: string) => {
      const edges = smallGraph.edges.map((e, i) => ({ ...e, w: w[i] }));
      let min = Infinity;
      const walk = (at: string, seen: Set<string>, len: number) => {
        if (at === target) min = Math.min(min, len);
        for (const e of edges) {
          const next = e.u === at ? e.v : e.v === at ? e.u : null;
          if (next && !seen.has(next)) walk(next, new Set([...seen, next]), len + e.w);
        }
      };
      walk('a', new Set(['a']), 0);
      return min;
    };
    const r = rng(11);
    for (let t = 0; t < 300; t++) {
      const w = smallGraph.edges.map(() => r.int(1, 9));
      const target = r.pick(['b', 'c', 'd', 'e']);
      expect(num(routeQ(w, target))).toBe(best(w, target));
    }
  });

  it('puzzle box', () => {
    const r = rng(13);
    for (let t = 0; t < 300; t++) {
      const A = Array.from({ length: 8 }, () => r.int(-6, 6));
      if (!A.some((x) => x > 0)) continue;
      const sums = A.flatMap((_, i) => range(i, 7).map((j) => sum(A.slice(i, j + 1))));
      expect(num(maxRunQ(A))).toBe(Math.max(...sums));
    }
    for (const p of range(1, 10)) {
      const q = pilesQ(p);
      const weight = sum(range(1, 10).map((i) => i * (i === p ? 11 : 10)));
      expect(q.body).toContain(`**${weight} g**`);
      expect(num(q)).toBe(p);
    }
    for (const n of range(4, 800)) expect(num(weighingsQ(n))).toBe(Math.ceil(Math.log(n) / Math.log(3) - 1e-9));
    for (const n of range(20, 500)) expect(num(twoDevicesQ(n))).toBe(worstCaseDrops(n, 2));
  });

  it('every lesson keeps its generated steps varied', () => {
    for (const { lesson } of allLessons)
      for (const step of lesson.steps)
        if (step.kind === 'generated') {
          const bodies = new Set(range(0, 49).map((s) => step.make(rng(s)).body));
          expect(bodies.size, lesson.id).toBeGreaterThan(2);
        }
  });
});

describe('New numbers', () => {
  it('draws another variant after answering', () => {
    const step = { kind: 'generated' as const, make: (r: ReturnType<typeof rng>) => quadrupleQ(r.int(2, 5)) };
    const { getByPlaceholderText, getByText, queryByText } = render(
      <MemoryRouter>
        <StepView step={step} seed={0} variant={1} onAdvance={() => {}} />
      </MemoryRouter>,
    );
    expect(queryByText('New numbers')).toBeNull();
    fireEvent.change(getByPlaceholderText('Your answer'), { target: { value: String(num(step.make(rng(1)))) } });
    fireEvent.click(getByText('Check'));
    expect(getByText('Nice!')).toBeTruthy();
    fireEvent.click(getByText('New numbers'));
    expect(queryByText('Nice!')).toBeNull();
    expect((getByPlaceholderText('Your answer') as HTMLInputElement).value).toBe('');
  });
});
