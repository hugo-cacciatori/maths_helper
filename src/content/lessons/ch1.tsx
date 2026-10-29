import { texNum } from '../../lib/random';
import type { Lesson, QuestionStep } from '../../lib/types';
import { CodeBlock } from '../../widgets/kit';
import {
  DoublingBars,
  GrowthPlot,
  LoopLab,
  OddSquares,
  PowerCallTree,
  QuadrupleBars,
  Rabbits,
  RecurrenceCheck,
  TraceRunner,
  type Program,
} from '../../widgets/cost';

const lg = Math.log2;

/* ---------- loop programs ---------- */

type Vars = Record<string, number | string>;

export const loopA: Program = {
  name: 'Loop A',
  lines: ['I = 0', 'while I < N', '    increment I'],
  op: 2,
  *run(N) {
    let I = 0;
    yield [0, { I }];
    for (;;) {
      yield [1, { I }];
      if (!(I < N)) break;
      I++;
      yield [2, { I }];
    }
  },
};

function nested(name: string, inner: string, innerCond: (J: number, I: number, N: number) => boolean, step: (J: number) => number, innerOp: string, outerLast: string, outerStep: (I: number) => number): Program {
  return {
    name,
    lines: ['I = 1', 'while I <= N', '    J = 1', `    while ${inner}`, `        ${innerOp}`, `    ${outerLast}`],
    op: 4,
    *run(N) {
      let I = 1;
      let J: number | string = '–';
      const v = (): Vars => ({ I, J });
      yield [0, v()];
      for (;;) {
        yield [1, v()];
        if (!(I <= N)) break;
        J = 1;
        yield [2, v()];
        for (;;) {
          yield [3, v()];
          if (!innerCond(J as number, I, N)) break;
          J = step(J as number);
          yield [4, v()];
        }
        I = outerStep(I);
        yield [5, v()];
      }
    },
  };
}

export const loopC = nested('Loop B', 'J <= N', (J, _I, N) => J <= N, (J) => J + 1, 'increment J', 'increment I', (I) => I + 1);
export const loopD = nested('Loop C', 'J < I', (J, I) => J < I, (J) => J + 1, 'increment J', 'increment I', (I) => I + 1);
export const loopG = nested('Loop E', 'J < I', (J, I) => J < I, (J) => J * 2, 'J = J * 2', 'increment I', (I) => I + 1);
export const loopH = nested('Loop F', 'J <= I', (J, I) => J <= I, (J) => J + 1, 'increment J', 'I = I * 2', (I) => I * 2);

export const loopE: Program = {
  name: 'Loop D',
  lines: ['I = 1', 'while I <= N', '    I = I * 2'],
  op: 2,
  *run(N) {
    let I = 1;
    yield [0, { I }];
    for (;;) {
      yield [1, { I }];
      if (!(I <= N)) break;
      I *= 2;
      yield [2, { I }];
    }
  },
};

const algoP: Program = {
  name: 'Algorithm P(n)',
  lines: ['S ← 0', 'for i ← 1 to n do', '    S ← S + i × i', 'return S'],
  op: 2,
  *run(n) {
    let S = 0;
    let i: number | string = '–';
    yield [0, { i, S }];
    for (i = 1; i <= n; i++) {
      yield [1, { i, S }];
      S += i * i;
      yield [2, { i, S }];
    }
    yield [3, { i: '–', S }];
  },
};

const Q_DATA = [3, 9, -2, 7, 5, 11, 0, 4, 8, -5, 6, 1];
const algoQ: Program = {
  name: 'Algorithm Q(A[0..n−1])',
  lines: [
    'minval ← A[0]; maxval ← A[0]',
    'for i ← 1 to n − 1 do',
    '    if A[i] < minval',
    '        minval ← A[i]',
    '    if A[i] > maxval',
    '        maxval ← A[i]',
    'return maxval − minval',
  ],
  op: 2,
  *run(n) {
    const A = Q_DATA.slice(0, n);
    let mn = A[0];
    let mx = A[0];
    yield [0, { i: '–', 'A[i]': '–', minval: mn, maxval: mx }];
    for (let i = 1; i < n; i++) {
      yield [1, { i, 'A[i]': A[i], minval: mn, maxval: mx }];
      yield [2, { i, 'A[i]': A[i], minval: mn, maxval: mx }];
      if (A[i] < mn) {
        mn = A[i];
        yield [3, { i, 'A[i]': A[i], minval: mn, maxval: mx }];
      }
      yield [4, { i, 'A[i]': A[i], minval: mn, maxval: mx }];
      if (A[i] > mx) {
        mx = A[i];
        yield [5, { i, 'A[i]': A[i], minval: mn, maxval: mx }];
      }
    }
    yield [6, { i: '–', 'A[i]': '–', minval: mn, maxval: mx }];
  },
};

/* ---------- practice questions with fresh numbers ---------- */

const term = (c: number, p: number) => `${c === 1 ? '' : c}${p === 1 ? 'n' : `n^${p}`}`;
const RELATIONS = ['$f_1 \\in \\Theta(f_2)$', '$f_1 \\in O(f_2)$ but not $\\Theta$', '$f_1 \\in \\Omega(f_2)$ but not $\\Theta$'];

export const quadrupleQ = (k: number): QuestionStep => ({
  kind: 'number',
  body: `If $f(n) = n^${k}$, by what factor is $f$ multiplied when $n$ is quadrupled?`,
  answer: 4 ** k,
  suffix: '×',
  explain: `$(4n)^${k} = 4^${k} n^${k} = ${texNum(4 ** k)}\\,n^${k}$.`,
});

export const compareQ = (a: number, p: number, b: number, q: number): QuestionStep => ({
  kind: 'choice',
  title: 'Practice',
  body: `Compare $f_1(n) = ${term(a, p)}$ with $f_2(n) = ${term(b, q)}$.`,
  options: RELATIONS,
  answer: p === q ? 0 : p < q ? 1 : 2,
  explain:
    p === q
      ? `Same degree: the ratio $f_1/f_2 \\to ${a}/${b}$, a positive constant, so $\\Theta$. Coefficients never change the order.`
      : p < q
        ? `$f_1/f_2 = \\dfrac{${a}}{${b}\\,${term(1, q - p)}} \\to 0$: $f_1$ grows strictly slower whatever the coefficients, so $O$ but not $\\Theta$.`
        : `$f_1/f_2 = \\dfrac{${a}\\,${term(1, p - q)}}{${b}} \\to \\infty$: $f_1$ grows strictly faster whatever the coefficients, so $\\Omega$ but not $\\Theta$.`,
});

export const triangleQ = (N: number): QuestionStep => ({
  kind: 'number',
  title: 'A triangle of work (Loop C)',
  body: `In program **Loop C** the inner loop is \`while J < I\`. Run it with $N = ${N}$: how many times does \`increment J\` execute?`,
  widget: () => <LoopLab programs={[loopD]} />,
  answer: (N * (N - 1)) / 2,
  hint: `For I = 1 the inner loop runs 0 times, for I = 2 once, … for I = ${N} it runs ${N - 1} times.`,
  explain: `$0+1+\\dots+${N - 1} = \\dfrac{N(N-1)}{2} = ${(N * (N - 1)) / 2}$. Half of the square, but still $\\Theta(N^2)$ — the ½ is just a constant.`,
});

export const oddSumQ = (k: number): QuestionStep => ({
  kind: 'number',
  body: `Compute $1 + 3 + 5 + 7 + \\dots + ${2 * k - 1}$.`,
  answer: k * k,
  hint: `How many odd numbers are there from 1 to ${2 * k - 1}? If $2k - 1 = ${2 * k - 1}$, then $k = ?$`,
  explain: `$${2 * k - 1} = 2k - 1$ gives $k = ${k}$ terms, and the picture says the sum of the first $k$ odd numbers is $k^2 = ${k}^2 = ${texNum(k * k)}$.`,
});

export const doublingSumQ = (k: number): QuestionStep => ({
  kind: 'number',
  body: `Compute $2 + 4 + 8 + 16 + \\dots + ${texNum(2 ** k)}$.`,
  answer: 2 ** (k + 1) - 2,
  explain: `$${texNum(2 ** k)} = 2^{${k}}$, so the sum is $2^{${k + 1}} - 2 = ${texNum(2 ** (k + 1))} - 2 = ${texNum(2 ** (k + 1) - 2)}$. In general $\\sum_{i=1}^{k} 2^i = 2^{k+1} - 2$.`,
});

export const rangeCompsQ = (n: number): QuestionStep => ({
  kind: 'number',
  body: `Each iteration makes 2 comparisons between elements. How many element comparisons for an array of $n = ${n}$ elements?`,
  answer: 2 * (n - 1),
  explain: `$n - 1 = ${n - 1}$ iterations × 2 comparisons $= 2(n-1) = ${2 * (n - 1)}$. That is $\\Theta(n)$ — and you will see later that $\\approx 1.5n$ comparisons are enough!`,
});

export const symmetricCompsQ = (n: number): QuestionStep => ({
  kind: 'number',
  body: `In the **worst case** (a symmetric matrix, so it never returns early), how many comparisons does R make for $n = ${n}$?`,
  answer: (n * (n - 1)) / 2,
  hint: 'For $i = 0$ there are $n-1$ values of $j$, for $i = 1$ there are $n-2$…',
  explain: `$\\sum_{i=0}^{n-2}(n-1-i) = (n-1) + \\dots + 1 = \\frac{n(n-1)}{2} = ${(n * (n - 1)) / 2}$. Worst-case cost: $\\Theta(n^2)$.`,
});

export const addConstQ = (c: number, N: number): QuestionStep => ({
  kind: 'number',
  body: `With $x(n) = x(n-1) + ${c}$ and $x(1) = 0$, what is $x(${N})$?`,
  answer: c * (N - 1),
  explain: `$x(n) = ${c}(n-1)$, so $x(${N}) = ${c} \\times ${N - 1} = ${c * (N - 1)}$.`,
});

export const twoCallsQ = (n: number): QuestionStep => ({
  kind: 'number',
  body: `With the two-call version, how many calls are made in total for $n = ${n}$?`,
  answer: 2 ** (n + 1) - 1,
  explain: `$2^{${n}+1} - 1 = ${2 ** (n + 1) - 1}$ calls, and $A(n) = 2A(n-1) + 1$ gives $2^n - 1 = ${2 ** n - 1}$ additions.`,
});

/* ---------- lessons ---------- */

const growth: Lesson = {
  id: 'c1l1',
  title: 'How fast does it grow?',
  summary: 'You can now compare how fast functions grow and pick the most precise asymptotic relation.',
  steps: [
    {
      kind: 'read',
      title: 'Which one grows faster?',
      body: `When we analyse an algorithm we care about what happens when the input size $n$ becomes **large**. Constant factors and small terms stop mattering — only the *shape* of the growth does.

- $f \\in O(g)$: $f$ grows **no faster** than $g$ (up to a constant).
- $f \\in \\Omega(g)$: $f$ grows **at least as fast** as $g$.
- $f \\in \\Theta(g)$: both — they grow at the **same rate**.

A practical test: look at the ratio $f(n)/g(n)$ as $n \\to \\infty$. A positive constant means $\\Theta$; $0$ means $f$ is strictly smaller ($O$ only); $\\infty$ means strictly bigger ($\\Omega$ only).

Drag the slider and watch the ratio of $n^2$ and $n^2+1$.`,
      widget: () => <GrowthPlot fns={[{ tex: 'n^2', f: (n) => n * n }, { tex: 'n^2+1', f: (n) => n * n + 1 }]} nMax={10} maxRange={[3, 200]} />,
    },
    {
      kind: 'choice',
      body: 'What is the most precise relation between $f_1(n) = n^2$ and $f_2(n) = n^2 + 1$?',
      options: ['$f_1 \\in \\Theta(f_2)$', '$f_1 \\in O(f_2)$ but not $\\Theta$', '$f_1 \\in \\Omega(f_2)$ but not $\\Theta$'],
      answer: 0,
      explain: 'The ratio $n^2/(n^2+1) \\to 1$, a positive constant, so they grow at the same rate: $\\Theta$.',
    },
    {
      kind: 'choice',
      body: 'Now $f_1(n) = n^2$ and $f_2(n) = 3n^2 + 4n + 1$. Use the plot: the curves look far apart — but what does the **ratio** do?',
      widget: () => <GrowthPlot fns={[{ tex: 'n^2', f: (n) => n * n }, { tex: '3n^2+4n+1', f: (n) => 3 * n * n + 4 * n + 1 }]} nMax={20} />,
      options: ['$f_1 \\in \\Theta(f_2)$', '$f_1 \\in O(f_2)$ but not $\\Theta$', '$f_1 \\in \\Omega(f_2)$ but not $\\Theta$'],
      answer: 0,
      hint: 'Drag $n$ to 200: the ratio settles near a constant. Which constant?',
      explain: 'The ratio tends to $1/3$ — a positive constant. A factor of 3 does not change the order: still $\\Theta(n^2)$.',
    },
    {
      kind: 'choice',
      body: 'Compare $f_1(n) = 10n^2$ with $f_2(n) = n^3$. At small $n$, $10n^2$ is bigger… does it stay that way?',
      widget: () => <GrowthPlot fns={[{ tex: '10n^2', f: (n) => 10 * n * n }, { tex: 'n^3', f: (n) => n ** 3 }]} nMax={8} maxRange={[3, 60]} />,
      options: ['$f_1 \\in \\Theta(f_2)$', '$f_1 \\in O(f_2)$ but not $\\Theta$', '$f_1 \\in \\Omega(f_2)$ but not $\\Theta$'],
      answer: 1,
      explain: 'The curves cross at $n = 10$; after that $n^3$ wins forever. $10n^2/n^3 = 10/n \\to 0$, so $10n^2 \\in O(n^3)$ but not $\\Theta(n^3)$.',
    },
    {
      kind: 'choice',
      body: 'In general, take two positive polynomials of degrees $d_1$ and $d_2$ with $d_1 < d_2$. What is the relation?',
      options: ['$f_1 \\in \\Theta(f_2)$', '$f_1 \\in O(f_2)$ but not $\\Theta$', '$f_1 \\in \\Omega(f_2)$ but not $\\Theta$', 'It depends on the coefficients'],
      answer: 1,
      explain: 'Only the leading term counts: $f_1 \\in \\Theta(n^{d_1})$, $f_2 \\in \\Theta(n^{d_2})$ and $n^{d_1}/n^{d_2} \\to 0$. Coefficients never change the order (equal degrees ⇒ $\\Theta$).',
    },
    {
      kind: 'choice',
      title: 'Simplify',
      body: `To find a simple $\\Theta$-equivalent, **keep the dominant term and drop its constant**. With two size parameters $n$ and $m$, keep every term that could dominate — you can't compare $n$ and $m$!

Simplify $f(n,m) = 3n^2 + 4n + \\dfrac{1}{n} + m + nm$.`,
      options: ['$\\Theta(n^2)$', '$\\Theta(nm)$', '$\\Theta(n^2 + nm)$', '$\\Theta(n^2 + m)$'],
      answer: 2,
      hint: '$4n$ is dominated by $3n^2$, $1/n$ vanishes and $m$ is dominated by $nm$ (as $n \\geq 1$). Is $n^2$ bigger than $nm$?',
      explain: '$4n \\le 4n^2$, $1/n \\to 0$ and $m \\le nm$. But $n^2$ vs $nm$ depends on whether $n > m$, so both survive: $\\Theta(n^2 + nm)$.',
    },
    {
      kind: 'read',
      title: 'What if the input is 4× bigger?',
      body: 'A very concrete way to feel growth orders: multiply $n$ by 4 and see how much more work the function represents. Move the slider: for each function the factor stays the same (or grows), whatever $n$ is.',
      widget: () => (
        <QuadrupleBars
          fns={[
            { name: 'log', tex: '\\log_2 n', f: lg },
            { name: 'sqrt', tex: '\\sqrt n', f: Math.sqrt },
            { name: 'lin', tex: 'n', f: (n) => n },
            { name: 'sq', tex: 'n^2', f: (n) => n * n },
            { name: 'cube', tex: 'n^3', f: (n) => n ** 3 },
          ]}
        />
      ),
    },
    { kind: 'generated', make: (r) => quadrupleQ(r.int(2, 5)) },
    {
      kind: 'choice',
      body: 'And for $f(n) = \\log_2 n$, what happens to $f$ when $n$ is quadrupled?',
      options: ['It is multiplied by 4', 'It is multiplied by 2', 'It increases by 2', 'It does not change'],
      answer: 2,
      explain: '$\\log_2(4n) = \\log_2 4 + \\log_2 n = \\log_2 n + 2$. Logarithms turn multiplication into addition — that is why logarithmic algorithms scale so well. (For $2^n$: $2^{4n} = (2^n)^4$, the value gets raised to the 4th power!)',
    },
    {
      kind: 'choice',
      body: 'Compare $f(n) = \\log_2^2 n$ (that is, $(\\log_2 n)^2$) with $g(n) = \\log_2 n^2$.',
      widget: () => <GrowthPlot fns={[{ tex: '(\\log_2 n)^2', f: (n) => lg(n) ** 2 }, { tex: '\\log_2 n^2', f: (n) => lg(n * n) }]} nMax={20} maxRange={[5, 200]} />,
      options: ['$f$ grows slower than $g$', '$f$ and $g$ grow at the same rate', '$f$ grows faster than $g$'],
      answer: 2,
      hint: 'Rewrite $\\log_2 n^2$ using a log rule.',
      explain: '$\\log_2 n^2 = 2\\log_2 n$, so $f/g = \\log_2 n / 2 \\to \\infty$: $f$ grows faster.',
    },
    {
      kind: 'choice',
      body: 'Which pair grows at the **same** rate (up to a multiplicative constant)?',
      options: ['$(n-1)!$ and $n!$', '$2^{n-1}$ and $2^n$', '$100n^2$ and $0.01n^3$', '$n+1$ and $2000n^2$'],
      answer: 1,
      explain: '$2^{n-1} = \\tfrac12 \\cdot 2^n$: a constant factor. But $n! = n\\cdot(n-1)!$ — the factor $n$ is *not* constant, so $(n-1)!$ grows strictly slower.',
    },
    {
      kind: 'choice',
      body: 'Which of these claims about $\\dfrac{n(n+1)}{2}$ is **false**?',
      options: ['$\\dfrac{n(n+1)}{2} \\in O(n^3)$', '$\\dfrac{n(n+1)}{2} \\in O(n^2)$', '$\\dfrac{n(n+1)}{2} \\in \\Theta(n^3)$', '$\\dfrac{n(n+1)}{2} \\in \\Omega(n)$'],
      answer: 2,
      explain: '$n(n+1)/2 \\approx n^2/2$ is $\\Theta(n^2)$. It is in $O(n^3)$ (grows no faster) and $\\Omega(n)$ (grows at least as fast), but **not** $\\Theta(n^3)$: $n^3$ is a strictly bigger order.',
    },
    {
      kind: 'generated',
      make: (r) => {
        const [p, q] = [r.int(1, 4), r.int(1, 4)];
        // The bigger coefficient goes on the slower function, so small values of n mislead.
        const [big, small] = [r.int(10, 50), r.int(1, 3)];
        return compareQ(p <= q ? big : small, p, p <= q ? small : big, q);
      },
    },
  ],
};

const loops: Lesson = {
  id: 'c1l2',
  title: 'How many times does it run?',
  summary: 'You can estimate running time by counting how often the innermost instruction runs.',
  steps: [
    {
      kind: 'read',
      title: 'Time = instructions executed',
      body: `To estimate the running time of an algorithm we count how many times its **basic operation** — usually the innermost instruction — is executed, as a function of the input size $N$.

Step through this simple loop. Watch the highlighted line and the counter.`,
      widget: () => <TraceRunner program={loopA} nRange={[1, 12]} initialN={4} opName="increment" />,
    },
    {
      kind: 'task',
      title: 'Nested loops',
      body: 'Program **Loop B** has a loop inside a loop. Pick it, then press **Play** (or **Step**) to run it to the end. Then study the doubling table: what happens to the count every time $N$ doubles?',
      widget: ({ onSolved }) => <LoopLab programs={[loopC]} onSolved={onSolved} />,
      success: 'For each of the $N$ values of `I`, the inner loop runs $N$ times: $N \\times N = N^2$ executions. Doubling $N$ multiplies the work by 4.',
    },
    {
      kind: 'choice',
      body: 'So what is the order of the running time of program Loop B?',
      options: ['$\\Theta(N)$', '$\\Theta(N \\log N)$', '$\\Theta(N^2)$', '$\\Theta(2^N)$'],
      answer: 2,
      explain: 'The doubling ratio is exactly 4 = $2^2$: quadratic, $\\Theta(N^2)$.',
    },
    { kind: 'generated', make: (r) => triangleQ(r.int(4, 12)) },
    {
      kind: 'choice',
      title: 'Doubling the counter (Loop D)',
      body: 'In **Loop D**, `I` is **doubled** at each iteration instead of incremented. What is the order of the running time?',
      widget: () => <LoopLab programs={[loopE]} />,
      options: ['$\\Theta(1)$', '$\\Theta(\\log N)$', '$\\Theta(\\sqrt N)$', '$\\Theta(N)$'],
      answer: 1,
      explain: '`I` takes the values $1, 2, 4, \\dots, 2^k \\le N$: about $\\log_2 N + 1$ iterations. Doubling $N$ adds just one iteration — ratio → 1.',
    },
    {
      kind: 'choice',
      title: 'A logarithm inside a loop (Loop E)',
      body: 'Program **Loop E**: for each `I` from 1 to N, `J` doubles until it reaches `I`. What is the order?',
      widget: () => <LoopLab programs={[loopG]} />,
      options: ['$\\Theta(N)$', '$\\Theta(N \\log N)$', '$\\Theta(N^2)$', '$\\Theta(\\log^2 N)$'],
      answer: 1,
      explain: 'The inner loop runs about $\\lceil\\log_2 I\\rceil$ times, and $\\sum_{I=1}^{N} \\log_2 I = \\log_2 N! \\in \\Theta(N\\log N)$. The doubling ratio is slightly above 2.',
    },
    {
      kind: 'choice',
      title: 'The trap (Loop F)',
      body: 'Last one: in **Loop F** the *outer* counter doubles, and the inner loop runs `I` times. It looks nested… what is the order?',
      widget: () => <LoopLab programs={[loopH]} />,
      options: ['$\\Theta(\\log N)$', '$\\Theta(N)$', '$\\Theta(N \\log N)$', '$\\Theta(N^2)$'],
      answer: 1,
      hint: 'Add up the inner counts: $1 + 2 + 4 + 8 + \\dots$ up to $N$.',
      explain: 'The inner loop runs $1 + 2 + 4 + \\dots + 2^k$ times with $2^k \\le N$, which is $2^{k+1} - 1 < 2N$. Nested loops are **not** always quadratic — always count!',
    },
  ],
};

const sums: Lesson = {
  id: 'c1l3',
  title: 'Adding up long series',
  summary: 'You can compute the arithmetic and geometric sums that appear in loop analysis.',
  steps: [
    {
      kind: 'read',
      title: 'Odd numbers make squares',
      body: 'Loop counts are sums, so we need to compute sums quickly. A picture first: stack the odd numbers $1, 3, 5, \\dots$ as L-shaped layers. Move the slider.',
      widget: () => <OddSquares />,
    },
    { kind: 'generated', make: (r) => oddSumQ(r.int(20, 600)) },
    {
      kind: 'read',
      title: 'Doubling sums',
      body: 'Geometric sums behave very differently: each term is as big as **all the previous ones together** (plus the first). Look at how the bars fill the next power of two.',
      widget: () => <DoublingBars />,
    },
    { kind: 'generated', make: (r) => doublingSumQ(r.int(5, 14)) },
    {
      kind: 'choice',
      body: 'Compute $\\displaystyle\\sum_{i=3}^{n+1} 1$.',
      options: ['$n+1$', '$n-1$', '$n-2$', '$n+3$'],
      answer: 1,
      hint: 'Summing 1 just counts the terms. From 3 to $n+1$ there are (last − first + 1) terms.',
      explain: 'Number of terms $= (n+1) - 3 + 1 = n - 1$.',
    },
    {
      kind: 'choice',
      body: 'Compute $\\displaystyle\\sum_{i=3}^{n+1} i$.',
      options: ['$\\dfrac{(n+1)(n+2)}{2}$', '$\\dfrac{(n+1)(n+2)}{2} - 3$', '$\\dfrac{n(n+1)}{2} - 3$', '$\\dfrac{(n-1)(n+4)}{2} + 1$'],
      answer: 1,
      hint: 'Use $\\sum_{i=1}^{m} i = \\frac{m(m+1)}{2}$ with $m = n+1$, then remove the terms $i = 1$ and $i = 2$.',
      explain: '$\\sum_{i=1}^{n+1} i = \\frac{(n+1)(n+2)}{2}$, minus $1 + 2 = 3$. (It also equals $\\frac{(n-1)(n+4)}{2}$ — expand to check — but not option D.)',
    },
    {
      kind: 'choice',
      body: 'Compute $\\displaystyle\\sum_{i=0}^{n-1} i(i+1)$. Tip: try $n = 2$ and $n = 3$ on each option.',
      options: ['$\\dfrac{n(n+1)}{2}$', '$\\dfrac{(n-1)n(n+1)}{3}$', '$\\dfrac{n^2(n+1)}{2}$', '$\\dfrac{n(n+1)(2n+1)}{6}$'],
      answer: 1,
      explain: '$\\sum i^2 + \\sum i = \\frac{(n-1)n(2n-1)}{6} + \\frac{(n-1)n}{2} = \\frac{(n-1)n(n+1)}{3}$. Check: $n=3$ gives $0 + 2 + 6 = 8 = \\frac{2\\cdot3\\cdot4}{3}$. ✓',
    },
    {
      kind: 'choice',
      body: 'Compute $\\displaystyle\\sum_{j=1}^{n} 3^{j+1}$.',
      options: ['$3^{n+1} - 1$', '$\\dfrac{3^{n+2} - 9}{2}$', '$\\dfrac{3^{n+1} - 3}{2}$', '$9 \\cdot 3^{n}$'],
      answer: 1,
      hint: 'A geometric sum: $\\sum_{j=0}^{k} r^j = \\dfrac{r^{k+1} - 1}{r - 1}$. Factor out $3^2 = 9$ first.',
      explain: '$\\sum_{j=1}^{n} 3^{j+1} = 9\\sum_{j=0}^{n-1} 3^j = 9\\cdot\\frac{3^n - 1}{2} = \\frac{3^{n+2} - 9}{2}$. Check $n=1$: $9$. ✓',
    },
    {
      kind: 'choice',
      body: 'Compute $\\displaystyle\\sum_{i=1}^{n}\\sum_{j=1}^{n} ij$.',
      options: ['$\\dfrac{n^2(n+1)}{2}$', '$\\left(\\dfrac{n(n+1)}{2}\\right)^2$', '$\\dfrac{n(n+1)(2n+1)}{6}$', '$n^2$'],
      answer: 1,
      explain: 'The inner sum is $i\\sum_j j = i\\frac{n(n+1)}{2}$; summing over $i$ gives $\\frac{n(n+1)}{2}\\cdot\\frac{n(n+1)}{2}$.',
    },
  ],
};

const analyse: Lesson = {
  id: 'c1l4',
  title: 'Reading unknown code',
  summary: 'You can find what an algorithm computes, its basic operation, its cost class — and improve it.',
  steps: [
    {
      kind: 'read',
      title: 'Algorithm P',
      body: `Analysing an algorithm always follows the same recipe:

- **What** does it compute?
- What is its **basic operation**?
- **How many times** is it executed?
- What is its **cost class**? Can we do better?

Run algorithm P for a few values of $n$ and watch $S$.`,
      widget: () => <TraceRunner program={algoP} nRange={[1, 10]} initialN={4} inputName="n" opName="multiplication" />,
    },
    {
      kind: 'choice',
      body: 'What does P(n) compute?',
      options: ['$1 + 2 + \\dots + n$', '$1^2 + 2^2 + \\dots + n^2$', '$n^2$', '$n!$'],
      answer: 1,
      explain: 'Each iteration adds $i \\times i$: $S = \\sum_{i=1}^{n} i^2$ (for $n=4$: $1+4+9+16 = 30$).',
    },
    {
      kind: 'choice',
      body: 'Which is the best choice of **basic operation**?',
      options: ['The assignment `S ← 0`', 'The multiplication `i × i`', 'The `return`', 'Reading `n`'],
      answer: 1,
      explain: 'The basic operation is the most costly one in the innermost loop: the multiplication (the addition is a fine choice too — they run equally often).',
    },
    {
      kind: 'choice',
      body: 'It runs $n$ times, so P is $\\Theta(n)$. Can we do better?',
      options: [
        'No, we have to look at every $i$',
        'Yes: $S = \\dfrac{n(n+1)(2n+1)}{6}$, a constant number of operations — $\\Theta(1)$',
        'Yes, with a binary search — $\\Theta(\\log n)$',
      ],
      answer: 1,
      explain: 'A closed formula replaces the loop by a handful of arithmetic operations, whatever $n$ is. (Strictly, with huge $n$ the cost of arithmetic on big numbers grows too, but in this model it is $\\Theta(1)$.) Note that P simply applies the definition, one term at a time.',
    },
    {
      kind: 'read',
      title: 'Algorithm Q',
      body: 'Same recipe for algorithm Q, which runs on an array of numbers. Step through and watch `minval` and `maxval`.',
      widget: () => <TraceRunner program={algoQ} nRange={[2, 12]} initialN={6} inputName="n" opName="comparison A[i] < minval" />,
    },
    {
      kind: 'choice',
      body: 'What does Q return?',
      options: ['The largest element', 'The sum of the elements', 'The range: largest minus smallest element', 'The number of distinct elements'],
      answer: 2,
      explain: 'It tracks both the minimum and the maximum, then returns $\\max - \\min$: the **range** of the array.',
    },
    { kind: 'generated', make: (r) => rangeCompsQ(r.int(5, 40)) },
    {
      kind: 'read',
      title: 'Algorithm R',
      body: 'The third algorithm works on an $n \\times n$ matrix.',
      widget: () => (
        <CodeBlock
          title="Algorithm R(A[0..n−1, 0..n−1])"
          lines={['for i ← 0 to n − 2 do', '    for j ← i + 1 to n − 1 do', '        if A[i, j] ≠ A[j, i]', '            return false', 'return true']}
        />
      ),
    },
    {
      kind: 'choice',
      body: 'What does R check?',
      options: ['That the matrix is diagonal', 'That the matrix is symmetric', 'That all elements are distinct', 'That the matrix is upper triangular'],
      answer: 1,
      explain: 'It compares every element above the diagonal with its mirror $A[j,i]$: it returns true iff the matrix is **symmetric**.',
    },
    { kind: 'generated', make: (r) => symmetricCompsQ(r.int(4, 30)) },
  ],
};

const recurrences: Lesson = {
  id: 'c1l5',
  title: 'Functions that call themselves',
  summary: 'You can set up a recurrence for a recursive algorithm and solve it by unrolling.',
  steps: [
    {
      kind: 'read',
      title: 'Unrolling a recurrence',
      body: `A recursive algorithm's cost is naturally described by a **recurrence**. To solve one, substitute it into itself until a pattern appears (*backward substitution*):

$$x(n) = x(n-1) + 5 = x(n-2) + 2\\cdot5 = \\dots = x(n-i) + 5i$$

Stop when you reach the base case: $i = n-1$ gives $x(1) + 5(n-1)$.

Check guesses against the real values below.`,
      widget: () => (
        <RecurrenceCheck
          rec={{ tex: 'x(n) = x(n-1) + 5,\\quad x(1) = 0', values: (k) => Array.from({ length: k }, (_, i) => 5 * i) }}
          candidates={[
            { tex: '5n', f: (n) => 5 * n },
            { tex: '5(n-1)', f: (n) => 5 * (n - 1) },
            { tex: 'n + 5', f: (n) => n + 5 },
          ]}
        />
      ),
    },
    { kind: 'generated', make: (r) => addConstQ(r.int(2, 9), r.int(20, 200)) },
    {
      kind: 'choice',
      body: 'Solve $x(n) = 3x(n-1)$ for $n > 1$, $x(1) = 4$. Use the checker.',
      widget: () => (
        <RecurrenceCheck
          rec={{ tex: 'x(n) = 3\\,x(n-1),\\quad x(1) = 4', values: (k) => Array.from({ length: k }, (_, i) => 4 * 3 ** i) }}
          candidates={[
            { tex: '4\\cdot 3^{n}', f: (n) => 4 * 3 ** n },
            { tex: '4\\cdot 3^{n-1}', f: (n) => 4 * 3 ** (n - 1) },
            { tex: '3^{n+1}', f: (n) => 3 ** (n + 1) },
          ]}
        />
      ),
      options: ['$x(n) = 4\\cdot3^{n}$', '$x(n) = 4\\cdot 3^{n-1}$', '$x(n) = 3^{n+1}$', '$x(n) = 12n$'],
      answer: 1,
      explain: 'Unrolling: $x(n) = 3x(n-1) = 3^2x(n-2) = \\dots = 3^{n-1}x(1) = 4\\cdot3^{n-1}$.',
    },
    {
      kind: 'choice',
      body: 'Solve $x(n) = x(n-1) + n$ for $n > 0$, $x(0) = 0$.',
      options: ['$x(n) = n^2$', '$x(n) = \\dfrac{n(n+1)}{2}$', '$x(n) = 2^n - 1$', '$x(n) = n$'],
      answer: 1,
      explain: 'Unrolling gives $x(n) = n + (n-1) + \\dots + 1 + x(0) = \\frac{n(n+1)}{2}$.',
    },
    {
      kind: 'choice',
      body: 'Solve $x(n) = x(n/2) + n$ for $n > 1$, $x(1) = 1$, with $n = 2^k$.',
      widget: () => (
        <RecurrenceCheck
          start={0}
          rec={{
            tex: 'x(2^k) = x(2^{k-1}) + 2^k,\\quad x(1)=1 \\qquad (\\text{columns are } k)',
            values: (c) => Array.from({ length: c }, (_, k) => 2 ** (k + 1) - 1),
          }}
          candidates={[
            { tex: '2\\cdot2^k - 1', f: (k) => 2 * 2 ** k - 1 },
            { tex: '2^k + k', f: (k) => 2 ** k + k },
            { tex: 'k\\cdot 2^k', f: (k) => k * 2 ** k },
          ]}
        />
      ),
      options: ['$x(n) = n\\log_2 n$', '$x(n) = 2n - 1$', '$x(n) = n + \\log_2 n$', '$x(n) = n^2$'],
      answer: 1,
      explain: '$x(2^k) = 2^k + 2^{k-1} + \\dots + 2^1 + x(1) = 2^{k+1} - 2 + 1 = 2n - 1$. Halving sizes add up to a geometric series: linear overall.',
    },
    {
      kind: 'read',
      title: 'Algorithm T',
      body: 'Here is a recursive algorithm. Its values satisfy $D(n) = D(n-1) + 2n - 1$, $D(1) = 1$.',
      widget: () => (
        <div className="space-y-4">
          <CodeBlock title="Algorithm T(n)" lines={['if n = 1 return 1', 'else return T(n − 1) + 2 × n − 1']} />
          <RecurrenceCheck
            rec={{ tex: 'D(n) = D(n-1) + 2n - 1,\\quad D(1) = 1', values: (k) => Array.from({ length: k }, (_, i) => (i + 1) ** 2) }}
            candidates={[
              { tex: '2n - 1', f: (n) => 2 * n - 1 },
              { tex: 'n^2', f: (n) => n * n },
              { tex: '\\tfrac{n(n+1)}{2}', f: (n) => (n * (n + 1)) / 2 },
            ]}
          />
        </div>
      ),
    },
    {
      kind: 'choice',
      body: 'T computes $n^2$ (the sum of the first $n$ odd numbers — remember the squares!). How many **multiplications** $M(n)$ does it perform?',
      options: ['$M(n) = M(n-1) + 1,\\ M(1) = 0$, so $M(n) = n - 1$', '$M(n) = 2M(n-1)$, so $M(n) = 2^{n-1}$', '$M(n) = n^2$', '$M(n) = M(n-1) + n$, so $M(n) = \\frac{n(n+1)}{2}$'],
      answer: 0,
      explain: 'One multiplication (`2 × n`) per call except the base case: $M(n) = M(n-1) + 1$ with $M(1) = 0$, so $M(n) = n - 1$. (Same idea for $n!$ computed recursively: $n$ calls.)',
    },
    {
      kind: 'task',
      title: 'Computing 2ⁿ recursively',
      body: `Compute $2^n$ recursively with $2^n = 2^{n-1} + 2^{n-1}$, calling **Pow2(n−1) twice**. Each node of the tree below is one call. Push $n$ up to 4 and watch the tree.`,
      widget: ({ onSolved }) => <PowerCallTree onSolved={onSolved} />,
      success: 'The tree doubles at each level: $1 + 2 + 4 + \\dots + 2^n = 2^{n+1} - 1$ calls.',
    },
    { kind: 'generated', make: (r) => twoCallsQ(r.int(3, 8)) },
    {
      kind: 'choice',
      body: 'Is this a good algorithm for computing $2^n$?',
      options: [
        'Yes: recursion is always efficient',
        'No: it recomputes the same value again and again — $\\Theta(2^n)$ work where storing $t = $ Pow2(n−1) once gives $\\Theta(n)$',
        'Yes, because each call does only one addition',
      ],
      answer: 1,
      explain: 'Click the second button in the widget: computing the sub-result once turns the tree into a chain of $n+1$ calls. Avoiding repeated work is the seed of dynamic programming.',
    },
  ],
};

const rabbits: Lesson = {
  id: 'c1l6',
  title: 'A growing population',
  summary: 'You modelled a growth process with a recurrence and met the Fibonacci numbers.',
  steps: [
    {
      kind: 'read',
      title: 'A famous puzzle',
      body: `A man places one pair of **newborn** rabbits in an enclosure. Rabbit pairs are not fertile during their first month, but at the end of their **second** month — and every month after — each pair produces a new pair.

How many pairs will there be after one year?`,
    },
    {
      kind: 'task',
      body: 'Simulate it! Move month by month and watch which pairs are fertile. Go all the way to month 12.',
      widget: ({ onSolved }) => <Rabbits onSolved={onSolved} />,
      success: 'Every fertile pair produces one new pair per month, so births each month equal the number of pairs that existed two months earlier.',
    },
    {
      kind: 'number',
      body: 'How many pairs are there at the end of month 12?',
      answer: 233,
      explain: 'The counts go 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, **233**.',
    },
    {
      kind: 'choice',
      body: 'Which recurrence describes $P(m)$, the number of pairs at month $m$?',
      options: ['$P(m) = 2P(m-1)$', '$P(m) = P(m-1) + P(m-2)$', '$P(m) = P(m-1) + m$', '$P(m) = P(m-1) + 2$'],
      answer: 1,
      explain: 'Pairs this month = pairs last month (nobody dies) + newborns, and newborns = pairs that are at least two months old = $P(m-2)$.',
    },
    {
      kind: 'choice',
      body: 'How fast does $P(m)$ grow?',
      options: ['Linearly', 'Quadratically', 'Exponentially, roughly like $1.618^m$', 'Like $2^m$ exactly'],
      answer: 2,
      explain: 'The ratio $P(m)/P(m-1)$ tends to the golden ratio $\\varphi = \\frac{1+\\sqrt5}{2} \\approx 1.618$, so $P(m) \\in \\Theta(\\varphi^m)$ — exponential, but slower than $2^m$.',
    },
  ],
};

export const ch1Lessons = [growth, loops, sums, analyse, recurrences, rabbits];
