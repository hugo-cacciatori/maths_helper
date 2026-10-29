import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { StepView } from '../src/components/LessonPlayer';
import { Prose } from '../src/components/Prose';
import { allLessons } from '../src/content';
import { useProgress } from '../src/lib/store';
import type { Step } from '../src/lib/types';

afterEach(cleanup);

const firstChoice = allLessons.flatMap(({ lesson }) => lesson.steps).find((s) => s.kind === 'choice') as Extract<Step, { kind: 'choice' }>;

function renderStep(onResult = vi.fn(), onAdvance = vi.fn()) {
  render(
    <MemoryRouter>
      <StepView step={firstChoice} seed={1} onAdvance={onAdvance} onResult={onResult} />
    </MemoryRouter>,
  );
  return { onResult, onAdvance };
}

const press = (key: string) => act(() => void fireEvent.keyDown(document.body, { key }));

describe('keyboard', () => {
  it('number key picks an option, Enter checks, Enter again continues', () => {
    const { onResult, onAdvance } = renderStep();
    press(String(firstChoice.answer + 1));
    press('Enter');
    expect(onResult).toHaveBeenCalledWith('clean');
    press('Enter');
    expect(onAdvance).toHaveBeenCalledTimes(1);
  });

  it('a wrong first answer is reported as missed, once', () => {
    const { onResult } = renderStep();
    const wrong = firstChoice.answer === 0 ? 'b' : 'a';
    press(wrong);
    press('Enter');
    press('Enter'); // try again
    press(wrong);
    press('Enter');
    expect(onResult).toHaveBeenCalledTimes(1);
    expect(onResult).toHaveBeenCalledWith('missed');
  });
});

describe('review list', () => {
  it('adds and removes missed questions', () => {
    const s = useProgress.getState();
    s.reset();
    s.addMissed('c1l1', 3);
    s.addMissed('c1l1', 1);
    s.addMissed('c1l1', 3);
    expect(useProgress.getState().missed).toEqual({ c1l1: [1, 3] });
    useProgress.getState().removeMissed('c1l1', 1);
    useProgress.getState().removeMissed('c1l1', 3);
    expect(useProgress.getState().missed).toEqual({});
  });
});

describe('inline formatting', () => {
  it('renders *italic* and leaves maths and bold alone', () => {
    const { container } = render(<Prose text={'only the *shape* of $2 * 3 * n$ and **bold**'} />);
    expect(container.querySelector('em')?.textContent).toBe('shape');
    expect(container.querySelectorAll('em')).toHaveLength(1);
    expect(container.querySelector('strong')?.textContent).toBe('bold');
    container.querySelectorAll('.katex').forEach((k) => k.remove());
    expect(container.textContent).not.toContain('*');
  });
});
