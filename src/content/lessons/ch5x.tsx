import type { Lesson, QuestionStep } from '../../lib/types';
import { ClosestPair, closestPair, HeapMin, minAvlNodes, PlainBstBuilder, ProductBars, SortOrNot, ThinBalancedTree } from '../../widgets/reshape-extra';
import { AvlBuilder } from '../../widgets/reshape';

/* ---------- practice questions with fresh numbers ---------- */

export const closestGapQ = (values: number[]): QuestionStep => {
  const { pair, gap } = closestPair(values);
  return {
    kind: 'number',
    title: 'Practice',
    body: `What is the smallest difference between two of **${values.join(', ')}**?`,
    answer: gap,
    hint: 'Sort them first: the closest two are neighbours.',
    explain: `Sorted: ${[...values].sort((a, b) => a - b).join(', ')}. The closest neighbours are ${pair[0]} and ${pair[1]}: a gap of **${gap}**.`,
  };
};

export const minAvlQ = (h: number): QuestionStep => {
  const N = Array.from({ length: h + 1 }, (_, k) => minAvlNodes(k));
  return {
    kind: 'number',
    body: `What is the smallest number of nodes in a balanced tree of height **${h}**?`,
    answer: N[h],
    explain: `${N.map((v, k) => `$N(${k}) = ${v}$`).join(', ')}. These numbers grow like Fibonacci numbers — exponentially — so the height of a balanced tree is $O(\\log n)$.`,
  };
};

export const productQ = (n: number): QuestionStep => {
  const a = Math.floor(n / 2);
  return {
    kind: 'number',
    body: `What is the largest product of two positive integers whose sum is **${n}**?`,
    answer: a * (n - a),
    explain: `$a(${n} - a)$ is a downward parabola, highest in the middle: $${a} \\times ${n - a} = ${a * (n - a)}$. In general $\\lfloor n/2\\rfloor \\cdot \\lceil n/2 \\rceil$.`,
  };
};

export const ZIGZAG_KEYS = ['A', 'Z', 'B', 'Y', 'C', 'X', 'D', 'W', 'E', 'V', 'F'];

const sortFirst: Lesson = {
  id: 'c5l4',
  title: 'Sort first?',
  summary: 'You learnt when sorting the data first makes a problem cheaper — and when it does not.',
  steps: [
    {
      kind: 'read',
      title: 'The two closest numbers',
      body: 'To find the two closest numbers in a list, comparing every pair costs $\\frac{n(n-1)}{2}$ differences. But after sorting, the closest pair must sit **side by side**. Drag $n$ and compare the costs.',
      widget: () => <ClosestPair />,
    },
    {
      kind: 'choice',
      body: 'What is the cost of “sort, then check neighbours” with a good sorting algorithm?',
      options: ['$\\Theta(n)$', '$\\Theta(n\\log n)$ — the sort dominates the $n - 1$ neighbour checks', '$\\Theta(n^2)$', '$\\Theta(\\log n)$'],
      answer: 1,
      explain: 'Sorting costs $\\Theta(n\\log n)$; one pass over the $n - 1$ gaps adds only $\\Theta(n)$. Much better than $\\Theta(n^2)$ for every pair.',
    },
    {
      kind: 'choice',
      title: 'Not always a win',
      body: 'Same idea for the smallest and largest values: sort, then read both ends. How does that compare with a single scan (about $2n$ comparisons) or the split-in-halves method (about $1.5n$)?',
      options: ['Sorting first is the fastest', 'Sorting first is the slowest: $\\Theta(n\\log n)$ against $\\Theta(n)$ for the other two', 'All three are $\\Theta(n\\log n)$'],
      answer: 1,
      explain: 'Sorting does far more work than needed: it orders *every* element when we only need two of them.',
    },
    {
      kind: 'read',
      title: 'Sort once, search many times',
      body: `Searching an unsorted array costs about $n/2$ comparisons on average. Sorting first costs about $n\\log_2 n$, but then each search costs only about $\\log_2 n$. With $k$ searches, sorting pays off when
$$k \\cdot \\frac{n}{2} > n\\log_2 n + k\\log_2 n.$$
Move $k$ to see where the lines cross.`,
      widget: () => <SortOrNot />,
    },
    {
      kind: 'number',
      body: 'For an array of $10^3$ elements, from how many searches does sorting first pay off?',
      answer: 21,
      tolerance: 1,
      hint: '$\\log_2 1000 \\approx 10$. Solve $k(n/2 - \\log_2 n) > n\\log_2 n$.',
      explain: '$k > \\frac{1000 \\times 9.97}{500 - 9.97} \\approx 20.3$, so about **21** searches.',
    },
    {
      kind: 'number',
      body: 'And for $10^6$ elements?',
      answer: 40,
      tolerance: 1,
      explain: '$k > \\frac{10^6 \\times 19.93}{5\\cdot10^5 - 19.93} \\approx 39.9$: about **40** searches. The break-even grows only like $2\\log_2 n$.',
    },
    { kind: 'generated', make: (r) => closestGapQ(r.shuffle([...Array(99).keys()].map((i) => i + 1)).slice(0, 8)) },
  ],
};

const treeHeights: Lesson = {
  id: 'c5l5',
  title: 'Tall and short trees',
  summary: 'You saw how few nodes a balanced tree can have for its height, and how badly an unbalanced one can grow.',
  steps: [
    {
      kind: 'read',
      title: 'The thinnest balanced tree',
      body: `What is the **fewest** nodes a balanced (AVL) tree of height $h$ can have? Make it as lopsided as the rule allows: one subtree of height $h - 1$, the other of height $h - 2$, each of them as thin as possible. So
$$N(h) = N(h-1) + N(h-2) + 1,\\quad N(0) = 1,\\ N(1) = 2.$$`,
      widget: () => <ThinBalancedTree />,
    },
    { kind: 'generated', make: (r) => minAvlQ(r.int(2, 9)) },
    {
      kind: 'task',
      title: 'A zigzag of keys',
      body: 'Insert **A Z B Y C X D W E V F** into a plain search tree, without any rebalancing.',
      widget: ({ onSolved }) => <PlainBstBuilder keys={ZIGZAG_KEYS} onSolved={onSolved} />,
      success: 'Each key lands below the previous one: a zigzag chain of height 10.',
    },
    {
      kind: 'task',
      body: 'Now the same keys in a balanced (AVL) tree, with rotations.',
      widget: ({ onSolved }) => <AvlBuilder keys={ZIGZAG_KEYS} onSolved={onSolved} />,
      success: 'The rotations keep the tree short: height 3 for 11 keys.',
    },
    {
      kind: 'choice',
      body: 'Why does it matter?',
      options: [
        'It does not: both trees hold the same keys',
        'A search costs one comparison per level: up to 11 in the chain, at most 4 in the balanced tree',
        'The chain uses more memory',
      ],
      answer: 1,
      explain: 'Searching, inserting and deleting all follow one root-to-leaf path, so their cost is the height: $\\Theta(n)$ for a chain, $\\Theta(\\log n)$ when balanced.',
    },
  ],
};

const heapTricks: Lesson = {
  id: 'c5l6',
  title: 'Heap tricks',
  summary: 'You found the smallest key of a max-heap among its leaves, and maximised a product by reshaping a sum.',
  steps: [
    {
      kind: 'task',
      title: 'The smallest key of a max-heap',
      body: 'A max-heap keeps its **largest** key at the root. Where is the **smallest** one? Watch the search, then its deletion.',
      widget: ({ onSolved }) => <HeapMin onSolved={onSolved} />,
      success: 'Only the leaves can hold the minimum; after deleting it, the moved key may need to climb.',
    },
    {
      kind: 'choice',
      body: 'What is the cost of finding and deleting the smallest key of a max-heap with $n$ keys?',
      options: ['$\\Theta(1)$', '$\\Theta(\\log n)$', '$\\Theta(n)$ — there are about $n/2$ leaves to check', '$\\Theta(n\\log n)$'],
      answer: 2,
      explain: 'Finding it needs $\\lceil n/2 \\rceil - 1$ comparisons among the leaves; the deletion then costs only $O(\\log n)$. A heap is organised for its maximum, not its minimum.',
    },
    {
      kind: 'read',
      title: 'The largest product',
      body: 'Given a positive integer $n$, which two positive integers with sum $n$ have the **largest product**? Write them as $a$ and $n - a$ and look at the shape of $a(n - a)$.',
      widget: () => <ProductBars />,
    },
    { kind: 'generated', make: (r) => productQ(r.int(10, 199)) },
    {
      kind: 'choice',
      body: 'How long does it take to compute the answer for any $n$?',
      options: ['$\\Theta(n)$: try every split', '$\\Theta(1)$: one division and one multiplication', '$\\Theta(\\log n)$'],
      answer: 1,
      explain: 'Rewriting the problem as a parabola turns a search over $n - 1$ splits into a formula.',
    },
  ],
};

export const ch5xLessons = [sortFirst, treeHeights, heapTricks];
