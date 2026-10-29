import type { Lesson } from '../../lib/types';
import { NutsBolts, QuickSelect, TreeRebuilder } from '../../widgets/split-extra';

export const REBUILD_IN = ['9', '3', '1', '0', '4', '2', '7', '6', '8', '5'];
export const REBUILD_POST = ['9', '1', '4', '0', '3', '6', '7', '5', '8', '2'];
export const SELECT_VALUES = [9, 2, 7, 4, 12, 5, 8, 1, 10];

const nutsBolts: Lesson = {
  id: 'c4l6',
  title: 'Matching nuts and bolts',
  summary: 'You matched n nuts to n bolts in Θ(n log n) on average by partitioning each set with the other.',
  steps: [
    {
      kind: 'read',
      title: 'No ruler allowed',
      body: `You have $n$ bolts of different sizes and their $n$ matching nuts, all mixed up. You can try a nut on a bolt and learn whether the nut is **too big, too small or a match** — but you can never compare two nuts, or two bolts, directly.

Trying every nut on every bolt takes up to $\\frac{n(n+1)}{2}$ tries. Can we do better?`,
    },
    {
      kind: 'choice',
      body: 'Why can’t we simply sort the nuts, sort the bolts, and pair them up?',
      options: ['Sorting is too slow', 'Sorting needs nut–nut or bolt–bolt comparisons, which are not allowed', 'The sizes are not distinct', 'We can, it is the best method'],
      answer: 1,
      explain: 'The only test available compares a nut with a bolt. But that is enough to **partition**, like quicksort does.',
    },
    {
      kind: 'task',
      body: 'Pick a bolt and try it on every nut: the nuts split into smaller / matching / bigger. Then use the matching nut to split the bolts the same way. Now both groups line up — recurse on each side.',
      widget: ({ onSolved }) => <NutsBolts onSolved={onSolved} />,
      success: 'Each round matches one pair and splits the rest into two independent, smaller problems.',
    },
    {
      kind: 'choice',
      body: 'What is the cost of this method?',
      options: ['$\\Theta(n)$ always', '$\\Theta(n\\log n)$ in the best and average case, $\\Theta(n^2)$ in the worst case', '$\\Theta(n^2)$ always', '$\\Theta(\\log n)$'],
      answer: 1,
      explain: 'Exactly like quicksort: about $2n$ tries per level of splitting. Balanced splits give $\\log_2 n$ levels; always picking the smallest bolt gives $n$ levels.',
    },
  ],
};

const rebuildTree: Lesson = {
  id: 'c4l7',
  title: 'Rebuild a tree',
  summary: 'You reconstructed a binary tree from its in-order and post-order listings by splitting around each root.',
  steps: [
    {
      kind: 'read',
      title: 'Two listings, one tree',
      body: `In **post-order** the root of a tree is always listed **last**. In **in-order** the root sits **between** its left subtree and its right subtree.

So: take the last element of the post-order list — that is the root. Find it in the in-order list: everything before it is the left subtree, everything after it the right subtree. The post-order list splits at the same sizes. Repeat on each side.`,
    },
    {
      kind: 'task',
      body: 'Rebuild the tree, one root at a time. Click each root in the **post-order** row.',
      widget: ({ onSolved }) => <TreeRebuilder inord={REBUILD_IN} post={REBUILD_POST} onSolved={onSolved} />,
      success: 'Root 2; left subtree rooted at 3, right subtree rooted at 8.',
    },
    {
      kind: 'sequence',
      body: 'Give the **pre-order** listing of the tree you rebuilt (node, then left, then right).',
      tokens: REBUILD_IN,
      answer: ['2', '3', '9', '0', '1', '4', '8', '7', '6', '5'],
      explain: 'You placed the nodes in exactly that order: each root before its subtrees.',
    },
    {
      kind: 'choice',
      body: 'Would the **pre-order** and **post-order** listings together always determine the tree?',
      options: ['Yes, always', 'No: a node with a single child gives the same listings whether that child is on the left or the right', 'Only for search trees'],
      answer: 1,
      explain: 'Pre-order "a b" and post-order "b a" fit both a tree where b is the left child of a and one where it is the right child. The in-order listing is what separates left from right.',
    },
  ],
};

const kthLargest: Lesson = {
  id: 'c4l8',
  title: 'Finding the k-th largest',
  summary: 'You found the k-th largest value in linear average time by partitioning and keeping only one side.',
  steps: [
    {
      kind: 'read',
      title: 'No need to sort everything',
      body: 'To find the $k$-th largest of $n$ numbers you could sort them ($\\Theta(n\\log n)$) and read position $n - k$. But one partition already puts the pivot in its **final** place — and tells us on which side the answer lies. We only need to continue on that side.',
    },
    {
      kind: 'task',
      body: 'Find the 3rd largest value. Try other values of $k$ too.',
      widget: ({ onSolved }) => <QuickSelect values={SELECT_VALUES} onSolved={onSolved} />,
      success: 'Every partition throws away the side that cannot contain the answer.',
    },
    {
      kind: 'number',
      body: 'What is the 3rd largest of **9, 2, 7, 4, 12, 5, 8, 1, 10**?',
      answer: 9,
      explain: 'Sorted: 1 2 4 5 7 8 9 10 12. Counting from the top: 12, 10, **9**.',
    },
    {
      kind: 'choice',
      body: 'With pivots that roughly halve the range, the work is about $n + n/2 + n/4 + \\dots$ What is the average cost?',
      options: ['$\\Theta(\\log n)$', '$\\Theta(n)$', '$\\Theta(n\\log n)$', '$\\Theta(n^2)$'],
      answer: 1,
      explain: 'The geometric series $n + n/2 + n/4 + \\dots < 2n$: linear on average. Like quicksort, unlucky pivots give $\\Theta(n^2)$ in the worst case.',
    },
  ],
};

export const ch4xLessons = [nutsBolts, rebuildTree, kthLargest];
