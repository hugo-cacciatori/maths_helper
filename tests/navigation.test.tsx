import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { LessonPlayer } from '../src/components/LessonPlayer';
import { allLessons } from '../src/content';
import { useProgress } from '../src/lib/store';

afterEach(cleanup);

const { lesson, chapter } = allLessons.find(({ lesson }) => lesson.steps.length >= 4)!;

beforeEach(() => {
  useProgress.getState().reset();
  useProgress.getState().setStep(lesson.id, 2);
});

function renderLesson(entries = ['/', `/lesson/${lesson.id}`]) {
  render(
    <MemoryRouter initialEntries={entries} initialIndex={entries.length - 1}>
      <Routes>
        <Route path="/" element={<div>lesson list</div>} />
        <Route path="/lesson/:id" element={<LessonPlayer lesson={lesson} chapter={chapter} />} />
      </Routes>
    </MemoryRouter>,
  );
  return screen.getByRole('main');
}

const current = () => Number(document.querySelector('[aria-current="step"]')?.getAttribute('aria-label')?.replace('Step ', '')) - 1;

function swipe(el: Element, dx: number, { x = 400, dy = 0 } = {}) {
  act(() => {
    fireEvent.touchStart(el, { touches: [{ clientX: x, clientY: 300 }] });
    for (const f of [0.25, 0.5, 1]) fireEvent.touchMove(el, { touches: [{ clientX: x + dx * f, clientY: 300 + dy * f }] });
    fireEvent.touchEnd(el, { touches: [] });
  });
}

describe('swipe between steps', () => {
  it('opens on the furthest step, swipes back, and forward only to steps already reached', () => {
    const main = renderLesson();
    expect(current()).toBe(2);
    swipe(main, 150);
    expect(current()).toBe(1);
    swipe(main, 150);
    swipe(main, 150);
    expect(current()).toBe(0);
    swipe(main, -150);
    swipe(main, -150);
    swipe(main, -150);
    expect(current()).toBe(2);
    expect(useProgress.getState().stepOf[lesson.id]).toBe(2);
  });

  it('ignores short, vertical, edge and slider gestures', () => {
    const main = renderLesson();
    swipe(main, 30);
    swipe(main, 150, { dy: 200 });
    swipe(main, 150, { x: 5 });
    const slider = document.createElement('input');
    slider.type = 'range';
    main.appendChild(slider);
    swipe(slider, 150);
    expect(current()).toBe(2);
  });

  it('arrow keys mirror the swipes', () => {
    renderLesson();
    act(() => void fireEvent.keyDown(document.body, { key: 'ArrowLeft' }));
    expect(current()).toBe(1);
    act(() => void fireEvent.keyDown(document.body, { key: 'ArrowRight' }));
    act(() => void fireEvent.keyDown(document.body, { key: 'ArrowRight' }));
    expect(current()).toBe(2);
  });

  it('going back to an earlier step does not lose the furthest one', () => {
    useProgress.getState().setStep(lesson.id, 1);
    expect(useProgress.getState().stepOf[lesson.id]).toBe(2);
  });
});

describe('back to the list', () => {
  it('returns through history when the lesson was opened from the list', () => {
    renderLesson();
    fireEvent.click(screen.getByLabelText('Back to lessons'));
    expect(screen.getByText('lesson list')).toBeTruthy();
  });

  it('replaces the entry when the app opened straight on the lesson', () => {
    renderLesson([`/lesson/${lesson.id}`]);
    fireEvent.click(screen.getByLabelText('Back to lessons'));
    expect(screen.getByText('lesson list')).toBeTruthy();
  });
});

describe('sideways scrollers', () => {
  it('keep the swipe while they can scroll that way, then hand it to the lesson', () => {
    const main = renderLesson();
    const box = document.createElement('div');
    box.style.overflowX = 'auto';
    Object.defineProperties(box, { scrollWidth: { value: 600 }, clientWidth: { value: 300 } });
    main.appendChild(box);
    swipe(box, -150);
    expect(current()).toBe(2); // could scroll right: the box keeps it
    swipe(box, 150);
    expect(current()).toBe(1); // already at its left edge: back a step
  });
});
