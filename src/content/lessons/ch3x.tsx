import { t } from '../../lib/i18n';
import type { Lesson } from '../../lib/types';
import { BstCompare, BstWalk, GlassRow, HairCutter, RiverCrossing } from '../../widgets/shrink-extra';

export const GLASSES_START = [true, true, true, true, false, false, false, false];
export const GLASSES_MIXED = [false, true, true, false, false, true, true, false];
export const WALK_KEYS = [50, 30, 70, 20, 40, 60, 80, 65, 90, 85];

const river: Lesson = {
  id: 'c3l4',
  title: t('Crossing the river', 'Traverser la rivière'),
  summary: t(
    'You reduced a crossing problem with n soldiers to the same problem with n − 1, four trips at a time.',
    'Vous avez ramené une traversée avec n soldats au même problème avec n − 1, quatre trajets à la fois.',
  ),
  steps: [
    {
      kind: 'read',
      title: t('A tiny boat', 'Une toute petite barque'),
      body: t(
        `A group of $n$ soldiers must cross a wide river with no bridge. Two kids are playing in a small boat, which can carry **two kids** or **one soldier** — never a soldier and a kid together. The soldiers must all get across, and the kids must keep their boat (on their own bank) at the end.`,
        `Un groupe de $n$ soldats doit traverser une large rivière sans pont. Deux enfants jouent dans une petite barque, qui peut porter **deux enfants** ou **un soldat** — jamais un soldat et un enfant ensemble. Tous les soldats doivent traverser, et les enfants doivent récupérer leur barque (sur leur rive) à la fin.`,
      ),
    },
    {
      kind: 'task',
      body: t('Get **2** soldiers across.', 'Faites traverser **2** soldats.'),
      widget: ({ onSolved }) => <RiverCrossing initialN={2} onSolved={onSolved} />,
      hint: t(
        'Someone has to bring the boat back after a soldier crosses — and it can’t be the soldier.',
        'Quelqu’un doit ramener la barque après la traversée d’un soldat — et ce ne peut pas être le soldat.',
      ),
      success: t(
        'Kids cross together, one kid rows back, a soldier crosses, the other kid rows back. The situation is exactly the start, with one soldier fewer.',
        'Les enfants traversent ensemble, un enfant revient, un soldat traverse, l’autre enfant revient. On retrouve exactement la situation de départ, avec un soldat de moins.',
      ),
    },
    {
      kind: 'number',
      body: t(
        'How many crossings does it take to move **one** soldier across and return to the starting situation (both kids home with the boat)?',
        'Combien de traversées faut-il pour faire passer **un** soldat et revenir à la situation de départ (les deux enfants chez eux avec la barque) ?',
      ),
      answer: 4,
      explain: t(
        'Two kids over, one kid back, soldier over, the other kid back.',
        'Les deux enfants à l’aller, un enfant au retour, le soldat à l’aller, l’autre enfant au retour.',
      ),
    },
    {
      kind: 'choice',
      body: t(
        'Each round solves the problem for one soldier and leaves the same problem with $n - 1$ soldiers. How many crossings for $n$ soldiers?',
        'Chaque tour règle le problème pour un soldat et laisse le même problème avec $n - 1$ soldats. Combien de traversées pour $n$ soldats ?',
      ),
      options: ['$2n$', '$4n$', '$n^2$', '$2^n$'],
      answer: 1,
      explain: t(
        '$C(n) = C(n - 1) + 4$, $C(0) = 0$ gives $C(n) = 4n$: solve one soldier, and the rest is the same puzzle, one size smaller.',
        '$C(n) = C(n - 1) + 4$, $C(0) = 0$ donne $C(n) = 4n$ : on règle un soldat, et le reste est le même casse-tête, d’une taille en moins.',
      ),
    },
  ],
};

const fewestMoves: Lesson = {
  id: 'c3l5',
  title: t('Fewest moves', 'Le moins de coups possible'),
  summary: t(
    'You found minimum-move strategies by thinking about what each move can fix.',
    'Vous avez trouvé des stratégies au nombre de coups minimal en réfléchissant à ce que chaque coup peut réparer.',
  ),
  steps: [
    {
      kind: 'task',
      title: t('Glasses in a row', 'Des verres en rangée'),
      body: t(
        '$2n$ glasses stand in a row: the first $n$ are full, the others empty. Make them alternate **full, empty, full, empty…** by swapping glasses, in as few swaps as possible. Here $n = 4$.',
        '$2n$ verres sont alignés : les $n$ premiers sont pleins, les autres vides. Faites-les alterner **plein, vide, plein, vide…** en échangeant des verres, avec le moins d’échanges possible. Ici $n = 4$.',
      ),
      widget: ({ onSolved }) => <GlassRow initial={GLASSES_START} onSolved={onSolved} />,
      success: t('Swap glass 2 with glass 7 and glass 4 with glass 5.', 'Échangez le verre 2 avec le verre 7 et le verre 4 avec le verre 5.'),
    },
    {
      kind: 'choice',
      body: t(
        'How many swaps are needed in general for $n$ full glasses followed by $n$ empty ones?',
        'Combien d’échanges faut-il en général pour $n$ verres pleins suivis de $n$ vides ?',
      ),
      options: ['$n - 1$', '$\\lfloor n/2 \\rfloor$', '$n$', '$2n$'],
      answer: 1,
      explain: t(
        'Among the first $n$ positions, the even-numbered ones ($\\lfloor n/2\\rfloor$ of them) hold full glasses that must leave; each swap fixes one of them together with an empty glass that is out of place. (Pouring a full glass into an empty one counts the same.)',
        'Parmi les $n$ premières places, celles de numéro pair (il y en a $\\lfloor n/2\\rfloor$) contiennent des verres pleins qui doivent partir ; chaque échange en répare un, en même temps qu’un verre vide mal placé. (Verser un verre plein dans un vide compte de la même façon.)',
      ),
    },
    {
      kind: 'task',
      body: t(
        'Now the glasses start in a **random** order (still 4 full, 4 empty). Make them alternate with the fewest swaps.',
        'Maintenant les verres partent dans un ordre **quelconque** (toujours 4 pleins, 4 vides). Faites-les alterner avec le moins d’échanges.',
      ),
      widget: ({ onSolved }) => <GlassRow initial={GLASSES_MIXED} onSolved={onSolved} />,
      success: t(
        'Two misplaced full glasses, two misplaced empty ones: two swaps.',
        'Deux verres pleins mal placés, deux vides mal placés : deux échanges.',
      ),
    },
    {
      kind: 'choice',
      body: t('What is the general strategy for a random order?', 'Quelle est la stratégie générale pour un ordre quelconque ?'),
      options: t(
        [
          'Sort the glasses first',
          'Scan once: pair each full glass standing on an "empty" position with an empty glass standing on a "full" position, and swap them. Swaps = number of misplaced full glasses',
          'Swap neighbours until it alternates',
        ],
        [
          'Trier d’abord les verres',
          'Un seul passage : associer chaque verre plein placé sur une position « vide » à un verre vide placé sur une position « pleine », et les échanger. Échanges = nombre de verres pleins mal placés',
          'Échanger des voisins jusqu’à ce que ça alterne',
        ],
      ),
      answer: 1,
      explain: t(
        'There are exactly as many misplaced full glasses as misplaced empty ones, and one swap fixes one of each — so no strategy can do better.',
        'Il y a exactement autant de verres pleins mal placés que de vides mal placés, et un échange en répare un de chaque — aucune stratégie ne peut donc faire mieux.',
      ),
    },
    {
      kind: 'task',
      title: t('Cutting a strand', 'Couper un cheveu'),
      body: t(
        'A strand of hair $n$ cm long must be cut into $n$ pieces of 1 cm. You can lay several pieces side by side and cut them all with one stroke. Cut the 10 cm strand in as few strokes as possible.',
        'Un cheveu de $n$ cm doit être coupé en $n$ morceaux de 1 cm. On peut poser plusieurs morceaux côte à côte et les couper tous d’un seul coup. Coupez le cheveu de 10 cm en le moins de coups possible.',
      ),
      widget: ({ onSolved }) => <HairCutter onSolved={onSolved} />,
      success: t(
        'Halving everything each time: 10 → 5 → 3 → 2 → 1. Four cuts.',
        'En coupant tout en deux à chaque fois : 10 → 5 → 3 → 2 → 1. Quatre coupes.',
      ),
    },
    {
      kind: 'number',
      body: t('How many cuts are needed for a strand of **100 cm**?', 'Combien de coupes faut-il pour un cheveu de **100 cm** ?'),
      answer: 7,
      hint: t('Each cut can at most double the number of pieces.', 'Chaque coupe peut au plus doubler le nombre de morceaux.'),
      explain: t(
        'Each stroke at most doubles the number of pieces: $k$ cuts give at most $2^k$ pieces, so we need $2^k \\ge 100$, i.e. $\\lceil\\log_2 100\\rceil = 7$ — and halving everything achieves it.',
        'Chaque coup au plus double le nombre de morceaux : $k$ coupes donnent au plus $2^k$ morceaux, il faut donc $2^k \\ge 100$, soit $\\lceil\\log_2 100\\rceil = 7$ — et tout couper en deux y parvient.',
      ),
    },
  ],
};

const treeWalks: Lesson = {
  id: 'c3l6',
  title: t('Inside a search tree', 'Dans un arbre de recherche'),
  summary: t(
    'You walked a binary search tree to find its largest key, list keys in decreasing order and compare two trees.',
    'Vous avez parcouru un arbre binaire de recherche pour trouver sa plus grande clé, lister les clés par ordre décroissant et comparer deux arbres.',
  ),
  steps: [
    {
      kind: 'read',
      title: t('Smaller left, larger right', 'Plus petit à gauche, plus grand à droite'),
      body: t(
        'In a binary **search** tree, every key in a node’s left subtree is smaller than the node, and every key in its right subtree is larger. That rule tells you where to look — so you rarely need to look everywhere.',
        'Dans un arbre binaire **de recherche**, chaque clé du sous-arbre gauche d’un nœud est plus petite que lui, et chaque clé de son sous-arbre droit est plus grande. Cette règle dit où chercher — on a donc rarement besoin de chercher partout.',
      ),
    },
    {
      kind: 'task',
      body: t('Find the largest key.', 'Trouvez la plus grande clé.'),
      widget: ({ onSolved }) => <BstWalk keys={WALK_KEYS} mode="max" onSolved={onSolved} />,
      success: t(
        'Keep going right until there is no right child: 50 → 70 → 80 → 90.',
        'Continuez à droite jusqu’à ce qu’il n’y ait plus d’enfant droit : 50 → 70 → 80 → 90.',
      ),
    },
    {
      kind: 'choice',
      body: t(
        'What is the worst-case cost of this search on a tree with $n$ keys?',
        'Quel est le coût dans le pire cas de cette recherche sur un arbre de $n$ clés ?',
      ),
      options: t(
        ['$\\Theta(1)$', '$\\Theta(\\log n)$ always', '$\\Theta(h)$ for a tree of height $h$, so $\\Theta(n)$ if the tree degenerates into a chain', '$\\Theta(n \\log n)$'],
        ['$\\Theta(1)$', '$\\Theta(\\log n)$ toujours', '$\\Theta(h)$ pour un arbre de hauteur $h$, donc $\\Theta(n)$ si l’arbre dégénère en chaîne', '$\\Theta(n \\log n)$'],
      ),
      answer: 2,
      explain: t(
        'It visits one node per level on the rightmost path. Each step drops a whole left subtree — a reduction whose size varies from step to step.',
        'Elle visite un nœud par niveau sur le chemin le plus à droite. Chaque pas écarte tout un sous-arbre gauche — une réduction dont la taille varie d’un pas à l’autre.',
      ),
    },
    {
      kind: 'task',
      body: t(
        'Now print all keys in **decreasing** order with a recursive walk.',
        'Maintenant, affichez toutes les clés par ordre **décroissant** avec un parcours récursif.',
      ),
      widget: ({ onSolved }) => <BstWalk keys={WALK_KEYS} mode="descending" onSolved={onSolved} />,
      success: '90 85 80 70 65 60 50 40 30 20.',
    },
    {
      kind: 'choice',
      body: t(
        'Which recursive order prints a search tree in decreasing order?',
        'Quel ordre récursif affiche un arbre de recherche par ordre décroissant ?',
      ),
      options: t(
        ['node, left, right', 'left, node, right', 'right, node, left', 'left, right, node'],
        ['nœud, gauche, droite', 'gauche, nœud, droite', 'droite, nœud, gauche', 'gauche, droite, nœud'],
      ),
      answer: 2,
      explain: t(
        'Everything on the right is larger than the node, which is larger than everything on the left. (Left, node, right gives increasing order.)',
        'Tout ce qui est à droite est plus grand que le nœud, lui-même plus grand que tout ce qui est à gauche. (Gauche, nœud, droite donne l’ordre croissant.)',
      ),
    },
    {
      kind: 'choice',
      title: t('Same keys, different shapes', 'Mêmes clés, formes différentes'),
      body: t(
        'These two search trees were built from the same keys inserted in different orders. How can you check, in linear time, that two search trees contain exactly the same keys?',
        'Ces deux arbres de recherche ont été construits avec les mêmes clés insérées dans des ordres différents. Comment vérifier, en temps linéaire, que deux arbres de recherche contiennent exactement les mêmes clés ?',
      ),
      widget: () => <BstCompare a={[5, 3, 8, 1, 4, 9]} b={[4, 1, 8, 3, 9, 5]} />,
      options: t(
        ['Compare their shapes', 'Compare their roots', 'List both in in-order (increasing) and compare the two lists', 'It needs $\\Theta(n^2)$ comparisons'],
        ['Comparer leurs formes', 'Comparer leurs racines', 'Lister les deux dans l’ordre infixe (croissant) et comparer les deux listes', 'Il faut $\\Theta(n^2)$ comparaisons'],
      ),
      answer: 2,
      explain: t(
        'The in-order walk of a search tree is its sorted key list, whatever its shape: two $\\Theta(n)$ walks and one $\\Theta(n)$ comparison.',
        'Le parcours infixe d’un arbre de recherche donne la liste triée de ses clés, quelle que soit sa forme : deux parcours en $\\Theta(n)$ et une comparaison en $\\Theta(n)$.',
      ),
    },
  ],
};

export const ch3xLessons = [river, fewestMoves, treeWalks];
