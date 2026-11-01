import { t } from '../../lib/i18n';
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
  name: t('Loop A', 'Boucle A'),
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

export const loopC = nested(t('Loop B', 'Boucle B'), 'J <= N', (J, _I, N) => J <= N, (J) => J + 1, 'increment J', 'increment I', (I) => I + 1);
export const loopD = nested(t('Loop C', 'Boucle C'), 'J < I', (J, I) => J < I, (J) => J + 1, 'increment J', 'increment I', (I) => I + 1);
export const loopG = nested(t('Loop E', 'Boucle E'), 'J < I', (J, I) => J < I, (J) => J * 2, 'J = J * 2', 'increment I', (I) => I + 1);
export const loopH = nested(t('Loop F', 'Boucle F'), 'J <= I', (J, I) => J <= I, (J) => J + 1, 'increment J', 'I = I * 2', (I) => I * 2);

export const loopE: Program = {
  name: t('Loop D', 'Boucle D'),
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
  name: t('Algorithm P(n)', 'Algorithme P(n)'),
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
  name: t('Algorithm Q(A[0..n−1])', 'Algorithme Q(A[0..n−1])'),
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
const RELATIONS = [
  '$f_1 \\in \\Theta(f_2)$',
  t('$f_1 \\in O(f_2)$ but not $\\Theta$', '$f_1 \\in O(f_2)$ mais pas $\\Theta$'),
  t('$f_1 \\in \\Omega(f_2)$ but not $\\Theta$', '$f_1 \\in \\Omega(f_2)$ mais pas $\\Theta$'),
];
const PRACTICE = t('Practice', 'Entraînement');

export const quadrupleQ = (k: number): QuestionStep => ({
  kind: 'number',
  body: t(
    `If $f(n) = n^${k}$, by what factor is $f$ multiplied when $n$ is quadrupled?`,
    `Si $f(n) = n^${k}$, par quel facteur $f$ est-elle multipliée quand $n$ est multiplié par 4 ?`,
  ),
  answer: 4 ** k,
  suffix: '×',
  explain: `$(4n)^${k} = 4^${k} n^${k} = ${texNum(4 ** k)}\\,n^${k}$.`,
});

export const compareQ = (a: number, p: number, b: number, q: number): QuestionStep => ({
  kind: 'choice',
  title: PRACTICE,
  body: t(`Compare $f_1(n) = ${term(a, p)}$ with $f_2(n) = ${term(b, q)}$.`, `Comparez $f_1(n) = ${term(a, p)}$ et $f_2(n) = ${term(b, q)}$.`),
  options: RELATIONS,
  answer: p === q ? 0 : p < q ? 1 : 2,
  explain:
    p === q
      ? t(
          `Same degree: the ratio $f_1/f_2 \\to ${a}/${b}$, a positive constant, so $\\Theta$. Coefficients never change the order.`,
          `Même degré : le rapport $f_1/f_2 \\to ${a}/${b}$, une constante positive, donc $\\Theta$. Les coefficients ne changent jamais l’ordre.`,
        )
      : p < q
        ? t(
            `$f_1/f_2 = \\dfrac{${a}}{${b}\\,${term(1, q - p)}} \\to 0$: $f_1$ grows strictly slower whatever the coefficients, so $O$ but not $\\Theta$.`,
            `$f_1/f_2 = \\dfrac{${a}}{${b}\\,${term(1, q - p)}} \\to 0$ : $f_1$ croît strictement moins vite quels que soient les coefficients, donc $O$ mais pas $\\Theta$.`,
          )
        : t(
            `$f_1/f_2 = \\dfrac{${a}\\,${term(1, p - q)}}{${b}} \\to \\infty$: $f_1$ grows strictly faster whatever the coefficients, so $\\Omega$ but not $\\Theta$.`,
            `$f_1/f_2 = \\dfrac{${a}\\,${term(1, p - q)}}{${b}} \\to \\infty$ : $f_1$ croît strictement plus vite quels que soient les coefficients, donc $\\Omega$ mais pas $\\Theta$.`,
          ),
});

export const triangleQ = (N: number): QuestionStep => ({
  kind: 'number',
  title: t('A triangle of work (Loop C)', 'Un triangle de travail (boucle C)'),
  body: t(
    `In program **Loop C** the inner loop is \`while J < I\`. Run it with $N = ${N}$: how many times does \`increment J\` execute?`,
    `Dans le programme **Boucle C**, la boucle intérieure est \`while J < I\`. Lancez-le avec $N = ${N}$ : combien de fois \`increment J\` s’exécute-t-il ?`,
  ),
  widget: () => <LoopLab programs={[loopD]} />,
  answer: (N * (N - 1)) / 2,
  hint: t(
    `For I = 1 the inner loop runs 0 times, for I = 2 once, … for I = ${N} it runs ${N - 1} times.`,
    `Pour I = 1 la boucle intérieure tourne 0 fois, pour I = 2 une fois, … pour I = ${N} elle tourne ${N - 1} fois.`,
  ),
  explain: t(
    `$0+1+\\dots+${N - 1} = \\dfrac{N(N-1)}{2} = ${(N * (N - 1)) / 2}$. Half of the square, but still $\\Theta(N^2)$ — the ½ is just a constant.`,
    `$0+1+\\dots+${N - 1} = \\dfrac{N(N-1)}{2} = ${(N * (N - 1)) / 2}$. La moitié du carré, mais toujours $\\Theta(N^2)$ — le ½ n’est qu’une constante.`,
  ),
});

export const oddSumQ = (k: number): QuestionStep => ({
  kind: 'number',
  body: t(`Compute $1 + 3 + 5 + 7 + \\dots + ${2 * k - 1}$.`, `Calculez $1 + 3 + 5 + 7 + \\dots + ${2 * k - 1}$.`),
  answer: k * k,
  hint: t(
    `How many odd numbers are there from 1 to ${2 * k - 1}? If $2k - 1 = ${2 * k - 1}$, then $k = ?$`,
    `Combien y a-t-il de nombres impairs de 1 à ${2 * k - 1} ? Si $2k - 1 = ${2 * k - 1}$, alors $k = ?$`,
  ),
  explain: t(
    `$${2 * k - 1} = 2k - 1$ gives $k = ${k}$ terms, and the picture says the sum of the first $k$ odd numbers is $k^2 = ${k}^2 = ${texNum(k * k)}$.`,
    `$${2 * k - 1} = 2k - 1$ donne $k = ${k}$ termes, et l’image dit que la somme des $k$ premiers nombres impairs vaut $k^2 = ${k}^2 = ${texNum(k * k)}$.`,
  ),
});

export const doublingSumQ = (k: number): QuestionStep => ({
  kind: 'number',
  body: t(`Compute $2 + 4 + 8 + 16 + \\dots + ${texNum(2 ** k)}$.`, `Calculez $2 + 4 + 8 + 16 + \\dots + ${texNum(2 ** k)}$.`),
  answer: 2 ** (k + 1) - 2,
  explain: t(
    `$${texNum(2 ** k)} = 2^{${k}}$, so the sum is $2^{${k + 1}} - 2 = ${texNum(2 ** (k + 1))} - 2 = ${texNum(2 ** (k + 1) - 2)}$. In general $\\sum_{i=1}^{k} 2^i = 2^{k+1} - 2$.`,
    `$${texNum(2 ** k)} = 2^{${k}}$, donc la somme vaut $2^{${k + 1}} - 2 = ${texNum(2 ** (k + 1))} - 2 = ${texNum(2 ** (k + 1) - 2)}$. En général $\\sum_{i=1}^{k} 2^i = 2^{k+1} - 2$.`,
  ),
});

export const rangeCompsQ = (n: number): QuestionStep => ({
  kind: 'number',
  body: t(
    `Each iteration makes 2 comparisons between elements. How many element comparisons for an array of $n = ${n}$ elements?`,
    `Chaque itération fait 2 comparaisons entre éléments. Combien de comparaisons d’éléments pour un tableau de $n = ${n}$ éléments ?`,
  ),
  answer: 2 * (n - 1),
  explain: t(
    `$n - 1 = ${n - 1}$ iterations × 2 comparisons $= 2(n-1) = ${2 * (n - 1)}$. That is $\\Theta(n)$ — and you will see later that $\\approx 1.5n$ comparisons are enough!`,
    `$n - 1 = ${n - 1}$ itérations × 2 comparaisons $= 2(n-1) = ${2 * (n - 1)}$. C’est $\\Theta(n)$ — et vous verrez plus tard qu’environ $1{,}5n$ comparaisons suffisent !`,
  ),
});

export const symmetricCompsQ = (n: number): QuestionStep => ({
  kind: 'number',
  body: t(
    `In the **worst case** (a symmetric matrix, so it never returns early), how many comparisons does R make for $n = ${n}$?`,
    `Dans le **pire cas** (une matrice symétrique, donc aucun arrêt anticipé), combien de comparaisons R fait-il pour $n = ${n}$ ?`,
  ),
  answer: (n * (n - 1)) / 2,
  hint: t('For $i = 0$ there are $n-1$ values of $j$, for $i = 1$ there are $n-2$…', 'Pour $i = 0$ il y a $n-1$ valeurs de $j$, pour $i = 1$ il y en a $n-2$…'),
  explain: t(
    `$\\sum_{i=0}^{n-2}(n-1-i) = (n-1) + \\dots + 1 = \\frac{n(n-1)}{2} = ${(n * (n - 1)) / 2}$. Worst-case cost: $\\Theta(n^2)$.`,
    `$\\sum_{i=0}^{n-2}(n-1-i) = (n-1) + \\dots + 1 = \\frac{n(n-1)}{2} = ${(n * (n - 1)) / 2}$. Coût dans le pire cas : $\\Theta(n^2)$.`,
  ),
});

export const addConstQ = (c: number, N: number): QuestionStep => ({
  kind: 'number',
  body: t(`With $x(n) = x(n-1) + ${c}$ and $x(1) = 0$, what is $x(${N})$?`, `Avec $x(n) = x(n-1) + ${c}$ et $x(1) = 0$, que vaut $x(${N})$ ?`),
  answer: c * (N - 1),
  explain: t(
    `$x(n) = ${c}(n-1)$, so $x(${N}) = ${c} \\times ${N - 1} = ${c * (N - 1)}$.`,
    `$x(n) = ${c}(n-1)$, donc $x(${N}) = ${c} \\times ${N - 1} = ${c * (N - 1)}$.`,
  ),
});

export const twoCallsQ = (n: number): QuestionStep => ({
  kind: 'number',
  body: t(
    `With the two-call version, how many calls are made in total for $n = ${n}$?`,
    `Avec la version à deux appels, combien d’appels sont faits en tout pour $n = ${n}$ ?`,
  ),
  answer: 2 ** (n + 1) - 1,
  explain: t(
    `$2^{${n}+1} - 1 = ${2 ** (n + 1) - 1}$ calls, and $A(n) = 2A(n-1) + 1$ gives $2^n - 1 = ${2 ** n - 1}$ additions.`,
    `$2^{${n}+1} - 1 = ${2 ** (n + 1) - 1}$ appels, et $A(n) = 2A(n-1) + 1$ donne $2^n - 1 = ${2 ** n - 1}$ additions.`,
  ),
});

/* ---------- lessons ---------- */

const growth: Lesson = {
  id: 'c1l1',
  title: t('How fast does it grow?', 'À quelle vitesse ça croît ?'),
  summary: t(
    'You can now compare how fast functions grow and pick the most precise asymptotic relation.',
    'Vous savez comparer la croissance de fonctions et choisir la relation asymptotique la plus précise.',
  ),
  steps: [
    {
      kind: 'read',
      title: t('Which one grows faster?', 'Laquelle croît le plus vite ?'),
      body: t(
        `When we analyse an algorithm we care about what happens when the input size $n$ becomes **large**. Constant factors and small terms stop mattering — only the *shape* of the growth does.

- $f \\in O(g)$: $f$ grows **no faster** than $g$ (up to a constant).
- $f \\in \\Omega(g)$: $f$ grows **at least as fast** as $g$.
- $f \\in \\Theta(g)$: both — they grow at the **same rate**.

A practical test: look at the ratio $f(n)/g(n)$ as $n \\to \\infty$. A positive constant means $\\Theta$; $0$ means $f$ is strictly smaller ($O$ only); $\\infty$ means strictly bigger ($\\Omega$ only).

Drag the slider and watch the ratio of $n^2$ and $n^2+1$.`,
        `Quand on analyse un algorithme, on s’intéresse à ce qui se passe quand la taille de l’entrée $n$ devient **grande**. Les facteurs constants et les petits termes ne comptent plus — seule la *forme* de la croissance compte.

- $f \\in O(g)$ : $f$ ne croît **pas plus vite** que $g$ (à une constante près).
- $f \\in \\Omega(g)$ : $f$ croît **au moins aussi vite** que $g$.
- $f \\in \\Theta(g)$ : les deux — elles croissent au **même rythme**.

Un test pratique : regardez le rapport $f(n)/g(n)$ quand $n \\to \\infty$. Une constante positive signifie $\\Theta$ ; $0$ signifie que $f$ est strictement plus petite ($O$ seulement) ; $\\infty$ qu’elle est strictement plus grande ($\\Omega$ seulement).

Faites glisser le curseur et observez le rapport entre $n^2$ et $n^2+1$.`,
      ),
      widget: () => <GrowthPlot fns={[{ tex: 'n^2', f: (n) => n * n }, { tex: 'n^2+1', f: (n) => n * n + 1 }]} nMax={10} maxRange={[3, 200]} />,
    },
    {
      kind: 'choice',
      body: t(
        'What is the most precise relation between $f_1(n) = n^2$ and $f_2(n) = n^2 + 1$?',
        'Quelle est la relation la plus précise entre $f_1(n) = n^2$ et $f_2(n) = n^2 + 1$ ?',
      ),
      options: RELATIONS,
      answer: 0,
      explain: t(
        'The ratio $n^2/(n^2+1) \\to 1$, a positive constant, so they grow at the same rate: $\\Theta$.',
        'Le rapport $n^2/(n^2+1) \\to 1$, une constante positive : elles croissent au même rythme, $\\Theta$.',
      ),
    },
    {
      kind: 'choice',
      body: t(
        'Now $f_1(n) = n^2$ and $f_2(n) = 3n^2 + 4n + 1$. Use the plot: the curves look far apart — but what does the **ratio** do?',
        'Maintenant $f_1(n) = n^2$ et $f_2(n) = 3n^2 + 4n + 1$. Servez-vous du graphique : les courbes semblent éloignées — mais que fait le **rapport** ?',
      ),
      widget: () => <GrowthPlot fns={[{ tex: 'n^2', f: (n) => n * n }, { tex: '3n^2+4n+1', f: (n) => 3 * n * n + 4 * n + 1 }]} nMax={20} />,
      options: RELATIONS,
      answer: 0,
      hint: t(
        'Drag $n$ to 200: the ratio settles near a constant. Which constant?',
        'Poussez $n$ jusqu’à 200 : le rapport se stabilise près d’une constante. Laquelle ?',
      ),
      explain: t(
        'The ratio tends to $1/3$ — a positive constant. A factor of 3 does not change the order: still $\\Theta(n^2)$.',
        'Le rapport tend vers $1/3$ — une constante positive. Un facteur 3 ne change pas l’ordre : toujours $\\Theta(n^2)$.',
      ),
    },
    {
      kind: 'choice',
      body: t(
        'Compare $f_1(n) = 10n^2$ with $f_2(n) = n^3$. At small $n$, $10n^2$ is bigger… does it stay that way?',
        'Comparez $f_1(n) = 10n^2$ et $f_2(n) = n^3$. Pour $n$ petit, $10n^2$ est plus grand… est-ce que ça dure ?',
      ),
      widget: () => <GrowthPlot fns={[{ tex: '10n^2', f: (n) => 10 * n * n }, { tex: 'n^3', f: (n) => n ** 3 }]} nMax={8} maxRange={[3, 60]} />,
      options: RELATIONS,
      answer: 1,
      explain: t(
        'The curves cross at $n = 10$; after that $n^3$ wins forever. $10n^2/n^3 = 10/n \\to 0$, so $10n^2 \\in O(n^3)$ but not $\\Theta(n^3)$.',
        'Les courbes se croisent en $n = 10$ ; ensuite $n^3$ l’emporte pour toujours. $10n^2/n^3 = 10/n \\to 0$, donc $10n^2 \\in O(n^3)$ mais pas $\\Theta(n^3)$.',
      ),
    },
    {
      kind: 'choice',
      body: t(
        'In general, take two positive polynomials of degrees $d_1$ and $d_2$ with $d_1 < d_2$. What is the relation?',
        'En général, prenons deux polynômes positifs de degrés $d_1$ et $d_2$ avec $d_1 < d_2$. Quelle est la relation ?',
      ),
      options: [...RELATIONS, t('It depends on the coefficients', 'Cela dépend des coefficients')],
      answer: 1,
      explain: t(
        'Only the leading term counts: $f_1 \\in \\Theta(n^{d_1})$, $f_2 \\in \\Theta(n^{d_2})$ and $n^{d_1}/n^{d_2} \\to 0$. Coefficients never change the order (equal degrees ⇒ $\\Theta$).',
        'Seul le terme dominant compte : $f_1 \\in \\Theta(n^{d_1})$, $f_2 \\in \\Theta(n^{d_2})$ et $n^{d_1}/n^{d_2} \\to 0$. Les coefficients ne changent jamais l’ordre (degrés égaux ⇒ $\\Theta$).',
      ),
    },
    {
      kind: 'choice',
      title: t('Simplify', 'Simplifier'),
      body: t(
        `To find a simple $\\Theta$-equivalent, **keep the dominant term and drop its constant**. With two size parameters $n$ and $m$, keep every term that could dominate — you can't compare $n$ and $m$!

Simplify $f(n,m) = 3n^2 + 4n + \\dfrac{1}{n} + m + nm$.`,
        `Pour trouver un équivalent $\\Theta$ simple, **gardez le terme dominant et enlevez sa constante**. Avec deux paramètres de taille $n$ et $m$, gardez tous les termes qui pourraient dominer — on ne peut pas comparer $n$ et $m$ !

Simplifiez $f(n,m) = 3n^2 + 4n + \\dfrac{1}{n} + m + nm$.`,
      ),
      options: ['$\\Theta(n^2)$', '$\\Theta(nm)$', '$\\Theta(n^2 + nm)$', '$\\Theta(n^2 + m)$'],
      answer: 2,
      hint: t(
        '$4n$ is dominated by $3n^2$, $1/n$ vanishes and $m$ is dominated by $nm$ (as $n \\geq 1$). Is $n^2$ bigger than $nm$?',
        '$4n$ est dominé par $3n^2$, $1/n$ disparaît et $m$ est dominé par $nm$ (car $n \\geq 1$). $n^2$ est-il plus grand que $nm$ ?',
      ),
      explain: t(
        '$4n \\le 4n^2$, $1/n \\to 0$ and $m \\le nm$. But $n^2$ vs $nm$ depends on whether $n > m$, so both survive: $\\Theta(n^2 + nm)$.',
        '$4n \\le 4n^2$, $1/n \\to 0$ et $m \\le nm$. Mais $n^2$ face à $nm$ dépend de si $n > m$, donc les deux restent : $\\Theta(n^2 + nm)$.',
      ),
    },
    {
      kind: 'read',
      title: t('What if the input is 4× bigger?', 'Et si l’entrée est 4 fois plus grande ?'),
      body: t(
        'A very concrete way to feel growth orders: multiply $n$ by 4 and see how much more work the function represents. Move the slider: for each function the factor stays the same (or grows), whatever $n$ is.',
        'Une façon très concrète de sentir les ordres de croissance : multipliez $n$ par 4 et voyez combien de travail en plus la fonction représente. Déplacez le curseur : pour chaque fonction, le facteur reste le même (ou augmente), quel que soit $n$.',
      ),
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
      body: t(
        'And for $f(n) = \\log_2 n$, what happens to $f$ when $n$ is quadrupled?',
        'Et pour $f(n) = \\log_2 n$, que devient $f$ quand $n$ est multiplié par 4 ?',
      ),
      options: t(
        ['It is multiplied by 4', 'It is multiplied by 2', 'It increases by 2', 'It does not change'],
        ['Elle est multipliée par 4', 'Elle est multipliée par 2', 'Elle augmente de 2', 'Elle ne change pas'],
      ),
      answer: 2,
      explain: t(
        '$\\log_2(4n) = \\log_2 4 + \\log_2 n = \\log_2 n + 2$. Logarithms turn multiplication into addition — that is why logarithmic algorithms scale so well. (For $2^n$: $2^{4n} = (2^n)^4$, the value gets raised to the 4th power!)',
        '$\\log_2(4n) = \\log_2 4 + \\log_2 n = \\log_2 n + 2$. Les logarithmes changent la multiplication en addition — c’est pourquoi les algorithmes logarithmiques tiennent si bien la charge. (Pour $2^n$ : $2^{4n} = (2^n)^4$, la valeur est élevée à la puissance 4 !)',
      ),
    },
    {
      kind: 'choice',
      body: t(
        'Compare $f(n) = \\log_2^2 n$ (that is, $(\\log_2 n)^2$) with $g(n) = \\log_2 n^2$.',
        'Comparez $f(n) = \\log_2^2 n$ (c’est-à-dire $(\\log_2 n)^2$) et $g(n) = \\log_2 n^2$.',
      ),
      widget: () => <GrowthPlot fns={[{ tex: '(\\log_2 n)^2', f: (n) => lg(n) ** 2 }, { tex: '\\log_2 n^2', f: (n) => lg(n * n) }]} nMax={20} maxRange={[5, 200]} />,
      options: t(
        ['$f$ grows slower than $g$', '$f$ and $g$ grow at the same rate', '$f$ grows faster than $g$'],
        ['$f$ croît moins vite que $g$', '$f$ et $g$ croissent au même rythme', '$f$ croît plus vite que $g$'],
      ),
      answer: 2,
      hint: t('Rewrite $\\log_2 n^2$ using a log rule.', 'Réécrivez $\\log_2 n^2$ avec une règle des logarithmes.'),
      explain: t(
        '$\\log_2 n^2 = 2\\log_2 n$, so $f/g = \\log_2 n / 2 \\to \\infty$: $f$ grows faster.',
        '$\\log_2 n^2 = 2\\log_2 n$, donc $f/g = \\log_2 n / 2 \\to \\infty$ : $f$ croît plus vite.',
      ),
    },
    {
      kind: 'choice',
      body: t(
        'Which pair grows at the **same** rate (up to a multiplicative constant)?',
        'Quelle paire croît au **même** rythme (à une constante multiplicative près) ?',
      ),
      options: t(
        ['$(n-1)!$ and $n!$', '$2^{n-1}$ and $2^n$', '$100n^2$ and $0.01n^3$', '$n+1$ and $2000n^2$'],
        ['$(n-1)!$ et $n!$', '$2^{n-1}$ et $2^n$', '$100n^2$ et $0{,}01n^3$', '$n+1$ et $2000n^2$'],
      ),
      answer: 1,
      explain: t(
        '$2^{n-1} = \\tfrac12 \\cdot 2^n$: a constant factor. But $n! = n\\cdot(n-1)!$ — the factor $n$ is *not* constant, so $(n-1)!$ grows strictly slower.',
        '$2^{n-1} = \\tfrac12 \\cdot 2^n$ : un facteur constant. Mais $n! = n\\cdot(n-1)!$ — le facteur $n$ n’est *pas* constant, donc $(n-1)!$ croît strictement moins vite.',
      ),
    },
    {
      kind: 'choice',
      body: t(
        'Which of these claims about $\\dfrac{n(n+1)}{2}$ is **false**?',
        'Laquelle de ces affirmations sur $\\dfrac{n(n+1)}{2}$ est **fausse** ?',
      ),
      options: ['$\\dfrac{n(n+1)}{2} \\in O(n^3)$', '$\\dfrac{n(n+1)}{2} \\in O(n^2)$', '$\\dfrac{n(n+1)}{2} \\in \\Theta(n^3)$', '$\\dfrac{n(n+1)}{2} \\in \\Omega(n)$'],
      answer: 2,
      explain: t(
        '$n(n+1)/2 \\approx n^2/2$ is $\\Theta(n^2)$. It is in $O(n^3)$ (grows no faster) and $\\Omega(n)$ (grows at least as fast), but **not** $\\Theta(n^3)$: $n^3$ is a strictly bigger order.',
        '$n(n+1)/2 \\approx n^2/2$ est $\\Theta(n^2)$. Elle est dans $O(n^3)$ (ne croît pas plus vite) et dans $\\Omega(n)$ (croît au moins aussi vite), mais **pas** dans $\\Theta(n^3)$ : $n^3$ est un ordre strictement plus grand.',
      ),
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
  title: t('How many times does it run?', 'Combien de fois ça s’exécute ?'),
  summary: t(
    'You can estimate running time by counting how often the innermost instruction runs.',
    'Vous savez estimer le temps d’exécution en comptant combien de fois l’instruction la plus intérieure s’exécute.',
  ),
  steps: [
    {
      kind: 'read',
      title: t('Time = instructions executed', 'Temps = instructions exécutées'),
      body: t(
        `To estimate the running time of an algorithm we count how many times its **basic operation** — usually the innermost instruction — is executed, as a function of the input size $N$.

Step through this simple loop. Watch the highlighted line and the counter.`,
        `Pour estimer le temps d’exécution d’un algorithme, on compte combien de fois son **opération de base** — en général l’instruction la plus intérieure — est exécutée, en fonction de la taille de l’entrée $N$.

Avancez pas à pas dans cette boucle simple. Observez la ligne surlignée et le compteur.`,
      ),
      widget: () => <TraceRunner program={loopA} nRange={[1, 12]} initialN={4} opName={t('increment', 'incrémentation')} />,
    },
    {
      kind: 'task',
      title: t('Nested loops', 'Boucles imbriquées'),
      body: t(
        'Program **Loop B** has a loop inside a loop. Pick it, then press **Play** (or **Step**) to run it to the end. Then study the doubling table: what happens to the count every time $N$ doubles?',
        'Le programme **Boucle B** a une boucle dans une boucle. Choisissez-le, puis appuyez sur **Lecture** (ou **Pas**) pour l’exécuter jusqu’au bout. Étudiez ensuite le tableau des doublements : que devient le compte chaque fois que $N$ double ?',
      ),
      widget: ({ onSolved }) => <LoopLab programs={[loopC]} onSolved={onSolved} />,
      success: t(
        'For each of the $N$ values of `I`, the inner loop runs $N$ times: $N \\times N = N^2$ executions. Doubling $N$ multiplies the work by 4.',
        'Pour chacune des $N$ valeurs de `I`, la boucle intérieure tourne $N$ fois : $N \\times N = N^2$ exécutions. Doubler $N$ multiplie le travail par 4.',
      ),
    },
    {
      kind: 'choice',
      body: t(
        'So what is the order of the running time of program Loop B?',
        'Quel est donc l’ordre du temps d’exécution du programme Boucle B ?',
      ),
      options: ['$\\Theta(N)$', '$\\Theta(N \\log N)$', '$\\Theta(N^2)$', '$\\Theta(2^N)$'],
      answer: 2,
      explain: t(
        'The doubling ratio is exactly 4 = $2^2$: quadratic, $\\Theta(N^2)$.',
        'Le rapport de doublement vaut exactement 4 = $2^2$ : quadratique, $\\Theta(N^2)$.',
      ),
    },
    { kind: 'generated', make: (r) => triangleQ(r.int(4, 12)) },
    {
      kind: 'choice',
      title: t('Doubling the counter (Loop D)', 'Doubler le compteur (boucle D)'),
      body: t(
        'In **Loop D**, `I` is **doubled** at each iteration instead of incremented. What is the order of the running time?',
        'Dans la **Boucle D**, `I` est **doublé** à chaque itération au lieu d’être incrémenté. Quel est l’ordre du temps d’exécution ?',
      ),
      widget: () => <LoopLab programs={[loopE]} />,
      options: ['$\\Theta(1)$', '$\\Theta(\\log N)$', '$\\Theta(\\sqrt N)$', '$\\Theta(N)$'],
      answer: 1,
      explain: t(
        '`I` takes the values $1, 2, 4, \\dots, 2^k \\le N$: about $\\log_2 N + 1$ iterations. Doubling $N$ adds just one iteration — ratio → 1.',
        '`I` prend les valeurs $1, 2, 4, \\dots, 2^k \\le N$ : environ $\\log_2 N + 1$ itérations. Doubler $N$ n’ajoute qu’une itération — rapport → 1.',
      ),
    },
    {
      kind: 'choice',
      title: t('A logarithm inside a loop (Loop E)', 'Un logarithme dans une boucle (boucle E)'),
      body: t(
        'Program **Loop E**: for each `I` from 1 to N, `J` doubles until it reaches `I`. What is the order?',
        'Programme **Boucle E** : pour chaque `I` de 1 à N, `J` double jusqu’à atteindre `I`. Quel est l’ordre ?',
      ),
      widget: () => <LoopLab programs={[loopG]} />,
      options: ['$\\Theta(N)$', '$\\Theta(N \\log N)$', '$\\Theta(N^2)$', '$\\Theta(\\log^2 N)$'],
      answer: 1,
      explain: t(
        'The inner loop runs about $\\lceil\\log_2 I\\rceil$ times, and $\\sum_{I=1}^{N} \\log_2 I = \\log_2 N! \\in \\Theta(N\\log N)$. The doubling ratio is slightly above 2.',
        'La boucle intérieure tourne environ $\\lceil\\log_2 I\\rceil$ fois, et $\\sum_{I=1}^{N} \\log_2 I = \\log_2 N! \\in \\Theta(N\\log N)$. Le rapport de doublement est un peu au-dessus de 2.',
      ),
    },
    {
      kind: 'choice',
      title: t('The trap (Loop F)', 'Le piège (boucle F)'),
      body: t(
        'Last one: in **Loop F** the *outer* counter doubles, and the inner loop runs `I` times. It looks nested… what is the order?',
        'Dernière : dans la **Boucle F**, c’est le compteur *extérieur* qui double, et la boucle intérieure tourne `I` fois. Ça ressemble à des boucles imbriquées… quel est l’ordre ?',
      ),
      widget: () => <LoopLab programs={[loopH]} />,
      options: ['$\\Theta(\\log N)$', '$\\Theta(N)$', '$\\Theta(N \\log N)$', '$\\Theta(N^2)$'],
      answer: 1,
      hint: t(
        'Add up the inner counts: $1 + 2 + 4 + 8 + \\dots$ up to $N$.',
        'Additionnez les comptes intérieurs : $1 + 2 + 4 + 8 + \\dots$ jusqu’à $N$.',
      ),
      explain: t(
        'The inner loop runs $1 + 2 + 4 + \\dots + 2^k$ times with $2^k \\le N$, which is $2^{k+1} - 1 < 2N$. Nested loops are **not** always quadratic — always count!',
        'La boucle intérieure tourne $1 + 2 + 4 + \\dots + 2^k$ fois avec $2^k \\le N$, soit $2^{k+1} - 1 < 2N$. Des boucles imbriquées ne sont **pas** toujours quadratiques — comptez toujours !',
      ),
    },
  ],
};

const sums: Lesson = {
  id: 'c1l3',
  title: t('Adding up long series', 'Additionner de longues séries'),
  summary: t(
    'You can compute the arithmetic and geometric sums that appear in loop analysis.',
    'Vous savez calculer les sommes arithmétiques et géométriques qui apparaissent dans l’analyse des boucles.',
  ),
  steps: [
    {
      kind: 'read',
      title: t('Odd numbers make squares', 'Les nombres impairs font des carrés'),
      body: t(
        'Loop counts are sums, so we need to compute sums quickly. A picture first: stack the odd numbers $1, 3, 5, \\dots$ as L-shaped layers. Move the slider.',
        'Les comptes de boucles sont des sommes : il faut donc savoir les calculer vite. D’abord une image : empilez les nombres impairs $1, 3, 5, \\dots$ en couches en forme de L. Déplacez le curseur.',
      ),
      widget: () => <OddSquares />,
    },
    { kind: 'generated', make: (r) => oddSumQ(r.int(20, 600)) },
    {
      kind: 'read',
      title: t('Doubling sums', 'Les sommes qui doublent'),
      body: t(
        'Geometric sums behave very differently: each term is as big as **all the previous ones together** (plus the first). Look at how the bars fill the next power of two.',
        'Les sommes géométriques se comportent très différemment : chaque terme est aussi grand que **tous les précédents réunis** (plus le premier). Regardez comment les barres remplissent la puissance de deux suivante.',
      ),
      widget: () => <DoublingBars />,
    },
    { kind: 'generated', make: (r) => doublingSumQ(r.int(5, 14)) },
    {
      kind: 'choice',
      body: t('Compute $\\displaystyle\\sum_{i=3}^{n+1} 1$.', 'Calculez $\\displaystyle\\sum_{i=3}^{n+1} 1$.'),
      options: ['$n+1$', '$n-1$', '$n-2$', '$n+3$'],
      answer: 1,
      hint: t(
        'Summing 1 just counts the terms. From 3 to $n+1$ there are (last − first + 1) terms.',
        'Additionner des 1 revient à compter les termes. De 3 à $n+1$ il y a (dernier − premier + 1) termes.',
      ),
      explain: t('Number of terms $= (n+1) - 3 + 1 = n - 1$.', 'Nombre de termes $= (n+1) - 3 + 1 = n - 1$.'),
    },
    {
      kind: 'choice',
      body: t('Compute $\\displaystyle\\sum_{i=3}^{n+1} i$.', 'Calculez $\\displaystyle\\sum_{i=3}^{n+1} i$.'),
      options: ['$\\dfrac{(n+1)(n+2)}{2}$', '$\\dfrac{(n+1)(n+2)}{2} - 3$', '$\\dfrac{n(n+1)}{2} - 3$', '$\\dfrac{(n-1)(n+4)}{2} + 1$'],
      answer: 1,
      hint: t(
        'Use $\\sum_{i=1}^{m} i = \\frac{m(m+1)}{2}$ with $m = n+1$, then remove the terms $i = 1$ and $i = 2$.',
        'Utilisez $\\sum_{i=1}^{m} i = \\frac{m(m+1)}{2}$ avec $m = n+1$, puis retirez les termes $i = 1$ et $i = 2$.',
      ),
      explain: t(
        '$\\sum_{i=1}^{n+1} i = \\frac{(n+1)(n+2)}{2}$, minus $1 + 2 = 3$. (It also equals $\\frac{(n-1)(n+4)}{2}$ — expand to check — but not option D.)',
        '$\\sum_{i=1}^{n+1} i = \\frac{(n+1)(n+2)}{2}$, moins $1 + 2 = 3$. (Cela vaut aussi $\\frac{(n-1)(n+4)}{2}$ — développez pour vérifier — mais pas l’option D.)',
      ),
    },
    {
      kind: 'choice',
      body: t(
        'Compute $\\displaystyle\\sum_{i=0}^{n-1} i(i+1)$. Tip: try $n = 2$ and $n = 3$ on each option.',
        'Calculez $\\displaystyle\\sum_{i=0}^{n-1} i(i+1)$. Astuce : essayez $n = 2$ et $n = 3$ sur chaque option.',
      ),
      options: ['$\\dfrac{n(n+1)}{2}$', '$\\dfrac{(n-1)n(n+1)}{3}$', '$\\dfrac{n^2(n+1)}{2}$', '$\\dfrac{n(n+1)(2n+1)}{6}$'],
      answer: 1,
      explain: t(
        '$\\sum i^2 + \\sum i = \\frac{(n-1)n(2n-1)}{6} + \\frac{(n-1)n}{2} = \\frac{(n-1)n(n+1)}{3}$. Check: $n=3$ gives $0 + 2 + 6 = 8 = \\frac{2\\cdot3\\cdot4}{3}$. ✓',
        '$\\sum i^2 + \\sum i = \\frac{(n-1)n(2n-1)}{6} + \\frac{(n-1)n}{2} = \\frac{(n-1)n(n+1)}{3}$. Vérification : $n=3$ donne $0 + 2 + 6 = 8 = \\frac{2\\cdot3\\cdot4}{3}$. ✓',
      ),
    },
    {
      kind: 'choice',
      body: t('Compute $\\displaystyle\\sum_{j=1}^{n} 3^{j+1}$.', 'Calculez $\\displaystyle\\sum_{j=1}^{n} 3^{j+1}$.'),
      options: ['$3^{n+1} - 1$', '$\\dfrac{3^{n+2} - 9}{2}$', '$\\dfrac{3^{n+1} - 3}{2}$', '$9 \\cdot 3^{n}$'],
      answer: 1,
      hint: t(
        'A geometric sum: $\\sum_{j=0}^{k} r^j = \\dfrac{r^{k+1} - 1}{r - 1}$. Factor out $3^2 = 9$ first.',
        'Une somme géométrique : $\\sum_{j=0}^{k} r^j = \\dfrac{r^{k+1} - 1}{r - 1}$. Mettez d’abord $3^2 = 9$ en facteur.',
      ),
      explain: t(
        '$\\sum_{j=1}^{n} 3^{j+1} = 9\\sum_{j=0}^{n-1} 3^j = 9\\cdot\\frac{3^n - 1}{2} = \\frac{3^{n+2} - 9}{2}$. Check $n=1$: $9$. ✓',
        '$\\sum_{j=1}^{n} 3^{j+1} = 9\\sum_{j=0}^{n-1} 3^j = 9\\cdot\\frac{3^n - 1}{2} = \\frac{3^{n+2} - 9}{2}$. Vérification pour $n=1$ : $9$. ✓',
      ),
    },
    {
      kind: 'choice',
      body: t('Compute $\\displaystyle\\sum_{i=1}^{n}\\sum_{j=1}^{n} ij$.', 'Calculez $\\displaystyle\\sum_{i=1}^{n}\\sum_{j=1}^{n} ij$.'),
      options: ['$\\dfrac{n^2(n+1)}{2}$', '$\\left(\\dfrac{n(n+1)}{2}\\right)^2$', '$\\dfrac{n(n+1)(2n+1)}{6}$', '$n^2$'],
      answer: 1,
      explain: t(
        'The inner sum is $i\\sum_j j = i\\frac{n(n+1)}{2}$; summing over $i$ gives $\\frac{n(n+1)}{2}\\cdot\\frac{n(n+1)}{2}$.',
        'La somme intérieure vaut $i\\sum_j j = i\\frac{n(n+1)}{2}$ ; en sommant sur $i$ on obtient $\\frac{n(n+1)}{2}\\cdot\\frac{n(n+1)}{2}$.',
      ),
    },
  ],
};

const analyse: Lesson = {
  id: 'c1l4',
  title: t('Reading unknown code', 'Lire du code inconnu'),
  summary: t(
    'You can find what an algorithm computes, its basic operation, its cost class — and improve it.',
    'Vous savez trouver ce que calcule un algorithme, son opération de base, sa classe de coût — et l’améliorer.',
  ),
  steps: [
    {
      kind: 'read',
      title: t('Algorithm P', 'Algorithme P'),
      body: t(
        `Analysing an algorithm always follows the same recipe:

- **What** does it compute?
- What is its **basic operation**?
- **How many times** is it executed?
- What is its **cost class**? Can we do better?

Run algorithm P for a few values of $n$ and watch $S$.`,
        `Analyser un algorithme suit toujours la même recette :

- **Que** calcule-t-il ?
- Quelle est son **opération de base** ?
- **Combien de fois** est-elle exécutée ?
- Quelle est sa **classe de coût** ? Peut-on faire mieux ?

Lancez l’algorithme P pour quelques valeurs de $n$ et observez $S$.`,
      ),
      widget: () => <TraceRunner program={algoP} nRange={[1, 10]} initialN={4} inputName="n" opName={t('multiplication', 'multiplication')} />,
    },
    {
      kind: 'choice',
      body: t('What does P(n) compute?', 'Que calcule P(n) ?'),
      options: ['$1 + 2 + \\dots + n$', '$1^2 + 2^2 + \\dots + n^2$', '$n^2$', '$n!$'],
      answer: 1,
      explain: t(
        'Each iteration adds $i \\times i$: $S = \\sum_{i=1}^{n} i^2$ (for $n=4$: $1+4+9+16 = 30$).',
        'Chaque itération ajoute $i \\times i$ : $S = \\sum_{i=1}^{n} i^2$ (pour $n=4$ : $1+4+9+16 = 30$).',
      ),
    },
    {
      kind: 'choice',
      body: t('Which is the best choice of **basic operation**?', 'Quel est le meilleur choix d’**opération de base** ?'),
      options: t(
        ['The assignment `S ← 0`', 'The multiplication `i × i`', 'The `return`', 'Reading `n`'],
        ['L’affectation `S ← 0`', 'La multiplication `i × i`', 'Le `return`', 'La lecture de `n`'],
      ),
      answer: 1,
      explain: t(
        'The basic operation is the most costly one in the innermost loop: the multiplication (the addition is a fine choice too — they run equally often).',
        'L’opération de base est la plus coûteuse de la boucle la plus intérieure : la multiplication (l’addition est aussi un bon choix — elles s’exécutent aussi souvent l’une que l’autre).',
      ),
    },
    {
      kind: 'choice',
      body: t('It runs $n$ times, so P is $\\Theta(n)$. Can we do better?', 'Elle s’exécute $n$ fois, donc P est en $\\Theta(n)$. Peut-on faire mieux ?'),
      options: t(
        [
          'No, we have to look at every $i$',
          'Yes: $S = \\dfrac{n(n+1)(2n+1)}{6}$, a constant number of operations — $\\Theta(1)$',
          'Yes, with a binary search — $\\Theta(\\log n)$',
        ],
        [
          'Non, il faut regarder chaque $i$',
          'Oui : $S = \\dfrac{n(n+1)(2n+1)}{6}$, un nombre constant d’opérations — $\\Theta(1)$',
          'Oui, avec une recherche dichotomique — $\\Theta(\\log n)$',
        ],
      ),
      answer: 1,
      explain: t(
        'A closed formula replaces the loop by a handful of arithmetic operations, whatever $n$ is. (Strictly, with huge $n$ the cost of arithmetic on big numbers grows too, but in this model it is $\\Theta(1)$.) Note that P simply applies the definition, one term at a time.',
        'Une formule close remplace la boucle par quelques opérations arithmétiques, quel que soit $n$. (À strictement parler, pour des $n$ énormes le coût de l’arithmétique sur de grands nombres augmente aussi, mais dans ce modèle c’est $\\Theta(1)$.) Remarquez que P applique simplement la définition, un terme à la fois.',
      ),
    },
    {
      kind: 'read',
      title: t('Algorithm Q', 'Algorithme Q'),
      body: t(
        'Same recipe for algorithm Q, which runs on an array of numbers. Step through and watch `minval` and `maxval`.',
        'Même recette pour l’algorithme Q, qui travaille sur un tableau de nombres. Avancez pas à pas et observez `minval` et `maxval`.',
      ),
      widget: () => <TraceRunner program={algoQ} nRange={[2, 12]} initialN={6} inputName="n" opName={t('comparison A[i] < minval', 'comparaison A[i] < minval')} />,
    },
    {
      kind: 'choice',
      body: t('What does Q return?', 'Que renvoie Q ?'),
      options: t(
        ['The largest element', 'The sum of the elements', 'The range: largest minus smallest element', 'The number of distinct elements'],
        ['Le plus grand élément', 'La somme des éléments', 'L’étendue : le plus grand élément moins le plus petit', 'Le nombre d’éléments distincts'],
      ),
      answer: 2,
      explain: t(
        'It tracks both the minimum and the maximum, then returns $\\max - \\min$: the **range** of the array.',
        'Il suit à la fois le minimum et le maximum, puis renvoie $\\max - \\min$ : l’**étendue** du tableau.',
      ),
    },
    { kind: 'generated', make: (r) => rangeCompsQ(r.int(5, 40)) },
    {
      kind: 'read',
      title: t('Algorithm R', 'Algorithme R'),
      body: t('The third algorithm works on an $n \\times n$ matrix.', 'Le troisième algorithme travaille sur une matrice $n \\times n$.'),
      widget: () => (
        <CodeBlock
          title={t('Algorithm R(A[0..n−1, 0..n−1])', 'Algorithme R(A[0..n−1, 0..n−1])')}
          lines={['for i ← 0 to n − 2 do', '    for j ← i + 1 to n − 1 do', '        if A[i, j] ≠ A[j, i]', '            return false', 'return true']}
        />
      ),
    },
    {
      kind: 'choice',
      body: t('What does R check?', 'Que vérifie R ?'),
      options: t(
        ['That the matrix is diagonal', 'That the matrix is symmetric', 'That all elements are distinct', 'That the matrix is upper triangular'],
        ['Que la matrice est diagonale', 'Que la matrice est symétrique', 'Que tous les éléments sont distincts', 'Que la matrice est triangulaire supérieure'],
      ),
      answer: 1,
      explain: t(
        'It compares every element above the diagonal with its mirror $A[j,i]$: it returns true iff the matrix is **symmetric**.',
        'Il compare chaque élément au-dessus de la diagonale avec son symétrique $A[j,i]$ : il renvoie vrai si et seulement si la matrice est **symétrique**.',
      ),
    },
    { kind: 'generated', make: (r) => symmetricCompsQ(r.int(4, 30)) },
  ],
};

const recurrences: Lesson = {
  id: 'c1l5',
  title: t('Functions that call themselves', 'Des fonctions qui s’appellent elles-mêmes'),
  summary: t(
    'You can set up a recurrence for a recursive algorithm and solve it by unrolling.',
    'Vous savez poser une récurrence pour un algorithme récursif et la résoudre en la déroulant.',
  ),
  steps: [
    {
      kind: 'read',
      title: t('Unrolling a recurrence', 'Dérouler une récurrence'),
      body: t(
        `A recursive algorithm's cost is naturally described by a **recurrence**. To solve one, substitute it into itself until a pattern appears (*backward substitution*):

$$x(n) = x(n-1) + 5 = x(n-2) + 2\\cdot5 = \\dots = x(n-i) + 5i$$

Stop when you reach the base case: $i = n-1$ gives $x(1) + 5(n-1)$.

Check guesses against the real values below.`,
        `Le coût d’un algorithme récursif se décrit naturellement par une **récurrence**. Pour en résoudre une, on la substitue en elle-même jusqu’à voir apparaître un motif (*substitution à rebours*) :

$$x(n) = x(n-1) + 5 = x(n-2) + 2\\cdot5 = \\dots = x(n-i) + 5i$$

On s’arrête en atteignant le cas de base : $i = n-1$ donne $x(1) + 5(n-1)$.

Comparez vos hypothèses aux vraies valeurs ci-dessous.`,
      ),
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
      body: t(
        'Solve $x(n) = 3x(n-1)$ for $n > 1$, $x(1) = 4$. Use the checker.',
        'Résolvez $x(n) = 3x(n-1)$ pour $n > 1$, $x(1) = 4$. Utilisez le vérificateur.',
      ),
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
      explain: t(
        'Unrolling: $x(n) = 3x(n-1) = 3^2x(n-2) = \\dots = 3^{n-1}x(1) = 4\\cdot3^{n-1}$.',
        'En déroulant : $x(n) = 3x(n-1) = 3^2x(n-2) = \\dots = 3^{n-1}x(1) = 4\\cdot3^{n-1}$.',
      ),
    },
    {
      kind: 'choice',
      body: t('Solve $x(n) = x(n-1) + n$ for $n > 0$, $x(0) = 0$.', 'Résolvez $x(n) = x(n-1) + n$ pour $n > 0$, $x(0) = 0$.'),
      options: ['$x(n) = n^2$', '$x(n) = \\dfrac{n(n+1)}{2}$', '$x(n) = 2^n - 1$', '$x(n) = n$'],
      answer: 1,
      explain: t(
        'Unrolling gives $x(n) = n + (n-1) + \\dots + 1 + x(0) = \\frac{n(n+1)}{2}$.',
        'En déroulant, on obtient $x(n) = n + (n-1) + \\dots + 1 + x(0) = \\frac{n(n+1)}{2}$.',
      ),
    },
    {
      kind: 'choice',
      body: t(
        'Solve $x(n) = x(n/2) + n$ for $n > 1$, $x(1) = 1$, with $n = 2^k$.',
        'Résolvez $x(n) = x(n/2) + n$ pour $n > 1$, $x(1) = 1$, avec $n = 2^k$.',
      ),
      widget: () => (
        <RecurrenceCheck
          start={0}
          rec={{
            tex: t(
              'x(2^k) = x(2^{k-1}) + 2^k,\\quad x(1)=1 \\qquad (\\text{columns are } k)',
              'x(2^k) = x(2^{k-1}) + 2^k,\\quad x(1)=1 \\qquad (\\text{les colonnes sont } k)',
            ),
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
      explain: t(
        '$x(2^k) = 2^k + 2^{k-1} + \\dots + 2^1 + x(1) = 2^{k+1} - 2 + 1 = 2n - 1$. Halving sizes add up to a geometric series: linear overall.',
        '$x(2^k) = 2^k + 2^{k-1} + \\dots + 2^1 + x(1) = 2^{k+1} - 2 + 1 = 2n - 1$. Des tailles divisées par deux forment une série géométrique : linéaire au total.',
      ),
    },
    {
      kind: 'read',
      title: t('Algorithm T', 'Algorithme T'),
      body: t(
        'Here is a recursive algorithm. Its values satisfy $D(n) = D(n-1) + 2n - 1$, $D(1) = 1$.',
        'Voici un algorithme récursif. Ses valeurs vérifient $D(n) = D(n-1) + 2n - 1$, $D(1) = 1$.',
      ),
      widget: () => (
        <div className="space-y-4">
          <CodeBlock title={t('Algorithm T(n)', 'Algorithme T(n)')} lines={['if n = 1 return 1', 'else return T(n − 1) + 2 × n − 1']} />
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
      body: t(
        'T computes $n^2$ (the sum of the first $n$ odd numbers — remember the squares!). How many **multiplications** $M(n)$ does it perform?',
        'T calcule $n^2$ (la somme des $n$ premiers nombres impairs — souvenez-vous des carrés !). Combien de **multiplications** $M(n)$ effectue-t-il ?',
      ),
      options: t(
        ['$M(n) = M(n-1) + 1,\\ M(1) = 0$, so $M(n) = n - 1$', '$M(n) = 2M(n-1)$, so $M(n) = 2^{n-1}$', '$M(n) = n^2$', '$M(n) = M(n-1) + n$, so $M(n) = \\frac{n(n+1)}{2}$'],
        ['$M(n) = M(n-1) + 1,\\ M(1) = 0$, donc $M(n) = n - 1$', '$M(n) = 2M(n-1)$, donc $M(n) = 2^{n-1}$', '$M(n) = n^2$', '$M(n) = M(n-1) + n$, donc $M(n) = \\frac{n(n+1)}{2}$'],
      ),
      answer: 0,
      explain: t(
        'One multiplication (`2 × n`) per call except the base case: $M(n) = M(n-1) + 1$ with $M(1) = 0$, so $M(n) = n - 1$. (Same idea for $n!$ computed recursively: $n$ calls.)',
        'Une multiplication (`2 × n`) par appel, sauf au cas de base : $M(n) = M(n-1) + 1$ avec $M(1) = 0$, donc $M(n) = n - 1$. (Même idée pour $n!$ calculée récursivement : $n$ appels.)',
      ),
    },
    {
      kind: 'task',
      title: t('Computing 2ⁿ recursively', 'Calculer 2ⁿ récursivement'),
      body: t(
        `Compute $2^n$ recursively with $2^n = 2^{n-1} + 2^{n-1}$, calling **Pow2(n−1) twice**. Each node of the tree below is one call. Push $n$ up to 4 and watch the tree.`,
        `Calculez $2^n$ récursivement avec $2^n = 2^{n-1} + 2^{n-1}$, en appelant **Pow2(n−1) deux fois**. Chaque nœud de l’arbre ci-dessous est un appel. Poussez $n$ jusqu’à 4 et regardez l’arbre.`,
      ),
      widget: ({ onSolved }) => <PowerCallTree onSolved={onSolved} />,
      success: t(
        'The tree doubles at each level: $1 + 2 + 4 + \\dots + 2^n = 2^{n+1} - 1$ calls.',
        'L’arbre double à chaque niveau : $1 + 2 + 4 + \\dots + 2^n = 2^{n+1} - 1$ appels.',
      ),
    },
    { kind: 'generated', make: (r) => twoCallsQ(r.int(3, 8)) },
    {
      kind: 'choice',
      body: t('Is this a good algorithm for computing $2^n$?', 'Est-ce un bon algorithme pour calculer $2^n$ ?'),
      options: t(
        [
          'Yes: recursion is always efficient',
          'No: it recomputes the same value again and again — $\\Theta(2^n)$ work where storing $t = $ Pow2(n−1) once gives $\\Theta(n)$',
          'Yes, because each call does only one addition',
        ],
        [
          'Oui : la récursivité est toujours efficace',
          'Non : il recalcule la même valeur encore et encore — un travail en $\\Theta(2^n)$, alors que stocker $t = $ Pow2(n−1) une seule fois donne $\\Theta(n)$',
          'Oui, car chaque appel ne fait qu’une addition',
        ],
      ),
      answer: 1,
      explain: t(
        'Click the second button in the widget: computing the sub-result once turns the tree into a chain of $n+1$ calls. Avoiding repeated work is the seed of dynamic programming.',
        'Cliquez sur le second bouton du widget : calculer le sous-résultat une seule fois change l’arbre en une chaîne de $n+1$ appels. Éviter le travail répété est le germe de la programmation dynamique.',
      ),
    },
  ],
};

const rabbits: Lesson = {
  id: 'c1l6',
  title: t('A growing population', 'Une population qui grandit'),
  summary: t(
    'You modelled a growth process with a recurrence and met the Fibonacci numbers.',
    'Vous avez modélisé une croissance par une récurrence et rencontré les nombres de Fibonacci.',
  ),
  steps: [
    {
      kind: 'read',
      title: t('A famous puzzle', 'Un casse-tête célèbre'),
      body: t(
        `A man places one pair of **newborn** rabbits in an enclosure. Rabbit pairs are not fertile during their first month, but at the end of their **second** month — and every month after — each pair produces a new pair.

How many pairs will there be after one year?`,
        `Un homme place un couple de lapins **nouveau-nés** dans un enclos. Les couples ne sont pas féconds pendant leur premier mois, mais à la fin de leur **deuxième** mois — et chaque mois ensuite — chaque couple donne naissance à un nouveau couple.

Combien de couples y aura-t-il au bout d’un an ?`,
      ),
    },
    {
      kind: 'task',
      body: t(
        'Simulate it! Move month by month and watch which pairs are fertile. Go all the way to month 12.',
        'Simulez-le ! Avancez mois par mois et observez quels couples sont féconds. Allez jusqu’au mois 12.',
      ),
      widget: ({ onSolved }) => <Rabbits onSolved={onSolved} />,
      success: t(
        'Every fertile pair produces one new pair per month, so births each month equal the number of pairs that existed two months earlier.',
        'Chaque couple fécond donne un nouveau couple par mois : les naissances de chaque mois égalent donc le nombre de couples qui existaient deux mois plus tôt.',
      ),
    },
    {
      kind: 'number',
      body: t('How many pairs are there at the end of month 12?', 'Combien de couples y a-t-il à la fin du mois 12 ?'),
      answer: 233,
      explain: t(
        'The counts go 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, **233**.',
        'Les nombres sont 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, **233**.',
      ),
    },
    {
      kind: 'choice',
      body: t(
        'Which recurrence describes $P(m)$, the number of pairs at month $m$?',
        'Quelle récurrence décrit $P(m)$, le nombre de couples au mois $m$ ?',
      ),
      options: ['$P(m) = 2P(m-1)$', '$P(m) = P(m-1) + P(m-2)$', '$P(m) = P(m-1) + m$', '$P(m) = P(m-1) + 2$'],
      answer: 1,
      explain: t(
        'Pairs this month = pairs last month (nobody dies) + newborns, and newborns = pairs that are at least two months old = $P(m-2)$.',
        'Couples ce mois-ci = couples du mois dernier (personne ne meurt) + nouveau-nés, et nouveau-nés = couples âgés d’au moins deux mois = $P(m-2)$.',
      ),
    },
    {
      kind: 'choice',
      body: t('How fast does $P(m)$ grow?', 'À quelle vitesse $P(m)$ croît-il ?'),
      options: t(
        ['Linearly', 'Quadratically', 'Exponentially, roughly like $1.618^m$', 'Like $2^m$ exactly'],
        ['Linéairement', 'Quadratiquement', 'Exponentiellement, à peu près comme $1{,}618^m$', 'Exactement comme $2^m$'],
      ),
      answer: 2,
      explain: t(
        'The ratio $P(m)/P(m-1)$ tends to the golden ratio $\\varphi = \\frac{1+\\sqrt5}{2} \\approx 1.618$, so $P(m) \\in \\Theta(\\varphi^m)$ — exponential, but slower than $2^m$.',
        'Le rapport $P(m)/P(m-1)$ tend vers le nombre d’or $\\varphi = \\frac{1+\\sqrt5}{2} \\approx 1{,}618$, donc $P(m) \\in \\Theta(\\varphi^m)$ — exponentiel, mais plus lent que $2^m$.',
      ),
    },
  ],
};

export const ch1Lessons = [growth, loops, sums, analyse, recurrences, rabbits];
