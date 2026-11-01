import { useMemo, useState } from 'react';
import { num, t } from '../lib/i18n';
import { ArrayRow, Caption, Controls, Panel, Slider, Stat, TreeView, useStepper, type CellTone, type TNode } from './kit';

/* ======================= Closest pair: every pair vs sort first ======================= */

/** Deterministic pseudo-random points so the picture is stable between renders. */
export function samplePoints(n: number, seed = 7) {
  let s = seed;
  const out: number[] = [];
  while (out.length < n) {
    s = (s * 9301 + 49297) % 233280;
    const v = Math.round((s / 233280) * 1000) / 10;
    if (!out.includes(v)) out.push(v);
  }
  return out;
}

export function closestPair(xs: number[]) {
  const sorted = [...xs].sort((a, b) => a - b);
  let best = Infinity;
  let pair: [number, number] = [sorted[0], sorted[1]];
  for (let i = 1; i < sorted.length; i++)
    if (sorted[i] - sorted[i - 1] < best) {
      best = sorted[i] - sorted[i - 1];
      pair = [sorted[i - 1], sorted[i]];
    }
  return { pair, gap: Math.round(best * 10) / 10 };
}

export const everyPairCost = (n: number) => (n * (n - 1)) / 2;
export const sortFirstCost = (n: number) => Math.round(n * Math.log2(n)) + (n - 1);

export function ClosestPair() {
  const [n, setN] = useState(12);
  const xs = useMemo(() => samplePoints(n), [n]);
  const { pair, gap } = closestPair(xs);
  const W = 520;
  return (
    <Panel>
      <svg viewBox={`0 0 ${W} 70`} className="w-full" role="img" aria-label={t(`${n} numbers; closest pair ${pair[0]} and ${pair[1]}`, `${n} nombres ; paire la plus proche ${pair[0]} et ${pair[1]}`)}>
        <line x1={10} x2={W - 10} y1={40} y2={40} stroke="var(--v-idle-stroke)" />
        {xs.map((x) => {
          const hit = pair.includes(x);
          return <circle key={x} cx={10 + (x / 100) * (W - 20)} cy={40} r={hit ? 7 : 5} fill={hit ? 'var(--v-active)' : 'var(--v-visit)'} />;
        })}
        <text x={10 + (((pair[0] + pair[1]) / 2) / 100) * (W - 20)} y={22} textAnchor="middle" fontSize={12} fontWeight={700} fill="var(--v-active)">
          {t('gap', 'écart')} {t(String(gap), String(gap).replace('.', ','))}
        </text>
      </svg>
      <div className="grid grid-cols-2 gap-2">
        <Stat label={t('every pair', 'toutes les paires')} value={`${num(everyPairCost(n))} ${t('comparisons', 'comparaisons')}`} tone="warn" />
        <Stat label={t('sort, then neighbours', 'trier, puis voisins')} value={`≈ ${num(sortFirstCost(n))}`} tone="ok" />
      </div>
      <Caption>
        {t(
          'Once sorted, the two closest numbers must be **neighbours** — only n − 1 gaps to check.',
          'Une fois triés, les deux nombres les plus proches sont forcément **voisins** — seulement n − 1 écarts à vérifier.',
        )}
      </Caption>
      <Slider label="n" value={n} min={4} max={200} onChange={setN} />
    </Panel>
  );
}

/* ======================= When does sorting pay off for searching? ======================= */

export function breakEven(n: number) {
  const lg = Math.log2(n);
  return Math.ceil((n * lg) / (n / 2 - lg));
}

export function SortOrNot() {
  const [exp, setExp] = useState(3);
  const n = 10 ** exp;
  const lg = Math.log2(n);
  const k0 = breakEven(n);
  const kMax = k0 * 2;
  const [k, setK] = useState(10);
  const seq = (q: number) => (q * n) / 2;
  const pre = (q: number) => n * lg + q * lg;
  const W = 520;
  const H = 200;
  const yMax = Math.max(seq(kMax), pre(kMax));
  const X = (q: number) => 40 + (q / kMax) * (W - 50);
  const Y = (v: number) => H - 24 - (v / yMax) * (H - 40);
  const kk = Math.min(k, kMax);
  return (
    <Panel>
      <div className="flex flex-wrap items-center gap-1.5 text-sm">
        <span className="font-semibold text-muted">{t('Array size:', 'Taille du tableau :')}</span>
        {[3, 6].map((e) => (
          <button
            key={e}
            className={`btn ${exp === e ? '!border-brand !bg-brand-soft !text-brand' : ''}`}
            onClick={() => {
              setExp(e);
              setK(10);
            }}
          >
            10<sup>{e}</sup>
          </button>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={t(`Break-even after ${k0} searches`, `Rentable après ${k0} recherches`)}>
        <line x1={40} x2={W - 10} y1={H - 24} y2={H - 24} stroke="var(--v-idle-stroke)" />
        <line x1={X(0)} y1={Y(seq(0))} x2={X(kMax)} y2={Y(seq(kMax))} stroke="var(--bad)" strokeWidth={3} />
        <line x1={X(0)} y1={Y(pre(0))} x2={X(kMax)} y2={Y(pre(kMax))} stroke="var(--v-done)" strokeWidth={3} />
        <line x1={X(k0)} x2={X(k0)} y1={14} y2={H - 24} stroke="var(--v-active)" strokeDasharray="4 4" />
        <text x={X(k0) + 4} y={22} fontSize={11} fontWeight={700} fill="var(--v-active)">
          {t('break-even', 'seuil')} ≈ {k0}
        </text>
        <line x1={X(kk)} x2={X(kk)} y1={H - 30} y2={H - 18} stroke="var(--text)" strokeWidth={2} />
        <text x={40} y={H - 6} fontSize={11} fill="var(--muted)">
          0
        </text>
        <text x={W - 10} y={H - 6} textAnchor="end" fontSize={11} fill="var(--muted)">
          {kMax} {t('searches', 'recherches')}
        </text>
      </svg>
      <div className="flex flex-wrap gap-4 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1 w-5 rounded bg-bad" /> {t('no sort: k × n/2 comparisons', 'sans tri : k × n/2 comparaisons')}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1 w-5 rounded bg-v-done" />{' '}
          {t('sort once (n log₂ n), then k halving searches', 'un tri (n log₂ n), puis k recherches dichotomiques')}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Stat label={t(`${kk} searches, no sort`, `${kk} recherches, sans tri`)} value={num(Math.round(seq(kk)))} tone={seq(kk) < pre(kk) ? 'ok' : 'warn'} />
        <Stat label={t(`${kk} searches, sort first`, `${kk} recherches, tri d’abord`)} value={num(Math.round(pre(kk)))} tone={pre(kk) <= seq(kk) ? 'ok' : 'warn'} />
      </div>
      <Slider label={t('searches k', 'recherches k')} value={kk} min={1} max={kMax} onChange={setK} />
    </Panel>
  );
}

/* ======================= Thinnest balanced trees ======================= */

export const minAvlNodes = (h: number): number => (h < 0 ? 0 : h === 0 ? 1 : 1 + minAvlNodes(h - 1) + minAvlNodes(h - 2));

/** Thinnest balanced tree of height h: left subtree height h−1, right subtree height h−2. Keys = in-order rank. */
export function thinTree(h: number): TNode | null {
  let counter = 0;
  const build = (hh: number): TNode | null => {
    if (hh < 0) return null;
    const node: TNode = { id: '', label: '' };
    node.left = build(hh - 1);
    counter++;
    node.id = String(counter);
    node.label = String(counter);
    node.right = build(hh - 2);
    return node;
  };
  return build(h);
}

export function ThinBalancedTree() {
  const [h, setH] = useState(3);
  const tree = useMemo(() => thinTree(h), [h]);
  const height = (t: TNode | null | undefined): number => (t ? 1 + Math.max(height(t.left), height(t.right)) : -1);
  const bal: Record<string, number> = {};
  const walk = (t: TNode | null | undefined) => {
    if (!t) return;
    bal[t.id] = height(t.left) - height(t.right);
    walk(t.left);
    walk(t.right);
  };
  walk(tree);
  return (
    <Panel>
      <div className="min-h-40">
        <TreeView root={tree} r={h >= 4 ? 13 : 16} colW={h >= 4 ? 28 : 38} rowH={h >= 4 ? 46 : 54} badge={(id) => (bal[id] > 0 ? `+${bal[id]}` : String(bal[id]))} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Stat label={t('height', 'hauteur')} value={h} />
        <Stat label={t('nodes', 'nœuds')} value={minAvlNodes(h)} tone="brand" />
      </div>
      <Caption>
        {t(
          'Every node leans one way (+1) as far as the balance rule allows: the fewest nodes a balanced tree of this height can have.',
          'Chaque nœud penche d’un côté (+1) autant que la règle d’équilibre le permet : le moins de nœuds possible pour un arbre équilibré de cette hauteur.',
        )}
      </Caption>
      <Slider label={t('height h', 'hauteur h')} value={h} min={0} max={5} onChange={setH} />
    </Panel>
  );
}

/* ======================= Plain search tree, insertion by insertion ======================= */

export function plainBstFrames(keys: string[]) {
  type N = { key: string; left: N | null; right: N | null };
  let root: N | null = null;
  const toT = (n: N | null): TNode | null => (n ? { id: n.key, label: n.key, left: toT(n.left), right: toT(n.right) } : null);
  const height = (n: N | null): number => (n ? 1 + Math.max(height(n.left), height(n.right)) : -1);
  const frames: { root: TNode | null; fresh?: string; height: number }[] = [{ root: null, height: -1 }];
  for (const k of keys) {
    const node: N = { key: k, left: null, right: null };
    if (!root) root = node;
    else {
      let cur: N = root;
      for (;;) {
        const side = k < cur.key ? 'left' : 'right';
        if (!cur[side]) {
          cur[side] = node;
          break;
        }
        cur = cur[side]!;
      }
    }
    frames.push({ root: toT(root), fresh: k, height: height(root) });
  }
  return frames;
}

export function PlainBstBuilder({ keys, onSolved }: { keys: string[]; onSolved?: () => void }) {
  const frames = useMemo(() => plainBstFrames(keys), [keys]);
  const s = useStepper(frames.length, onSolved, 700);
  const f = frames[s.i];
  return (
    <Panel>
      <div className="min-h-48 overflow-x-auto">
        <TreeView root={f.root} r={14} colW={30} rowH={34} minWidth={300} fill={(id) => (id === f.fresh ? 'visit' : 'idle')} />
      </div>
      <Stat label={t('height', 'hauteur')} value={Math.max(f.height, 0)} tone="warn" />
      <Controls s={s} />
    </Panel>
  );
}

/* ======================= Smallest key of a max-heap ======================= */

export const HEAP9 = [9, 7, 8, 4, 5, 6, 2, 1, 3];

type HmFrame = { arr: number[]; size: number; scan: number | null; best: number | null; comps: number; msg: string };

export function heapMinFrames(heap: number[]): HmFrame[] {
  const a = [...heap];
  const n = a.length;
  const firstLeaf = Math.floor(n / 2); // 0-based index of the first leaf
  const frames: HmFrame[] = [{ arr: [...a], size: n, scan: null, best: null, comps: 0, msg: t(
        `In a max-heap every parent is ≥ its children, so the smallest key must be a leaf: positions ${firstLeaf + 1} to ${n}.`,
        `Dans un tas max, chaque parent est ≥ à ses enfants : la plus petite clé est donc une feuille, positions ${firstLeaf + 1} à ${n}.`,
      ),
    },
  ];
  let best = firstLeaf;
  let comps = 0;
  frames.push({ arr: [...a], size: n, scan: firstLeaf, best, comps, msg: t(`Start with the first leaf, ${a[firstLeaf]}.`, `On commence par la première feuille, ${a[firstLeaf]}.`) });
  for (let i = firstLeaf + 1; i < n; i++) {
    comps++;
    if (a[i] < a[best]) best = i;
    frames.push({ arr: [...a], size: n, scan: i, best, comps, msg: t(`Compare ${a[i]}: smallest so far is ${a[best]}.`, `On compare ${a[i]} : le plus petit jusqu’ici est ${a[best]}.`) });
  }
  const last = a[n - 1];
  a[best] = last;
  frames.push({ arr: a.slice(0, n - 1), size: n - 1, scan: null, best, comps, msg: t(`Delete it: move the last key (${last}) into its place and shrink the heap.`, `On la supprime : la dernière clé (${last}) prend sa place et le tas rétrécit.`) });
  // The moved key may be larger than its new parent: sift it up.
  let k = best;
  while (k > 0 && k < n - 1) {
    const p = Math.floor((k - 1) / 2);
    if (a[p] >= a[k]) break;
    [a[p], a[k]] = [a[k], a[p]];
    frames.push({ arr: a.slice(0, n - 1), size: n - 1, scan: null, best: p, comps, msg: t(`${a[p]} is larger than its parent: swap upwards.`, `${a[p]} est plus grand que son parent : on remonte.`) });
    k = p;
  }
  frames.push({ arr: a.slice(0, n - 1), size: n - 1, scan: null, best: null, comps, msg: t(
      `Done: ${comps} comparisons to find the minimum among ${n - firstLeaf} leaves, then at most one climb to the root.`,
      `Terminé : ${comps} comparaisons pour trouver le minimum parmi ${n - firstLeaf} feuilles, puis au plus une remontée jusqu’à la racine.`,
    ),
  });
  return frames;
}

function heapTree(arr: number[], i = 0): TNode | null {
  if (i >= arr.length) return null;
  return { id: String(arr[i]), label: String(arr[i]), left: heapTree(arr, 2 * i + 1), right: heapTree(arr, 2 * i + 2) };
}

export function HeapMin({ onSolved }: { onSolved?: () => void }) {
  const frames = useMemo(() => heapMinFrames(HEAP9), []);
  const s = useStepper(frames.length, onSolved, 900);
  const f = frames[s.i];
  const firstLeaf = Math.floor(HEAP9.length / 2);
  const tone = (i: number): CellTone => (i === f.best ? 'active' : i === f.scan ? 'visit' : f.size === HEAP9.length && i >= firstLeaf ? 'idle' : f.size === HEAP9.length ? 'dim' : 'idle');
  return (
    <Panel>
      <TreeView root={heapTree(f.arr)} colW={40} rowH={52} minWidth={300} fill={(id) => tone(f.arr.indexOf(Number(id)))} />
      <ArrayRow items={f.arr.map((v) => ({ id: v, label: v }))} tone={tone} showIndex indexBase={1} size={38} />
      <Stat label={t('comparisons', 'comparaisons')} value={f.comps} tone="brand" />
      <Caption>{f.msg}</Caption>
      <Controls s={s} />
    </Panel>
  );
}

/* ======================= Largest product with a fixed sum ======================= */

export function ProductBars() {
  const [n, setN] = useState(10);
  const vals = Array.from({ length: n - 1 }, (_, i) => (i + 1) * (n - i - 1));
  const max = Math.max(...vals);
  return (
    <Panel>
      <div className="flex h-36 items-end gap-0.5" role="img" aria-label={t(`Largest product ${max}`, `Plus grand produit ${max}`)}>
        {vals.map((v, i) => (
          <div key={i} className="flex flex-1 flex-col items-center justify-end gap-1">
            <div className="w-full rounded-t" style={{ height: `${(v / max) * 100}%`, background: v === max ? 'var(--v-done)' : 'var(--v-visit)', opacity: v === max ? 1 : 0.55 }} />
          </div>
        ))}
      </div>
      <div className="flex gap-0.5 font-mono text-[10px] text-muted">
        {vals.map((_, i) => (
          <span key={i} className="flex-1 text-center">
            {n - 1 <= 20 || (i + 1) % 5 === 0 ? i + 1 : ''}
          </span>
        ))}
      </div>
      <Caption>
        {t(
          `Split n = ${n} into a + (n − a). The product a(n − a) peaks at a = ${Math.floor(n / 2)}: **${Math.floor(n / 2)} × ${Math.ceil(n / 2)} = ${max}**.`,
          `On coupe n = ${n} en a + (n − a). Le produit a(n − a) culmine en a = ${Math.floor(n / 2)} : **${Math.floor(n / 2)} × ${Math.ceil(n / 2)} = ${max}**.`,
        )}
      </Caption>
      <Slider label="n" value={n} min={3} max={40} onChange={setN} />
    </Panel>
  );
}
