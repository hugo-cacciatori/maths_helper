import { useEffect, useState } from 'react';
import { Caption, Panel, Slider, Stat } from './kit';

/** Floors that d drops and k devices can always settle: f(d, k) = f(d−1, k−1) + f(d−1, k) + 1. */
export function floorsCovered(d: number, k: number): number {
  if (d === 0 || k === 0) return 0;
  return floorsCovered(d - 1, k - 1) + floorsCovered(d - 1, k) + 1;
}

/** Fewest drops that always find the highest safe floor among n floors with k devices. */
export function worstCaseDrops(n: number, k: number) {
  let d = 0;
  while (floorsCovered(d, k) < n) d++;
  return d;
}

type Drop = { floor: number; broke: boolean };

export function DropTest({ initialFloors = 36, initialDevices = 2, onSolved }: { initialFloors?: number; initialDevices?: number; onSolved?: () => void }) {
  const [n, setN] = useState(initialFloors);
  const [k, setK] = useState(initialDevices);
  const [safe, setSafe] = useState(() => Math.floor(Math.random() * (initialFloors + 1)));
  const [drops, setDrops] = useState<Drop[]>([]);
  // What is known so far: every floor ≤ lo is safe, every floor ≥ hi breaks a device.
  const lo = Math.max(0, ...drops.filter((d) => !d.broke).map((d) => d.floor));
  const hi = Math.min(n + 1, ...drops.filter((d) => d.broke).map((d) => d.floor));
  const left = k - drops.filter((d) => d.broke).length;
  const solved = hi === lo + 1;
  const stuck = !solved && left === 0;
  const best = worstCaseDrops(n, k);
  useEffect(() => {
    if (solved) onSolved?.();
  }, [solved, onSolved]);

  const reset = (nn = n, kk = k) => {
    setN(nn);
    setK(kk);
    setSafe(Math.floor(Math.random() * (nn + 1)));
    setDrops([]);
  };
  const drop = (floor: number) => {
    if (solved || stuck || floor <= lo || floor >= hi) return;
    setDrops([...drops, { floor, broke: floor > safe }]);
  };

  const cols = n > 24 ? 3 : 2;
  const perCol = Math.ceil(n / cols);
  return (
    <Panel>
      <div className="flex justify-center gap-3" role="img" aria-label={`Floors 1 to ${n}; known safe up to ${lo}, breaks from ${hi > n ? 'none' : hi}`}>
        {Array.from({ length: cols }, (_, c) => (
          <div key={c} className="flex flex-col-reverse gap-0.5">
            {Array.from({ length: perCol }, (_, r) => c * perCol + r + 1)
              .filter((f) => f <= n)
              .map((f) => {
                const known = f <= lo ? 'safe' : f >= hi ? 'breaks' : 'unknown';
                const last = drops[drops.length - 1]?.floor === f;
                return (
                  <button
                    key={f}
                    onClick={() => drop(f)}
                    disabled={known !== 'unknown' || solved || stuck}
                    aria-label={`Floor ${f}, ${known}`}
                    className="h-6 w-16 rounded font-mono text-[11px] font-bold transition-colors sm:w-20"
                    style={{
                      background: known === 'safe' ? 'var(--ok-soft)' : known === 'breaks' ? 'var(--bad-soft)' : 'var(--surface-2)',
                      color: known === 'safe' ? 'var(--ok)' : known === 'breaks' ? 'var(--bad)' : 'var(--text)',
                      outline: last ? '2px solid var(--v-active)' : undefined,
                    }}
                  >
                    {f}
                  </button>
                );
              })}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="drops" value={drops.length} tone="brand" />
        <Stat label="devices left" value={left} tone={left === 0 ? 'warn' : undefined} />
        <Stat label="best worst case" value={best} />
      </div>
      <Caption tone={solved ? (drops.length <= best ? 'ok' : 'warn') : stuck ? 'warn' : 'neutral'}>
        {solved
          ? `${lo === 0 ? 'Even floor 1 breaks it: no floor is safe' : lo === n ? `Every floor is safe, up to the top (${n})` : `Highest safe floor: **${lo}** (floor ${lo + 1} breaks it)`}. Found in ${drops.length} drop${drops.length === 1 ? '' : 's'}.`
          : stuck
            ? `Out of devices before pinning it down — floors ${lo + 1} to ${hi - 1} are still undecided. Try again with a safer plan.`
            : drops.length === 0
              ? 'Click a floor to drop a device from it. Green = known safe, red = known to break it. Find the highest safe floor.'
              : `Last drop from floor ${drops[drops.length - 1].floor}: ${drops[drops.length - 1].broke ? 'it broke' : 'it survived'}. Still undecided: floors ${lo + 1}–${hi - 1}.`}
      </Caption>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="font-semibold text-muted">Devices:</span>
        {[1, 2, 3, 6].map((v) => (
          <button key={v} className={`btn !px-2.5 ${k === v ? '!border-brand !bg-brand-soft !text-brand' : ''}`} onClick={() => reset(n, v)}>
            {v}
          </button>
        ))}
        <button className="btn ml-auto" onClick={() => reset()}>
          New building
        </button>
      </div>
      <Slider label="floors" value={n} min={8} max={60} onChange={(v) => reset(v, k)} />
    </Panel>
  );
}
