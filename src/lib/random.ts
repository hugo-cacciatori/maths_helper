/** Small seeded random source so a generated question is reproducible from its seed. */
export type Rng = {
  /** Uniform float in [0, 1). */
  next: () => number;
  /** Integer in [lo, hi], both included. */
  int: (lo: number, hi: number) => number;
  pick: <T>(arr: readonly T[]) => T;
  shuffle: <T>(arr: readonly T[]) => T[];
};

export function rng(seed: number): Rng {
  let s = seed >>> 0;
  // mulberry32
  const next = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (lo: number, hi: number) => lo + Math.floor(next() * (hi - lo + 1));
  return {
    next,
    int,
    pick: (arr) => arr[int(0, arr.length - 1)],
    shuffle: (arr) => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = int(0, i);
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    },
  };
}

export const freshSeed = () => Math.floor(Math.random() * 4294967296);

/** A number for KaTeX with thin-space thousands separators: 250000 → 250\,000. */
export const texNum = (n: number) => n.toLocaleString('en-US').replace(/,/g, '\\,');

/** Shuffles the right option among the wrong ones; wrong options equal to the right one are dropped. */
export function choiceOf(r: Rng, correct: string, wrong: string[]) {
  const options = r.shuffle([correct, ...new Set(wrong.filter((w) => w !== correct))]);
  return { options, answer: options.indexOf(correct) };
}
