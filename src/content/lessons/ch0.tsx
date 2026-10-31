import { texNum } from '../../lib/random';
import type { Lesson, QuestionStep } from '../../lib/types';
import { ArrayScan, GaussPairs, GrowthTable, HalvingLadder, NeighbourPicker } from '../../widgets/basics';
import { DoublingBars, GrowthPlot, TraceRunner, type Program } from '../../widgets/cost';
import { CallChain, type ChainSpec } from '../../widgets/cost-extra';
import { ArrayRow, CodeBlock, GraphView, TreeView, type GEdge, type GNode, type TNode } from '../../widgets/kit';

/* ---------- small programs to trace ---------- */

export const sumProgram: Program = {
  name: 'Add 1 to n',
  lines: ['S ← 0', 'for i ← 1 to n do', '    S ← S + i', 'return S'],
  op: 2,
  *run(n) {
    let S = 0;
    let i: number | string = '–';
    yield [0, { i, S }];
    for (i = 1; i <= n; i++) {
      yield [1, { i, S }];
      S += i;
      yield [2, { i, S }];
    }
    yield [3, { i: '–', S }];
  },
};

export const stepTwoProgram: Program = {
  name: 'Jump by two',
  lines: ['i ← 1', 'while i ≤ n', '    i ← i + 2'],
  op: 2,
  *run(n) {
    let i = 1;
    yield [0, { i }];
    for (;;) {
      yield [1, { i }];
      if (!(i <= n)) break;
      i += 2;
      yield [2, { i }];
    }
  },
};

export const gridProgram: Program = {
  name: 'A loop inside a loop',
  lines: ['for i ← 1 to n do', '    for j ← 1 to n do', '        count ← count + 1'],
  op: 2,
  *run(n) {
    let count = 0;
    let j: number | string = '–';
    for (let i = 1; i <= n; i++) {
      yield [0, { i, j: '–', count }];
      for (j = 1; j <= n; j++) {
        yield [1, { i, j, count }];
        count++;
        yield [2, { i, j, count }];
      }
    }
  },
};

export const factSpec: ChainSpec = {
  label: (k) => `fact(${k})`,
  base: 1,
  baseValue: 1,
  combine: (k, sub) => ({ value: k * sub, ops: 1, note: `fact(${k}) = ${k} × fact(${k - 1}) = ${k} × ${sub} = ${k * sub} (1 multiplication).` }),
};

export const SCAN_VALUES = [4, 9, 2, 7, 11, 5, 8];

export const DOTS: { nodes: GNode[]; edges: GEdge[] } = {
  nodes: [
    { id: 'a', x: 50, y: 100 },
    { id: 'b', x: 140, y: 40 },
    { id: 'c', x: 140, y: 160 },
    { id: 'd', x: 230, y: 100 },
    { id: 'e', x: 320, y: 100 },
  ],
  edges: [
    { u: 'a', v: 'b' },
    { u: 'a', v: 'c' },
    { u: 'b', v: 'd' },
    { u: 'c', v: 'd' },
    { u: 'd', v: 'e' },
    { u: 'b', v: 'c' },
  ],
};

const ROADS: { nodes: GNode[]; edges: GEdge[] } = {
  nodes: [
    { id: 'p', x: 50, y: 100 },
    { id: 'q', x: 170, y: 40 },
    { id: 'r', x: 170, y: 160 },
    { id: 's', x: 300, y: 100 },
  ],
  edges: [
    { u: 'p', v: 'q', w: 4, directed: true },
    { u: 'p', v: 'r', w: 1, directed: true },
    { u: 'r', v: 'q', w: 2, directed: true },
    { u: 'q', v: 's', w: 3, directed: true },
    { u: 'r', v: 's', w: 7, directed: true },
  ],
};

const leaf = (id: string): TNode => ({ id, label: id });
export const FAMILY: TNode = {
  id: 'A',
  label: 'A',
  left: { id: 'B', label: 'B', left: leaf('D'), right: { id: 'E', label: 'E', left: leaf('G') } },
  right: { id: 'C', label: 'C', right: leaf('F') },
};

/* ---------- practice questions with fresh numbers ---------- */

export const forCountQ = (a: number, n: number): QuestionStep => ({
  kind: 'number',
  title: 'Practice',
  body: `How many times does the inside of \`for i ← ${a} to ${n} do\` run?`,
  answer: n - a + 1,
  hint: 'Count the values of $i$: from the first to the last, both included. That is last − first + 1.',
  explain: `$i$ takes the values $${a}, ${a + 1}, \\dots, ${n}$: that is $${n} - ${a} + 1 = ${n - a + 1}$ values.`,
});

export const powerQ = (k: number): QuestionStep => ({
  kind: 'number',
  title: 'Practice',
  body: `Compute $2^{${k}}$.`,
  answer: 2 ** k,
  hint: 'Start from 1 and double it, once per unit of the exponent.',
  explain: `$1 \\to 2 \\to 4 \\to \\dots$, doubling ${k} times: $2^{${k}} = ${texNum(2 ** k)}$.`,
});

export const logQ = (k: number): QuestionStep => ({
  kind: 'number',
  title: 'Practice',
  body: `Compute $\\log_2 ${texNum(2 ** k)}$.`,
  answer: k,
  hint: `How many times can you halve ${2 ** k} before you reach 1?`,
  explain: `$${texNum(2 ** k)} = 2^{${k}}$, so it takes ${k} halvings: $\\log_2 ${texNum(2 ** k)} = ${k}$.`,
});

export const gaussQ = (n: number): QuestionStep => ({
  kind: 'number',
  title: 'Practice',
  body: `Compute $1 + 2 + 3 + \\dots + ${n}$.`,
  answer: (n * (n + 1)) / 2,
  hint: 'Use the staircase picture: $\\dfrac{n(n+1)}{2}$.',
  explain: `$\\dfrac{${n} \\times ${n + 1}}{2} = ${texNum((n * (n + 1)) / 2)}$.`,
});

const mono = (c: number, p: number) => `${c === 1 ? '' : c}${p === 0 ? '' : p === 1 ? 'n' : `n^${p}`}` || '1';
const theta = (p: number) => `$\\Theta(${p === 0 ? '1' : p === 1 ? 'n' : `n^${p}`})$`;

export const dominantQ = (terms: [number, number][]): QuestionStep => {
  const top = Math.max(...terms.map(([, p]) => p));
  const options = [0, 1, 2, 3].map(theta);
  return {
    kind: 'choice',
    title: 'Practice',
    body: `A program makes $${terms.map(([c, p]) => mono(c, p)).join(' + ')}$ steps. What is its order of growth?`,
    options,
    answer: top,
    hint: 'Keep only the term with the biggest power of $n$, then drop its number in front.',
    explain: `For large $n$ the term with $n^{${top}}$ dwarfs the others, and the factor in front does not change how it grows: ${theta(top)}.`,
  };
};

export const unrollQ = (n: number): QuestionStep => ({
  kind: 'number',
  title: 'Practice',
  body: `$M(n) = M(n-1) + 1$ and $M(1) = 0$. What is $M(${n})$?`,
  answer: n - 1,
  hint: 'Each step down from $n$ to 1 adds 1. How many steps are there from 1 up to $n$?',
  explain: `Going from $M(1)$ up to $M(${n})$ adds 1 exactly ${n - 1} times: $M(${n}) = ${n - 1}$. In general $M(n) = n - 1$.`,
});

/* ---------- lessons ---------- */

const instructions: Lesson = {
  id: 'c0l1',
  title: 'Reading instructions line by line',
  summary: 'You can follow a short program by hand and count how many times a line runs.',
  warmup: true,
  steps: [
    {
      kind: 'read',
      title: 'Boxes with names',
      body: `An **algorithm** is a list of precise instructions, like a recipe. The lessons write them in a simple made-up language called **pseudo-code**, one instruction per line.

A **variable** is a box with a name that holds a number. The arrow \`←\` puts a value in a box: \`x ← 5\` reads "x gets 5". The old value is thrown away.

Lines run from top to bottom, one at a time.`,
      widget: () => <CodeBlock lines={['x ← 5', 'y ← x + 1', 'x ← x × 2']} title="After these lines: x = 10, y = 6" />,
    },
    {
      kind: 'number',
      body: 'Run these lines in your head. What is in `x` at the end?',
      widget: () => <CodeBlock lines={['x ← 3', 'y ← x + 4', 'x ← y × 2']} />,
      answer: 14,
      hint: 'After line 1, x = 3. Line 2 puts 3 + 4 in y. Line 3 uses y.',
      explain: '`x ← 3`, then `y ← 7`, then `x ← 7 × 2 = 14`. The first value of x is gone.',
    },
    {
      kind: 'read',
      title: 'Choosing with if',
      body: '`if` tests a condition. When it is true, the indented lines under it run; otherwise the lines under `else` run. Indentation (the shift to the right) shows which lines belong to what.',
      widget: () => <CodeBlock lines={['if a > 10', '    b ← 1', 'else', '    b ← 2']} />,
    },
    {
      kind: 'number',
      body: 'With `a ← 7` before the code above, what is in `b` at the end?',
      answer: 2,
      hint: 'Is 7 greater than 10?',
      explain: '$7 > 10$ is false, so the `else` line runs: b = 2.',
    },
    {
      kind: 'read',
      title: 'Repeating with for',
      body: `\`for i ← 1 to n do\` repeats the indented lines once for each value $i = 1, 2, 3, \\dots, n$. Each repetition is called an **iteration**.

Press **Step** to run the program one line at a time and watch the boxes $i$ and $S$. Then move the slider to change $n$.`,
      widget: () => <TraceRunner program={sumProgram} nRange={[1, 8]} initialN={4} inputName="n" opName="addition" />,
    },
    {
      kind: 'number',
      body: 'What does the program return for $n = 5$?',
      answer: 15,
      hint: 'It adds $i$ to $S$ for every $i$ from 1 to 5.',
      explain: '$S = 1 + 2 + 3 + 4 + 5 = 15$.',
    },
    {
      kind: 'number',
      body: 'For $n = 5$, how many times does the line `S ← S + i` run?',
      answer: 5,
      explain: 'Once per value of $i$: 5 times. For any $n$, it runs $n$ times.',
    },
    { kind: 'generated', make: (r) => forCountQ(r.int(2, 6), r.int(10, 40)) },
    {
      kind: 'read',
      title: 'Repeating with while',
      body: '`while condition` repeats its lines **as long as** the condition is true, testing it before each iteration. Nothing counts for you: the program changes its own counter. Here `i` jumps by 2.',
      widget: () => <TraceRunner program={stepTwoProgram} nRange={[1, 12]} initialN={7} inputName="n" opName="jump" />,
    },
    {
      kind: 'number',
      body: 'For $n = 9$, how many times does `i ← i + 2` run?',
      answer: 5,
      hint: '`i` takes the values 1, 3, 5, … The loop stops as soon as `i` is bigger than 9.',
      explain: 'It runs with $i = 1, 3, 5, 7, 9$ — 5 times — then $i = 11 > 9$ stops the loop. About $n/2$ times.',
    },
    {
      kind: 'read',
      title: 'A loop inside a loop',
      body: 'Loops can be **nested**: the inner loop runs completely, from start to end, for **each** iteration of the outer loop. Step through it with $n = 3$.',
      widget: () => <TraceRunner program={gridProgram} nRange={[1, 6]} initialN={3} inputName="n" opName="count" />,
    },
    {
      kind: 'number',
      body: 'For $n = 10$, how many times does `count ← count + 1` run?',
      answer: 100,
      hint: 'For each of the 10 values of $i$, the inner loop runs 10 times.',
      explain: '$10 \\times 10 = 100$. In general $n \\times n = n^2$.',
    },
    {
      kind: 'choice',
      title: 'Why count?',
      body: 'Algorithm analysis measures speed by counting how many times the busiest line runs, as a formula in $n$ (the size of the input). Why count lines instead of timing the program with a stopwatch?',
      options: [
        'Counting is more fun',
        'A count does not depend on the computer, so it compares algorithms fairly and predicts what happens for big $n$',
        'A stopwatch cannot measure programs',
      ],
      answer: 1,
      explain: 'A faster computer changes the seconds but not the count. The formula ($n$, $n^2$, …) tells you how the work grows when the input grows — the main question of this app.',
    },
  ],
};

const rows: Lesson = {
  id: 'c0l2',
  title: 'Rows of numbers',
  summary: 'You can read array notation and find the largest value with one pass.',
  warmup: true,
  steps: [
    {
      kind: 'read',
      title: 'Arrays',
      body: `An **array** is a row of boxes holding values. The boxes are numbered from **0**: this number is the **index**. $A[i]$ means "the value in box $i$ of array $A$".

An array of $n$ values is written $A[0..n-1]$: the first box is $A[0]$ and the **last is $A[n-1]$**, not $A[n]$.`,
      widget: () => <ArrayRow items={[7, 2, 9, 4, 6].map((v, i) => ({ id: i, label: v }))} showIndex />,
    },
    {
      kind: 'number',
      body: 'In the array above, what is $A[2]$?',
      answer: 9,
      hint: 'The small numbers above the boxes are the indexes. Start counting at 0.',
      explain: '$A[0] = 7$, $A[1] = 2$, $A[2] = 9$.',
    },
    {
      kind: 'number',
      body: 'An array holds $n = 12$ values. What is the index of the last one?',
      answer: 11,
      explain: 'Indexes run from 0 to $n - 1 = 11$.',
    },
    {
      kind: 'number',
      body: 'How many values are in the part $A[3..8]$ (boxes 3 to 8, both included)?',
      answer: 6,
      hint: 'Last − first + 1.',
      explain: '$8 - 3 + 1 = 6$ boxes: 3, 4, 5, 6, 7, 8. This "+1" comes back again and again.',
    },
    {
      kind: 'task',
      title: 'Find the largest',
      body: 'To find the largest value, walk along the array once and keep the **best so far**. Step through it to the end.',
      widget: ({ onSolved }) => <ArrayScan values={SCAN_VALUES} onSolved={onSolved} />,
      success: 'One pass, comparing each new value with the best so far: $n - 1$ comparisons for $n$ values.',
    },
    {
      kind: 'generated',
      make: (r) => {
        const n = r.int(8, 60);
        return {
          kind: 'number',
          title: 'Practice',
          body: `How many comparisons does that pass make on an array of $n = ${n}$ values?`,
          answer: n - 1,
          hint: 'The first value is the starting best; every other value is compared once.',
          explain: `Every value except the first is compared once: $n - 1 = ${n - 1}$.`,
        };
      },
    },
    {
      kind: 'choice',
      body: 'Could a cleverer method find the largest of $n$ values with fewer than $n - 1$ comparisons?',
      options: [
        'Yes, by comparing the first and last values only',
        'No: every value except the largest must lose at least one comparison, and one comparison has only one loser',
        'Yes, with $n/2$ comparisons',
      ],
      answer: 1,
      explain: 'If some value never lost a comparison, it could still be the largest. $n - 1$ values must each lose once, so at least $n - 1$ comparisons are needed. This kind of "at least" argument is called a **lower bound**.',
    },
    {
      kind: 'choice',
      title: 'Sorted arrays',
      body: 'An array is **sorted** when its values go up from left to right. Which one is sorted?',
      options: ['3 8 5 9 12', '2 4 4 7 10', '10 7 4 2 1', '1 3 2 4 5'],
      answer: 1,
      explain: '2 ≤ 4 ≤ 4 ≤ 7 ≤ 10: equal neighbours are allowed. (10 7 4 2 1 is sorted in decreasing order.) Many lessons sort first, because a sorted array is much faster to search.',
    },
  ],
};

const powers: Lesson = {
  id: 'c0l3',
  title: 'Doubling and halving',
  summary: 'You can compute powers of two and logarithms, and round up or down.',
  warmup: true,
  steps: [
    {
      kind: 'read',
      title: 'Powers',
      body: `$2^k$ ("2 to the power $k$") is 2 multiplied by itself $k$ times: $2^3 = 2 \\times 2 \\times 2 = 8$. By convention $2^0 = 1$. Each extra unit of $k$ **doubles** the value:

$$1,\\ 2,\\ 4,\\ 8,\\ 16,\\ 32,\\ 64,\\ 128,\\ 256,\\ 512,\\ 1024$$

Likewise $n^2 = n \\times n$ ("n squared") and $n^3 = n \\times n \\times n$ ("n cubed").`,
    },
    { kind: 'generated', make: (r) => powerQ(r.int(4, 12)) },
    {
      kind: 'number',
      body: 'Compute $5^2 + 2^5$.',
      answer: 57,
      hint: 'They are different: $5^2 = 5 \\times 5$ and $2^5 = 2 \\times 2 \\times 2 \\times 2 \\times 2$.',
      explain: '$25 + 32 = 57$. Swapping base and exponent changes everything.',
    },
    {
      kind: 'read',
      title: 'Logarithms: counting halvings',
      body: `The **logarithm** $\\log_2 n$ answers the question: *how many times can I halve $n$ before reaching 1?* It undoes the power: $\\log_2 2^k = k$, so $\\log_2 8 = 3$ and $\\log_2 1024 = 10$.

When $n$ is not a power of two, $\\log_2 n$ is not a whole number. Move the slider: the halvings (dropping any ½) give the whole part.`,
      widget: () => <HalvingLadder />,
    },
    { kind: 'generated', make: (r) => logQ(r.int(3, 12)) },
    {
      kind: 'number',
      body: 'Halving and dropping any ½, how many halvings take 100 down to 1?',
      answer: 6,
      hint: 'Use the slider, or do it: 100 → 50 → 25 → …',
      explain: '100 → 50 → 25 → 12 → 6 → 3 → 1: six halvings. Indeed $2^6 = 64 \\le 100 < 128 = 2^7$, so $\\log_2 100 \\approx 6.64$.',
    },
    {
      kind: 'read',
      title: 'Rounding down and up',
      body: `$\\lfloor x \\rfloor$ ("floor of $x$") rounds **down** to a whole number; $\\lceil x \\rceil$ ("ceiling of $x$") rounds **up**.

$$\\lfloor 3.7 \\rfloor = 3 \\qquad \\lceil 3.2 \\rceil = 4 \\qquad \\lfloor 5 \\rfloor = \\lceil 5 \\rceil = 5$$

For instance, splitting 7 items in two gives halves of $\\lceil 7/2 \\rceil = 4$ and $\\lfloor 7/2 \\rfloor = 3$.`,
    },
    {
      kind: 'number',
      body: 'Compute $\\lceil \\log_2 100 \\rceil$.',
      answer: 7,
      hint: 'Find the first power of two that is at least 100.',
      explain: '$2^6 = 64 < 100 \\le 128 = 2^7$, so $\\log_2 100$ is between 6 and 7 and rounds up to 7.',
    },
    {
      kind: 'choice',
      body: 'If you double $n$, what happens to $\\log_2 n$?',
      options: ['It doubles', 'It goes up by 1', 'It stays the same', 'It is squared'],
      answer: 1,
      hint: 'Doubling $n$ gives exactly one more halving before reaching 1.',
      explain: '$\\log_2 (2n) = \\log_2 n + 1$. Even $n = 1\\,000\\,000$ has $\\log_2 n \\approx 20$: logarithms grow incredibly slowly — that is why "logarithmic" algorithms are so fast.',
    },
    {
      kind: 'read',
      title: 'Factorials',
      body: `$n!$ ("$n$ factorial") multiplies all whole numbers from 1 to $n$: $4! = 1 \\times 2 \\times 3 \\times 4 = 24$. It grows even faster than $2^n$:

$$5! = 120 \\qquad 10! = 3\\,628\\,800 \\qquad 20! \\approx 2.4 \\times 10^{18}$$`,
    },
    {
      kind: 'number',
      body: 'Compute $6!$.',
      answer: 720,
      hint: '$5! = 120$; multiply by 6.',
      explain: '$6! = 6 \\times 5! = 6 \\times 120 = 720$.',
    },
  ],
};

const sums: Lesson = {
  id: 'c0l4',
  title: 'Adding many numbers at once',
  summary: 'You can read Σ notation and add up 1 + 2 + … + n and 1 + 2 + 4 + … in one go.',
  warmup: true,
  steps: [
    {
      kind: 'read',
      title: 'The Σ sign',
      body: `Loops add up work, so analysis is full of long sums. The Greek letter **Σ** (capital sigma) is short for "add up":

$$\\sum_{i=1}^{5} i = 1 + 2 + 3 + 4 + 5$$

Read it as: "for $i$ going from 1 (below) to 5 (above), add up $i$". The expression after Σ can be anything: $\\sum_{i=1}^{3} i^2 = 1 + 4 + 9$.`,
    },
    {
      kind: 'number',
      body: 'Compute $\\displaystyle\\sum_{i=1}^{4} i^2$.',
      answer: 30,
      hint: 'Write the four terms: $1^2 + 2^2 + 3^2 + 4^2$.',
      explain: '$1 + 4 + 9 + 16 = 30$.',
    },
    {
      kind: 'number',
      body: 'How many terms does $\\displaystyle\\sum_{i=3}^{10} i$ have?',
      answer: 8,
      hint: 'Last − first + 1, as with array parts.',
      explain: '$i = 3, 4, \\dots, 10$: $10 - 3 + 1 = 8$ terms.',
    },
    {
      kind: 'choice',
      body: 'What is $\\displaystyle\\sum_{i=1}^{n} 3$? (The thing added does not depend on $i$.)',
      options: ['$3$', '$3n$', '$n + 3$', '$3^n$'],
      answer: 1,
      explain: 'It adds 3, $n$ times: $3 + 3 + \\dots + 3 = 3n$. A loop that does 3 operations per iteration, $n$ times, costs $3n$.',
    },
    {
      kind: 'read',
      title: 'The staircase trick',
      body: 'To add $1 + 2 + \\dots + n$, put two copies of the staircase together, one upside down. They form a rectangle of $n$ columns, each $n + 1$ high:',
      widget: () => <GaussPairs />,
    },
    {
      kind: 'read',
      title: 'Remember this one',
      body: `$$1 + 2 + \\dots + n = \\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$$

It appears whenever an inner loop runs 1 time, then 2 times, then 3 times… For large $n$ it is about $n^2/2$.`,
    },
    { kind: 'generated', make: (r) => gaussQ(r.int(10, 200)) },
    {
      kind: 'choice',
      body: 'How many times does the innermost line run? The inner loop goes up to $i$, not $n$.',
      widget: () => <CodeBlock lines={['for i ← 1 to n do', '    for j ← 1 to i do', '        count ← count + 1']} />,
      options: ['$n$', '$n^2$', '$\\dfrac{n(n+1)}{2}$', '$2n$'],
      answer: 2,
      hint: 'For $i = 1$ the inner loop runs once, for $i = 2$ twice, …',
      explain: '$1 + 2 + \\dots + n = \\dfrac{n(n+1)}{2}$: about half of the $n \\times n$ square.',
    },
    {
      kind: 'read',
      title: 'Doubling sums',
      body: `A sum where every term doubles behaves very differently: each term is bigger than **all the previous ones together**. The bars fill the next power of two, minus the first term.

So $1 + 2 + 4 + \\dots + 2^k = 2^{k+1} - 1$: the total is less than twice the last term.`,
      widget: () => <DoublingBars />,
    },
    {
      kind: 'number',
      body: 'Compute $1 + 2 + 4 + 8 + 16 + 32 + 64$.',
      answer: 127,
      hint: 'The last term is $64 = 2^6$, so the total is $2^7 - 1$.',
      explain: '$2^7 - 1 = 128 - 1 = 127$.',
    },
  ],
};

const growth: Lesson = {
  id: 'c0l5',
  title: 'Fast, slow and hopeless',
  summary: 'You can rank costs like n, n², 2ⁿ, keep the biggest term and read Θ, O and Ω.',
  warmup: true,
  steps: [
    {
      kind: 'read',
      title: 'What the formulas mean in seconds',
      body: 'Suppose a computer does one billion simple steps per second. Here is how long algorithms of different costs take on an input of size $n$. Try every value of the slider.',
      widget: () => <GrowthTable />,
    },
    {
      kind: 'choice',
      body: 'For $n = 1\\,000\\,000$, which costs still finish within a second?',
      options: ['Only $\\log_2 n$', '$\\log_2 n$, $n$ and $n \\log_2 n$', 'All except $n!$', 'All of them'],
      answer: 1,
      explain: '$n^2 = 10^{12}$ steps already takes about 17 minutes, and $n^3$ thousands of years. $n \\log_2 n \\approx 2 \\times 10^7$ steps: 20 ms.',
    },
    {
      kind: 'choice',
      body: 'Which costs are hopeless already for $n = 100$?',
      options: ['$n^2$ and $n^3$', '$2^n$ and $n!$', 'Only $n!$', 'None of them'],
      answer: 1,
      explain: '$2^{100} \\approx 10^{30}$ steps: far longer than the age of the universe. Costs like $2^n$ and $n!$ appear when an algorithm tries every possibility.',
    },
    {
      kind: 'sequence',
      body: 'Order these costs from the **slowest-growing** to the **fastest-growing**.',
      tokens: ['log₂ n', 'n', 'n log₂ n', 'n²', '2ⁿ', 'n!'],
      answer: ['log₂ n', 'n', 'n log₂ n', 'n²', '2ⁿ', 'n!'],
      hint: 'Use the table for $n = 1000$.',
      explain: 'This ladder is worth learning by heart: $\\log n \\ll n \\ll n \\log n \\ll n^2 \\ll 2^n \\ll n!$.',
    },
    {
      kind: 'read',
      title: 'Only the biggest term matters',
      body: `A program making $3n^2 + 5n + 100$ steps: for small $n$ the 100 dominates, but soon $3n^2$ is almost everything. Move the slider to large $n$ and compare it with $3n^2$ alone.

We also ignore the **constant factor** (the 3): a computer twice as fast divides everything by 2 without changing how the cost **grows**. So we say this program is **of order $n^2$** and write $\\Theta(n^2)$ (read "theta of $n$ squared").`,
      widget: () => (
        <GrowthPlot
          fns={[
            { tex: '3n^2 + 5n + 100', f: (n) => 3 * n * n + 5 * n + 100 },
            { tex: '3n^2', f: (n) => 3 * n * n },
          ]}
          nMax={10}
          maxRange={[5, 200]}
        />
      ),
    },
    {
      kind: 'choice',
      body: 'What is the order of growth of $5n + 20$?',
      options: ['$\\Theta(1)$', '$\\Theta(n)$', '$\\Theta(5n)$', '$\\Theta(n^2)$'],
      answer: 1,
      explain: 'Keep $5n$, drop the 5: $\\Theta(n)$. Writing $\\Theta(5n)$ is not wrong but never done — constants are always dropped.',
    },
    {
      kind: 'generated',
      make: (r) => {
        const top = r.int(1, 3);
        const lower = r.int(0, top - 1);
        return dominantQ(r.shuffle<[number, number]>([[r.int(2, 9), top], [r.int(10, 500), lower]]));
      },
    },
    {
      kind: 'read',
      title: 'Θ, O and Ω in plain words',
      body: `Three symbols compare how two functions grow, ignoring constant factors and small $n$:

- $f \\in \\Theta(g)$: $f$ grows **like** $g$ ("theta").
- $f \\in O(g)$: $f$ grows **no faster** than $g$ ("big O") — $g$ is a ceiling.
- $f \\in \\Omega(g)$: $f$ grows **at least as fast** as $g$ ("big omega") — $g$ is a floor.

So $n \\in O(n^2)$ is true (a ceiling, just not a tight one), and $\\Theta$ means both $O$ and $\\Omega$ hold.`,
    },
    {
      kind: 'choice',
      body: 'Which statement is **true**?',
      options: ['$n^2 \\in O(n)$', '$n \\in \\Omega(n^2)$', '$n \\in O(n^2)$', '$n^2 \\in \\Theta(n)$'],
      answer: 2,
      explain: '$n$ grows no faster than $n^2$, so $n \\in O(n^2)$. The others claim that $n^2$ grows no faster than $n$, in one form or another.',
    },
    {
      kind: 'choice',
      title: 'The doubling test',
      body: 'You can guess the order by doubling $n$: for $\\Theta(n)$ the time doubles, for $\\Theta(n^2)$ it is multiplied by $2^2 = 4$. A program takes **8 times longer** when $n$ doubles. What is its order?',
      options: ['$\\Theta(n)$', '$\\Theta(n^2)$', '$\\Theta(n^3)$', '$\\Theta(2^n)$'],
      answer: 2,
      hint: '$(2n)^3 = 2^3 \\times n^3$.',
      explain: '$8 = 2^3$, so $\\Theta(n^3)$. The next chapter uses this test on real loops.',
    },
  ],
};

const recursion: Lesson = {
  id: 'c0l6',
  title: 'Functions that call themselves',
  summary: 'You can follow a recursive function, write its cost as a recurrence and unroll it.',
  warmup: true,
  steps: [
    {
      kind: 'read',
      title: 'A function that uses itself',
      body: `A **function** is a named piece of code that takes an input and returns a result. A **recursive** function calls itself on a smaller input.

$n! = n \\times (n-1)!$, so to compute \`fact(5)\` you can compute \`fact(4)\` and multiply by 5. The **base case** \`fact(1) = 1\` stops the chain.`,
      widget: () => <CodeBlock lines={['fact(n):', '    if n = 1', '        return 1', '    return n × fact(n − 1)']} />,
    },
    {
      kind: 'task',
      body: 'Each call waits for the smaller call to return. Step through the **call stack** until `fact(5)` gets its answer.',
      widget: ({ onSolved }) => <CallChain spec={factSpec} initialN={5} maxN={8} opName="multiplications" onSolved={onSolved} />,
      success: 'The calls go down to the base case, then the answers come back up: $5! = 120$ with 4 multiplications.',
    },
    {
      kind: 'choice',
      body: 'What happens if the base case is missing?',
      options: [
        'The function returns 0',
        'It calls itself forever (in practice, until the computer runs out of memory for waiting calls)',
        'It computes $n!$ anyway',
      ],
      answer: 1,
      explain: 'Without a base case nothing ever stops the chain of calls. Every recursive function needs one.',
    },
    {
      kind: 'read',
      title: 'Writing the cost as a recurrence',
      body: `Let $M(n)$ be the number of multiplications made by \`fact(n)\`. The call makes **one** multiplication plus whatever \`fact(n − 1)\` makes:

$$M(n) = M(n-1) + 1, \\qquad M(1) = 0$$

An equation that defines a function using its own smaller values is a **recurrence**. To solve it, **unroll** it — replace $M(n-1)$ by its own definition, again and again:

$$M(n) = M(n-2) + 2 = M(n-3) + 3 = \\dots = M(1) + (n-1) = n - 1$$`,
    },
    { kind: 'generated', make: (r) => unrollQ(r.int(6, 50)) },
    {
      kind: 'choice',
      body: 'A recursive function does $n$ steps of work and then calls itself on $n - 1$: $T(n) = T(n-1) + n$, $T(1) = 1$. What is $T(n)$?',
      options: ['$n$', '$2n$', '$\\dfrac{n(n+1)}{2}$', '$2^n$'],
      answer: 2,
      hint: 'Unroll: $T(n) = n + (n-1) + (n-2) + \\dots$',
      explain: '$T(n) = n + (n-1) + \\dots + 2 + 1 = \\dfrac{n(n+1)}{2}$ — the staircase sum, so $\\Theta(n^2)$.',
    },
    {
      kind: 'read',
      title: 'Calling on half',
      body: `Some functions call themselves on **half** of the input. If each call does 1 step:

$$T(n) = T(n/2) + 1, \\qquad T(1) = 0$$

For $n = 16$: $16 \\to 8 \\to 4 \\to 2 \\to 1$, four calls of one step each, so $T(16) = 4 = \\log_2 16$. In general $T(n) = \\log_2 n$.`,
    },
    {
      kind: 'number',
      body: 'With $T(n) = T(n/2) + 1$ and $T(1) = 0$, what is $T(64)$?',
      answer: 6,
      hint: 'How many halvings from 64 to 1?',
      explain: '$64 \\to 32 \\to 16 \\to 8 \\to 4 \\to 2 \\to 1$: 6 halvings, $T(64) = \\log_2 64 = 6$.',
    },
    {
      kind: 'choice',
      body: 'A function makes 2 comparisons, then calls itself **twice**, each time on half of the input. Which recurrence counts its comparisons?',
      options: ['$C(n) = C(n/2) + 2$', '$C(n) = 2C(n/2) + 2$', '$C(n) = 2C(n-1) + 2$', '$C(n) = C(n-2) + 2$'],
      answer: 1,
      explain: 'Two calls on size $n/2$ cost $2C(n/2)$, plus its own 2 comparisons. Spotting the shape "how many calls, on what size, plus how much work" is the key skill for chapter 1.',
    },
  ],
};

const dots: Lesson = {
  id: 'c0l7',
  title: 'Dots and lines',
  summary: 'You know the words for graphs and trees: vertex, edge, path, weight, root, leaf, height.',
  warmup: true,
  steps: [
    {
      kind: 'read',
      title: 'Graphs',
      body: `A **graph** is a set of dots, called **vertices** (one **vertex**), joined by lines, called **edges**. It can model roads between towns, friendships, or the states of a puzzle.

Two vertices joined by an edge are **neighbours**. The **degree** of a vertex is its number of neighbours.`,
      widget: () => <GraphView nodes={DOTS.nodes} edges={DOTS.edges} width={360} height={200} />,
    },
    {
      kind: 'task',
      body: 'Click all the neighbours of vertex **d**.',
      widget: ({ onSolved }) => <NeighbourPicker nodes={DOTS.nodes} edges={DOTS.edges} target="d" onSolved={onSolved} />,
      success: 'd is joined to b, c and e: degree 3.',
    },
    {
      kind: 'number',
      body: 'In the same graph, what is the degree of vertex **e**?',
      widget: () => <GraphView nodes={DOTS.nodes} edges={DOTS.edges} width={360} height={200} />,
      answer: 1,
      explain: 'e has a single edge, to d.',
    },
    {
      kind: 'read',
      title: 'Paths and cycles',
      body: `A **path** is a walk from vertex to vertex along edges, such as a–b–d–e. Its **length** is its number of edges (here 3).

A **cycle** is a path that comes back to where it started without reusing an edge, such as a–b–c–a.`,
    },
    {
      kind: 'number',
      body: 'What is the fewest number of edges on a path from **a** to **e**?',
      widget: () => <GraphView nodes={DOTS.nodes} edges={DOTS.edges} width={360} height={200} />,
      answer: 3,
      explain: 'a–b–d–e (or a–c–d–e): 3 edges. There is no shorter way, since e is only reachable through d.',
    },
    {
      kind: 'read',
      title: 'Arrows and weights',
      body: `In a **directed** graph the edges are arrows, one-way streets: you may only follow them forwards.

In a **weighted** graph each edge carries a number, its **weight** — a distance, a time, a price. The length of a path is then the **sum of its weights**.`,
      widget: () => <GraphView nodes={ROADS.nodes} edges={ROADS.edges} width={360} height={200} />,
    },
    {
      kind: 'number',
      body: 'Following the arrows, what is the length of the **shortest** path from **p** to **s**?',
      widget: () => <GraphView nodes={ROADS.nodes} edges={ROADS.edges} width={360} height={200} />,
      answer: 6,
      hint: 'List the routes: p→q→s, p→r→s, p→r→q→s. Add the weights of each.',
      explain: 'p→q→s = 4 + 3 = 7, p→r→s = 1 + 7 = 8, p→r→q→s = 1 + 2 + 3 = **6**. The route with the most edges is the shortest one!',
    },
    {
      kind: 'read',
      title: 'Trees',
      body: `A **tree** is a graph with no cycle, drawn upside down: the **root** at the top. Each vertex (also called a **node**) below the root hangs from one **parent**; the nodes below it are its **children**. A node without children is a **leaf**.

The **height** of a tree is the number of edges on the longest path from the root down to a leaf. In a **binary tree** every node has at most two children, a **left** and a **right** one.`,
      widget: () => <TreeView root={FAMILY} />,
    },
    {
      kind: 'number',
      body: 'How many leaves does this tree have?',
      widget: () => <TreeView root={FAMILY} />,
      answer: 3,
      hint: 'Leaves are the nodes with no children below them.',
      explain: 'D, G and F have no children. (B, C and E each have at least one.)',
    },
    {
      kind: 'number',
      body: 'What is the height of this tree?',
      widget: () => <TreeView root={FAMILY} />,
      answer: 3,
      hint: 'Count edges, not nodes, on the longest root-to-leaf path.',
      explain: 'A–B–E–G has 3 edges, the longest way down.',
    },
    {
      kind: 'number',
      body: 'A binary tree of height 3 is **full**: every level has as many nodes as possible. How many nodes does it have in total?',
      answer: 15,
      hint: 'Each level has twice as many nodes as the one above: 1, 2, 4, …',
      explain: '$1 + 2 + 4 + 8 = 15 = 2^4 - 1$: a doubling sum. Turned around: a binary tree holding $n$ nodes has height at least about $\\log_2 n$.',
    },
  ],
};

export const ch0Lessons: Lesson[] = [instructions, rows, powers, sums, growth, recursion, dots];
