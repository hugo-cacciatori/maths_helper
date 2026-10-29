import type { Lesson } from '../../lib/types';
import { BalanceScale, MaxSubarray, TournamentViz } from '../../widgets/puzzles';

const tournamentLesson: Lesson = {
  id: 'c8l1',
  title: 'Finding the runner-up',
  summary: 'You found the second largest element with n + ⌈log₂ n⌉ − 2 comparisons using a tournament.',
  steps: [
    {
      kind: 'choice',
      title: 'The naive way',
      body: 'A simple algorithm for the second largest of $n$ distinct values: find the maximum ($n - 1$ comparisons), remove it, and find the maximum of the rest. How many comparisons in total?',
      options: ['$n - 1$', '$2n - 3$', '$n \\log_2 n$', '$n^2/2$'],
      answer: 1,
      explain: '$(n-1) + (n-2) = 2n - 3$. Can we reuse what the first search learnt?',
    },
    {
      kind: 'task',
      title: 'Organise a tournament',
      body: 'Knock-out tournament on **[3, 1, 2, 5, 6, 8, 9, 4]**: in each round, neighbours play and the larger value goes through. Step through the rounds, then the playoff.',
      widget: ({ onSolved }) => <TournamentViz values={[3, 1, 2, 5, 6, 8, 9, 4]} onSolved={onSolved} />,
      success: 'The second best must have lost **directly** to the champion — every other player lost to someone who is not the best.',
    },
    {
      kind: 'number',
      body: 'How many matches are played in a knock-out tournament with $n$ players (here $n = 8$)?',
      answer: 7,
      explain: 'Every match eliminates exactly one player and all but one are eliminated: $n - 1$ matches.',
    },
    {
      kind: 'choice',
      body: 'How many rounds for $n$ players (with $n = 2^k$)?',
      options: ['$n/2$', '$\\log_2 n$', '$\\sqrt n$', '$n - 1$'],
      answer: 1,
      explain: 'Each round halves the number of players: $\\log_2 n$ rounds (3 for 8 players). So the champion played $\\log_2 n$ matches, and that is how many candidates there are for second place.',
    },
    {
      kind: 'choice',
      body: 'Total cost of the tournament method for the second largest?',
      options: ['$n - 1$', '$n + \\lceil\\log_2 n\\rceil - 2$', '$2n - 3$', '$\\frac{3n}{2}$'],
      answer: 1,
      explain: '$n - 1$ matches for the tournament, then $\\lceil\\log_2 n\\rceil - 1$ comparisons among the champion’s victims: $7 + 2 = 9$ here, against 13 for the naive method. This is in fact optimal.',
    },
  ],
};

const kadane: Lesson = {
  id: 'c8l2',
  title: 'Best streak in a list',
  summary: 'You went from a Θ(n²) the direct method to a single Θ(n) pass for the maximum-sum subarray.',
  steps: [
    {
      kind: 'read',
      title: 'The problem',
      body: `Given integers $A_1, \\dots, A_n$ (positive or negative), find the largest value of $\\sum_{k=i}^{j} A_k$ over all $i \\le j$ (an empty sum counts as 0).

The direct method tries all $\\frac{n(n+1)}{2}$ pairs $(i, j)$ — $\\Theta(n^2)$ even when sums are updated incrementally, $\\Theta(n^3)$ if each is recomputed.`,
    },
    {
      kind: 'task',
      title: 'One pass',
      body: 'Key idea: if the running sum of the current run becomes **negative**, it can only lower whatever comes next — so drop it (reset to 0) and start a new run. Step through.',
      widget: ({ onSolved }) => <MaxSubarray A={[2, -3, 4, -1, -2, 1, 5, -3]} onSolved={onSolved} />,
      success: 'The dashed box is the best run found so far.',
    },
    {
      kind: 'number',
      body: 'What is the maximum subarray sum of **2, −3, 4, −1, −2, 1, 5, −3**?',
      answer: 7,
      explain: '$4 - 1 - 2 + 1 + 5 = 7$.',
    },
    {
      kind: 'choice',
      body: 'What is the complexity of this one-pass algorithm (Kadane’s)?',
      options: ['$\\Theta(\\log n)$', '$\\Theta(n)$', '$\\Theta(n \\log n)$', '$\\Theta(n^2)$'],
      answer: 1,
      explain: 'Constant work per element. (A splitting solution — best in the left half, in the right half, or crossing the middle — gives $\\Theta(n\\log n)$.)',
    },
  ],
};

const coins: Lesson = {
  id: 'c8l3',
  title: 'Spot the fake',
  summary: 'You used weighings as comparisons and found the fakes with the minimum number of them.',
  steps: [
    {
      kind: 'number',
      title: 'Ten piles, one weighing',
      body: `You have **10 piles** of coins. One pile is entirely fake: fakes weigh **11 g**, genuine coins **10 g**. A scale gives the exact weight.

Take **1** coin from pile 1, **2** from pile 2, …, **10** from pile 10, and weigh them all together, **once**. The scale shows **553 g**. Which pile is fake?`,
      answer: 3,
      hint: 'If every coin were genuine, how much would $1 + 2 + \\dots + 10$ coins weigh?',
      explain: '55 genuine coins would weigh 550 g. Each fake coin adds 1 g, and pile $i$ contributed $i$ coins: $553 - 550 = 3$ → pile 3. One weighing, instead of up to $n - 1$ with the direct method.',
    },
    {
      kind: 'task',
      title: 'Eight coins, two weighings',
      body: 'One of these 8 coins is **lighter**. Using a two-pan balance (no weights), find it in **at most 2 weighings**. A new fake is chosen each game.',
      widget: ({ onSolved }) => <BalanceScale coins={8} maxWeighings={2} onSolved={onSolved} />,
      hint: 'Don’t split 4 vs 4. Each weighing has **three** outcomes: left lighter, right lighter, balanced.',
      success: 'Weigh 3 vs 3. If balanced, the fake is among the 2 left out: weigh them against each other. Otherwise, take the lighter three and weigh 1 vs 1.',
    },
    {
      kind: 'number',
      body: 'With 3 outcomes per weighing, $k$ weighings can distinguish at most $3^k$ cases. What is the minimum number of weighings for **27** coins (one lighter)?',
      answer: 3,
      explain: '$3^3 = 27$: split into three groups of 9 each time. In general $\\lceil\\log_3 n\\rceil$ — each weighing divides the suspects by 3.',
    },
    {
      kind: 'choice',
      body: 'Among $n > 2$ coins one is fake, but you don’t know if it is lighter or heavier. You only want to know **which**. A constant number of weighings is enough. What is a good first step?',
      options: [
        'Weigh one coin against each of the others',
        'Split into piles $A, B$ of equal size $\\lfloor n/3 \\rfloor$ and compare $A$ with $B$; then compare one of them with a third pile of the same size (or with known-genuine coins)',
        'It cannot be done in $\\Theta(1)$',
      ],
      answer: 1,
      explain: 'If $A = B$ the fake is elsewhere and both are genuine: weigh $A$ against the same number of remaining coins — the direction tells light/heavy. If $A < B$, compare $A$ with a third pile: equal means $B$ is heavy (fake is heavy), unequal means $A$ is light. At most 3 weighings whatever $n$ (with some care when $n$ is not a multiple of 3).',
    },
  ],
};

export const ch8Lessons = [tournamentLesson, kadane, coins];
