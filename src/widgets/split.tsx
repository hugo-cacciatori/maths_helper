import { motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { TeX } from '../components/Prose';
import { ArrayRow, Caption, Controls, Panel, Slider, Stat, TreeView, useStepper, type CellTone, type TNode } from './kit';

export type Item = { id: string; key: string };

/** E, X, A, M, P, L, E with the two E's told apart so stability is visible. */
export const EXAMPLE: Item[] = [
  { id: 'E1', key: 'E' },
  { id: 'X', key: 'X' },
  { id: 'A', key: 'A' },
  { id: 'M', key: 'M' },
  { id: 'P', key: 'P' },
  { id: 'L', key: 'L' },
  { id: 'E2', key: 'E' },
];

function ItemLabel({ it }: { it: Item }) {
  const sub = it.id.length > 1 && it.id.startsWith(it.key) ? it.id.slice(it.key.length) : '';
  return (
    <span>
      {it.key}
      {sub && <sub className="text-[0.65em] opacity-80">{sub}</sub>}
    </span>
  );
}

/* ======================= Merge sort ======================= */

type Seg = { lo: number; hi: number; depth: number };
type MsFrame = { status: Record<string, 'hidden' | 'open' | 'sorted' | 'active'>; content: Record<string, Item[]>; msg: string; comps: number };

function msFrames(input: Item[]): { frames: MsFrame[]; segs: Seg[] } {
  const segs: Seg[] = [];
  const k = (s: Seg) => `${s.lo}-${s.hi}`;
  const build = (lo: number, hi: number, depth: number) => {
    segs.push({ lo, hi, depth });
    if (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      build(lo, mid, depth + 1);
      build(mid + 1, hi, depth + 1);
    }
  };
  build(0, input.length - 1, 0);
  const status: MsFrame['status'] = Object.fromEntries(segs.map((s) => [k(s), 'hidden']));
  const content: MsFrame['content'] = Object.fromEntries(segs.map((s) => [k(s), input.slice(s.lo, s.hi + 1)]));
  status[k(segs[0])] = 'open';
  const frames: MsFrame[] = [];
  let comps = 0;
  const snap = (msg: string) => frames.push({ status: { ...status }, content: { ...content }, msg, comps });
  snap('Merge sort splits the array in two halves, sorts each half recursively, then merges them.');
  const sort = (lo: number, hi: number): Item[] => {
    const key = `${lo}-${hi}`;
    if (lo === hi) {
      status[key] = 'sorted';
      return content[key];
    }
    const mid = Math.floor((lo + hi) / 2);
    status[`${lo}-${mid}`] = 'open';
    status[`${mid + 1}-${hi}`] = 'open';
    snap(`Split [${content[key].map((x) => x.key).join(' ')}] into two halves.`);
    const a = sort(lo, mid);
    const b = sort(mid + 1, hi);
    const out: Item[] = [];
    let i = 0;
    let j = 0;
    while (i < a.length && j < b.length) {
      comps++;
      // `<=` takes from the left half on ties: this is what makes merge sort stable.
      if (a[i].key <= b[j].key) out.push(a[i++]);
      else out.push(b[j++]);
    }
    out.push(...a.slice(i), ...b.slice(j));
    content[key] = out;
    status[key] = 'active';
    snap(`Merge [${a.map((x) => x.key).join(' ')}] and [${b.map((x) => x.key).join(' ')}] → [${out.map((x) => x.key).join(' ')}].`);
    status[key] = 'sorted';
    return out;
  };
  sort(0, input.length - 1);
  snap(`Sorted! ${comps} key comparisons in total.`);
  return { frames, segs };
}

export function MergeSortTree({ onSolved }: { onSolved?: () => void }) {
  const { frames, segs } = useMemo(() => msFrames(EXAMPLE), []);
  const s = useStepper(frames.length, onSolved, 1100);
  const f = frames[s.i];
  const depths = Math.max(...segs.map((x) => x.depth)) + 1;
  return (
    <Panel>
      <div className="space-y-2.5 overflow-x-auto">
        {Array.from({ length: depths }, (_, d) => (
          <div key={d} className="flex min-w-max justify-center gap-3">
            {segs
              .filter((x) => x.depth === d)
              .sort((a, b) => a.lo - b.lo)
              .map((x) => {
                const key = `${x.lo}-${x.hi}`;
                const st = f.status[key];
                return (
                  <div
                    key={key}
                    className="flex gap-0.5 rounded-lg p-1 transition-all"
                    style={{
                      opacity: st === 'hidden' ? 0.08 : 1,
                      background: st === 'active' ? 'color-mix(in srgb, var(--v-active) 25%, transparent)' : 'var(--surface-2)',
                    }}
                  >
                    {f.content[key].map((it) => (
                      <motion.div
                        layout
                        key={it.id}
                        className="flex h-8 w-8 items-center justify-center rounded-md font-mono text-sm font-bold"
                        style={{
                          background: st === 'sorted' || st === 'active' ? 'var(--v-done)' : 'var(--surface)',
                          color: st === 'sorted' || st === 'active' ? '#fff' : 'var(--text)',
                          border: '1.5px solid var(--border)',
                        }}
                      >
                        <ItemLabel it={it} />
                      </motion.div>
                    ))}
                  </div>
                );
              })}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="comparisons" value={f.comps} tone="brand" />
        <Stat label="depth" value={`${depths - 1} levels of splits`} />
      </div>
      <Caption>{f.msg}</Caption>
      <Controls s={s} />
    </Panel>
  );
}

/* ======================= Quicksort ======================= */

type QsFrame = { arr: Item[]; l: number; r: number; i?: number; j?: number; pivot?: number; done: number[]; msg: string; calls: { l: number; r: number; depth: number; s?: number }[] };

function qsFrames(input: Item[]): QsFrame[] {
  const A = [...input];
  const frames: QsFrame[] = [];
  const done = new Set<number>();
  const calls: QsFrame['calls'] = [];
  const snap = (l: number, r: number, msg: string, extra: Partial<QsFrame> = {}) =>
    frames.push({ arr: [...A], l, r, done: [...done], msg, calls: calls.map((c) => ({ ...c })), ...extra });
  const swap = (a: number, b: number) => ([A[a], A[b]] = [A[b], A[a]]);
  const qs = (l: number, r: number, depth: number) => {
    if (l > r) return;
    const call = { l, r, depth } as QsFrame['calls'][number];
    calls.push(call);
    if (l === r) {
      done.add(l);
      call.s = l;
      snap(l, r, `Quicksort(${l}, ${r}): a single element is already sorted.`);
      return;
    }
    const p = A[l].key;
    snap(l, r, `Quicksort(${l}, ${r}): the pivot is the first element, **${p}**.`, { pivot: l });
    let i = l;
    let j = r + 1;
    for (;;) {
      do i++;
      while (i < r && A[i].key < p);
      do j--;
      while (A[j].key > p);
      if (i >= j) {
        snap(l, r, `i and j have crossed (i=${i}, j=${j}): partition finished.`, { pivot: l, i, j });
        break;
      }
      snap(l, r, `i stops at ${A[i].key} (≥ ${p}), j stops at ${A[j].key} (≤ ${p}): swap them.`, { pivot: l, i, j });
      swap(i, j);
      snap(l, r, `Swapped.`, { pivot: l, i, j });
    }
    swap(l, j);
    done.add(j);
    call.s = j;
    snap(l, r, `Put the pivot in its final place, position ${j}. Left of it: ≤ ${p}; right: ≥ ${p}.`, { pivot: j });
    qs(l, j - 1, depth + 1);
    qs(j + 1, r, depth + 1);
  };
  snap(0, input.length - 1, 'Quicksort partitions around a pivot, then sorts both sides recursively.');
  qs(0, input.length - 1, 0);
  snap(0, input.length - 1, 'Sorted!');
  return frames;
}

export function QuickSortViz({ onSolved }: { onSolved?: () => void }) {
  const frames = useMemo(() => qsFrames(EXAMPLE), []);
  const s = useStepper(frames.length, onSolved, 1000);
  const f = frames[s.i];
  const tone = (k: number): CellTone => {
    if (k === f.pivot) return 'active';
    if (f.done.includes(k)) return 'done';
    if (k < f.l || k > f.r) return 'dim';
    if (k === f.i || k === f.j) return 'visit';
    return 'idle';
  };
  const pointers = [
    ...(f.i !== undefined && f.i <= f.r ? [{ at: f.i, label: 'i' }] : []),
    ...(f.j !== undefined ? [{ at: f.j, label: 'j', color: 'var(--bad)' }] : []),
  ];
  return (
    <Panel>
      <ArrayRow items={f.arr.map((it) => ({ id: it.id, label: <ItemLabel it={it} /> }))} tone={tone} pointers={pointers} showIndex />
      <Caption>{f.msg}</Caption>
      <Controls s={s} />
      <div className="rounded-xl bg-surface-2 p-3">
        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">Tree of recursive calls</div>
        <div className="space-y-0.5 font-mono text-xs">
          {f.calls.map((c, k) => (
            <div key={k} style={{ paddingLeft: c.depth * 18 }} className={k === f.calls.length - 1 ? 'font-bold text-brand' : ''}>
              {c.depth > 0 && '└ '}l={c.l}, r={c.r}
              {c.s !== undefined && <span className="text-muted">, s={c.s}</span>}
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

/* ======================= Fast exponentiation ======================= */

export function PowerByHalves() {
  const [n, setN] = useState(13);
  const chain: { k: number; op: string }[] = [];
  let mults = 0;
  for (let k = n; k > 1; k = Math.floor(k / 2)) {
    const odd = k % 2 === 1;
    mults += odd ? 2 : 1;
    chain.push({ k, op: odd ? `a^{${k}} = (a^{${Math.floor(k / 2)}})^2 \\cdot a` : `a^{${k}} = (a^{${k / 2}})^2` });
  }
  return (
    <Panel>
      <div className="space-y-1">
        {chain.map((c) => (
          <motion.div key={c.k} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 rounded-lg bg-surface-2 px-3 py-1.5 text-sm">
            <span className={`chip ${c.k % 2 ? '!bg-warn-soft !text-warn' : '!bg-brand-soft !text-brand'}`}>{c.k % 2 ? '2 mult.' : '1 mult.'}</span>
            <TeX>{c.op}</TeX>
          </motion.div>
        ))}
        <div className="rounded-lg bg-surface-2 px-3 py-1.5 text-sm">
          <TeX>{'a^1 = a'}</TeX> <span className="text-muted">(base case)</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="one by one: a·a·…·a" value={`${n - 1} mult.`} tone="warn" />
        <Stat label="by halving" value={`${mults} mult.`} tone="ok" />
      </div>
      <Slider label="n" value={n} min={1} max={1000} onChange={setN} />
    </Panel>
  );
}

/* ======================= Colour partitioning ======================= */

type Color = 'R' | 'W' | 'B';
const COLORS: Record<Color, string> = { R: '#dc2626', W: '#f8fafc', B: '#1d4ed8' };

function flagFrames(input: Color[]) {
  const A = input.map((c, i) => ({ id: i, c }));
  const frames: { arr: typeof A; lo: number; mid: number; hi: number; swaps: number; msg: string }[] = [];
  let lo = 0;
  let mid = 0;
  let hi = A.length - 1;
  let swaps = 0;
  const snap = (msg: string) => frames.push({ arr: A.map((x) => ({ ...x })), lo, mid, hi, swaps, msg });
  snap('Invariant: [0, lo) red · [lo, mid) white · [mid, hi] unknown · (hi, end] blue.');
  while (mid <= hi) {
    const c = A[mid].c;
    if (c === 'R') {
      if (lo !== mid) {
        [A[lo], A[mid]] = [A[mid], A[lo]];
        swaps++;
      }
      lo++;
      mid++;
      snap('Red: swap it to the end of the red zone; lo and mid move right.');
    } else if (c === 'W') {
      mid++;
      snap('White: it is already in the white zone; mid moves right.');
    } else {
      [A[mid], A[hi]] = [A[hi], A[mid]];
      swaps++;
      hi--;
      snap('Blue: swap it with the last unknown element; hi moves left (the new A[mid] is still unknown).');
    }
  }
  snap(`Done in a single pass with ${swaps} swaps.`);
  return frames;
}

export function FlagSort({ colors, onSolved }: { colors: Color[]; onSolved?: () => void }) {
  const frames = useMemo(() => flagFrames(colors), [colors]);
  const s = useStepper(frames.length, onSolved, 750);
  const f = frames[s.i];
  return (
    <Panel>
      <div className="overflow-x-auto pb-1">
        <div className="mx-auto flex w-max gap-1.5 px-1">
          {f.arr.map((x, k) => (
            <motion.div layout key={x.id} transition={{ type: 'spring', stiffness: 380, damping: 32 }} className="flex flex-col items-center gap-1">
              <div
                className="h-11 w-9 rounded-md border-2"
                style={{
                  background: COLORS[x.c],
                  borderColor: k >= f.mid && k <= f.hi ? 'var(--v-idle-stroke)' : 'transparent',
                  opacity: k >= f.mid && k <= f.hi ? 0.55 : 1,
                }}
              />
              <div className="flex h-4 gap-0.5 font-mono text-[10px] font-bold">
                {k === f.lo && <span className="text-[#dc2626]">lo</span>}
                {k === f.mid && <span className="text-brand">mid</span>}
                {k === f.hi && <span className="text-[#1d4ed8]">hi</span>}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="swaps" value={f.swaps} tone="brand" />
        <Stat label="unknown left" value={Math.max(0, f.hi - f.mid + 1)} />
      </div>
      <Caption>{f.msg}</Caption>
      <Controls s={s} />
    </Panel>
  );
}

/* ======================= Binary-tree traversals ======================= */

export const SAMPLE_TREE: TNode = {
  id: 'a',
  label: 'a',
  left: { id: 'b', label: 'b', left: { id: 'd', label: 'd' }, right: { id: 'e', label: 'e' } },
  right: { id: 'c', label: 'c', right: { id: 'f', label: 'f' } },
};

export function traverse(t: TNode | null | undefined, order: 'pre' | 'in' | 'post'): string[] {
  if (!t) return [];
  const L = traverse(t.left, order);
  const R = traverse(t.right, order);
  if (order === 'pre') return [t.id, ...L, ...R];
  if (order === 'in') return [...L, t.id, ...R];
  return [...L, ...R, t.id];
}

export function TraversalClicker({ tree = SAMPLE_TREE, order, onSolved }: { tree?: TNode; order: 'pre' | 'in' | 'post'; onSolved?: () => void }) {
  const target = useMemo(() => traverse(tree, order), [tree, order]);
  const [seq, setSeq] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string | null>(null);
  const done = seq.length === target.length;
  useEffect(() => {
    if (done) onSolved?.();
  }, [done, onSolved]);
  const rule = { pre: 'node, then left subtree, then right subtree', in: 'left subtree, then node, then right subtree', post: 'left subtree, then right subtree, then node' }[order];
  return (
    <Panel>
      <TreeView
        root={tree}
        colW={56}
        rowH={66}
        fill={(id) => (seq.includes(id) ? 'done' : wrong === id ? 'bad' : 'idle')}
        badge={(id) => (seq.includes(id) ? String(seq.indexOf(id) + 1) : undefined)}
        onNodeClick={(id) => {
          if (done || seq.includes(id)) return;
          if (id === target[seq.length]) {
            setSeq([...seq, id]);
            setWrong(null);
          } else setWrong(id);
        }}
      />
      <Caption tone={done ? 'ok' : wrong ? 'warn' : 'neutral'}>
        {done
          ? `Done: **${seq.join(' ')}**`
          : wrong
            ? `Not ${wrong} yet. Remember the ${order}order rule: ${rule}.`
            : `Click the nodes in **${order}order** (${rule}). So far: ${seq.join(' ') || '—'}`}
      </Caption>
      <button
        className="btn self-start"
        onClick={() => {
          setSeq([]);
          setWrong(null);
        }}
      >
        Reset
      </button>
    </Panel>
  );
}

/* ======================= Chocolate bar ======================= */

type Piece = { x: number; y: number; w: number; h: number };

export function ChocolateBar({ rows = 3, cols = 4, onSolved }: { rows?: number; cols?: number; onSolved?: () => void }) {
  const [pieces, setPieces] = useState<Piece[]>([{ x: 0, y: 0, w: cols, h: rows }]);
  const [breaks, setBreaks] = useState(0);
  const done = pieces.length === rows * cols;
  useEffect(() => {
    if (done) onSolved?.();
  }, [done, onSolved]);
  const S = 52;
  const gap = 6;
  // Layout: pieces drift apart a little as they get broken, so it reads as separate bars.
  const X = (p: Piece) => p.x * S + p.x * (gap * 0.5);
  const Y = (p: Piece) => p.y * S + p.y * (gap * 0.5);
  const W = cols * S + cols * gap * 0.5 + 4;
  const H = rows * S + rows * gap * 0.5 + 4;
  const split = (k: number, dir: 'v' | 'h', at: number) => {
    const p = pieces[k];
    const a: Piece = dir === 'v' ? { ...p, w: at } : { ...p, h: at };
    const b: Piece = dir === 'v' ? { ...p, x: p.x + at, w: p.w - at } : { ...p, y: p.y + at, h: p.h - at };
    setPieces([...pieces.slice(0, k), a, b, ...pieces.slice(k + 1)]);
    setBreaks(breaks + 1);
  };
  return (
    <Panel>
      <svg viewBox={`-2 -2 ${W} ${H}`} className="mx-auto w-full" style={{ maxWidth: W }}>
        {pieces.map((p, k) => (
          <g key={`${p.x}-${p.y}-${p.w}-${p.h}`}>
            <rect x={X(p)} y={Y(p)} width={p.w * S - 2} height={p.h * S - 2} rx={6} fill="#7c4a2d" />
            {Array.from({ length: p.w * p.h }, (_, c) => (
              <rect
                key={c}
                x={X(p) + (c % p.w) * S + 5}
                y={Y(p) + Math.floor(c / p.w) * S + 5}
                width={S - 12}
                height={S - 12}
                rx={4}
                fill="#93593a"
              />
            ))}
            {Array.from({ length: p.w - 1 }, (_, c) => (
              <rect
                key={`v${c}`}
                x={X(p) + (c + 1) * S - 7}
                y={Y(p)}
                width={10}
                height={p.h * S - 2}
                className="cursor-pointer fill-transparent hover:fill-[var(--v-active)]"
                onClick={() => split(k, 'v', c + 1)}
              />
            ))}
            {Array.from({ length: p.h - 1 }, (_, c) => (
              <rect
                key={`h${c}`}
                x={X(p)}
                y={Y(p) + (c + 1) * S - 7}
                width={p.w * S - 2}
                height={10}
                className="cursor-pointer fill-transparent hover:fill-[var(--v-active)]"
                onClick={() => split(k, 'h', c + 1)}
              />
            ))}
          </g>
        ))}
      </svg>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="breaks" value={breaks} tone="brand" />
        <Stat label="pieces" value={pieces.length} />
      </div>
      <Caption tone={done ? 'ok' : 'neutral'}>
        {done ? `All ${rows * cols} squares separated with **${breaks}** breaks.` : 'Hover a groove and click to break that piece along a straight line.'}
      </Caption>
      <button
        className="btn self-start"
        onClick={() => {
          setPieces([{ x: 0, y: 0, w: cols, h: rows }]);
          setBreaks(0);
        }}
      >
        Reset
      </button>
    </Panel>
  );
}
