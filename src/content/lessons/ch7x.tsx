import { t } from '../../lib/i18n';
import type { Lesson } from '../../lib/types';
import { TraversalExplorer } from '../../widgets/search';
import { DijkstraLab, type WGraph } from '../../widgets/routes';

export const streetGraph: WGraph = {
  nodes: [
    { id: '1', x: 40, y: 110 },
    { id: '2', x: 160, y: 45 },
    { id: '3', x: 160, y: 180 },
    { id: '4', x: 280, y: 45 },
    { id: '5', x: 280, y: 180 },
    { id: '6', x: 400, y: 115 },
    { id: '7', x: 500, y: 50 },
    { id: '8', x: 500, y: 185 },
  ],
  edges: [
    { u: '1', v: '2', w: 2, directed: true },
    { u: '1', v: '3', w: 7, directed: true },
    { u: '2', v: '4', w: 2, directed: true },
    { u: '3', v: '2', w: 1, directed: true },
    { u: '4', v: '3', w: 1, directed: true },
    { u: '5', v: '2', w: 1, directed: true },
    { u: '3', v: '5', w: 3, directed: true },
    { u: '5', v: '4', w: 2, directed: true },
    { u: '4', v: '6', w: 3, directed: true },
    { u: '5', v: '6', w: 5, directed: true },
    { u: '6', v: '7', w: 1, directed: true },
    { u: '6', v: '8', w: 2, directed: true },
    { u: '8', v: '6', w: 4, directed: true },
    { u: '7', v: '8', w: 1, directed: true },
    { u: '8', v: '7', w: 1, directed: true },
  ],
};

const oneWay: Lesson = {
  id: 'c7l2',
  title: t('One-way streets', 'Des rues à sens unique'),
  summary: t(
    'You explored and routed through a network of one-way streets, following arrows only.',
    'Vous avez exploré un réseau de rues à sens unique et y avez trouvé des trajets, en suivant uniquement les flèches.',
  ),
  steps: [
    {
      kind: 'read',
      title: t('Arrows matter', 'Les flèches comptent'),
      body: t(
        'In this network every street is **one-way**: you may only follow an arrow in its direction. The numbers are travel times. From a vertex, the next vertices you can reach are its **successors** — we always take them in increasing order.',
        'Dans ce réseau, chaque rue est **à sens unique** : on ne peut suivre une flèche que dans son sens. Les nombres sont des temps de trajet. Depuis un sommet, les sommets qu’on peut atteindre ensuite sont ses **successeurs** — on les prend toujours par ordre croissant.',
      ),
    },
    {
      kind: 'task',
      title: t('Layer by layer', 'Couche par couche'),
      body: t(
        'Explore from vertex 1 **breadth first** (oldest discovered vertex first). Click the vertices in the order they are reached.',
        'Explorez depuis le sommet 1 **en largeur** (le sommet découvert le plus anciennement d’abord). Cliquez sur les sommets dans l’ordre où ils sont atteints.',
      ),
      widget: ({ onSolved }) => <TraversalExplorer graph={streetGraph} start="1" mode="bfs" width={540} height={225} onSolved={onSolved} />,
      success: t('Order: 1 2 3 4 5 6 7 8.', 'Ordre : 1 2 3 4 5 6 7 8.'),
    },
    {
      kind: 'task',
      title: t('As deep as possible', 'Aussi loin que possible'),
      body: t(
        'Now **depth first** from vertex 1 (most recently reached vertex first).',
        'Maintenant **en profondeur** depuis le sommet 1 (le sommet atteint le plus récemment d’abord).',
      ),
      widget: ({ onSolved }) => <TraversalExplorer graph={streetGraph} start="1" mode="dfs" width={540} height={225} onSolved={onSolved} />,
      success: t(
        'Order: 1 2 4 3 5 6 7 8 — from 4 we go back down to 3, then on to 5 and 6.',
        'Ordre : 1 2 4 3 5 6 7 8 — depuis 4 on redescend vers 3, puis on continue vers 5 et 6.',
      ),
    },
    {
      kind: 'sequence',
      body: t('Give the depth-first visiting order from 1.', 'Donnez l’ordre de visite en profondeur depuis 1.'),
      tokens: ['1', '2', '3', '4', '5', '6', '7', '8'],
      keepOrder: true,
      answer: ['1', '2', '4', '3', '5', '6', '7', '8'],
      explain: t(
        '2 is the first successor of 1, 4 the only one of 2, 3 the first of 4, and so on.',
        '2 est le premier successeur de 1, 4 le seul de 2, 3 le premier de 4, et ainsi de suite.',
      ),
    },
    {
      kind: 'task',
      title: t('Shortest times', 'Les temps les plus courts'),
      body: t(
        'Find the shortest travel time from 1 to every vertex: always finalise the unfinished vertex with the smallest tentative time.',
        'Trouvez le plus court temps de trajet de 1 vers chaque sommet : fixez toujours le sommet non fixé de temps provisoire le plus petit.',
      ),
      widget: ({ onSolved }) => <DijkstraLab graph={streetGraph} source="1" width={540} height={225} onSolved={onSolved} />,
      success: t('From 1: 2 → 2, 4 → 4, 3 → 5, 6 → 7, 5 → 8, 7 → 8, 8 → 9.', 'Depuis 1 : 2 → 2, 4 → 4, 3 → 5, 6 → 7, 5 → 8, 7 → 8, 8 → 9.'),
    },
    {
      kind: 'number',
      body: t('What is the shortest travel time from 1 to **3**?', 'Quel est le plus court temps de trajet de 1 à **3** ?'),
      answer: 5,
      explain: t(
        'The direct street 1 → 3 takes 7, but 1 → 2 → 4 → 3 takes 2 + 2 + 1 = 5. Only arrows can be followed: 3 → 2 would not help in the other direction.',
        'La rue directe 1 → 3 prend 7, mais 1 → 2 → 4 → 3 prend 2 + 2 + 1 = 5. On ne peut suivre que les flèches : 3 → 2 n’aiderait pas dans l’autre sens.',
      ),
    },
    {
      kind: 'number',
      body: t('And from 1 to **8**?', 'Et de 1 à **8** ?'),
      answer: 9,
      explain: t(
        'Either 1 → 2 → 4 → 6 → 8 (2 + 2 + 3 + 2) or via 7 (… 6 → 7 → 8: 2 + 2 + 3 + 1 + 1). Both take 9.',
        'Soit 1 → 2 → 4 → 6 → 8 (2 + 2 + 3 + 2), soit par 7 (… 6 → 7 → 8 : 2 + 2 + 3 + 1 + 1). Les deux prennent 9.',
      ),
    },
  ],
};

export const ch7xLessons = [oneWay];
