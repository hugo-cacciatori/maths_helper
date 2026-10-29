import type { Lesson, QuestionStep } from '../../lib/types';
import { CallChain, CelebrityFinder, GrillSim, type ChainSpec } from '../../widgets/cost-extra';
import { CodeBlock } from '../../widgets/kit';

export const cubesSpec: ChainSpec = {
  label: (k) => `S(${k})`,
  base: 1,
  baseValue: 1,
  combine: (k, sub) => ({ value: sub + k ** 3, ops: 2, note: `S(${k}) = S(${k - 1}) + ${k}×${k}×${k} = ${sub} + ${k ** 3} = ${sub + k ** 3} (2 multiplications).` }),
};

export const MIN_DATA = [7, 3, 9, 4, 1, 8, 6];
export const minSpec: ChainSpec = {
  label: (k) => `Low(${k})`,
  base: 1,
  baseValue: MIN_DATA[0],
  combine: (k, sub) => ({
    value: Math.min(sub, MIN_DATA[k - 1]),
    ops: 1,
    note: `Low(${k}) compares Low(${k - 1}) = ${sub} with the next value ${MIN_DATA[k - 1]} → ${Math.min(sub, MIN_DATA[k - 1])}.`,
  }),
};

export const cubeMultsQ = (n: number): QuestionStep => ({
  kind: 'number',
  body: `Unroll it: how many multiplications does $S(${n})$ make?`,
  answer: 2 * (n - 1),
  explain: `$M(n) = 2(n - 1)$, so $M(${n}) = ${2 * (n - 1)}$.`,
});

const recursionCount: Lesson = {
  id: 'c1l7',
  title: 'Counting inside recursion',
  summary: 'You can count the work of a function that calls itself once, by turning it into a recurrence.',
  steps: [
    {
      kind: 'read',
      title: 'A stack of waiting calls',
      body: `This function adds up the first $n$ cubes, $1^3 + 2^3 + \\dots + n^3$, by calling itself on $n - 1$. Each call has to **wait** for the smaller one to return before it can finish. Step through the call stack.`,
      widget: () => (
        <div className="space-y-4">
          <CodeBlock title="S(n)" lines={['if n = 1 return 1', 'else return S(n − 1) + n × n × n']} />
          <CallChain spec={cubesSpec} opName="multiplications" />
        </div>
      ),
    },
    {
      kind: 'choice',
      body: 'Let $M(n)$ be the number of multiplications made by $S(n)$. Which recurrence describes it?',
      options: ['$M(n) = M(n-1) + 1,\\ M(1) = 0$', '$M(n) = M(n-1) + 2,\\ M(1) = 0$', '$M(n) = 2M(n-1),\\ M(1) = 1$', '$M(n) = M(n-1) + n,\\ M(1) = 0$'],
      answer: 1,
      explain: '`n × n × n` is two multiplications, plus whatever the smaller call does. The base case multiplies nothing.',
    },
    { kind: 'generated', make: (r) => cubeMultsQ(r.int(5, 40)) },
    {
      kind: 'choice',
      body: 'A simple loop `for i ← 1 to n: s ← s + i × i × i` computes the same sum. How do the two compare?',
      options: [
        'The loop is in a better complexity class',
        'Same number of multiplications, $\\Theta(n)$ — but the recursive version also pays for $n$ calls and keeps $n$ calls waiting in memory',
        'The recursive version is faster',
      ],
      answer: 1,
      explain: 'Both do $2(n-1)$ or $2n$ multiplications. Recursion adds call overhead and $\\Theta(n)$ stack space. (And a closed formula, $\\left(\\frac{n(n+1)}{2}\\right)^2$, needs no loop at all.)',
    },
    {
      kind: 'task',
      title: 'The smallest so far',
      body: 'Another one: `Low(k)` returns the smallest of the first $k$ values by comparing `Low(k − 1)` with the $k$-th value. Run it on **7, 3, 9, 4, 1, 8, 6** all the way.',
      widget: ({ onSolved }) => <CallChain spec={minSpec} initialN={7} maxN={7} opName="comparisons" onSolved={onSolved} />,
      success: 'It returns the minimum, 1.',
    },
    {
      kind: 'number',
      body: 'Choosing the comparison as the basic operation, $C(k) = C(k-1) + 1$ with $C(1) = 0$. How many comparisons for $k = 7$ values?',
      answer: 6,
      explain: '$C(k) = k - 1$: exactly as many as the simple scan — every value except the first is compared once.',
    },
  ],
};

const celebrity: Lesson = {
  id: 'c1l8',
  title: 'Who knows whom?',
  summary: 'You found a celebrity with about 3n questions by eliminating one person per question.',
  steps: [
    {
      kind: 'read',
      title: 'The puzzle',
      body: `In a group of $n$ people, a **celebrity** is someone who **knows nobody** but is **known by everybody**. The only thing you may do is ask a person “do you know this other person?”. There may be no celebrity at all.

Asking every person about every other person costs $n(n-1)$ questions. Can we do much better?`,
    },
    {
      kind: 'choice',
      body: 'You ask A: “do you know B?”. What can you conclude **in every case**?',
      options: [
        'If yes, B is the celebrity',
        'If yes, A is not the celebrity; if no, B is not the celebrity',
        'Nothing until everyone has been asked',
        'If no, A is the celebrity',
      ],
      answer: 1,
      explain: 'A celebrity knows nobody, so a "yes" rules out A. A celebrity is known by everybody, so a "no" rules out B. Either way **one question eliminates one person**.',
    },
    {
      kind: 'task',
      body: 'Watch the elimination, then the verification of the last candidate. Then tick “group without a celebrity” and run it again.',
      widget: ({ onSolved }) => <CelebrityFinder onSolved={onSolved} />,
      success: 'Elimination leaves one candidate; verification confirms or rejects them.',
    },
    {
      kind: 'choice',
      body: 'At most how many questions does this method ask for $n$ people?',
      options: ['$n - 1$', '$2(n-1)$', '$3(n - 1)$', '$n(n-1)$'],
      answer: 2,
      explain: '$n - 1$ questions to eliminate everyone but one candidate, then at most $2(n-1)$ to check that the candidate knows nobody and is known by all: $3(n-1)$, linear instead of quadratic.',
    },
  ],
};

const grill: Lesson = {
  id: 'c1l9',
  title: 'Two at a time',
  summary: 'You set up and solved a recurrence for a cooking plan, and saw why its base case made it sub-optimal.',
  steps: [
    {
      kind: 'read',
      title: 'A small grill',
      body: `A grill holds **two** burgers at a time. Each burger must be cooked on **both sides**, one minute per side, however many are on the grill.

A natural recursive plan: if $n \\le 2$, cook them (both sides): 2 minutes. If $n > 2$, cook two burgers completely (2 minutes), then the other $n - 2$ with the same plan.`,
    },
    {
      kind: 'choice',
      body: 'Which recurrence gives the time $T(n)$ of this plan?',
      options: ['$T(n) = 2T(n/2)$', '$T(n) = T(n-2) + 2,\\ T(1) = T(2) = 2$', '$T(n) = T(n-1) + 1,\\ T(1) = 2$', '$T(n) = T(n-2) + 1$'],
      answer: 1,
      explain: 'Two minutes for one pair, then the same problem with two fewer burgers.',
    },
    {
      kind: 'number',
      body: 'How many minutes does this plan take for **3** burgers?',
      answer: 4,
      explain: '$T(3) = T(1) + 2 = 4$. In general $T(n) = n$ for even $n$ and $n + 1$ for odd $n$.',
    },
    {
      kind: 'task',
      body: 'Beat the plan: cook **3** burgers in **3** minutes. (There are 6 sides and the grill does 2 per minute…)',
      widget: ({ onSolved }) => <GrillSim initialN={3} onSolved={onSolved} />,
      hint: 'Don’t finish a burger before starting the third one: minute 1 = #1 and #2, minute 2 = #1 and #3…',
      success: 'Minute 1: #1 and #2. Minute 2: #1 (second side) and #3. Minute 3: #2 and #3 (second sides).',
    },
    {
      kind: 'choice',
      body: 'Why is the recursive plan not optimal for every $n$, and how can it be fixed?',
      options: [
        'It is optimal; 3 minutes is impossible',
        'For odd $n$ it ends with a single burger alone on the grill, wasting a slot for 2 minutes. Fix: add a base case $n = 3$ cooked in 3 minutes, so $T(n) = n$ for all $n \\ge 2$',
        'It should cook one burger at a time',
      ],
      answer: 1,
      explain: 'With $2n$ sides and 2 per minute, $n$ minutes is a lower bound for $n \\ge 2$. Base cases $T(2) = 2$ and $T(3) = 3$ reach it for every $n$.',
    },
  ],
};

export const ch1xLessons = [recursionCount, celebrity, grill];
