import { useMemo, useState } from 'react';
import { Caption, Controls, GraphView, Panel, Stat, useStepper, type GEdge, type GNode } from './kit';

/* ======================= Equal-sum split: try every subset ======================= */

export function partitionFrames(values: number[], fixFirst: boolean) {
  const n = values.length;
  const total = values.reduce((a, b) => a + b, 0);
  const target = total / 2;
  const frames: { mask: number; sum: number; checked: number; found: number[]; msg: string }[] = [];
  const found: number[] = [];
  let checked = 0;
  // Fixing the first element in group A halves the search: its complement covers the other half.
  const masks = Array.from({ length: 2 ** n }, (_, m) => m).filter((m) => !fixFirst || (m & 1) === 1);
  for (const m of masks) {
    checked++;
    const sum = values.reduce((a, v, i) => a + ((m >> i) & 1 ? v : 0), 0);
    const hit = sum === target;
    if (hit) found.push(m);
    frames.push({ mask: m, sum, checked, found: [...found], msg: hit ? `Sum ${sum} = ${target}: a valid split!` : `Sum ${sum} ≠ ${target}.` });
  }
  return { frames, total, target };
}

export function PartitionSearch({ values = [3, 1, 4, 2, 2], onSolved }: { values?: number[]; onSolved?: () => void }) {
  const [fixFirst, setFixFirst] = useState(false);
  const { frames, target } = useMemo(() => partitionFrames(values, fixFirst), [values, fixFirst]);
  const s = useStepper(frames.length, onSolved, 260);
  const f = frames[s.i];
  return (
    <Panel>
      <div className="flex flex-wrap justify-center gap-6">
        {[true, false].map((inA) => (
          <div key={String(inA)} className="flex min-w-36 flex-col items-center gap-2 rounded-xl bg-surface-2 p-3">
            <div className="text-xs font-bold uppercase tracking-wide text-muted">group {inA ? 'A' : 'B'}</div>
            <div className="flex min-h-10 flex-wrap justify-center gap-1.5">
              {values.map((v, i) =>
                ((f.mask >> i) & 1) === (inA ? 1 : 0) ? (
                  <span key={i} className="flex h-9 w-9 items-center justify-center rounded-lg font-mono font-bold text-white" style={{ background: inA ? 'var(--v-visit)' : 'var(--v-active)' }}>
                    {v}
                  </span>
                ) : null,
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="subsets tried" value={`${f.checked} / ${frames.length}`} tone="brand" />
        <Stat label="sum of A" value={`${f.sum} (want ${target})`} />
        <Stat label="splits found" value={f.found.length} tone="ok" />
      </div>
      <Caption tone={f.sum === target ? 'ok' : 'neutral'}>{f.msg}</Caption>
      <Controls
        s={s}
        extra={
          <label className="inline-flex items-center gap-1.5">
            <input type="checkbox" checked={fixFirst} onChange={(e) => setFixFirst(e.target.checked)} className="accent-[var(--brand)]" />
            keep the first value in A
          </label>
        }
      />
    </Panel>
  );
}

/* ======================= Clique: try every group of k vertices ======================= */

export const CLIQUE_GRAPH: { nodes: GNode[]; edges: GEdge[] } = {
  nodes: [
    { id: 'a', x: 60, y: 60 },
    { id: 'b', x: 200, y: 40 },
    { id: 'c', x: 320, y: 90 },
    { id: 'd', x: 230, y: 170 },
    { id: 'e', x: 90, y: 180 },
    { id: 'f', x: 360, y: 200 },
  ],
  edges: [
    { u: 'a', v: 'b' },
    { u: 'a', v: 'e' },
    { u: 'b', v: 'c' },
    { u: 'b', v: 'd' },
    { u: 'c', v: 'd' },
    { u: 'c', v: 'f' },
    { u: 'd', v: 'f' },
    { u: 'd', v: 'e' },
    { u: 'b', v: 'f' },
  ],
};

function combinations<T>(xs: T[], k: number): T[][] {
  if (k === 0) return [[]];
  return xs.flatMap((x, i) => combinations(xs.slice(i + 1), k - 1).map((c) => [x, ...c]));
}

export function cliqueFrames(g: { nodes: GNode[]; edges: GEdge[] }, k: number) {
  const has = (u: string, v: string) => g.edges.some((e) => (e.u === u && e.v === v) || (e.u === v && e.v === u));
  let checks = 0;
  const found: string[][] = [];
  return combinations(
    g.nodes.map((n) => n.id),
    k,
  ).map((group, i) => {
    const pairs = combinations(group, 2);
    const missing = pairs.filter(([u, v]) => !has(u, v));
    checks += pairs.length;
    if (!missing.length) found.push(group);
    return {
      group,
      missing,
      checks,
      found: [...found],
      tried: i + 1,
      msg: missing.length ? `{${group.join(', ')}}: missing edge ${missing[0].join('–')}.` : `{${group.join(', ')}}: every pair is connected — a clique of size ${k}!`,
    };
  });
}

export function CliqueSearch({ onSolved }: { onSolved?: () => void }) {
  const [k, setK] = useState(4);
  const frames = useMemo(() => cliqueFrames(CLIQUE_GRAPH, k), [k]);
  const s = useStepper(frames.length, onSolved, 650);
  const f = frames[s.i];
  const inGroup = (e: GEdge) => f.group.includes(e.u) && f.group.includes(e.v);
  return (
    <Panel>
      <GraphView
        nodes={CLIQUE_GRAPH.nodes}
        edges={CLIQUE_GRAPH.edges}
        width={420}
        height={230}
        fill={(id) => (f.group.includes(id) ? (f.missing.length ? 'active' : 'done') : 'idle')}
        edgeTone={(e) => (inGroup(e) ? 'tree' : 'dim')}
      />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="groups tried" value={`${f.tried} / ${frames.length}`} tone="brand" />
        <Stat label="pair checks" value={f.checks} />
        <Stat label="cliques found" value={f.found.length} tone="ok" />
      </div>
      <Caption tone={f.missing.length ? 'neutral' : 'ok'}>{f.msg}</Caption>
      <Controls
        s={s}
        extra={
          <span className="inline-flex items-center gap-1">
            k =
            {[3, 4].map((v) => (
              <button key={v} onClick={() => setK(v)} className={`btn !px-2 !py-0.5 ${k === v ? '!border-brand !text-brand' : ''}`}>
                {v}
              </button>
            ))}
          </span>
        }
      />
    </Panel>
  );
}

/* ======================= How fast do 2ⁿ and n! explode? ======================= */

const fact = (n: number) => Array.from({ length: n }, (_, i) => i + 1).reduce((a, b) => a * b, 1);

function human(seconds: number) {
  if (seconds < 1e-3) return '< 1 ms';
  if (seconds < 1) return `${Math.round(seconds * 1000)} ms`;
  if (seconds < 60) return `${seconds.toFixed(1)} s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} min`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} h`;
  if (seconds < 3.15e7) return `${Math.round(seconds / 86400)} days`;
  const y = seconds / 3.15e7;
  return y < 1e6 ? `${Math.round(y).toLocaleString('en')} years` : `${y.toExponential(1).replace('e+', 'e')} years`;
}

export function ExplosionTable() {
  const rows = [5, 10, 15, 20, 25, 30];
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-muted">
            <th className="py-1.5 pr-3 font-semibold">n</th>
            <th className="px-2 text-right font-semibold">2ⁿ subsets</th>
            <th className="px-2 text-right font-semibold">time</th>
            <th className="px-2 text-right font-semibold">n! orders</th>
            <th className="px-2 text-right font-semibold">time</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((n) => (
            <tr key={n} className="border-t border-border font-mono">
              <td className="py-1.5 pr-3 font-semibold">{n}</td>
              <td className="px-2 text-right">{(2 ** n).toLocaleString('en')}</td>
              <td className="px-2 text-right text-muted">{human(2 ** n / 1e9)}</td>
              <td className="px-2 text-right">{fact(n) < 1e9 ? fact(n).toLocaleString('en') : fact(n).toExponential(2).replace('e+', 'e')}</td>
              <td className="px-2 text-right text-muted">{human(fact(n) / 1e9)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-1 text-xs text-muted">Times assume a billion candidates checked per second.</p>
    </div>
  );
}
