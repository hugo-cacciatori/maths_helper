import type { Lesson, QuestionStep } from '../../lib/types';
import { DropTest } from '../../widgets/puzzles-extra';

export const twoDevicesQ = (n: number): QuestionStep => {
  let d = 1;
  while ((d * (d + 1)) / 2 < n) d++;
  return {
    kind: 'number',
    body: `With $d$ drops and two devices, shrinking steps cover $d + (d-1) + \\dots + 1 = \\frac{d(d+1)}{2}$ floors. What is the smallest worst-case number of drops for **${n}** floors?`,
    answer: d,
    explain: `$\\frac{${d - 1} \\cdot ${d}}{2} = ${((d - 1) * d) / 2} < ${n} \\le \\frac{${d} \\cdot ${d + 1}}{2} = ${(d * (d + 1)) / 2}$, so ${d} drops: about $\\sqrt{2n}$.`,
  };
};

const dropTest: Lesson = {
  id: 'c8l4',
  title: 'Drop test',
  summary: 'You found the highest safe floor with as few drops as possible, for one, two or many test devices.',
  steps: [
    {
      kind: 'read',
      title: 'How high is safe?',
      body: `A company wants to know the **highest floor** of its $n$-floor building from which its new device can be dropped **without breaking**. A device that survives can be reused; a broken one is gone. With few devices you must be careful; with many you can be bold.

Play with one device first, then two.`,
      widget: () => <DropTest initialFloors={20} initialDevices={1} />,
    },
    {
      kind: 'choice',
      body: 'With a **single** device, what is the only safe strategy, and its worst case?',
      options: [
        'Halve the range each time: about $\\log_2 n$ drops',
        'Try floors 1, 2, 3, … in order: up to $n$ drops',
        'Start from the top floor: 1 drop',
      ],
      answer: 1,
      explain: 'If the only device breaks, you must already know that the floor below is safe. So you can never skip a floor: $n$ drops in the worst case.',
    },
    {
      kind: 'task',
      title: 'Two devices',
      body: 'With **two** devices, use the first one to jump ahead in big steps, and the second one to check floor by floor inside the last gap. Find the highest safe floor of a 36-floor building — a new building is drawn at random each time.',
      widget: ({ onSolved }) => <DropTest initialFloors={36} initialDevices={2} onSolved={onSolved} />,
      hint: 'Make the steps shrink: 8, then 7 more, then 6 more… so that a break always leaves the same total number of drops.',
      success: 'The best plan jumps 8, 15, 21, 26, 30, 33, 35, 36: it never needs more than 8 drops.',
    },
    { kind: 'generated', make: (r) => twoDevicesQ(r.int(20, 500)) },
    {
      kind: 'choice',
      body: 'With **many** devices — at least $\\lceil\\log_2 n\\rceil$ — what is the best strategy?',
      options: ['Floor by floor', 'Halve the range of undecided floors at every drop: about $\\log_2 n$ drops', 'Steps of $\\sqrt n$ floors'],
      answer: 1,
      explain: 'Each drop splits the undecided floors in two, like a search in a sorted list, and there are always enough devices to keep halving. 100 floors take 7 drops.',
    },
    {
      kind: 'choice',
      body: 'And with $k$ devices, fewer than $\\log_2 n$?',
      options: [
        'It is the same as with one device',
        'Halve while you have devices to spare, or more precisely: with $d$ drops and $k$ devices you can settle $f(d, k) = f(d-1, k-1) + f(d-1, k) + 1$ floors — choose the first drop so both outcomes leave a solvable building',
        'It cannot be solved',
      ],
      answer: 1,
      explain: 'After a drop from the right floor, a break leaves $k - 1$ devices for the floors below and a survival leaves $k$ devices for the floors above, each with one drop fewer. That recurrence gives the best plan for any $k$ (try 3 devices in the widget).',
    },
  ],
};

export const ch8xLessons = [dropTest];
