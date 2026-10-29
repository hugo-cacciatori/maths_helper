import type { Lesson } from '../../lib/types';
import { BstCompare, BstWalk, GlassRow, HairCutter, RiverCrossing } from '../../widgets/shrink-extra';

export const GLASSES_START = [true, true, true, true, false, false, false, false];
export const GLASSES_MIXED = [false, true, true, false, false, true, true, false];
export const WALK_KEYS = [50, 30, 70, 20, 40, 60, 80, 65, 90, 85];

const river: Lesson = {
  id: 'c3l4',
  title: 'Crossing the river',
  summary: 'You reduced a crossing problem with n soldiers to the same problem with n − 1, four trips at a time.',
  steps: [
    {
      kind: 'read',
      title: 'A tiny boat',
      body: `A group of $n$ soldiers must cross a wide river with no bridge. Two kids are playing in a small boat, which can carry **two kids** or **one soldier** — never a soldier and a kid together. The soldiers must all get across, and the kids must keep their boat (on their own bank) at the end.`,
    },
    {
      kind: 'task',
      body: 'Get **2** soldiers across.',
      widget: ({ onSolved }) => <RiverCrossing initialN={2} onSolved={onSolved} />,
      hint: 'Someone has to bring the boat back after a soldier crosses — and it can’t be the soldier.',
      success: 'Kids cross together, one kid rows back, a soldier crosses, the other kid rows back. The situation is exactly the start, with one soldier fewer.',
    },
    {
      kind: 'number',
      body: 'How many crossings does it take to move **one** soldier across and return to the starting situation (both kids home with the boat)?',
      answer: 4,
      explain: 'Two kids over, one kid back, soldier over, the other kid back.',
    },
    {
      kind: 'choice',
      body: 'Each round solves the problem for one soldier and leaves the same problem with $n - 1$ soldiers. How many crossings for $n$ soldiers?',
      options: ['$2n$', '$4n$', '$n^2$', '$2^n$'],
      answer: 1,
      explain: '$C(n) = C(n - 1) + 4$, $C(0) = 0$ gives $C(n) = 4n$: solve one soldier, and the rest is the same puzzle, one size smaller.',
    },
  ],
};

const fewestMoves: Lesson = {
  id: 'c3l5',
  title: 'Fewest moves',
  summary: 'You found minimum-move strategies by thinking about what each move can fix.',
  steps: [
    {
      kind: 'task',
      title: 'Glasses in a row',
      body: '$2n$ glasses stand in a row: the first $n$ are full, the others empty. Make them alternate **full, empty, full, empty…** by swapping glasses, in as few swaps as possible. Here $n = 4$.',
      widget: ({ onSolved }) => <GlassRow initial={GLASSES_START} onSolved={onSolved} />,
      success: 'Swap glass 2 with glass 7 and glass 4 with glass 5.',
    },
    {
      kind: 'choice',
      body: 'How many swaps are needed in general for $n$ full glasses followed by $n$ empty ones?',
      options: ['$n - 1$', '$\\lfloor n/2 \\rfloor$', '$n$', '$2n$'],
      answer: 1,
      explain: 'Among the first $n$ positions, the even-numbered ones ($\\lfloor n/2\\rfloor$ of them) hold full glasses that must leave; each swap fixes one of them together with an empty glass that is out of place. (Pouring a full glass into an empty one counts the same.)',
    },
    {
      kind: 'task',
      body: 'Now the glasses start in a **random** order (still 4 full, 4 empty). Make them alternate with the fewest swaps.',
      widget: ({ onSolved }) => <GlassRow initial={GLASSES_MIXED} onSolved={onSolved} />,
      success: 'Two misplaced full glasses, two misplaced empty ones: two swaps.',
    },
    {
      kind: 'choice',
      body: 'What is the general strategy for a random order?',
      options: [
        'Sort the glasses first',
        'Scan once: pair each full glass standing on an "empty" position with an empty glass standing on a "full" position, and swap them. Swaps = number of misplaced full glasses',
        'Swap neighbours until it alternates',
      ],
      answer: 1,
      explain: 'There are exactly as many misplaced full glasses as misplaced empty ones, and one swap fixes one of each — so no strategy can do better.',
    },
    {
      kind: 'task',
      title: 'Cutting a strand',
      body: 'A strand of hair $n$ cm long must be cut into $n$ pieces of 1 cm. You can lay several pieces side by side and cut them all with one stroke. Cut the 10 cm strand in as few strokes as possible.',
      widget: ({ onSolved }) => <HairCutter onSolved={onSolved} />,
      success: 'Halving everything each time: 10 → 5 → 3 → 2 → 1. Four cuts.',
    },
    {
      kind: 'number',
      body: 'How many cuts are needed for a strand of **100 cm**?',
      answer: 7,
      hint: 'Each cut can at most double the number of pieces.',
      explain: 'Each stroke at most doubles the number of pieces: $k$ cuts give at most $2^k$ pieces, so we need $2^k \\ge 100$, i.e. $\\lceil\\log_2 100\\rceil = 7$ — and halving everything achieves it.',
    },
  ],
};

const treeWalks: Lesson = {
  id: 'c3l6',
  title: 'Inside a search tree',
  summary: 'You walked a binary search tree to find its largest key, list keys in decreasing order and compare two trees.',
  steps: [
    {
      kind: 'read',
      title: 'Smaller left, larger right',
      body: 'In a binary **search** tree, every key in a node’s left subtree is smaller than the node, and every key in its right subtree is larger. That rule tells you where to look — so you rarely need to look everywhere.',
    },
    {
      kind: 'task',
      body: 'Find the largest key.',
      widget: ({ onSolved }) => <BstWalk keys={WALK_KEYS} mode="max" onSolved={onSolved} />,
      success: 'Keep going right until there is no right child: 50 → 70 → 80 → 90.',
    },
    {
      kind: 'choice',
      body: 'What is the worst-case cost of this search on a tree with $n$ keys?',
      options: ['$\\Theta(1)$', '$\\Theta(\\log n)$ always', '$\\Theta(h)$ for a tree of height $h$, so $\\Theta(n)$ if the tree degenerates into a chain', '$\\Theta(n \\log n)$'],
      answer: 2,
      explain: 'It visits one node per level on the rightmost path. Each step drops a whole left subtree — a reduction whose size varies from step to step.',
    },
    {
      kind: 'task',
      body: 'Now print all keys in **decreasing** order with a recursive walk.',
      widget: ({ onSolved }) => <BstWalk keys={WALK_KEYS} mode="descending" onSolved={onSolved} />,
      success: '90 85 80 70 65 60 50 40 30 20.',
    },
    {
      kind: 'choice',
      body: 'Which recursive order prints a search tree in decreasing order?',
      options: ['node, left, right', 'left, node, right', 'right, node, left', 'left, right, node'],
      answer: 2,
      explain: 'Everything on the right is larger than the node, which is larger than everything on the left. (Left, node, right gives increasing order.)',
    },
    {
      kind: 'choice',
      title: 'Same keys, different shapes',
      body: 'These two search trees were built from the same keys inserted in different orders. How can you check, in linear time, that two search trees contain exactly the same keys?',
      widget: () => <BstCompare a={[5, 3, 8, 1, 4, 9]} b={[4, 1, 8, 3, 9, 5]} />,
      options: ['Compare their shapes', 'Compare their roots', 'List both in in-order (increasing) and compare the two lists', 'It needs $\\Theta(n^2)$ comparisons'],
      answer: 2,
      explain: 'The in-order walk of a search tree is its sorted key list, whatever its shape: two $\\Theta(n)$ walks and one $\\Theta(n)$ comparison.',
    },
  ],
};

export const ch3xLessons = [river, fewestMoves, treeWalks];
