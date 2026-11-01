import { t } from '../../lib/i18n';
import type { Lesson, QuestionStep } from '../../lib/types';
import { NutsBolts, QuickSelect, TreeRebuilder } from '../../widgets/split-extra';

export const REBUILD_IN = ['9', '3', '1', '0', '4', '2', '7', '6', '8', '5'];
export const REBUILD_POST = ['9', '1', '4', '0', '3', '6', '7', '5', '8', '2'];
export const SELECT_VALUES = [9, 2, 7, 4, 12, 5, 8, 1, 10];

const ordinal = (k: number) => t(`${k}${['st', 'nd', 'rd'][k - 1] ?? 'th'}`, `${k}e`);

export const kthQ = (values: number[], k: number): QuestionStep => {
  const down = [...values].sort((a, b) => b - a);
  return {
    kind: 'number',
    body: t(
      `What is the ${ordinal(k)} largest of **${values.join(', ')}**?`,
      `Quelle est la ${ordinal(k)} plus grande valeur parmi **${values.join(', ')}** ?`,
    ),
    answer: down[k - 1],
    explain: t(
      `Counting from the top: ${down.slice(0, k - 1).join(', ')}, **${down[k - 1]}**. Partitioning finds it without sorting the rest.`,
      `En comptant depuis le haut : ${down.slice(0, k - 1).join(', ')}, **${down[k - 1]}**. La partition la trouve sans trier le reste.`,
    ),
  };
};

const nutsBolts: Lesson = {
  id: 'c4l6',
  title: t('Matching nuts and bolts', 'Associer écrous et boulons'),
  summary: t(
    'You matched n nuts to n bolts in Θ(n log n) on average by partitioning each set with the other.',
    'Vous avez associé n écrous à n boulons en Θ(n log n) en moyenne, en partitionnant chaque ensemble avec l’autre.',
  ),
  steps: [
    {
      kind: 'read',
      title: t('No ruler allowed', 'Pas de règle autorisée'),
      body: t(
        `You have $n$ bolts of different sizes and their $n$ matching nuts, all mixed up. You can try a nut on a bolt and learn whether the nut is **too big, too small or a match** — but you can never compare two nuts, or two bolts, directly.

Trying every nut on every bolt takes up to $\\frac{n(n+1)}{2}$ tries. Can we do better?`,
        `Vous avez $n$ boulons de tailles différentes et leurs $n$ écrous assortis, tous mélangés. Vous pouvez essayer un écrou sur un boulon et savoir si l’écrou est **trop grand, trop petit ou assorti** — mais vous ne pouvez jamais comparer directement deux écrous, ou deux boulons.

Essayer chaque écrou sur chaque boulon demande jusqu’à $\\frac{n(n+1)}{2}$ essais. Peut-on faire mieux ?`,
      ),
    },
    {
      kind: 'choice',
      body: t(
        'Why can’t we simply sort the nuts, sort the bolts, and pair them up?',
        'Pourquoi ne peut-on pas simplement trier les écrous, trier les boulons, puis les apparier ?',
      ),
      options: t(
        ['Sorting is too slow', 'Sorting needs nut–nut or bolt–bolt comparisons, which are not allowed', 'The sizes are not distinct', 'We can, it is the best method'],
        ['Trier est trop lent', 'Trier demande des comparaisons écrou–écrou ou boulon–boulon, qui sont interdites', 'Les tailles ne sont pas distinctes', 'On peut, c’est la meilleure méthode'],
      ),
      answer: 1,
      explain: t(
        'The only test available compares a nut with a bolt. But that is enough to **partition**, like quicksort does.',
        'Le seul test disponible compare un écrou avec un boulon. Mais cela suffit pour **partitionner**, comme le fait le tri rapide.',
      ),
    },
    {
      kind: 'task',
      body: t(
        'Pick a bolt and try it on every nut: the nuts split into smaller / matching / bigger. Then use the matching nut to split the bolts the same way. Now both groups line up — recurse on each side.',
        'Choisissez un boulon et essayez-le sur chaque écrou : les écrous se partagent en plus petits / assorti / plus grands. Utilisez ensuite l’écrou assorti pour partager les boulons de la même façon. Les deux groupes s’alignent alors — recommencez de chaque côté.',
      ),
      widget: ({ onSolved }) => <NutsBolts onSolved={onSolved} />,
      success: t(
        'Each round matches one pair and splits the rest into two independent, smaller problems.',
        'Chaque tour apparie une paire et coupe le reste en deux problèmes indépendants plus petits.',
      ),
    },
    {
      kind: 'choice',
      body: t('What is the cost of this method?', 'Quel est le coût de cette méthode ?'),
      options: t(
        ['$\\Theta(n)$ always', '$\\Theta(n\\log n)$ in the best and average case, $\\Theta(n^2)$ in the worst case', '$\\Theta(n^2)$ always', '$\\Theta(\\log n)$'],
        ['$\\Theta(n)$ toujours', '$\\Theta(n\\log n)$ dans le meilleur cas et en moyenne, $\\Theta(n^2)$ dans le pire cas', '$\\Theta(n^2)$ toujours', '$\\Theta(\\log n)$'],
      ),
      answer: 1,
      explain: t(
        'Exactly like quicksort: about $2n$ tries per level of splitting. Balanced splits give $\\log_2 n$ levels; always picking the smallest bolt gives $n$ levels.',
        'Exactement comme le tri rapide : environ $2n$ essais par niveau de découpage. Des parts équilibrées donnent $\\log_2 n$ niveaux ; choisir toujours le plus petit boulon en donne $n$.',
      ),
    },
  ],
};

const rebuildTree: Lesson = {
  id: 'c4l7',
  title: t('Rebuild a tree', 'Reconstruire un arbre'),
  summary: t(
    'You reconstructed a binary tree from its in-order and post-order listings by splitting around each root.',
    'Vous avez reconstruit un arbre binaire à partir de ses listes infixe et postfixe en coupant autour de chaque racine.',
  ),
  steps: [
    {
      kind: 'read',
      title: t('Two listings, one tree', 'Deux listes, un arbre'),
      body: t(
        `In **post-order** the root of a tree is always listed **last**. In **in-order** the root sits **between** its left subtree and its right subtree.

So: take the last element of the post-order list — that is the root. Find it in the in-order list: everything before it is the left subtree, everything after it the right subtree. The post-order list splits at the same sizes. Repeat on each side.`,
        `En **ordre postfixe**, la racine d’un arbre est toujours listée **en dernier**. En **ordre infixe**, la racine se trouve **entre** son sous-arbre gauche et son sous-arbre droit.

Donc : prenez le dernier élément de la liste postfixe — c’est la racine. Trouvez-le dans la liste infixe : tout ce qui est avant est le sous-arbre gauche, tout ce qui est après le sous-arbre droit. La liste postfixe se coupe aux mêmes tailles. Recommencez de chaque côté.`,
      ),
    },
    {
      kind: 'task',
      body: t(
        'Rebuild the tree, one root at a time. Click each root in the **post-order** row.',
        'Reconstruisez l’arbre, une racine à la fois. Cliquez sur chaque racine dans la rangée **postfixe**.',
      ),
      widget: ({ onSolved }) => <TreeRebuilder inord={REBUILD_IN} post={REBUILD_POST} onSolved={onSolved} />,
      success: t(
        'Root 2; left subtree rooted at 3, right subtree rooted at 8.',
        'Racine 2 ; sous-arbre gauche de racine 3, sous-arbre droit de racine 8.',
      ),
    },
    {
      kind: 'sequence',
      body: t(
        'Give the **pre-order** listing of the tree you rebuilt (node, then left, then right).',
        'Donnez la liste en **ordre préfixe** de l’arbre reconstruit (nœud, puis gauche, puis droite).',
      ),
      tokens: REBUILD_IN,
      answer: ['2', '3', '9', '0', '1', '4', '8', '7', '6', '5'],
      explain: t(
        'You placed the nodes in exactly that order: each root before its subtrees.',
        'Vous avez placé les nœuds exactement dans cet ordre : chaque racine avant ses sous-arbres.',
      ),
    },
    {
      kind: 'choice',
      body: t(
        'Would the **pre-order** and **post-order** listings together always determine the tree?',
        'Les listes **préfixe** et **postfixe** ensemble déterminent-elles toujours l’arbre ?',
      ),
      options: t(
        ['Yes, always', 'No: a node with a single child gives the same listings whether that child is on the left or the right', 'Only for search trees'],
        ['Oui, toujours', 'Non : un nœud avec un seul enfant donne les mêmes listes que cet enfant soit à gauche ou à droite', 'Seulement pour les arbres de recherche'],
      ),
      answer: 1,
      explain: t(
        'Pre-order "a b" and post-order "b a" fit both a tree where b is the left child of a and one where it is the right child. The in-order listing is what separates left from right.',
        'Préfixe « a b » et postfixe « b a » conviennent aussi bien à un arbre où b est l’enfant gauche de a qu’à un arbre où il est l’enfant droit. C’est la liste infixe qui sépare la gauche de la droite.',
      ),
    },
  ],
};

const kthLargest: Lesson = {
  id: 'c4l8',
  title: t('Finding the k-th largest', 'Trouver la k-ième plus grande valeur'),
  summary: t(
    'You found the k-th largest value in linear average time by partitioning and keeping only one side.',
    'Vous avez trouvé la k-ième plus grande valeur en temps linéaire en moyenne, en partitionnant et en ne gardant qu’un côté.',
  ),
  steps: [
    {
      kind: 'read',
      title: t('No need to sort everything', 'Inutile de tout trier'),
      body: t(
        'To find the $k$-th largest of $n$ numbers you could sort them ($\\Theta(n\\log n)$) and read position $n - k$. But one partition already puts the pivot in its **final** place — and tells us on which side the answer lies. We only need to continue on that side.',
        'Pour trouver la $k$-ième plus grande de $n$ valeurs, on pourrait les trier ($\\Theta(n\\log n)$) et lire la position $n - k$. Mais une partition met déjà le pivot à sa place **définitive** — et nous dit de quel côté se trouve la réponse. Il suffit de continuer de ce côté.',
      ),
    },
    {
      kind: 'task',
      body: t('Find the 3rd largest value. Try other values of $k$ too.', 'Trouvez la 3e plus grande valeur. Essayez aussi d’autres valeurs de $k$.'),
      widget: ({ onSolved }) => <QuickSelect values={SELECT_VALUES} onSolved={onSolved} />,
      success: t(
        'Every partition throws away the side that cannot contain the answer.',
        'Chaque partition jette le côté qui ne peut pas contenir la réponse.',
      ),
    },
    { kind: 'generated', make: (r) => kthQ(r.shuffle([...Array(40).keys()].map((i) => i + 1)).slice(0, 9), r.int(2, 5)) },
    {
      kind: 'choice',
      body: t(
        'With pivots that roughly halve the range, the work is about $n + n/2 + n/4 + \\dots$ What is the average cost?',
        'Avec des pivots qui coupent à peu près l’intervalle en deux, le travail vaut environ $n + n/2 + n/4 + \\dots$ Quel est le coût moyen ?',
      ),
      options: ['$\\Theta(\\log n)$', '$\\Theta(n)$', '$\\Theta(n\\log n)$', '$\\Theta(n^2)$'],
      answer: 1,
      explain: t(
        'The geometric series $n + n/2 + n/4 + \\dots < 2n$: linear on average. Like quicksort, unlucky pivots give $\\Theta(n^2)$ in the worst case.',
        'La série géométrique $n + n/2 + n/4 + \\dots < 2n$ : linéaire en moyenne. Comme pour le tri rapide, des pivots malchanceux donnent $\\Theta(n^2)$ dans le pire cas.',
      ),
    },
  ],
};

export const ch4xLessons = [nutsBolts, rebuildTree, kthLargest];
