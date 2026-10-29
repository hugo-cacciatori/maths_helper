import { cleanup, fireEvent, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { StepView } from '../src/components/LessonPlayer';
import { allLessons } from '../src/content';
import { addConstQ, compareQ, doublingSumQ, loopD, oddSumQ, quadrupleQ, rangeCompsQ, symmetricCompsQ, triangleQ, twoCallsQ } from '../src/content/lessons/ch1';
import { cubeMultsQ, cubesSpec } from '../src/content/lessons/ch1x';
import { bsMaxQ, josephusQ, nimMoveQ } from '../src/content/lessons/ch3';
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
