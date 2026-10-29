import type { Lesson } from '../../lib/types';
import { DiskSwapper, JugBfsLayers, JugPuzzle, SubstringScanner, TraversalExplorer, type Graph } from '../../widgets/search';
import { GraphView } from '../../widgets/kit';

export const sampleGraph: Graph = {
  nodes: [
    { id: 'f', x: 40, y: 50 },
    { id: 'b', x: 150, y: 50 },
    { id: 'c', x: 270, y: 50 },
    { id: 'g', x: 380, y: 50 },
    { id: 'd', x: 95, y: 170 },
    { id: 'a', x: 210, y: 170 },
    { id: 'e', x: 330, y: 170 },
  ],
  edges: [
    { u: 'a', v: 'b' },
    { u: 'a', v: 'c' },
    { u: 'a', v: 'd' },
    { u: 'a', v: 'e' },
    { u: 'b', v: 'd' },
    { u: 'b', v: 'f' },
    { u: 'c', v: 'g' },
    { u: 'd', v: 'f' },
    { u: 'e', v: 'g' },
  ],
};

const disks: Lesson = {
  id: 'c2l1',
  title: 'Black and white tokens',
  summary: 'You solved a puzzle the direct way and counted exactly how many moves it needs.',
  steps: [
    {
      kind: 'read',
      title: 'Just do it',
      body: `The **direct method** solves a problem straight from its statement. It is rarely the cleverest approach, but it is simple, general, and a great baseline.

We have $2n$ disks in a row, $n$ black and $n$ white, alternating. We want all the white disks on the left and all the black ones on the right. The only allowed move is **swapping two neighbours**.`,
    },
    {
      kind: 'task',
      body: 'Try it with $n = 3$. Can you find the shortest solution?',
      widget: ({ onSolved }) => <DiskSwapper n={3} onSolved={onSolved} />,
      success: 'Each useful swap moves one black disk one step to the right past a white disk. Nothing else ever helps.',
    },
    {
      kind: 'number',
      body: 'What is the minimum number of swaps for $n = 3$?',
      answer: 6,
      hint: 'The 1st black disk must travel 3 places, the 2nd …?',
      explain: 'Black disk $k$ (counted from the left) has to pass the $n - k + 1$ white disks to its right: $3 + 2 + 1 = 6$.',
    },
    {
      kind: 'choice',
      body: 'In general, how many swaps are needed for $n$ black and $n$ white disks?',
      options: ['$n$', '$2n - 1$', '$\\dfrac{n(n+1)}{2}$', '$n^2$'],
      answer: 2,
      explain: '$n + (n-1) + \\dots + 1 = \\frac{n(n+1)}{2} \\in \\Theta(n^2)$. The "bubble" algorithm (each black disk bubbles right) achieves exactly this.',
    },
    {
      kind: 'task',
      body: 'Watch the algorithm do it with $n = 5$ — press **Show me**.',
      widget: ({ onSolved }) => <DiskSwapper n={5} onSolved={onSolved} />,
      success: '$\\frac{5 \\cdot 6}{2} = 15$ swaps.',
    },
  ],
};

const substrings: Lesson = {
  id: 'c2l2',
  title: 'From A to B: two ways to count',
  summary: 'You saw how a direct Θ(n²) scan can become a single Θ(n) pass.',
  steps: [
    {
      kind: 'read',
      title: 'Substrings from A to B',
      body: 'Count the substrings that **start with A and end with B** in a text. For example, there are four of them in `CABAAXBYA`. The direct way: for every A, look at every later letter.',
    },
    {
      kind: 'task',
      body: 'Run the direct scan to the end. The orange cell is the A we start from, the purple one is the letter we test.',
      widget: ({ onSolved }) => <SubstringScanner mode="direct" onSolved={onSolved} />,
      success: 'Four substrings: `AB`, `ABAAXB`, `AAXB`, `AXB`.',
    },
    {
      kind: 'choice',
      body: 'In the worst case (a text full of A’s), how many pairs does the direct method check for a text of length $n$?',
      options: ['$\\Theta(n)$', '$\\Theta(n \\log n)$', '$\\Theta(n^2)$', '$\\Theta(2^n)$'],
      answer: 2,
      explain: 'For each start position it scans the rest: $(n-1) + (n-2) + \\dots + 1 = \\frac{n(n-1)}{2}$ checks — $\\Theta(n^2)$.',
    },
    {
      kind: 'task',
      title: 'A smarter idea',
      body: 'Every B closes one substring **for each A that came before it**. So we only need to count the A’s while scanning once. Run it.',
      widget: ({ onSolved }) => <SubstringScanner mode="smart" onSolved={onSolved} />,
      success: 'Same answer, 4, with one pass over the text.',
    },
    {
      kind: 'choice',
      body: 'What is the cost of the one-pass algorithm?',
      options: ['$\\Theta(1)$', '$\\Theta(\\log n)$', '$\\Theta(n)$', '$\\Theta(n^2)$'],
      answer: 2,
      explain: 'Each letter is examined once, with constant work: $\\Theta(n)$. The direct method gives a correct baseline; thinking about *what is really needed* gives the speed-up.',
    },
  ],
};

const traversal: Lesson = {
  id: 'c2l3',
  title: 'Exploring a network',
  summary: 'You can run DFS with a stack and BFS with a queue, and read off the visiting orders.',
  steps: [
    {
      kind: 'read',
      title: 'A sample graph',
      body: `Graph traversals are **systematic searches**: they systematically visit every vertex. We will start from $a$ and, whenever there is a choice, take neighbours in **alphabetical order** — like a computer reading adjacency lists sorted alphabetically.

Adjacency lists of this graph:
- $a$: b, c, d, e
- $b$: a, d, f
- $c$: a, g
- $d$: a, b, f
- $e$: a, g
- $f$: b, d
- $g$: c, e`,
      widget: () => <GraphView nodes={sampleGraph.nodes} edges={sampleGraph.edges} width={420} height={220} />,
    },
    {
      kind: 'choice',
      body: 'In the **adjacency matrix** of an undirected graph, how can you tell that a vertex is **isolated** (no incident edge)?',
      options: ['Its diagonal entry is 1', 'Its row (and column) contains only zeros', 'Its row contains only ones', 'The matrix is symmetric'],
      answer: 1,
      explain: 'Row $i$ lists the neighbours of vertex $i$. All zeros: no neighbours. (A 1 on the diagonal means a loop; all ones off the diagonal everywhere means a complete graph.)',
    },
    {
      kind: 'task',
      title: 'Depth first: go deep, then backtrack',
      body: `**DFS** always continues from the **most recently** reached vertex — a **stack**. From the vertex on top of the stack, go to its first unvisited neighbour. When it has none, it is a *dead end*: pop it.

Click the vertices in DFS order, starting from $a$.`,
      widget: ({ onSolved }) => <TraversalExplorer graph={sampleGraph} start="a" mode="dfs" onSolved={onSolved} />,
      success: 'The purple edges form the **DFS tree**. The other edges are "back edges": they lead to vertices that were already visited.',
    },
    {
      kind: 'sequence',
      body: 'Give the order in which vertices were **pushed** onto the stack (first reached).',
      tokens: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
      answer: ['a', 'b', 'd', 'f', 'c', 'g', 'e'],
      explain: 'a → b → d → f (dead end), back to a → c → g → e.',
    },
    {
      kind: 'sequence',
      body: 'Now the order in which they became **dead ends** (popped off the stack).',
      tokens: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
      answer: ['f', 'd', 'b', 'e', 'g', 'c', 'a'],
      explain: 'f has no unvisited neighbour, then d, then b. Then e, g, c — and finally the start vertex a.',
    },
    {
      kind: 'task',
      title: 'Breadth first: layer by layer',
      body: `**BFS** explores from the **oldest** vertex discovered — a **queue**. From the vertex at the front, enqueue *all* its unvisited neighbours (alphabetically), then dequeue it.

Click the vertices in BFS order, starting from $a$.`,
      widget: ({ onSolved }) => <TraversalExplorer graph={sampleGraph} start="a" mode="bfs" onSolved={onSolved} />,
      success: 'BFS reaches vertices in order of their **distance** (number of edges) from $a$: first all neighbours, then neighbours of neighbours.',
    },
    {
      kind: 'sequence',
      body: 'Give the BFS visiting order from $a$.',
      tokens: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
      answer: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
      explain: 'Layer 0: a. Layer 1: b, c, d, e. Layer 2: f (via b) and g (via c). With a queue, the dequeue order is the same as the enqueue order.',
    },
    {
      kind: 'choice',
      body: 'You want the route with the **fewest connections** between two stations. Which traversal finds it directly?',
      options: ['DFS', 'BFS', 'Both always give it', 'Neither'],
      answer: 1,
      explain: 'BFS discovers vertices by increasing number of edges from the start, so the BFS tree gives fewest-hop paths. (For fewest *hours* you need weights — that is Dijkstra, in a later chapter.)',
    },
  ],
};

const jugs: Lesson = {
  id: 'c2l4',
  title: 'Four litres exactly',
  summary: 'You turned a puzzle into a graph of states and solved it optimally with breadth-first search.',
  steps: [
    {
      kind: 'read',
      title: 'A pouring puzzle',
      body: 'Siméon Denis Poisson reportedly got hooked on mathematics with this puzzle: an **8-litre** jug is full, a **5-litre** and a **3-litre** jug are empty. By pouring from one jug into another (until the first is empty or the second is full), obtain **exactly 4 litres** in one jug.',
    },
    {
      kind: 'task',
      body: 'Give it a try!',
      widget: ({ onSolved }) => <JugPuzzle onSolved={onSolved} />,
      success: 'Nicely measured.',
    },
    {
      kind: 'read',
      title: 'Puzzles are graphs',
      body: `Each **state** is a triple (contents of 8 L, 5 L, 3 L jugs). Each pour is an **edge** to another state. Searching for a solution = searching this state graph.

**BFS** explores states by number of pours: all states reachable in 1 pour, then 2, … So the first time it meets a state containing 4, it has found a **shortest** solution. Step through the layers.`,
      widget: () => <JugBfsLayers />,
    },
    {
      kind: 'number',
      body: 'What is the minimum number of pours?',
      answer: 6,
      explain: '(8,0,0) → (3,5,0) → (3,2,3) → (6,2,0) → (6,0,2) → (1,5,2) → (1,4,3). Six pours, and BFS guarantees none shorter exists.',
    },
    {
      kind: 'choice',
      body: 'Why would DFS be a worse choice here?',
      options: [
        'DFS cannot find any solution',
        'DFS finds *a* solution, but not necessarily a shortest one',
        'DFS visits each state many times',
        'DFS needs a priority queue',
      ],
      answer: 1,
      explain: 'DFS dives down one branch; the first solution it meets may be long. BFS’s layer-by-layer order is what gives the optimality guarantee.',
    },
  ],
};

export const ch2Lessons = [disks, substrings, traversal, jugs];
