import type { Lesson } from '../../lib/types';
import { AvlBuilder, AvlCheck, HeapViz, WineDecoder } from '../../widgets/reshape';

const HEAP_INPUT = [1, 8, 6, 5, 3, 7, 4];

const heaps: Lesson = {
  id: 'c5l1',
  title: 'Keeping the largest on top',
  summary: 'You can build a heap bottom-up or by insertions, and sort with it in Θ(n log n).',
  steps: [
    {
      kind: 'read',
      title: 'Change the representation',
      body: `A useful strategy: first change the problem into a more convenient form — a sorted array, a balanced tree, a heap… — and then solves it.

A **heap** is a complete binary tree (filled level by level, left to right) where every parent is **≥ its children** (*parental dominance*). It is stored in an array: the children of position $i$ are at $2i$ and $2i+1$ (counting from 1). So the maximum is always at the root.`,
    },
    {
      kind: 'task',
      title: 'Bottom-up',
      body: 'Build a heap from **1, 8, 6, 5, 3, 7, 4**, already in the array. Bottom-up: starting from the last parental node and going back to the root, sift each key down until parental dominance holds.',
      widget: ({ onSolved }) => <HeapViz input={HEAP_INPUT} mode="bottom-up" onSolved={onSolved} />,
      success: 'Heap: 8 5 7 1 3 6 4.',
    },
    {
      kind: 'task',
      title: 'Top-down',
      body: 'Now build it by **successive insertions**: each new key goes into the next free leaf and is sifted **up** while it is bigger than its parent.',
      widget: ({ onSolved }) => <HeapViz input={HEAP_INPUT} mode="top-down" onSolved={onSolved} />,
      success: 'Heap: 8 5 7 1 3 6 4 — the same heap as bottom-up, this time.',
    },
    {
      kind: 'choice',
      body: 'Do the two algorithms **always** build the same heap from the same list? Try mentally with **1, 2, 3**.',
      options: ['Yes, always', 'No — for 1, 2, 3 bottom-up gives 3 2 1 but top-down gives 3 1 2', 'Only when the list is sorted'],
      answer: 1,
      explain: 'Bottom-up sifts 1 down past its larger child 3: 3 2 1. Top-down: 1; then 2 swaps up: 2 1; then 3 swaps with 2: 3 1 2. Both are valid heaps — just different ones.',
    },
    {
      kind: 'choice',
      body: 'How can you check that an array $H[1..n]$ is a heap, and at what cost?',
      options: [
        'Check that the array is sorted in decreasing order — $\\Theta(n)$',
        'Check $H[i] \\ge H[2i]$ and $H[i] \\ge H[2i+1]$ for every parental position $i \\le \\lfloor n/2 \\rfloor$ — $\\Theta(n)$',
        'Build a heap and compare — $\\Theta(n \\log n)$',
      ],
      answer: 1,
      explain: 'A heap need not be sorted (8 5 7 1 3 6 4 is not). Checking each parent against its at most two children takes about $n$ comparisons.',
    },
    {
      kind: 'task',
      title: 'Heapsort',
      body: 'Heapsort: (1) build a heap; (2) repeatedly swap the root (the maximum) with the last heap element, shrink the heap by one, and sift the new root down. Sort **1, 2, 3, 4, 5** in increasing order.',
      widget: ({ onSolved }) => <HeapViz input={[1, 2, 3, 4, 5]} mode="heapsort" onSolved={onSolved} />,
      success: 'The green cells grow from the right: each deletion of the maximum puts one more key in its final place.',
    },
    {
      kind: 'choice',
      body: 'What is the worst-case complexity of heapsort?',
      options: ['$\\Theta(n)$', '$\\Theta(n \\log n)$', '$\\Theta(n^2)$', '$\\Theta(\\log n)$'],
      answer: 1,
      explain: 'Building the heap is $\\Theta(n)$; each of the $n - 1$ root deletions sifts down at most the height $\\lfloor\\log_2 n\\rfloor$: $\\Theta(n\\log n)$ in total, in place.',
    },
    {
      kind: 'choice',
      body: 'A priority queue supports **find max**, **delete max** and **insert**. With a heap, what are their costs?',
      options: ['$\\Theta(1)$, $\\Theta(\\log n)$, $\\Theta(\\log n)$', '$\\Theta(n)$, $\\Theta(n)$, $\\Theta(1)$', '$\\Theta(1)$, $\\Theta(1)$, $\\Theta(n)$', '$\\Theta(\\log n)$ for all three'],
      answer: 0,
      explain: 'Max is at the root; deleting it or inserting a key moves one element along a root-to-leaf path. (Unsorted array: $\\Theta(n)$, $\\Theta(n)$, $\\Theta(1)$; sorted array: $\\Theta(1)$, $\\Theta(1)$, $\\Theta(n)$.)',
    },
  ],
};

const avl: Lesson = {
  id: 'c5l2',
  title: 'Keeping a search tree short',
  summary: 'You can recognise AVL trees and rebalance them with the four rotations while inserting.',
  steps: [
    {
      kind: 'read',
      title: 'Balanced search trees',
      body: `A binary search tree is fast only if it is not too tall. An **AVL tree** is a binary search tree in which, for every node, the **balance factor** — height of the left subtree minus height of the right subtree — is $-1$, $0$ or $+1$ (the empty tree has height $-1$). Its height is then always $\\Theta(\\log n)$.`,
    },
    {
      kind: 'choice',
      body: 'Which of these binary trees are AVL trees? Use both checkboxes.',
      widget: () => <AvlCheck />,
      options: ['(a) only', '(a) and (c)', '(b) and (c)', 'All three'],
      answer: 0,
      explain: '(b) is unbalanced: node 4 has a left subtree of height 1 and an empty right subtree (factor +2). (c) is perfectly balanced but **not a search tree** (2 is right of 3, 7 is left of 6), so it cannot be an AVL tree.',
    },
    {
      kind: 'task',
      body: 'Insert **1, 2, 3, 4, 5, 6** into an empty AVL tree. Increasing keys would build a degenerate list in a plain BST; watch the rotations prevent it.',
      widget: ({ onSolved }) => <AvlBuilder keys={[1, 2, 3, 4, 5, 6]} onSolved={onSolved} />,
      success: 'Three single left rotations; final tree rooted at 4, height 2.',
    },
    {
      kind: 'read',
      title: 'The four rotations',
      body: `After an insertion, find the **deepest** node whose balance factor became $\\pm2$, and look at where the new key went:

- left subtree of its **left** child → single **right** rotation (R);
- right subtree of its **right** child → single **left** rotation (L);
- right subtree of its left child → double **left-right** rotation (LR);
- left subtree of its right child → double **right-left** rotation (RL).

One rotation always restores the balance of the whole tree.`,
    },
    {
      kind: 'task',
      body: 'Insert **3 10 13 4 16 8 6 14 9 7**, one key at a time, and note each rotation.',
      widget: ({ onSolved }) => <AvlBuilder keys={[3, 10, 13, 4, 16, 8, 6, 14, 9, 7]} onSolved={onSolved} />,
      success: 'Final tree: root 10; left subtree 6 (4 (3), 8 (7, 9)); right subtree 14 (13, 16).',
    },
    {
      kind: 'number',
      body: 'How many rotations (counting a double rotation as one) were needed for this sequence?',
      answer: 4,
      explain: 'L at 3 (inserting 13), L at 3 (inserting 8), RL at 13 (inserting 14), RL at 4 (inserting 7).',
    },
    {
      kind: 'sequence',
      body: 'Give the types of those rotations, in order.',
      tokens: ['L', 'R', 'LR', 'RL', 'L', 'RL'],
      answer: ['L', 'L', 'RL', 'RL'],
      explain: 'L, L, RL, RL.',
    },
  ],
};

const wine: Lesson = {
  id: 'c5l3',
  title: 'One round of tasting',
  summary: 'You recast a search problem in binary to solve it in one round.',
  steps: [
    {
      kind: 'read',
      title: 'A grim puzzle',
      body: 'A wicked king learns that one of his **1000** barrels of wine is poisoned. The poison kills in **exactly 30 days**, even in a tiny dose. A feast is planned in **5 weeks**. He is ready to use **10** tasters to find the poisoned barrel. Testing barrels one by one would take years… Change the point of view: write barrel numbers in **binary**.',
    },
    {
      kind: 'task',
      body: 'Choose a poisoned barrel, see who drinks what, then wait 30 days.',
      widget: ({ onSolved }) => <WineDecoder onSolved={onSolved} />,
      success: 'The pattern of deaths *is* the binary number of the barrel.',
    },
    {
      kind: 'choice',
      body: 'Can the poisoned barrel be identified before the feast in 5 weeks?',
      options: ['Yes: one round of tasting is enough, since $2^{10} = 1024 \\ge 1000$, and 30 days < 35 days', 'No: it needs 10 rounds of 30 days', 'Only if the barrel number is even'],
      answer: 0,
      explain: 'Every barrel gets a distinct 10-bit pattern of tasters, all tasting happens on day 1, and the results are read on day 30.',
    },
    {
      kind: 'choice',
      body: 'Could the king do it with only **8** tasters?',
      options: ['Yes, the same way', 'No: 8 tasters give only $2^8 = 256$ distinct death patterns in one round, fewer than 1000 barrels — and there is no time for a second round', 'Yes, by testing half the barrels first'],
      answer: 1,
      explain: 'One round distinguishes at most $2^k$ barrels with $k$ tasters. $\\lceil\\log_2 1000\\rceil = 10$ is the minimum.',
    },
  ],
};

export const ch5Lessons = [heaps, avl, wine];
