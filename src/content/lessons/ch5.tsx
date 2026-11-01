import { t } from '../../lib/i18n';
import type { Lesson, QuestionStep } from '../../lib/types';
import { AvlBuilder, AvlCheck, avlFrames, heapFrames, HeapViz, WineDecoder } from '../../widgets/reshape';

const HEAP_INPUT = [1, 8, 6, 5, 3, 7, 4];

/* ---------- practice questions with fresh numbers ---------- */

const PRACTICE = t('Practice', 'Entraînement');

export const heapQ = (keys: number[]): QuestionStep => {
  const heap = heapFrames(keys, 'bottom-up').at(-1)!.arr.map(String);
  return {
    kind: 'sequence',
    title: PRACTICE,
    body: t(
      `Build a heap **bottom-up** from the array **${keys.join(', ')}**. Give the resulting array, left to right.`,
      `Construisez un tas **de bas en haut** à partir du tableau **${keys.join(', ')}**. Donnez le tableau obtenu, de gauche à droite.`,
    ),
    tokens: keys.map(String),
    answer: heap,
    hint: t(
      'Sift down the parental nodes at positions 3, 2, then 1 (the root), each time swapping with the larger child.',
      'Faites descendre les nœuds parents aux positions 3, 2, puis 1 (la racine), en échangeant à chaque fois avec le plus grand enfant.',
    ),
    explain: t(
      `Sifting down positions 3, 2 and 1 gives **${heap.join(' ')}**: every parent is at least as big as its children.`,
      `Faire descendre les positions 3, 2 et 1 donne **${heap.join(' ')}** : chaque parent est au moins aussi grand que ses enfants.`,
    ),
  };
};

export const avlRotationsQ = (keys: number[]): QuestionStep => {
  const frames = avlFrames(keys);
  const rotations = frames.flatMap((f) => (f.rotation ? [t(`${f.rotation.kind} at ${f.rotation.at}`, `${f.rotation.kind} en ${f.rotation.at}`)] : []));
  return {
    kind: 'number',
    title: PRACTICE,
    body: t(
      `Insert **${keys.join(', ')}** one at a time into an empty AVL tree. How many rotations are needed (a double rotation counts as one)?`,
      `Insérez **${keys.join(', ')}** une à une dans un arbre AVL vide. Combien de rotations faut-il (une double rotation compte pour une) ?`,
    ),
    answer: frames.at(-1)!.rotations,
    hint: t(
      'After each insertion, walk back up from the new leaf and look for a balance factor of ±2.',
      'Après chaque insertion, remontez depuis la nouvelle feuille et cherchez un facteur d’équilibre de ±2.',
    ),
    explain: rotations.length
      ? t(
          `${rotations.length === 1 ? 'One rotation' : `${rotations.length} rotations`}: ${rotations.join(', ')}.`,
          `${rotations.length === 1 ? 'Une rotation' : `${rotations.length} rotations`} : ${rotations.join(', ')}.`,
        )
      : t('None: no node ever gets a balance factor of ±2.', 'Aucune : aucun nœud n’atteint jamais un facteur d’équilibre de ±2.'),
  };
};

const heaps: Lesson = {
  id: 'c5l1',
  title: t('Keeping the largest on top', 'Garder le plus grand en haut'),
  summary: t(
    'You can build a heap bottom-up or by insertions, and sort with it in Θ(n log n).',
    'Vous savez construire un tas de bas en haut ou par insertions, et trier avec en Θ(n log n).',
  ),
  steps: [
    {
      kind: 'read',
      title: t('Change the representation', 'Changer de représentation'),
      body: t(
        `A useful strategy: first change the problem into a more convenient form — a sorted array, a balanced tree, a heap… — and then solves it.

A **heap** is a complete binary tree (filled level by level, left to right) where every parent is **≥ its children** (*parental dominance*). It is stored in an array: the children of position $i$ are at $2i$ and $2i+1$ (counting from 1). So the maximum is always at the root.`,
        `Une stratégie utile : mettre d’abord le problème sous une forme plus commode — un tableau trié, un arbre équilibré, un tas… — puis le résoudre.

Un **tas** est un arbre binaire complet (rempli niveau par niveau, de gauche à droite) où chaque parent est **≥ à ses enfants** (*dominance parentale*). Il est rangé dans un tableau : les enfants de la position $i$ sont en $2i$ et $2i+1$ (en comptant à partir de 1). Le maximum est donc toujours à la racine.`,
      ),
    },
    {
      kind: 'task',
      title: t('Bottom-up', 'De bas en haut'),
      body: t(
        'Build a heap from **1, 8, 6, 5, 3, 7, 4**, already in the array. Bottom-up: starting from the last parental node and going back to the root, sift each key down until parental dominance holds.',
        'Construisez un tas à partir de **1, 8, 6, 5, 3, 7, 4**, déjà dans le tableau. De bas en haut : en partant du dernier nœud parent et en remontant jusqu’à la racine, faites descendre chaque clé jusqu’à ce que la dominance parentale soit respectée.',
      ),
      widget: ({ onSolved }) => <HeapViz input={HEAP_INPUT} mode="bottom-up" onSolved={onSolved} />,
      success: t('Heap: 8 5 7 1 3 6 4.', 'Tas : 8 5 7 1 3 6 4.'),
    },
    {
      kind: 'task',
      title: t('Top-down', 'De haut en bas'),
      body: t(
        'Now build it by **successive insertions**: each new key goes into the next free leaf and is sifted **up** while it is bigger than its parent.',
        'Construisez-le maintenant par **insertions successives** : chaque nouvelle clé va dans la prochaine feuille libre et **remonte** tant qu’elle est plus grande que son parent.',
      ),
      widget: ({ onSolved }) => <HeapViz input={HEAP_INPUT} mode="top-down" onSolved={onSolved} />,
      success: t(
        'Heap: 8 5 7 1 3 6 4 — the same heap as bottom-up, this time.',
        'Tas : 8 5 7 1 3 6 4 — le même tas que de bas en haut, cette fois.',
      ),
    },
    {
      kind: 'choice',
      body: t(
        'Do the two algorithms **always** build the same heap from the same list? Try mentally with **1, 2, 3**.',
        'Les deux algorithmes construisent-ils **toujours** le même tas à partir de la même liste ? Essayez de tête avec **1, 2, 3**.',
      ),
      options: t(
        ['Yes, always', 'No — for 1, 2, 3 bottom-up gives 3 2 1 but top-down gives 3 1 2', 'Only when the list is sorted'],
        ['Oui, toujours', 'Non — pour 1, 2, 3, de bas en haut donne 3 2 1 mais de haut en bas donne 3 1 2', 'Seulement quand la liste est triée'],
      ),
      answer: 1,
      explain: t(
        'Bottom-up sifts 1 down past its larger child 3: 3 2 1. Top-down: 1; then 2 swaps up: 2 1; then 3 swaps with 2: 3 1 2. Both are valid heaps — just different ones.',
        'De bas en haut, 1 descend sous son plus grand enfant 3 : 3 2 1. De haut en bas : 1 ; puis 2 remonte : 2 1 ; puis 3 s’échange avec 2 : 3 1 2. Les deux sont des tas valides — simplement différents.',
      ),
    },
    {
      kind: 'choice',
      body: t(
        'How can you check that an array $H[1..n]$ is a heap, and at what cost?',
        'Comment vérifier qu’un tableau $H[1..n]$ est un tas, et à quel coût ?',
      ),
      options: t(
        [
          'Check that the array is sorted in decreasing order — $\\Theta(n)$',
          'Check $H[i] \\ge H[2i]$ and $H[i] \\ge H[2i+1]$ for every parental position $i \\le \\lfloor n/2 \\rfloor$ — $\\Theta(n)$',
          'Build a heap and compare — $\\Theta(n \\log n)$',
        ],
        [
          'Vérifier que le tableau est trié par ordre décroissant — $\\Theta(n)$',
          'Vérifier $H[i] \\ge H[2i]$ et $H[i] \\ge H[2i+1]$ pour chaque position parente $i \\le \\lfloor n/2 \\rfloor$ — $\\Theta(n)$',
          'Construire un tas et comparer — $\\Theta(n \\log n)$',
        ],
      ),
      answer: 1,
      explain: t(
        'A heap need not be sorted (8 5 7 1 3 6 4 is not). Checking each parent against its at most two children takes about $n$ comparisons.',
        'Un tas n’a pas besoin d’être trié (8 5 7 1 3 6 4 ne l’est pas). Comparer chaque parent à ses deux enfants au plus demande environ $n$ comparaisons.',
      ),
    },
    {
      kind: 'task',
      title: t('Heapsort', 'Le tri par tas'),
      body: t(
        'Heapsort: (1) build a heap; (2) repeatedly swap the root (the maximum) with the last heap element, shrink the heap by one, and sift the new root down. Sort **1, 2, 3, 4, 5** in increasing order.',
        'Le tri par tas : (1) construire un tas ; (2) échanger sans cesse la racine (le maximum) avec le dernier élément du tas, réduire le tas d’une case, et faire descendre la nouvelle racine. Triez **1, 2, 3, 4, 5** par ordre croissant.',
      ),
      widget: ({ onSolved }) => <HeapViz input={[1, 2, 3, 4, 5]} mode="heapsort" onSolved={onSolved} />,
      success: t(
        'The green cells grow from the right: each deletion of the maximum puts one more key in its final place.',
        'Les cases vertes grandissent depuis la droite : chaque suppression du maximum met une clé de plus à sa place définitive.',
      ),
    },
    {
      kind: 'choice',
      body: t('What is the worst-case complexity of heapsort?', 'Quelle est la complexité dans le pire cas du tri par tas ?'),
      options: ['$\\Theta(n)$', '$\\Theta(n \\log n)$', '$\\Theta(n^2)$', '$\\Theta(\\log n)$'],
      answer: 1,
      explain: t(
        'Building the heap is $\\Theta(n)$; each of the $n - 1$ root deletions sifts down at most the height $\\lfloor\\log_2 n\\rfloor$: $\\Theta(n\\log n)$ in total, in place.',
        'Construire le tas coûte $\\Theta(n)$ ; chacune des $n - 1$ suppressions de la racine descend au plus de la hauteur $\\lfloor\\log_2 n\\rfloor$ : $\\Theta(n\\log n)$ au total, sur place.',
      ),
    },
    {
      kind: 'choice',
      body: t(
        'A priority queue supports **find max**, **delete max** and **insert**. With a heap, what are their costs?',
        'Une file de priorité offre **trouver le max**, **supprimer le max** et **insérer**. Avec un tas, quels sont leurs coûts ?',
      ),
      options: t(
        ['$\\Theta(1)$, $\\Theta(\\log n)$, $\\Theta(\\log n)$', '$\\Theta(n)$, $\\Theta(n)$, $\\Theta(1)$', '$\\Theta(1)$, $\\Theta(1)$, $\\Theta(n)$', '$\\Theta(\\log n)$ for all three'],
        ['$\\Theta(1)$, $\\Theta(\\log n)$, $\\Theta(\\log n)$', '$\\Theta(n)$, $\\Theta(n)$, $\\Theta(1)$', '$\\Theta(1)$, $\\Theta(1)$, $\\Theta(n)$', '$\\Theta(\\log n)$ pour les trois'],
      ),
      answer: 0,
      explain: t(
        'Max is at the root; deleting it or inserting a key moves one element along a root-to-leaf path. (Unsorted array: $\\Theta(n)$, $\\Theta(n)$, $\\Theta(1)$; sorted array: $\\Theta(1)$, $\\Theta(1)$, $\\Theta(n)$.)',
        'Le max est à la racine ; le supprimer ou insérer une clé déplace un élément le long d’un chemin racine-feuille. (Tableau non trié : $\\Theta(n)$, $\\Theta(n)$, $\\Theta(1)$ ; tableau trié : $\\Theta(1)$, $\\Theta(1)$, $\\Theta(n)$.)',
      ),
    },
    { kind: 'generated', make: (r) => heapQ(r.shuffle([...Array(30).keys()].map((i) => i + 1)).slice(0, 7)) },
  ],
};

const avl: Lesson = {
  id: 'c5l2',
  title: t('Keeping a search tree short', 'Garder un arbre de recherche bas'),
  summary: t(
    'You can recognise AVL trees and rebalance them with the four rotations while inserting.',
    'Vous savez reconnaître les arbres AVL et les rééquilibrer avec les quatre rotations pendant les insertions.',
  ),
  steps: [
    {
      kind: 'read',
      title: t('Balanced search trees', 'Les arbres de recherche équilibrés'),
      body: t(
        `A binary search tree is fast only if it is not too tall. An **AVL tree** is a binary search tree in which, for every node, the **balance factor** — height of the left subtree minus height of the right subtree — is $-1$, $0$ or $+1$ (the empty tree has height $-1$). Its height is then always $\\Theta(\\log n)$.`,
        `Un arbre binaire de recherche n’est rapide que s’il n’est pas trop haut. Un **arbre AVL** est un arbre binaire de recherche dans lequel, pour chaque nœud, le **facteur d’équilibre** — hauteur du sous-arbre gauche moins hauteur du sous-arbre droit — vaut $-1$, $0$ ou $+1$ (l’arbre vide a pour hauteur $-1$). Sa hauteur est alors toujours en $\\Theta(\\log n)$.`,
      ),
    },
    {
      kind: 'choice',
      body: t(
        'Which of these binary trees are AVL trees? Use both checkboxes.',
        'Lesquels de ces arbres binaires sont des arbres AVL ? Utilisez les deux cases à cocher.',
      ),
      widget: () => <AvlCheck />,
      options: t(['(a) only', '(a) and (c)', '(b) and (c)', 'All three'], ['(a) seulement', '(a) et (c)', '(b) et (c)', 'Les trois']),
      answer: 0,
      explain: t(
        '(b) is unbalanced: node 4 has a left subtree of height 1 and an empty right subtree (factor +2). (c) is perfectly balanced but **not a search tree** (2 is right of 3, 7 is left of 6), so it cannot be an AVL tree.',
        '(b) est déséquilibré : le nœud 4 a un sous-arbre gauche de hauteur 1 et un sous-arbre droit vide (facteur +2). (c) est parfaitement équilibré mais **n’est pas un arbre de recherche** (2 est à droite de 3, 7 à gauche de 6), il ne peut donc pas être un AVL.',
      ),
    },
    {
      kind: 'task',
      body: t(
        'Insert **1, 2, 3, 4, 5, 6** into an empty AVL tree. Increasing keys would build a degenerate list in a plain BST; watch the rotations prevent it.',
        'Insérez **1, 2, 3, 4, 5, 6** dans un arbre AVL vide. Des clés croissantes construiraient une liste dégénérée dans un simple arbre de recherche ; regardez les rotations l’empêcher.',
      ),
      widget: ({ onSolved }) => <AvlBuilder keys={[1, 2, 3, 4, 5, 6]} onSolved={onSolved} />,
      success: t(
        'Three single left rotations; final tree rooted at 4, height 2.',
        'Trois rotations simples à gauche ; l’arbre final a pour racine 4 et pour hauteur 2.',
      ),
    },
    {
      kind: 'read',
      title: t('The four rotations', 'Les quatre rotations'),
      body: t(
        `After an insertion, find the **deepest** node whose balance factor became $\\pm2$, and look at where the new key went:

- left subtree of its **left** child → single **right** rotation (R);
- right subtree of its **right** child → single **left** rotation (L);
- right subtree of its left child → double **left-right** rotation (LR);
- left subtree of its right child → double **right-left** rotation (RL).

One rotation always restores the balance of the whole tree.`,
        `Après une insertion, trouvez le nœud **le plus profond** dont le facteur d’équilibre est devenu $\\pm2$, et regardez où la nouvelle clé est allée :

- sous-arbre gauche de son enfant **gauche** → rotation simple **à droite** (R) ;
- sous-arbre droit de son enfant **droit** → rotation simple **à gauche** (L) ;
- sous-arbre droit de son enfant gauche → double rotation **gauche-droite** (LR) ;
- sous-arbre gauche de son enfant droit → double rotation **droite-gauche** (RL).

Une seule rotation rétablit toujours l’équilibre de tout l’arbre. (L et R sont les initiales anglaises de gauche et de droite.)`,
      ),
    },
    {
      kind: 'task',
      body: t(
        'Insert **3 10 13 4 16 8 6 14 9 7**, one key at a time, and note each rotation.',
        'Insérez **3 10 13 4 16 8 6 14 9 7**, une clé à la fois, et notez chaque rotation.',
      ),
      widget: ({ onSolved }) => <AvlBuilder keys={[3, 10, 13, 4, 16, 8, 6, 14, 9, 7]} onSolved={onSolved} />,
      success: t(
        'Final tree: root 10; left subtree 6 (4 (3), 8 (7, 9)); right subtree 14 (13, 16).',
        'Arbre final : racine 10 ; sous-arbre gauche 6 (4 (3), 8 (7, 9)) ; sous-arbre droit 14 (13, 16).',
      ),
    },
    {
      kind: 'number',
      body: t(
        'How many rotations (counting a double rotation as one) were needed for this sequence?',
        'Combien de rotations (une double rotation comptant pour une) ont été nécessaires pour cette suite ?',
      ),
      answer: 4,
      explain: t(
        'L at 3 (inserting 13), L at 3 (inserting 8), RL at 13 (inserting 14), RL at 4 (inserting 7).',
        'L en 3 (insertion de 13), L en 3 (insertion de 8), RL en 13 (insertion de 14), RL en 4 (insertion de 7).',
      ),
    },
    {
      kind: 'sequence',
      body: t('Give the types of those rotations, in order.', 'Donnez les types de ces rotations, dans l’ordre.'),
      tokens: ['L', 'R', 'LR', 'RL', 'L', 'RL'],
      answer: ['L', 'L', 'RL', 'RL'],
      explain: 'L, L, RL, RL.',
    },
    { kind: 'generated', make: (r) => avlRotationsQ(r.shuffle([...Array(40).keys()].map((i) => i + 1)).slice(0, 6)) },
  ],
};

const wine: Lesson = {
  id: 'c5l3',
  title: t('One round of tasting', 'Une seule tournée de dégustation'),
  summary: t('You recast a search problem in binary to solve it in one round.', 'Vous avez reformulé une recherche en binaire pour la résoudre en une seule tournée.'),
  steps: [
    {
      kind: 'read',
      title: t('A grim puzzle', 'Une sinistre énigme'),
      body: t(
        'A wicked king learns that one of his **1000** barrels of wine is poisoned. The poison kills in **exactly 30 days**, even in a tiny dose. A feast is planned in **5 weeks**. He is ready to use **10** tasters to find the poisoned barrel. Testing barrels one by one would take years… Change the point of view: write barrel numbers in **binary**.',
        'Un roi cruel apprend qu’un de ses **1000** tonneaux de vin est empoisonné. Le poison tue en **exactement 30 jours**, même à toute petite dose. Un festin est prévu dans **5 semaines**. Il est prêt à employer **10** goûteurs pour trouver le tonneau empoisonné. Tester les tonneaux un par un prendrait des années… Changez de point de vue : écrivez les numéros des tonneaux en **binaire**.',
      ),
    },
    {
      kind: 'task',
      body: t(
        'Choose a poisoned barrel, see who drinks what, then wait 30 days.',
        'Choisissez un tonneau empoisonné, regardez qui boit quoi, puis attendez 30 jours.',
      ),
      widget: ({ onSolved }) => <WineDecoder onSolved={onSolved} />,
      success: t('The pattern of deaths *is* the binary number of the barrel.', 'Le motif des décès *est* le numéro binaire du tonneau.'),
    },
    {
      kind: 'choice',
      body: t(
        'Can the poisoned barrel be identified before the feast in 5 weeks?',
        'Peut-on identifier le tonneau empoisonné avant le festin dans 5 semaines ?',
      ),
      options: t(
        ['Yes: one round of tasting is enough, since $2^{10} = 1024 \\ge 1000$, and 30 days < 35 days', 'No: it needs 10 rounds of 30 days', 'Only if the barrel number is even'],
        ['Oui : une seule tournée de dégustation suffit, car $2^{10} = 1024 \\ge 1000$, et 30 jours < 35 jours', 'Non : il faut 10 tournées de 30 jours', 'Seulement si le numéro du tonneau est pair'],
      ),
      answer: 0,
      explain: t(
        'Every barrel gets a distinct 10-bit pattern of tasters, all tasting happens on day 1, and the results are read on day 30.',
        'Chaque tonneau reçoit un motif distinct de goûteurs sur 10 bits, toutes les dégustations ont lieu le jour 1, et on lit les résultats le jour 30.',
      ),
    },
    {
      kind: 'choice',
      body: t('Could the king do it with only **8** tasters?', 'Le roi pourrait-il y arriver avec seulement **8** goûteurs ?'),
      options: t(
        ['Yes, the same way', 'No: 8 tasters give only $2^8 = 256$ distinct death patterns in one round, fewer than 1000 barrels — and there is no time for a second round', 'Yes, by testing half the barrels first'],
        ['Oui, de la même façon', 'Non : 8 goûteurs ne donnent que $2^8 = 256$ motifs de décès distincts en une tournée, moins que 1000 tonneaux — et il n’y a pas le temps pour une deuxième tournée', 'Oui, en testant d’abord la moitié des tonneaux'],
      ),
      answer: 1,
      explain: t(
        'One round distinguishes at most $2^k$ barrels with $k$ tasters. $\\lceil\\log_2 1000\\rceil = 10$ is the minimum.',
        'Une tournée distingue au plus $2^k$ tonneaux avec $k$ goûteurs. $\\lceil\\log_2 1000\\rceil = 10$ est le minimum.',
      ),
    },
  ],
};

export const ch5Lessons = [heaps, avl, wine];
