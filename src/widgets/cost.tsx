import { useEffect, useMemo, useState } from 'react';
import { TeX } from '../components/Prose';
import { Caption, CodeBlock, Controls, Panel, Slider, Stat, TreeView, useStepper, type TNode } from './kit';

export const SERIES = ['#4f46e5', '#e11d48', '#0891b2', '#d97706', '#16a34a'];

/* ======================= Growth plot ======================= */

export type Fn = { tex: string; f: (n: number) => number };

export function GrowthPlot({ fns, nMax: initialMax = 20, maxRange = [5, 200] }: { fns: Fn[]; nMax?: number; maxRange?: [number, number] }) {
  const [nMax, setNMax] = useState(initialMax);
  const [log, setLog] = useState(false);
  const W = 560;
  const H = 280;
  const pad = { l: 52, r: 16, t: 14, b: 30 };
  const xs = useMemo(() => Array.from({ length: 121 }, (_, i) => 1 + ((nMax - 1) * i) / 120), [nMax]);
  const series = fns.map((fn) => xs.map((x) => fn.f(x)));
  const yMaxRaw = Math.max(...series.flat().filter(Number.isFinite));
  const tr = (v: number) => (log ? Math.log10(Math.max(v, 1e-3)) : v);
  const yMin = log ? Math.min(0, ...series.flat().map(tr)) : 0;
  const yMax = tr(yMaxRaw) || 1;
  const X = (x: number) => pad.l + ((x - 1) / (nMax - 1)) * (W - pad.l - pad.r);
  const Y = (y: number) => H - pad.b - ((tr(y) - yMin) / (yMax - yMin)) * (H - pad.t - pad.b);
  const fmt = (v: number) =>
    v >= 1e6 ? v.toExponential(1).replace('e+', 'e') : v >= 100 ? Math.round(v).toLocaleString('en') : +v.toFixed(2) + '';
  const ticks = log
    ? Array.from({ length: Math.floor(yMax) - Math.ceil(yMin) + 1 }, (_, i) => 10 ** (Math.ceil(yMin) + i)).filter((_, i, a) => a.length < 8 || i % 2 === 0)
    : [0, 0.25, 0.5, 0.75, 1].map((p) => p * yMaxRaw);

  return (
    <Panel>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={Y(t)} y2={Y(t)} stroke="var(--border)" />
            <text x={pad.l - 6} y={Y(t) + 4} textAnchor="end" fontSize={10.5} fill="var(--muted)" fontFamily="var(--font-mono)">
              {log ? `10^${Math.round(Math.log10(t))}` : fmt(t)}
            </text>
          </g>
        ))}
        <line x1={pad.l} x2={W - pad.r} y1={H - pad.b} y2={H - pad.b} stroke="var(--v-idle-stroke)" />
        {[1, Math.round(nMax / 2), nMax].map((t) => (
          <text key={t} x={X(t)} y={H - 10} textAnchor="middle" fontSize={11} fill="var(--muted)" fontFamily="var(--font-mono)">
            {t}
          </text>
        ))}
        <text x={W - pad.r} y={H - 10} textAnchor="end" fontSize={11} fill="var(--muted)" fontStyle="italic" dx={-30}>
          n →
        </text>
        {series.map((ys, k) => (
          <polyline
            key={k}
            fill="none"
            stroke={SERIES[k % SERIES.length]}
            strokeWidth={2.75}
            strokeLinejoin="round"
            points={ys
              .map((y, i) => [X(xs[i]), Y(y)] as const)
              .filter(([, y]) => Number.isFinite(y))
              .map(([x, y]) => `${x.toFixed(1)},${Math.max(pad.t - 4, y).toFixed(1)}`)
              .join(' ')}
          />
        ))}
      </svg>
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {fns.map((fn, k) => (
          <div key={k} className="flex items-center gap-2 text-sm">
            <span className="inline-block h-1 w-5 rounded-full" style={{ background: SERIES[k % SERIES.length] }} />
            <TeX>{fn.tex}</TeX>
            <span className="font-mono text-xs text-muted">= {fmt(fn.f(nMax))}</span>
          </div>
        ))}
      </div>
      {fns.length === 2 && (
        <Caption>
          <span>
            Ratio at n = {nMax}: <TeX>{`\\dfrac{${fns[0].tex}}{${fns[1].tex}}`}</TeX> ≈{' '}
            <b className="font-mono">{fmt(fns[0].f(nMax) / fns[1].f(nMax))}</b>
            {'  '}— watch what this ratio does as you drag n to the right.
          </span>
        </Caption>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <Slider label="n up to" value={nMax} min={maxRange[0]} max={maxRange[1]} onChange={setNMax} />
        </div>
        <label className="inline-flex items-center gap-2 text-sm font-semibold text-muted">
          <input type="checkbox" checked={log} onChange={(e) => setLog(e.target.checked)} className="accent-[var(--brand)]" />
          log scale
        </label>
      </div>
    </Panel>
  );
}

/* ======================= Quadrupling n ======================= */

export function QuadrupleBars({ fns }: { fns: (Fn & { name: string })[] }) {
  const [n, setN] = useState(16);
  return (
    <Panel>
      <div className="space-y-3">
        {fns.map((fn, k) => {
          const a = fn.f(n);
          const b = fn.f(4 * n);
          const ratio = b / a;
          return (
            <div key={k} className="grid grid-cols-[90px_1fr] items-center gap-3">
              <div className="text-sm">
                <TeX>{fn.tex}</TeX>
              </div>
              <div className="space-y-1">
                <Bar value={a} max={b} color="var(--v-idle-stroke)" label={`f(${n}) = ${fmtNum(a)}`} />
                <Bar value={b} max={b} color={SERIES[k % SERIES.length]} label={`f(${4 * n}) = ${fmtNum(b)}   (×${fmtNum(ratio)})`} />
              </div>
            </div>
          );
        })}
      </div>
      <Slider label="n" value={n} min={2} max={64} onChange={setN} />
    </Panel>
  );
}

function fmtNum(v: number) {
  if (v >= 1e9) return v.toExponential(2).replace('e+', 'e');
  if (Number.isInteger(v)) return v.toLocaleString('en');
  return v.toFixed(2);
}

function Bar({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-4 flex-1 overflow-hidden rounded bg-surface-2">
        <div className="h-full rounded transition-all duration-300" style={{ width: `${Math.max((value / max) * 100, 0.6)}%`, background: color }} />
      </div>
      <span className="w-44 shrink-0 font-mono text-xs text-muted">{label}</span>
    </div>
  );
}

/* ======================= Trace runner (pseudo-code stepper) ======================= */

export type Program = {
  name: string;
  lines: string[];
  /** Index of the line whose executions we count as the "basic operation". */
  op: number;
  run: (N: number) => Generator<[number, Record<string, number | string>]>;
};

function trace(p: Program, N: number, cap = 600) {
  const frames: { line: number; vars: Record<string, number | string>; count: number }[] = [];
  let count = 0;
  for (const [line, vars] of p.run(N)) {
    if (line === p.op) count++;
    if (frames.length < cap) frames.push({ line, vars: { ...vars }, count });
  }
  return { frames, total: count };
}

export function countOps(p: Program, N: number) {
  let c = 0;
  for (const [line] of p.run(N)) if (line === p.op) c++;
  return c;
}

export function TraceRunner({
  program,
  nRange = [1, 10],
  initialN = 5,
  inputName = 'N',
  onSolved,
  opName = 'basic operation',
}: {
  program: Program;
  nRange?: [number, number];
  initialN?: number;
  inputName?: string;
  onSolved?: () => void;
  opName?: string;
}) {
  const [N, setN] = useState(initialN);
  const { frames, total } = useMemo(() => trace(program, N), [program, N]);
  const s = useStepper(frames.length, onSolved, 380);
  const f = frames[s.i];
  return (
    <Panel>
      <div className="grid gap-4 md:grid-cols-[1fr_200px]">
        <CodeBlock lines={program.lines} active={f?.line} title={program.name} />
        <div className="grid grid-cols-2 gap-2 md:grid-cols-1">
          {Object.entries(f?.vars ?? {}).map(([k, v]) => (
            <Stat key={k} label={k} value={v} />
          ))}
          <Stat label={`${opName} count`} value={f?.count ?? 0} tone="brand" />
        </div>
      </div>
      <Controls s={s} />
      {s.i >= frames.length - 1 && (
        <Caption tone="ok">{`Finished: the ${opName} ran **${total}** times for ${inputName} = ${N}.`}</Caption>
      )}
      <Slider label={inputName} value={N} min={nRange[0]} max={nRange[1]} onChange={setN} />
    </Panel>
  );
}

/** Several loops side by side, with a doubling table that exposes the growth order. */
export function LoopLab({ programs, onSolved }: { programs: Program[]; onSolved?: () => void }) {
  const [k, setK] = useState(0);
  const p = programs[k];
  const Ns = [4, 8, 16, 32, 64, 128];
  const counts = Ns.map((N) => countOps(p, N));
  return (
    <Panel>
      <div className="flex flex-wrap gap-1.5">
        {programs.map((q, i) => (
          <button key={q.name} onClick={() => setK(i)} className={`btn ${i === k ? '!border-brand !bg-brand-soft !text-brand' : ''}`}>
            {q.name}
          </button>
        ))}
      </div>
      <TraceRunner key={p.name} program={p} nRange={[1, 12]} initialN={6} onSolved={onSolved} opName="innermost line" />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-muted">
              <th className="py-1.5 pr-3 font-semibold">N</th>
              {Ns.map((N) => (
                <th key={N} className="px-2 text-right font-mono font-semibold">
                  {N}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-border">
              <td className="py-1.5 pr-3 font-semibold">count</td>
              {counts.map((c, i) => (
                <td key={i} className="px-2 text-right font-mono">
                  {c}
                </td>
              ))}
            </tr>
            <tr className="border-t border-border">
              <td className="py-1.5 pr-3 font-semibold">×, when N doubles</td>
              {counts.map((c, i) => (
                <td key={i} className="px-2 text-right font-mono text-brand">
                  {i === 0 ? '—' : (c / counts[i - 1]).toFixed(2)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted">
        Doubling ratio → 2 means linear, → 4 means quadratic, → 1 means logarithmic, slightly above 2 means n log n.
      </p>
    </Panel>
  );
}

/* ======================= Sum pictures ======================= */

export function OddSquares() {
  const [k, setK] = useState(5);
  const cell = Math.min(30, Math.floor(300 / k));
  const terms = Array.from({ length: k }, (_, i) => 2 * i + 1);
  return (
    <Panel>
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <svg width={k * cell + 2} height={k * cell + 2} className="shrink-0">
          {Array.from({ length: k * k }, (_, idx) => {
            const r = Math.floor(idx / k);
            const c = idx % k;
            const layer = Math.max(r, c);
            return (
              <rect
                key={idx}
                x={1 + c * cell}
                y={1 + (k - 1 - r) * cell}
                width={cell - 2}
                height={cell - 2}
                rx={3}
                fill={SERIES[layer % SERIES.length]}
                opacity={0.85}
              />
            );
          })}
        </svg>
        <div className="space-y-2 text-sm">
          <p>Each new L-shaped layer adds the next odd number of squares:</p>
          <div className="flex flex-wrap gap-1">
            {terms.map((t, i) => (
              <span key={i} className="rounded-md px-2 py-0.5 font-mono text-xs font-bold text-white" style={{ background: SERIES[i % SERIES.length] }}>
                {t}
              </span>
            ))}
          </div>
          <TeX block>{`${terms.length > 4 ? '1+3+\\dots+' + terms[terms.length - 1] : terms.join('+')} = ${k}^2 = ${k * k}`}</TeX>
        </div>
      </div>
      <Slider label="layers k" value={k} min={1} max={12} onChange={setK} />
    </Panel>
  );
}

export function DoublingBars() {
  const [k, setK] = useState(5);
  const terms = Array.from({ length: k }, (_, i) => 2 ** (i + 1));
  const sum = terms.reduce((a, b) => a + b, 0);
  const next = 2 ** (k + 1);
  const W = 480;
  const scale = (W - 10) / next;
  return (
    <Panel>
      <svg viewBox={`0 0 ${W} 80`} className="w-full">
        {(() => {
          let x = 4;
          return terms.map((t, i) => {
            const w = t * scale;
            const el = (
              <g key={i}>
                <rect x={x} y={6} width={Math.max(w - 1.5, 1)} height={28} rx={3} fill={SERIES[i % SERIES.length]} />
                {w > 22 && (
                  <text x={x + w / 2} y={25} textAnchor="middle" fontSize={11} fontWeight={700} fill="#fff">
                    {t}
                  </text>
                )}
              </g>
            );
            x += w;
            return el;
          });
        })()}
        <rect x={4} y={44} width={next * scale} height={28} rx={3} fill="none" stroke="var(--v-idle-stroke)" strokeDasharray="4 3" strokeWidth={1.5} />
        <text x={4 + (next * scale) / 2} y={63} textAnchor="middle" fontSize={12} fontWeight={700} fill="var(--muted)">
          next term: {next}
        </text>
      </svg>
      <Caption>
        <span>
          The bars <TeX>{`2+4+\\dots+${terms[terms.length - 1]}`}</TeX> fill the next term <b>minus the first 2</b>:{' '}
          <TeX>{`\\;${sum} = ${next} - 2`}</TeX>
        </span>
      </Caption>
      <Slider label="terms" value={k} min={1} max={10} onChange={setK} />
    </Panel>
  );
}

/* ======================= Recursion tree ======================= */

let nodeSeq = 0;
function powTree(n: number, shared: boolean): TNode {
  const id = `p${nodeSeq++}`;
  if (n === 0) return { id, label: '0' };
  if (shared) return { id, label: String(n), left: powTree(n - 1, true) };
  return { id, label: String(n), left: powTree(n - 1, false), right: powTree(n - 1, false) };
}

export function PowerCallTree({ onSolved }: { onSolved?: () => void }) {
  const [n, setN] = useState(3);
  const [shared, setShared] = useState(false);
  const tree = useMemo(() => {
    nodeSeq = 0;
    return powTree(n, shared);
  }, [n, shared]);
  const calls = shared ? n + 1 : 2 ** (n + 1) - 1;
  const adds = shared ? n : 2 ** n - 1;
  useEffect(() => {
    if (n >= 4 && !shared) onSolved?.();
  }, [n, shared, onSolved]);
  return (
    <Panel>
      <div className="flex flex-wrap gap-1.5">
        <button className={`btn ${!shared ? '!border-brand !bg-brand-soft !text-brand' : ''}`} onClick={() => setShared(false)}>
          Pow2(n−1) + Pow2(n−1)
        </button>
        <button className={`btn ${shared ? '!border-brand !bg-brand-soft !text-brand' : ''}`} onClick={() => setShared(true)}>
          t ← Pow2(n−1); return t + t
        </button>
      </div>
      <div className="min-h-40 overflow-x-auto">
        <TreeView root={tree} r={n >= 5 ? 10 : 14} colW={n >= 5 ? 22 : 32} rowH={n >= 5 ? 44 : 54} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="n" value={n} />
        <Stat label="calls" value={calls} tone="brand" />
        <Stat label="additions" value={adds} tone="warn" />
      </div>
      <Slider label="n" value={n} min={0} max={5} onChange={setN} />
    </Panel>
  );
}

/* ======================= Recurrence table ======================= */

export function RecurrenceCheck({
  rec,
  candidates,
  start = 1,
  rows = 8,
}: {
  rec: { tex: string; values: (count: number) => number[] };
  candidates: { tex: string; f: (n: number) => number }[];
  start?: number;
  rows?: number;
}) {
  const [pick, setPick] = useState<number | null>(null);
  const vals = rec.values(rows);
  const cand = pick === null ? null : candidates[pick];
  return (
    <Panel>
      <div className="text-center">
        <TeX>{rec.tex}</TeX>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-sm font-semibold text-muted">Test a guess:</span>
        {candidates.map((c, i) => (
          <button key={i} onClick={() => setPick(i)} className={`btn ${pick === i ? '!border-brand !bg-brand-soft' : ''}`}>
            <TeX>{c.tex}</TeX>
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <tbody>
            <tr>
              <td className="py-1.5 pr-3 font-semibold text-muted">n</td>
              {vals.map((_, i) => (
                <td key={i} className="px-2 text-right font-mono">
                  {start + i}
                </td>
              ))}
            </tr>
            <tr className="border-t border-border">
              <td className="py-1.5 pr-3 font-semibold text-muted">x(n)</td>
              {vals.map((v, i) => (
                <td key={i} className="px-2 text-right font-mono font-semibold">
                  {v}
                </td>
              ))}
            </tr>
            {cand && (
              <tr className="border-t border-border">
                <td className="py-1.5 pr-3 font-semibold text-muted">guess</td>
                {vals.map((v, i) => {
                  const g = cand.f(start + i);
                  return (
                    <td key={i} className={`px-2 text-right font-mono font-semibold ${g === v ? 'text-ok' : 'text-bad'}`}>
                      {g}
                    </td>
                  );
                })}
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {cand && (
        <Caption tone={vals.every((v, i) => cand.f(start + i) === v) ? 'ok' : 'warn'}>
          {vals.every((v, i) => cand.f(start + i) === v)
            ? 'Every value matches — a strong sign this is the closed form (a proof by induction would seal it).'
            : 'Some values differ, so this guess is wrong.'}
        </Caption>
      )}
    </Panel>
  );
}

/* ======================= Population growth ======================= */

export function Rabbits({ onSolved }: { onSolved?: () => void }) {
  const [m, setM] = useState(0);
  const history = useMemo(() => {
    const out: number[][] = [];
    let ages = [0];
    for (let k = 0; k <= 12; k++) {
      if (k > 0) {
        ages = ages.map((a) => a + 1);
        const births = ages.filter((a) => a >= 2).length;
        ages = [...ages, ...Array(births).fill(0)];
      }
      out.push(ages);
    }
    return out;
  }, []);
  const ages = history[m];
  const counts = history.map((h) => h.length);
  useEffect(() => {
    if (m === 12) onSolved?.();
  }, [m, onSolved]);
  const dot = ages.length > 60 ? 10 : 18;
  return (
    <Panel>
      <div className="flex min-h-28 flex-wrap content-start gap-1">
        {ages.map((a, i) => (
          <span
            key={i}
            title={a >= 2 ? 'fertile pair' : a === 1 ? '1 month old' : 'newborn'}
            className="inline-block rounded-full transition-all"
            style={{
              width: dot,
              height: dot,
              background: a >= 2 ? 'var(--v-visit)' : a === 1 ? 'var(--v-active)' : 'var(--v-done)',
            }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-v-done" /> newborn
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-v-active" /> 1 month old (not fertile yet)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-v-visit" /> fertile: produces a pair every month
        </span>
      </div>
      <div className="overflow-x-auto">
        <div className="flex w-max gap-1">
          {counts.map((c, k) => (
            <button
              key={k}
              onClick={() => setM(k)}
              className={`flex w-11 flex-col items-center rounded-lg py-1 font-mono text-xs ${k === m ? 'bg-brand text-on-brand' : k < m ? 'bg-surface-2' : 'bg-surface-2 opacity-40'}`}
            >
              <span className="text-[10px] opacity-70">m{k}</span>
              <span className="font-bold">{k <= m ? c : '?'}</span>
            </button>
          ))}
        </div>
      </div>
      <Slider label="month" value={m} min={0} max={12} onChange={setM} />
    </Panel>
  );
}
