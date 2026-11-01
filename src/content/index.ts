import { t } from '../lib/i18n';
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
    title: t('Start here', 'Pour commencer'),
    blurb: t('No background needed: the few ideas every later lesson relies on.', 'Aucun prérequis : les quelques idées sur lesquelles reposent toutes les leçons suivantes.'),
    lessons: ch0Lessons,
  },
  {
    id: 'cost',
    title: t('Measuring cost', 'Mesurer le coût'),
    blurb: t('How fast functions grow, counting steps, sums and self-calling functions.', 'La croissance des fonctions, compter les étapes, les sommes et les fonctions qui s’appellent elles-mêmes.'),
    lessons: [...ch1Lessons, ...ch1xLessons],
  },
  {
    id: 'try-everything',
    title: t('Try everything', 'Tout essayer'),
    blurb: t('Solve it the direct way, then search every possibility in order.', 'Résoudre de la façon la plus directe, puis passer en revue chaque possibilité dans l’ordre.'),
    lessons: [warmups.c2, ...ch2Lessons, ...ch2xLessons],
  },
  {
    id: 'make-it-smaller',
    title: t('Make it smaller', 'Rendre plus petit'),
    blurb: t('Solve a smaller copy of the problem, then extend the answer.', 'Résoudre une copie plus petite du problème, puis étendre la réponse.'),
    lessons: [warmups.c3, ...ch3Lessons, ...ch3xLessons],
  },
  {
    id: 'split-in-two',
    title: t('Split in two', 'Couper en deux'),
    blurb: t('Cut the problem into halves, solve each, put the answers together.', 'Couper le problème en moitiés, résoudre chacune, puis assembler les réponses.'),
    lessons: [warmups.c4, ...ch4Lessons, ...ch4xLessons],
  },
  {
    id: 'change-the-shape',
    title: t('Change the shape', 'Changer la forme'),
    blurb: t('Reorganise the data first, then the problem becomes easy.', 'Réorganiser d’abord les données : le problème devient alors facile.'),
    lessons: [warmups.c5, ...ch5Lessons, ...ch5xLessons],
  },
  {
    id: 'memory-for-speed',
    title: t('Memory for speed', 'De la mémoire pour la vitesse'),
    blurb: t('Use extra space to avoid work.', 'Utiliser de la place en plus pour éviter du travail.'),
    lessons: [warmups.c6, ...ch6Lessons],
  },
  {
    id: 'best-step-first',
    title: t('Best step first', 'Le meilleur pas d’abord'),
    blurb: t('Take the most promising move each time — and know when that is safe.', 'Jouer à chaque fois le coup le plus prometteur — et savoir quand c’est sûr.'),
    lessons: [warmups.c7, ...ch7Lessons, ...ch7xLessons],
  },
  {
    id: 'puzzle-box',
    title: t('Puzzle box', 'Boîte à énigmes'),
    blurb: t('Brain-teasers that mix several ideas.', 'Des casse-tête qui mêlent plusieurs idées.'),
    lessons: [warmups.c8, ...ch8Lessons, ...ch8xLessons],
  },
];

export const allLessons: { lesson: Lesson; chapter: Chapter }[] = chapters.flatMap((chapter) =>
  chapter.lessons.map((lesson) => ({ lesson, chapter })),
);
