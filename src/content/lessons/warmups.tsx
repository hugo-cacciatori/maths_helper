import { num, t } from '../../lib/i18n';
import { texNum } from '../../lib/random';
import type { Lesson, QuestionStep } from '../../lib/types';
import { GuessNumber, SplitLevels, StackQueue, SubsetSwitches } from '../../widgets/basics';
import { ArrayRow, CodeBlock, GraphView, TreeView, type GEdge, type GNode, type TNode } from '../../widgets/kit';

const leaf = (id: string, label = id): TNode => ({ id, label });
const node = (id: string, left?: TNode | null, right?: TNode | null): TNode => ({ id, label: id, left, right });

/* ---------- practice questions with fresh numbers ---------- */

const PRACTICE = t('Practice', 'Entraînement');

export const modQ = (a: number, b: number): QuestionStep => ({
  kind: 'number',
  title: PRACTICE,
  body: t(`Compute $${a} \\bmod ${b}$.`, `Calculez $${a} \\bmod ${b}$.`),
  answer: a % b,
  hint: t(`Take away as many ${b}s as you can from ${a}; what is left?`, `Retirez de ${a} autant de fois ${b} que possible ; que reste-t-il ?`),
  explain: t(
    `$${a} = ${Math.floor(a / b)} \\times ${b} + ${a % b}$, so $${a} \\bmod ${b} = ${a % b}$.`,
    `$${a} = ${Math.floor(a / b)} \\times ${b} + ${a % b}$, donc $${a} \\bmod ${b} = ${a % b}$.`,
  ),
});

export const guessesQ = (n: number): QuestionStep => {
  const g = Math.ceil(Math.log2(n + 1));
  return {
    kind: 'number',
    title: PRACTICE,
    body: t(
      `Guessing the middle each time, at most how many guesses find a number between 1 and ${num(n)}?`,
      `En proposant chaque fois le milieu, combien d’essais au plus faut-il pour trouver un nombre entre 1 et ${num(n)} ?`,
    ),
    answer: g,
    hint: t(
      'With $g$ guesses you can tell apart up to $2^g - 1$ numbers. Find the smallest $g$ that covers them all.',
      'Avec $g$ essais, on peut distinguer jusqu’à $2^g - 1$ nombres. Trouvez le plus petit $g$ qui les couvre tous.',
    ),
    explain: t(
      `$2^{${g}} - 1 = ${texNum(2 ** g - 1)}$ covers ${num(n)} numbers, and one guess fewer does not: about $\\log_2 n$ guesses.`,
      `$2^{${g}} - 1 = ${texNum(2 ** g - 1)}$ couvre ${num(n)} nombres, et un essai de moins ne suffit pas : environ $\\log_2 n$ essais.`,
    ),
  };
};

/* ---------- chapter 2: try everything ---------- */

const possibilities: Lesson = {
  id: 'c2w1',
  title: t('Listing every possibility', 'Lister toutes les possibilités'),
  summary: t(
    'You can count orders and subsets, and you know how a stack and a queue hand items back.',
    'Vous savez compter les ordres et les sous-ensembles, et vous savez dans quel ordre une pile et une file rendent leurs éléments.',
  ),
  warmup: true,
  steps: [
    {
      kind: 'read',
      title: t('The multiply rule', 'La règle du produit'),
      body: t(
        'This chapter solves problems by **trying every possibility**. First, count them. With 3 shirts and 2 pairs of trousers you can make $3 \\times 2 = 6$ outfits: for each choice of shirt, any trousers fit. Independent choices **multiply**.',
        'Ce chapitre résout des problèmes en **essayant toutes les possibilités**. D’abord, comptons-les. Avec 3 chemises et 2 pantalons, on compose $3 \\times 2 = 6$ tenues : pour chaque chemise, n’importe quel pantalon convient. Des choix indépendants se **multiplient**.',
      ),
    },
    {
      kind: 'number',
      body: t(
        'A menu has 4 starters, 3 mains and 2 desserts. How many different three-course meals are there?',
        'Un menu propose 4 entrées, 3 plats et 2 desserts. Combien de repas entrée-plat-dessert différents y a-t-il ?',
      ),
      answer: 24,
      explain: '$4 \\times 3 \\times 2 = 24$.',
    },
    {
      kind: 'read',
      title: t('Orders', 'Les ordres'),
      body: t(
        `In how many orders can you line up A, B and C? 3 choices for the first place, then 2 for the second, then 1:

$$3 \\times 2 \\times 1 = 3! = 6: \\quad ABC,\\ ACB,\\ BAC,\\ BCA,\\ CAB,\\ CBA$$

$n$ items can be lined up in $n!$ orders.`,
        `De combien de façons peut-on aligner A, B et C ? 3 choix pour la première place, puis 2 pour la deuxième, puis 1 :

$$3 \\times 2 \\times 1 = 3! = 6 : \\quad ABC,\\ ACB,\\ BAC,\\ BCA,\\ CAB,\\ CBA$$

$n$ objets peuvent être alignés dans $n!$ ordres.`,
      ),
    },
    {
      kind: 'number',
      body: t('In how many orders can 5 books stand on a shelf?', 'Dans combien d’ordres 5 livres peuvent-ils être rangés sur une étagère ?'),
      answer: 120,
      explain: '$5! = 5 \\times 4 \\times 3 \\times 2 \\times 1 = 120$.',
    },
    {
      kind: 'read',
      title: t('Subsets', 'Les sous-ensembles'),
      body: t(
        'A **subset** is any choice of some of the items — maybe none, maybe all. Say yes or no to each item: every pattern of switches is one subset. Flip a few.',
        'Un **sous-ensemble** est un choix quelconque parmi les objets — peut-être aucun, peut-être tous. Dites oui ou non à chaque objet : chaque position des interrupteurs est un sous-ensemble. Basculez-en quelques-uns.',
      ),
      widget: () => <SubsetSwitches items={['a', 'b', 'c', 'd']} />,
    },
    {
      kind: 'number',
      body: t('How many subsets does a set of 5 items have?', 'Combien de sous-ensembles un ensemble de 5 objets a-t-il ?'),
      answer: 32,
      hint: t('Each item: yes or no. Multiply the choices.', 'Chaque objet : oui ou non. Multipliez les choix.'),
      explain: t(
        '$2 \\times 2 \\times 2 \\times 2 \\times 2 = 2^5 = 32$, counting the empty subset and the full one.',
        '$2 \\times 2 \\times 2 \\times 2 \\times 2 = 2^5 = 32$, en comptant le sous-ensemble vide et l’ensemble entier.',
      ),
    },
    {
      kind: 'choice',
      body: t(
        'Checking one subset takes a millionth of a second. Roughly how long does checking **all** subsets of 50 items take?',
        'Vérifier un sous-ensemble prend un millionième de seconde. Combien de temps faut-il environ pour vérifier **tous** les sous-ensembles de 50 objets ?',
      ),
      options: t(
        ['A second', 'An hour', 'About 36 years', 'A millionth of a second'],
        ['Une seconde', 'Une heure', 'Environ 36 ans', 'Un millionième de seconde'],
      ),
      answer: 2,
      hint: t('$2^{10} \\approx 1000$, so $2^{50} \\approx 10^{15}$.', '$2^{10} \\approx 1000$, donc $2^{50} \\approx 10^{15}$.'),
      explain: t(
        '$2^{50} \\approx 1.1 \\times 10^{15}$ subsets × $10^{-6}$ s ≈ $1.1 \\times 10^9$ s ≈ 36 years. Trying everything only works for small inputs.',
        '$2^{50} \\approx 1{,}1 \\times 10^{15}$ sous-ensembles × $10^{-6}$ s ≈ $1{,}1 \\times 10^9$ s ≈ 36 ans. Tout essayer ne marche que pour de petites entrées.',
      ),
    },
    {
      kind: 'read',
      title: t('Two ways to keep a to-do list', 'Deux façons de tenir une liste de choses à faire'),
      body: t(
        `To explore every possibility, an algorithm keeps a list of things still to look at. Two kinds of list behave differently:

- a **stack** (like a pile of plates) gives back the **newest** item first;
- a **queue** (like a line at a counter) gives back the **oldest** item first.`,
        `Pour explorer toutes les possibilités, un algorithme tient une liste de choses qu’il reste à examiner. Deux sortes de listes se comportent différemment :

- une **pile** (comme une pile d’assiettes) rend d’abord l’élément le **plus récent** ;
- une **file** (comme une file d’attente au guichet) rend d’abord l’élément le **plus ancien**.`,
      ),
    },
    {
      kind: 'task',
      body: t(
        'Add a few letters to both, then take some out. Take out at least three.',
        'Ajoutez quelques lettres aux deux, puis retirez-en. Retirez-en au moins trois.',
      ),
      widget: ({ onSolved }) => <StackQueue onSolved={onSolved} />,
      success: t(
        'Same letters in, opposite orders out. Exploring with a stack dives deep first; exploring with a queue spreads out level by level.',
        'Les mêmes lettres entrent, elles ressortent dans des ordres opposés. Explorer avec une pile plonge d’abord en profondeur ; explorer avec une file s’étend niveau par niveau.',
      ),
    },
    {
      kind: 'sequence',
      body: t(
        'You add 1, 2, 3, 4 to a **stack**, then take everything out. In which order do they come out?',
        'Vous ajoutez 1, 2, 3, 4 à une **pile**, puis vous retirez tout. Dans quel ordre sortent-ils ?',
      ),
      tokens: ['1', '2', '3', '4'],
      answer: ['4', '3', '2', '1'],
      explain: t(
        'The newest comes out first: 4, 3, 2, 1. (A queue would give 1, 2, 3, 4.)',
        'Le plus récent sort en premier : 4, 3, 2, 1. (Une file donnerait 1, 2, 3, 4.)',
      ),
    },
  ],
};

/* ---------- chapter 3: make it smaller ---------- */

const guessing: Lesson = {
  id: 'c3w1',
  title: t('Guess my number', 'Devinez mon nombre'),
  summary: t(
    'You can halve a search, build an answer from a smaller case, and compute remainders.',
    'Vous savez couper une recherche en deux, construire une réponse à partir d’un cas plus petit, et calculer des restes.',
  ),
  warmup: true,
  steps: [
    {
      kind: 'task',
      title: t('A guessing game', 'Un jeu de devinette'),
      body: t(
        'Find my number. After each guess you learn whether it was too small or too big. Try to use as few guesses as possible.',
        'Trouvez mon nombre. Après chaque essai, vous apprenez s’il était trop petit ou trop grand. Essayez d’utiliser le moins d’essais possible.',
      ),
      widget: ({ onSolved }) => <GuessNumber onSolved={onSolved} />,
      success: t(
        'Each answer rules out part of the range. The best guess splits what is left into two equal halves.',
        'Chaque réponse élimine une partie de l’intervalle. Le meilleur essai coupe ce qui reste en deux moitiés égales.',
      ),
    },
    {
      kind: 'choice',
      body: t('Which strategy needs the fewest guesses in the **worst** case?', 'Quelle stratégie demande le moins d’essais dans le **pire** cas ?'),
      options: t(
        ['Try 1, 2, 3, … in order', 'Always guess the middle of what is still possible', 'Guess at random'],
        ['Essayer 1, 2, 3, … dans l’ordre', 'Toujours proposer le milieu de ce qui reste possible', 'Proposer au hasard'],
      ),
      answer: 1,
      explain: t(
        'The middle guess throws away half of the range whatever the answer. Counting up may need 100 guesses; halving needs at most 7.',
        'Proposer le milieu élimine la moitié de l’intervalle quelle que soit la réponse. Compter peut demander 100 essais ; couper en deux en demande au plus 7.',
      ),
    },
    {
      kind: 'number',
      body: t(
        'Guessing the middle each time, at most how many guesses find a number between 1 and 100?',
        'En proposant chaque fois le milieu, combien d’essais au plus faut-il pour trouver un nombre entre 1 et 100 ?',
      ),
      answer: 7,
      hint: t(
        'After each wrong guess at most half of the range is left: 100 → 50 → 25 → …',
        'Après chaque essai raté, il reste au plus la moitié de l’intervalle : 100 → 50 → 25 → …',
      ),
      explain: t(
        'Ranges of at most 100 → 50 → 25 → 12 → 6 → 3 → 1 numbers: the 7th guess is the last one needed. That is $\\lceil \\log_2 101 \\rceil = 7$.',
        'Des intervalles d’au plus 100 → 50 → 25 → 12 → 6 → 3 → 1 nombres : le 7e essai est le dernier nécessaire. Cela fait $\\lceil \\log_2 101 \\rceil = 7$.',
      ),
    },
    { kind: 'generated', make: (r) => guessesQ(r.pick([1000, 500, 5000, 1_000_000, 200, 50])) },
    {
      kind: 'read',
      title: t('Building from a smaller case', 'Construire à partir d’un cas plus petit'),
      body: t(
        `Another way to make a problem smaller: solve it for $n - 1$, then add one more piece.

How many handshakes happen when $n$ people all shake hands once? If $H(n-1)$ handshakes happen among the first $n - 1$ people, the newcomer shakes $n - 1$ more hands:

$$H(n) = H(n-1) + (n - 1), \\qquad H(1) = 0$$`,
        `Une autre façon de rendre un problème plus petit : le résoudre pour $n - 1$, puis ajouter une pièce de plus.

Combien de poignées de main quand $n$ personnes se serrent toutes la main une fois ? S’il y a $H(n-1)$ poignées de main entre les $n - 1$ premières personnes, le nouveau venu serre $n - 1$ mains de plus :

$$H(n) = H(n-1) + (n - 1), \\qquad H(1) = 0$$`,
      ),
    },
    {
      kind: 'number',
      body: t('How many handshakes among 5 people?', 'Combien de poignées de main entre 5 personnes ?'),
      answer: 10,
      hint: '$H(2) = 1$, $H(3) = 1 + 2$, …',
      explain: t(
        '$H(5) = 0 + 1 + 2 + 3 + 4 = 10$. In general $\\dfrac{n(n-1)}{2}$, a staircase sum.',
        '$H(5) = 0 + 1 + 2 + 3 + 4 = 10$. En général $\\dfrac{n(n-1)}{2}$, une somme en escalier.',
      ),
    },
    {
      kind: 'read',
      title: t('Remainders', 'Les restes'),
      body: t(
        `Dividing 17 by 5 gives 3, with **2 left over**: $17 = 3 \\times 5 + 2$. The left-over part is the **remainder**, written $17 \\bmod 5 = 2$ ("17 modulo 5").

A clock works this way: 15 hours after 0 o'clock on a 12-hour dial it shows $15 \\bmod 12 = 3$. Games and counting-out rhymes in this chapter use remainders.`,
        `Diviser 17 par 5 donne 3, et il **reste 2** : $17 = 3 \\times 5 + 2$. Ce qui reste s’appelle le **reste**, noté $17 \\bmod 5 = 2$ (« 17 modulo 5 »).

Une horloge fonctionne ainsi : 15 heures après 0 h, un cadran de 12 heures affiche $15 \\bmod 12 = 3$. Les jeux et comptines de ce chapitre utilisent les restes.`,
      ),
    },
    { kind: 'generated', make: (r) => modQ(r.int(13, 99), r.int(3, 9)) },
    {
      kind: 'choice',
      body: t(
        'Which list contains exactly the numbers with remainder 1 when divided by 4?',
        'Quelle liste contient exactement des nombres de reste 1 dans la division par 4 ?',
      ),
      options: ['1, 4, 8, 12', '1, 5, 9, 13', '4, 5, 6, 7', '0, 4, 8, 12'],
      answer: 1,
      explain: t(
        'They go up by 4 from 1: $1, 5, 9, 13, \\dots$ all equal $4k + 1$. (0, 4, 8, 12 have remainder 0.)',
        'Ils montent de 4 en 4 à partir de 1 : $1, 5, 9, 13, \\dots$ valent tous $4k + 1$. (0, 4, 8, 12 ont pour reste 0.)',
      ),
    },
  ],
};

/* ---------- chapter 4: split in two ---------- */

const halves: Lesson = {
  id: 'c4w1',
  title: t('Halves of halves', 'Des moitiés de moitiés'),
  summary: t(
    'You can merge two sorted rows, split around a pivot and see where n log n comes from.',
    'Vous savez fusionner deux rangées triées, partager autour d’un pivot et voir d’où vient n log n.',
  ),
  warmup: true,
  steps: [
    {
      kind: 'read',
      title: t('Split, solve, combine', 'Couper, résoudre, combiner'),
      body: t(
        `This chapter cuts a problem into halves, solves each half **the same way** (a recursive call), then **combines** the two answers.

Example: to sort a row, sort its left half, sort its right half, then **merge** them. Merging two sorted rows is easy: repeatedly compare their front values and take the smaller one.`,
        `Ce chapitre coupe un problème en moitiés, résout chaque moitié **de la même façon** (un appel récursif), puis **combine** les deux réponses.

Exemple : pour trier une rangée, on trie sa moitié gauche, sa moitié droite, puis on les **fusionne**. Fusionner deux rangées triées est facile : on compare sans cesse leurs premières valeurs et on prend la plus petite.`,
      ),
      widget: () => (
        <div className="flex flex-col items-center gap-2">
          <ArrayRow items={[2, 5, 8].map((v) => ({ id: `l${v}`, label: v }))} />
          <ArrayRow items={[3, 4, 9].map((v) => ({ id: `r${v}`, label: v }))} />
        </div>
      ),
    },
    {
      kind: 'sequence',
      body: t(
        'Merge the two sorted rows **2 5 8** and **3 4 9** into one sorted row.',
        'Fusionnez les deux rangées triées **2 5 8** et **3 4 9** en une seule rangée triée.',
      ),
      tokens: ['2', '3', '4', '5', '8', '9'],
      answer: ['2', '3', '4', '5', '8', '9'],
      explain: t(
        '2 vs 3 → 2; 5 vs 3 → 3; 5 vs 4 → 4; 5 vs 9 → 5; 8 vs 9 → 8; the left row is empty, so 9 follows.',
        '2 contre 3 → 2 ; 5 contre 3 → 3 ; 5 contre 4 → 4 ; 5 contre 9 → 5 ; 8 contre 9 → 8 ; la rangée de gauche est vide, donc 9 suit.',
      ),
    },
    {
      kind: 'number',
      body: t(
        'That merge made one comparison for every value placed, except the last one. At most how many comparisons does merging two sorted rows of 6 values in total take?',
        'Cette fusion a fait une comparaison pour chaque valeur placée, sauf la dernière. Combien de comparaisons au plus faut-il pour fusionner deux rangées triées de 6 valeurs en tout ?',
      ),
      answer: 5,
      explain: t(
        'Each comparison places one value; when a row runs out, the rest is copied without comparing. At most $n - 1 = 5$.',
        'Chaque comparaison place une valeur ; quand une rangée est épuisée, le reste est recopié sans comparaison. Au plus $n - 1 = 5$.',
      ),
    },
    {
      kind: 'read',
      title: t('Why halving gives n log n', 'Pourquoi couper en deux donne n log n'),
      body: t(
        'Draw the pieces level by level: the whole row on top, its halves below, their halves below that… Each level holds all $n$ items, and merging a level costs about $n$. Change $n$.',
        'Dessinez les morceaux niveau par niveau : la rangée entière en haut, ses moitiés en dessous, leurs moitiés encore en dessous… Chaque niveau contient les $n$ éléments, et fusionner un niveau coûte environ $n$. Changez $n$.',
      ),
      widget: () => <SplitLevels />,
    },
    {
      kind: 'number',
      body: t(
        'For $n = 32$ items: how many levels below the top, and so how much work in total? Give the total ($n \\times$ levels).',
        'Pour $n = 32$ éléments : combien de niveaux sous le sommet, et donc combien de travail au total ? Donnez le total ($n \\times$ niveaux).',
      ),
      answer: 160,
      hint: t('Levels = halvings from 32 down to 1.', 'Niveaux = divisions par deux de 32 jusqu’à 1.'),
      explain: t(
        '$\\log_2 32 = 5$ levels of $32$: $32 \\times 5 = 160$. That is the recurrence $T(n) = 2T(n/2) + n$, with solution $\\Theta(n \\log n)$.',
        '$\\log_2 32 = 5$ niveaux de $32$ : $32 \\times 5 = 160$. C’est la récurrence $T(n) = 2T(n/2) + n$, de solution $\\Theta(n \\log n)$.',
      ),
    },
    {
      kind: 'choice',
      body: t('For $n = 1000$, compare $n \\log_2 n$ with $n^2$.', 'Pour $n = 1000$, comparez $n \\log_2 n$ et $n^2$.'),
      options: t(
        ['About the same', '$n \\log_2 n \\approx 10\\,000$ against $n^2 = 1\\,000\\,000$: 100 times less', '$n \\log_2 n$ is bigger'],
        ['À peu près pareil', '$n \\log_2 n \\approx 10\\,000$ contre $n^2 = 1\\,000\\,000$ : 100 fois moins', '$n \\log_2 n$ est plus grand'],
      ),
      answer: 1,
      explain: t(
        '$\\log_2 1000 \\approx 10$. Splitting in halves turns a quadratic method into an $n \\log n$ one — the main idea of this chapter.',
        '$\\log_2 1000 \\approx 10$. Couper en moitiés change une méthode quadratique en une méthode en $n \\log n$ — l’idée principale de ce chapitre.',
      ),
    },
    {
      kind: 'read',
      title: t('Splitting around a pivot', 'Partager autour d’un pivot'),
      body: t(
        `Another way to split: pick one value, the **pivot**, and move the smaller values to its left and the bigger ones to its right. This is called **partitioning**. The pivot then sits exactly where it belongs in the sorted row.

With pivot 5: **5 8 2 9 1 7** becomes **2 1 · 5 · 8 9 7** (the order inside each side does not matter yet).`,
        `Une autre façon de couper : choisir une valeur, le **pivot**, et placer les valeurs plus petites à sa gauche et les plus grandes à sa droite. On appelle cela **partitionner**. Le pivot se retrouve alors exactement à sa place dans la rangée triée.

Avec le pivot 5 : **5 8 2 9 1 7** devient **2 1 · 5 · 8 9 7** (l’ordre à l’intérieur de chaque côté n’importe pas encore).`,
      ),
    },
    {
      kind: 'choice',
      body: t(
        'Partition **3 9 6 1 8 4** around the pivot **6**. Which values end up on its left?',
        'Partitionnez **3 9 6 1 8 4** autour du pivot **6**. Quelles valeurs se retrouvent à sa gauche ?',
      ),
      options: ['3, 1, 4', '9, 8', '3, 9, 1', '1, 3'],
      answer: 0,
      explain: t('The values smaller than 6 are 3, 1 and 4.', 'Les valeurs plus petites que 6 sont 3, 1 et 4.'),
    },
    {
      kind: 'number',
      body: t(
        'After that partition, at which index does the pivot 6 sit (counting from 0)?',
        'Après ce partage, à quel indice se trouve le pivot 6 (en comptant à partir de 0) ?',
      ),
      answer: 3,
      hint: t('How many values are smaller than 6?', 'Combien de valeurs sont plus petites que 6 ?'),
      explain: t(
        'Three smaller values take indexes 0, 1, 2, so 6 lands at index 3 — its place in the sorted row 1 3 4 6 8 9.',
        'Trois valeurs plus petites occupent les indices 0, 1, 2 : 6 arrive donc à l’indice 3 — sa place dans la rangée triée 1 3 4 6 8 9.',
      ),
    },
  ],
};

/* ---------- chapter 5: change the shape ---------- */

const SEARCH_TREE = node('8', node('3', leaf('1'), node('6', leaf('4'))), node('10', null, leaf('14')));
const HEAP_VALUES = [9, 7, 8, 4, 5, 6];
const heapTree = (A: number[], i = 0): TNode | null =>
  i < A.length ? { id: `h${i}`, label: String(A[i]), left: heapTree(A, 2 * i + 1), right: heapTree(A, 2 * i + 2) } : null;

const order: Lesson = {
  id: 'c5w1',
  title: t('Keeping things in order', 'Garder les choses en ordre'),
  summary: t(
    'You know the search-tree rule, the heap rule and its array layout, and binary numbers.',
    'Vous connaissez la règle des arbres de recherche, celle des tas et leur rangement en tableau, et les nombres binaires.',
  ),
  warmup: true,
  steps: [
    {
      kind: 'read',
      title: t('Search trees', 'Les arbres de recherche'),
      body: t(
        `This chapter reorganises data so that later questions become cheap. A **binary search tree** stores values in a binary tree with one rule at every node: everything in its **left** subtree is **smaller**, everything in its **right** subtree is **bigger**.

To find a value, start at the root and go left or right at each node — like the guessing game.`,
        `Ce chapitre réorganise les données pour que les questions suivantes coûtent peu. Un **arbre binaire de recherche** range des valeurs dans un arbre binaire avec une règle à chaque nœud : tout ce qui est dans son sous-arbre **gauche** est **plus petit**, tout ce qui est dans son sous-arbre **droit** est **plus grand**.

Pour trouver une valeur, on part de la racine et on va à gauche ou à droite à chaque nœud — comme au jeu de devinette.`,
      ),
      widget: () => <TreeView root={SEARCH_TREE} />,
    },
    {
      kind: 'choice',
      body: t('Where would the value **7** be added to this tree?', 'Où la valeur **7** serait-elle ajoutée dans cet arbre ?'),
      widget: () => <TreeView root={SEARCH_TREE} />,
      options: t(
        ['Left child of 3', 'Right child of 6', 'Left child of 10', 'Right child of 14'],
        ['Enfant gauche de 3', 'Enfant droit de 6', 'Enfant gauche de 10', 'Enfant droit de 14'],
      ),
      answer: 1,
      hint: t(
        'From the root: 7 < 8 go left; 7 > 3 go right; then compare with 6.',
        'Depuis la racine : 7 < 8, à gauche ; 7 > 3, à droite ; puis comparez avec 6.',
      ),
      explain: t(
        '7 < 8 → left to 3; 7 > 3 → right to 6; 7 > 6 → right child of 6, which is empty: put it there.',
        '7 < 8 → à gauche vers 3 ; 7 > 3 → à droite vers 6 ; 7 > 6 → enfant droit de 6, qui est vide : on le met là.',
      ),
    },
    {
      kind: 'choice',
      body: t('How do you find the **smallest** value in a search tree?', 'Comment trouver la **plus petite** valeur d’un arbre de recherche ?'),
      options: t(
        ['Look at the root', 'Go left until you cannot', 'Go right until you cannot', 'Visit every node'],
        ['Regarder la racine', 'Aller à gauche tant que possible', 'Aller à droite tant que possible', 'Visiter tous les nœuds'],
      ),
      answer: 1,
      explain: t(
        'Smaller values are always to the left: 8 → 3 → 1. The cost is the height of the tree, which stays near $\\log_2 n$ only if the tree is kept **balanced** — the topic of one lesson here.',
        'Les valeurs plus petites sont toujours à gauche : 8 → 3 → 1. Le coût est la hauteur de l’arbre, qui ne reste proche de $\\log_2 n$ que si l’arbre est gardé **équilibré** — le sujet d’une des leçons de ce chapitre.',
      ),
    },
    {
      kind: 'read',
      title: t('Heaps', 'Les tas'),
      body: t(
        `A **heap** follows another rule: every parent is **at least as big** as its children. So the biggest value is always at the root. The tree is filled level by level, left to right, so it fits in an array with no gaps:

the children of index $i$ are at $2i + 1$ and $2i + 2$.`,
        `Un **tas** suit une autre règle : chaque parent est **au moins aussi grand** que ses enfants. La plus grande valeur est donc toujours à la racine. L’arbre est rempli niveau par niveau, de gauche à droite, et tient donc dans un tableau sans trou :

les enfants de l’indice $i$ sont aux indices $2i + 1$ et $2i + 2$.`,
      ),
      widget: () => (
        <div className="flex flex-col items-center gap-3">
          <TreeView root={heapTree(HEAP_VALUES)} />
          <ArrayRow items={HEAP_VALUES.map((v, i) => ({ id: i, label: v }))} showIndex />
        </div>
      ),
    },
    {
      kind: 'number',
      body: t(
        'In a heap stored in an array, what is the index of the **left child** of index 3?',
        'Dans un tas rangé dans un tableau, quel est l’indice de l’**enfant gauche** de l’indice 3 ?',
      ),
      answer: 7,
      explain: t('$2 \\times 3 + 1 = 7$ (and the right child is at 8).', '$2 \\times 3 + 1 = 7$ (et l’enfant droit est en 8).'),
    },
    {
      kind: 'choice',
      body: t('Is the array **9 5 8 6 1** a heap?', 'Le tableau **9 5 8 6 1** est-il un tas ?'),
      options: t(
        ['Yes', 'No: 5 has a child bigger than itself', 'No: 9 should be last'],
        ['Oui', 'Non : 5 a un enfant plus grand que lui', 'Non : 9 devrait être en dernier'],
      ),
      answer: 1,
      hint: t(
        'The children of index 1 (value 5) are at indexes 3 and 4.',
        'Les enfants de l’indice 1 (valeur 5) sont aux indices 3 et 4.',
      ),
      explain: t(
        'Index 1 holds 5, its children are 6 and 1. Since $6 > 5$, the heap rule is broken.',
        'L’indice 1 contient 5, ses enfants sont 6 et 1. Comme $6 > 5$, la règle du tas n’est pas respectée.',
      ),
    },
    {
      kind: 'read',
      title: t('Binary numbers', 'Les nombres binaires'),
      body: t(
        'Switches can also write numbers. Give the switches the values 8, 4, 2, 1 and add up those that are on: this is **binary**, counting with only the digits 0 and 1.',
        'Des interrupteurs peuvent aussi écrire des nombres. Donnez aux interrupteurs les valeurs 8, 4, 2, 1 et additionnez ceux qui sont allumés : c’est le **binaire**, compter avec seulement les chiffres 0 et 1.',
      ),
      widget: () => <SubsetSwitches items={['8', '4', '2', '1']} binary />,
    },
    {
      kind: 'number',
      body: t('What number does the binary **1011** stand for?', 'Quel nombre le binaire **1011** représente-t-il ?'),
      answer: 11,
      explain: '$8 + 0 + 2 + 1 = 11$.',
    },
    {
      kind: 'number',
      body: t(
        'How many binary digits (switches) are needed to write every number from 0 to 999?',
        'Combien de chiffres binaires (interrupteurs) faut-il pour écrire tous les nombres de 0 à 999 ?',
      ),
      answer: 10,
      hint: t('$k$ switches write $2^k$ different numbers.', '$k$ interrupteurs écrivent $2^k$ nombres différents.'),
      explain: t(
        '$2^9 = 512$ is too few, $2^{10} = 1024$ is enough: 10 digits, about $\\log_2 1000$.',
        '$2^9 = 512$ ne suffit pas, $2^{10} = 1024$ suffit : 10 chiffres, environ $\\log_2 1000$.',
      ),
    },
  ],
};

/* ---------- chapter 6: memory for speed ---------- */

const TALLY_INPUT = [2, 0, 3, 2, 1, 2, 0];

const notes: Lesson = {
  id: 'c6w1',
  title: t('Notes that save time', 'Des notes qui font gagner du temps'),
  summary: t(
    'You can tally values, turn counts into running totals and see when extra memory pays.',
    'Vous savez compter des valeurs, changer des comptes en totaux cumulés et voir quand de la mémoire en plus est rentable.',
  ),
  warmup: true,
  steps: [
    {
      kind: 'read',
      title: t('Keep a tally', 'Tenir les comptes'),
      body: t(
        `When the values are small whole numbers, you can **count** them instead of comparing them. One pass over the row, with one counter per possible value:

values 0 1 2 3 → counts **2 1 3 1** (two 0s, one 1, three 2s, one 3).

The counters are **extra memory**, used to save time.`,
        `Quand les valeurs sont de petits nombres entiers, on peut les **compter** au lieu de les comparer. Un seul passage sur la rangée, avec un compteur par valeur possible :

valeurs 0 1 2 3 → comptes **2 1 3 1** (deux 0, un 1, trois 2, un 3).

Les compteurs sont de la **mémoire en plus**, utilisée pour gagner du temps.`,
      ),
      widget: () => <ArrayRow items={TALLY_INPUT.map((v, i) => ({ id: i, label: v }))} showIndex />,
    },
    {
      kind: 'number',
      body: t('How many times does the value 3 appear in **3 1 0 3 3 0 2 3**?', 'Combien de fois la valeur 3 apparaît-elle dans **3 1 0 3 3 0 2 3** ?'),
      answer: 4,
      explain: t('Indexes 0, 3, 4 and 7: four 3s.', 'Indices 0, 3, 4 et 7 : quatre 3.'),
    },
    {
      kind: 'read',
      title: t('Running totals', 'Les totaux cumulés'),
      body: t(
        `Add the counts up as you go: **2 1 3 1** becomes **2 3 6 7**. These **running totals** say where each value ends in the sorted row:

the 0s fill places 1–2, the 1 is place 3, the 2s fill places 4–6, the 3 is place 7. So **0 0 1 2 2 2 3**, without a single comparison.`,
        `Additionnez les comptes au fur et à mesure : **2 1 3 1** devient **2 3 6 7**. Ces **totaux cumulés** disent où chaque valeur se termine dans la rangée triée :

les 0 occupent les places 1–2, le 1 la place 3, les 2 les places 4–6, le 3 la place 7. Donc **0 0 1 2 2 2 3**, sans une seule comparaison.`,
      ),
    },
    {
      kind: 'sequence',
      body: t('Turn the counts **1 4 2 3** into running totals.', 'Changez les comptes **1 4 2 3** en totaux cumulés.'),
      tokens: ['1', '5', '7', '10', '4', '6'],
      answer: ['1', '5', '7', '10'],
      hint: t('Each total is the previous total plus the next count.', 'Chaque total est le total précédent plus le compte suivant.'),
      explain: t(
        '$1$, $1 + 4 = 5$, $5 + 2 = 7$, $7 + 3 = 10$. The last total is always the number of values.',
        '$1$, $1 + 4 = 5$, $5 + 2 = 7$, $7 + 3 = 10$. Le dernier total est toujours le nombre de valeurs.',
      ),
    },
    {
      kind: 'number',
      body: t(
        'With the counts **1 4 2 3** (for the values 0, 1, 2, 3), how many values come before the first 3 in the sorted row?',
        'Avec les comptes **1 4 2 3** (pour les valeurs 0, 1, 2, 3), combien de valeurs précèdent le premier 3 dans la rangée triée ?',
      ),
      answer: 7,
      explain: t(
        'The running total just before value 3 is 7: seven values (0s, 1s and 2s) come first.',
        'Le total cumulé juste avant la valeur 3 est 7 : sept valeurs (les 0, les 1 et les 2) viennent avant.',
      ),
    },
    {
      kind: 'choice',
      body: t('For which input is counting a good idea?', 'Pour quelle entrée compter est-il une bonne idée ?'),
      options: t(
        ['The marks from 0 to 20 of 10 000 students', 'Ten values anywhere between 0 and one billion', 'Names of people'],
        ['Les notes de 0 à 20 de 10 000 étudiants', 'Dix valeurs quelconques entre 0 et un milliard', 'Des noms de personnes'],
      ),
      answer: 0,
      explain: t(
        'Counting needs one counter per possible value: 21 counters for 10 000 marks is cheap. A billion counters for ten values would waste memory and time.',
        'Compter demande un compteur par valeur possible : 21 compteurs pour 10 000 notes, c’est peu. Un milliard de compteurs pour dix valeurs gaspillerait mémoire et temps.',
      ),
    },
  ],
};

/* ---------- chapter 7: best step first ---------- */

const ROUTE: { nodes: GNode[]; edges: GEdge[] } = {
  nodes: [
    { id: 's', x: 40, y: 100 },
    { id: 'a', x: 160, y: 40 },
    { id: 'b', x: 160, y: 160 },
    { id: 't', x: 300, y: 100 },
  ],
  edges: [
    { u: 's', v: 'a', w: 1 },
    { u: 's', v: 'b', w: 4 },
    { u: 'a', v: 'b', w: 2 },
    { u: 'a', v: 't', w: 6 },
    { u: 'b', v: 't', w: 1 },
  ],
};

const bestMove: Lesson = {
  id: 'c7w1',
  title: t('The best-looking move', 'Le coup qui semble le meilleur'),
  summary: t(
    'You saw when grabbing the best move right now works, when it fails, and how to measure routes.',
    'Vous avez vu quand prendre le meilleur coup immédiat marche, quand il échoue, et comment mesurer des trajets.',
  ),
  warmup: true,
  steps: [
    {
      kind: 'read',
      title: t('Grab the biggest coin', 'Prendre la plus grosse pièce'),
      body: t(
        `To pay an amount with as few coins as possible, a natural rule is: **take the biggest coin that still fits**, again and again. With coins 1, 2 and 5, the amount 9 becomes $5 + 2 + 2$: three coins.

Methods that always make the move that looks best **right now**, and never go back, are the topic of this chapter.`,
        `Pour payer une somme avec le moins de pièces possible, une règle naturelle est : **prendre la plus grosse pièce qui rentre encore**, encore et encore. Avec des pièces de 1, 2 et 5, la somme 9 devient $5 + 2 + 2$ : trois pièces.

Les méthodes qui jouent toujours le coup qui semble le meilleur **tout de suite**, sans jamais revenir en arrière, sont le sujet de ce chapitre.`,
      ),
    },
    {
      kind: 'number',
      body: t('With coins 1, 2 and 5, how many coins does that rule use for 18?', 'Avec des pièces de 1, 2 et 5, combien de pièces cette règle utilise-t-elle pour 18 ?'),
      answer: 5,
      explain: t(
        '$5 + 5 + 5 + 2 + 1$: five coins (and that is the fewest possible).',
        '$5 + 5 + 5 + 2 + 1$ : cinq pièces (et c’est le minimum possible).',
      ),
    },
    {
      kind: 'choice',
      body: t(
        'Now the coins are 1, 3 and 4, and the amount is 6. The rule gives $4 + 1 + 1$. What is the **fewest** number of coins?',
        'Maintenant les pièces valent 1, 3 et 4, et la somme est 6. La règle donne $4 + 1 + 1$. Quel est le **plus petit** nombre de pièces ?',
      ),
      options: t(
        ['3 coins: the rule is right', '2 coins: 3 + 3', '1 coin', '6 coins'],
        ['3 pièces : la règle a raison', '2 pièces : 3 + 3', '1 pièce', '6 pièces'],
      ),
      answer: 1,
      explain: t(
        '$3 + 3$ uses 2 coins. Grabbing the 4 looked best but ruined the rest. A best-looking move is only safe when you can **prove** it never hurts — the real question of this chapter.',
        '$3 + 3$ utilise 2 pièces. Prendre le 4 semblait le meilleur choix mais a gâché la suite. Un coup qui semble le meilleur n’est sûr que si l’on peut **prouver** qu’il ne nuit jamais — la vraie question de ce chapitre.',
      ),
    },
    {
      kind: 'read',
      title: t('Measuring routes', 'Mesurer des trajets'),
      body: t(
        'Recall: in a weighted graph, the length of a path is the sum of its weights. Find routes from **s** to **t** in this graph.',
        'Rappel : dans un graphe pondéré, la longueur d’un chemin est la somme de ses poids. Trouvez des trajets de **s** à **t** dans ce graphe.',
      ),
      widget: () => <GraphView nodes={ROUTE.nodes} edges={ROUTE.edges} width={340} height={200} />,
    },
    {
      kind: 'number',
      body: t('What is the length of the path s–a–t?', 'Quelle est la longueur du chemin s–a–t ?'),
      widget: () => <GraphView nodes={ROUTE.nodes} edges={ROUTE.edges} width={340} height={200} />,
      answer: 7,
      explain: '$1 + 6 = 7$.',
    },
    {
      kind: 'number',
      body: t('What is the length of the **shortest** path from s to t?', 'Quelle est la longueur du **plus court** chemin de s à t ?'),
      widget: () => <GraphView nodes={ROUTE.nodes} edges={ROUTE.edges} width={340} height={200} />,
      answer: 4,
      hint: t('Try s–a–b–t.', 'Essayez s–a–b–t.'),
      explain: t(
        's–a–b–t costs $1 + 2 + 1 = 4$, shorter than s–b–t (5) and s–a–t (7).',
        's–a–b–t coûte $1 + 2 + 1 = 4$, plus court que s–b–t (5) et s–a–t (7).',
      ),
    },
    {
      kind: 'sequence',
      body: t(
        'A safe way to find shortest routes from s: repeatedly settle the **closest** vertex not settled yet. Distances from s are a 1, b 3, t 4. In which order are the vertices settled?',
        'Une façon sûre de trouver les plus courts trajets depuis s : fixer à chaque fois le sommet **le plus proche** pas encore fixé. Les distances depuis s sont a 1, b 3, t 4. Dans quel ordre les sommets sont-ils fixés ?',
      ),
      widget: () => <GraphView nodes={ROUTE.nodes} edges={ROUTE.edges} width={340} height={200} />,
      tokens: ['s', 'a', 'b', 't'],
      answer: ['s', 'a', 'b', 't'],
      explain: t(
        'By increasing distance: s (0), a (1), b (3), t (4). This is the idea of the shortest-route method in this chapter, and here the best-looking choice is provably safe.',
        'Par distance croissante : s (0), a (1), b (3), t (4). C’est l’idée de la méthode des plus courts trajets de ce chapitre, et ici le choix qui semble le meilleur est sûr, preuve à l’appui.',
      ),
    },
  ],
};

/* ---------- chapter 8: puzzle box ---------- */

const QUESTIONS_TREE: TNode = {
  id: 'q1',
  label: '≤ 2?',
  left: { id: 'q2', label: '= 1?', left: leaf('1'), right: leaf('2') },
  right: { id: 'q3', label: '= 3?', left: leaf('3'), right: leaf('4') },
};

const questions: Lesson = {
  id: 'c8w1',
  title: t('Questions as a tree', 'Des questions en arbre'),
  summary: t(
    'You can count how many yes/no questions, weighings or matches a puzzle needs at least.',
    'Vous savez compter le nombre minimum de questions oui/non, de pesées ou de matchs qu’il faut à une énigme.',
  ),
  warmup: true,
  steps: [
    {
      kind: 'read',
      title: t('Each answer splits the cases', 'Chaque réponse partage les cas'),
      body: t(
        `To find which of 4 cases is true with yes/no questions, ask "≤ 2?", then one more question. Draw it as a tree: each question is a node, each answer a branch (left = yes), each leaf one case.

$k$ questions give at most $2^k$ leaves, so they can tell apart at most $2^k$ cases.`,
        `Pour trouver lequel de 4 cas est vrai avec des questions oui/non, demandez « ≤ 2 ? », puis une question de plus. Dessinez-le en arbre : chaque question est un nœud, chaque réponse une branche (gauche = oui), chaque feuille un cas.

$k$ questions donnent au plus $2^k$ feuilles : elles distinguent donc au plus $2^k$ cas.`,
      ),
      widget: () => <TreeView root={QUESTIONS_TREE} colW={58} />,
    },
    {
      kind: 'number',
      body: t('How many cases can 3 yes/no questions tell apart, at most?', 'Combien de cas 3 questions oui/non peuvent-elles distinguer, au plus ?'),
      answer: 8,
      explain: t('$2^3 = 8$ leaves.', '$2^3 = 8$ feuilles.'),
    },
    {
      kind: 'number',
      body: t(
        'At least how many yes/no questions are needed to tell apart 1000 cases?',
        'Combien de questions oui/non faut-il au minimum pour distinguer 1000 cas ?',
      ),
      answer: 10,
      hint: t('Find the smallest $k$ with $2^k \\ge 1000$.', 'Trouvez le plus petit $k$ tel que $2^k \\ge 1000$.'),
      explain: t(
        '$2^9 = 512 < 1000 \\le 1024 = 2^{10}$: 10 questions, $\\lceil \\log_2 1000 \\rceil$. No cleverness can do better — a lower bound.',
        '$2^9 = 512 < 1000 \\le 1024 = 2^{10}$ : 10 questions, $\\lceil \\log_2 1000 \\rceil$. Aucune astuce ne fera mieux — c’est une borne inférieure.',
      ),
    },
    {
      kind: 'read',
      title: t('Three answers', 'Trois réponses'),
      body: t(
        'A balance scale has **three** outcomes: left heavier, right heavier, or balanced. So $k$ weighings can tell apart up to $3^k$ cases. To find one heavier coin among 9, weigh 3 against 3: the heavy coin is in the heavier group, or in the 3 left aside if they balance.',
        'Une balance à plateaux a **trois** résultats : gauche plus lourd, droite plus lourd, ou équilibre. $k$ pesées distinguent donc jusqu’à $3^k$ cas. Pour trouver une pièce plus lourde parmi 9, pesez 3 contre 3 : la pièce lourde est dans le groupe le plus lourd, ou parmi les 3 mises de côté s’il y a équilibre.',
      ),
    },
    {
      kind: 'number',
      body: t('Among 9 coins one is heavier. How many weighings are needed?', 'Parmi 9 pièces, une est plus lourde. Combien de pesées faut-il ?'),
      answer: 2,
      explain: t(
        'First weighing: 3 against 3 keeps 3 suspects. Second: 1 against 1 finds it. $3^2 = 9$ cases, 2 weighings.',
        'Première pesée : 3 contre 3 laisse 3 suspectes. Deuxième : 1 contre 1 la trouve. $3^2 = 9$ cas, 2 pesées.',
      ),
    },
    {
      kind: 'number',
      body: t('Among 27 coins one is heavier. How many weighings are needed?', 'Parmi 27 pièces, une est plus lourde. Combien de pesées faut-il ?'),
      answer: 3,
      explain: t(
        'Groups of 9, then 3, then 1: three weighings, since $3^3 = 27$.',
        'Des groupes de 9, puis de 3, puis de 1 : trois pesées, puisque $3^3 = 27$.',
      ),
    },
    {
      kind: 'read',
      title: t('Knock-out matches', 'Les matchs à élimination'),
      body: t(
        'In a knock-out tournament every match eliminates exactly one player, and everyone but the winner is eliminated once. So $n$ players play exactly $n - 1$ matches — just like the $n - 1$ comparisons needed to find the largest value.',
        'Dans un tournoi à élimination directe, chaque match élimine exactement un joueur, et tous sauf le vainqueur sont éliminés une fois. $n$ joueurs disputent donc exactement $n - 1$ matchs — tout comme les $n - 1$ comparaisons nécessaires pour trouver la plus grande valeur.',
      ),
      widget: () => (
        <CodeBlock
          lines={t(
            ['round 1:  8 players → 4 matches', 'round 2:  4 players → 2 matches', 'round 3:  2 players → 1 match', 'total: 7 matches, 3 rounds'],
            ['tour 1 :  8 joueurs → 4 matchs', 'tour 2 :  4 joueurs → 2 matchs', 'tour 3 :  2 joueurs → 1 match', 'total : 7 matchs, 3 tours'],
          )}
        />
      ),
    },
    {
      kind: 'number',
      body: t('A knock-out tournament has 16 players. How many matches are played?', 'Un tournoi à élimination directe compte 16 joueurs. Combien de matchs sont joués ?'),
      answer: 15,
      explain: t(
        '$16 - 1 = 15$: each match knocks out one player and 15 must go.',
        '$16 - 1 = 15$ : chaque match élimine un joueur et 15 doivent partir.',
      ),
    },
    {
      kind: 'number',
      body: t('And how many rounds does it last?', 'Et combien de tours dure-t-il ?'),
      answer: 4,
      explain: t(
        '16 → 8 → 4 → 2 → 1: $\\log_2 16 = 4$ rounds. The winner plays one match per round.',
        '16 → 8 → 4 → 2 → 1 : $\\log_2 16 = 4$ tours. Le vainqueur joue un match par tour.',
      ),
    },
  ],
};

export const warmups = { c2: possibilities, c3: guessing, c4: halves, c5: order, c6: notes, c7: bestMove, c8: questions };
