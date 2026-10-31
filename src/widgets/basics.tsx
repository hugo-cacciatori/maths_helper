import { useEffect, useMemo, useState } from 'react';
import { TeX } from '../components/Prose';
import { SERIES } from './cost';
import { ArrayRow, Caption, Controls, GraphView, Panel, Slider, Stat, useStepper, type GEdge, type GNode } from './kit';

/* ======================= Scan a row with a running best ======================= */

type ScanFrame = { i: number; best: number; msg: string };

export function scanFrames(A: number[]): ScanFrame[] {
  const frames: ScanFrame[] = [{ i: 0, best: 0, msg: `Start: the best so far is the first value, A[0] = ${A[0]}.` }];
  let best = 0;
  for (let i = 1; i < A.length; i++) {
    const bigger = A[i] > A[best];
    if (bigger) best = i;
    frames.push({ i, best, msg: `Compare A[${i}] = ${A[i]} with the best so far: ${bigger ? `bigger, so the best is now ${A[i]}` : 'not bigger, keep the best'}.` });
  }
  frames.push({ i: -1, best, msg: `Done after ${A.length - 1} comparisons: the largest value is ${A[best]}, at index ${best}.` });
  return frames;
}

export function ArrayScan({ values, onSolved }: { values: number[]; onSolved?: () => void }) {
  const frames = useMemo(() => scanFrames(values), [values]);
  const s = useStepper(frames.length, onSolved, 900);
  const f = frames[s.i];
  return (
    <Panel>
      <ArrayRow
        items={values.map((v, i) => ({ id: i, label: v }))}
        showIndex
        tone={(i) => (i === f.i ? 'active' : i === f.best ? 'done' : f.i >= 0 && i > f.i ? 'dim' : 'idle')}
        pointers={[...(f.i >= 0 ? [{ at: f.i, label: 'i' }] : []), { at: f.best, label: 'best', color: 'var(--ok)' }]}
      />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="best so far" value={values[f.best]} tone="ok" />
        <Stat label="comparisons" value={f.i < 0 ? values.length - 1 : f.i} tone="brand" />
      </div>
      <Caption tone={f.i < 0 ? 'ok' : 'neutral'}>{f.msg}</Caption>
      <Controls s={s} />
    </Panel>
  );
}

/* ======================= Halving ladder ======================= */

export const halvings = (n: number) => {
  const chain = [n];
  while (chain[chain.length - 1] > 1) chain.push(Math.floor(chain[chain.length - 1] / 2));
  return chain;
};

export function HalvingLadder() {
  const [n, setN] = useState(100);
  const chain = halvings(n);
  return (
    <Panel>
      <div className="flex flex-wrap items-center gap-1.5 font-mono text-sm">
        {chain.map((v, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-muted">→</span>}
            <span className="rounded-md px-2 py-0.5 font-bold text-white" style={{ background: SERIES[i % SERIES.length] }}>
              {v}
            </span>
          </span>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="halvings to reach 1" value={chain.length - 1} tone="brand" />
        <Stat label="log₂ n" value={Math.log2(n).toFixed(2)} />
      </div>
      <Caption>
        {`Halve (dropping any half) until 1 is left. The number of halvings is $\\lfloor \\log_2 n \\rfloor$ — for $n = ${n}$, ${chain.length - 1}.`}
      </Caption>
      <Slider label="n" value={n} min={1} max={1024} onChange={setN} />
    </Panel>
  );
}

/* ======================= Gauss pairs ======================= */

export function GaussPairs() {
  const [n, setN] = useState(6);
  const cell = Math.min(26, Math.floor(300 / (n + 1)));
  const W = n * (cell + 4) + 4;
  const H = (n + 1) * cell + 8;
  return (
    <Panel>
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full" style={{ maxWidth: W * 1.6 }} role="img" aria-label={`Two staircases of ${n} columns fit into a ${n} by ${n + 1} rectangle`}>
        {Array.from({ length: n }, (_, c) => {
          const up = c + 1;
          const x = 4 + c * (cell + 4);
          return (
            <g key={c}>
              {Array.from({ length: n + 1 }, (_, r) => (
                <rect
                  key={r}
                  x={x}
                  y={4 + (n - r) * cell}
                  width={cell}
                  height={cell - 2}
                  rx={3}
                  fill={r < up ? SERIES[0] : SERIES[3]}
                  opacity={r < up ? 0.9 : 0.6}
                />
              ))}
            </g>
          );
        })}
      </svg>
      <Caption>
        <span>
          Blue: <TeX>{`1 + 2 + \\dots + ${n}`}</TeX>. Orange: the same numbers upside down. Each column holds{' '}
          <TeX>{`${n} + 1 = ${n + 1}`}</TeX> blocks, so both together make <TeX>{`${n} \\times ${n + 1}`}</TeX> and one staircase is half of it:{' '}
          <TeX>{`\\dfrac{${n} \\times ${n + 1}}{2} = ${(n * (n + 1)) / 2}`}</TeX>.
        </span>
      </Caption>
      <Slider label="n" value={n} min={2} max={12} onChange={setN} />
    </Panel>
  );
}

/* ======================= Growth table ======================= */

const SIZES = [10, 20, 50, 100, 1000, 1_000_000];
const GROWTH: { tex: string; steps: (n: number) => number }[] = [
  { tex: '\\log_2 n', steps: Math.log2 },
  { tex: 'n', steps: (n) => n },
  { tex: 'n \\log_2 n', steps: (n) => n * Math.log2(n) },
  { tex: 'n^2', steps: (n) => n * n },
  { tex: 'n^3', steps: (n) => n ** 3 },
  { tex: '2^n', steps: (n) => 2 ** n },
  { tex: 'n!', steps: (n) => { let f = 1; for (let i = 2; i <= n; i++) f *= i; return f; } },
];

/** Human time for a number of steps at one billion steps per second. */
export function humanTime(steps: number): string {
  const s = steps / 1e9;
  if (!Number.isFinite(s) || s > 1e15) return 'longer than the age of the universe';
  if (s < 1e-6) return 'instant';
  if (s < 1e-3) return `${Math.round(s * 1e6)} µs`;
  if (s < 1) return `${Math.round(s * 1e3)} ms`;
  if (s < 60) return `${Math.round(s)} s`;
  if (s < 3600) return `${Math.round(s / 60)} min`;
  if (s < 86400) return `${Math.round(s / 3600)} h`;
  if (s < 3.15e7) return `${Math.round(s / 86400)} days`;
  const y = s / 3.15e7;
  return y < 1e4 ? `${Math.round(y).toLocaleString('en')} years` : `${y.toExponential(0).replace(/e\+(\d+)/, ' × 10^$1')} years`;
}

export function GrowthTable() {
  const [k, setK] = useState(2);
  const n = SIZES[k];
  return (
    <Panel>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-muted">
              <th className="py-1.5 pr-3 font-semibold">cost</th>
              <th className="py-1.5 pr-3 text-right font-semibold">steps</th>
              <th className="py-1.5 text-right font-semibold">time</th>
            </tr>
          </thead>
          <tbody>
            {GROWTH.map((g) => {
              const st = g.steps(n);
              const slow = st / 1e9 > 60;
              return (
                <tr key={g.tex} className="border-t border-border">
                  <td className="py-1.5 pr-3"><TeX>{g.tex}</TeX></td>
                  <td className="py-1.5 pr-3 text-right font-mono">{st < 1e15 ? Math.round(st).toLocaleString('en') : st.toExponential(1)}</td>
                  <td className={`py-1.5 text-right font-semibold ${slow ? 'text-bad' : 'text-ok'}`}>{humanTime(st)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Caption>A computer doing one billion steps per second. Move the slider: which rows stay fast?</Caption>
      <Slider label="n" value={k} min={0} max={SIZES.length - 1} onChange={setK} format={(i) => SIZES[i].toLocaleString('en')} />
    </Panel>
  );
}

/* ======================= Click the neighbours ======================= */

export function NeighbourPicker({ nodes, edges, target, onSolved }: { nodes: GNode[]; edges: GEdge[]; target: string; onSolved?: () => void }) {
  const want = useMemo(
    () => new Set(edges.flatMap((e) => (e.u === target ? [e.v] : e.v === target && !e.directed ? [e.u] : []))),
    [edges, target],
  );
  const [picked, setPicked] = useState<string[]>([]);
  const done = picked.length === want.size && picked.every((p) => want.has(p));
  useEffect(() => {
    if (done) onSolved?.();
  }, [done, onSolved]);
  const toggle = (id: string) => id !== target && setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  return (
    <Panel>
      <GraphView
        nodes={nodes}
        edges={edges}
        width={360}
        height={200}
        fill={(id) => (id === target ? 'active' : picked.includes(id) ? (want.has(id) ? 'done' : 'bad') : 'idle')}
        edgeTone={(e) => (done && (e.u === target || e.v === target) ? 'active' : 'idle')}
        onNodeClick={toggle}
      />
      <Caption tone={done ? 'ok' : 'neutral'}>
        {done
          ? `Yes: ${target} has ${want.size} neighbours, so its degree is ${want.size}.`
          : `Click every vertex joined to **${target}** by an edge (click again to unselect). Selected: ${picked.join(', ') || 'none'}.`}
      </Caption>
    </Panel>
  );
}

/* ======================= Yes/no switches ======================= */

/** One switch per item: each pattern of switches is one subset. In binary mode the switches are the bits of a number. */
export function SubsetSwitches({ items, binary = false }: { items: string[]; binary?: boolean }) {
  const [on, setOn] = useState<boolean[]>(() => items.map(() => false));
  const value = on.reduce((acc, b, i) => acc + (b ? 2 ** (items.length - 1 - i) : 0), 0);
  const chosen = items.filter((_, i) => on[i]);
  return (
    <Panel>
      <div className="flex flex-wrap justify-center gap-2">
        {items.map((it, i) => (
          <button
            key={it}
            onClick={() => setOn((o) => o.map((b, j) => (j === i ? !b : b)))}
            className={`btn min-w-16 flex-col !gap-0.5 ${on[i] ? '!border-brand !bg-brand !text-on-brand' : ''}`}
            aria-pressed={on[i]}
          >
            <span className="font-mono text-lg font-bold">{binary ? (on[i] ? 1 : 0) : it}</span>
            <span className="text-[11px] opacity-80">{binary ? it : on[i] ? 'yes' : 'no'}</span>
          </button>
        ))}
      </div>
      <Caption>
        {binary
          ? `Switches ${on.map((b) => (b ? 1 : 0)).join('')} in binary = ${chosen.length ? chosen.join(' + ') : '0'} = **${value}**. With ${items.length} switches you can write every number from 0 to ${2 ** items.length - 1}: ${2 ** items.length} patterns.`
          : `Chosen: {${chosen.join(', ')}}. Each of the ${items.length} switches has 2 positions: $2^{${items.length}} = ${2 ** items.length}$ different patterns, one per subset (all off is the empty set).`}
      </Caption>
    </Panel>
  );
}

/* ======================= Stack and queue ======================= */

export function StackQueue({ onSolved }: { onSolved?: () => void }) {
  const [next, setNext] = useState(0);
  const [stack, setStack] = useState<string[]>([]);
  const [queue, setQueue] = useState<string[]>([]);
  const [out, setOut] = useState<{ s: string; q: string }[]>([]);
  useEffect(() => {
    if (out.length >= 3) onSolved?.();
  }, [out.length, onSolved]);
  const add = () => {
    const x = String.fromCharCode(65 + (next % 26));
    setNext(next + 1);
    setStack((s) => [...s, x]);
    setQueue((q) => [...q, x]);
  };
  const remove = () => {
    if (!stack.length) return;
    setOut((o) => [...o, { s: stack[stack.length - 1], q: queue[0] }]);
    setStack((s) => s.slice(0, -1));
    setQueue((q) => q.slice(1));
  };
  const col = (title: string, xs: string[], hint: string) => (
    <div className="flex-1 rounded-xl border border-border p-3">
      <div className="text-xs font-bold uppercase tracking-wide text-muted">{title}</div>
      <div className="text-[11px] text-muted">{hint}</div>
      <div className="mt-2 min-h-12">
        <ArrayRow items={xs.map((x) => ({ id: x + title, label: x }))} size={38} tone={(i) => (i === (title === 'Stack' ? xs.length - 1 : 0) ? 'active' : 'idle')} />
      </div>
    </div>
  );
  return (
    <Panel>
      <div className="flex flex-wrap gap-2">
        <button className="btn-primary" onClick={add}>Add {String.fromCharCode(65 + (next % 26))}</button>
        <button className="btn" onClick={remove} disabled={!stack.length}>Take one out</button>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        {col('Stack', stack, 'takes out the newest (highlighted, right end)')}
        {col('Queue', queue, 'takes out the oldest (highlighted, left end)')}
      </div>
      <Caption tone={out.length >= 3 ? 'ok' : 'neutral'}>
        {out.length
          ? `Taken out — stack: ${out.map((o) => o.s).join(' ')} · queue: ${out.map((o) => o.q).join(' ')}`
          : 'Add a few letters, then take some out and compare the two.'}
      </Caption>
    </Panel>
  );
}

/* ======================= Guess my number ======================= */

export function GuessNumber({ max = 100, onSolved }: { max?: number; onSolved?: () => void }) {
  const [secret, setSecret] = useState(() => 1 + Math.floor(Math.random() * max));
  const [lo, setLo] = useState(1);
  const [hi, setHi] = useState(max);
  const [guess, setGuess] = useState('');
  const [log, setLog] = useState<string[]>([]);
  const [won, setWon] = useState(false);
  const best = Math.ceil(Math.log2(max + 1));
  useEffect(() => {
    if (won) onSolved?.();
  }, [won, onSolved]);
  const submit = () => {
    const g = Number(guess);
    if (!Number.isInteger(g) || g < 1 || g > max || won) return;
    setGuess('');
    if (g === secret) {
      setWon(true);
      setLog((l) => [...l, `${g}: found it!`]);
    } else if (g < secret) {
      setLo((x) => Math.max(x, g + 1));
      setLog((l) => [...l, `${g}: too small`]);
    } else {
      setHi((x) => Math.min(x, g - 1));
      setLog((l) => [...l, `${g}: too big`]);
    }
  };
  const restart = () => {
    setSecret(1 + Math.floor(Math.random() * max));
    setLo(1);
    setHi(max);
    setLog([]);
    setWon(false);
  };
  return (
    <Panel>
      <div className="relative h-8 overflow-hidden rounded-lg bg-surface-2" aria-label={`Still possible: ${lo} to ${hi}`}>
        <div
          className="absolute inset-y-0 bg-brand/70 transition-all"
          style={{ left: `${((lo - 1) / max) * 100}%`, width: `${((hi - lo + 1) / max) * 100}%` }}
        />
        <div className="relative flex h-full items-center justify-center text-sm font-bold">
          still possible: {lo} … {hi} ({hi - lo + 1} numbers)
        </div>
      </div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <input
          type="number"
          inputMode="numeric"
          min={1}
          max={max}
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          disabled={won}
          aria-label="Your guess"
          className="w-28 rounded-xl border border-border bg-surface px-3 py-2 font-mono"
        />
        <button className="btn-primary" type="submit" disabled={won}>Guess</button>
        <button className="btn ml-auto" type="button" onClick={restart}>New number</button>
      </form>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="guesses" value={log.length} tone="brand" />
        <Stat label="middle of what is left" value={Math.floor((lo + hi) / 2)} />
      </div>
      <Caption tone={won ? (log.length <= best ? 'ok' : 'warn') : 'neutral'}>
        {won
          ? log.length <= best
            ? `Found in ${log.length} guesses — within the ${best} that always suffice when you guess the middle.`
            : `Found in ${log.length} guesses. Guessing the middle each time never needs more than ${best}: try again with a new number.`
          : log.length
            ? log.join(' · ')
            : `I picked a whole number from 1 to ${max}. After each guess I say "too small" or "too big".`}
      </Caption>
    </Panel>
  );
}

/* ======================= Levels of splitting ======================= */

export function SplitLevels() {
  const [k, setK] = useState(3);
  const n = 2 ** k;
  const W = 480;
  return (
    <Panel>
      <svg viewBox={`0 0 ${W} ${(k + 1) * 34 + 4}`} className="w-full" role="img" aria-label={`${k + 1} levels of pieces for n = ${n}`}>
        {Array.from({ length: k + 1 }, (_, lvl) => {
          const parts = 2 ** lvl;
          const w = (W - 70) / parts;
          return (
            <g key={lvl}>
              <text x={0} y={lvl * 34 + 24} fontSize={12} fontWeight={700} fill="var(--muted)">
                level {lvl}
              </text>
              {Array.from({ length: parts }, (_, p) => (
                <g key={p}>
                  <rect x={66 + p * w} y={lvl * 34 + 6} width={Math.max(w - 3, 1)} height={26} rx={4} fill={SERIES[lvl % SERIES.length]} opacity={0.85} />
                  {w > 18 && (
                    <text x={66 + p * w + (w - 3) / 2} y={lvl * 34 + 24} textAnchor="middle" fontSize={11} fontWeight={700} fill="#fff">
                      {n / parts}
                    </text>
                  )}
                </g>
              ))}
            </g>
          );
        })}
      </svg>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="levels below the top" value={k} />
        <Stat label="work per level" value={n} />
        <Stat label="total" value={n * k} tone="brand" />
      </div>
      <Caption>{`Every level holds all ${n} items, cut into smaller pieces. Halving ${n} down to 1 takes $\\log_2 ${n} = ${k}$ levels, so handling every level costs $n \\log_2 n = ${n} \\times ${k} = ${n * k}$.`}</Caption>
      <Slider label="n" value={k} min={1} max={6} onChange={setK} format={(v) => String(2 ** v)} />
    </Panel>
  );
}
