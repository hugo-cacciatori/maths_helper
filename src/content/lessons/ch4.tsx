import type { Lesson, QuestionStep } from '../../lib/types';
import { CodeBlock } from '../../widgets/kit';
import { ChocolateBar, FlagSort, MergeSortTree, PowerByHalves, QuickSortViz, TraversalClicker } from '../../widgets/split';

/* ---------- practice questions with fresh numbers ---------- */

export const powerMultsQ = (n: number): QuestionStep => {
  const chain: number[] = [];
  for (let e = n; e >= 1; e = Math.floor(e / 2)) chain.push(e);
  const odd = chain.filter((e) => e > 1 && e % 2 === 1);
  const total = chain.length - 1 + odd.length;
  return {
    kind: 'number',
    body: `How many multiplications does the halving method use for $a^{${n}}$?`,
    answer: total,
    hint: 'Follow the exponent down: halve it (rounding down) until you reach 1. Each step is one squaring, plus one more multiplication by $a$ when the exponent is odd.',
    explain: `$${chain.join(' \\to ')}$: ${chain.length - 1} squarings${odd.length ? `, plus one multiplication by $a$ for each odd exponent above 1 (${odd.join(', ')})` : ''}. Total **${total}**, against ${n - 1} for the direct method.`,
  };
};

const pw = (d: number) => (d === 0 ? '1' : d === 1 ? 'n' : `n^{${d}}`);

export const masterQ = (a: number, b: number, d: number): QuestionStep => {
  const bd = b ** d;
  const e = Math.log(a) / Math.log(b);
  return {
    kind: 'choice',
    title: 'Practice',
    body: `Solve $T(n) = ${a === 1 ? '' : a}T(n/${b}) + ${pw(d)}$.`,
    options: [`$\\Theta(${pw(d)})$`, `$\\Theta(${d === 0 ? '' : pw(d) + ' '}\\log n)$`, `$\\Theta(n^{\\log_{${b}} ${a}})$`],
    answer: a < bd ? 0 : a === bd ? 1 : 2,
    explain: `$a = ${a}$, $b = ${b}$, $d = ${d}$, so $b^d = ${bd}$. ${
      a < bd
        ? `$${a} < ${bd}$: the combine step dominates, $\\Theta(${pw(d)})$.`
        : a === bd
          ? `$${a} = ${bd}$: every level costs the same and there are $\\log_${b} n$ levels.`
          : `$${a} > ${bd}$: the leaves dominate, $\\Theta(n^{\\log_{${b}} ${a}})$ with $\\log_{${b}} ${a} ${Number.isInteger(e) ? '=' : '\\approx'} ${Number.isInteger(e) ? e : e.toFixed(2)}$.`
    }`,
  };
};

const mergesort: Lesson = {
  id: 'c4l1',
  title: 'Sort by splitting and merging',
  summary: 'You can trace merge sort, explain why it is stable, and derive its Θ(n log n) cost.',
  steps: [
    {
      kind: 'read',
      title: 'Split, solve, combine',
      body: `**Split, solve, combine**: split the problem into independent sub-problems of the same kind, solve them recursively, and **combine** their solutions.

Merge sort splits the array in two halves, sorts each half, then **merges** the two sorted halves by repeatedly taking the smaller front element. The two E's are labelled $E_1$ and $E_2$ so you can follow them.`,
    },
    {
      kind: 'task',
      body: 'Sort **E, X, A, M, P, L, E** with merge sort. Step through every split and every merge.',
      widget: ({ onSolved }) => <MergeSortTree onSolved={onSolved} />,
      success: 'Result: A E E L M P X.',
    },
    {
      kind: 'choice',
      body: 'Is merge sort **stable** (equal keys keep their original relative order)? Look at $E_1$ and $E_2$ at the end.',
      options: ['Yes — when the two front elements are equal, the merge takes the one from the left half first', 'No — equal keys can be swapped', 'Only if the array length is a power of two'],
      answer: 0,
      explain: '$E_1$ still comes before $E_2$. With the test `left ≤ right`, ties always go to the left half, which holds the earlier elements: merge sort is stable.',
    },
    {
      kind: 'choice',
      body: 'Merging two halves of total size $n$ costs at most $n - 1$ comparisons. Which recurrence describes the number of comparisons $C(n)$?',
      options: ['$C(n) = C(n-1) + n$', '$C(n) = 2C(n/2) + n - 1$', '$C(n) = C(n/2) + 1$', '$C(n) = 2C(n-1) + 1$'],
      answer: 1,
      explain: 'Two recursive calls on halves, plus the merge. Each of the $\\log_2 n$ levels of the tree costs about $n$, so $C(n) \\in \\Theta(n \\log n)$.',
    },
    {
      kind: 'choice',
      title: 'Counting inversions',
      body: 'An **inversion** is a pair $i < j$ with $A[i] > A[j]$. During a merge, when an element of the **right** half is taken before the remaining $k$ elements of the left half, how many inversions does that reveal?',
      options: ['1', '$k$', '$k - 1$', 'None'],
      answer: 1,
      explain: 'It is smaller than all $k$ remaining left elements, which were before it in the array: $k$ inversions at once. Adding these counts during merge sort gives an $O(n \\log n)$ inversion counter.',
    },
  ],
};

const quicksort: Lesson = {
  id: 'c4l2',
  title: 'Sort around a pivot',
  summary: 'You traced Hoare partitioning and learnt why the pivot choice decides quicksort’s fate.',
  steps: [
    {
      kind: 'read',
      title: 'Partition around a pivot',
      body: `Quicksort does the hard work **before** recursing: it **partitions** the array around a pivot $p$ (here the first element) so that everything on the left is $\\le p$ and everything on the right is $\\ge p$. The pivot is then in its final place, and both sides are sorted recursively.

Partitioning uses two scans: $i$ moves right until it finds an element $\\ge p$, $j$ moves left until it finds one $\\le p$; then they are swapped. When $i$ and $j$ cross, the pivot is swapped with $A[j]$.`,
    },
    {
      kind: 'task',
      body: 'Sort **E, X, A, M, P, L, E** with quicksort and watch the tree of recursive calls grow.',
      widget: ({ onSolved }) => <QuickSortViz onSolved={onSolved} />,
      success: 'Each call is shown with its bounds $l, r$ and the split position $s$ where its pivot landed.',
    },
    {
      kind: 'sequence',
      body: 'After the **first** partition (pivot $E_1$), in which order are the elements? (The pivot ends at position 2.)',
      tokens: ['E₂', 'X', 'A', 'M', 'P', 'L', 'E₁'],
      answer: ['A', 'E₂', 'E₁', 'M', 'P', 'L', 'X'],
      hint: 'Step back to the frame “Put the pivot in its final place”.',
      explain: '$i$ stops on X, $j$ on $E_2$: swap → $E_1$ $E_2$ A M P L X. Then $i$ stops on M, $j$ on A: they have crossed, so the pivot is swapped with A → A $E_2$ $E_1$ M P L X. The two E’s changed order: quicksort is **not stable**.',
    },
    {
      kind: 'choice',
      body: 'With **median-of-three** pivot selection (median of first, middle and last elements), what is an array already sorted in increasing order?',
      options: ['The worst case', 'The best case', 'Neither'],
      answer: 1,
      explain: 'The median of three on a sorted array is the true median, so every partition splits exactly in half: the best case, $\\Theta(n\\log n)$. (Same for decreasing order.) With the plain first-element pivot, a sorted array is the **worst** case: splits of size $0$ and $n-1$, giving $\\Theta(n^2)$.',
    },
  ],
};

const power: Lesson = {
  id: 'c4l3',
  title: 'Powers in a few steps',
  summary: 'You computed aⁿ with Θ(log n) multiplications and solved the recurrences of splitting algorithms.',
  steps: [
    {
      kind: 'read',
      title: 'Halving the exponent',
      body: `The direct method computes $a^n$ with $n - 1$ multiplications. Splitting the exponent uses
$$a^n = \\left(a^{\\lfloor n/2 \\rfloor}\\right)^2 \\text{ if } n \\text{ is even}, \\qquad a^n = \\left(a^{\\lfloor n/2 \\rfloor}\\right)^2 \\cdot a \\text{ if } n \\text{ is odd}.$$
The crucial point: $a^{\\lfloor n/2 \\rfloor}$ is computed **once** and squared. Slide $n$.`,
      widget: () => <PowerByHalves />,
    },
    { kind: 'generated', make: (r) => powerMultsQ(r.int(10, 200)) },
    {
      kind: 'choice',
      title: 'Max and min',
      body: 'Splitting for max **and** min: split in halves, solve each, then 2 comparisons to combine (max vs max, min vs min), with 1 comparison for a pair. For $n = 2^k$, the count is $C(n) = 2C(n/2) + 2$, $C(2) = 1$. What is $C(n)$?',
      options: ['$2n - 2$', '$\\dfrac{3n}{2} - 2$', '$n \\log_2 n$', '$n - 1$'],
      answer: 1,
      explain: 'Unrolling: $C(n) = \\frac{n}{2}C(2) + 2(\\frac n2 - 1) = \\frac{3n}{2} - 2$. Better than the $2n - 2$ of the direct scan! For max alone, splitting needs $n - 1$ comparisons — the same as the direct method.',
    },
    {
      kind: 'read',
      title: 'The master theorem',
      body: `Recurrences of algorithms that split their input look like $T(n) = a\\,T(n/b) + f(n)$ with $f(n) \\in \\Theta(n^d)$. Compare $a$ with $b^d$:

- $a < b^d$: $T(n) \\in \\Theta(n^d)$ — the combine step dominates;
- $a = b^d$: $T(n) \\in \\Theta(n^d \\log n)$ — every level costs the same;
- $a > b^d$: $T(n) \\in \\Theta(n^{\\log_b a})$ — the leaves dominate.`,
    },
    {
      kind: 'choice',
      body: 'Solve $T(n) = 4T(n/2) + n$.',
      options: ['$\\Theta(n)$', '$\\Theta(n \\log n)$', '$\\Theta(n^2)$', '$\\Theta(n^2 \\log n)$'],
      answer: 2,
      explain: '$a = 4$, $b = 2$, $d = 1$: $4 > 2^1$, so $\\Theta(n^{\\log_2 4}) = \\Theta(n^2)$.',
    },
    {
      kind: 'choice',
      body: 'Solve $T(n) = 4T(n/2) + n^2$.',
      options: ['$\\Theta(n^2)$', '$\\Theta(n^2 \\log n)$', '$\\Theta(n^3)$', '$\\Theta(n \\log n)$'],
      answer: 1,
      explain: '$a = 4 = 2^2 = b^d$: every level costs $n^2$ and there are $\\log_2 n$ levels — $\\Theta(n^2\\log n)$.',
    },
    {
      kind: 'choice',
      body: 'Solve $T(n) = T(n/3) + 1$.',
      options: ['$\\Theta(1)$', '$\\Theta(\\log n)$', '$\\Theta(n)$', '$\\Theta(n^{1/3})$'],
      answer: 1,
      explain: '$a = 1 = 3^0 = b^d$: $\\Theta(n^0 \\log n) = \\Theta(\\log n)$ — one step per division by 3.',
    },
    { kind: 'generated', make: (r) => masterQ(r.int(1, 9), r.int(2, 4), r.int(0, 3)) },
  ],
};

const flags: Lesson = {
  id: 'c4l4',
  title: 'Grouping colours in one pass',
  summary: 'You can partition by colour in one pass using an invariant with three pointers.',
  steps: [
    {
      kind: 'read',
      title: 'Two colours',
      body: 'Red and white elements must be rearranged with all reds first, using only “look at a colour” and “swap two elements”. Keep the reds in a zone at the front: scan left to right and, each time you meet a red, swap it to the end of that zone. Step through it.',
      widget: () => <FlagSort colors={['W', 'R', 'W', 'W', 'R', 'R', 'W', 'R', 'W', 'R']} />,
    },
    {
      kind: 'task',
      title: 'Three colours',
      body: `Now red, white **and** blue. Dijkstra's solution keeps four zones, described by three indices — the **invariant**:

$$\\underbrace{R\\dots R}_{[0,\\,lo)}\\ \\underbrace{W\\dots W}_{[lo,\\,mid)}\\ \\underbrace{?\\dots ?}_{[mid,\\,hi]}\\ \\underbrace{B\\dots B}_{(hi,\\,n)}$$

Each step examines $A[mid]$ and shrinks the unknown zone by one. Run it.`,
      widget: ({ onSolved }) => <FlagSort colors={['B', 'R', 'W', 'B', 'R', 'W', 'W', 'R', 'B', 'R', 'W', 'B']} onSolved={onSolved} />,
      success: 'Each examination shrinks the unknown zone by exactly one element.',
    },
    {
      kind: 'choice',
      body: 'How many colour examinations does the algorithm make for $n$ elements?',
      options: ['$n$', '$n \\log n$', '$n^2/2$', 'It depends on the colours, up to $2n$'],
      answer: 0,
      explain: 'Every iteration examines $A[mid]$ once and the unknown zone loses one element: exactly $n$ examinations, and at most $n$ swaps — $\\Theta(n)$.',
    },
    {
      kind: 'choice',
      body: 'When $A[mid]$ is **blue**, why don’t we increase $mid$ after swapping it with $A[hi]$?',
      options: ['Because $hi$ already moved', 'Because the element that arrives at $mid$ came from the unknown zone and has not been examined yet', 'To save a comparison', 'Because blue elements must be examined twice'],
      answer: 1,
      explain: 'The element swapped in from position $hi$ is still unknown. (A red swapped in from $lo$ is known to be white or $mid = lo$, so $mid$ can advance in that case.)',
    },
  ],
};

const trees: Lesson = {
  id: 'c4l5',
  title: 'Walking through a tree',
  summary: 'You can traverse a binary tree in pre-, in- and post-order and reason recursively about trees.',
  steps: [
    {
      kind: 'read',
      title: 'A tree is a recursive object',
      body: 'A binary tree is either empty, or a root with a **left** and a **right** subtree. That makes trees the natural playground of splitting: solve for both subtrees, then combine at the root. The three classic traversals differ only in **when** the root is visited.',
    },
    {
      kind: 'task',
      title: 'Preorder',
      body: 'Click the nodes in **preorder**: root, then left subtree, then right subtree.',
      widget: ({ onSolved }) => <TraversalClicker order="pre" onSolved={onSolved} />,
      success: 'Preorder: a b d e c f.',
    },
    {
      kind: 'task',
      title: 'Inorder',
      body: 'Now **inorder**: left subtree, root, right subtree.',
      widget: ({ onSolved }) => <TraversalClicker order="in" onSolved={onSolved} />,
      success: 'Inorder: d b e a c f. (For a binary *search* tree, inorder lists the keys in increasing order.)',
    },
    {
      kind: 'task',
      title: 'Postorder',
      body: 'Finally **postorder**: left subtree, right subtree, root.',
      widget: ({ onSolved }) => <TraversalClicker order="post" onSolved={onSolved} />,
      success: 'Postorder: d e b f c a. The root always comes last.',
    },
    {
      kind: 'choice',
      body: 'This algorithm is supposed to count the leaves of a binary tree. Is it correct?',
      widget: () => <CodeBlock title="Algorithm LeafCounter(T)" lines={['if T = ∅ return 0', 'else return LeafCounter(T_L) + LeafCounter(T_R)']} />,
      options: [
        'Yes, it is correct',
        'No — it always returns 0; it needs a case “if T is a leaf (both subtrees empty) return 1”',
        'No — it counts all the nodes instead of the leaves',
        'No — it never terminates',
      ],
      answer: 1,
      explain: 'Nothing ever returns a non-zero value, so the sum is always 0. Add: `if T_L = ∅ and T_R = ∅ return 1`.',
    },
    {
      kind: 'task',
      title: 'One break at a time',
      body: 'A $3 \\times 4$ chocolate bar must be broken into 12 squares. You may break **one piece at a time**, along a straight line. Try to use as few breaks as possible.',
      widget: ({ onSolved }) => <ChocolateBar rows={3} cols={4} onSolved={onSolved} />,
      success: 'However you do it, it takes exactly 11 breaks!',
    },
    {
      kind: 'choice',
      body: 'Why does an $n \\times m$ bar always need exactly $nm - 1$ breaks, whatever the strategy?',
      options: [
        'Because of the master theorem',
        'Each break turns one piece into two, so the number of pieces grows by exactly one per break: from 1 to $nm$',
        'Because breaking along rows first is optimal',
      ],
      answer: 1,
      explain: 'Seen as a tree: each break is an internal node with two children, the $nm$ squares are the leaves, and a full binary tree with $L$ leaves has $L - 1$ internal nodes.',
    },
  ],
};

export const ch4Lessons = [mergesort, quicksort, power, flags, trees];
