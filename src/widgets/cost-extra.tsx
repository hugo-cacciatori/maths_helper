import { motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { TeX } from '../components/Prose';
import { Caption, Controls, Panel, Slider, Stat, useStepper } from './kit';

/* ======================= Call chain (linear recursion) ======================= */

export type ChainSpec = {
  label: (k: number) => string;
  base: number;
  baseValue: number;
  combine: (k: number, sub: number) => { value: number; ops: number; note: string };
};

type ChainFrame = { depth: number; values: Record<number, number>; active: number; ops: number; msg: string };

export function chainFrames(spec: ChainSpec, n: number): ChainFrame[] {
  const frames: ChainFrame[] = [];
  const values: Record<number, number> = {};
  let ops = 0;
  for (let k = n; k >= spec.base; k--)
    frames.push({ depth: n - k + 1, values: { ...values }, active: k, ops, msg: k === n ? `Call ${spec.label(k)}.` : `It needs ${spec.label(k)} first: a new call.` });
  values[spec.base] = spec.baseValue;
  frames.push({ depth: n - spec.base + 1, values: { ...values }, active: spec.base, ops, msg: `${spec.label(spec.base)} is the base case: it returns ${spec.baseValue}.` });
  let sub = spec.baseValue;
  for (let k = spec.base + 1; k <= n; k++) {
    const r = spec.combine(k, sub);
    ops += r.ops;
    values[k] = r.value;
    sub = r.value;
    frames.push({ depth: n - k + 1, values: { ...values }, active: k, ops, msg: r.note });
  }
  return frames;
}

export function CallChain({ spec, initialN = 4, maxN = 7, opName, onSolved }: { spec: ChainSpec; initialN?: number; maxN?: number; opName: string; onSolved?: () => void }) {
  const [n, setN] = useState(initialN);
  const frames = useMemo(() => chainFrames(spec, n), [spec, n]);
  const s = useStepper(frames.length, onSolved, 700);
  const f = frames[s.i];
  const levels = Array.from({ length: n - spec.base + 1 }, (_, i) => n - i);
  return (
    <Panel>
      <div className="flex flex-col items-start gap-1.5" role="img" aria-label={`Call stack, ${f.depth} calls open`}>
        {levels.map((k, i) => {
          const open = i < f.depth;
          const returned = f.values[k] !== undefined;
          const active = k === f.active;
          return (
            <motion.div
              key={k}
              animate={{ opacity: open ? 1 : 0.15, x: i * 18 }}
              className="flex items-center gap-3 rounded-lg border-2 px-3 py-1.5 font-mono text-sm"
              style={{
                borderColor: active ? 'var(--v-active)' : 'var(--border)',
                background: returned ? 'color-mix(in srgb, var(--v-done) 18%, var(--surface))' : 'var(--surface)',
              }}
            >
              <span className="font-bold">{spec.label(k)}</span>
              <span className="text-muted">{returned ? `→ ${f.values[k]}` : open ? 'waiting…' : ''}</span>
            </motion.div>
          );
        })}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Stat label={opName} value={f.ops} tone="brand" />
        <Stat label="calls open" value={f.depth} />
      </div>
      <Caption>{f.msg}</Caption>
      <Controls s={s} />
      <Slider label="n" value={n} min={spec.base + 1} max={maxN} onChange={setN} />
    </Panel>
  );
}

/* ======================= Who knows whom? ======================= */

const NAMES = ['Ana', 'Ben', 'Cy', 'Dee', 'Eli', 'Fay'];
/** knows[i][j]: does i know j? Dee (3) is known by all and knows nobody. */
const KNOWS = [
  [0, 1, 0, 1, 0, 0],
  [1, 0, 1, 1, 0, 1],
  [0, 0, 0, 1, 1, 0],
  [0, 0, 0, 0, 0, 0],
  [1, 0, 0, 1, 0, 1],
  [0, 1, 0, 1, 1, 0],
];

type CelebFrame = { cand: number; ruledOut: number[]; asked: [number, number, boolean] | null; questions: number; phase: 'elim' | 'verify' | 'done'; msg: string; verdict?: boolean };

export function celebrityFrames(knows: number[][]): CelebFrame[] {
  const n = knows.length;
  const frames: CelebFrame[] = [];
  let cand = 0;
  let questions = 0;
  const ruledOut: number[] = [];
  frames.push({ cand, ruledOut: [], asked: null, questions, phase: 'elim', msg: `Start with ${NAMES[0]} as the candidate.` });
  for (let i = 1; i < n; i++) {
    const yes = knows[cand][i] === 1;
    questions++;
    if (yes) {
      ruledOut.push(cand);
      frames.push({ cand: i, ruledOut: [...ruledOut], asked: [cand, i, yes], questions, phase: 'elim', msg: `${NAMES[cand]} knows ${NAMES[i]} → ${NAMES[cand]} can't be the celebrity. New candidate: ${NAMES[i]}.` });
      cand = i;
    } else {
      ruledOut.push(i);
      frames.push({ cand, ruledOut: [...ruledOut], asked: [cand, i, yes], questions, phase: 'elim', msg: `${NAMES[cand]} doesn't know ${NAMES[i]} → ${NAMES[i]} can't be the celebrity (not known by everyone).` });
    }
  }
  frames.push({ cand, ruledOut: [...ruledOut], asked: null, questions, phase: 'verify', msg: `One question per person ruled out everyone but ${NAMES[cand]}. Now check ${NAMES[cand]} really is a celebrity.` });
  for (let j = 0; j < n; j++) {
    if (j === cand) continue;
    questions++;
    if (knows[cand][j]) {
      frames.push({ cand, ruledOut: [...ruledOut], asked: [cand, j, true], questions, phase: 'done', verdict: false, msg: `${NAMES[cand]} knows ${NAMES[j]}: there is no celebrity in this group.` });
      return frames;
    }
    questions++;
    if (!knows[j][cand]) {
      frames.push({ cand, ruledOut: [...ruledOut], asked: [j, cand, false], questions, phase: 'done', verdict: false, msg: `${NAMES[j]} doesn't know ${NAMES[cand]}: there is no celebrity in this group.` });
      return frames;
    }
    frames.push({ cand, ruledOut: [...ruledOut], asked: [j, cand, true], questions, phase: 'verify', msg: `${NAMES[cand]} doesn't know ${NAMES[j]}, and ${NAMES[j]} knows ${NAMES[cand]}. ✓` });
  }
  frames.push({ cand, ruledOut: [...ruledOut], asked: null, questions, phase: 'done', verdict: true, msg: `${NAMES[cand]} is the celebrity, found with ${questions} questions.` });
  return frames;
}

export function CelebrityFinder({ onSolved }: { onSolved?: () => void }) {
  const [noCeleb, setNoCeleb] = useState(false);
  const knows = useMemo(() => {
    const k = KNOWS.map((r) => [...r]);
    if (noCeleb) k[3][4] = 1; // Dee now knows Eli: nobody is a celebrity any more
    return k;
  }, [noCeleb]);
  const frames = useMemo(() => celebrityFrames(knows), [knows]);
  const s = useStepper(frames.length, onSolved, 1000);
  const f = frames[s.i];
  const R = 110;
  const C = 150;
  const pos = NAMES.map((_, i) => {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / NAMES.length;
    return { x: C + R * Math.cos(a), y: C - 10 + R * Math.sin(a) };
  });
  return (
    <Panel>
      <svg viewBox="0 0 300 290" className="mx-auto w-full max-w-xs" role="img" aria-label={`Candidate: ${NAMES[f.cand]}`}>
        <defs>
          <marker id="knows-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--v-active)" />
          </marker>
        </defs>
        {f.asked &&
          (() => {
            const [a, b, yes] = f.asked;
            const A = pos[a];
            const B = pos[b];
            const d = Math.hypot(B.x - A.x, B.y - A.y);
            const ux = (B.x - A.x) / d;
            const uy = (B.y - A.y) / d;
            return (
              <g>
                <line x1={A.x + ux * 24} y1={A.y + uy * 24} x2={B.x - ux * 28} y2={B.y - uy * 28} stroke="var(--v-active)" strokeWidth={3} strokeDasharray={yes ? undefined : '6 5'} markerEnd="url(#knows-arrow)" />
                <text x={(A.x + B.x) / 2 - uy * 16} y={(A.y + B.y) / 2 + ux * 16 + 4} textAnchor="middle" fontSize={12} fontWeight={800} fill="var(--v-active)">
                  {yes ? 'knows' : "doesn't know"}
                </text>
              </g>
            );
          })()}
        {NAMES.map((name, i) => {
          const out = f.ruledOut.includes(i);
          const isCand = i === f.cand;
          const fill = isCand ? (f.verdict === false ? 'var(--bad)' : f.verdict ? 'var(--v-done)' : 'var(--v-visit)') : out ? 'var(--v-dim)' : 'var(--v-idle)';
          return (
            <g key={name}>
              <circle cx={pos[i].x} cy={pos[i].y} r={22} fill={fill} stroke={isCand || out ? 'transparent' : 'var(--v-idle-stroke)'} strokeWidth={2} />
              <text x={pos[i].x} y={pos[i].y + 4.5} textAnchor="middle" fontSize={12.5} fontWeight={700} fill={isCand ? '#fff' : out ? 'var(--muted)' : 'var(--v-ink)'}>
                {name}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="questions" value={f.questions} tone="brand" />
        <Stat label="phase" value={f.phase === 'elim' ? 'eliminate' : f.phase === 'verify' ? 'verify' : 'done'} />
      </div>
      <Caption tone={f.verdict ? 'ok' : f.verdict === false ? 'warn' : 'neutral'}>{f.msg}</Caption>
      <Controls
        s={s}
        extra={
          <label className="inline-flex items-center gap-1.5">
            <input type="checkbox" checked={noCeleb} onChange={(e) => setNoCeleb(e.target.checked)} className="accent-[var(--brand)]" />
            group without a celebrity
          </label>
        }
      />
    </Panel>
  );
}

/* ======================= Grill with two slots ======================= */

/** Minutes taken by the "two together, then recurse on n − 2" plan. */
export const pairPlanMinutes = (n: number): number => (n <= 0 ? 0 : n <= 2 ? 2 : 2 + pairPlanMinutes(n - 2));
export const bestMinutes = (n: number) => (n <= 0 ? 0 : n === 1 ? 2 : n);

export function GrillSim({ initialN = 3, onSolved }: { initialN?: number; onSolved?: () => void }) {
  const [n, setN] = useState(initialN);
  const [faces, setFaces] = useState<number[]>(() => Array(initialN).fill(0));
  const [sel, setSel] = useState<number[]>([]);
  const [minutes, setMinutes] = useState(0);
  const done = faces.every((x) => x === 2);
  const best = bestMinutes(n);
  useEffect(() => {
    if (done && minutes === best) onSolved?.();
  }, [done, minutes, best, onSolved]);
  const reset = (m = n) => {
    setN(m);
    setFaces(Array(m).fill(0));
    setSel([]);
    setMinutes(0);
  };
  const toggle = (i: number) => {
    if (faces[i] === 2) return;
    setSel((s) => (s.includes(i) ? s.filter((x) => x !== i) : s.length < 2 ? [...s, i] : s));
  };
  const cook = () => {
    setFaces((f) => f.map((x, i) => (sel.includes(i) ? x + 1 : x)));
    setSel([]);
    setMinutes((m) => m + 1);
  };
  return (
    <Panel>
      <div className="flex flex-wrap justify-center gap-3 py-2">
        {faces.map((x, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            disabled={x === 2 || done}
            aria-label={`Burger ${i + 1}, ${x} of 2 sides cooked${sel.includes(i) ? ', on the grill' : ''}`}
            className="flex flex-col items-center gap-1"
          >
            <svg width="62" height="62" viewBox="0 0 62 62">
              <circle cx="31" cy="31" r="27" fill="none" stroke={sel.includes(i) ? 'var(--v-active)' : 'transparent'} strokeWidth="4" />
              <path d="M8,31 A23,23 0 0 1 54,31 Z" fill={x >= 1 ? '#7c4a2d' : '#e7a17a'} />
              <path d="M8,31 A23,23 0 0 0 54,31 Z" fill={x >= 2 ? '#7c4a2d' : '#e7a17a'} />
              <line x1="8" y1="31" x2="54" y2="31" stroke="var(--surface)" strokeWidth="2" />
            </svg>
            <span className="text-[11px] font-bold text-muted">#{i + 1}</span>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="minutes" value={minutes} tone="brand" />
        <Stat label="on the grill" value={`${sel.length} / 2`} />
        <Stat label="pairs plan" value={`${pairPlanMinutes(n)} min`} tone="warn" />
      </div>
      <Caption tone={done ? (minutes === best ? 'ok' : 'warn') : 'neutral'}>
        {done
          ? minutes === best
            ? `All cooked in **${minutes}** minutes — the minimum possible.`
            : `All cooked in ${minutes} minutes. It can be done in ${best}.`
          : 'Click up to two burgers to put them on the grill (each cooks its next side), then cook for one minute.'}
      </Caption>
      <div className="flex flex-wrap items-center gap-2">
        <button className="btn-primary" onClick={cook} disabled={sel.length === 0 || done}>
          Cook 1 minute
        </button>
        <button className="btn" onClick={() => reset()}>
          Reset
        </button>
        <div className="min-w-48 flex-1">
          <Slider label="burgers" value={n} min={1} max={7} onChange={(v) => reset(v)} />
        </div>
      </div>
    </Panel>
  );
}

/* ======================= Polynomial evaluation ======================= */

export const polyCosts = (n: number) => ({ scratch: (n * (n + 1)) / 2, incremental: 2 * n - 1, horner: n });

export function PolyCost() {
  const [n, setN] = useState(8);
  const c = polyCosts(n);
  const max = c.scratch;
  const rows = [
    { name: 'each power from scratch', v: c.scratch, color: 'var(--bad)' },
    { name: 'keep the previous power', v: c.incremental, color: 'var(--v-active)' },
    { name: 'nested form (Horner)', v: c.horner, color: 'var(--v-done)' },
  ];
  return (
    <Panel>
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.name} className="grid grid-cols-[170px_1fr_56px] items-center gap-2 text-sm">
            <span className="text-muted">{r.name}</span>
            <div className="h-4 overflow-hidden rounded bg-surface-2">
              <div className="h-full rounded transition-all" style={{ width: `${(r.v / max) * 100}%`, background: r.color }} />
            </div>
            <span className="text-right font-mono font-semibold">{r.v}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted">Multiplications needed for a polynomial of degree n.</p>
      <Slider label="degree n" value={n} min={1} max={30} onChange={setN} />
    </Panel>
  );
}

export function HornerSteps({ coeffs = [2, -6, 2, -1], x = 3, onSolved }: { coeffs?: number[]; x?: number; onSolved?: () => void }) {
  const frames = useMemo(() => {
    const f: { k: number; acc: number; msg: string }[] = [{ k: 0, acc: coeffs[0], msg: `Start with the leading coefficient: ${coeffs[0]}.` }];
    let acc = coeffs[0];
    for (let k = 1; k < coeffs.length; k++) {
      const next = acc * x + coeffs[k];
      f.push({ k, acc: next, msg: `${acc} × ${x} + (${coeffs[k]}) = ${next}` });
      acc = next;
    }
    f.push({ k: coeffs.length, acc, msg: `p(${x}) = **${acc}**, with ${coeffs.length - 1} multiplications.` });
    return f;
  }, [coeffs, x]);
  const s = useStepper(frames.length, onSolved, 1000);
  const f = frames[s.i];
  const deg = coeffs.length - 1;
  const poly = coeffs
    .map((c, i) => {
      const p = deg - i;
      const term = p === 0 ? `${Math.abs(c)}` : `${Math.abs(c) === 1 ? '' : Math.abs(c)}x${p > 1 ? `^${p}` : ''}`;
      return `${i === 0 ? (c < 0 ? '-' : '') : c < 0 ? ' - ' : ' + '}${term}`;
    })
    .join('');
  return (
    <Panel>
      <div className="text-center">
        <TeX>{`p(x) = ${poly},\\quad x = ${x}`}</TeX>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {coeffs.map((c, i) => (
          <span
            key={i}
            className="rounded-lg px-3 py-1.5 font-mono text-sm font-bold"
            style={{ background: i === f.k ? 'var(--v-active)' : i < f.k ? 'var(--v-done)' : 'var(--surface-2)', color: i <= f.k ? '#fff' : 'var(--text)' }}
          >
            {c}
          </span>
        ))}
      </div>
      <Stat label="running value" value={f.acc} tone="brand" />
      <Caption>{f.msg}</Caption>
      <Controls s={s} />
    </Panel>
  );
}
