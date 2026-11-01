import { t } from '../../lib/i18n';
import type { Lesson, QuestionStep } from '../../lib/types';
import { dijkstra, DijkstraLab, type WGraph } from '../../widgets/routes';
import { GraphView } from '../../widgets/kit';

export const smallGraph: WGraph = {
  nodes: [
    { id: 'a', x: 40, y: 160 },
    { id: 'b', x: 140, y: 60 },
    { id: 'c', x: 300, y: 60 },
    { id: 'd', x: 210, y: 160 },
    { id: 'e', x: 380, y: 160 },
  ],
  edges: [
    { u: 'a', v: 'b', w: 3 },
    { u: 'a', v: 'd', w: 7 },
    { u: 'b', v: 'c', w: 4 },
    { u: 'b', v: 'd', w: 2 },
    { u: 'd', v: 'c', w: 5 },
    { u: 'c', v: 'e', w: 8 },
    { u: 'd', v: 'e', w: 4 },
  ],
};

export const CITY = { N: 'Nantes', PM: 'Paris-Montp.', PL: 'Paris-Lyon', L: 'Lyon', G: 'Grenoble', M: 'Marseille' };

export const railGraph: WGraph = {
  nodes: [
    { id: 'N', label: CITY.N, x: 60, y: 140, w: 84 },
    { id: 'PM', label: CITY.PM, x: 200, y: 44, w: 104 },
    { id: 'PL', label: CITY.PL, x: 400, y: 44, w: 96 },
    { id: 'L', label: CITY.L, x: 300, y: 180, w: 70 },
    { id: 'G', label: CITY.G, x: 440, y: 240, w: 88 },
    { id: 'M', label: CITY.M, x: 270, y: 310, w: 92 },
  ],
  edges: [
    { u: 'N', v: 'PM', w: 2 },
    { u: 'PM', v: 'PL', w: 1 },
    { u: 'N', v: 'L', w: 7 },
    { u: 'PL', v: 'L', w: 3.5 },
    { u: 'PL', v: 'G', w: 4.5 },
    { u: 'L', v: 'G', w: 1 },
    { u: 'L', v: 'M', w: 3 },
    { u: 'G', v: 'M', w: 4.5 },
  ],
};

const trapGraph = {
  nodes: [
    { id: 's', x: 40, y: 100 },
    { id: 'x', x: 180, y: 40 },
    { id: 'y', x: 180, y: 160 },
    { id: 't', x: 320, y: 100 },
  ],
  edges: [
    { u: 's', v: 'x', w: 1, directed: true },
    { u: 'x', v: 't', w: 10, directed: true },
    { u: 's', v: 'y', w: 2, directed: true },
    { u: 'y', v: 't', w: 2, directed: true },
  ],
};

/* ---------- practice questions with fresh numbers ---------- */

/** The small graph again, with new travel times; asks for the distance from a to `target`. */
export const routeQ = (weights: number[], target: string): QuestionStep => {
  const g: WGraph = { nodes: smallGraph.nodes, edges: smallGraph.edges.map((e, i) => ({ ...e, w: weights[i] })) };
  const { dist, prev } = dijkstra(g, 'a');
  const path = [target];
  while (prev[path[0]]) path.unshift(prev[path[0]]!);
  const legs = path.slice(1).map((v, i) => g.edges.find((e) => (e.u === path[i] && e.v === v) || (e.v === path[i] && e.u === v))!.w);
  return {
    kind: 'number',
    title: t('Practice', 'Entraînement'),
    body: t(
      `Same roads, new travel times. What is the length of the shortest path from $a$ to $${target}$?`,
      `Mêmes routes, nouveaux temps de trajet. Quelle est la longueur du plus court chemin de $a$ à $${target}$ ?`,
    ),
    widget: () => <GraphView nodes={g.nodes} edges={g.edges} width={420} height={210} fill={(id) => (id === 'a' || id === target ? 'active' : 'idle')} />,
    answer: dist[target],
    hint: t(
      'Run Dijkstra from $a$: always finalise the closest unfinished vertex, then update its neighbours.',
      'Lancez Dijkstra depuis $a$ : fixez toujours le sommet non fixé le plus proche, puis mettez à jour ses voisins.',
    ),
    explain: `$${path.join(' \\to ')}$${t(':', ' :')} $${legs.join(' + ')} = ${dist[target]}$.`,
  };
};

const dijkstraLesson: Lesson = {
  id: 'c7l1',
  title: t('Shortest routes', 'Les plus courts trajets'),
  summary: t(
    'You can run Dijkstra by hand and explain why always picking the closest vertex is safe — and when short-sighted choices fail.',
    'Vous savez dérouler Dijkstra à la main et expliquer pourquoi choisir toujours le sommet le plus proche est sûr — et quand des choix à courte vue échouent.',
  ),
  steps: [
    {
      kind: 'read',
      title: t('Best step first, done right', 'Le meilleur pas d’abord, bien fait'),
      body: t(
        `A **best-step-first** algorithm builds a solution step by step, always taking the choice that looks best *right now*, and never going back.

**Dijkstra's algorithm** finds the shortest paths from a source to every vertex (non-negative weights):
- every vertex has a *tentative* distance (∞ at first, 0 for the source);
- repeatedly **finalise** the unfinished vertex with the **smallest** tentative distance;
- then **relax** its edges: if going through it gives a shorter route to a neighbour, update that neighbour.`,
        `Un algorithme du **meilleur pas d’abord** construit une solution étape par étape, en prenant toujours le choix qui semble le meilleur *tout de suite*, sans jamais revenir en arrière.

L’**algorithme de Dijkstra** trouve les plus courts chemins d’une source vers chaque sommet (poids positifs ou nuls) :
- chaque sommet a une distance *provisoire* (∞ au début, 0 pour la source) ;
- on **fixe** sans cesse le sommet non fixé de distance provisoire **la plus petite** ;
- puis on **relâche** ses arêtes : si passer par lui donne un trajet plus court vers un voisin, on met ce voisin à jour.`,
      ),
    },
    {
      kind: 'task',
      body: t(
        'Find the shortest distances from $a$. Click the vertices in the order Dijkstra finalises them (the small badges are the tentative distances).',
        'Trouvez les plus courtes distances depuis $a$. Cliquez sur les sommets dans l’ordre où Dijkstra les fixe (les petites pastilles sont les distances provisoires).',
      ),
      widget: ({ onSolved }) => <DijkstraLab graph={smallGraph} source="a" width={420} height={210} onSolved={onSolved} />,
      success: t(
        'From $a$: $b = 3$, $d = 5$ (via $b$), $c = 7$ (via $b$), $e = 9$ (via $d$). The purple edges form the **shortest-path tree**.',
        'Depuis $a$ : $b = 3$, $d = 5$ (par $b$), $c = 7$ (par $b$), $e = 9$ (par $d$). Les arêtes violettes forment l’**arbre des plus courts chemins**.',
      ),
    },
    {
      kind: 'number',
      body: t('What is the length of the shortest path from $a$ to $e$?', 'Quelle est la longueur du plus court chemin de $a$ à $e$ ?'),
      answer: 9,
      explain: t(
        '$a \\to b \\to d \\to e$: $3 + 2 + 4 = 9$. The direct-looking $a \\to d \\to e$ costs $7 + 4 = 11$.',
        '$a \\to b \\to d \\to e$ : $3 + 2 + 4 = 9$. Le trajet d’apparence directe $a \\to d \\to e$ coûte $7 + 4 = 11$.',
      ),
    },
    {
      kind: 'task',
      body: t(
        'Train journeys (hours; Paris-Montparnasse ↔ Paris-Lyon is a 1 h bus). Run Dijkstra from **Nantes**.',
        'Trajets en train (en heures ; Paris-Montparnasse ↔ Paris-Lyon est un bus d’1 h). Lancez Dijkstra depuis **Nantes**.',
      ),
      widget: ({ onSolved }) => <DijkstraLab graph={railGraph} source="N" width={500} height={340} rect labels={CITY} onSolved={onSolved} />,
      success: t(
        'Grenoble is reached in 7.5 h — via Paris (2 + 1 + 4.5), or equally via Paris and Lyon (2 + 1 + 3.5 + 1).',
        'Grenoble est atteinte en 7,5 h — par Paris (2 + 1 + 4,5), ou aussi bien par Paris et Lyon (2 + 1 + 3,5 + 1).',
      ),
    },
    {
      kind: 'number',
      body: t(
        'What is the shortest travel time from Nantes to Grenoble, in hours?',
        'Quel est le plus court temps de trajet de Nantes à Grenoble, en heures ?',
      ),
      answer: 7.5,
      tolerance: 0.001,
      suffix: 'h',
      explain: t(
        'Nantes → Paris-Montparnasse (2) → Paris-Lyon (1) → Grenoble (4.5) = 7.5 h. The direct-looking Nantes → Lyon → Grenoble takes 7 + 1 = 8 h.',
        'Nantes → Paris-Montparnasse (2) → Paris-Lyon (1) → Grenoble (4,5) = 7,5 h. Le trajet d’apparence directe Nantes → Lyon → Grenoble prend 7 + 1 = 8 h.',
      ),
    },
    {
      kind: 'choice',
      title: t('A shortcut that fails', 'Un raccourci qui échoue'),
      body: t(
        'Another short-sighted idea: from the source, always move to the **nearest successor** of the current vertex, and set its distance to dist(current) + weight. On this graph, what does it give for $t$?',
        'Une autre idée à courte vue : depuis la source, aller toujours vers le **successeur le plus proche** du sommet courant, et lui donner la distance dist(courant) + poids. Sur ce graphe, que donne-t-elle pour $t$ ?',
      ),
      widget: () => <GraphView nodes={trapGraph.nodes} edges={trapGraph.edges} width={360} height={200} />,
      options: t(
        ['4, the correct answer', '11: it goes $s \\to x \\to t$ because $x$ is the nearest successor of $s$, missing $s \\to y \\to t = 4$', 'It never reaches $t$', '2'],
        ['4, la bonne réponse', '11 : elle va $s \\to x \\to t$ car $x$ est le successeur le plus proche de $s$, et rate $s \\to y \\to t = 4$', 'Elle n’atteint jamais $t$', '2'],
      ),
      answer: 1,
      explain: t(
        'Being locally closest says nothing about the total. This procedure also follows a single chain (it never comes back to explore other successors, so many vertices stay at ∞) and can loop on cycles. Dijkstra is safe because it finalises the globally closest **unfinished vertex**, not the closest neighbour.',
        'Être le plus proche localement ne dit rien du total. Cette procédure suit aussi une seule chaîne (elle ne revient jamais explorer d’autres successeurs, donc beaucoup de sommets restent à ∞) et peut tourner en rond sur des cycles. Dijkstra est sûr parce qu’il fixe le **sommet non fixé** le plus proche globalement, pas le voisin le plus proche.',
      ),
    },
    {
      kind: 'choice',
      title: t('And the longest path?', 'Et le plus long chemin ?'),
      body: t(
        'On a directed **acyclic** graph, can we find a maximum-weight path by running Dijkstra with “largest” instead of “smallest”?',
        'Sur un graphe orienté **sans cycle**, peut-on trouver un chemin de poids maximum en lançant Dijkstra avec « le plus grand » au lieu de « le plus petit » ?',
      ),
      options: t(
        [
          'Yes, it works the same way',
          'No — the argument breaks (a longer path may still appear later). On a DAG, process the vertices in topological order and keep the best value: $\\text{long}(v) = \\max_u(\\text{long}(u) + w(u,v))$',
          'Only with negative weights',
        ],
        [
          'Oui, ça marche de la même façon',
          'Non — l’argument ne tient plus (un chemin plus long peut encore apparaître plus tard). Sur un graphe sans cycle, traitez les sommets dans l’ordre topologique en gardant la meilleure valeur : $\\text{long}(v) = \\max_u(\\text{long}(u) + w(u,v))$',
          'Seulement avec des poids négatifs',
        ],
      ),
      answer: 1,
      explain: t(
        'Dijkstra’s correctness relies on paths only getting longer as you extend them, which makes the smallest tentative distance final. For maxima there is no such guarantee — but a topological order handles both minimum and maximum paths on a DAG in $\\Theta(|V| + |E|)$.',
        'La correction de Dijkstra repose sur le fait qu’un chemin ne fait que s’allonger quand on le prolonge, ce qui rend définitive la plus petite distance provisoire. Pour les maxima il n’y a pas une telle garantie — mais un ordre topologique traite aussi bien les chemins minimums que maximums sur un graphe sans cycle, en $\\Theta(|V| + |E|)$.',
      ),
    },
    { kind: 'generated', make: (r) => routeQ(smallGraph.edges.map(() => r.int(1, 9)), r.pick(['b', 'c', 'd', 'e'])) },
  ],
};

export const ch7Lessons = [dijkstraLesson];
