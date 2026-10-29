import { useMemo, useState } from 'react';
import { ArrayRow, Caption, Controls, Panel, Stat, TreeView, useStepper, type CellTone, type TNode } from './kit';

/* ======================= Heaps ======================= */

type HeapFrame = { arr: number[]; hot: number[]; sorted: number; msg: string; swaps: number };

/** Array (1-based heap positions shown) → binary tree, using values as ids (keys are distinct). */
function heapTree(arr: number[], size: number, i = 0): TNode | null {
  if (i >= size) return null;
  return { id: String(arr[i]), label: String(arr[i]), left: heapTree(arr, size, 2 * i + 1), right: heapTree(arr, size, 2 * i + 2) };
}

export function heapFrames(input: number[], mode: 'bottom-up' | 'top-down' | 'heapsort'): HeapFrame[] {
  const A = [...input];
  const frames: HeapFrame[] = [];
  let swaps = 0;
  let sorted = 0;
  const snap = (msg: string, hot: number[] = []) => frames.push({ arr: [...A], hot, sorted, msg, swaps });
  const siftDown = (k: number, n: number) => {
    for (;;) {
      const l = 2 * k + 1;
      if (l >= n) return;
      const c = l + 1 < n && A[l + 1] > A[l] ? l + 1 : l;
      if (A[k] >= A[c]) {
        snap(`${A[k]} ≥ its larger child ${A[c]}: parental dominance holds.`, [k, c]);
        return;
      }
      snap(`${A[k]} < its larger child ${A[c]}: swap them.`, [k, c]);
      [A[k], A[c]] = [A[c], A[k]];
      swaps++;
      snap('Swapped.', [c]);
      k = c;
    }
  };
  if (mode === 'top-down') {
    const n = A.length;
    const vals = [...A];
    A.length = 0;
    snap('Top-down: insert the keys one at a time, each at the next free leaf, then sift it up.');
    for (let t = 0; t < n; t++) {
      A.push(vals[t]);
      let k = t;
      snap(`Insert ${vals[t]} at the next free position.`, [k]);
      while (k > 0) {
        const p = Math.floor((k - 1) / 2);
        if (A[p] >= A[k]) {
          snap(`${A[k]} ≤ parent ${A[p]}: stop.`, [k, p]);
          break;
        }
        snap(`${A[k]} > parent ${A[p]}: swap up.`, [k, p]);
        [A[p], A[k]] = [A[k], A[p]];
        swaps++;
        k = p;
      }
    }
    snap(`Heap built by insertions: ${A.join(' ')}.`);
    return frames;
  }
  snap(mode === 'heapsort' ? 'Stage 1: build a heap bottom-up.' : 'Bottom-up: fix every parental node, from the last one back to the root.');
  for (let k = Math.floor(A.length / 2) - 1; k >= 0; k--) {
    snap(`Check parental node ${A[k]} (position ${k + 1}).`, [k]);
    siftDown(k, A.length);
  }
  snap(`Heap: ${A.join(' ')}.`);
  if (mode === 'heapsort') {
    for (let n = A.length - 1; n > 0; n--) {
      snap(`Stage 2: the root ${A[0]} is the maximum — swap it with the last heap element ${A[n]}.`, [0, n]);
      [A[0], A[n]] = [A[n], A[0]];
      swaps++;
      sorted++;
      snap(`${A[n]} is in its final place. Restore the heap on the first ${n} elements.`, [0]);
      siftDown(0, n);
    }
    sorted = A.length;
    snap(`Sorted: ${A.join(' ')}.`);
  }
  return frames;
}

export function HeapViz({ input, mode, onSolved }: { input: number[]; mode: 'bottom-up' | 'top-down' | 'heapsort'; onSolved?: () => void }) {
  const frames = useMemo(() => heapFrames(input, mode), [input, mode]);
  const s = useStepper(frames.length, onSolved, 850);
  const f = frames[s.i];
  const heapSize = f.arr.length - f.sorted;
  const tone = (k: number): CellTone => (k >= heapSize ? 'done' : f.hot.includes(k) ? 'active' : 'idle');
  return (
    <Panel>
      <TreeView
        root={heapTree(f.arr, heapSize)}
        colW={46}
        rowH={56}
        minWidth={300}
        fill={(id) => {
          const k = f.arr.indexOf(Number(id));
          return f.hot.includes(k) ? 'active' : 'idle';
        }}
      />
      <ArrayRow items={f.arr.map((v) => ({ id: v, label: v }))} tone={tone} showIndex indexBase={1} size={40} />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="swaps" value={f.swaps} tone="brand" />
        <Stat label={mode === 'heapsort' ? 'sorted' : 'size'} value={mode === 'heapsort' ? f.sorted : f.arr.length} />
      </div>
      <Caption>{f.msg}</Caption>
      <Controls s={s} />
    </Panel>
  );
}

/* ======================= AVL trees ======================= */

type AvlNode = { key: number | string; left: AvlNode | null; right: AvlNode | null };

const h = (n: AvlNode | null): number => (n ? 1 + Math.max(h(n.left), h(n.right)) : -1);
const bf = (n: AvlNode) => h(n.left) - h(n.right);
const clone = (n: AvlNode | null): AvlNode | null => (n ? { key: n.key, left: clone(n.left), right: clone(n.right) } : null);
export const toTNode = (n: AvlNode | null): TNode | null => (n ? { id: String(n.key), label: String(n.key), left: toTNode(n.left), right: toTNode(n.right) } : null);

function rotR(n: AvlNode): AvlNode {
  const l = n.left!;
  n.left = l.right;
  l.right = n;
  return l;
}
function rotL(n: AvlNode): AvlNode {
  const r = n.right!;
  n.right = r.left;
  r.left = n;
  return r;
}

type AvlFrame = { root: AvlNode | null; hot?: string; fresh?: string; msg: string; rotations: number };

export function avlFrames(keys: (number | string)[]): AvlFrame[] {
  let root: AvlNode | null = null;
  let rotations = 0;
  const frames: AvlFrame[] = [{ root: null, msg: 'Start with an empty tree.', rotations: 0 }];
  const cmp = (a: number | string, b: number | string) => (a < b ? -1 : a > b ? 1 : 0);
  for (const key of keys) {
    // 1. plain BST insertion, remembering the path
    const path: AvlNode[] = [];
    const node: AvlNode = { key, left: null, right: null };
    if (!root) root = node;
    else {
      let cur = root;
      for (;;) {
        path.push(cur);
        const side = cmp(key, cur.key) < 0 ? 'left' : 'right';
        if (!cur[side]) {
          cur[side] = node;
          break;
        }
        cur = cur[side]!;
      }
    }
    frames.push({ root: clone(root), fresh: String(key), msg: `Insert ${key} as in a binary search tree.`, rotations });
    // 2. deepest unbalanced ancestor
    let idx = -1;
    for (let k = path.length - 1; k >= 0; k--)
      if (Math.abs(bf(path[k])) > 1) {
        idx = k;
        break;
      }
    if (idx < 0) continue;
    const bad = path[idx];
    const b = bf(bad);
    const kind = b > 1 ? (cmp(key, bad.left!.key) < 0 ? 'R' : 'LR') : cmp(key, bad.right!.key) > 0 ? 'L' : 'RL';
    const name = { R: 'single right rotation (R)', L: 'single left rotation (L)', LR: 'double left-right rotation (LR)', RL: 'double right-left rotation (RL)' }[kind];
    frames.push({ root: clone(root), hot: String(bad.key), fresh: String(key), msg: `Node ${bad.key} has balance factor ${b > 0 ? '+' : ''}${b}: apply a ${name} at ${bad.key}.`, rotations });
    let sub: AvlNode;
    if (kind === 'R') sub = rotR(bad);
    else if (kind === 'L') sub = rotL(bad);
    else if (kind === 'LR') {
      bad.left = rotL(bad.left!);
      sub = rotR(bad);
    } else {
      bad.right = rotR(bad.right!);
      sub = rotL(bad);
    }
    rotations++;
    if (idx === 0) root = sub;
    else {
      const parent = path[idx - 1];
      if (parent.left === bad) parent.left = sub;
      else parent.right = sub;
    }
    frames.push({ root: clone(root), hot: String(sub.key), msg: `After the rotation the tree is balanced again.`, rotations });
  }
  frames.push({ root: clone(root), msg: `Done: height ${h(root)}, ${rotations} rotation${rotations === 1 ? '' : 's'}.`, rotations });
  return frames;
}

function balanceMap(n: AvlNode | null, out: Record<string, number> = {}) {
  if (!n) return out;
  out[String(n.key)] = bf(n);
  balanceMap(n.left, out);
  balanceMap(n.right, out);
  return out;
}

export function AvlBuilder({ keys, onSolved }: { keys: (number | string)[]; onSolved?: () => void }) {
  const frames = useMemo(() => avlFrames(keys), [keys]);
  const s = useStepper(frames.length, onSolved, 1100);
  const f = frames[s.i];
  const bal = balanceMap(f.root);
  return (
    <Panel>
      <div className="flex flex-wrap items-center gap-1 font-mono text-sm">
        <span className="mr-1 font-sans text-xs font-semibold text-muted">insert:</span>
        {keys.map((k, i) => {
          const inserted = frames.slice(0, s.i + 1).some((fr) => fr.fresh === String(k));
          return (
            <span key={i} className={`rounded px-1.5 py-0.5 ${inserted ? 'bg-v-done text-white' : 'bg-surface-2 text-muted'}`}>
              {k}
            </span>
          );
        })}
      </div>
      <div className="min-h-48">
        <TreeView
          root={toTNode(f.root)}
          colW={50}
          rowH={60}
          minWidth={320}
          fill={(id) => (id === f.hot ? (Math.abs(bal[id]) > 1 ? 'bad' : 'active') : id === f.fresh ? 'visit' : 'idle')}
          badge={(id) => (bal[id] > 0 ? `+${bal[id]}` : String(bal[id]))}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="rotations" value={f.rotations} tone="brand" />
        <Stat label="height" value={h(f.root)} />
      </div>
      <Caption>{f.msg}</Caption>
      <Controls s={s} />
      <p className="text-xs text-muted">Small numbers: balance factor = height(left) − height(right). AVL requires −1, 0 or +1 everywhere.</p>
    </Panel>
  );
}

/* Three candidate trees for the AVL check */
const n = (key: number, left: AvlNode | null = null, right: AvlNode | null = null): AvlNode => ({ key, left, right });
export const AVL_CANDIDATES: AvlNode[] = [
  n(5, n(3, n(2)), n(6, null, n(8))),
  n(5, n(4, n(2, n(1), n(3))), n(6, null, n(8, n(7), n(9)))),
  n(5, n(3, n(1), n(2)), n(6, n(7), n(9))),
];

function bstViolations(t: AvlNode | null, lo = -Infinity, hi = Infinity, out: string[] = []) {
  if (!t) return out;
  if (!((t.key as number) > lo && (t.key as number) < hi)) out.push(String(t.key));
  bstViolations(t.left, lo, Math.min(hi, t.key as number), out);
  bstViolations(t.right, Math.max(lo, t.key as number), hi, out);
  return out;
}

export function AvlCheck() {
  const [showBf, setShowBf] = useState(false);
  const [showBst, setShowBst] = useState(false);
  return (
    <Panel>
      <div className="grid gap-3 sm:grid-cols-3">
        {AVL_CANDIDATES.map((t, i) => {
          const bal = balanceMap(t);
          const bad = bstViolations(t);
          return (
            <div key={i} className="rounded-xl bg-surface-2 p-2">
              <TreeView
                root={toTNode(t)}
                r={15}
                colW={34}
                rowH={48}
                fill={(id) => (showBst && bad.includes(id) ? 'bad' : showBf && Math.abs(bal[id]) > 1 ? 'active' : 'idle')}
                badge={showBf ? (id) => (bal[id] > 0 ? `+${bal[id]}` : String(bal[id])) : undefined}
              />
              <div className="text-center text-sm font-bold text-muted">({String.fromCharCode(97 + i)})</div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-4 text-sm font-semibold text-muted">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={showBf} onChange={(e) => setShowBf(e.target.checked)} className="accent-[var(--brand)]" />
          show balance factors (orange = unbalanced)
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={showBst} onChange={(e) => setShowBst(e.target.checked)} className="accent-[var(--brand)]" />
          check search-tree order (red = misplaced)
        </label>
      </div>
    </Panel>
  );
}

/* ======================= Binary tasting code ======================= */

export function WineDecoder({ onSolved, tasters = 10 }: { onSolved?: () => void; tasters?: number }) {
  const [barrel, setBarrel] = useState(613);
  const [revealed, setRevealed] = useState(false);
  const bits = Array.from({ length: tasters }, (_, i) => (barrel >> (tasters - 1 - i)) & 1);
  const max = 2 ** tasters - 1;
  return (
    <Panel>
      <label className="flex flex-wrap items-center gap-3 text-sm">
        <span className="font-semibold text-muted">The poisoned barrel is number</span>
        <input
          type="number"
          min={0}
          max={Math.min(999, max)}
          value={barrel}
          onChange={(e) => {
            setBarrel(Math.max(0, Math.min(Math.min(999, max), Number(e.target.value) || 0)));
            setRevealed(false);
          }}
          className="w-24 rounded-lg border-2 border-border bg-surface px-2 py-1 font-mono"
        />
        <span className="text-muted">(barrels 0 to 999)</span>
      </label>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
        {bits.map((b, i) => {
          const dies = revealed && b === 1;
          return (
            <div key={i} className="flex flex-col items-center gap-1 rounded-xl bg-surface-2 py-2">
              <div className="text-[10px] font-semibold text-muted">taster {i + 1}</div>
              <div className={`flex h-9 w-9 items-center justify-center rounded-full text-lg transition ${dies ? 'bg-bad text-white' : revealed ? 'bg-ok-soft text-ok' : 'bg-surface'}`}>
                {dies ? '✝' : revealed ? '✓' : '?'}
              </div>
              <div className="font-mono text-sm font-bold" style={{ color: b ? 'var(--brand)' : 'var(--muted)' }}>
                {revealed ? b : '·'}
              </div>
            </div>
          );
        })}
      </div>
      <Caption tone={revealed ? 'ok' : 'neutral'}>
        {revealed
          ? `30 days later: read dead = 1, alive = 0 → ${bits.join('')} in binary = **${barrel}**. Found with a single round of tasting.`
          : `Taster $i$ drinks a drop from every barrel whose number has a 1 in binary position $i$. Barrel ${barrel} = ${bits.join('')}₂.`}
      </Caption>
      <button
        className="btn-primary self-start"
        onClick={() => {
          setRevealed(true);
          onSolved?.();
        }}
        disabled={revealed}
      >
        Wait 30 days
      </button>
    </Panel>
  );
}
