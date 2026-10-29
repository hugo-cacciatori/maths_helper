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
  title: 'One-way streets',
  summary: 'You explored and routed through a network of one-way streets, following arrows only.',
  steps: [
    {
      kind: 'read',
      title: 'Arrows matter',
      body: 'In this network every street is **one-way**: you may only follow an arrow in its direction. The numbers are travel times. From a vertex, the next vertices you can reach are its **successors** — we always take them in increasing order.',
    },
    {
      kind: 'task',
      title: 'Layer by layer',
      body: 'Explore from vertex 1 **breadth first** (oldest discovered vertex first). Click the vertices in the order they are reached.',
      widget: ({ onSolved }) => <TraversalExplorer graph={streetGraph} start="1" mode="bfs" width={540} height={225} onSolved={onSolved} />,
      success: 'Order: 1 2 3 4 5 6 7 8.',
    },
    {
      kind: 'task',
      title: 'As deep as possible',
      body: 'Now **depth first** from vertex 1 (most recently reached vertex first).',
      widget: ({ onSolved }) => <TraversalExplorer graph={streetGraph} start="1" mode="dfs" width={540} height={225} onSolved={onSolved} />,
      success: 'Order: 1 2 4 3 5 6 7 8 — from 4 we go back down to 3, then on to 5 and 6.',
    },
    {
      kind: 'sequence',
      body: 'Give the depth-first visiting order from 1.',
      tokens: ['1', '2', '3', '4', '5', '6', '7', '8'],
      keepOrder: true,
      answer: ['1', '2', '4', '3', '5', '6', '7', '8'],
      explain: '2 is the first successor of 1, 4 the only one of 2, 3 the first of 4, and so on.',
    },
    {
      kind: 'task',
      title: 'Shortest times',
      body: 'Find the shortest travel time from 1 to every vertex: always finalise the unfinished vertex with the smallest tentative time.',
      widget: ({ onSolved }) => <DijkstraLab graph={streetGraph} source="1" width={540} height={225} onSolved={onSolved} />,
      success: 'From 1: 2 → 2, 4 → 4, 3 → 5, 6 → 7, 5 → 8, 7 → 8, 8 → 9.',
    },
    {
      kind: 'number',
      body: 'What is the shortest travel time from 1 to **3**?',
      answer: 5,
      explain: 'The direct street 1 → 3 takes 7, but 1 → 2 → 4 → 3 takes 2 + 2 + 1 = 5. Only arrows can be followed: 3 → 2 would not help in the other direction.',
    },
    {
      kind: 'number',
      body: 'And from 1 to **8**?',
      answer: 9,
      explain: 'Either 1 → 2 → 4 → 6 → 8 (2 + 2 + 3 + 2) or via 7 (… 6 → 7 → 8: 2 + 2 + 3 + 1 + 1). Both take 9.',
    },
  ],
};

export const ch7xLessons = [oneWay];
