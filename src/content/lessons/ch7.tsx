import type { Lesson } from '../../lib/types';
import { DijkstraLab, type WGraph } from '../../widgets/routes';
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

const dijkstraLesson: Lesson = {
  id: 'c7l1',
  title: 'Shortest routes',
  summary: 'You can run Dijkstra by hand and explain why always picking the closest vertex is safe — and when short-sighted choices fail.',
  steps: [
    {
      kind: 'read',
      title: 'Best step first, done right',
      body: `A **best-step-first** algorithm builds a solution step by step, always taking the choice that looks best *right now*, and never going back.

**Dijkstra's algorithm** finds the shortest paths from a source to every vertex (non-negative weights):
- every vertex has a *tentative* distance (∞ at first, 0 for the source);
- repeatedly **finalise** the unfinished vertex with the **smallest** tentative distance;
- then **relax** its edges: if going through it gives a shorter route to a neighbour, update that neighbour.`,
    },
    {
      kind: 'task',
      body: 'Find the shortest distances from $a$. Click the vertices in the order Dijkstra finalises them (the small badges are the tentative distances).',
      widget: ({ onSolved }) => <DijkstraLab graph={smallGraph} source="a" width={420} height={210} onSolved={onSolved} />,
      success: 'From $a$: $b = 3$, $d = 5$ (via $b$), $c = 7$ (via $b$), $e = 9$ (via $d$). The purple edges form the **shortest-path tree**.',
    },
    {
      kind: 'number',
      body: 'What is the length of the shortest path from $a$ to $e$?',
      answer: 9,
      explain: '$a \\to b \\to d \\to e$: $3 + 2 + 4 = 9$. The direct-looking $a \\to d \\to e$ costs $7 + 4 = 11$.',
    },
    {
      kind: 'task',
      body: 'Train journeys (hours; Paris-Montparnasse ↔ Paris-Lyon is a 1 h bus). Run Dijkstra from **Nantes**.',
      widget: ({ onSolved }) => <DijkstraLab graph={railGraph} source="N" width={500} height={340} rect labels={CITY} onSolved={onSolved} />,
      success: 'Grenoble is reached in 7.5 h — via Paris (2 + 1 + 4.5), or equally via Paris and Lyon (2 + 1 + 3.5 + 1).',
    },
    {
      kind: 'number',
      body: 'What is the shortest travel time from Nantes to Grenoble, in hours?',
      answer: 7.5,
      tolerance: 0.001,
      suffix: 'h',
      explain: 'Nantes → Paris-Montparnasse (2) → Paris-Lyon (1) → Grenoble (4.5) = 7.5 h. The direct-looking Nantes → Lyon → Grenoble takes 7 + 1 = 8 h.',
    },
    {
      kind: 'choice',
      title: 'A shortcut that fails',
      body: 'Another short-sighted idea: from the source, always move to the **nearest successor** of the current vertex, and set its distance to dist(current) + weight. On this graph, what does it give for $t$?',
      widget: () => <GraphView nodes={trapGraph.nodes} edges={trapGraph.edges} width={360} height={200} />,
      options: ['4, the correct answer', '11: it goes $s \\to x \\to t$ because $x$ is the nearest successor of $s$, missing $s \\to y \\to t = 4$', 'It never reaches $t$', '2'],
      answer: 1,
      explain: 'Being locally closest says nothing about the total. This procedure also follows a single chain (it never comes back to explore other successors, so many vertices stay at ∞) and can loop on cycles. Dijkstra is safe because it finalises the globally closest **unfinished vertex**, not the closest neighbour.',
    },
    {
      kind: 'choice',
      title: 'And the longest path?',
      body: 'On a directed **acyclic** graph, can we find a maximum-weight path by running Dijkstra with “largest” instead of “smallest”?',
      options: [
        'Yes, it works the same way',
        'No — the argument breaks (a longer path may still appear later). On a DAG, process the vertices in topological order and keep the best value: $\\text{long}(v) = \\max_u(\\text{long}(u) + w(u,v))$',
        'Only with negative weights',
      ],
      answer: 1,
      explain: 'Dijkstra’s correctness relies on paths only getting longer as you extend them, which makes the smallest tentative distance final. For maxima there is no such guarantee — but a topological order handles both minimum and maximum paths on a DAG in $\\Theta(|V| + |E|)$.',
    },
  ],
};

export const ch7Lessons = [dijkstraLesson];
