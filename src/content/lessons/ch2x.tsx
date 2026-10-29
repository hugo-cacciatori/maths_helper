import type { Lesson } from '../../lib/types';
import { HornerSteps, PolyCost } from '../../widgets/cost-extra';
import { CliqueSearch, ExplosionTable, PartitionSearch } from '../../widgets/search-extra';

const polynomial: Lesson = {
  id: 'c2l5',
  title: 'Evaluating a polynomial',
  summary: 'You went from Θ(n²) to Θ(n) multiplications for a polynomial — and saw why linear is the best possible.',
  steps: [
    {
      kind: 'read',
      title: 'Straight from the formula',
      body: `To evaluate $p(x) = a_n x^n + a_{n-1}x^{n-1} + \\dots + a_1 x + a_0$ at a point $x_0$, the direct way computes each power $x_0^i$ from scratch ($i - 1$ multiplications), multiplies by $a_i$, and adds everything up. Compare it with two smarter ideas as the degree grows.`,
      widget: () => <PolyCost />,
    },
    {
      kind: 'choice',
      body: 'How many multiplications does the direct method use for degree $n$?',
      options: ['$n$', '$2n - 1$', '$\\dfrac{n(n+1)}{2}$, so $\\Theta(n^2)$', '$2^n$'],
      answer: 2,
      explain: 'Term $i$ costs $i$ multiplications ($i - 1$ for the power, 1 for the coefficient): $1 + 2 + \\dots + n = \\frac{n(n+1)}{2}$.',
    },
    {
      kind: 'choice',
      body: 'Keeping the previous power ($x^i = x^{i-1}\\cdot x$) gives a linear algorithm. How many multiplications?',
      options: ['$n$', '$2n - 1$', '$n^2$', '$\\log_2 n$'],
      answer: 1,
      explain: '$n - 1$ multiplications to build $x^2, \\dots, x^n$, plus $n$ to multiply by the coefficients.',
    },
    {
      kind: 'task',
      title: 'The nested form',
      body: `Rewrite the polynomial inside-out: $2x^3 - 6x^2 + 2x - 1 = ((2x - 6)x + 2)x - 1$. Evaluating from the inside needs **one multiplication per coefficient**. Step through it at $x = 3$.`,
      widget: ({ onSolved }) => <HornerSteps onSolved={onSolved} />,
      success: '$p(3) = 5$ with 3 multiplications and 3 additions.',
    },
    {
      kind: 'choice',
      body: 'Could some algorithm do better than linear time for a general polynomial?',
      options: ['Yes, $\\Theta(\\log n)$ with halving', 'No: any correct algorithm must at least read all $n + 1$ coefficients, so $\\Omega(n)$', 'Yes, $\\Theta(1)$ with a formula'],
      answer: 1,
      explain: 'Changing any single coefficient changes the result, so every one must be looked at. The nested form is optimal.',
    },
  ],
};

const subsets: Lesson = {
  id: 'c2l6',
  title: 'Search every subset',
  summary: 'You searched through all subsets and all orders — and saw how quickly 2ⁿ and n! become hopeless.',
  steps: [
    {
      kind: 'read',
      title: 'An equal split',
      body: 'Given some positive integers, can they be split into two groups with the **same sum**? Systematic search: try every subset as group A (group B is the rest) and check its sum. Here the total is 12, so A must sum to 6.',
    },
    {
      kind: 'task',
      body: 'Run the search over all subsets of **3, 1, 4, 2, 2**. Then tick “keep the first value in A” and run again.',
      widget: ({ onSolved }) => <PartitionSearch onSolved={onSolved} />,
      success: 'Every split is found twice without the trick (A and B swapped); fixing one value halves the work.',
    },
    {
      kind: 'number',
      body: 'How many subsets does the plain search try for $n = 5$ values?',
      answer: 32,
      explain: '$2^5 = 32$: each value is either in A or not. Keeping the first value in A gives $2^{n-1} = 16$. (And if the total is odd, no search is needed at all.)',
    },
    {
      kind: 'task',
      title: 'Groups where everybody is connected',
      body: 'A **clique** of size $k$ is a group of $k$ vertices that are all pairwise connected. Try every group of 4 vertices and check every pair inside it.',
      widget: ({ onSolved }) => <CliqueSearch onSolved={onSolved} />,
      success: 'The only 4-clique is {b, c, d, f}.',
    },
    {
      kind: 'choice',
      body: 'For a graph with $n$ vertices, how many pair checks does this search make in the worst case?',
      options: ['$k^2$', '$\\binom{n}{k} \\cdot \\dfrac{k(k-1)}{2}$', '$n^k$', '$2^n$'],
      answer: 1,
      explain: 'There are $\\binom{n}{k}$ groups of size $k$ and each has $\\frac{k(k-1)}{2}$ pairs: $\\binom{6}{4}\\cdot 6 = 90$ here.',
    },
    {
      kind: 'read',
      title: 'Sorting by trying every order',
      body: 'The same idea applied to sorting: try every ordering of the array until one is sorted. There are $n!$ orderings, and checking one costs $n - 1$ comparisons. Look how fast these numbers explode.',
      widget: () => <ExplosionTable />,
    },
    {
      kind: 'choice',
      body: 'What is the worst-case cost of sorting by trying every order?',
      options: ['$\\Theta(n \\log n)$', '$\\Theta(n^2)$', '$\\Theta(2^n)$', '$\\Theta(n \\cdot n!)$'],
      answer: 3,
      explain: 'Up to $n!$ orderings, each checked with $n - 1$ comparisons. At 20 elements that is already decades of computing.',
    },
  ],
};

export const ch2xLessons = [polynomial, subsets];
