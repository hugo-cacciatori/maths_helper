import { cleanup, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { Home } from '../src/components/Home';
import { StepView } from '../src/components/LessonPlayer';
import { allLessons, chapters } from '../src/content';

afterEach(cleanup);

describe('content', () => {
  it('has 8 chapters and unique lesson ids', () => {
    expect(chapters).toHaveLength(8);
    const ids = allLessons.map((l) => l.lesson.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  for (const { lesson } of allLessons)
    describe(lesson.id, () => {
      it('has consistent answers', () => {
        expect(lesson.steps.length).toBeGreaterThan(0);
        for (const step of lesson.steps) {
          if (step.kind === 'choice') {
            expect(step.answer).toBeGreaterThanOrEqual(0);
            expect(step.answer).toBeLessThan(step.options.length);
          }
          if (step.kind === 'number') expect(Number.isFinite(step.answer)).toBe(true);
          if (step.kind === 'sequence') {
            const pool = [...step.tokens];
            for (const a of step.answer) {
              const k = pool.indexOf(a);
              expect(k, `token "${a}" missing`).toBeGreaterThanOrEqual(0);
              pool.splice(k, 1);
            }
          }
        }
      });

      it('renders every step', () => {
        lesson.steps.forEach((step, i) => {
          const { unmount, container } = render(
            <MemoryRouter>
              <StepView step={step} seed={i} onAdvance={() => {}} />
            </MemoryRouter>,
          );
          expect(container.textContent?.length).toBeGreaterThan(10);
          // Maths must be typeset, never shown as raw source.
          expect(container.textContent, `raw $$ in step ${i}`).not.toContain('$$');
          unmount();
        });
      });
    });

  it('renders the home page', () => {
    const { getByText } = render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );
    expect(getByText('Measuring cost')).toBeTruthy();
  });
});
