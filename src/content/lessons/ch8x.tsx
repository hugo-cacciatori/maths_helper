import { t } from '../../lib/i18n';
import type { Lesson, QuestionStep } from '../../lib/types';
import { DropTest } from '../../widgets/puzzles-extra';

export const twoDevicesQ = (n: number): QuestionStep => {
  let d = 1;
  while ((d * (d + 1)) / 2 < n) d++;
  return {
    kind: 'number',
    body: t(
      `With $d$ drops and two devices, shrinking steps cover $d + (d-1) + \\dots + 1 = \\frac{d(d+1)}{2}$ floors. What is the smallest worst-case number of drops for **${n}** floors?`,
      `Avec $d$ lâchers et deux appareils, des pas qui rétrécissent couvrent $d + (d-1) + \\dots + 1 = \\frac{d(d+1)}{2}$ étages. Quel est le plus petit nombre de lâchers dans le pire cas pour **${n}** étages ?`,
    ),
    answer: d,
    explain: t(
      `$\\frac{${d - 1} \\cdot ${d}}{2} = ${((d - 1) * d) / 2} < ${n} \\le \\frac{${d} \\cdot ${d + 1}}{2} = ${(d * (d + 1)) / 2}$, so ${d} drops: about $\\sqrt{2n}$.`,
      `$\\frac{${d - 1} \\cdot ${d}}{2} = ${((d - 1) * d) / 2} < ${n} \\le \\frac{${d} \\cdot ${d + 1}}{2} = ${(d * (d + 1)) / 2}$, donc ${d} lâchers : environ $\\sqrt{2n}$.`,
    ),
  };
};

const dropTest: Lesson = {
  id: 'c8l4',
  title: t('Drop test', 'Test de chute'),
  summary: t(
    'You found the highest safe floor with as few drops as possible, for one, two or many test devices.',
    'Vous avez trouvé l’étage sûr le plus haut avec le moins de lâchers possible, pour un, deux ou de nombreux appareils de test.',
  ),
  steps: [
    {
      kind: 'read',
      title: t('How high is safe?', 'Jusqu’où est-ce sûr ?'),
      body: t(
        `A company wants to know the **highest floor** of its $n$-floor building from which its new device can be dropped **without breaking**. A device that survives can be reused; a broken one is gone. With few devices you must be careful; with many you can be bold.

Play with one device first, then two.`,
        `Une entreprise veut connaître l’**étage le plus haut** de son immeuble de $n$ étages d’où son nouvel appareil peut tomber **sans se casser**. Un appareil qui survit peut resservir ; un appareil cassé est perdu. Avec peu d’appareils il faut être prudent ; avec beaucoup on peut être audacieux.

Jouez d’abord avec un appareil, puis deux.`,
      ),
      widget: () => <DropTest initialFloors={20} initialDevices={1} />,
    },
    {
      kind: 'choice',
      body: t(
        'With a **single** device, what is the only safe strategy, and its worst case?',
        'Avec un **seul** appareil, quelle est la seule stratégie sûre, et son pire cas ?',
      ),
      options: t(
        ['Halve the range each time: about $\\log_2 n$ drops', 'Try floors 1, 2, 3, … in order: up to $n$ drops', 'Start from the top floor: 1 drop'],
        ['Couper l’intervalle en deux à chaque fois : environ $\\log_2 n$ lâchers', 'Essayer les étages 1, 2, 3, … dans l’ordre : jusqu’à $n$ lâchers', 'Commencer par le dernier étage : 1 lâcher'],
      ),
      answer: 1,
      explain: t(
        'If the only device breaks, you must already know that the floor below is safe. So you can never skip a floor: $n$ drops in the worst case.',
        'Si l’unique appareil se casse, il faut déjà savoir que l’étage du dessous est sûr. On ne peut donc jamais sauter un étage : $n$ lâchers dans le pire cas.',
      ),
    },
    {
      kind: 'task',
      title: t('Two devices', 'Deux appareils'),
      body: t(
        'With **two** devices, use the first one to jump ahead in big steps, and the second one to check floor by floor inside the last gap. Find the highest safe floor of a 36-floor building — a new building is drawn at random each time.',
        'Avec **deux** appareils, utilisez le premier pour avancer à grands pas, et le second pour vérifier étage par étage dans le dernier intervalle. Trouvez l’étage sûr le plus haut d’un immeuble de 36 étages — un nouvel immeuble est tiré au hasard à chaque fois.',
      ),
      widget: ({ onSolved }) => <DropTest initialFloors={36} initialDevices={2} onSolved={onSolved} />,
      hint: t(
        'Make the steps shrink: 8, then 7 more, then 6 more… so that a break always leaves the same total number of drops.',
        'Faites rétrécir les pas : 8, puis 7 de plus, puis 6 de plus… pour qu’une casse laisse toujours le même nombre total de lâchers.',
      ),
      success: t(
        'The best plan jumps 8, 15, 21, 26, 30, 33, 35, 36: it never needs more than 8 drops.',
        'Le meilleur plan saute à 8, 15, 21, 26, 30, 33, 35, 36 : il ne demande jamais plus de 8 lâchers.',
      ),
    },
    { kind: 'generated', make: (r) => twoDevicesQ(r.int(20, 500)) },
    {
      kind: 'choice',
      body: t(
        'With **many** devices — at least $\\lceil\\log_2 n\\rceil$ — what is the best strategy?',
        'Avec **beaucoup** d’appareils — au moins $\\lceil\\log_2 n\\rceil$ — quelle est la meilleure stratégie ?',
      ),
      options: t(
        ['Floor by floor', 'Halve the range of undecided floors at every drop: about $\\log_2 n$ drops', 'Steps of $\\sqrt n$ floors'],
        ['Étage par étage', 'Couper en deux l’intervalle des étages indécis à chaque lâcher : environ $\\log_2 n$ lâchers', 'Des pas de $\\sqrt n$ étages'],
      ),
      answer: 1,
      explain: t(
        'Each drop splits the undecided floors in two, like a search in a sorted list, and there are always enough devices to keep halving. 100 floors take 7 drops.',
        'Chaque lâcher coupe en deux les étages indécis, comme une recherche dans une liste triée, et il y a toujours assez d’appareils pour continuer à couper. 100 étages demandent 7 lâchers.',
      ),
    },
    {
      kind: 'choice',
      body: t('And with $k$ devices, fewer than $\\log_2 n$?', 'Et avec $k$ appareils, moins que $\\log_2 n$ ?'),
      options: t(
        [
          'It is the same as with one device',
          'Halve while you have devices to spare, or more precisely: with $d$ drops and $k$ devices you can settle $f(d, k) = f(d-1, k-1) + f(d-1, k) + 1$ floors — choose the first drop so both outcomes leave a solvable building',
          'It cannot be solved',
        ],
        [
          'C’est pareil qu’avec un appareil',
          'Couper en deux tant qu’on a des appareils en réserve, ou plus précisément : avec $d$ lâchers et $k$ appareils on peut trancher $f(d, k) = f(d-1, k-1) + f(d-1, k) + 1$ étages — choisir le premier lâcher pour que les deux issues laissent un immeuble soluble',
          'C’est impossible à résoudre',
        ],
      ),
      answer: 1,
      explain: t(
        'After a drop from the right floor, a break leaves $k - 1$ devices for the floors below and a survival leaves $k$ devices for the floors above, each with one drop fewer. That recurrence gives the best plan for any $k$ (try 3 devices in the widget).',
        'Après un lâcher depuis le bon étage, une casse laisse $k - 1$ appareils pour les étages du dessous et une survie laisse $k$ appareils pour les étages du dessus, chacun avec un lâcher de moins. Cette récurrence donne le meilleur plan pour tout $k$ (essayez 3 appareils dans le widget).',
      ),
    },
  ],
};

export const ch8xLessons = [dropTest];
