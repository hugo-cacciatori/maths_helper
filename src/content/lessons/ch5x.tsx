import { t } from '../../lib/i18n';
import type { Lesson, QuestionStep } from '../../lib/types';
import { ClosestPair, closestPair, HeapMin, minAvlNodes, PlainBstBuilder, ProductBars, SortOrNot, ThinBalancedTree } from '../../widgets/reshape-extra';
import { AvlBuilder } from '../../widgets/reshape';

/* ---------- practice questions with fresh numbers ---------- */

export const closestGapQ = (values: number[]): QuestionStep => {
  const { pair, gap } = closestPair(values);
  const sorted = [...values].sort((a, b) => a - b).join(', ');
  return {
    kind: 'number',
    title: t('Practice', 'Entraînement'),
    body: t(
      `What is the smallest difference between two of **${values.join(', ')}**?`,
      `Quel est le plus petit écart entre deux des nombres **${values.join(', ')}** ?`,
    ),
    answer: gap,
    hint: t('Sort them first: the closest two are neighbours.', 'Triez-les d’abord : les deux plus proches sont voisins.'),
    explain: t(
      `Sorted: ${sorted}. The closest neighbours are ${pair[0]} and ${pair[1]}: a gap of **${gap}**.`,
      `Triés : ${sorted}. Les voisins les plus proches sont ${pair[0]} et ${pair[1]} : un écart de **${gap}**.`,
    ),
  };
};

export const minAvlQ = (h: number): QuestionStep => {
  const N = Array.from({ length: h + 1 }, (_, k) => minAvlNodes(k));
  const list = N.map((v, k) => `$N(${k}) = ${v}$`).join(', ');
  return {
    kind: 'number',
    body: t(
      `What is the smallest number of nodes in a balanced tree of height **${h}**?`,
      `Quel est le plus petit nombre de nœuds d’un arbre équilibré de hauteur **${h}** ?`,
    ),
    answer: N[h],
    explain: t(
      `${list}. These numbers grow like Fibonacci numbers — exponentially — so the height of a balanced tree is $O(\\log n)$.`,
      `${list}. Ces nombres croissent comme les nombres de Fibonacci — exponentiellement — donc la hauteur d’un arbre équilibré est en $O(\\log n)$.`,
    ),
  };
};

export const productQ = (n: number): QuestionStep => {
  const a = Math.floor(n / 2);
  return {
    kind: 'number',
    body: t(
      `What is the largest product of two positive integers whose sum is **${n}**?`,
      `Quel est le plus grand produit de deux entiers positifs dont la somme vaut **${n}** ?`,
    ),
    answer: a * (n - a),
    explain: t(
      `$a(${n} - a)$ is a downward parabola, highest in the middle: $${a} \\times ${n - a} = ${a * (n - a)}$. In general $\\lfloor n/2\\rfloor \\cdot \\lceil n/2 \\rceil$.`,
      `$a(${n} - a)$ est une parabole tournée vers le bas, la plus haute au milieu : $${a} \\times ${n - a} = ${a * (n - a)}$. En général $\\lfloor n/2\\rfloor \\cdot \\lceil n/2 \\rceil$.`,
    ),
  };
};

export const ZIGZAG_KEYS = ['A', 'Z', 'B', 'Y', 'C', 'X', 'D', 'W', 'E', 'V', 'F'];

const sortFirst: Lesson = {
  id: 'c5l4',
  title: t('Sort first?', 'Trier d’abord ?'),
  summary: t(
    'You learnt when sorting the data first makes a problem cheaper — and when it does not.',
    'Vous avez appris quand trier d’abord les données rend un problème moins coûteux — et quand ce n’est pas le cas.',
  ),
  steps: [
    {
      kind: 'read',
      title: t('The two closest numbers', 'Les deux nombres les plus proches'),
      body: t(
        'To find the two closest numbers in a list, comparing every pair costs $\\frac{n(n-1)}{2}$ differences. But after sorting, the closest pair must sit **side by side**. Drag $n$ and compare the costs.',
        'Pour trouver les deux nombres les plus proches d’une liste, comparer chaque paire coûte $\\frac{n(n-1)}{2}$ différences. Mais après un tri, la paire la plus proche est forcément **côte à côte**. Faites varier $n$ et comparez les coûts.',
      ),
      widget: () => <ClosestPair />,
    },
    {
      kind: 'choice',
      body: t(
        'What is the cost of “sort, then check neighbours” with a good sorting algorithm?',
        'Quel est le coût de « trier, puis vérifier les voisins » avec un bon algorithme de tri ?',
      ),
      options: t(
        ['$\\Theta(n)$', '$\\Theta(n\\log n)$ — the sort dominates the $n - 1$ neighbour checks', '$\\Theta(n^2)$', '$\\Theta(\\log n)$'],
        ['$\\Theta(n)$', '$\\Theta(n\\log n)$ — le tri domine les $n - 1$ vérifications de voisins', '$\\Theta(n^2)$', '$\\Theta(\\log n)$'],
      ),
      answer: 1,
      explain: t(
        'Sorting costs $\\Theta(n\\log n)$; one pass over the $n - 1$ gaps adds only $\\Theta(n)$. Much better than $\\Theta(n^2)$ for every pair.',
        'Trier coûte $\\Theta(n\\log n)$ ; un passage sur les $n - 1$ écarts n’ajoute que $\\Theta(n)$. Bien mieux que $\\Theta(n^2)$ pour toutes les paires.',
      ),
    },
    {
      kind: 'choice',
      title: t('Not always a win', 'Pas toujours gagnant'),
      body: t(
        'Same idea for the smallest and largest values: sort, then read both ends. How does that compare with a single scan (about $2n$ comparisons) or the split-in-halves method (about $1.5n$)?',
        'Même idée pour la plus petite et la plus grande valeur : trier, puis lire les deux bouts. Comment cela se compare-t-il à un seul balayage (environ $2n$ comparaisons) ou à la méthode par moitiés (environ $1{,}5n$) ?',
      ),
      options: t(
        ['Sorting first is the fastest', 'Sorting first is the slowest: $\\Theta(n\\log n)$ against $\\Theta(n)$ for the other two', 'All three are $\\Theta(n\\log n)$'],
        ['Trier d’abord est le plus rapide', 'Trier d’abord est le plus lent : $\\Theta(n\\log n)$ contre $\\Theta(n)$ pour les deux autres', 'Les trois sont en $\\Theta(n\\log n)$'],
      ),
      answer: 1,
      explain: t(
        'Sorting does far more work than needed: it orders *every* element when we only need two of them.',
        'Trier fait bien plus de travail que nécessaire : il ordonne *tous* les éléments alors qu’on n’en veut que deux.',
      ),
    },
    {
      kind: 'read',
      title: t('Sort once, search many times', 'Trier une fois, chercher souvent'),
      body: t(
        `Searching an unsorted array costs about $n/2$ comparisons on average. Sorting first costs about $n\\log_2 n$, but then each search costs only about $\\log_2 n$. With $k$ searches, sorting pays off when
$$k \\cdot \\frac{n}{2} > n\\log_2 n + k\\log_2 n.$$
Move $k$ to see where the lines cross.`,
        `Chercher dans un tableau non trié coûte environ $n/2$ comparaisons en moyenne. Trier d’abord coûte environ $n\\log_2 n$, mais ensuite chaque recherche ne coûte qu’environ $\\log_2 n$. Avec $k$ recherches, trier est rentable quand
$$k \\cdot \\frac{n}{2} > n\\log_2 n + k\\log_2 n.$$
Faites varier $k$ pour voir où les droites se croisent.`,
      ),
      widget: () => <SortOrNot />,
    },
    {
      kind: 'number',
      body: t(
        'For an array of $10^3$ elements, from how many searches does sorting first pay off?',
        'Pour un tableau de $10^3$ éléments, à partir de combien de recherches trier d’abord est-il rentable ?',
      ),
      answer: 21,
      tolerance: 1,
      hint: t(
        '$\\log_2 1000 \\approx 10$. Solve $k(n/2 - \\log_2 n) > n\\log_2 n$.',
        '$\\log_2 1000 \\approx 10$. Résolvez $k(n/2 - \\log_2 n) > n\\log_2 n$.',
      ),
      explain: t(
        '$k > \\frac{1000 \\times 9.97}{500 - 9.97} \\approx 20.3$, so about **21** searches.',
        '$k > \\frac{1000 \\times 9{,}97}{500 - 9{,}97} \\approx 20{,}3$, donc environ **21** recherches.',
      ),
    },
    {
      kind: 'number',
      body: t('And for $10^6$ elements?', 'Et pour $10^6$ éléments ?'),
      answer: 40,
      tolerance: 1,
      explain: t(
        '$k > \\frac{10^6 \\times 19.93}{5\\cdot10^5 - 19.93} \\approx 39.9$: about **40** searches. The break-even grows only like $2\\log_2 n$.',
        '$k > \\frac{10^6 \\times 19{,}93}{5\\cdot10^5 - 19{,}93} \\approx 39{,}9$ : environ **40** recherches. Le seuil de rentabilité ne croît que comme $2\\log_2 n$.',
      ),
    },
    { kind: 'generated', make: (r) => closestGapQ(r.shuffle([...Array(99).keys()].map((i) => i + 1)).slice(0, 8)) },
  ],
};

const treeHeights: Lesson = {
  id: 'c5l5',
  title: t('Tall and short trees', 'Arbres hauts et arbres bas'),
  summary: t(
    'You saw how few nodes a balanced tree can have for its height, and how badly an unbalanced one can grow.',
    'Vous avez vu combien un arbre équilibré peut avoir peu de nœuds pour sa hauteur, et jusqu’où un arbre déséquilibré peut grandir.',
  ),
  steps: [
    {
      kind: 'read',
      title: t('The thinnest balanced tree', 'L’arbre équilibré le plus maigre'),
      body: t(
        `What is the **fewest** nodes a balanced (AVL) tree of height $h$ can have? Make it as lopsided as the rule allows: one subtree of height $h - 1$, the other of height $h - 2$, each of them as thin as possible. So
$$N(h) = N(h-1) + N(h-2) + 1,\\quad N(0) = 1,\\ N(1) = 2.$$`,
        `Quel est le **plus petit** nombre de nœuds d’un arbre équilibré (AVL) de hauteur $h$ ? Rendez-le aussi bancal que la règle le permet : un sous-arbre de hauteur $h - 1$, l’autre de hauteur $h - 2$, chacun aussi maigre que possible. Donc
$$N(h) = N(h-1) + N(h-2) + 1,\\quad N(0) = 1,\\ N(1) = 2.$$`,
      ),
      widget: () => <ThinBalancedTree />,
    },
    { kind: 'generated', make: (r) => minAvlQ(r.int(2, 9)) },
    {
      kind: 'task',
      title: t('A zigzag of keys', 'Des clés en zigzag'),
      body: t(
        'Insert **A Z B Y C X D W E V F** into a plain search tree, without any rebalancing.',
        'Insérez **A Z B Y C X D W E V F** dans un simple arbre de recherche, sans aucun rééquilibrage.',
      ),
      widget: ({ onSolved }) => <PlainBstBuilder keys={ZIGZAG_KEYS} onSolved={onSolved} />,
      success: t(
        'Each key lands below the previous one: a zigzag chain of height 10.',
        'Chaque clé se place sous la précédente : une chaîne en zigzag de hauteur 10.',
      ),
    },
    {
      kind: 'task',
      body: t('Now the same keys in a balanced (AVL) tree, with rotations.', 'Maintenant les mêmes clés dans un arbre équilibré (AVL), avec rotations.'),
      widget: ({ onSolved }) => <AvlBuilder keys={ZIGZAG_KEYS} onSolved={onSolved} />,
      success: t('The rotations keep the tree short: height 3 for 11 keys.', 'Les rotations gardent l’arbre bas : hauteur 3 pour 11 clés.'),
    },
    {
      kind: 'choice',
      body: t('Why does it matter?', 'Pourquoi est-ce important ?'),
      options: t(
        [
          'It does not: both trees hold the same keys',
          'A search costs one comparison per level: up to 11 in the chain, at most 4 in the balanced tree',
          'The chain uses more memory',
        ],
        [
          'Ça ne l’est pas : les deux arbres contiennent les mêmes clés',
          'Une recherche coûte une comparaison par niveau : jusqu’à 11 dans la chaîne, au plus 4 dans l’arbre équilibré',
          'La chaîne utilise plus de mémoire',
        ],
      ),
      answer: 1,
      explain: t(
        'Searching, inserting and deleting all follow one root-to-leaf path, so their cost is the height: $\\Theta(n)$ for a chain, $\\Theta(\\log n)$ when balanced.',
        'Chercher, insérer et supprimer suivent tous un chemin de la racine à une feuille : leur coût est la hauteur, $\\Theta(n)$ pour une chaîne, $\\Theta(\\log n)$ quand l’arbre est équilibré.',
      ),
    },
  ],
};

const heapTricks: Lesson = {
  id: 'c5l6',
  title: t('Heap tricks', 'Astuces de tas'),
  summary: t(
    'You found the smallest key of a max-heap among its leaves, and maximised a product by reshaping a sum.',
    'Vous avez trouvé la plus petite clé d’un tas max parmi ses feuilles, et maximisé un produit en remodelant une somme.',
  ),
  steps: [
    {
      kind: 'task',
      title: t('The smallest key of a max-heap', 'La plus petite clé d’un tas max'),
      body: t(
        'A max-heap keeps its **largest** key at the root. Where is the **smallest** one? Watch the search, then its deletion.',
        'Un tas max garde sa **plus grande** clé à la racine. Où est la **plus petite** ? Regardez la recherche, puis sa suppression.',
      ),
      widget: ({ onSolved }) => <HeapMin onSolved={onSolved} />,
      success: t(
        'Only the leaves can hold the minimum; after deleting it, the moved key may need to climb.',
        'Seules les feuilles peuvent contenir le minimum ; après sa suppression, la clé déplacée peut devoir remonter.',
      ),
    },
    {
      kind: 'choice',
      body: t(
        'What is the cost of finding and deleting the smallest key of a max-heap with $n$ keys?',
        'Quel est le coût pour trouver et supprimer la plus petite clé d’un tas max de $n$ clés ?',
      ),
      options: t(
        ['$\\Theta(1)$', '$\\Theta(\\log n)$', '$\\Theta(n)$ — there are about $n/2$ leaves to check', '$\\Theta(n\\log n)$'],
        ['$\\Theta(1)$', '$\\Theta(\\log n)$', '$\\Theta(n)$ — il y a environ $n/2$ feuilles à vérifier', '$\\Theta(n\\log n)$'],
      ),
      answer: 2,
      explain: t(
        'Finding it needs $\\lceil n/2 \\rceil - 1$ comparisons among the leaves; the deletion then costs only $O(\\log n)$. A heap is organised for its maximum, not its minimum.',
        'La trouver demande $\\lceil n/2 \\rceil - 1$ comparaisons parmi les feuilles ; la suppression ne coûte ensuite que $O(\\log n)$. Un tas est organisé pour son maximum, pas pour son minimum.',
      ),
    },
    {
      kind: 'read',
      title: t('The largest product', 'Le plus grand produit'),
      body: t(
        'Given a positive integer $n$, which two positive integers with sum $n$ have the **largest product**? Write them as $a$ and $n - a$ and look at the shape of $a(n - a)$.',
        'Étant donné un entier positif $n$, quels deux entiers positifs de somme $n$ ont le **plus grand produit** ? Écrivez-les $a$ et $n - a$ et regardez la forme de $a(n - a)$.',
      ),
      widget: () => <ProductBars />,
    },
    { kind: 'generated', make: (r) => productQ(r.int(10, 199)) },
    {
      kind: 'choice',
      body: t('How long does it take to compute the answer for any $n$?', 'Combien de temps faut-il pour calculer la réponse pour un $n$ quelconque ?'),
      options: t(
        ['$\\Theta(n)$: try every split', '$\\Theta(1)$: one division and one multiplication', '$\\Theta(\\log n)$'],
        ['$\\Theta(n)$ : essayer chaque partage', '$\\Theta(1)$ : une division et une multiplication', '$\\Theta(\\log n)$'],
      ),
      answer: 1,
      explain: t(
        'Rewriting the problem as a parabola turns a search over $n - 1$ splits into a formula.',
        'Réécrire le problème comme une parabole change une recherche parmi $n - 1$ partages en une formule.',
      ),
    },
  ],
};

export const ch5xLessons = [sortFirst, treeHeights, heapTricks];
