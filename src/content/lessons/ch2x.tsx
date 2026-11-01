import { t } from '../../lib/i18n';
import type { Lesson } from '../../lib/types';
import { HornerSteps, PolyCost } from '../../widgets/cost-extra';
import { CliqueSearch, ExplosionTable, PartitionSearch } from '../../widgets/search-extra';

const polynomial: Lesson = {
  id: 'c2l5',
  title: t('Evaluating a polynomial', 'Évaluer un polynôme'),
  summary: t(
    'You went from Θ(n²) to Θ(n) multiplications for a polynomial — and saw why linear is the best possible.',
    'Vous êtes passé de Θ(n²) à Θ(n) multiplications pour un polynôme — et avez vu pourquoi le linéaire est le mieux possible.',
  ),
  steps: [
    {
      kind: 'read',
      title: t('Straight from the formula', 'Directement depuis la formule'),
      body: t(
        `To evaluate $p(x) = a_n x^n + a_{n-1}x^{n-1} + \\dots + a_1 x + a_0$ at a point $x_0$, the direct way computes each power $x_0^i$ from scratch ($i - 1$ multiplications), multiplies by $a_i$, and adds everything up. Compare it with two smarter ideas as the degree grows.`,
        `Pour évaluer $p(x) = a_n x^n + a_{n-1}x^{n-1} + \\dots + a_1 x + a_0$ en un point $x_0$, la façon directe calcule chaque puissance $x_0^i$ depuis le début ($i - 1$ multiplications), multiplie par $a_i$ et additionne le tout. Comparez-la à deux idées plus astucieuses quand le degré augmente.`,
      ),
      widget: () => <PolyCost />,
    },
    {
      kind: 'choice',
      body: t(
        'How many multiplications does the direct method use for degree $n$?',
        'Combien de multiplications la méthode directe utilise-t-elle pour le degré $n$ ?',
      ),
      options: ['$n$', '$2n - 1$', t('$\\dfrac{n(n+1)}{2}$, so $\\Theta(n^2)$', '$\\dfrac{n(n+1)}{2}$, donc $\\Theta(n^2)$'), '$2^n$'],
      answer: 2,
      explain: t(
        'Term $i$ costs $i$ multiplications ($i - 1$ for the power, 1 for the coefficient): $1 + 2 + \\dots + n = \\frac{n(n+1)}{2}$.',
        'Le terme $i$ coûte $i$ multiplications ($i - 1$ pour la puissance, 1 pour le coefficient) : $1 + 2 + \\dots + n = \\frac{n(n+1)}{2}$.',
      ),
    },
    {
      kind: 'choice',
      body: t(
        'Keeping the previous power ($x^i = x^{i-1}\\cdot x$) gives a linear algorithm. How many multiplications?',
        'Garder la puissance précédente ($x^i = x^{i-1}\\cdot x$) donne un algorithme linéaire. Combien de multiplications ?',
      ),
      options: ['$n$', '$2n - 1$', '$n^2$', '$\\log_2 n$'],
      answer: 1,
      explain: t(
        '$n - 1$ multiplications to build $x^2, \\dots, x^n$, plus $n$ to multiply by the coefficients.',
        '$n - 1$ multiplications pour construire $x^2, \\dots, x^n$, plus $n$ pour multiplier par les coefficients.',
      ),
    },
    {
      kind: 'task',
      title: t('The nested form', 'La forme imbriquée'),
      body: t(
        `Rewrite the polynomial inside-out: $2x^3 - 6x^2 + 2x - 1 = ((2x - 6)x + 2)x - 1$. Evaluating from the inside needs **one multiplication per coefficient**. Step through it at $x = 3$.`,
        `Réécrivez le polynôme de l’intérieur vers l’extérieur : $2x^3 - 6x^2 + 2x - 1 = ((2x - 6)x + 2)x - 1$. L’évaluer depuis l’intérieur demande **une multiplication par coefficient**. Avancez pas à pas en $x = 3$.`,
      ),
      widget: ({ onSolved }) => <HornerSteps onSolved={onSolved} />,
      success: t('$p(3) = 5$ with 3 multiplications and 3 additions.', '$p(3) = 5$ avec 3 multiplications et 3 additions.'),
    },
    {
      kind: 'choice',
      body: t(
        'Could some algorithm do better than linear time for a general polynomial?',
        'Un algorithme pourrait-il faire mieux qu’un temps linéaire pour un polynôme quelconque ?',
      ),
      options: t(
        ['Yes, $\\Theta(\\log n)$ with halving', 'No: any correct algorithm must at least read all $n + 1$ coefficients, so $\\Omega(n)$', 'Yes, $\\Theta(1)$ with a formula'],
        ['Oui, $\\Theta(\\log n)$ en coupant en deux', 'Non : tout algorithme correct doit au moins lire les $n + 1$ coefficients, donc $\\Omega(n)$', 'Oui, $\\Theta(1)$ avec une formule'],
      ),
      answer: 1,
      explain: t(
        'Changing any single coefficient changes the result, so every one must be looked at. The nested form is optimal.',
        'Changer un seul coefficient change le résultat : il faut donc tous les regarder. La forme imbriquée est optimale.',
      ),
    },
  ],
};

const subsets: Lesson = {
  id: 'c2l6',
  title: t('Search every subset', 'Passer en revue chaque sous-ensemble'),
  summary: t(
    'You searched through all subsets and all orders — and saw how quickly 2ⁿ and n! become hopeless.',
    'Vous avez passé en revue tous les sous-ensembles et tous les ordres — et vu à quelle vitesse 2ⁿ et n! deviennent sans espoir.',
  ),
  steps: [
    {
      kind: 'read',
      title: t('An equal split', 'Un partage équitable'),
      body: t(
        'Given some positive integers, can they be split into two groups with the **same sum**? Systematic search: try every subset as group A (group B is the rest) and check its sum. Here the total is 12, so A must sum to 6.',
        'Étant donnés des entiers positifs, peut-on les partager en deux groupes de **même somme** ? Recherche systématique : essayer chaque sous-ensemble comme groupe A (le groupe B est le reste) et vérifier sa somme. Ici le total vaut 12, donc A doit faire 6.',
      ),
    },
    {
      kind: 'task',
      body: t(
        'Run the search over all subsets of **3, 1, 4, 2, 2**. Then tick “keep the first value in A” and run again.',
        'Lancez la recherche sur tous les sous-ensembles de **3, 1, 4, 2, 2**. Puis cochez « garder la première valeur dans A » et relancez.',
      ),
      widget: ({ onSolved }) => <PartitionSearch onSolved={onSolved} />,
      success: t(
        'Every split is found twice without the trick (A and B swapped); fixing one value halves the work.',
        'Sans l’astuce, chaque partage est trouvé deux fois (A et B échangés) ; fixer une valeur divise le travail par deux.',
      ),
    },
    {
      kind: 'number',
      body: t('How many subsets does the plain search try for $n = 5$ values?', 'Combien de sous-ensembles la recherche simple essaie-t-elle pour $n = 5$ valeurs ?'),
      answer: 32,
      explain: t(
        '$2^5 = 32$: each value is either in A or not. Keeping the first value in A gives $2^{n-1} = 16$. (And if the total is odd, no search is needed at all.)',
        '$2^5 = 32$ : chaque valeur est dans A ou non. Garder la première valeur dans A donne $2^{n-1} = 16$. (Et si le total est impair, aucune recherche n’est nécessaire.)',
      ),
    },
    {
      kind: 'task',
      title: t('Groups where everybody is connected', 'Des groupes où tout le monde est relié'),
      body: t(
        'A **clique** of size $k$ is a group of $k$ vertices that are all pairwise connected. Try every group of 4 vertices and check every pair inside it.',
        'Une **clique** de taille $k$ est un groupe de $k$ sommets tous reliés deux à deux. Essayez chaque groupe de 4 sommets et vérifiez chaque paire à l’intérieur.',
      ),
      widget: ({ onSolved }) => <CliqueSearch onSolved={onSolved} />,
      success: t('The only 4-clique is {b, c, d, f}.', 'La seule clique de taille 4 est {b, c, d, f}.'),
    },
    {
      kind: 'choice',
      body: t(
        'For a graph with $n$ vertices, how many pair checks does this search make in the worst case?',
        'Pour un graphe à $n$ sommets, combien de vérifications de paires cette recherche fait-elle dans le pire cas ?',
      ),
      options: ['$k^2$', '$\\binom{n}{k} \\cdot \\dfrac{k(k-1)}{2}$', '$n^k$', '$2^n$'],
      answer: 1,
      explain: t(
        'There are $\\binom{n}{k}$ groups of size $k$ and each has $\\frac{k(k-1)}{2}$ pairs: $\\binom{6}{4}\\cdot 6 = 90$ here.',
        'Il y a $\\binom{n}{k}$ groupes de taille $k$ et chacun a $\\frac{k(k-1)}{2}$ paires : $\\binom{6}{4}\\cdot 6 = 90$ ici.',
      ),
    },
    {
      kind: 'read',
      title: t('Sorting by trying every order', 'Trier en essayant chaque ordre'),
      body: t(
        'The same idea applied to sorting: try every ordering of the array until one is sorted. There are $n!$ orderings, and checking one costs $n - 1$ comparisons. Look how fast these numbers explode.',
        'La même idée appliquée au tri : essayer chaque ordre du tableau jusqu’à en trouver un trié. Il y a $n!$ ordres, et en vérifier un coûte $n - 1$ comparaisons. Regardez à quelle vitesse ces nombres explosent.',
      ),
      widget: () => <ExplosionTable />,
    },
    {
      kind: 'choice',
      body: t('What is the worst-case cost of sorting by trying every order?', 'Quel est le coût dans le pire cas du tri qui essaie chaque ordre ?'),
      options: ['$\\Theta(n \\log n)$', '$\\Theta(n^2)$', '$\\Theta(2^n)$', '$\\Theta(n \\cdot n!)$'],
      answer: 3,
      explain: t(
        'Up to $n!$ orderings, each checked with $n - 1$ comparisons. At 20 elements that is already decades of computing.',
        'Jusqu’à $n!$ ordres, chacun vérifié avec $n - 1$ comparaisons. À 20 éléments, cela fait déjà des décennies de calcul.',
      ),
    },
  ],
};

export const ch2xLessons = [polynomial, subsets];
