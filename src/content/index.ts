import type { Chapter, Lesson } from '../lib/types';
import { ch0Lessons } from './lessons/ch0';
import { ch1Lessons } from './lessons/ch1';
import { ch1xLessons } from './lessons/ch1x';
import { ch2Lessons } from './lessons/ch2';
import { ch2xLessons } from './lessons/ch2x';
import { ch3Lessons } from './lessons/ch3';
import { ch3xLessons } from './lessons/ch3x';
import { ch4Lessons } from './lessons/ch4';
import { ch4xLessons } from './lessons/ch4x';
import { ch5Lessons } from './lessons/ch5';
import { ch5xLessons } from './lessons/ch5x';
import { ch6Lessons } from './lessons/ch6';
import { ch7Lessons } from './lessons/ch7';
import { ch7xLessons } from './lessons/ch7x';
import { ch8Lessons } from './lessons/ch8';
import { ch8xLessons } from './lessons/ch8x';
import { warmups } from './lessons/warmups';

export const chapters: Chapter[] = [
  {
    id: 'start',
    title: 'Start here',
    blurb: 'No background needed: the few ideas every later lesson relies on.',
    lessons: ch0Lessons,
  },
  {
    id: 'cost',
    title: 'Measuring cost',
    blurb: 'How fast functions grow, counting steps, sums and self-calling functions.',
    lessons: [...ch1Lessons, ...ch1xLessons],
  },
  {
    id: 'try-everything',
    title: 'Try everything',
    blurb: 'Solve it the direct way, then search every possibility in order.',
    lessons: [warmups.c2, ...ch2Lessons, ...ch2xLessons],
  },
  {
    id: 'make-it-smaller',
    title: 'Make it smaller',
    blurb: 'Solve a smaller copy of the problem, then extend the answer.',
    lessons: [warmups.c3, ...ch3Lessons, ...ch3xLessons],
  },
  {
    id: 'split-in-two',
    title: 'Split in two',
    blurb: 'Cut the problem into halves, solve each, put the answers together.',
    lessons: [warmups.c4, ...ch4Lessons, ...ch4xLessons],
  },
  {
    id: 'change-the-shape',
    title: 'Change the shape',
    blurb: 'Reorganise the data first, then the problem becomes easy.',
    lessons: [warmups.c5, ...ch5Lessons, ...ch5xLessons],
  },
  {
    id: 'memory-for-speed',
    title: 'Memory for speed',
    blurb: 'Use extra space to avoid work.',
    lessons: [warmups.c6, ...ch6Lessons],
  },
  {
    id: 'best-step-first',
    title: 'Best step first',
    blurb: 'Take the most promising move each time — and know when that is safe.',
    lessons: [warmups.c7, ...ch7Lessons, ...ch7xLessons],
  },
  {
    id: 'puzzle-box',
    title: 'Puzzle box',
    blurb: 'Brain-teasers that mix several ideas.',
    lessons: [warmups.c8, ...ch8Lessons, ...ch8xLessons],
  },
];

export const allLessons: { lesson: Lesson; chapter: Chapter }[] = chapters.flatMap((chapter) =>
  chapter.lessons.map((lesson) => ({ lesson, chapter })),
);
