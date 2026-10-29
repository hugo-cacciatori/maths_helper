import type { Chapter, Lesson } from '../lib/types';
import { ch1Lessons } from './lessons/ch1';
import { ch2Lessons } from './lessons/ch2';
import { ch3Lessons } from './lessons/ch3';
import { ch4Lessons } from './lessons/ch4';
import { ch5Lessons } from './lessons/ch5';
import { ch6Lessons } from './lessons/ch6';
import { ch7Lessons } from './lessons/ch7';
import { ch8Lessons } from './lessons/ch8';

export const chapters: Chapter[] = [
  {
    id: 'cost',
    title: 'Measuring cost',
    blurb: 'How fast functions grow, counting steps, sums and self-calling functions.',
    lessons: ch1Lessons,
  },
  {
    id: 'try-everything',
    title: 'Try everything',
    blurb: 'Solve it the direct way, then search every possibility in order.',
    lessons: ch2Lessons,
  },
  {
    id: 'make-it-smaller',
    title: 'Make it smaller',
    blurb: 'Solve a smaller copy of the problem, then extend the answer.',
    lessons: ch3Lessons,
  },
  {
    id: 'split-in-two',
    title: 'Split in two',
    blurb: 'Cut the problem into halves, solve each, put the answers together.',
    lessons: ch4Lessons,
  },
  {
    id: 'change-the-shape',
    title: 'Change the shape',
    blurb: 'Reorganise the data first, then the problem becomes easy.',
    lessons: ch5Lessons,
  },
  {
    id: 'memory-for-speed',
    title: 'Memory for speed',
    blurb: 'Use extra space to avoid work.',
    lessons: ch6Lessons,
  },
  {
    id: 'best-step-first',
    title: 'Best step first',
    blurb: 'Take the most promising move each time — and know when that is safe.',
    lessons: ch7Lessons,
  },
  {
    id: 'puzzle-box',
    title: 'Puzzle box',
    blurb: 'Brain-teasers that mix several ideas.',
    lessons: ch8Lessons,
  },
];

export const allLessons: { lesson: Lesson; chapter: Chapter }[] = chapters.flatMap((chapter) =>
  chapter.lessons.map((lesson) => ({ lesson, chapter })),
);
