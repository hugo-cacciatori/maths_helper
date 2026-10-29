import { useEffect, useMemo, useState } from 'react';
import { ArrayRow, Caption, Controls, Panel, Slider, Stat, TreeView, useStepper, type CellTone, type TNode } from './kit';

/* ======================= Nuts and bolts ======================= */

type NbFrame = { nuts: number[]; bolts: number[]; matched: number[]; lo: number; hi: number; bolt?: number; nut?: number; comps: number; msg: string };

export function nutsBoltsFrames(nuts0: number[], bolts0: number[]): NbFrame[] {
  const nuts = [...nuts0];
  const bolts = [...bolts0];
  const matched: number[] = [];
  const frames: NbFrame[] = [];
  let comps = 0;
  const snap = (lo: number, hi: number, msg: string, extra: Partial<NbFrame> = {}) =>
    frames.push({ nuts: [...nuts], bolts: [...bolts], matched: [...matched], lo, hi, comps, msg, ...extra });
  // Reorder a[lo..hi] into: smaller than key, equal, bigger. Returns the final index of the equal element.
  const partition = (a: number[], lo: number, hi: number, key: number) => {
    const seg = a.slice(lo, hi + 1);
    const small = seg.filter((x) => x < key);
    const eq = seg.filter((x) => x === key);
    const big = seg.filter((x) => x > key);
    a.splice(lo, seg.length, ...small, ...eq, ...big);
    return lo + small.length;
  };
  snap(0, nuts.length - 1, 'Nuts can only be compared with bolts. Size is shown here for you — the algorithm cannot see it.');
  const solve = (lo: number, hi: number) => {
    if (lo > hi) return;
    const bolt = bolts[lo];
    comps += hi - lo + 1;
    const m = partition(nuts, lo, hi, bolt);
    snap(lo, hi, `Try bolt ${bolt} on all ${hi - lo + 1} nuts of this group: smaller nuts go left, bigger right, and one fits.`, { bolt, nut: bolt });
    comps += hi - lo; // the matching nut is compared with the other bolts of the group
    partition(bolts, lo, hi, bolt);
    matched.push(bolt);
    snap(lo, hi, `Use nut ${bolt} to split the bolts the same way (${hi - lo} more tries). Pair ${bolt} is matched.`, { bolt, nut: bolt });
    solve(lo, m - 1);
    solve(m + 1, hi);
  };
  solve(0, nuts.length - 1);
  snap(0, nuts.length - 1, `All pairs matched with ${comps} nut–bolt tries.`);
  return frames;
}

export function NutsBolts({ nuts = [3, 6, 1, 5, 2, 4, 7], bolts = [4, 1, 7, 6, 3, 5, 2], onSolved }: { nuts?: number[]; bolts?: number[]; onSolved?: () => void }) {
  const frames = useMemo(() => nutsBoltsFrames(nuts, bolts), [nuts, bolts]);
  const s = useStepper(frames.length, onSolved, 1300);
  const f = frames[s.i];
  const tone = (arr: number[]) => (i: number): CellTone =>
    f.matched.includes(arr[i]) ? 'done' : arr[i] === f.bolt ? 'active' : i < f.lo || i > f.hi ? 'dim' : 'idle';
  return (
    <Panel>
      <div className="grid grid-cols-[48px_1fr] items-center gap-2">
        <span className="text-right text-xs font-bold text-muted">bolts</span>
        <ArrayRow items={f.bolts.map((v) => ({ id: `b${v}`, label: v }))} tone={tone(f.bolts)} size={40} />
        <span className="text-right text-xs font-bold text-muted">nuts</span>
        <ArrayRow items={f.nuts.map((v) => ({ id: `n${v}`, label: v }))} tone={tone(f.nuts)} size={40} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="nut–bolt tries" value={f.comps} tone="brand" />
        <Stat label="pairs matched" value={`${f.matched.length} / ${nuts.length}`} tone="ok" />
      </div>
      <Caption>{f.msg}</Caption>
      <Controls s={s} />
    </Panel>
  );
}

/* ======================= Rebuilding a tree from two traversals ======================= */

export function rebuild(inord: string[], post: string[]): TNode | null {
  if (!post.length) return null;
  const root = post[post.length - 1];
  const k = inord.indexOf(root);
  return {
    id: root,
    label: root,
    left: rebuild(inord.slice(0, k), post.slice(0, k)),
    right: rebuild(inord.slice(k + 1), post.slice(k, post.length - 1)),
  };
}

const preorderIds = (t: TNode | null | undefined): string[] => (t ? [t.id, ...preorderIds(t.left), ...preorderIds(t.right)] : []);
const subtreeIds = (t: TNode | null | undefined): string[] => (t ? [t.id, ...subtreeIds(t.left), ...subtreeIds(t.right)] : []);
function findNode(t: TNode | null | undefined, id: string): TNode | null {
  if (!t) return null;
  if (t.id === id) return t;
  return findNode(t.left, id) ?? findNode(t.right, id);
}
function prune(t: TNode | null | undefined, keep: Set<string>): TNode | null {
  if (!t || !keep.has(t.id)) return null;
  return { ...t, left: prune(t.left, keep), right: prune(t.right, keep) };
}

export function TreeRebuilder({ inord, post, onSolved }: { inord: string[]; post: string[]; onSolved?: () => void }) {
  const full = useMemo(() => rebuild(inord, post), [inord, post]);
  const order = useMemo(() => preorderIds(full), [full]);
  const [placed, setPlaced] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string | null>(null);
  const done = placed.length === order.length;
  useEffect(() => {
    if (done) onSolved?.();
  }, [done, onSolved]);
  const next = order[placed.length];
  const sub = new Set(subtreeIds(findNode(full, next)));
  const pick = (id: string) => {
    if (done || placed.includes(id)) return;
    if (id === next) {
      setPlaced([...placed, id]);
      setWrong(null);
    } else setWrong(id);
  };
  const row = (seq: string[], label: string) => (
    <div className="space-y-1">
      <div className="text-center text-xs font-bold text-muted">{label}</div>
      <ArrayRow
        wrap
        items={seq.map((v) => ({ id: `${label}${v}`, label: v }))}
        size={36}
        tone={(i) => (placed.includes(seq[i]) ? 'done' : !done && sub.has(seq[i]) ? (seq[i] === wrong ? 'bad' : 'idle') : 'dim')}
        onCellClick={label === 'post-order' ? (i) => pick(seq[i]) : undefined}
      />
    </div>
  );
  return (
    <Panel>
      {row(inord, 'in-order')}
      {row(post, 'post-order')}
      <div className="min-h-40">
        <TreeView root={prune(full, new Set(placed))} colW={40} rowH={54} minWidth={300} />
      </div>
      <Caption tone={done ? 'ok' : wrong ? 'warn' : 'neutral'}>
        {done
          ? 'Tree rebuilt. Each post-order block ends with its root; the in-order list tells what goes left and right of it.'
          : wrong
            ? `Not ${wrong}. In the highlighted part of the post-order list, which element is visited last?`
            : `Click, in the post-order row, the root of the highlighted part (${sub.size} node${sub.size === 1 ? '' : 's'}).`}
      </Caption>
      <div className="flex gap-2">
        <button className="btn" onClick={() => pick(next)} disabled={done}>
          Show next
        </button>
        <button
          className="btn"
          onClick={() => {
            setPlaced([]);
            setWrong(null);
          }}
        >
          Reset
        </button>
      </div>
    </Panel>
  );
}

/* ======================= k-th largest by partitioning ======================= */

type QsFrame = { arr: number[]; lo: number; hi: number; pivotAt?: number; comps: number; msg: string; found?: number };

export function quickSelectFrames(input: number[], k: number): QsFrame[] {
  const a = [...input];
  const target = a.length - k; // k-th largest = position n − k in increasing order
  const frames: QsFrame[] = [];
  let comps = 0;
  let lo = 0;
  let hi = a.length - 1;
  frames.push({ arr: [...a], lo, hi, comps, msg: `The ${k}${['st', 'nd', 'rd'][k - 1] ?? 'th'} largest sits at position ${target} once sorted. Partition, then keep only the side that contains that position.` });
  for (;;) {
    const p = a[lo];
    const seg = a.slice(lo + 1, hi + 1);
    comps += seg.length;
    const small = seg.filter((x) => x < p);
    const big = seg.filter((x) => x >= p);
    a.splice(lo, hi - lo + 1, ...small, p, ...big);
    const s = lo + small.length;
    if (s === target) {
      frames.push({ arr: [...a], lo, hi, pivotAt: s, comps, found: s, msg: `Pivot ${p} lands at position ${s}: that is the answer, **${p}**.` });
      return frames;
    }
    const goRight = s < target;
    frames.push({ arr: [...a], lo, hi, pivotAt: s, comps, msg: `Pivot ${p} lands at position ${s}; the target ${target} is to its ${goRight ? 'right' : 'left'}, so drop the other side.` });
    if (goRight) lo = s + 1;
    else hi = s - 1;
  }
}

export function QuickSelect({ values = [9, 2, 7, 4, 12, 5, 8, 1, 10], onSolved }: { values?: number[]; onSolved?: () => void }) {
  const [k, setK] = useState(3);
  const frames = useMemo(() => quickSelectFrames(values, k), [values, k]);
  const s = useStepper(frames.length, onSolved, 1200);
  const f = frames[s.i];
  const tone = (i: number): CellTone => (i === f.found ? 'done' : i === f.pivotAt ? 'active' : i < f.lo || i > f.hi ? 'dim' : 'idle');
  return (
    <Panel>
      <ArrayRow items={f.arr.map((v) => ({ id: v, label: v }))} tone={tone} showIndex size={40} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="comparisons" value={f.comps} tone="brand" />
        <Stat label="still in play" value={Math.max(0, f.hi - f.lo + 1)} />
      </div>
      <Caption tone={f.found !== undefined ? 'ok' : 'neutral'}>{f.msg}</Caption>
      <Controls s={s} />
      <Slider label="k" value={k} min={1} max={values.length} onChange={setK} />
    </Panel>
  );
}
