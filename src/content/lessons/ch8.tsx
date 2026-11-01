import { t } from '../../lib/i18n';
import type { Lesson, QuestionStep } from '../../lib/types';
import { BalanceScale, kadaneFrames, MaxSubarray, TournamentViz } from '../../widgets/puzzles';

/* ---------- practice questions with fresh numbers ---------- */

const minus = (x: number) => String(x).replace('-', '−');

export const maxRunQ = (A: number[]): QuestionStep => {
  const last = kadaneFrames(A).at(-1)!;
  const [i, j] = last.bestRange!;
  return {
    kind: 'number',
    body: t(
      `What is the maximum subarray sum of **${A.map(minus).join(', ')}**?`,
      `Quelle est la somme maximale d’une suite de cases consécutives de **${A.map(minus).join(', ')}** ?`,
    ),
    answer: last.best,
    hint: t(
      'Keep a running sum; reset it to 0 whenever it goes negative, and remember the best value seen.',
      'Gardez une somme courante ; remettez-la à 0 dès qu’elle devient négative, et retenez la meilleure valeur vue.',
    ),
    explain: `$${A.slice(i, j + 1)
      .map((x, k) => (k === 0 ? String(x) : x < 0 ? `- ${-x}` : `+ ${x}`))
      .join(' ')} = ${last.best}$.`,
  };
};

export const pilesQ = (fake: number): QuestionStep => ({
  kind: 'number',
  title: t('Ten piles, one weighing', 'Dix piles, une pesée'),
  body: t(
    `You have **10 piles** of coins. One pile is entirely fake: fakes weigh **11 g**, genuine coins **10 g**. A scale gives the exact weight.

Take **1** coin from pile 1, **2** from pile 2, …, **10** from pile 10, and weigh them all together, **once**. The scale shows **${550 + fake} g**. Which pile is fake?`,
    `Vous avez **10 piles** de pièces. Une pile est entièrement fausse : les fausses pèsent **11 g**, les vraies **10 g**. Une balance donne le poids exact.

Prenez **1** pièce de la pile 1, **2** de la pile 2, …, **10** de la pile 10, et pesez-les toutes ensemble, **une seule fois**. La balance indique **${550 + fake} g**. Quelle pile est fausse ?`,
  ),
  answer: fake,
  hint: t(
    'If every coin were genuine, how much would $1 + 2 + \\dots + 10$ coins weigh?',
    'Si toutes les pièces étaient vraies, combien pèseraient $1 + 2 + \\dots + 10$ pièces ?',
  ),
  explain: t(
    `55 genuine coins would weigh 550 g. Each fake coin adds 1 g, and pile $i$ contributed $i$ coins: $${550 + fake} - 550 = ${fake}$ → pile ${fake}. One weighing, instead of up to $n - 1$ with the direct method.`,
    `55 vraies pièces pèseraient 550 g. Chaque fausse pièce ajoute 1 g, et la pile $i$ a fourni $i$ pièces : $${550 + fake} - 550 = ${fake}$ → pile ${fake}. Une seule pesée, au lieu de jusqu’à $n - 1$ avec la méthode directe.`,
  ),
});

export const weighingsQ = (n: number): QuestionStep => {
  let k = 0;
  while (3 ** k < n) k++;
  const bound = k > 0 ? `$3^{${k - 1}} = ${3 ** (k - 1)} < ${n} \\le 3^{${k}} = ${3 ** k}$` : `$${n} \\le 1$`;
  return {
    kind: 'number',
    body: t(
      `With 3 outcomes per weighing, $k$ weighings can distinguish at most $3^k$ cases. What is the minimum number of weighings for **${n}** coins (one lighter)?`,
      `Avec 3 résultats par pesée, $k$ pesées distinguent au plus $3^k$ cas. Quel est le nombre minimum de pesées pour **${n}** pièces (dont une plus légère) ?`,
    ),
    answer: k,
    explain: t(
      `${bound}: **${k}** weighings, splitting the suspects into three groups as equal as possible each time. In general $\\lceil\\log_3 n\\rceil$.`,
      `${bound} : **${k}** pesées, en partageant à chaque fois les suspectes en trois groupes aussi égaux que possible. En général $\\lceil\\log_3 n\\rceil$.`,
    ),
  };
};

const tournamentLesson: Lesson = {
  id: 'c8l1',
  title: t('Finding the runner-up', 'Trouver le deuxième'),
  summary: t(
    'You found the second largest element with n + ⌈log₂ n⌉ − 2 comparisons using a tournament.',
    'Vous avez trouvé le deuxième plus grand élément avec n + ⌈log₂ n⌉ − 2 comparaisons grâce à un tournoi.',
  ),
  steps: [
    {
      kind: 'choice',
      title: t('The naive way', 'La façon naïve'),
      body: t(
        'A simple algorithm for the second largest of $n$ distinct values: find the maximum ($n - 1$ comparisons), remove it, and find the maximum of the rest. How many comparisons in total?',
        'Un algorithme simple pour la deuxième plus grande de $n$ valeurs distinctes : trouver le maximum ($n - 1$ comparaisons), le retirer, et trouver le maximum du reste. Combien de comparaisons en tout ?',
      ),
      options: ['$n - 1$', '$2n - 3$', '$n \\log_2 n$', '$n^2/2$'],
      answer: 1,
      explain: t(
        '$(n-1) + (n-2) = 2n - 3$. Can we reuse what the first search learnt?',
        '$(n-1) + (n-2) = 2n - 3$. Peut-on réutiliser ce que la première recherche a appris ?',
      ),
    },
    {
      kind: 'task',
      title: t('Organise a tournament', 'Organiser un tournoi'),
      body: t(
        'Knock-out tournament on **[3, 1, 2, 5, 6, 8, 9, 4]**: in each round, neighbours play and the larger value goes through. Step through the rounds, then the playoff.',
        'Tournoi à élimination directe sur **[3, 1, 2, 5, 6, 8, 9, 4]** : à chaque tour, les voisins s’affrontent et la plus grande valeur passe. Avancez à travers les tours, puis le match de barrage.',
      ),
      widget: ({ onSolved }) => <TournamentViz values={[3, 1, 2, 5, 6, 8, 9, 4]} onSolved={onSolved} />,
      success: t(
        'The second best must have lost **directly** to the champion — every other player lost to someone who is not the best.',
        'Le deuxième meilleur a forcément perdu **directement** contre le champion — tous les autres joueurs ont perdu contre quelqu’un qui n’est pas le meilleur.',
      ),
    },
    {
      kind: 'number',
      body: t(
        'How many matches are played in a knock-out tournament with $n$ players (here $n = 8$)?',
        'Combien de matchs sont joués dans un tournoi à élimination directe de $n$ joueurs (ici $n = 8$) ?',
      ),
      answer: 7,
      explain: t(
        'Every match eliminates exactly one player and all but one are eliminated: $n - 1$ matches.',
        'Chaque match élimine exactement un joueur et tous sauf un sont éliminés : $n - 1$ matchs.',
      ),
    },
    {
      kind: 'choice',
      body: t('How many rounds for $n$ players (with $n = 2^k$)?', 'Combien de tours pour $n$ joueurs (avec $n = 2^k$) ?'),
      options: ['$n/2$', '$\\log_2 n$', '$\\sqrt n$', '$n - 1$'],
      answer: 1,
      explain: t(
        'Each round halves the number of players: $\\log_2 n$ rounds (3 for 8 players). So the champion played $\\log_2 n$ matches, and that is how many candidates there are for second place.',
        'Chaque tour divise le nombre de joueurs par deux : $\\log_2 n$ tours (3 pour 8 joueurs). Le champion a donc joué $\\log_2 n$ matchs, et c’est le nombre de candidats à la deuxième place.',
      ),
    },
    {
      kind: 'choice',
      body: t('Total cost of the tournament method for the second largest?', 'Coût total de la méthode du tournoi pour la deuxième plus grande valeur ?'),
      options: ['$n - 1$', '$n + \\lceil\\log_2 n\\rceil - 2$', '$2n - 3$', '$\\frac{3n}{2}$'],
      answer: 1,
      explain: t(
        '$n - 1$ matches for the tournament, then $\\lceil\\log_2 n\\rceil - 1$ comparisons among the champion’s victims: $7 + 2 = 9$ here, against 13 for the naive method. This is in fact optimal.',
        '$n - 1$ matchs pour le tournoi, puis $\\lceil\\log_2 n\\rceil - 1$ comparaisons entre les victimes du champion : $7 + 2 = 9$ ici, contre 13 pour la méthode naïve. C’est en fait optimal.',
      ),
    },
  ],
};

const kadane: Lesson = {
  id: 'c8l2',
  title: t('Best streak in a list', 'La meilleure série d’une liste'),
  summary: t(
    'You went from a Θ(n²) the direct method to a single Θ(n) pass for the maximum-sum subarray.',
    'Vous êtes passé d’une méthode directe en Θ(n²) à un seul passage en Θ(n) pour la suite consécutive de somme maximale.',
  ),
  steps: [
    {
      kind: 'read',
      title: t('The problem', 'Le problème'),
      body: t(
        `Given integers $A_1, \\dots, A_n$ (positive or negative), find the largest value of $\\sum_{k=i}^{j} A_k$ over all $i \\le j$ (an empty sum counts as 0).

The direct method tries all $\\frac{n(n+1)}{2}$ pairs $(i, j)$ — $\\Theta(n^2)$ even when sums are updated incrementally, $\\Theta(n^3)$ if each is recomputed.`,
        `Étant donnés des entiers $A_1, \\dots, A_n$ (positifs ou négatifs), trouvez la plus grande valeur de $\\sum_{k=i}^{j} A_k$ pour tous les $i \\le j$ (une somme vide compte pour 0).

La méthode directe essaie les $\\frac{n(n+1)}{2}$ paires $(i, j)$ — $\\Theta(n^2)$ même en mettant les sommes à jour au fur et à mesure, $\\Theta(n^3)$ si on recalcule chacune.`,
      ),
    },
    {
      kind: 'task',
      title: t('One pass', 'Un seul passage'),
      body: t(
        'Key idea: if the running sum of the current run becomes **negative**, it can only lower whatever comes next — so drop it (reset to 0) and start a new run. Step through.',
        'Idée clé : si la somme courante de la série en cours devient **négative**, elle ne peut que faire baisser la suite — on l’abandonne (remise à 0) et on commence une nouvelle série. Avancez pas à pas.',
      ),
      widget: ({ onSolved }) => <MaxSubarray A={[2, -3, 4, -1, -2, 1, 5, -3]} onSolved={onSolved} />,
      success: t('The dashed box is the best run found so far.', 'Le cadre en pointillés est la meilleure série trouvée jusqu’ici.'),
    },
    {
      kind: 'generated',
      make: (r) => {
        let A: number[];
        do A = Array.from({ length: 8 }, () => r.int(-6, 6));
        while (!A.some((x) => x > 0));
        return maxRunQ(A);
      },
    },
    {
      kind: 'choice',
      body: t(
        'What is the complexity of this one-pass algorithm (Kadane’s)?',
        'Quelle est la complexité de cet algorithme en un passage (celui de Kadane) ?',
      ),
      options: ['$\\Theta(\\log n)$', '$\\Theta(n)$', '$\\Theta(n \\log n)$', '$\\Theta(n^2)$'],
      answer: 1,
      explain: t(
        'Constant work per element. (A splitting solution — best in the left half, in the right half, or crossing the middle — gives $\\Theta(n\\log n)$.)',
        'Un travail constant par élément. (Une solution par découpage — la meilleure dans la moitié gauche, dans la moitié droite, ou à cheval sur le milieu — donne $\\Theta(n\\log n)$.)',
      ),
    },
  ],
};

const coins: Lesson = {
  id: 'c8l3',
  title: t('Spot the fake', 'Repérer la fausse'),
  summary: t(
    'You used weighings as comparisons and found the fakes with the minimum number of them.',
    'Vous avez utilisé des pesées comme comparaisons et trouvé les fausses pièces avec le moins de pesées possible.',
  ),
  steps: [
    { kind: 'generated', make: (r) => pilesQ(r.int(1, 10)) },
    {
      kind: 'task',
      title: t('Eight coins, two weighings', 'Huit pièces, deux pesées'),
      body: t(
        'One of these 8 coins is **lighter**. Using a two-pan balance (no weights), find it in **at most 2 weighings**. A new fake is chosen each game.',
        'L’une de ces 8 pièces est **plus légère**. Avec une balance à deux plateaux (sans poids), trouvez-la en **au plus 2 pesées**. Une nouvelle fausse pièce est tirée à chaque partie.',
      ),
      widget: ({ onSolved }) => <BalanceScale coins={8} maxWeighings={2} onSolved={onSolved} />,
      hint: t(
        'Don’t split 4 vs 4. Each weighing has **three** outcomes: left lighter, right lighter, balanced.',
        'Ne faites pas 4 contre 4. Chaque pesée a **trois** résultats : gauche plus léger, droite plus léger, équilibre.',
      ),
      success: t(
        'Weigh 3 vs 3. If balanced, the fake is among the 2 left out: weigh them against each other. Otherwise, take the lighter three and weigh 1 vs 1.',
        'Pesez 3 contre 3. En cas d’équilibre, la fausse est parmi les 2 mises de côté : pesez-les l’une contre l’autre. Sinon, prenez les trois plus légères et pesez 1 contre 1.',
      ),
    },
    { kind: 'generated', make: (r) => weighingsQ(r.int(4, 800)) },
    {
      kind: 'choice',
      body: t(
        'Among $n > 2$ coins one is fake, but you don’t know if it is lighter or heavier. You only want to know **which**. A constant number of weighings is enough. What is a good first step?',
        'Parmi $n > 2$ pièces, une est fausse, mais on ne sait pas si elle est plus légère ou plus lourde. On veut seulement savoir **laquelle des deux**. Un nombre constant de pesées suffit. Quelle est une bonne première étape ?',
      ),
      options: t(
        [
          'Weigh one coin against each of the others',
          'Split into piles $A, B$ of equal size $\\lfloor n/3 \\rfloor$ and compare $A$ with $B$; then compare one of them with a third pile of the same size (or with known-genuine coins)',
          'It cannot be done in $\\Theta(1)$',
        ],
        [
          'Peser une pièce contre chacune des autres',
          'Faire des piles $A, B$ de même taille $\\lfloor n/3 \\rfloor$ et comparer $A$ à $B$ ; puis comparer l’une d’elles à une troisième pile de même taille (ou à des pièces sûrement vraies)',
          'C’est impossible en $\\Theta(1)$',
        ],
      ),
      answer: 1,
      explain: t(
        'If $A = B$ the fake is elsewhere and both are genuine: weigh $A$ against the same number of remaining coins — the direction tells light/heavy. If $A < B$, compare $A$ with a third pile: equal means $B$ is heavy (fake is heavy), unequal means $A$ is light. At most 3 weighings whatever $n$ (with some care when $n$ is not a multiple of 3).',
        'Si $A = B$, la fausse est ailleurs et les deux piles sont vraies : pesez $A$ contre autant de pièces restantes — le sens dit léger ou lourd. Si $A < B$, comparez $A$ à une troisième pile : l’égalité signifie que $B$ est lourde (la fausse est lourde), l’inégalité que $A$ est légère. Au plus 3 pesées quel que soit $n$ (avec un peu de soin quand $n$ n’est pas multiple de 3).',
      ),
    },
  ],
};

export const ch8Lessons = [tournamentLesson, kadane, coins];
