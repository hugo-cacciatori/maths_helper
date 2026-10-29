import { motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { ArrayRow, Caption, Controls, Panel, Slider, Stat, useStepper, type CellTone } from './kit';

/* ======================= Binary search ======================= */

export const BS_ARRAY = [3, 14, 27, 31, 39, 42, 55, 70, 74, 81, 85, 93, 98];

type BsFrame = { lo: number; hi: number; mid: number | null; comps: number; msg: string; found?: number };

function bsFrames(A: number[], key: number): BsFrame[] {
  const f: BsFrame[] = [{ lo: 0, hi: A.length - 1, mid: null, comps: 0, msg: `Search for ${key} in the whole array.` }];
  let lo = 0;
  let hi = A.length - 1;
  let comps = 0;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    comps++;
    if (A[mid] === key) {
      f.push({ lo, hi, mid, comps, found: mid, msg: `A[${mid}] = ${A[mid]} = ${key}: found after **${comps}** comparison${comps > 1 ? 's' : ''}.` });
      return f;
    }
    const goLeft = key < A[mid];
    f.push({ lo, hi, mid, comps, msg: `Middle A[${mid}] = ${A[mid]}. ${key} ${goLeft ? '<' : '>'} ${A[mid]} → keep the ${goLeft ? 'left' : 'right'} half.` });
    if (goLeft) hi = mid - 1;
    else lo = mid + 1;
  }
  f.push({ lo, hi, mid: null, comps, msg: `Empty interval: ${key} is not in the array (**${comps}** comparisons).` });
  return f;
}

export function bsCost(A: number[], key: number) {
  const f = bsFrames(A, key);
  return f[f.length - 1].comps;
}

export function BinarySearch({ onSolved, showCosts = false }: { onSolved?: () => void; showCosts?: boolean }) {
  const [key, setKey] = useState(70);
  const [costs, setCosts] = useState(showCosts);
  const frames = useMemo(() => bsFrames(BS_ARRAY, key), [key]);
  const s = useStepper(frames.length, onSolved, 900);
  const f = frames[s.i];
  const tone = (i: number): CellTone => {
    if (f.found === i) return 'done';
    if (i === f.mid) return 'active';
    if (i < f.lo || i > f.hi) return 'dim';
    return 'idle';
  };
  const pointers = [
    ...(f.lo <= f.hi ? [{ at: f.lo, label: 'lo' }, { at: f.hi, label: 'hi' }] : []),
    ...(f.mid !== null ? [{ at: f.mid, label: 'mid', color: 'var(--v-active)' }] : []),
  ];
  return (
    <Panel>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-sm font-semibold text-muted">Search for:</span>
        {[...BS_ARRAY, 60].map((v) => (
          <button key={v} onClick={() => setKey(v)} className={`btn !px-2 font-mono ${key === v ? '!border-brand !bg-brand-soft !text-brand' : ''}`}>
            {v}
          </button>
        ))}
      </div>
      <ArrayRow items={BS_ARRAY.map((v) => ({ id: v, label: v }))} tone={tone} pointers={pointers} showIndex size={40} />
      {costs && (
        <div className="overflow-x-auto">
          <div className="mx-auto flex w-max gap-1.5 px-1">
            {BS_ARRAY.map((v) => {
              const c = bsCost(BS_ARRAY, v);
              return (
                <div key={v} className="flex w-10 flex-col items-center rounded-md py-0.5 text-xs" style={{ background: `color-mix(in srgb, var(--v-visit) ${c * 22}%, transparent)` }}>
                  <span className="font-mono font-bold">{c}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-1 text-center text-xs text-muted">comparisons needed to find each element</div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        <Stat label="comparisons" value={f.comps} tone="brand" />
        <Stat label="interval size" value={Math.max(0, f.hi - f.lo + 1)} />
      </div>
      <Caption tone={f.found !== undefined ? 'ok' : 'neutral'}>{f.msg}</Caption>
      <Controls
        s={s}
        extra={
          <label className="inline-flex items-center gap-1.5">
            <input type="checkbox" checked={costs} onChange={(e) => setCosts(e.target.checked)} className="accent-[var(--brand)]" />
            show costs
          </label>
        }
      />
    </Panel>
  );
}

/** The decision tree of binary search on the 13-element array, coloured by depth. */
export function BsDecisionTree() {
  type N = { i: number; l?: N; r?: N };
  const build = (lo: number, hi: number): N | undefined => {
    if (lo > hi) return undefined;
    const m = Math.floor((lo + hi) / 2);
    return { i: m, l: build(lo, m - 1), r: build(m + 1, hi) };
  };
  const root = build(0, BS_ARRAY.length - 1)!;
  const nodes: { i: number; x: number; y: number }[] = [];
  const lines: [number, number, number, number][] = [];
  const W = 560;
  const walk = (n: N | undefined, x: number, y: number, dx: number) => {
    if (!n) return;
    nodes.push({ i: n.i, x, y });
    if (n.l) lines.push([x, y, x - dx, y + 58]);
    if (n.r) lines.push([x, y, x + dx, y + 58]);
    walk(n.l, x - dx, y + 58, dx / 2);
    walk(n.r, x + dx, y + 58, dx / 2);
  };
  walk(root, W / 2, 26, 140);
  return (
    <svg viewBox={`0 0 ${W} 230`} className="w-full">
      {lines.map(([a, b, c, d], k) => (
        <line key={k} x1={a} y1={b} x2={c} y2={d} stroke="var(--v-idle-stroke)" strokeWidth={2} />
      ))}
      {nodes.map((n) => {
        const depth = Math.round((n.y - 26) / 58);
        return (
          <g key={n.i}>
            <circle cx={n.x} cy={n.y} r={17} fill={['var(--v-active)', 'var(--v-visit)', '#0891b2', 'var(--v-done)'][depth]} />
            <text x={n.x} y={n.y + 4.5} textAnchor="middle" fontSize={12.5} fontWeight={700} fill="#fff">
              {BS_ARRAY[n.i]}
            </text>
          </g>
        );
      })}
      {[1, 2, 3, 4].map((d) => (
        <text key={d} x={8} y={26 + (d - 1) * 58 + 4} fontSize={11} fill="var(--muted)" fontWeight={600}>
          {d} comp.
        </text>
      ))}
    </svg>
  );
}

/* ======================= Josephus ======================= */

export function josephus(n: number) {
  const alive = Array.from({ length: n }, (_, i) => i + 1);
  const order: { who: number; round: number }[] = [];
  let idx = 0; // position of the person who is skipped (survives this count)
  let round = 1;
  let prevSkip = 0;
  while (alive.length > 1) {
    const skip = alive[idx];
    // A new round starts each time the count goes past the top of the circle again.
    if (skip < prevSkip) round++;
    prevSkip = skip;
    const k = (idx + 1) % alive.length;
    order.push({ who: alive[k], round });
    alive.splice(k, 1);
    idx = k % alive.length;
  }
  return { order, survivor: alive[0] };
}

export function JosephusCircle({ initialN = 6, onSolved }: { initialN?: number; onSolved?: () => void }) {
  const [n, setN] = useState(initialN);
  const { order, survivor } = useMemo(() => josephus(n), [n]);
  const s = useStepper(order.length + 1, onSolved, 650);
  const dead = new Map(order.slice(0, s.i).map((o) => [o.who, o.round]));
  const last = s.i > 0 ? order[s.i - 1].who : null;
  const finished = s.i === order.length;
  const R = n > 24 ? 125 : 105;
  const size = R * 2 + 70;
  return (
    <Panel>
      <div className="grid items-center gap-4 md:grid-cols-[1fr_220px]">
        <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto w-full max-w-sm">
          <circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke="var(--border)" strokeWidth={2} />
          {Array.from({ length: n }, (_, k) => {
            const who = k + 1;
            const ang = -Math.PI / 2 + (2 * Math.PI * k) / n;
            const x = size / 2 + R * Math.cos(ang);
            const y = size / 2 + R * Math.sin(ang);
            const isDead = dead.has(who);
            const isSurvivor = finished && who === survivor;
            const rr = n > 24 ? 11 : 15;
            return (
              <g key={who}>
                <motion.circle
                  cx={x}
                  cy={y}
                  r={rr}
                  animate={{ scale: who === last ? [1, 1.35, 1] : 1 }}
                  fill={isSurvivor ? 'var(--v-done)' : isDead ? 'var(--v-dim)' : who === last ? 'var(--bad)' : 'var(--v-visit)'}
                  style={{ transformOrigin: `${x}px ${y}px` }}
                />
                <text x={x} y={y + 4} textAnchor="middle" fontSize={n > 24 ? 9.5 : 12} fontWeight={700} fill={isDead ? 'var(--muted)' : '#fff'}>
                  {who}
                </text>
                {isDead && (
                  <text
                    x={size / 2 + (R + rr + 10) * Math.cos(ang)}
                    y={size / 2 + (R + rr + 10) * Math.sin(ang) + 4}
                    textAnchor="middle"
                    fontSize={10}
                    fontWeight={700}
                    fill="var(--bad)"
                  >
                    {dead.get(who)}
                  </text>
                )}
              </g>
            );
          })}
          <text x={size / 2} y={size / 2 + 6} textAnchor="middle" fontSize={finished ? 20 : 13} fontWeight={800} fill={finished ? 'var(--ok)' : 'var(--muted)'}>
            {finished ? `J(${n}) = ${survivor}` : `n = ${n}`}
          </text>
        </svg>
        <div className="space-y-2">
          <Stat label="eliminated" value={s.i} />
          <Stat label="round" value={s.i === 0 ? 1 : order[s.i - 1].round} />
          <p className="text-xs text-muted">Small red numbers: the round in which each person was eliminated.</p>
        </div>
      </div>
      <Caption tone={finished ? 'ok' : 'neutral'}>
        {finished
          ? `Person **${survivor}** survives.`
          : s.i === 0
            ? 'Starting with person 1, every second person is eliminated.'
            : `Person ${last} is eliminated.`}
      </Caption>
      <Controls s={s} />
      <Slider label="people n" value={n} min={2} max={40} onChange={setN} />
    </Panel>
  );
}

export function JosephusTable() {
  const rows = Array.from({ length: 16 }, (_, i) => ({ n: i + 1, j: josephus(i + 1).survivor }));
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <tbody>
          <tr>
            <td className="py-1.5 pr-2 font-semibold text-muted">n</td>
            {rows.map((r) => (
              <td
                key={r.n}
                className="px-1.5 text-center font-mono"
                style={(r.n & (r.n - 1)) === 0 ? { color: 'var(--brand)', fontWeight: 800 } : undefined}
              >
                {r.n}
              </td>
            ))}
          </tr>
          <tr className="border-t border-border">
            <td className="py-1.5 pr-2 font-semibold text-muted">J(n)</td>
            {rows.map((r) => (
              <td key={r.n} className="px-1.5 text-center font-mono font-semibold">
                {r.j}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/* ======================= Misère Nim ======================= */

export function NimGame({ start = 14, m = 3, onSolved }: { start?: number; m?: number; onSolved?: () => void }) {
  const [left, setLeft] = useState(start);
  const [turn, setTurn] = useState<'you' | 'cpu'>('you');
  const [log, setLog] = useState<string[]>([]);
  const [winner, setWinner] = useState<'you' | 'cpu' | null>(null);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    if (winner === 'you') onSolved?.();
  }, [winner, onSolved]);

  const take = (who: 'you' | 'cpu', k: number) => {
    const rest = left - k;
    setLeft(rest);
    setLog((l) => [...l, `${who === 'you' ? 'You' : 'Computer'} took ${k}.`]);
    // Misère rule: whoever takes the last token loses.
    if (rest === 0) setWinner(who === 'you' ? 'cpu' : 'you');
    else setTurn(who === 'you' ? 'cpu' : 'you');
  };

  useEffect(() => {
    if (turn !== 'cpu' || winner) return;
    const t = setTimeout(() => {
      // Perfect play: leave the opponent a multiple of (m+1), plus one.
      let k = (left - 1) % (m + 1);
      if (k === 0) k = 1;
      take('cpu', Math.min(k, left));
    }, 800);
    return () => clearTimeout(t);
  }, [turn, winner, left]);

  const reset = () => {
    setLeft(start);
    setTurn('you');
    setLog([]);
    setWinner(null);
  };

  return (
    <Panel>
      <div className="flex min-h-16 flex-wrap justify-center gap-1.5 py-2">
        {Array.from({ length: start }, (_, i) => (
          <motion.div
            key={i}
            animate={{ opacity: i < left ? 1 : 0.12, scale: i < left ? 1 : 0.7 }}
            className="h-9 w-9 rounded-full"
            style={{ background: 'var(--v-active)', boxShadow: 'inset 0 -3px 0 rgba(0,0,0,0.15)' }}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="tokens left" value={left} tone="brand" />
        <Stat label="turn" value={winner ? '—' : turn === 'you' ? 'You' : 'Computer…'} />
      </div>
      {winner ? (
        <Caption tone={winner === 'you' ? 'ok' : 'warn'}>
          {winner === 'you' ? 'The computer had to take the last token — **you win!**' : 'You took the last token — you lose. Try leaving the computer in a *losing position*.'}
        </Caption>
      ) : (
        <Caption>{log.length ? log.slice(-2).join(' ') : `Take between 1 and ${m} tokens. Whoever takes the **last** token loses. You start.`}</Caption>
      )}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: m }, (_, i) => i + 1).map((k) => (
          <button key={k} className="btn-primary !px-4" disabled={turn !== 'you' || !!winner || k > left} onClick={() => take('you', k)}>
            Take {k}
          </button>
        ))}
        <button className="btn ml-auto" onClick={reset}>
          New game
        </button>
      </div>
      <label className="inline-flex items-center gap-2 text-sm font-semibold text-muted">
        <input type="checkbox" checked={showMap} onChange={(e) => setShowMap(e.target.checked)} className="accent-[var(--brand)]" />
        show winning / losing positions
      </label>
      {showMap && (
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: start }, (_, i) => i + 1).map((k) => {
            const losing = k % (m + 1) === 1;
            return (
              <span
                key={k}
                className={`flex h-8 w-8 items-center justify-center rounded-md font-mono text-xs font-bold ${losing ? 'bg-bad-soft text-bad' : 'bg-ok-soft text-ok'} ${k === left ? 'ring-2 ring-brand' : ''}`}
              >
                {k}
              </span>
            );
          })}
          <span className="w-full text-xs text-muted">Red: losing for the player about to move. Green: winning.</span>
        </div>
      )}
    </Panel>
  );
}
