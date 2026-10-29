import type { Lesson } from '../../lib/types';
import { BinarySearch, BsDecisionTree, JosephusCircle, JosephusTable, NimGame } from '../../widgets/shrink';

const binsearch: Lesson = {
  id: 'c3l1',
  title: 'Halving a sorted list',
  summary: 'You can trace binary search, count its comparisons and see why it is logarithmic.',
  steps: [
    {
      kind: 'read',
      title: 'Halve the search',
      body: `A powerful idea: solve a problem by reducing it to a *smaller instance of itself*. Binary search is the classic: in a **sorted** array, compare the key with the middle element and throw away the half that cannot contain it.

Pick a value and step through the search on this sorted array.`,
      widget: () => <BinarySearch />,
    },
    {
      kind: 'number',
      body: 'What is the **maximum** number of comparisons binary search makes on this 13-element array? Try different keys (including 60, which is absent).',
      widget: () => <BinarySearch />,
      answer: 4,
      hint: 'Tick “show costs” to see the cost of every element.',
      explain: 'Each comparison halves the interval: $13 \\to 6 \\to 3 \\to 1$. At most $\\lfloor\\log_2 13\\rfloor + 1 = 4$ comparisons.',
    },
    {
      kind: 'read',
      title: 'The decision tree',
      body: 'Every possible run of binary search is a path in this tree. The root is the first middle element; the depth of a node is the number of comparisons needed to find it.',
      widget: () => <BsDecisionTree />,
    },
    {
      kind: 'sequence',
      body: 'Which values require the **maximum** number of comparisons? Tap them in increasing order.',
      tokens: ['3', '14', '27', '31', '39', '42', '55', '70', '74', '81', '85', '93', '98'],
      keepOrder: true,
      answer: ['14', '31', '42', '74', '85', '98'],
      explain: 'The six leaves at depth 4 of the decision tree: 14, 31, 42, 74, 85 and 98.',
    },
    {
      kind: 'number',
      body: 'Assuming every element is searched with the same probability, what is the **average** number of comparisons of a successful search? (2 decimals)',
      answer: 41 / 13,
      tolerance: 0.006,
      hint: 'Depth 1: one element, depth 2: two, depth 3: four, depth 4: six.',
      explain: '$\\dfrac{1\\cdot1 + 2\\cdot2 + 3\\cdot4 + 4\\cdot6}{13} = \\dfrac{41}{13} \\approx 3.15$.',
    },
    {
      kind: 'choice',
      body: 'On a sorted array of **1 000 000** elements, roughly how many times faster is a successful binary search than a sequential search, on average?',
      options: ['About 2 times', 'About 1 000 times', 'About 25 000 times', 'About 1 000 000 times'],
      answer: 2,
      explain: 'Sequential search: about $n/2 = 500\\,000$ comparisons on average. Binary search: about $\\log_2 10^6 \\approx 20$. Ratio $\\approx 25\\,000$.',
    },
  ],
};

const josephusLesson: Lesson = {
  id: 'c3l2',
  title: 'Last one standing',
  summary: 'You found the survivor’s position with a halving recurrence — and its binary trick.',
  steps: [
    {
      kind: 'read',
      title: 'Who survives?',
      body: `$n$ people numbered $1$ to $n$ stand in a circle. Starting from person 1, **every second person** is eliminated until one survivor remains. We call the survivor's number $J(n)$.

For example, with $n = 6$, persons 2, 4, 6 go in the first round, then 3 and 1 — so $J(6) = 5$. Watch it happen.`,
      widget: () => <JosephusCircle initialN={6} />,
    },
    {
      kind: 'number',
      body: 'Use the circle to find $J(7)$.',
      widget: () => <JosephusCircle initialN={7} />,
      answer: 7,
      explain: 'Round 1 eliminates 2, 4, 6 and then 1 (the count wraps around). Round 2 eliminates 5 and 3. Person 7 survives.',
    },
    {
      kind: 'read',
      title: 'Find the pattern',
      body: `Here are the first values. After the first round on an **even** circle $n = 2k$, half the people are gone and we restart from person 1 with $k$ people, every number doubled minus one:

$$J(2k) = 2J(k) - 1 \\qquad J(2k+1) = 2J(k) + 1$$

Each round halves the circle. Look at the powers of two (in blue).`,
      widget: () => <JosephusTable />,
    },
    {
      kind: 'choice',
      body: 'What is $J(n)$ when $n$ is a power of two, $n = 2^m$?',
      options: ['$1$', '$n$', '$n/2$', '$n - 1$'],
      answer: 0,
      explain: '$J(2k) = 2J(k) - 1$ and $J(1) = 1$ give $J(2^m) = 1$: with a power of two, every round removes exactly half and person 1 always starts again.',
    },
    {
      kind: 'number',
      body: 'Write $n = 2^m + L$ with $0 \\le L < 2^m$. After $L$ eliminations, $2^m$ people remain and the count restarts at person $2L + 1$, who therefore survives. Compute $J(40)$ — the original story had 40 soldiers!',
      answer: 17,
      hint: '$40 = 32 + 8$.',
      explain: '$40 = 2^5 + 8$, so $J(40) = 2\\cdot 8 + 1 = 17$. Bonus: in binary, $J(n)$ is $n$ with its leading 1 moved to the end: $101000_2 \\to 010001_2 = 17$.',
    },
    {
      kind: 'task',
      body: 'Check it on the circle: set $n = 40$ and press **Play**.',
      widget: ({ onSolved }) => <JosephusCircle initialN={40} onSolved={onSolved} />,
      success: 'Person 17 survives, as predicted.',
    },
  ],
};

const nim: Lesson = {
  id: 'c3l3',
  title: 'Last token loses',
  summary: 'You analysed a game backwards, from small positions to large ones, to find a winning strategy.',
  steps: [
    {
      kind: 'read',
      title: 'Take the last one and lose',
      body: 'One pile of $n$ tokens. Two players take turns removing between $1$ and $m$ tokens. In this *misère* version, **the player who takes the last token loses**. Here $m = 3$. Play a few games against the computer — it plays perfectly.',
      widget: () => <NimGame start={14} m={3} />,
    },
    {
      kind: 'choice',
      title: 'Think small',
      body: 'Call a position **losing** if the player about to move loses against perfect play. With $m = 3$, which of these positions is losing?',
      options: ['1 token', '2 tokens', '3 tokens', '4 tokens'],
      answer: 0,
      explain: 'With 1 token you must take it — and lose. From 2, 3 or 4 you take enough to leave exactly 1 to your opponent: those are winning.',
    },
    {
      kind: 'choice',
      body: 'From 5 tokens, every move (take 1, 2 or 3) leaves 4, 3 or 2 — all winning for the opponent. So 5 is losing. Continue the reasoning: which positions are losing for $m = 3$?',
      options: ['1, 4, 7, 10, 13', '1, 5, 9, 13', '2, 6, 10, 14', 'Every odd number'],
      answer: 1,
      explain: 'Losing positions are spaced $m + 1 = 4$ apart: $n \\equiv 1 \\pmod{m+1}$. From any other position you can move to one of them.',
    },
    {
      kind: 'task',
      body: 'Now beat the computer from 14 tokens. Tip: always leave it a losing position. Use the position map if you need it.',
      widget: ({ onSolved }) => <NimGame start={14} m={3} onSolved={onSolved} />,
      success: 'Strategy: take $(n - 1) \\bmod (m+1)$ tokens. If that is 0, you are in a losing position — take 1 and hope your opponent makes a mistake!',
    },
    {
      kind: 'number',
      body: 'In general, with $n = 100$ tokens and $m = 5$, how many tokens should the first player take to win?',
      answer: 3,
      explain: '$(100 - 1) \\bmod 6 = 99 \\bmod 6 = 3$. Taking 3 leaves 97, and $97 \\equiv 1 \\pmod 6$ — a losing position for the opponent.',
    },
  ],
};

export const ch3Lessons = [binsearch, josephusLesson, nim];
