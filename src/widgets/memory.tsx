import { useMemo, type ReactNode } from 'react';
import { ArrayRow, Caption, Controls, Panel, Stat, useStepper, type CellTone } from './kit';

/* ======================= Comparison counting sort ======================= */

type CcFrame = { i: number | null; j: number | null; count: number[]; S: (number | null)[]; msg: string; comps: number };

export function comparisonCountingFrames(A: number[]): CcFrame[] {
  const n = A.length;
  const count = Array(n).fill(0);
  const S: (number | null)[] = Array(n).fill(null);
  const frames: CcFrame[] = [];
  let comps = 0;
  const snap = (i: number | null, j: number | null, msg: string) => frames.push({ i, j, count: [...count], S: [...S], msg, comps });
  snap(null, null, 'Count[i] will hold the number of elements smaller than A[i].');
  for (let i = 0; i < n - 1; i++)
    for (let j = i + 1; j < n; j++) {
      comps++;
      if (A[i] < A[j]) {
        count[j]++;
        snap(i, j, `${A[i]} < ${A[j]}: Count[${j}] + 1.`);
      } else {
        count[i]++;
        snap(i, j, `${A[i]} ≥ ${A[j]}: Count[${i}] + 1.`);
      }
    }
  for (let i = 0; i < n; i++) {
    S[count[i]] = A[i];
    snap(i, null, `${A[i]} has ${count[i]} smaller element${count[i] === 1 ? '' : 's'}: it goes to S[${count[i]}].`);
  }
  snap(null, null, `Sorted with ${comps} comparisons — every pair was compared once.`);
  return frames;
}

export function ComparisonCountingViz({ A, onSolved }: { A: number[]; onSolved?: () => void }) {
  const frames = useMemo(() => comparisonCountingFrames(A), [A]);
  const s = useStepper(frames.length, onSolved, 650);
  const f = frames[s.i];
  const tone = (k: number): CellTone => (k === f.i ? 'active' : k === f.j ? 'visit' : 'idle');
  return (
    <Panel>
      <Row label="A">
        <ArrayRow items={A.map((v, k) => ({ id: `a${k}`, label: v }))} tone={tone} showIndex size={42} />
      </Row>
      <Row label="Count">
        <ArrayRow items={f.count.map((v, k) => ({ id: `c${k}`, label: v }))} tone={(k) => (k === f.i || k === f.j ? 'dim' : 'idle')} size={42} />
      </Row>
      <Row label="S">
        <ArrayRow items={f.S.map((v, k) => ({ id: `s${k}`, label: v ?? '' }))} tone={(k) => (f.S[k] !== null ? 'done' : 'idle')} showIndex size={42} />
      </Row>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="comparisons" value={f.comps} tone="brand" />
        <Stat label="extra memory" value={`${A.length * 2} cells`} />
      </div>
      <Caption>{f.msg}</Caption>
      <Controls s={s} />
    </Panel>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[52px_1fr] items-start gap-2">
      <div className="pt-6 text-right font-mono text-xs font-bold text-muted">{label}</div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/* ======================= Distribution counting sort ======================= */

export type Rec = [number, string];
type DcFrame = { phase: 'freq' | 'cum' | 'place' | 'done'; i: number | null; freq: number[]; out: (Rec | null)[]; hotKey: number | null; msg: string };

export function distributionFrames(V: Rec[], lo: number, hi: number): DcFrame[] {
  const k = hi - lo + 1;
  const freq = Array(k).fill(0);
  const out: (Rec | null)[] = Array(V.length).fill(null);
  const frames: DcFrame[] = [];
  const snap = (phase: DcFrame['phase'], i: number | null, hotKey: number | null, msg: string) =>
    frames.push({ phase, i, freq: [...freq], out: [...out], hotKey, msg });
  snap('freq', null, null, `Frequencies are indexed by key, from ${lo} to ${hi}. All start at 0.`);
  V.forEach(([key], i) => {
    freq[key - lo]++;
    snap('freq', i, key, `Key ${key}: Frequences[${key}] + 1.`);
  });
  for (let t = 1; t < k; t++) {
    freq[t] += freq[t - 1];
    snap('cum', null, lo + t, `Cumulate: Frequences[${lo + t}] = ${freq[t]} (number of keys ≤ ${lo + t}).`);
  }
  for (let i = V.length - 1; i >= 0; i--) {
    const [key, el] = V[i];
    const pos = freq[key - lo];
    out[pos - 1] = V[i];
    freq[key - lo]--;
    snap('place', i, key, `(${key}, ${el}) goes to position ${pos}; Frequences[${key}] becomes ${freq[key - lo]}.`);
  }
  snap('done', null, null, 'Done. Equal keys kept their original order because we placed elements from right to left.');
  return frames;
}

export function DistributionCountingViz({ V, lo, hi, onSolved }: { V: Rec[]; lo: number; hi: number; onSolved?: () => void }) {
  const frames = useMemo(() => distributionFrames(V, lo, hi), [V, lo, hi]);
  const s = useStepper(frames.length, onSolved, 700);
  const f = frames[s.i];
  const label = (r: Rec | null) =>
    r ? (
      <span className="flex flex-col items-center leading-none">
        <span>{r[0]}</span>
        <span className="text-[10px] opacity-80">{r[1]}</span>
      </span>
    ) : (
      ''
    );
  return (
    <Panel>
      <Row label="V">
        <ArrayRow items={V.map((r, k) => ({ id: `v${k}`, label: label(r) }))} tone={(k) => (k === f.i ? 'active' : 'idle')} showIndex indexBase={1} size={44} />
      </Row>
      <Row label={f.phase === 'freq' ? 'Freq.' : 'Cumul.'}>
        <ArrayRow
          items={f.freq.map((v, k) => ({ id: `f${k}`, label: v }))}
          tone={(k) => (lo + k === f.hotKey ? 'visit' : 'idle')}
          pointers={f.freq.map((_, k) => ({ at: k, label: `key ${lo + k}`, color: 'var(--muted)' }))}
          size={44}
        />
      </Row>
      <Row label="VTrié">
        <ArrayRow items={f.out.map((r, k) => ({ id: `o${k}`, label: label(r) }))} tone={(k) => (f.out[k] ? 'done' : 'idle')} showIndex indexBase={1} size={44} />
      </Row>
      <Caption>{f.msg}</Caption>
      <Controls s={s} />
    </Panel>
  );
}
