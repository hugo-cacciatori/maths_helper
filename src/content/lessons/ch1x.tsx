import { t } from '../../lib/i18n';
import type { Lesson, QuestionStep } from '../../lib/types';
import { CallChain, CelebrityFinder, GrillSim, type ChainSpec } from '../../widgets/cost-extra';
import { CodeBlock } from '../../widgets/kit';

export const cubesSpec: ChainSpec = {
  label: (k) => `S(${k})`,
  base: 1,
  baseValue: 1,
  combine: (k, sub) => ({
    value: sub + k ** 3,
    ops: 2,
    note: t(
      `S(${k}) = S(${k - 1}) + ${k}×${k}×${k} = ${sub} + ${k ** 3} = ${sub + k ** 3} (2 multiplications).`,
      `S(${k}) = S(${k - 1}) + ${k}×${k}×${k} = ${sub} + ${k ** 3} = ${sub + k ** 3} (2 multiplications).`,
    ),
  }),
};

export const MIN_DATA = [7, 3, 9, 4, 1, 8, 6];
export const minSpec: ChainSpec = {
  label: (k) => `Low(${k})`,
  base: 1,
  baseValue: MIN_DATA[0],
  combine: (k, sub) => ({
    value: Math.min(sub, MIN_DATA[k - 1]),
    ops: 1,
    note: t(
      `Low(${k}) compares Low(${k - 1}) = ${sub} with the next value ${MIN_DATA[k - 1]} → ${Math.min(sub, MIN_DATA[k - 1])}.`,
      `Low(${k}) compare Low(${k - 1}) = ${sub} à la valeur suivante ${MIN_DATA[k - 1]} → ${Math.min(sub, MIN_DATA[k - 1])}.`,
    ),
  }),
};

export const cubeMultsQ = (n: number): QuestionStep => ({
  kind: 'number',
  body: t(`Unroll it: how many multiplications does $S(${n})$ make?`, `Déroulez-la : combien de multiplications $S(${n})$ fait-il ?`),
  answer: 2 * (n - 1),
  explain: t(`$M(n) = 2(n - 1)$, so $M(${n}) = ${2 * (n - 1)}$.`, `$M(n) = 2(n - 1)$, donc $M(${n}) = ${2 * (n - 1)}$.`),
});

const recursionCount: Lesson = {
  id: 'c1l7',
  title: t('Counting inside recursion', 'Compter dans la récursivité'),
  summary: t(
    'You can count the work of a function that calls itself once, by turning it into a recurrence.',
    'Vous savez compter le travail d’une fonction qui s’appelle une fois elle-même, en le changeant en récurrence.',
  ),
  steps: [
    {
      kind: 'read',
      title: t('A stack of waiting calls', 'Une pile d’appels en attente'),
      body: t(
        `This function adds up the first $n$ cubes, $1^3 + 2^3 + \\dots + n^3$, by calling itself on $n - 1$. Each call has to **wait** for the smaller one to return before it can finish. Step through the call stack.`,
        `Cette fonction additionne les $n$ premiers cubes, $1^3 + 2^3 + \\dots + n^3$, en s’appelant sur $n - 1$. Chaque appel doit **attendre** que le plus petit lui réponde avant de pouvoir finir. Avancez dans la pile d’appels.`,
      ),
      widget: () => (
        <div className="space-y-4">
          <CodeBlock title="S(n)" lines={['if n = 1 return 1', 'else return S(n − 1) + n × n × n']} />
          <CallChain spec={cubesSpec} opName="multiplications" />
        </div>
      ),
    },
    {
      kind: 'choice',
      body: t(
        'Let $M(n)$ be the number of multiplications made by $S(n)$. Which recurrence describes it?',
        'Notons $M(n)$ le nombre de multiplications faites par $S(n)$. Quelle récurrence le décrit ?',
      ),
      options: ['$M(n) = M(n-1) + 1,\\ M(1) = 0$', '$M(n) = M(n-1) + 2,\\ M(1) = 0$', '$M(n) = 2M(n-1),\\ M(1) = 1$', '$M(n) = M(n-1) + n,\\ M(1) = 0$'],
      answer: 1,
      explain: t(
        '`n × n × n` is two multiplications, plus whatever the smaller call does. The base case multiplies nothing.',
        '`n × n × n` fait deux multiplications, plus celles de l’appel plus petit. Le cas de base ne multiplie rien.',
      ),
    },
    { kind: 'generated', make: (r) => cubeMultsQ(r.int(5, 40)) },
    {
      kind: 'choice',
      body: t(
        'A simple loop `for i ← 1 to n: s ← s + i × i × i` computes the same sum. How do the two compare?',
        'Une simple boucle `for i ← 1 to n: s ← s + i × i × i` calcule la même somme. Comment se comparent-elles ?',
      ),
      options: t(
        [
          'The loop is in a better complexity class',
          'Same number of multiplications, $\\Theta(n)$ — but the recursive version also pays for $n$ calls and keeps $n$ calls waiting in memory',
          'The recursive version is faster',
        ],
        [
          'La boucle est dans une meilleure classe de complexité',
          'Même nombre de multiplications, $\\Theta(n)$ — mais la version récursive paie en plus $n$ appels et garde $n$ appels en attente en mémoire',
          'La version récursive est plus rapide',
        ],
      ),
      answer: 1,
      explain: t(
        'Both do $2(n-1)$ or $2n$ multiplications. Recursion adds call overhead and $\\Theta(n)$ stack space. (And a closed formula, $\\left(\\frac{n(n+1)}{2}\\right)^2$, needs no loop at all.)',
        'Les deux font $2(n-1)$ ou $2n$ multiplications. La récursivité ajoute le coût des appels et $\\Theta(n)$ de place sur la pile. (Et une formule close, $\\left(\\frac{n(n+1)}{2}\\right)^2$, ne demande aucune boucle.)',
      ),
    },
    {
      kind: 'task',
      title: t('The smallest so far', 'Le plus petit jusqu’ici'),
      body: t(
        'Another one: `Low(k)` returns the smallest of the first $k$ values by comparing `Low(k − 1)` with the $k$-th value. Run it on **7, 3, 9, 4, 1, 8, 6** all the way.',
        'Un autre : `Low(k)` renvoie la plus petite des $k$ premières valeurs en comparant `Low(k − 1)` à la $k$-ième valeur. Lancez-le sur **7, 3, 9, 4, 1, 8, 6** jusqu’au bout.',
      ),
      widget: ({ onSolved }) => <CallChain spec={minSpec} initialN={7} maxN={7} opName={t('comparisons', 'comparaisons')} onSolved={onSolved} />,
      success: t('It returns the minimum, 1.', 'Il renvoie le minimum, 1.'),
    },
    {
      kind: 'number',
      body: t(
        'Choosing the comparison as the basic operation, $C(k) = C(k-1) + 1$ with $C(1) = 0$. How many comparisons for $k = 7$ values?',
        'En prenant la comparaison comme opération de base, $C(k) = C(k-1) + 1$ avec $C(1) = 0$. Combien de comparaisons pour $k = 7$ valeurs ?',
      ),
      answer: 6,
      explain: t(
        '$C(k) = k - 1$: exactly as many as the simple scan — every value except the first is compared once.',
        '$C(k) = k - 1$ : exactement autant que le simple balayage — chaque valeur sauf la première est comparée une fois.',
      ),
    },
  ],
};

const celebrity: Lesson = {
  id: 'c1l8',
  title: t('Who knows whom?', 'Qui connaît qui ?'),
  summary: t(
    'You found a celebrity with about 3n questions by eliminating one person per question.',
    'Vous avez trouvé une célébrité avec environ 3n questions en éliminant une personne par question.',
  ),
  steps: [
    {
      kind: 'read',
      title: t('The puzzle', 'L’énigme'),
      body: t(
        `In a group of $n$ people, a **celebrity** is someone who **knows nobody** but is **known by everybody**. The only thing you may do is ask a person “do you know this other person?”. There may be no celebrity at all.

Asking every person about every other person costs $n(n-1)$ questions. Can we do much better?`,
        `Dans un groupe de $n$ personnes, une **célébrité** est quelqu’un qui **ne connaît personne** mais que **tout le monde connaît**. La seule chose permise est de demander à une personne « connais-tu cette autre personne ? ». Il se peut qu’il n’y ait aucune célébrité.

Interroger chaque personne sur chaque autre coûte $n(n-1)$ questions. Peut-on faire beaucoup mieux ?`,
      ),
    },
    {
      kind: 'choice',
      body: t(
        'You ask A: “do you know B?”. What can you conclude **in every case**?',
        'Vous demandez à A : « connais-tu B ? ». Que pouvez-vous conclure **dans tous les cas** ?',
      ),
      options: t(
        ['If yes, B is the celebrity', 'If yes, A is not the celebrity; if no, B is not the celebrity', 'Nothing until everyone has been asked', 'If no, A is the celebrity'],
        ['Si oui, B est la célébrité', 'Si oui, A n’est pas la célébrité ; si non, B n’est pas la célébrité', 'Rien tant que tout le monde n’a pas été interrogé', 'Si non, A est la célébrité'],
      ),
      answer: 1,
      explain: t(
        'A celebrity knows nobody, so a "yes" rules out A. A celebrity is known by everybody, so a "no" rules out B. Either way **one question eliminates one person**.',
        'Une célébrité ne connaît personne, donc un « oui » élimine A. Une célébrité est connue de tous, donc un « non » élimine B. Dans tous les cas, **une question élimine une personne**.',
      ),
    },
    {
      kind: 'task',
      body: t(
        'Watch the elimination, then the verification of the last candidate. Then tick “group without a celebrity” and run it again.',
        'Regardez l’élimination, puis la vérification du dernier candidat. Cochez ensuite « groupe sans célébrité » et relancez.',
      ),
      widget: ({ onSolved }) => <CelebrityFinder onSolved={onSolved} />,
      success: t(
        'Elimination leaves one candidate; verification confirms or rejects them.',
        'L’élimination laisse un candidat ; la vérification le confirme ou le rejette.',
      ),
    },
    {
      kind: 'choice',
      body: t('At most how many questions does this method ask for $n$ people?', 'Combien de questions au plus cette méthode pose-t-elle pour $n$ personnes ?'),
      options: ['$n - 1$', '$2(n-1)$', '$3(n - 1)$', '$n(n-1)$'],
      answer: 2,
      explain: t(
        '$n - 1$ questions to eliminate everyone but one candidate, then at most $2(n-1)$ to check that the candidate knows nobody and is known by all: $3(n-1)$, linear instead of quadratic.',
        '$n - 1$ questions pour éliminer tout le monde sauf un candidat, puis au plus $2(n-1)$ pour vérifier qu’il ne connaît personne et que tous le connaissent : $3(n-1)$, linéaire au lieu de quadratique.',
      ),
    },
  ],
};

const grill: Lesson = {
  id: 'c1l9',
  title: t('Two at a time', 'Deux à la fois'),
  summary: t(
    'You set up and solved a recurrence for a cooking plan, and saw why its base case made it sub-optimal.',
    'Vous avez posé et résolu une récurrence pour un plan de cuisson, et vu pourquoi son cas de base le rendait sous-optimal.',
  ),
  steps: [
    {
      kind: 'read',
      title: t('A small grill', 'Un petit gril'),
      body: t(
        `A grill holds **two** burgers at a time. Each burger must be cooked on **both sides**, one minute per side, however many are on the grill.

A natural recursive plan: if $n \\le 2$, cook them (both sides): 2 minutes. If $n > 2$, cook two burgers completely (2 minutes), then the other $n - 2$ with the same plan.`,
        `Un gril contient **deux** steaks à la fois. Chaque steak doit cuire sur **ses deux faces**, une minute par face, quel que soit le nombre de steaks sur le gril.

Un plan récursif naturel : si $n \\le 2$, on les cuit (des deux côtés) : 2 minutes. Si $n > 2$, on cuit complètement deux steaks (2 minutes), puis les $n - 2$ autres avec le même plan.`,
      ),
    },
    {
      kind: 'choice',
      body: t('Which recurrence gives the time $T(n)$ of this plan?', 'Quelle récurrence donne le temps $T(n)$ de ce plan ?'),
      options: ['$T(n) = 2T(n/2)$', '$T(n) = T(n-2) + 2,\\ T(1) = T(2) = 2$', '$T(n) = T(n-1) + 1,\\ T(1) = 2$', '$T(n) = T(n-2) + 1$'],
      answer: 1,
      explain: t(
        'Two minutes for one pair, then the same problem with two fewer burgers.',
        'Deux minutes pour une paire, puis le même problème avec deux steaks de moins.',
      ),
    },
    {
      kind: 'number',
      body: t('How many minutes does this plan take for **3** burgers?', 'Combien de minutes ce plan prend-il pour **3** steaks ?'),
      answer: 4,
      explain: t(
        '$T(3) = T(1) + 2 = 4$. In general $T(n) = n$ for even $n$ and $n + 1$ for odd $n$.',
        '$T(3) = T(1) + 2 = 4$. En général $T(n) = n$ pour $n$ pair et $n + 1$ pour $n$ impair.',
      ),
    },
    {
      kind: 'task',
      body: t(
        'Beat the plan: cook **3** burgers in **3** minutes. (There are 6 sides and the grill does 2 per minute…)',
        'Battez le plan : cuisez **3** steaks en **3** minutes. (Il y a 6 faces et le gril en fait 2 par minute…)',
      ),
      widget: ({ onSolved }) => <GrillSim initialN={3} onSolved={onSolved} />,
      hint: t(
        'Don’t finish a burger before starting the third one: minute 1 = #1 and #2, minute 2 = #1 and #3…',
        'Ne finissez pas un steak avant d’entamer le troisième : minute 1 = n°1 et n°2, minute 2 = n°1 et n°3…',
      ),
      success: t(
        'Minute 1: #1 and #2. Minute 2: #1 (second side) and #3. Minute 3: #2 and #3 (second sides).',
        'Minute 1 : n°1 et n°2. Minute 2 : n°1 (seconde face) et n°3. Minute 3 : n°2 et n°3 (secondes faces).',
      ),
    },
    {
      kind: 'choice',
      body: t(
        'Why is the recursive plan not optimal for every $n$, and how can it be fixed?',
        'Pourquoi le plan récursif n’est-il pas optimal pour tout $n$, et comment le corriger ?',
      ),
      options: t(
        [
          'It is optimal; 3 minutes is impossible',
          'For odd $n$ it ends with a single burger alone on the grill, wasting a slot for 2 minutes. Fix: add a base case $n = 3$ cooked in 3 minutes, so $T(n) = n$ for all $n \\ge 2$',
          'It should cook one burger at a time',
        ],
        [
          'Il est optimal ; 3 minutes, c’est impossible',
          'Pour $n$ impair, il finit avec un steak seul sur le gril, ce qui gâche une place pendant 2 minutes. Correction : ajouter un cas de base $n = 3$ cuit en 3 minutes, donc $T(n) = n$ pour tout $n \\ge 2$',
          'Il devrait cuire un steak à la fois',
        ],
      ),
      answer: 1,
      explain: t(
        'With $2n$ sides and 2 per minute, $n$ minutes is a lower bound for $n \\ge 2$. Base cases $T(2) = 2$ and $T(3) = 3$ reach it for every $n$.',
        'Avec $2n$ faces et 2 par minute, $n$ minutes est une borne inférieure pour $n \\ge 2$. Les cas de base $T(2) = 2$ et $T(3) = 3$ l’atteignent pour tout $n$.',
      ),
    },
  ],
};

export const ch1xLessons = [recursionCount, celebrity, grill];
