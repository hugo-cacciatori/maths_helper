import { t } from '../../lib/i18n';
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
  title: t('Black and white tokens', 'Jetons noirs et blancs'),
  summary: t(
    'You solved a puzzle the direct way and counted exactly how many moves it needs.',
    'Vous avez résolu un casse-tête de la façon directe et compté exactement combien de coups il faut.',
  ),
  steps: [
    {
      kind: 'read',
      title: t('Just do it', 'Allons-y directement'),
      body: t(
        `The **direct method** solves a problem straight from its statement. It is rarely the cleverest approach, but it is simple, general, and a great baseline.

We have $2n$ disks in a row, $n$ black and $n$ white, alternating. We want all the white disks on the left and all the black ones on the right. The only allowed move is **swapping two neighbours**.`,
        `La **méthode directe** résout un problème en partant tout droit de son énoncé. C’est rarement l’approche la plus astucieuse, mais elle est simple, générale, et c’est une excellente référence.

On a $2n$ jetons en rangée, $n$ noirs et $n$ blancs, en alternance. On veut tous les jetons blancs à gauche et tous les noirs à droite. Le seul coup permis est d’**échanger deux voisins**.`,
      ),
    },
    {
      kind: 'task',
      body: t('Try it with $n = 3$. Can you find the shortest solution?', 'Essayez avec $n = 3$. Trouverez-vous la solution la plus courte ?'),
      widget: ({ onSolved }) => <DiskSwapper n={3} onSolved={onSolved} />,
      success: t(
        'Each useful swap moves one black disk one step to the right past a white disk. Nothing else ever helps.',
        'Chaque échange utile fait passer un jeton noir d’un cran vers la droite, par-dessus un jeton blanc. Rien d’autre n’aide jamais.',
      ),
    },
    {
      kind: 'number',
      body: t('What is the minimum number of swaps for $n = 3$?', 'Quel est le nombre minimum d’échanges pour $n = 3$ ?'),
      answer: 6,
      hint: t('The 1st black disk must travel 3 places, the 2nd …?', 'Le 1er jeton noir doit avancer de 3 places, le 2e … ?'),
      explain: t(
        'Black disk $k$ (counted from the left) has to pass the $n - k + 1$ white disks to its right: $3 + 2 + 1 = 6$.',
        'Le jeton noir $k$ (compté depuis la gauche) doit dépasser les $n - k + 1$ jetons blancs à sa droite : $3 + 2 + 1 = 6$.',
      ),
    },
    {
      kind: 'choice',
      body: t(
        'In general, how many swaps are needed for $n$ black and $n$ white disks?',
        'En général, combien d’échanges faut-il pour $n$ jetons noirs et $n$ blancs ?',
      ),
      options: ['$n$', '$2n - 1$', '$\\dfrac{n(n+1)}{2}$', '$n^2$'],
      answer: 2,
      explain: t(
        '$n + (n-1) + \\dots + 1 = \\frac{n(n+1)}{2} \\in \\Theta(n^2)$. The "bubble" algorithm (each black disk bubbles right) achieves exactly this.',
        '$n + (n-1) + \\dots + 1 = \\frac{n(n+1)}{2} \\in \\Theta(n^2)$. L’algorithme « à bulles » (chaque jeton noir remonte vers la droite comme une bulle) atteint exactement ce nombre.',
      ),
    },
    {
      kind: 'task',
      body: t('Watch the algorithm do it with $n = 5$ — press **Show me**.', 'Regardez l’algorithme le faire avec $n = 5$ — appuyez sur **Montre-moi**.'),
      widget: ({ onSolved }) => <DiskSwapper n={5} onSolved={onSolved} />,
      success: t('$\\frac{5 \\cdot 6}{2} = 15$ swaps.', '$\\frac{5 \\cdot 6}{2} = 15$ échanges.'),
    },
  ],
};

const substrings: Lesson = {
  id: 'c2l2',
  title: t('From A to B: two ways to count', 'De A à B : deux façons de compter'),
  summary: t(
    'You saw how a direct Θ(n²) scan can become a single Θ(n) pass.',
    'Vous avez vu comment un balayage direct en Θ(n²) peut devenir un seul passage en Θ(n).',
  ),
  steps: [
    {
      kind: 'read',
      title: t('Substrings from A to B', 'Les sous-chaînes de A à B'),
      body: t(
        'Count the substrings that **start with A and end with B** in a text. For example, there are four of them in `CABAAXBYA`. The direct way: for every A, look at every later letter.',
        'Comptez les sous-chaînes d’un texte qui **commencent par A et finissent par B**. Par exemple, il y en a quatre dans `CABAAXBYA`. La façon directe : pour chaque A, regarder chaque lettre qui suit.',
      ),
    },
    {
      kind: 'task',
      body: t(
        'Run the direct scan to the end. The orange cell is the A we start from, the purple one is the letter we test.',
        'Lancez le balayage direct jusqu’au bout. La case orange est le A de départ, la violette est la lettre testée.',
      ),
      widget: ({ onSolved }) => <SubstringScanner mode="direct" onSolved={onSolved} />,
      success: t('Four substrings: `AB`, `ABAAXB`, `AAXB`, `AXB`.', 'Quatre sous-chaînes : `AB`, `ABAAXB`, `AAXB`, `AXB`.'),
    },
    {
      kind: 'choice',
      body: t(
        'In the worst case (a text full of A’s), how many pairs does the direct method check for a text of length $n$?',
        'Dans le pire cas (un texte rempli de A), combien de paires la méthode directe vérifie-t-elle pour un texte de longueur $n$ ?',
      ),
      options: ['$\\Theta(n)$', '$\\Theta(n \\log n)$', '$\\Theta(n^2)$', '$\\Theta(2^n)$'],
      answer: 2,
      explain: t(
        'For each start position it scans the rest: $(n-1) + (n-2) + \\dots + 1 = \\frac{n(n-1)}{2}$ checks — $\\Theta(n^2)$.',
        'Pour chaque position de départ, elle parcourt le reste : $(n-1) + (n-2) + \\dots + 1 = \\frac{n(n-1)}{2}$ vérifications — $\\Theta(n^2)$.',
      ),
    },
    {
      kind: 'task',
      title: t('A smarter idea', 'Une idée plus astucieuse'),
      body: t(
        'Every B closes one substring **for each A that came before it**. So we only need to count the A’s while scanning once. Run it.',
        'Chaque B ferme une sous-chaîne **pour chaque A rencontré avant lui**. Il suffit donc de compter les A en un seul passage. Lancez-le.',
      ),
      widget: ({ onSolved }) => <SubstringScanner mode="smart" onSolved={onSolved} />,
      success: t('Same answer, 4, with one pass over the text.', 'Même réponse, 4, avec un seul passage sur le texte.'),
    },
    {
      kind: 'choice',
      body: t('What is the cost of the one-pass algorithm?', 'Quel est le coût de l’algorithme en un passage ?'),
      options: ['$\\Theta(1)$', '$\\Theta(\\log n)$', '$\\Theta(n)$', '$\\Theta(n^2)$'],
      answer: 2,
      explain: t(
        'Each letter is examined once, with constant work: $\\Theta(n)$. The direct method gives a correct baseline; thinking about *what is really needed* gives the speed-up.',
        'Chaque lettre est examinée une fois, avec un travail constant : $\\Theta(n)$. La méthode directe donne une référence correcte ; réfléchir à *ce dont on a vraiment besoin* donne l’accélération.',
      ),
    },
  ],
};

const traversal: Lesson = {
  id: 'c2l3',
  title: t('Exploring a network', 'Explorer un réseau'),
  summary: t(
    'You can run DFS with a stack and BFS with a queue, and read off the visiting orders.',
    'Vous savez faire un parcours en profondeur avec une pile et un parcours en largeur avec une file, et lire les ordres de visite.',
  ),
  steps: [
    {
      kind: 'read',
      title: t('A sample graph', 'Un graphe d’exemple'),
      body: t(
        `Graph traversals are **systematic searches**: they systematically visit every vertex. We will start from $a$ and, whenever there is a choice, take neighbours in **alphabetical order** — like a computer reading adjacency lists sorted alphabetically.

Adjacency lists of this graph:
- $a$: b, c, d, e
- $b$: a, d, f
- $c$: a, g
- $d$: a, b, f
- $e$: a, g
- $f$: b, d
- $g$: c, e`,
        `Les parcours de graphe sont des **recherches systématiques** : ils visitent méthodiquement chaque sommet. Nous partirons de $a$ et, à chaque choix, prendrons les voisins dans l’**ordre alphabétique** — comme un ordinateur qui lit des listes d’adjacence triées par ordre alphabétique.

Listes d’adjacence de ce graphe :
- $a$ : b, c, d, e
- $b$ : a, d, f
- $c$ : a, g
- $d$ : a, b, f
- $e$ : a, g
- $f$ : b, d
- $g$ : c, e`,
      ),
      widget: () => <GraphView nodes={sampleGraph.nodes} edges={sampleGraph.edges} width={420} height={220} />,
    },
    {
      kind: 'choice',
      body: t(
        'In the **adjacency matrix** of an undirected graph, how can you tell that a vertex is **isolated** (no incident edge)?',
        'Dans la **matrice d’adjacence** d’un graphe non orienté, comment voir qu’un sommet est **isolé** (aucune arête ne le touche) ?',
      ),
      options: t(
        ['Its diagonal entry is 1', 'Its row (and column) contains only zeros', 'Its row contains only ones', 'The matrix is symmetric'],
        ['Sa case diagonale vaut 1', 'Sa ligne (et sa colonne) ne contient que des zéros', 'Sa ligne ne contient que des uns', 'La matrice est symétrique'],
      ),
      answer: 1,
      explain: t(
        'Row $i$ lists the neighbours of vertex $i$. All zeros: no neighbours. (A 1 on the diagonal means a loop; all ones off the diagonal everywhere means a complete graph.)',
        'La ligne $i$ indique les voisins du sommet $i$. Que des zéros : aucun voisin. (Un 1 sur la diagonale signifie une boucle ; des uns partout hors de la diagonale signifient un graphe complet.)',
      ),
    },
    {
      kind: 'task',
      title: t('Depth first: go deep, then backtrack', 'En profondeur : descendre, puis revenir'),
      body: t(
        `**DFS** always continues from the **most recently** reached vertex — a **stack**. From the vertex on top of the stack, go to its first unvisited neighbour. When it has none, it is a *dead end*: pop it.

Click the vertices in DFS order, starting from $a$.`,
        `Le **parcours en profondeur** (DFS) repart toujours du sommet atteint **le plus récemment** — une **pile**. Depuis le sommet en haut de la pile, allez vers son premier voisin non visité. S’il n’en a aucun, c’est une *impasse* : on le dépile.

Cliquez sur les sommets dans l’ordre du parcours en profondeur, en partant de $a$.`,
      ),
      widget: ({ onSolved }) => <TraversalExplorer graph={sampleGraph} start="a" mode="dfs" onSolved={onSolved} />,
      success: t(
        'The purple edges form the **DFS tree**. The other edges are "back edges": they lead to vertices that were already visited.',
        'Les arêtes violettes forment l’**arbre du parcours en profondeur**. Les autres arêtes sont des « arêtes arrière » : elles mènent à des sommets déjà visités.',
      ),
    },
    {
      kind: 'sequence',
      body: t(
        'Give the order in which vertices were **pushed** onto the stack (first reached).',
        'Donnez l’ordre dans lequel les sommets ont été **empilés** (atteints pour la première fois).',
      ),
      tokens: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
      answer: ['a', 'b', 'd', 'f', 'c', 'g', 'e'],
      explain: t('a → b → d → f (dead end), back to a → c → g → e.', 'a → b → d → f (impasse), retour à a → c → g → e.'),
    },
    {
      kind: 'sequence',
      body: t(
        'Now the order in which they became **dead ends** (popped off the stack).',
        'Maintenant l’ordre dans lequel ils sont devenus des **impasses** (dépilés).',
      ),
      tokens: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
      answer: ['f', 'd', 'b', 'e', 'g', 'c', 'a'],
      explain: t(
        'f has no unvisited neighbour, then d, then b. Then e, g, c — and finally the start vertex a.',
        'f n’a aucun voisin non visité, puis d, puis b. Ensuite e, g, c — et enfin le sommet de départ a.',
      ),
    },
    {
      kind: 'task',
      title: t('Breadth first: layer by layer', 'En largeur : couche par couche'),
      body: t(
        `**BFS** explores from the **oldest** vertex discovered — a **queue**. From the vertex at the front, enqueue *all* its unvisited neighbours (alphabetically), then dequeue it.

Click the vertices in BFS order, starting from $a$.`,
        `Le **parcours en largeur** (BFS) explore à partir du sommet découvert **le plus anciennement** — une **file**. Depuis le sommet en tête de file, enfilez *tous* ses voisins non visités (par ordre alphabétique), puis défilez-le.

Cliquez sur les sommets dans l’ordre du parcours en largeur, en partant de $a$.`,
      ),
      widget: ({ onSolved }) => <TraversalExplorer graph={sampleGraph} start="a" mode="bfs" onSolved={onSolved} />,
      success: t(
        'BFS reaches vertices in order of their **distance** (number of edges) from $a$: first all neighbours, then neighbours of neighbours.',
        'Le parcours en largeur atteint les sommets par ordre de **distance** (nombre d’arêtes) depuis $a$ : d’abord tous les voisins, puis les voisins des voisins.',
      ),
    },
    {
      kind: 'sequence',
      body: t('Give the BFS visiting order from $a$.', 'Donnez l’ordre de visite du parcours en largeur depuis $a$.'),
      tokens: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
      answer: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
      explain: t(
        'Layer 0: a. Layer 1: b, c, d, e. Layer 2: f (via b) and g (via c). With a queue, the dequeue order is the same as the enqueue order.',
        'Couche 0 : a. Couche 1 : b, c, d, e. Couche 2 : f (par b) et g (par c). Avec une file, l’ordre de sortie est le même que l’ordre d’entrée.',
      ),
    },
    {
      kind: 'choice',
      body: t(
        'You want the route with the **fewest connections** between two stations. Which traversal finds it directly?',
        'Vous voulez le trajet avec le **moins de correspondances** entre deux stations. Quel parcours le trouve directement ?',
      ),
      options: t(
        ['DFS', 'BFS', 'Both always give it', 'Neither'],
        ['En profondeur', 'En largeur', 'Les deux le donnent toujours', 'Aucun'],
      ),
      answer: 1,
      explain: t(
        'BFS discovers vertices by increasing number of edges from the start, so the BFS tree gives fewest-hop paths. (For fewest *hours* you need weights — that is Dijkstra, in a later chapter.)',
        'Le parcours en largeur découvre les sommets par nombre croissant d’arêtes depuis le départ : son arbre donne les chemins avec le moins d’étapes. (Pour le moins d’*heures*, il faut des poids — c’est Dijkstra, dans un chapitre suivant.)',
      ),
    },
  ],
};

const jugs: Lesson = {
  id: 'c2l4',
  title: t('Four litres exactly', 'Exactement quatre litres'),
  summary: t(
    'You turned a puzzle into a graph of states and solved it optimally with breadth-first search.',
    'Vous avez changé un casse-tête en graphe d’états et l’avez résolu de façon optimale avec un parcours en largeur.',
  ),
  steps: [
    {
      kind: 'read',
      title: t('A pouring puzzle', 'Un casse-tête de transvasements'),
      body: t(
        'Siméon Denis Poisson reportedly got hooked on mathematics with this puzzle: an **8-litre** jug is full, a **5-litre** and a **3-litre** jug are empty. By pouring from one jug into another (until the first is empty or the second is full), obtain **exactly 4 litres** in one jug.',
        'Siméon Denis Poisson se serait pris de passion pour les mathématiques grâce à ce casse-tête : un récipient de **8 litres** est plein, ceux de **5 litres** et de **3 litres** sont vides. En versant d’un récipient dans un autre (jusqu’à ce que le premier soit vide ou le second plein), obtenez **exactement 4 litres** dans un récipient.',
      ),
    },
    {
      kind: 'task',
      body: t('Give it a try!', 'À vous de jouer !'),
      widget: ({ onSolved }) => <JugPuzzle onSolved={onSolved} />,
      success: t('Nicely measured.', 'Joliment mesuré.'),
    },
    {
      kind: 'read',
      title: t('Puzzles are graphs', 'Les casse-tête sont des graphes'),
      body: t(
        `Each **state** is a triple (contents of 8 L, 5 L, 3 L jugs). Each pour is an **edge** to another state. Searching for a solution = searching this state graph.

**BFS** explores states by number of pours: all states reachable in 1 pour, then 2, … So the first time it meets a state containing 4, it has found a **shortest** solution. Step through the layers.`,
        `Chaque **état** est un triplet (contenus des récipients de 8 L, 5 L, 3 L). Chaque versement est une **arête** vers un autre état. Chercher une solution = explorer ce graphe d’états.

Le **parcours en largeur** explore les états par nombre de versements : tous les états atteignables en 1 versement, puis 2, … La première fois qu’il rencontre un état contenant 4, il a donc trouvé une solution **la plus courte**. Parcourez les couches.`,
      ),
      widget: () => <JugBfsLayers />,
    },
    {
      kind: 'number',
      body: t('What is the minimum number of pours?', 'Quel est le nombre minimum de versements ?'),
      answer: 6,
      explain: t(
        '(8,0,0) → (3,5,0) → (3,2,3) → (6,2,0) → (6,0,2) → (1,5,2) → (1,4,3). Six pours, and BFS guarantees none shorter exists.',
        '(8,0,0) → (3,5,0) → (3,2,3) → (6,2,0) → (6,0,2) → (1,5,2) → (1,4,3). Six versements, et le parcours en largeur garantit qu’il n’existe rien de plus court.',
      ),
    },
    {
      kind: 'choice',
      body: t('Why would DFS be a worse choice here?', 'Pourquoi le parcours en profondeur serait-il un moins bon choix ici ?'),
      options: t(
        [
          'DFS cannot find any solution',
          'DFS finds *a* solution, but not necessarily a shortest one',
          'DFS visits each state many times',
          'DFS needs a priority queue',
        ],
        [
          'Il ne peut trouver aucune solution',
          'Il trouve *une* solution, mais pas forcément une des plus courtes',
          'Il visite chaque état de nombreuses fois',
          'Il a besoin d’une file de priorité',
        ],
      ),
      answer: 1,
      explain: t(
        'DFS dives down one branch; the first solution it meets may be long. BFS’s layer-by-layer order is what gives the optimality guarantee.',
        'Le parcours en profondeur plonge dans une branche ; la première solution qu’il rencontre peut être longue. C’est l’ordre couche par couche du parcours en largeur qui garantit l’optimalité.',
      ),
    },
  ],
};

export const ch2Lessons = [disks, substrings, traversal, jugs];
