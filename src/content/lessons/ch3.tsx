import { t } from '../../lib/i18n';
import { texNum } from '../../lib/random';
import type { Lesson, QuestionStep } from '../../lib/types';
import { BinarySearch, BsDecisionTree, JosephusCircle, JosephusTable, NimGame } from '../../widgets/shrink';

/* ---------- practice questions with fresh numbers ---------- */

export const bsMaxQ = (n: number): QuestionStep => {
  const k = Math.floor(Math.log2(n));
  return {
    kind: 'number',
    title: t('Practice', 'Entraînement'),
    body: t(
      `A sorted array holds $${texNum(n)}$ elements. What is the **maximum** number of comparisons binary search can make on it?`,
      `Un tableau trié contient $${texNum(n)}$ éléments. Quel est le nombre **maximum** de comparaisons qu’une recherche dichotomique peut y faire ?`,
    ),
    answer: k + 1,
    hint: t(
      'Each comparison at least halves the interval. How many halvings until one element is left?',
      'Chaque comparaison divise l’intervalle au moins par deux. Combien de divisions avant qu’il ne reste qu’un élément ?',
    ),
    explain: t(
      `$2^{${k}} \\le ${texNum(n)} < 2^{${k + 1}}$, so the interval can be halved $${k}$ times before one element is left, plus the last comparison: $\\lfloor\\log_2 n\\rfloor + 1 = ${k + 1}$.`,
      `$2^{${k}} \\le ${texNum(n)} < 2^{${k + 1}}$ : l’intervalle peut être divisé par deux $${k}$ fois avant qu’il ne reste un élément, plus la dernière comparaison : $\\lfloor\\log_2 n\\rfloor + 1 = ${k + 1}$.`,
    ),
  };
};

export const josephusQ = (n: number): QuestionStep => {
  const m = 2 ** Math.floor(Math.log2(n));
  const L = n - m;
  return {
    kind: 'number',
    body: t(
      `Write $n = 2^m + L$ with $0 \\le L < 2^m$. After $L$ eliminations, $2^m$ people remain and the count restarts at person $2L + 1$, who therefore survives. Compute $J(${n})$.`,
      `Écrivez $n = 2^m + L$ avec $0 \\le L < 2^m$. Après $L$ éliminations, il reste $2^m$ personnes et le compte repart de la personne $2L + 1$, qui survit donc. Calculez $J(${n})$.`,
    ),
    answer: 2 * L + 1,
    hint: t(`The largest power of two not above ${n} is ${m}.`, `La plus grande puissance de deux qui ne dépasse pas ${n} est ${m}.`),
    explain: t(
      `$${n} = ${m} + ${L}$, so $J(${n}) = 2\\cdot ${L} + 1 = ${2 * L + 1}$. Bonus: in binary, $J(n)$ is $n$ with its leading 1 moved to the end: $${n.toString(2)}_2 \\to ${n.toString(2).slice(1)}1_2 = ${2 * L + 1}$.`,
      `$${n} = ${m} + ${L}$, donc $J(${n}) = 2\\cdot ${L} + 1 = ${2 * L + 1}$. Bonus : en binaire, $J(n)$ est $n$ dont le 1 de tête est déplacé à la fin : $${n.toString(2)}_2 \\to ${n.toString(2).slice(1)}1_2 = ${2 * L + 1}$.`,
    ),
  };
};

export const nimMoveQ = (n: number, m: number): QuestionStep => {
  const take = (n - 1) % (m + 1);
  return {
    kind: 'number',
    body: t(
      `In general, with $n = ${n}$ tokens and $m = ${m}$, how many tokens should the first player take to win?`,
      `En général, avec $n = ${n}$ jetons et $m = ${m}$, combien de jetons le premier joueur doit-il prendre pour gagner ?`,
    ),
    answer: take,
    explain: t(
      `$(${n} - 1) \\bmod ${m + 1} = ${n - 1} \\bmod ${m + 1} = ${take}$. Taking ${take} leaves ${n - take}, and $${n - take} \\equiv 1 \\pmod{${m + 1}}$ — a losing position for the opponent.`,
      `$(${n} - 1) \\bmod ${m + 1} = ${n - 1} \\bmod ${m + 1} = ${take}$. En prendre ${take} en laisse ${n - take}, et $${n - take} \\equiv 1 \\pmod{${m + 1}}$ — une position perdante pour l’adversaire.`,
    ),
  };
};

const binsearch: Lesson = {
  id: 'c3l1',
  title: t('Halving a sorted list', 'Couper en deux une liste triée'),
  summary: t(
    'You can trace binary search, count its comparisons and see why it is logarithmic.',
    'Vous savez suivre une recherche dichotomique, compter ses comparaisons et voir pourquoi elle est logarithmique.',
  ),
  steps: [
    {
      kind: 'read',
      title: t('Halve the search', 'Couper la recherche en deux'),
      body: t(
        `A powerful idea: solve a problem by reducing it to a *smaller instance of itself*. Binary search is the classic: in a **sorted** array, compare the key with the middle element and throw away the half that cannot contain it.

Pick a value and step through the search on this sorted array.`,
        `Une idée puissante : résoudre un problème en le ramenant à une *version plus petite de lui-même*. La recherche dichotomique est l’exemple classique : dans un tableau **trié**, on compare la clé à l’élément du milieu et on jette la moitié qui ne peut pas la contenir.

Choisissez une valeur et suivez la recherche pas à pas dans ce tableau trié.`,
      ),
      widget: () => <BinarySearch />,
    },
    {
      kind: 'number',
      body: t(
        'What is the **maximum** number of comparisons binary search makes on this 13-element array? Try different keys (including 60, which is absent).',
        'Quel est le nombre **maximum** de comparaisons de la recherche dichotomique sur ce tableau de 13 éléments ? Essayez différentes clés (y compris 60, qui est absente).',
      ),
      widget: () => <BinarySearch />,
      answer: 4,
      hint: t('Tick “show costs” to see the cost of every element.', 'Cochez « afficher les coûts » pour voir le coût de chaque élément.'),
      explain: t(
        'Each comparison halves the interval: $13 \\to 6 \\to 3 \\to 1$. At most $\\lfloor\\log_2 13\\rfloor + 1 = 4$ comparisons.',
        'Chaque comparaison divise l’intervalle par deux : $13 \\to 6 \\to 3 \\to 1$. Au plus $\\lfloor\\log_2 13\\rfloor + 1 = 4$ comparaisons.',
      ),
    },
    {
      kind: 'read',
      title: t('The decision tree', 'L’arbre de décision'),
      body: t(
        'Every possible run of binary search is a path in this tree. The root is the first middle element; the depth of a node is the number of comparisons needed to find it.',
        'Chaque exécution possible de la recherche dichotomique est un chemin dans cet arbre. La racine est le premier élément du milieu ; la profondeur d’un nœud est le nombre de comparaisons nécessaires pour le trouver.',
      ),
      widget: () => <BsDecisionTree />,
    },
    {
      kind: 'sequence',
      body: t(
        'Which values require the **maximum** number of comparisons? Tap them in increasing order.',
        'Quelles valeurs demandent le nombre **maximum** de comparaisons ? Touchez-les dans l’ordre croissant.',
      ),
      tokens: ['3', '14', '27', '31', '39', '42', '55', '70', '74', '81', '85', '93', '98'],
      keepOrder: true,
      answer: ['14', '31', '42', '74', '85', '98'],
      explain: t(
        'The six leaves at depth 4 of the decision tree: 14, 31, 42, 74, 85 and 98.',
        'Les six feuilles à la profondeur 4 de l’arbre de décision : 14, 31, 42, 74, 85 et 98.',
      ),
    },
    {
      kind: 'number',
      body: t(
        'Assuming every element is searched with the same probability, what is the **average** number of comparisons of a successful search? (2 decimals)',
        'En supposant que chaque élément est cherché avec la même probabilité, quel est le nombre **moyen** de comparaisons d’une recherche réussie ? (2 décimales)',
      ),
      answer: 41 / 13,
      tolerance: 0.006,
      hint: t(
        'Depth 1: one element, depth 2: two, depth 3: four, depth 4: six.',
        'Profondeur 1 : un élément, profondeur 2 : deux, profondeur 3 : quatre, profondeur 4 : six.',
      ),
      explain: t(
        '$\\dfrac{1\\cdot1 + 2\\cdot2 + 3\\cdot4 + 4\\cdot6}{13} = \\dfrac{41}{13} \\approx 3.15$.',
        '$\\dfrac{1\\cdot1 + 2\\cdot2 + 3\\cdot4 + 4\\cdot6}{13} = \\dfrac{41}{13} \\approx 3{,}15$.',
      ),
    },
    {
      kind: 'choice',
      body: t(
        'On a sorted array of **1 000 000** elements, roughly how many times faster is a successful binary search than a sequential search, on average?',
        'Sur un tableau trié de **1 000 000** d’éléments, combien de fois plus rapide est en moyenne une recherche dichotomique réussie qu’une recherche séquentielle ?',
      ),
      options: t(
        ['About 2 times', 'About 1 000 times', 'About 25 000 times', 'About 1 000 000 times'],
        ['Environ 2 fois', 'Environ 1 000 fois', 'Environ 25 000 fois', 'Environ 1 000 000 de fois'],
      ),
      answer: 2,
      explain: t(
        'Sequential search: about $n/2 = 500\\,000$ comparisons on average. Binary search: about $\\log_2 10^6 \\approx 20$. Ratio $\\approx 25\\,000$.',
        'Recherche séquentielle : environ $n/2 = 500\\,000$ comparaisons en moyenne. Recherche dichotomique : environ $\\log_2 10^6 \\approx 20$. Rapport $\\approx 25\\,000$.',
      ),
    },
    { kind: 'generated', make: (r) => bsMaxQ(r.int(20, 5000)) },
  ],
};

const josephusLesson: Lesson = {
  id: 'c3l2',
  title: t('Last one standing', 'Le dernier survivant'),
  summary: t(
    'You found the survivor’s position with a halving recurrence — and its binary trick.',
    'Vous avez trouvé la place du survivant avec une récurrence par moitiés — et son astuce binaire.',
  ),
  steps: [
    {
      kind: 'read',
      title: t('Who survives?', 'Qui survit ?'),
      body: t(
        `$n$ people numbered $1$ to $n$ stand in a circle. Starting from person 1, **every second person** is eliminated until one survivor remains. We call the survivor's number $J(n)$.

For example, with $n = 6$, persons 2, 4, 6 go in the first round, then 3 and 1 — so $J(6) = 5$. Watch it happen.`,
        `$n$ personnes numérotées de $1$ à $n$ forment un cercle. En partant de la personne 1, **une personne sur deux** est éliminée jusqu’à ce qu’il ne reste qu’un survivant. On note $J(n)$ le numéro du survivant.

Par exemple, avec $n = 6$, les personnes 2, 4, 6 partent au premier tour, puis 3 et 1 — donc $J(6) = 5$. Regardez.`,
      ),
      widget: () => <JosephusCircle initialN={6} />,
    },
    {
      kind: 'number',
      body: t('Use the circle to find $J(7)$.', 'Utilisez le cercle pour trouver $J(7)$.'),
      widget: () => <JosephusCircle initialN={7} />,
      answer: 7,
      explain: t(
        'Round 1 eliminates 2, 4, 6 and then 1 (the count wraps around). Round 2 eliminates 5 and 3. Person 7 survives.',
        'Le tour 1 élimine 2, 4, 6 puis 1 (le compte fait le tour). Le tour 2 élimine 5 et 3. La personne 7 survit.',
      ),
    },
    {
      kind: 'read',
      title: t('Find the pattern', 'Trouver le motif'),
      body: t(
        `Here are the first values. After the first round on an **even** circle $n = 2k$, half the people are gone and we restart from person 1 with $k$ people, every number doubled minus one:

$$J(2k) = 2J(k) - 1 \\qquad J(2k+1) = 2J(k) + 1$$

Each round halves the circle. Look at the powers of two (in blue).`,
        `Voici les premières valeurs. Après le premier tour sur un cercle **pair** $n = 2k$, la moitié des personnes est partie et on repart de la personne 1 avec $k$ personnes, chaque numéro doublé moins un :

$$J(2k) = 2J(k) - 1 \\qquad J(2k+1) = 2J(k) + 1$$

Chaque tour divise le cercle par deux. Regardez les puissances de deux (en bleu).`,
      ),
      widget: () => <JosephusTable />,
    },
    {
      kind: 'choice',
      body: t(
        'What is $J(n)$ when $n$ is a power of two, $n = 2^m$?',
        'Que vaut $J(n)$ quand $n$ est une puissance de deux, $n = 2^m$ ?',
      ),
      options: ['$1$', '$n$', '$n/2$', '$n - 1$'],
      answer: 0,
      explain: t(
        '$J(2k) = 2J(k) - 1$ and $J(1) = 1$ give $J(2^m) = 1$: with a power of two, every round removes exactly half and person 1 always starts again.',
        '$J(2k) = 2J(k) - 1$ et $J(1) = 1$ donnent $J(2^m) = 1$ : avec une puissance de deux, chaque tour retire exactement la moitié et la personne 1 recommence toujours.',
      ),
    },
    { kind: 'generated', make: (r) => josephusQ(r.pick([...Array(101).keys()].map((i) => i + 20).filter((n) => (n & (n - 1)) !== 0))) },
    {
      kind: 'task',
      body: t(
        'Check the formula on the circle with the original story’s 40 people: $40 = 32 + 8$, so person $2 \\cdot 8 + 1 = 17$ should survive. Set $n = 40$ and press **Play**.',
        'Vérifiez la formule sur le cercle avec les 40 personnes de l’histoire d’origine : $40 = 32 + 8$, donc la personne $2 \\cdot 8 + 1 = 17$ devrait survivre. Réglez $n = 40$ et appuyez sur **Lecture**.',
      ),
      widget: ({ onSolved }) => <JosephusCircle initialN={40} onSolved={onSolved} />,
      success: t('Person 17 survives, as predicted.', 'La personne 17 survit, comme prévu.'),
    },
  ],
};

const nim: Lesson = {
  id: 'c3l3',
  title: t('Last token loses', 'Qui prend le dernier perd'),
  summary: t(
    'You analysed a game backwards, from small positions to large ones, to find a winning strategy.',
    'Vous avez analysé un jeu à rebours, des petites positions aux grandes, pour trouver une stratégie gagnante.',
  ),
  steps: [
    {
      kind: 'read',
      title: t('Take the last one and lose', 'Prendre le dernier, c’est perdre'),
      body: t(
        'One pile of $n$ tokens. Two players take turns removing between $1$ and $m$ tokens. In this *misère* version, **the player who takes the last token loses**. Here $m = 3$. Play a few games against the computer — it plays perfectly.',
        'Un tas de $n$ jetons. Deux joueurs retirent à tour de rôle entre $1$ et $m$ jetons. Dans cette version *misère*, **le joueur qui prend le dernier jeton perd**. Ici $m = 3$. Jouez quelques parties contre l’ordinateur — il joue parfaitement.',
      ),
      widget: () => <NimGame start={14} m={3} />,
    },
    {
      kind: 'choice',
      title: t('Think small', 'Penser petit'),
      body: t(
        'Call a position **losing** if the player about to move loses against perfect play. With $m = 3$, which of these positions is losing?',
        'Une position est **perdante** si le joueur qui doit jouer perd face à un jeu parfait. Avec $m = 3$, laquelle de ces positions est perdante ?',
      ),
      options: t(['1 token', '2 tokens', '3 tokens', '4 tokens'], ['1 jeton', '2 jetons', '3 jetons', '4 jetons']),
      answer: 0,
      explain: t(
        'With 1 token you must take it — and lose. From 2, 3 or 4 you take enough to leave exactly 1 to your opponent: those are winning.',
        'Avec 1 jeton, il faut le prendre — et perdre. Depuis 2, 3 ou 4, on en prend assez pour laisser exactement 1 à l’adversaire : ces positions sont gagnantes.',
      ),
    },
    {
      kind: 'choice',
      body: t(
        'From 5 tokens, every move (take 1, 2 or 3) leaves 4, 3 or 2 — all winning for the opponent. So 5 is losing. Continue the reasoning: which positions are losing for $m = 3$?',
        'Depuis 5 jetons, chaque coup (en prendre 1, 2 ou 3) laisse 4, 3 ou 2 — toutes gagnantes pour l’adversaire. 5 est donc perdante. Continuez le raisonnement : quelles positions sont perdantes pour $m = 3$ ?',
      ),
      options: t(
        ['1, 4, 7, 10, 13', '1, 5, 9, 13', '2, 6, 10, 14', 'Every odd number'],
        ['1, 4, 7, 10, 13', '1, 5, 9, 13', '2, 6, 10, 14', 'Tous les nombres impairs'],
      ),
      answer: 1,
      explain: t(
        'Losing positions are spaced $m + 1 = 4$ apart: $n \\equiv 1 \\pmod{m+1}$. From any other position you can move to one of them.',
        'Les positions perdantes sont espacées de $m + 1 = 4$ : $n \\equiv 1 \\pmod{m+1}$. Depuis toute autre position, on peut en atteindre une.',
      ),
    },
    {
      kind: 'task',
      body: t(
        'Now beat the computer from 14 tokens. Tip: always leave it a losing position. Use the position map if you need it.',
        'Maintenant, battez l’ordinateur à partir de 14 jetons. Astuce : laissez-lui toujours une position perdante. Servez-vous de la carte des positions si besoin.',
      ),
      widget: ({ onSolved }) => <NimGame start={14} m={3} onSolved={onSolved} />,
      success: t(
        'Strategy: take $(n - 1) \\bmod (m+1)$ tokens. If that is 0, you are in a losing position — take 1 and hope your opponent makes a mistake!',
        'Stratégie : prendre $(n - 1) \\bmod (m+1)$ jetons. Si cela fait 0, vous êtes en position perdante — prenez-en 1 et espérez une erreur de l’adversaire !',
      ),
    },
    {
      kind: 'generated',
      make: (r) => {
        const m = r.int(2, 7);
        // Skip losing starts: the first player must have a winning move.
        const n = r.pick([...Array(131).keys()].map((i) => i + 20).filter((k) => (k - 1) % (m + 1) !== 0));
        return nimMoveQ(n, m);
      },
    },
  ],
};

export const ch3Lessons = [binsearch, josephusLesson, nim];
