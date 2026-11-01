import { t, texDec } from '../../lib/i18n';
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
    body: t(
      `How many multiplications does the halving method use for $a^{${n}}$?`,
      `Combien de multiplications la méthode par moitiés utilise-t-elle pour $a^{${n}}$ ?`,
    ),
    answer: total,
    hint: t(
      'Follow the exponent down: halve it (rounding down) until you reach 1. Each step is one squaring, plus one more multiplication by $a$ when the exponent is odd.',
      'Suivez l’exposant vers le bas : divisez-le par deux (en arrondissant vers le bas) jusqu’à 1. Chaque étape est une mise au carré, plus une multiplication par $a$ quand l’exposant est impair.',
    ),
    explain: t(
      `$${chain.join(' \\to ')}$: ${chain.length - 1} squarings${odd.length ? `, plus one multiplication by $a$ for each odd exponent above 1 (${odd.join(', ')})` : ''}. Total **${total}**, against ${n - 1} for the direct method.`,
      `$${chain.join(' \\to ')}$ : ${chain.length - 1} mises au carré${odd.length ? `, plus une multiplication par $a$ pour chaque exposant impair au-dessus de 1 (${odd.join(', ')})` : ''}. Total **${total}**, contre ${n - 1} pour la méthode directe.`,
    ),
  };
};

const pw = (d: number) => (d === 0 ? '1' : d === 1 ? 'n' : `n^{${d}}`);

export const masterQ = (a: number, b: number, d: number): QuestionStep => {
  const bd = b ** d;
  const e = Math.log(a) / Math.log(b);
  const eTex = `${Number.isInteger(e) ? '=' : '\\approx'} ${Number.isInteger(e) ? e : texDec(e, 2)}`;
  return {
    kind: 'choice',
    title: t('Practice', 'Entraînement'),
    body: t(`Solve $T(n) = ${a === 1 ? '' : a}T(n/${b}) + ${pw(d)}$.`, `Résolvez $T(n) = ${a === 1 ? '' : a}T(n/${b}) + ${pw(d)}$.`),
    options: [`$\\Theta(${pw(d)})$`, `$\\Theta(${d === 0 ? '' : pw(d) + ' '}\\log n)$`, `$\\Theta(n^{\\log_{${b}} ${a}})$`],
    answer: a < bd ? 0 : a === bd ? 1 : 2,
    explain: t(
      `$a = ${a}$, $b = ${b}$, $d = ${d}$, so $b^d = ${bd}$. ${
        a < bd
          ? `$${a} < ${bd}$: the combine step dominates, $\\Theta(${pw(d)})$.`
          : a === bd
            ? `$${a} = ${bd}$: every level costs the same and there are $\\log_${b} n$ levels.`
            : `$${a} > ${bd}$: the leaves dominate, $\\Theta(n^{\\log_{${b}} ${a}})$ with $\\log_{${b}} ${a} ${eTex}$.`
      }`,
      `$a = ${a}$, $b = ${b}$, $d = ${d}$, donc $b^d = ${bd}$. ${
        a < bd
          ? `$${a} < ${bd}$ : l’étape de combinaison domine, $\\Theta(${pw(d)})$.`
          : a === bd
            ? `$${a} = ${bd}$ : chaque niveau coûte autant et il y a $\\log_${b} n$ niveaux.`
            : `$${a} > ${bd}$ : les feuilles dominent, $\\Theta(n^{\\log_{${b}} ${a}})$ avec $\\log_{${b}} ${a} ${eTex}$.`
      }`,
    ),
  };
};

const mergesort: Lesson = {
  id: 'c4l1',
  title: t('Sort by splitting and merging', 'Trier en coupant et en fusionnant'),
  summary: t(
    'You can trace merge sort, explain why it is stable, and derive its Θ(n log n) cost.',
    'Vous savez suivre le tri fusion, expliquer pourquoi il est stable et retrouver son coût en Θ(n log n).',
  ),
  steps: [
    {
      kind: 'read',
      title: t('Split, solve, combine', 'Couper, résoudre, combiner'),
      body: t(
        `**Split, solve, combine**: split the problem into independent sub-problems of the same kind, solve them recursively, and **combine** their solutions.

Merge sort splits the array in two halves, sorts each half, then **merges** the two sorted halves by repeatedly taking the smaller front element. The two E's are labelled $E_1$ and $E_2$ so you can follow them.`,
        `**Couper, résoudre, combiner** : couper le problème en sous-problèmes indépendants du même genre, les résoudre récursivement et **combiner** leurs solutions.

Le tri fusion coupe le tableau en deux moitiés, trie chaque moitié, puis **fusionne** les deux moitiés triées en prenant à chaque fois le plus petit élément de tête. Les deux E sont notés $E_1$ et $E_2$ pour que vous puissiez les suivre.`,
      ),
    },
    {
      kind: 'task',
      body: t(
        'Sort **E, X, A, M, P, L, E** with merge sort. Step through every split and every merge.',
        'Triez **E, X, A, M, P, L, E** avec le tri fusion. Avancez à travers chaque coupe et chaque fusion.',
      ),
      widget: ({ onSolved }) => <MergeSortTree onSolved={onSolved} />,
      success: t('Result: A E E L M P X.', 'Résultat : A E E L M P X.'),
    },
    {
      kind: 'choice',
      body: t(
        'Is merge sort **stable** (equal keys keep their original relative order)? Look at $E_1$ and $E_2$ at the end.',
        'Le tri fusion est-il **stable** (des clés égales gardent leur ordre relatif d’origine) ? Regardez $E_1$ et $E_2$ à la fin.',
      ),
      options: t(
        ['Yes — when the two front elements are equal, the merge takes the one from the left half first', 'No — equal keys can be swapped', 'Only if the array length is a power of two'],
        ['Oui — quand les deux éléments de tête sont égaux, la fusion prend d’abord celui de la moitié gauche', 'Non — des clés égales peuvent être échangées', 'Seulement si la longueur du tableau est une puissance de deux'],
      ),
      answer: 0,
      explain: t(
        '$E_1$ still comes before $E_2$. With the test `left ≤ right`, ties always go to the left half, which holds the earlier elements: merge sort is stable.',
        '$E_1$ est toujours avant $E_2$. Avec le test `gauche ≤ droite`, les égalités vont toujours à la moitié gauche, qui contient les éléments arrivés avant : le tri fusion est stable.',
      ),
    },
    {
      kind: 'choice',
      body: t(
        'Merging two halves of total size $n$ costs at most $n - 1$ comparisons. Which recurrence describes the number of comparisons $C(n)$?',
        'Fusionner deux moitiés de taille totale $n$ coûte au plus $n - 1$ comparaisons. Quelle récurrence décrit le nombre de comparaisons $C(n)$ ?',
      ),
      options: ['$C(n) = C(n-1) + n$', '$C(n) = 2C(n/2) + n - 1$', '$C(n) = C(n/2) + 1$', '$C(n) = 2C(n-1) + 1$'],
      answer: 1,
      explain: t(
        'Two recursive calls on halves, plus the merge. Each of the $\\log_2 n$ levels of the tree costs about $n$, so $C(n) \\in \\Theta(n \\log n)$.',
        'Deux appels récursifs sur des moitiés, plus la fusion. Chacun des $\\log_2 n$ niveaux de l’arbre coûte environ $n$, donc $C(n) \\in \\Theta(n \\log n)$.',
      ),
    },
    {
      kind: 'choice',
      title: t('Counting inversions', 'Compter les inversions'),
      body: t(
        'An **inversion** is a pair $i < j$ with $A[i] > A[j]$. During a merge, when an element of the **right** half is taken before the remaining $k$ elements of the left half, how many inversions does that reveal?',
        'Une **inversion** est une paire $i < j$ avec $A[i] > A[j]$. Pendant une fusion, quand un élément de la moitié **droite** est pris avant les $k$ éléments restants de la moitié gauche, combien d’inversions cela révèle-t-il ?',
      ),
      options: t(['1', '$k$', '$k - 1$', 'None'], ['1', '$k$', '$k - 1$', 'Aucune']),
      answer: 1,
      explain: t(
        'It is smaller than all $k$ remaining left elements, which were before it in the array: $k$ inversions at once. Adding these counts during merge sort gives an $O(n \\log n)$ inversion counter.',
        'Il est plus petit que les $k$ éléments restants à gauche, qui étaient avant lui dans le tableau : $k$ inversions d’un coup. Additionner ces comptes pendant le tri fusion donne un compteur d’inversions en $O(n \\log n)$.',
      ),
    },
  ],
};

const quicksort: Lesson = {
  id: 'c4l2',
  title: t('Sort around a pivot', 'Trier autour d’un pivot'),
  summary: t(
    'You traced Hoare partitioning and learnt why the pivot choice decides quicksort’s fate.',
    'Vous avez suivi la partition de Hoare et compris pourquoi le choix du pivot décide du sort du tri rapide.',
  ),
  steps: [
    {
      kind: 'read',
      title: t('Partition around a pivot', 'Partitionner autour d’un pivot'),
      body: t(
        `Quicksort does the hard work **before** recursing: it **partitions** the array around a pivot $p$ (here the first element) so that everything on the left is $\\le p$ and everything on the right is $\\ge p$. The pivot is then in its final place, and both sides are sorted recursively.

Partitioning uses two scans: $i$ moves right until it finds an element $\\ge p$, $j$ moves left until it finds one $\\le p$; then they are swapped. When $i$ and $j$ cross, the pivot is swapped with $A[j]$.`,
        `Le tri rapide fait le gros du travail **avant** les appels récursifs : il **partitionne** le tableau autour d’un pivot $p$ (ici le premier élément) pour que tout ce qui est à gauche soit $\\le p$ et tout ce qui est à droite soit $\\ge p$. Le pivot est alors à sa place définitive, et les deux côtés sont triés récursivement.

La partition utilise deux balayages : $i$ avance vers la droite jusqu’à trouver un élément $\\ge p$, $j$ recule vers la gauche jusqu’à en trouver un $\\le p$ ; puis on les échange. Quand $i$ et $j$ se croisent, le pivot est échangé avec $A[j]$.`,
      ),
    },
    {
      kind: 'task',
      body: t(
        'Sort **E, X, A, M, P, L, E** with quicksort and watch the tree of recursive calls grow.',
        'Triez **E, X, A, M, P, L, E** avec le tri rapide et regardez grandir l’arbre des appels récursifs.',
      ),
      widget: ({ onSolved }) => <QuickSortViz onSolved={onSolved} />,
      success: t(
        'Each call is shown with its bounds $l, r$ and the split position $s$ where its pivot landed.',
        'Chaque appel est affiché avec ses bornes $l, r$ et la position de coupure $s$ où son pivot a atterri.',
      ),
    },
    {
      kind: 'sequence',
      body: t(
        'After the **first** partition (pivot $E_1$), in which order are the elements? (The pivot ends at position 2.)',
        'Après la **première** partition (pivot $E_1$), dans quel ordre sont les éléments ? (Le pivot finit en position 2.)',
      ),
      tokens: ['E₂', 'X', 'A', 'M', 'P', 'L', 'E₁'],
      answer: ['A', 'E₂', 'E₁', 'M', 'P', 'L', 'X'],
      hint: t('Step back to the frame “Put the pivot in its final place”.', 'Revenez à l’étape « Mettre le pivot à sa place définitive ».'),
      explain: t(
        '$i$ stops on X, $j$ on $E_2$: swap → $E_1$ $E_2$ A M P L X. Then $i$ stops on M, $j$ on A: they have crossed, so the pivot is swapped with A → A $E_2$ $E_1$ M P L X. The two E’s changed order: quicksort is **not stable**.',
        '$i$ s’arrête sur X, $j$ sur $E_2$ : échange → $E_1$ $E_2$ A M P L X. Puis $i$ s’arrête sur M, $j$ sur A : ils se sont croisés, le pivot est donc échangé avec A → A $E_2$ $E_1$ M P L X. Les deux E ont changé d’ordre : le tri rapide n’est **pas stable**.',
      ),
    },
    {
      kind: 'choice',
      body: t(
        'With **median-of-three** pivot selection (median of first, middle and last elements), what is an array already sorted in increasing order?',
        'Avec un pivot choisi comme **médiane de trois** (médiane du premier, du milieu et du dernier élément), qu’est-ce qu’un tableau déjà trié par ordre croissant ?',
      ),
      options: t(['The worst case', 'The best case', 'Neither'], ['Le pire cas', 'Le meilleur cas', 'Ni l’un ni l’autre']),
      answer: 1,
      explain: t(
        'The median of three on a sorted array is the true median, so every partition splits exactly in half: the best case, $\\Theta(n\\log n)$. (Same for decreasing order.) With the plain first-element pivot, a sorted array is the **worst** case: splits of size $0$ and $n-1$, giving $\\Theta(n^2)$.',
        'Sur un tableau trié, la médiane de trois est la vraie médiane : chaque partition coupe exactement en deux, c’est le meilleur cas, $\\Theta(n\\log n)$. (De même pour l’ordre décroissant.) Avec le simple premier élément comme pivot, un tableau trié est le **pire** cas : des parts de taille $0$ et $n-1$, ce qui donne $\\Theta(n^2)$.',
      ),
    },
  ],
};

const power: Lesson = {
  id: 'c4l3',
  title: t('Powers in a few steps', 'Des puissances en quelques étapes'),
  summary: t(
    'You computed aⁿ with Θ(log n) multiplications and solved the recurrences of splitting algorithms.',
    'Vous avez calculé aⁿ avec Θ(log n) multiplications et résolu les récurrences des algorithmes qui coupent.',
  ),
  steps: [
    {
      kind: 'read',
      title: t('Halving the exponent', 'Couper l’exposant en deux'),
      body: t(
        `The direct method computes $a^n$ with $n - 1$ multiplications. Splitting the exponent uses
$$a^n = \\left(a^{\\lfloor n/2 \\rfloor}\\right)^2 \\text{ if } n \\text{ is even}, \\qquad a^n = \\left(a^{\\lfloor n/2 \\rfloor}\\right)^2 \\cdot a \\text{ if } n \\text{ is odd}.$$
The crucial point: $a^{\\lfloor n/2 \\rfloor}$ is computed **once** and squared. Slide $n$.`,
        `La méthode directe calcule $a^n$ avec $n - 1$ multiplications. Couper l’exposant utilise
$$a^n = \\left(a^{\\lfloor n/2 \\rfloor}\\right)^2 \\text{ si } n \\text{ est pair}, \\qquad a^n = \\left(a^{\\lfloor n/2 \\rfloor}\\right)^2 \\cdot a \\text{ si } n \\text{ est impair}.$$
Le point crucial : $a^{\\lfloor n/2 \\rfloor}$ est calculé **une seule fois** puis mis au carré. Faites varier $n$.`,
      ),
      widget: () => <PowerByHalves />,
    },
    { kind: 'generated', make: (r) => powerMultsQ(r.int(10, 200)) },
    {
      kind: 'choice',
      title: t('Max and min', 'Max et min'),
      body: t(
        'Splitting for max **and** min: split in halves, solve each, then 2 comparisons to combine (max vs max, min vs min), with 1 comparison for a pair. For $n = 2^k$, the count is $C(n) = 2C(n/2) + 2$, $C(2) = 1$. What is $C(n)$?',
        'Couper pour le max **et** le min : couper en moitiés, résoudre chacune, puis 2 comparaisons pour combiner (max contre max, min contre min), avec 1 comparaison pour une paire. Pour $n = 2^k$, le compte est $C(n) = 2C(n/2) + 2$, $C(2) = 1$. Que vaut $C(n)$ ?',
      ),
      options: ['$2n - 2$', '$\\dfrac{3n}{2} - 2$', '$n \\log_2 n$', '$n - 1$'],
      answer: 1,
      explain: t(
        'Unrolling: $C(n) = \\frac{n}{2}C(2) + 2(\\frac n2 - 1) = \\frac{3n}{2} - 2$. Better than the $2n - 2$ of the direct scan! For max alone, splitting needs $n - 1$ comparisons — the same as the direct method.',
        'En déroulant : $C(n) = \\frac{n}{2}C(2) + 2(\\frac n2 - 1) = \\frac{3n}{2} - 2$. Mieux que les $2n - 2$ du balayage direct ! Pour le max seul, couper demande $n - 1$ comparaisons — autant que la méthode directe.',
      ),
    },
    {
      kind: 'read',
      title: t('The master theorem', 'Le théorème maître'),
      body: t(
        `Recurrences of algorithms that split their input look like $T(n) = a\\,T(n/b) + f(n)$ with $f(n) \\in \\Theta(n^d)$. Compare $a$ with $b^d$:

- $a < b^d$: $T(n) \\in \\Theta(n^d)$ — the combine step dominates;
- $a = b^d$: $T(n) \\in \\Theta(n^d \\log n)$ — every level costs the same;
- $a > b^d$: $T(n) \\in \\Theta(n^{\\log_b a})$ — the leaves dominate.`,
        `Les récurrences des algorithmes qui coupent leur entrée ont la forme $T(n) = a\\,T(n/b) + f(n)$ avec $f(n) \\in \\Theta(n^d)$. Comparez $a$ et $b^d$ :

- $a < b^d$ : $T(n) \\in \\Theta(n^d)$ — l’étape de combinaison domine ;
- $a = b^d$ : $T(n) \\in \\Theta(n^d \\log n)$ — chaque niveau coûte autant ;
- $a > b^d$ : $T(n) \\in \\Theta(n^{\\log_b a})$ — les feuilles dominent.`,
      ),
    },
    {
      kind: 'choice',
      body: t('Solve $T(n) = 4T(n/2) + n$.', 'Résolvez $T(n) = 4T(n/2) + n$.'),
      options: ['$\\Theta(n)$', '$\\Theta(n \\log n)$', '$\\Theta(n^2)$', '$\\Theta(n^2 \\log n)$'],
      answer: 2,
      explain: t(
        '$a = 4$, $b = 2$, $d = 1$: $4 > 2^1$, so $\\Theta(n^{\\log_2 4}) = \\Theta(n^2)$.',
        '$a = 4$, $b = 2$, $d = 1$ : $4 > 2^1$, donc $\\Theta(n^{\\log_2 4}) = \\Theta(n^2)$.',
      ),
    },
    {
      kind: 'choice',
      body: t('Solve $T(n) = 4T(n/2) + n^2$.', 'Résolvez $T(n) = 4T(n/2) + n^2$.'),
      options: ['$\\Theta(n^2)$', '$\\Theta(n^2 \\log n)$', '$\\Theta(n^3)$', '$\\Theta(n \\log n)$'],
      answer: 1,
      explain: t(
        '$a = 4 = 2^2 = b^d$: every level costs $n^2$ and there are $\\log_2 n$ levels — $\\Theta(n^2\\log n)$.',
        '$a = 4 = 2^2 = b^d$ : chaque niveau coûte $n^2$ et il y a $\\log_2 n$ niveaux — $\\Theta(n^2\\log n)$.',
      ),
    },
    {
      kind: 'choice',
      body: t('Solve $T(n) = T(n/3) + 1$.', 'Résolvez $T(n) = T(n/3) + 1$.'),
      options: ['$\\Theta(1)$', '$\\Theta(\\log n)$', '$\\Theta(n)$', '$\\Theta(n^{1/3})$'],
      answer: 1,
      explain: t(
        '$a = 1 = 3^0 = b^d$: $\\Theta(n^0 \\log n) = \\Theta(\\log n)$ — one step per division by 3.',
        '$a = 1 = 3^0 = b^d$ : $\\Theta(n^0 \\log n) = \\Theta(\\log n)$ — une étape par division par 3.',
      ),
    },
    { kind: 'generated', make: (r) => masterQ(r.int(1, 9), r.int(2, 4), r.int(0, 3)) },
  ],
};

const flags: Lesson = {
  id: 'c4l4',
  title: t('Grouping colours in one pass', 'Regrouper les couleurs en un passage'),
  summary: t(
    'You can partition by colour in one pass using an invariant with three pointers.',
    'Vous savez partager par couleur en un seul passage grâce à un invariant à trois indices.',
  ),
  steps: [
    {
      kind: 'read',
      title: t('Two colours', 'Deux couleurs'),
      body: t(
        'Red and white elements must be rearranged with all reds first, using only “look at a colour” and “swap two elements”. Keep the reds in a zone at the front: scan left to right and, each time you meet a red, swap it to the end of that zone. Step through it.',
        'Des éléments rouges et blancs doivent être réordonnés avec tous les rouges en premier, en utilisant seulement « regarder une couleur » et « échanger deux éléments ». Gardez les rouges dans une zone au début : parcourez de gauche à droite et, à chaque rouge rencontré, échangez-le avec la fin de cette zone. Avancez pas à pas.',
      ),
      widget: () => <FlagSort colors={['W', 'R', 'W', 'W', 'R', 'R', 'W', 'R', 'W', 'R']} />,
    },
    {
      kind: 'task',
      title: t('Three colours', 'Trois couleurs'),
      body: t(
        `Now red, white **and** blue. Dijkstra's solution keeps four zones, described by three indices — the **invariant**:

$$\\underbrace{R\\dots R}_{[0,\\,lo)}\\ \\underbrace{W\\dots W}_{[lo,\\,mid)}\\ \\underbrace{?\\dots ?}_{[mid,\\,hi]}\\ \\underbrace{B\\dots B}_{(hi,\\,n)}$$

Each step examines $A[mid]$ and shrinks the unknown zone by one. Run it.`,
        `Maintenant rouge, blanc **et** bleu. La solution de Dijkstra garde quatre zones, décrites par trois indices — l’**invariant** :

$$\\underbrace{R\\dots R}_{[0,\\,lo)}\\ \\underbrace{W\\dots W}_{[lo,\\,mid)}\\ \\underbrace{?\\dots ?}_{[mid,\\,hi]}\\ \\underbrace{B\\dots B}_{(hi,\\,n)}$$

(R = rouge, W = blanc, B = bleu.) Chaque étape examine $A[mid]$ et réduit la zone inconnue d’un élément. Lancez-le.`,
      ),
      widget: ({ onSolved }) => <FlagSort colors={['B', 'R', 'W', 'B', 'R', 'W', 'W', 'R', 'B', 'R', 'W', 'B']} onSolved={onSolved} />,
      success: t(
        'Each examination shrinks the unknown zone by exactly one element.',
        'Chaque examen réduit la zone inconnue d’exactement un élément.',
      ),
    },
    {
      kind: 'choice',
      body: t(
        'How many colour examinations does the algorithm make for $n$ elements?',
        'Combien d’examens de couleur l’algorithme fait-il pour $n$ éléments ?',
      ),
      options: t(
        ['$n$', '$n \\log n$', '$n^2/2$', 'It depends on the colours, up to $2n$'],
        ['$n$', '$n \\log n$', '$n^2/2$', 'Cela dépend des couleurs, jusqu’à $2n$'],
      ),
      answer: 0,
      explain: t(
        'Every iteration examines $A[mid]$ once and the unknown zone loses one element: exactly $n$ examinations, and at most $n$ swaps — $\\Theta(n)$.',
        'Chaque itération examine $A[mid]$ une fois et la zone inconnue perd un élément : exactement $n$ examens, et au plus $n$ échanges — $\\Theta(n)$.',
      ),
    },
    {
      kind: 'choice',
      body: t(
        'When $A[mid]$ is **blue**, why don’t we increase $mid$ after swapping it with $A[hi]$?',
        'Quand $A[mid]$ est **bleu**, pourquoi n’augmente-t-on pas $mid$ après l’avoir échangé avec $A[hi]$ ?',
      ),
      options: t(
        ['Because $hi$ already moved', 'Because the element that arrives at $mid$ came from the unknown zone and has not been examined yet', 'To save a comparison', 'Because blue elements must be examined twice'],
        ['Parce que $hi$ a déjà bougé', 'Parce que l’élément qui arrive en $mid$ vient de la zone inconnue et n’a pas encore été examiné', 'Pour économiser une comparaison', 'Parce que les éléments bleus doivent être examinés deux fois'],
      ),
      answer: 1,
      explain: t(
        'The element swapped in from position $hi$ is still unknown. (A red swapped in from $lo$ is known to be white or $mid = lo$, so $mid$ can advance in that case.)',
        'L’élément arrivé de la position $hi$ est encore inconnu. (Quand on échange un rouge avec $lo$, l’élément qui arrive de $lo$ est forcément blanc, ou bien $mid = lo$ : $mid$ peut donc avancer dans ce cas.)',
      ),
    },
  ],
};

const trees: Lesson = {
  id: 'c4l5',
  title: t('Walking through a tree', 'Se promener dans un arbre'),
  summary: t(
    'You can traverse a binary tree in pre-, in- and post-order and reason recursively about trees.',
    'Vous savez parcourir un arbre binaire en ordre préfixe, infixe et postfixe, et raisonner récursivement sur les arbres.',
  ),
  steps: [
    {
      kind: 'read',
      title: t('A tree is a recursive object', 'Un arbre est un objet récursif'),
      body: t(
        'A binary tree is either empty, or a root with a **left** and a **right** subtree. That makes trees the natural playground of splitting: solve for both subtrees, then combine at the root. The three classic traversals differ only in **when** the root is visited.',
        'Un arbre binaire est soit vide, soit une racine avec un sous-arbre **gauche** et un sous-arbre **droit**. Cela fait des arbres le terrain de jeu naturel du découpage : résoudre pour les deux sous-arbres, puis combiner à la racine. Les trois parcours classiques ne diffèrent que par le **moment** où la racine est visitée.',
      ),
    },
    {
      kind: 'task',
      title: t('Preorder', 'Ordre préfixe'),
      body: t(
        'Click the nodes in **preorder**: root, then left subtree, then right subtree.',
        'Cliquez sur les nœuds en **ordre préfixe** : la racine, puis le sous-arbre gauche, puis le sous-arbre droit.',
      ),
      widget: ({ onSolved }) => <TraversalClicker order="pre" onSolved={onSolved} />,
      success: t('Preorder: a b d e c f.', 'Ordre préfixe : a b d e c f.'),
    },
    {
      kind: 'task',
      title: t('Inorder', 'Ordre infixe'),
      body: t('Now **inorder**: left subtree, root, right subtree.', 'Maintenant l’**ordre infixe** : sous-arbre gauche, racine, sous-arbre droit.'),
      widget: ({ onSolved }) => <TraversalClicker order="in" onSolved={onSolved} />,
      success: t(
        'Inorder: d b e a c f. (For a binary *search* tree, inorder lists the keys in increasing order.)',
        'Ordre infixe : d b e a c f. (Pour un arbre binaire *de recherche*, l’ordre infixe liste les clés par ordre croissant.)',
      ),
    },
    {
      kind: 'task',
      title: t('Postorder', 'Ordre postfixe'),
      body: t('Finally **postorder**: left subtree, right subtree, root.', 'Enfin l’**ordre postfixe** : sous-arbre gauche, sous-arbre droit, racine.'),
      widget: ({ onSolved }) => <TraversalClicker order="post" onSolved={onSolved} />,
      success: t('Postorder: d e b f c a. The root always comes last.', 'Ordre postfixe : d e b f c a. La racine vient toujours en dernier.'),
    },
    {
      kind: 'choice',
      body: t(
        'This algorithm is supposed to count the leaves of a binary tree. Is it correct?',
        'Cet algorithme est censé compter les feuilles d’un arbre binaire. Est-il correct ?',
      ),
      widget: () => (
        <CodeBlock
          title={t('Algorithm LeafCounter(T)', 'Algorithme LeafCounter(T)')}
          lines={['if T = ∅ return 0', 'else return LeafCounter(T_L) + LeafCounter(T_R)']}
        />
      ),
      options: t(
        [
          'Yes, it is correct',
          'No — it always returns 0; it needs a case “if T is a leaf (both subtrees empty) return 1”',
          'No — it counts all the nodes instead of the leaves',
          'No — it never terminates',
        ],
        [
          'Oui, il est correct',
          'Non — il renvoie toujours 0 ; il manque un cas « si T est une feuille (deux sous-arbres vides), renvoyer 1 »',
          'Non — il compte tous les nœuds au lieu des feuilles',
          'Non — il ne termine jamais',
        ],
      ),
      answer: 1,
      explain: t(
        'Nothing ever returns a non-zero value, so the sum is always 0. Add: `if T_L = ∅ and T_R = ∅ return 1`.',
        'Rien ne renvoie jamais une valeur non nulle, donc la somme vaut toujours 0. Ajoutez : `if T_L = ∅ and T_R = ∅ return 1`.',
      ),
    },
    {
      kind: 'task',
      title: t('One break at a time', 'Une cassure à la fois'),
      body: t(
        'A $3 \\times 4$ chocolate bar must be broken into 12 squares. You may break **one piece at a time**, along a straight line. Try to use as few breaks as possible.',
        'Une tablette de chocolat $3 \\times 4$ doit être cassée en 12 carrés. On peut casser **un morceau à la fois**, le long d’une ligne droite. Essayez d’utiliser le moins de cassures possible.',
      ),
      widget: ({ onSolved }) => <ChocolateBar rows={3} cols={4} onSolved={onSolved} />,
      success: t('However you do it, it takes exactly 11 breaks!', 'Quelle que soit la façon de faire, il faut exactement 11 cassures !'),
    },
    {
      kind: 'choice',
      body: t(
        'Why does an $n \\times m$ bar always need exactly $nm - 1$ breaks, whatever the strategy?',
        'Pourquoi une tablette $n \\times m$ demande-t-elle toujours exactement $nm - 1$ cassures, quelle que soit la stratégie ?',
      ),
      options: t(
        [
          'Because of the master theorem',
          'Each break turns one piece into two, so the number of pieces grows by exactly one per break: from 1 to $nm$',
          'Because breaking along rows first is optimal',
        ],
        [
          'À cause du théorème maître',
          'Chaque cassure change un morceau en deux : le nombre de morceaux augmente d’exactement un par cassure, de 1 à $nm$',
          'Parce que casser d’abord selon les lignes est optimal',
        ],
      ),
      answer: 1,
      explain: t(
        'Seen as a tree: each break is an internal node with two children, the $nm$ squares are the leaves, and a full binary tree with $L$ leaves has $L - 1$ internal nodes.',
        'Vu comme un arbre : chaque cassure est un nœud interne à deux enfants, les $nm$ carrés sont les feuilles, et un arbre binaire complet à $L$ feuilles a $L - 1$ nœuds internes.',
      ),
    },
  ],
};

export const ch4Lessons = [mergesort, quicksort, power, flags, trees];
