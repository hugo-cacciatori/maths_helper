import { t } from '../../lib/i18n';
import type { Lesson } from '../../lib/types';
import { ComparisonCountingViz, DistributionCountingViz, type Rec } from '../../widgets/memory';

export const SAMPLE_RECORDS: Rec[] = [
  [16, 'A'],
  [15, 'B'],
  [13, 'C'],
  [15, 'D'],
  [12, 'E'],
  [18, 'F'],
  [15, 'G'],
  [13, 'H'],
];

const countingSort: Lesson = {
  id: 'c6l1',
  title: t('Sorting without swapping', 'Trier sans échanger'),
  summary: t(
    'You traded extra memory for speed: counting sorts that place each element directly.',
    'Vous avez échangé de la mémoire contre de la vitesse : des tris par comptage qui placent chaque élément directement.',
  ),
  steps: [
    {
      kind: 'read',
      title: t('Space for time', 'De la place contre du temps'),
      body: t(
        '**Memory for speed**: use extra memory to store information that makes the algorithm faster. Counting sorts never move elements around by comparing neighbours — they *compute* where each element belongs.',
        '**De la mémoire pour la vitesse** : utiliser de la mémoire en plus pour stocker des informations qui rendent l’algorithme plus rapide. Les tris par comptage ne déplacent jamais les éléments en comparant des voisins — ils *calculent* où chaque élément doit aller.',
      ),
    },
    {
      kind: 'task',
      title: t('Comparison counting', 'Comptage par comparaisons'),
      body: t(
        'For each element, count how many elements are **smaller** than it: that count is exactly its position in the sorted array. Sort **60, 35, 81, 98, 14, 47**.',
        'Pour chaque élément, comptez combien d’éléments sont **plus petits** que lui : ce compte est exactement sa position dans le tableau trié. Triez **60, 35, 81, 98, 14, 47**.',
      ),
      widget: ({ onSolved }) => <ComparisonCountingViz A={[60, 35, 81, 98, 14, 47]} onSolved={onSolved} />,
      success: t('Counts 3 1 4 5 0 2 → S = 14 35 47 60 81 98.', 'Comptes 3 1 4 5 0 2 → S = 14 35 47 60 81 98.'),
    },
    {
      kind: 'choice',
      body: t(
        'Is comparison counting sort **stable**? Is it **in place**? (Think of two equal keys $x_1, x_2$: when they are compared, the `else` branch increments Count of the **first** one.)',
        'Le tri par comptage de comparaisons est-il **stable** ? Est-il **sur place** ? (Pensez à deux clés égales $x_1, x_2$ : quand on les compare, la branche `else` incrémente le Count de la **première**.)',
      ),
      options: t(
        ['Stable and in place', 'Stable, not in place', 'Not stable, not in place', 'Not stable, in place'],
        ['Stable et sur place', 'Stable, pas sur place', 'Ni stable, ni sur place', 'Pas stable, sur place'],
      ),
      answer: 2,
      explain: t(
        'For equal keys the earlier one gets the bigger count, so it ends up **after** the later one: the order is reversed — not stable. And it needs the extra arrays Count and S: not in place. It also makes $\\frac{n(n-1)}{2}$ comparisons: $\\Theta(n^2)$.',
        'Pour des clés égales, la première reçoit le plus grand compte, elle se retrouve donc **après** la seconde : l’ordre est inversé — pas stable. Et il faut les tableaux supplémentaires Count et S : pas sur place. Il fait aussi $\\frac{n(n-1)}{2}$ comparaisons : $\\Theta(n^2)$.',
      ),
    },
    {
      kind: 'task',
      title: t('Distribution counting', 'Comptage par distribution'),
      body: t(
        `When keys are integers in a small range $[l, u]$, we can do much better:
1. count the **frequency** of each key;
2. turn frequencies into **cumulative** counts (number of keys $\\le k$) — the last position of key $k$;
3. scan the input **from right to left**, putting each element at its key's position and decrementing it.

Trace it on these (key, element) pairs.`,
        `Quand les clés sont des entiers dans un petit intervalle $[l, u]$, on peut faire bien mieux :
1. compter la **fréquence** de chaque clé ;
2. changer les fréquences en comptes **cumulés** (nombre de clés $\\le k$) — la dernière position de la clé $k$ ;
3. parcourir l’entrée **de droite à gauche**, en plaçant chaque élément à la position de sa clé, puis en la décrémentant.

Suivez-le sur ces paires (clé, élément).`,
      ),
      widget: ({ onSolved }) => <DistributionCountingViz V={SAMPLE_RECORDS} lo={12} hi={18} onSolved={onSolved} />,
      success: t(
        'Result: (12,E) (13,C) (13,H) (15,B) (15,D) (15,G) (16,A) (18,F).',
        'Résultat : (12,E) (13,C) (13,H) (15,B) (15,D) (15,G) (16,A) (18,F).',
      ),
    },
    {
      kind: 'choice',
      body: t('Is distribution counting stable?', 'Le comptage par distribution est-il stable ?'),
      options: t(
        ['Yes — scanning right to left fills each key’s slots from the back, so equal keys keep their order', 'No — equal keys are reversed', 'Only if all keys are distinct'],
        ['Oui — parcourir de droite à gauche remplit les places de chaque clé par la fin, donc les clés égales gardent leur ordre', 'Non — les clés égales sont inversées', 'Seulement si toutes les clés sont distinctes'],
      ),
      answer: 0,
      explain: t(
        'C stays before H (both 13), and B, D, G (all 15) keep their order. Stability is why it is used as the building block of radix sort.',
        'C reste avant H (tous deux 13), et B, D, G (tous 15) gardent leur ordre. C’est grâce à sa stabilité qu’il sert de brique de base au tri par base (radix).',
      ),
    },
    {
      kind: 'choice',
      body: t(
        'What is its time complexity, for $n$ elements and a key range of size $k = u - l + 1$? When is it worthwhile?',
        'Quelle est sa complexité en temps, pour $n$ éléments et un intervalle de clés de taille $k = u - l + 1$ ? Quand est-il intéressant ?',
      ),
      options: t(
        ['$\\Theta(n\\log n)$, always', '$\\Theta(n + k)$ — great when $k$ is not much larger than $n$', '$\\Theta(nk)$ — only for tiny $k$', '$\\Theta(n^2)$'],
        ['$\\Theta(n\\log n)$, toujours', '$\\Theta(n + k)$ — excellent quand $k$ n’est pas beaucoup plus grand que $n$', '$\\Theta(nk)$ — seulement pour $k$ minuscule', '$\\Theta(n^2)$'],
      ),
      answer: 1,
      explain: t(
        'Two passes over the data and two over the key range. With a huge range (e.g. arbitrary 64-bit integers) the Frequences array becomes impractical.',
        'Deux passages sur les données et deux sur l’intervalle des clés. Avec un intervalle énorme (par exemple des entiers quelconques sur 64 bits), le tableau des fréquences devient impraticable.',
      ),
    },
    {
      kind: 'choice',
      body: t(
        'A special case: the array contains the $n$ **distinct** integers $1, \\dots, n$ in some order. Which one-liner sorts it into $S$?',
        'Un cas particulier : le tableau contient les $n$ entiers **distincts** $1, \\dots, n$ dans un certain ordre. Quelle ligne unique le trie dans $S$ ?',
      ),
      options: t(
        ['`for i ← 1 to n do S[i] ← i`', '`for i ← 1 to n do S[A[i]] ← A[i]`', '`for i ← 1 to n do S[i] ← A[A[i]]`', 'It cannot be done in $\\Theta(n)$'],
        ['`for i ← 1 to n do S[i] ← i`', '`for i ← 1 to n do S[A[i]] ← A[i]`', '`for i ← 1 to n do S[i] ← A[A[i]]`', 'C’est impossible en $\\Theta(n)$'],
      ),
      answer: 1,
      explain: t(
        'Each value *is* its own final position. (Option A also produces the right array — without even reading $A$! — which is why real counting sorts carry the elements’ data along.)',
        'Chaque valeur *est* sa propre position finale. (L’option A produit aussi le bon tableau — sans même lire $A$ ! — c’est pourquoi les vrais tris par comptage transportent les données des éléments avec eux.)',
      ),
    },
  ],
};

export const ch6Lessons = [countingSort];
