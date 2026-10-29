import type { Lesson } from '../../lib/types';
import { ComparisonCountingViz, DistributionCountingViz, type Rec } from '../../widgets/memory';

export const SAMPLE_RECORDS: Rec[] = [
  [16, 'A'],
  [15, 'B'],
  [13, 'C'],
  [15, 'D'],
  [12, 'E'],
  [18, 'F'],
  [15, 'G'],
  [13, 'H'],
];

const countingSort: Lesson = {
  id: 'c6l1',
  title: 'Sorting without swapping',
  summary: 'You traded extra memory for speed: counting sorts that place each element directly.',
  steps: [
    {
      kind: 'read',
      title: 'Space for time',
      body: '**Memory for speed**: use extra memory to store information that makes the algorithm faster. Counting sorts never move elements around by comparing neighbours — they *compute* where each element belongs.',
    },
    {
      kind: 'task',
      title: 'Comparison counting',
      body: 'For each element, count how many elements are **smaller** than it: that count is exactly its position in the sorted array. Sort **60, 35, 81, 98, 14, 47**.',
      widget: ({ onSolved }) => <ComparisonCountingViz A={[60, 35, 81, 98, 14, 47]} onSolved={onSolved} />,
      success: 'Counts 3 1 4 5 0 2 → S = 14 35 47 60 81 98.',
    },
    {
      kind: 'choice',
      body: 'Is comparison counting sort **stable**? Is it **in place**? (Think of two equal keys $x_1, x_2$: when they are compared, the `else` branch increments Count of the **first** one.)',
      options: ['Stable and in place', 'Stable, not in place', 'Not stable, not in place', 'Not stable, in place'],
      answer: 2,
      explain: 'For equal keys the earlier one gets the bigger count, so it ends up **after** the later one: the order is reversed — not stable. And it needs the extra arrays Count and S: not in place. It also makes $\\frac{n(n-1)}{2}$ comparisons: $\\Theta(n^2)$.',
    },
    {
      kind: 'task',
      title: 'Distribution counting',
      body: `When keys are integers in a small range $[l, u]$, we can do much better:
1. count the **frequency** of each key;
2. turn frequencies into **cumulative** counts (number of keys $\\le k$) — the last position of key $k$;
3. scan the input **from right to left**, putting each element at its key's position and decrementing it.

Trace it on these (key, element) pairs.`,
      widget: ({ onSolved }) => <DistributionCountingViz V={SAMPLE_RECORDS} lo={12} hi={18} onSolved={onSolved} />,
      success: 'Result: (12,E) (13,C) (13,H) (15,B) (15,D) (15,G) (16,A) (18,F).',
    },
    {
      kind: 'choice',
      body: 'Is distribution counting stable?',
      options: ['Yes — scanning right to left fills each key’s slots from the back, so equal keys keep their order', 'No — equal keys are reversed', 'Only if all keys are distinct'],
      answer: 0,
      explain: 'C stays before H (both 13), and B, D, G (all 15) keep their order. Stability is why it is used as the building block of radix sort.',
    },
    {
      kind: 'choice',
      body: 'What is its time complexity, for $n$ elements and a key range of size $k = u - l + 1$? When is it worthwhile?',
      options: ['$\\Theta(n\\log n)$, always', '$\\Theta(n + k)$ — great when $k$ is not much larger than $n$', '$\\Theta(nk)$ — only for tiny $k$', '$\\Theta(n^2)$'],
      answer: 1,
      explain: 'Two passes over the data and two over the key range. With a huge range (e.g. arbitrary 64-bit integers) the Frequences array becomes impractical.',
    },
    {
      kind: 'choice',
      body: 'A special case: the array contains the $n$ **distinct** integers $1, \\dots, n$ in some order. Which one-liner sorts it into $S$?',
      options: ['`for i ← 1 to n do S[i] ← i`', '`for i ← 1 to n do S[A[i]] ← A[i]`', '`for i ← 1 to n do S[i] ← A[A[i]]`', 'It cannot be done in $\\Theta(n)$'],
      answer: 1,
      explain: 'Each value *is* its own final position. (Option A also produces the right array — without even reading $A$! — which is why real counting sorts carry the elements’ data along.)',
    },
  ],
};

export const ch6Lessons = [countingSort];
