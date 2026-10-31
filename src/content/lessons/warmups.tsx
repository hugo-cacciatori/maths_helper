import type { Lesson, QuestionStep } from '../../lib/types';
import { GuessNumber, SplitLevels, StackQueue, SubsetSwitches } from '../../widgets/basics';
import { ArrayRow, CodeBlock, GraphView, TreeView, type GEdge, type GNode, type TNode } from '../../widgets/kit';

const leaf = (id: string, label = id): TNode => ({ id, label });
const node = (id: string, left?: TNode | null, right?: TNode | null): TNode => ({ id, label: id, left, right });

/* ---------- practice questions with fresh numbers ---------- */

export const modQ = (a: number, b: number): QuestionStep => ({
  kind: 'number',
  title: 'Practice',
  body: `Compute $${a} \\bmod ${b}$.`,
  answer: a % b,
  hint: `Take away as many ${b}s as you can from ${a}; what is left?`,
  explain: `$${a} = ${Math.floor(a / b)} \\times ${b} + ${a % b}$, so $${a} \\bmod ${b} = ${a % b}$.`,
});

export const guessesQ = (n: number): QuestionStep => ({
  kind: 'number',
  title: 'Practice',
  body: `Guessing the middle each time, at most how many guesses find a number between 1 and ${n.toLocaleString('en')}?`,
  answer: Math.ceil(Math.log2(n + 1)),
  hint: 'With $g$ guesses you can tell apart up to $2^g - 1$ numbers. Find the smallest $g$ that covers them all.',
  explain: `$2^{${Math.ceil(Math.log2(n + 1))}} - 1 = ${(2 ** Math.ceil(Math.log2(n + 1)) - 1).toLocaleString('en')}$ covers ${n.toLocaleString('en')} numbers, and one guess fewer does not: about $\\log_2 n$ guesses.`,
});

/* ---------- chapter 2: try everything ---------- */

const possibilities: Lesson = {
  id: 'c2w1',
  title: 'Listing every possibility',
  summary: 'You can count orders and subsets, and you know how a stack and a queue hand items back.',
  warmup: true,
  steps: [
    {
      kind: 'read',
      title: 'The multiply rule',
      body: 'This chapter solves problems by **trying every possibility**. First, count them. With 3 shirts and 2 pairs of trousers you can make $3 \\times 2 = 6$ outfits: for each choice of shirt, any trousers fit. Independent choices **multiply**.',
    },
    {
      kind: 'number',
      body: 'A menu has 4 starters, 3 mains and 2 desserts. How many different three-course meals are there?',
      answer: 24,
      explain: '$4 \\times 3 \\times 2 = 24$.',
    },
    {
      kind: 'read',
      title: 'Orders',
      body: `In how many orders can you line up A, B and C? 3 choices for the first place, then 2 for the second, then 1:

$$3 \\times 2 \\times 1 = 3! = 6: \\quad ABC,\\ ACB,\\ BAC,\\ BCA,\\ CAB,\\ CBA$$

$n$ items can be lined up in $n!$ orders.`,
    },
    {
      kind: 'number',
      body: 'In how many orders can 5 books stand on a shelf?',
      answer: 120,
      explain: '$5! = 5 \\times 4 \\times 3 \\times 2 \\times 1 = 120$.',
    },
    {
      kind: 'read',
      title: 'Subsets',
      body: 'A **subset** is any choice of some of the items — maybe none, maybe all. Say yes or no to each item: every pattern of switches is one subset. Flip a few.',
      widget: () => <SubsetSwitches items={['a', 'b', 'c', 'd']} />,
    },
    {
      kind: 'number',
      body: 'How many subsets does a set of 5 items have?',
      answer: 32,
      hint: 'Each item: yes or no. Multiply the choices.',
      explain: '$2 \\times 2 \\times 2 \\times 2 \\times 2 = 2^5 = 32$, counting the empty subset and the full one.',
    },
    {
      kind: 'choice',
      body: 'Checking one subset takes a millionth of a second. Roughly how long does checking **all** subsets of 50 items take?',
      options: ['A second', 'An hour', 'About 36 years', 'A millionth of a second'],
      answer: 2,
      hint: '$2^{10} \\approx 1000$, so $2^{50} \\approx 10^{15}$.',
      explain: '$2^{50} \\approx 1.1 \\times 10^{15}$ subsets × $10^{-6}$ s ≈ $1.1 \\times 10^9$ s ≈ 36 years. Trying everything only works for small inputs.',
    },
    {
      kind: 'read',
      title: 'Two ways to keep a to-do list',
      body: `To explore every possibility, an algorithm keeps a list of things still to look at. Two kinds of list behave differently:

- a **stack** (like a pile of plates) gives back the **newest** item first;
- a **queue** (like a line at a counter) gives back the **oldest** item first.`,
    },
    {
      kind: 'task',
      body: 'Add a few letters to both, then take some out. Take out at least three.',
      widget: ({ onSolved }) => <StackQueue onSolved={onSolved} />,
      success: 'Same letters in, opposite orders out. Exploring with a stack dives deep first; exploring with a queue spreads out level by level.',
    },
    {
      kind: 'sequence',
      body: 'You add 1, 2, 3, 4 to a **stack**, then take everything out. In which order do they come out?',
      tokens: ['1', '2', '3', '4'],
      answer: ['4', '3', '2', '1'],
      explain: 'The newest comes out first: 4, 3, 2, 1. (A queue would give 1, 2, 3, 4.)',
    },
  ],
};

/* ---------- chapter 3: make it smaller ---------- */

const guessing: Lesson = {
  id: 'c3w1',
  title: 'Guess my number',
  summary: 'You can halve a search, build an answer from a smaller case, and compute remainders.',
  warmup: true,
  steps: [
    {
      kind: 'task',
      title: 'A guessing game',
      body: 'Find my number. After each guess you learn whether it was too small or too big. Try to use as few guesses as possible.',
      widget: ({ onSolved }) => <GuessNumber onSolved={onSolved} />,
      success: 'Each answer rules out part of the range. The best guess splits what is left into two equal halves.',
    },
    {
      kind: 'choice',
      body: 'Which strategy needs the fewest guesses in the **worst** case?',
      options: ['Try 1, 2, 3, … in order', 'Always guess the middle of what is still possible', 'Guess at random'],
      answer: 1,
      explain: 'The middle guess throws away half of the range whatever the answer. Counting up may need 100 guesses; halving needs at most 7.',
    },
    {
      kind: 'number',
      body: 'Guessing the middle each time, at most how many guesses find a number between 1 and 100?',
      answer: 7,
      hint: 'After each wrong guess at most half of the range is left: 100 → 50 → 25 → …',
      explain: 'Ranges of at most 100 → 50 → 25 → 12 → 6 → 3 → 1 numbers: the 7th guess is the last one needed. That is $\\lceil \\log_2 101 \\rceil = 7$.',
    },
    { kind: 'generated', make: (r) => guessesQ(r.pick([1000, 500, 5000, 1_000_000, 200, 50])) },
    {
      kind: 'read',
      title: 'Building from a smaller case',
      body: `Another way to make a problem smaller: solve it for $n - 1$, then add one more piece.

How many handshakes happen when $n$ people all shake hands once? If $H(n-1)$ handshakes happen among the first $n - 1$ people, the newcomer shakes $n - 1$ more hands:

$$H(n) = H(n-1) + (n - 1), \\qquad H(1) = 0$$`,
    },
    {
      kind: 'number',
      body: 'How many handshakes among 5 people?',
      answer: 10,
      hint: '$H(2) = 1$, $H(3) = 1 + 2$, …',
      explain: '$H(5) = 0 + 1 + 2 + 3 + 4 = 10$. In general $\\dfrac{n(n-1)}{2}$, a staircase sum.',
    },
    {
      kind: 'read',
      title: 'Remainders',
      body: `Dividing 17 by 5 gives 3, with **2 left over**: $17 = 3 \\times 5 + 2$. The left-over part is the **remainder**, written $17 \\bmod 5 = 2$ ("17 modulo 5").

A clock works this way: 15 hours after 0 o'clock on a 12-hour dial it shows $15 \\bmod 12 = 3$. Games and counting-out rhymes in this chapter use remainders.`,
    },
    { kind: 'generated', make: (r) => modQ(r.int(13, 99), r.int(3, 9)) },
    {
      kind: 'choice',
      body: 'Which list contains exactly the numbers with remainder 1 when divided by 4?',
      options: ['1, 4, 8, 12', '1, 5, 9, 13', '4, 5, 6, 7', '0, 4, 8, 12'],
      answer: 1,
      explain: 'They go up by 4 from 1: $1, 5, 9, 13, \\dots$ all equal $4k + 1$. (0, 4, 8, 12 have remainder 0.)',
    },
  ],
};

/* ---------- chapter 4: split in two ---------- */

const halves: Lesson = {
  id: 'c4w1',
  title: 'Halves of halves',
  summary: 'You can merge two sorted rows, split around a pivot and see where n log n comes from.',
  warmup: true,
  steps: [
    {
      kind: 'read',
      title: 'Split, solve, combine',
      body: `This chapter cuts a problem into halves, solves each half **the same way** (a recursive call), then **combines** the two answers.

Example: to sort a row, sort its left half, sort its right half, then **merge** them. Merging two sorted rows is easy: repeatedly compare their front values and take the smaller one.`,
      widget: () => (
        <div className="flex flex-col items-center gap-2">
          <ArrayRow items={[2, 5, 8].map((v) => ({ id: `l${v}`, label: v }))} />
          <ArrayRow items={[3, 4, 9].map((v) => ({ id: `r${v}`, label: v }))} />
        </div>
      ),
    },
    {
      kind: 'sequence',
      body: 'Merge the two sorted rows **2 5 8** and **3 4 9** into one sorted row.',
      tokens: ['2', '3', '4', '5', '8', '9'],
      answer: ['2', '3', '4', '5', '8', '9'],
      explain: '2 vs 3 → 2; 5 vs 3 → 3; 5 vs 4 → 4; 5 vs 9 → 5; 8 vs 9 → 8; the left row is empty, so 9 follows.',
    },
    {
      kind: 'number',
      body: 'That merge made one comparison for every value placed, except the last one. At most how many comparisons does merging two sorted rows of 6 values in total take?',
      answer: 5,
      explain: 'Each comparison places one value; when a row runs out, the rest is copied without comparing. At most $n - 1 = 5$.',
    },
    {
      kind: 'read',
      title: 'Why halving gives n log n',
      body: 'Draw the pieces level by level: the whole row on top, its halves below, their halves below that… Each level holds all $n$ items, and merging a level costs about $n$. Change $n$.',
      widget: () => <SplitLevels />,
    },
    {
      kind: 'number',
      body: 'For $n = 32$ items: how many levels below the top, and so how much work in total? Give the total ($n \\times$ levels).',
      answer: 160,
      hint: 'Levels = halvings from 32 down to 1.',
      explain: '$\\log_2 32 = 5$ levels of $32$: $32 \\times 5 = 160$. That is the recurrence $T(n) = 2T(n/2) + n$, with solution $\\Theta(n \\log n)$.',
    },
    {
      kind: 'choice',
      body: 'For $n = 1000$, compare $n \\log_2 n$ with $n^2$.',
      options: ['About the same', '$n \\log_2 n \\approx 10\\,000$ against $n^2 = 1\\,000\\,000$: 100 times less', '$n \\log_2 n$ is bigger'],
      answer: 1,
      explain: '$\\log_2 1000 \\approx 10$. Splitting in halves turns a quadratic method into an $n \\log n$ one — the main idea of this chapter.',
    },
    {
      kind: 'read',
      title: 'Splitting around a pivot',
      body: `Another way to split: pick one value, the **pivot**, and move the smaller values to its left and the bigger ones to its right. This is called **partitioning**. The pivot then sits exactly where it belongs in the sorted row.

With pivot 5: **5 8 2 9 1 7** becomes **2 1 · 5 · 8 9 7** (the order inside each side does not matter yet).`,
    },
    {
      kind: 'choice',
      body: 'Partition **3 9 6 1 8 4** around the pivot **6**. Which values end up on its left?',
      options: ['3, 1, 4', '9, 8', '3, 9, 1', '1, 3'],
      answer: 0,
      explain: 'The values smaller than 6 are 3, 1 and 4.',
    },
    {
      kind: 'number',
      body: 'After that partition, at which index does the pivot 6 sit (counting from 0)?',
      answer: 3,
      hint: 'How many values are smaller than 6?',
      explain: 'Three smaller values take indexes 0, 1, 2, so 6 lands at index 3 — its place in the sorted row 1 3 4 6 8 9.',
    },
  ],
};

/* ---------- chapter 5: change the shape ---------- */

const SEARCH_TREE = node('8', node('3', leaf('1'), node('6', leaf('4'))), node('10', null, leaf('14')));
const HEAP_VALUES = [9, 7, 8, 4, 5, 6];
const heapTree = (A: number[], i = 0): TNode | null =>
  i < A.length ? { id: `h${i}`, label: String(A[i]), left: heapTree(A, 2 * i + 1), right: heapTree(A, 2 * i + 2) } : null;

const order: Lesson = {
  id: 'c5w1',
  title: 'Keeping things in order',
  summary: 'You know the search-tree rule, the heap rule and its array layout, and binary numbers.',
  warmup: true,
  steps: [
    {
      kind: 'read',
      title: 'Search trees',
      body: `This chapter reorganises data so that later questions become cheap. A **binary search tree** stores values in a binary tree with one rule at every node: everything in its **left** subtree is **smaller**, everything in its **right** subtree is **bigger**.

To find a value, start at the root and go left or right at each node — like the guessing game.`,
      widget: () => <TreeView root={SEARCH_TREE} />,
    },
    {
      kind: 'choice',
      body: 'Where would the value **7** be added to this tree?',
      widget: () => <TreeView root={SEARCH_TREE} />,
      options: ['Left child of 3', 'Right child of 6', 'Left child of 10', 'Right child of 14'],
      answer: 1,
      hint: 'From the root: 7 < 8 go left; 7 > 3 go right; then compare with 6.',
      explain: '7 < 8 → left to 3; 7 > 3 → right to 6; 7 > 6 → right child of 6, which is empty: put it there.',
    },
    {
      kind: 'choice',
      body: 'How do you find the **smallest** value in a search tree?',
      options: ['Look at the root', 'Go left until you cannot', 'Go right until you cannot', 'Visit every node'],
      answer: 1,
      explain: 'Smaller values are always to the left: 8 → 3 → 1. The cost is the height of the tree, which stays near $\\log_2 n$ only if the tree is kept **balanced** — the topic of one lesson here.',
    },
    {
      kind: 'read',
      title: 'Heaps',
      body: `A **heap** follows another rule: every parent is **at least as big** as its children. So the biggest value is always at the root. The tree is filled level by level, left to right, so it fits in an array with no gaps:

the children of index $i$ are at $2i + 1$ and $2i + 2$.`,
      widget: () => (
        <div className="flex flex-col items-center gap-3">
          <TreeView root={heapTree(HEAP_VALUES)} />
          <ArrayRow items={HEAP_VALUES.map((v, i) => ({ id: i, label: v }))} showIndex />
        </div>
      ),
    },
    {
      kind: 'number',
      body: 'In a heap stored in an array, what is the index of the **left child** of index 3?',
      answer: 7,
      explain: '$2 \\times 3 + 1 = 7$ (and the right child is at 8).',
    },
    {
      kind: 'choice',
      body: 'Is the array **9 5 8 6 1** a heap?',
      options: ['Yes', 'No: 5 has a child bigger than itself', 'No: 9 should be last'],
      answer: 1,
      hint: 'The children of index 1 (value 5) are at indexes 3 and 4.',
      explain: 'Index 1 holds 5, its children are 6 and 1. Since $6 > 5$, the heap rule is broken.',
    },
    {
      kind: 'read',
      title: 'Binary numbers',
      body: 'Switches can also write numbers. Give the switches the values 8, 4, 2, 1 and add up those that are on: this is **binary**, counting with only the digits 0 and 1.',
      widget: () => <SubsetSwitches items={['8', '4', '2', '1']} binary />,
    },
    {
      kind: 'number',
      body: 'What number does the binary **1011** stand for?',
      answer: 11,
      explain: '$8 + 0 + 2 + 1 = 11$.',
    },
    {
      kind: 'number',
      body: 'How many binary digits (switches) are needed to write every number from 0 to 999?',
      answer: 10,
      hint: '$k$ switches write $2^k$ different numbers.',
      explain: '$2^9 = 512$ is too few, $2^{10} = 1024$ is enough: 10 digits, about $\\log_2 1000$.',
    },
  ],
};

/* ---------- chapter 6: memory for speed ---------- */

const TALLY_INPUT = [2, 0, 3, 2, 1, 2, 0];

const notes: Lesson = {
  id: 'c6w1',
  title: 'Notes that save time',
  summary: 'You can tally values, turn counts into running totals and see when extra memory pays.',
  warmup: true,
  steps: [
    {
      kind: 'read',
      title: 'Keep a tally',
      body: `When the values are small whole numbers, you can **count** them instead of comparing them. One pass over the row, with one counter per possible value:

values 0 1 2 3 → counts **2 1 3 1** (two 0s, one 1, three 2s, one 3).

The counters are **extra memory**, used to save time.`,
      widget: () => <ArrayRow items={TALLY_INPUT.map((v, i) => ({ id: i, label: v }))} showIndex />,
    },
    {
      kind: 'number',
      body: 'How many times does the value 3 appear in **3 1 0 3 3 0 2 3**?',
      answer: 4,
      explain: 'Indexes 0, 3, 4 and 7: four 3s.',
    },
    {
      kind: 'read',
      title: 'Running totals',
      body: `Add the counts up as you go: **2 1 3 1** becomes **2 3 6 7**. These **running totals** say where each value ends in the sorted row:

the 0s fill places 1–2, the 1 is place 3, the 2s fill places 4–6, the 3 is place 7. So **0 0 1 2 2 2 3**, without a single comparison.`,
    },
    {
      kind: 'sequence',
      body: 'Turn the counts **1 4 2 3** into running totals.',
      tokens: ['1', '5', '7', '10', '4', '6'],
      answer: ['1', '5', '7', '10'],
      hint: 'Each total is the previous total plus the next count.',
      explain: '$1$, $1 + 4 = 5$, $5 + 2 = 7$, $7 + 3 = 10$. The last total is always the number of values.',
    },
    {
      kind: 'number',
      body: 'With the counts **1 4 2 3** (for the values 0, 1, 2, 3), how many values come before the first 3 in the sorted row?',
      answer: 7,
      explain: 'The running total just before value 3 is 7: seven values (0s, 1s and 2s) come first.',
    },
    {
      kind: 'choice',
      body: 'For which input is counting a good idea?',
      options: [
        'The marks from 0 to 20 of 10 000 students',
        'Ten values anywhere between 0 and one billion',
        'Names of people',
      ],
      answer: 0,
      explain: 'Counting needs one counter per possible value: 21 counters for 10 000 marks is cheap. A billion counters for ten values would waste memory and time.',
    },
  ],
};

/* ---------- chapter 7: best step first ---------- */

const ROUTE: { nodes: GNode[]; edges: GEdge[] } = {
  nodes: [
    { id: 's', x: 40, y: 100 },
    { id: 'a', x: 160, y: 40 },
    { id: 'b', x: 160, y: 160 },
    { id: 't', x: 300, y: 100 },
  ],
  edges: [
    { u: 's', v: 'a', w: 1 },
    { u: 's', v: 'b', w: 4 },
    { u: 'a', v: 'b', w: 2 },
    { u: 'a', v: 't', w: 6 },
    { u: 'b', v: 't', w: 1 },
  ],
};

const bestMove: Lesson = {
  id: 'c7w1',
  title: 'The best-looking move',
  summary: 'You saw when grabbing the best move right now works, when it fails, and how to measure routes.',
  warmup: true,
  steps: [
    {
      kind: 'read',
      title: 'Grab the biggest coin',
      body: `To pay an amount with as few coins as possible, a natural rule is: **take the biggest coin that still fits**, again and again. With coins 1, 2 and 5, the amount 9 becomes $5 + 2 + 2$: three coins.

Methods that always make the move that looks best **right now**, and never go back, are the topic of this chapter.`,
    },
    {
      kind: 'number',
      body: 'With coins 1, 2 and 5, how many coins does that rule use for 18?',
      answer: 5,
      explain: '$5 + 5 + 5 + 2 + 1$: five coins (and that is the fewest possible).',
    },
    {
      kind: 'choice',
      body: 'Now the coins are 1, 3 and 4, and the amount is 6. The rule gives $4 + 1 + 1$. What is the **fewest** number of coins?',
      options: ['3 coins: the rule is right', '2 coins: 3 + 3', '1 coin', '6 coins'],
      answer: 1,
      explain: '$3 + 3$ uses 2 coins. Grabbing the 4 looked best but ruined the rest. A best-looking move is only safe when you can **prove** it never hurts — the real question of this chapter.',
    },
    {
      kind: 'read',
      title: 'Measuring routes',
      body: 'Recall: in a weighted graph, the length of a path is the sum of its weights. Find routes from **s** to **t** in this graph.',
      widget: () => <GraphView nodes={ROUTE.nodes} edges={ROUTE.edges} width={340} height={200} />,
    },
    {
      kind: 'number',
      body: 'What is the length of the path s–a–t?',
      widget: () => <GraphView nodes={ROUTE.nodes} edges={ROUTE.edges} width={340} height={200} />,
      answer: 7,
      explain: '$1 + 6 = 7$.',
    },
    {
      kind: 'number',
      body: 'What is the length of the **shortest** path from s to t?',
      widget: () => <GraphView nodes={ROUTE.nodes} edges={ROUTE.edges} width={340} height={200} />,
      answer: 4,
      hint: 'Try s–a–b–t.',
      explain: 's–a–b–t costs $1 + 2 + 1 = 4$, shorter than s–b–t (5) and s–a–t (7).',
    },
    {
      kind: 'sequence',
      body: 'A safe way to find shortest routes from s: repeatedly settle the **closest** vertex not settled yet. Distances from s are a 1, b 3, t 4. In which order are the vertices settled?',
      widget: () => <GraphView nodes={ROUTE.nodes} edges={ROUTE.edges} width={340} height={200} />,
      tokens: ['s', 'a', 'b', 't'],
      answer: ['s', 'a', 'b', 't'],
      explain: 'By increasing distance: s (0), a (1), b (3), t (4). This is the idea of the shortest-route method in this chapter, and here the best-looking choice is provably safe.',
    },
  ],
};

/* ---------- chapter 8: puzzle box ---------- */

const QUESTIONS_TREE: TNode = {
  id: 'q1',
  label: '≤ 2?',
  left: { id: 'q2', label: '= 1?', left: leaf('1'), right: leaf('2') },
  right: { id: 'q3', label: '= 3?', left: leaf('3'), right: leaf('4') },
};

const questions: Lesson = {
  id: 'c8w1',
  title: 'Questions as a tree',
  summary: 'You can count how many yes/no questions, weighings or matches a puzzle needs at least.',
  warmup: true,
  steps: [
    {
      kind: 'read',
      title: 'Each answer splits the cases',
      body: `To find which of 4 cases is true with yes/no questions, ask "≤ 2?", then one more question. Draw it as a tree: each question is a node, each answer a branch (left = yes), each leaf one case.

$k$ questions give at most $2^k$ leaves, so they can tell apart at most $2^k$ cases.`,
      widget: () => <TreeView root={QUESTIONS_TREE} colW={58} />,
    },
    {
      kind: 'number',
      body: 'How many cases can 3 yes/no questions tell apart, at most?',
      answer: 8,
      explain: '$2^3 = 8$ leaves.',
    },
    {
      kind: 'number',
      body: 'At least how many yes/no questions are needed to tell apart 1000 cases?',
      answer: 10,
      hint: 'Find the smallest $k$ with $2^k \\ge 1000$.',
      explain: '$2^9 = 512 < 1000 \\le 1024 = 2^{10}$: 10 questions, $\\lceil \\log_2 1000 \\rceil$. No cleverness can do better — a lower bound.',
    },
    {
      kind: 'read',
      title: 'Three answers',
      body: 'A balance scale has **three** outcomes: left heavier, right heavier, or balanced. So $k$ weighings can tell apart up to $3^k$ cases. To find one heavier coin among 9, weigh 3 against 3: the heavy coin is in the heavier group, or in the 3 left aside if they balance.',
    },
    {
      kind: 'number',
      body: 'Among 9 coins one is heavier. How many weighings are needed?',
      answer: 2,
      explain: 'First weighing: 3 against 3 keeps 3 suspects. Second: 1 against 1 finds it. $3^2 = 9$ cases, 2 weighings.',
    },
    {
      kind: 'number',
      body: 'Among 27 coins one is heavier. How many weighings are needed?',
      answer: 3,
      explain: 'Groups of 9, then 3, then 1: three weighings, since $3^3 = 27$.',
    },
    {
      kind: 'read',
      title: 'Knock-out matches',
      body: 'In a knock-out tournament every match eliminates exactly one player, and everyone but the winner is eliminated once. So $n$ players play exactly $n - 1$ matches — just like the $n - 1$ comparisons needed to find the largest value.',
      widget: () => <CodeBlock lines={['round 1:  8 players → 4 matches', 'round 2:  4 players → 2 matches', 'round 3:  2 players → 1 match', 'total: 7 matches, 3 rounds']} />,
    },
    {
      kind: 'number',
      body: 'A knock-out tournament has 16 players. How many matches are played?',
      answer: 15,
      explain: '$16 - 1 = 15$: each match knocks out one player and 15 must go.',
    },
    {
      kind: 'number',
      body: 'And how many rounds does it last?',
      answer: 4,
      explain: '16 → 8 → 4 → 2 → 1: $\\log_2 16 = 4$ rounds. The winner plays one match per round.',
    },
  ],
};

export const warmups = { c2: possibilities, c3: guessing, c4: halves, c5: order, c6: notes, c7: bestMove, c8: questions };
