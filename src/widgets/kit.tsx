import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { renderInline } from '../components/Prose';

/* ---------- layout ---------- */

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`flex flex-col gap-4 ${className}`}>{children}</div>;
}

export function Caption({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'ok' | 'warn' }) {
  const toneCls =
    tone === 'ok' ? 'bg-ok-soft text-ok' : tone === 'warn' ? 'bg-warn-soft text-warn' : 'bg-surface-2 text-text';
  return (
    <div className={`min-h-11 rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${toneCls}`}>
      {typeof children === 'string' ? renderInline(children) : children}
    </div>
  );
}

export function Stat({ label, value, tone }: { label: string; value: ReactNode; tone?: 'brand' | 'ok' | 'warn' }) {
  const c = tone === 'ok' ? 'text-ok' : tone === 'warn' ? 'text-warn' : tone === 'brand' ? 'text-brand' : 'text-text';
  return (
    <div className="rounded-xl bg-surface-2 px-3 py-2">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</div>
      <div className={`font-mono text-lg font-semibold tabular-nums ${c}`}>{value}</div>
    </div>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  return (
    <label className="flex items-center gap-3 text-sm">
      <span className="w-auto shrink-0 font-semibold text-muted">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--brand)]"
      />
      <span className="w-14 shrink-0 text-right font-mono font-semibold tabular-nums">{format ? format(value) : value}</span>
    </label>
  );
}

/* ---------- frame stepper (for precomputed algorithm traces) ---------- */

export function useStepper(count: number, onEnd?: () => void, speedMs = 900) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const ended = useRef(false);

  useEffect(() => {
    if (i >= count - 1 && !ended.current && count > 0) {
      ended.current = true;
      onEnd?.();
    }
  }, [i, count, onEnd]);

  useEffect(() => {
    if (!playing) return;
    if (i >= count - 1) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setI((x) => Math.min(x + 1, count - 1)), speedMs);
    return () => clearTimeout(t);
  }, [playing, i, count, speedMs]);

  // A new trace (e.g. the learner changed the input) restarts from frame 0.
  useEffect(() => {
    setI(0);
    setPlaying(false);
  }, [count]);

  return {
    i: Math.min(i, Math.max(count - 1, 0)),
    count,
    playing,
    next: () => setI((x) => Math.min(x + 1, count - 1)),
    prev: () => setI((x) => Math.max(x - 1, 0)),
    reset: () => {
      setI(0);
      setPlaying(false);
    },
    toggle: () => setPlaying((p) => (i >= count - 1 ? false : !p)),
    jump: (k: number) => setI(Math.max(0, Math.min(k, count - 1))),
  };
}

export type Stepper = ReturnType<typeof useStepper>;

export function Controls({ s, extra }: { s: Stepper; extra?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button className="btn" onClick={s.reset} aria-label="Restart">
        <RotateCcw size={15} />
      </button>
      <button className="btn" onClick={s.prev} disabled={s.i === 0} aria-label="Previous step">
        <ChevronLeft size={16} />
      </button>
      <button className="btn min-w-24" onClick={s.toggle} disabled={s.i >= s.count - 1}>
        {s.playing ? <Pause size={15} /> : <Play size={15} />}
        {s.playing ? 'Pause' : 'Play'}
      </button>
      <button className="btn" onClick={s.next} disabled={s.i >= s.count - 1} aria-label="Next step">
        Step <ChevronRight size={16} />
      </button>
      <div className="ml-auto flex items-center gap-2 text-xs font-semibold text-muted">
        {extra}
        <span className="tabular-nums">
          {s.i + 1} / {s.count}
        </span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full bg-brand transition-all"
          style={{ width: `${((s.i + 1) / Math.max(s.count, 1)) * 100}%` }}
        />
      </div>
    </div>
  );
}

/* ---------- arrays ---------- */

export type CellTone = 'idle' | 'active' | 'visit' | 'done' | 'dim' | 'bad';

const toneBg: Record<CellTone, string> = {
  idle: 'var(--v-idle)',
  active: 'var(--v-active)',
  visit: 'var(--v-visit)',
  done: 'var(--v-done)',
  dim: 'var(--v-dim)',
  bad: 'var(--bad)',
};
export const toneFill = toneBg;

export function ArrayRow({
  items,
  tone,
  pointers = [],
  size = 44,
  showIndex = false,
  indexBase = 0,
  onCellClick,
  wrap = false,
}: {
  items: { id: string | number; label: ReactNode }[];
  tone?: (i: number) => CellTone;
  pointers?: { at: number; label: string; color?: string }[];
  size?: number;
  showIndex?: boolean;
  indexBase?: number;
  onCellClick?: (i: number) => void;
  /** Wrap onto several lines instead of scrolling sideways (for clickable rows on narrow screens). */
  wrap?: boolean;
}) {
  return (
    <div className={wrap ? 'pb-1' : 'overflow-x-auto pb-1'}>
      <div className={wrap ? 'flex flex-wrap justify-center gap-1.5 px-1' : 'mx-auto flex w-max gap-1.5 px-1'}>
        {items.map((it, i) => {
          const t = tone?.(i) ?? 'idle';
          const strong = t !== 'idle' && t !== 'dim';
          const ptrs = pointers.filter((p) => p.at === i);
          return (
            <motion.div layout key={it.id} transition={{ type: 'spring', stiffness: 380, damping: 32 }} className="flex flex-col items-center gap-1">
              {showIndex && <div className="font-mono text-[10px] text-muted">{i + indexBase}</div>}
              <button
                type="button"
                disabled={!onCellClick}
                onClick={() => onCellClick?.(i)}
                style={{
                  width: size,
                  height: size,
                  background: toneBg[t],
                  color: strong ? '#fff' : 'var(--text)',
                  borderColor: strong ? 'transparent' : 'var(--border)',
                }}
                className="flex items-center justify-center rounded-lg border-2 font-mono text-[15px] font-semibold transition-colors disabled:cursor-default"
              >
                {it.label}
              </button>
              <div className="flex h-4 gap-0.5">
                {ptrs.map((p) => (
                  <span key={p.label} className="font-mono text-[10px] font-bold" style={{ color: p.color ?? 'var(--brand)' }}>
                    {p.label}
                  </span>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- graphs ---------- */

export type GNode = { id: string; x: number; y: number; label?: string; w?: number };
export type GEdge = { u: string; v: string; w?: number | string; directed?: boolean };

export function GraphView({
  nodes,
  edges,
  width,
  height,
  r = 20,
  fill,
  edgeTone,
  badge,
  onNodeClick,
  rect = false,
}: {
  nodes: GNode[];
  edges: GEdge[];
  width: number;
  height: number;
  r?: number;
  fill?: (id: string) => CellTone;
  edgeTone?: (e: GEdge, i: number) => 'idle' | 'active' | 'tree' | 'dim';
  badge?: (id: string) => string | undefined;
  onNodeClick?: (id: string) => void;
  /** Draw nodes as labelled rectangles (for long names like city names). */
  rect?: boolean;
}) {
  const pos = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const halfW = (n: GNode) => (rect ? (n.w ?? 90) / 2 : r);
  const halfH = rect ? 15 : r;
  const edgeColor = { idle: 'var(--v-idle-stroke)', active: 'var(--v-active)', tree: 'var(--v-visit)', dim: 'var(--v-dim)' };
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="mx-auto w-full" style={{ maxWidth: width }}>
      <defs>
        {Object.entries(edgeColor).map(([k, c]) => (
          <marker key={k} id={`arrow-${k}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill={c} />
          </marker>
        ))}
      </defs>
      {edges.map((e, i) => {
        const a = pos[e.u];
        const b = pos[e.v];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const len = Math.hypot(dx, dy) || 1;
        // Clip the line at the node boundary (circle or box) so arrowheads stay visible.
        const clip = (n: GNode) => {
          if (!rect) return r;
          const tx = Math.abs(dx) > 0 ? halfW(n) / Math.abs(dx / len) : Infinity;
          const ty = Math.abs(dy) > 0 ? halfH / Math.abs(dy / len) : Infinity;
          return Math.min(tx, ty);
        };
        const ca = clip(a) + 1;
        const cb = clip(b) + (e.directed ? 4 : 1);
        const x1 = a.x + (dx / len) * ca;
        const y1 = a.y + (dy / len) * ca;
        const x2 = b.x - (dx / len) * cb;
        const y2 = b.y - (dy / len) * cb;
        const t = edgeTone?.(e, i) ?? 'idle';
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        return (
          <g key={i}>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={edgeColor[t]}
              strokeWidth={t === 'idle' || t === 'dim' ? 2 : 4}
              strokeLinecap="round"
              markerEnd={e.directed ? `url(#arrow-${t})` : undefined}
              style={{ transition: 'stroke 0.3s, stroke-width 0.3s' }}
            />
            {e.w !== undefined && (
              <g>
                <rect x={mx - 13} y={my - 10} width={26} height={20} rx={6} fill="var(--surface)" stroke="var(--border)" />
                <text x={mx} y={my + 4.5} textAnchor="middle" fontSize={12} fontWeight={700} fill="var(--muted)" fontFamily="var(--font-mono)">
                  {e.w}
                </text>
              </g>
            )}
          </g>
        );
      })}
      {nodes.map((n) => {
        const t = fill?.(n.id) ?? 'idle';
        const strong = t !== 'idle' && t !== 'dim';
        const b = badge?.(n.id);
        return (
          <g
            key={n.id}
            onClick={() => onNodeClick?.(n.id)}
            style={{ cursor: onNodeClick ? 'pointer' : 'default' }}
            role={onNodeClick ? 'button' : undefined}
            aria-label={onNodeClick ? `Node ${n.label ?? n.id}` : undefined}
          >
            {rect ? (
              <rect
                x={n.x - halfW(n)}
                y={n.y - halfH}
                width={halfW(n) * 2}
                height={halfH * 2}
                rx={8}
                fill={toneBg[t]}
                stroke={strong ? 'transparent' : 'var(--v-idle-stroke)'}
                strokeWidth={2}
                style={{ transition: 'fill 0.3s' }}
              />
            ) : (
              <circle cx={n.x} cy={n.y} r={r} fill={toneBg[t]} stroke={strong ? 'transparent' : 'var(--v-idle-stroke)'} strokeWidth={2} style={{ transition: 'fill 0.3s' }} />
            )}
            <text
              x={n.x}
              y={n.y + 5}
              textAnchor="middle"
              fontSize={rect ? 12.5 : 15}
              fontWeight={700}
              fill={strong ? '#fff' : 'var(--v-ink)'}
              style={{ pointerEvents: 'none' }}
            >
              {n.label ?? n.id}
            </text>
            {b !== undefined && (
              <g style={{ pointerEvents: 'none' }}>
                <rect x={n.x - 18} y={n.y - halfH - 24} width={36} height={18} rx={9} fill="var(--brand-soft)" />
                <text x={n.x} y={n.y - halfH - 11} textAnchor="middle" fontSize={11.5} fontWeight={700} fill="var(--brand)" fontFamily="var(--font-mono)">
                  {b}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ---------- binary trees ---------- */

export type TNode = { id: string; label: string; left?: TNode | null; right?: TNode | null };

export function treeLayout(root: TNode | null | undefined) {
  const pos: Record<string, { x: number; y: number }> = {};
  const edges: [string, string][] = [];
  let x = 0;
  let depth = 0;
  const walk = (n: TNode | null | undefined, d: number) => {
    if (!n) return;
    depth = Math.max(depth, d);
    walk(n.left, d + 1);
    pos[n.id] = { x: x++, y: d };
    walk(n.right, d + 1);
    if (n.left) edges.push([n.id, n.left.id]);
    if (n.right) edges.push([n.id, n.right.id]);
  };
  walk(root, 0);
  return { pos, edges, cols: x, depth };
}

export function TreeView({
  root,
  fill,
  badge,
  onNodeClick,
  r = 19,
  colW = 48,
  rowH = 64,
  minWidth = 0,
}: {
  root: TNode | null | undefined;
  fill?: (id: string) => CellTone;
  badge?: (id: string) => string | undefined;
  onNodeClick?: (id: string) => void;
  r?: number;
  colW?: number;
  rowH?: number;
  minWidth?: number;
}) {
  const { pos, edges, cols, depth } = treeLayout(root);
  const labels: Record<string, string> = {};
  const collect = (n: TNode | null | undefined) => {
    if (!n) return;
    labels[n.id] = n.label;
    collect(n.left);
    collect(n.right);
  };
  collect(root);
  const width = Math.max(cols * colW + 20, minWidth);
  const offset = (width - cols * colW) / 2 + colW / 2;
  const P = (id: string) => ({ x: offset + pos[id].x * colW, y: 36 + pos[id].y * rowH });
  const height = 36 + depth * rowH + r + 14;
  if (!root) return <div className="py-8 text-center text-sm text-muted">(empty tree)</div>;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="mx-auto w-full" style={{ maxWidth: width }}>
      {edges.map(([a, b]) => {
        const pa = P(a);
        const pb = P(b);
        return (
          <motion.line
            key={`${a}-${b}`}
            initial={false}
            animate={{ x1: pa.x, y1: pa.y, x2: pb.x, y2: pb.y }}
            transition={{ type: 'spring', stiffness: 200, damping: 26 }}
            stroke="var(--v-idle-stroke)"
            strokeWidth={2}
          />
        );
      })}
      {Object.keys(pos).map((id) => {
        const p = P(id);
        const t = fill?.(id) ?? 'idle';
        const strong = t !== 'idle' && t !== 'dim';
        const b = badge?.(id);
        return (
          <motion.g
            key={id}
            initial={false}
            animate={{ x: p.x, y: p.y }}
            transition={{ type: 'spring', stiffness: 200, damping: 26 }}
            onClick={() => onNodeClick?.(id)}
            style={{ cursor: onNodeClick ? 'pointer' : 'default' }}
          >
            <circle r={r} fill={toneBg[t]} stroke={strong ? 'transparent' : 'var(--v-idle-stroke)'} strokeWidth={2} style={{ transition: 'fill 0.3s' }} />
            <text y={5} textAnchor="middle" fontSize={14} fontWeight={700} fill={strong ? '#fff' : 'var(--v-ink)'} style={{ pointerEvents: 'none' }}>
              {labels[id]}
            </text>
            {b !== undefined && (
              <text x={r + 3} y={-r + 4} fontSize={11} fontWeight={700} fill="var(--brand)" fontFamily="var(--font-mono)">
                {b}
              </text>
            )}
          </motion.g>
        );
      })}
    </svg>
  );
}

/* ---------- pseudo-code listing ---------- */

export function CodeBlock({ lines, active, title }: { lines: string[]; active?: number; title?: string }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface-2">
      {title && <div className="border-b border-border px-3 py-1.5 text-xs font-semibold text-muted">{title}</div>}
      <pre className="code py-2">
        {lines.map((l, i) => (
          <div
            key={i}
            className={`flex px-3 transition-colors ${active === i ? 'bg-v-active/25' : ''}`}
            style={active === i ? { boxShadow: 'inset 3px 0 0 var(--v-active)' } : undefined}
          >
            <span className="mr-3 w-4 select-none text-right text-muted">{i + 1}</span>
            <span className="whitespace-pre">{l}</span>
          </div>
        ))}
      </pre>
    </div>
  );
}

export function Legend({ items }: { items: { tone: CellTone; label: string }[] }) {
  return (
    <div className="flex flex-wrap gap-3 text-xs text-muted">
      {items.map((it) => (
        <span key={it.label} className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full border border-border" style={{ background: toneBg[it.tone] }} />
          {it.label}
        </span>
      ))}
    </div>
  );
}
