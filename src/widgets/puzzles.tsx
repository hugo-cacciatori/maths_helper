import { motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { t } from '../lib/i18n';
import { Caption, Controls, Panel, Stat, useStepper } from './kit';

/* ======================= Tournament & second largest ======================= */

type TFrame = { levels: number; playoff: number; msg: string; comps: number };

export function tournament(values: number[]) {
  const levels: number[][] = [values];
  while (levels[levels.length - 1].length > 1) {
    const prev = levels[levels.length - 1];
    levels.push(prev.reduce<number[]>((acc, _, i) => (i % 2 ? acc : [...acc, Math.max(prev[i], prev[i + 1])]), []));
  }
  const champ = levels[levels.length - 1][0];
  // Players beaten directly by the champion, in round order.
  const beaten = levels.slice(0, -1).map((lv) => {
    const k = lv.indexOf(champ);
    return lv[k % 2 ? k - 1 : k + 1];
  });
  return { levels, champ, beaten, second: Math.max(...beaten) };
}

export function TournamentViz({ values, onSolved }: { values: number[]; onSolved?: () => void }) {
  const tour = useMemo(() => tournament(values), [values]);
  const rounds = tour.levels.length - 1;
  const frames: TFrame[] = useMemo(() => {
    const f: TFrame[] = [
      {
        levels: 0,
        playoff: 0,
        comps: 0,
        msg: t(
          `${values.length} players. Each match compares two values; the larger one goes up.`,
          `${values.length} joueurs. Chaque match compare deux valeurs ; la plus grande monte.`,
        ),
      },
    ];
    let comps = 0;
    for (let r = 1; r <= rounds; r++) {
      comps += tour.levels[r].length;
      const m = tour.levels[r].length;
      f.push({ levels: r, playoff: 0, comps, msg: t(`Round ${r}: ${m} match${m > 1 ? 'es' : ''}.`, `Tour ${r} : ${m} match${m > 1 ? 's' : ''}.`) });
    }
    f.push({
      levels: rounds,
      playoff: 0,
      comps,
      msg: t(
        `${tour.champ} wins after ${comps} matches. The second best can only have lost to ${tour.champ}: candidates ${tour.beaten.join(', ')}.`,
        `${tour.champ} gagne après ${comps} matchs. Le deuxième n’a pu perdre que contre ${tour.champ} : candidats ${tour.beaten.join(', ')}.`,
      ),
    });
    for (let k = 1; k < tour.beaten.length; k++) {
      comps++;
      f.push({ levels: rounds, playoff: k, comps, msg: `${t('Playoff', 'Barrage')}${t(':', ' :')} max(${Math.max(...tour.beaten.slice(0, k))}, ${tour.beaten[k]}) = ${Math.max(...tour.beaten.slice(0, k + 1))}.` });
    }
    f.push({
      levels: rounds,
      playoff: tour.beaten.length - 1,
      comps,
      msg: t(`Second largest: **${tour.second}**, with ${comps} comparisons in total.`, `Deuxième plus grand : **${tour.second}**, avec ${comps} comparaisons au total.`),
    });
    return f;
  }, [tour, rounds, values.length]);
  const s = useStepper(frames.length, onSolved, 1000);
  const f = frames[s.i];
  const W = 560;
  const rowH = 62;
  const H = rowH * rounds + 50;
  const X = (level: number, k: number) => {
    const span = W / tour.levels[level].length;
    return span * k + span / 2;
  };
  const Y = (level: number) => H - 26 - level * rowH;
  const candidatesShown = s.i >= rounds + 1;
  return (
    <Panel>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {tour.levels.slice(1).map((lv, i) =>
          lv.map((_, k) => {
            const level = i + 1;
            if (level > f.levels) return null;
            return (
              <g key={`${level}-${k}`}>
                {[0, 1].map((c) => (
                  <path
                    key={c}
                    d={`M${X(level - 1, 2 * k + c)},${Y(level - 1) - 16} V${Y(level) + rowH / 2} H${X(level, k)} V${Y(level) + 16}`}
                    fill="none"
                    stroke="var(--v-idle-stroke)"
                    strokeWidth={1.5}
                  />
                ))}
              </g>
            );
          }),
        )}
        {tour.levels.map((lv, level) =>
          lv.map((v, k) => {
            if (level > f.levels) return null;
            const isChamp = v === tour.champ;
            const cand = candidatesShown && level < rounds && tour.beaten[level] === v && tour.levels[level].indexOf(tour.champ) === (k % 2 ? k - 1 : k + 1);
            const fill = isChamp ? 'var(--v-active)' : cand ? 'var(--v-visit)' : 'var(--v-idle)';
            return (
              <motion.g key={`${level}-${k}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <rect x={X(level, k) - 18} y={Y(level) - 16} width={36} height={32} rx={8} fill={fill} stroke={isChamp || cand ? 'transparent' : 'var(--v-idle-stroke)'} strokeWidth={1.5} />
                <text x={X(level, k)} y={Y(level) + 5} textAnchor="middle" fontSize={14} fontWeight={700} fill={isChamp || cand ? '#fff' : 'var(--v-ink)'}>
                  {v}
                </text>
              </motion.g>
            );
          }),
        )}
      </svg>
      <div className="grid grid-cols-3 gap-2">
        <Stat label={t('comparisons', 'comparaisons')} value={f.comps} tone="brand" />
        <Stat label={t('rounds', 'tours')} value={rounds} />
        <Stat label={t('naive (2n − 3)', 'naïf (2n − 3)')} value={2 * values.length - 3} />
      </div>
      <Caption tone={s.i === frames.length - 1 ? 'ok' : 'neutral'}>{f.msg}</Caption>
      <Controls s={s} />
    </Panel>
  );
}

/* ======================= Maximum-sum subarray ======================= */

export function kadaneFrames(A: number[]) {
  const frames: { j: number | null; start: number; sum: number; best: number; bestRange: [number, number] | null; msg: string }[] = [];
  let sum = 0;
  let start = 0;
  let best = 0;
  let bestRange: [number, number] | null = null;
  frames.push({
    j: null,
    start,
    sum,
    best,
    bestRange,
    msg: t('Scan once, keeping the best sum of a run ending at the current position.', 'Un seul passage, en gardant la meilleure somme d’une série qui finit à la position courante.'),
  });
  A.forEach((x, j) => {
    sum += x;
    let note = t(`Add ${x}: running sum ${sum}.`, `On ajoute ${x} : somme courante ${sum}.`);
    if (sum > best) {
      best = sum;
      bestRange = [start, j];
      note += t(` New best: ${best}.`, ` Nouveau meilleur : ${best}.`);
    }
    if (sum < 0) {
      note += t(
        ' Negative — a run ending here can only hurt what follows: reset to 0.',
        ' Négative — une série qui finit ici ne peut que nuire à la suite : remise à 0.',
      );
      sum = 0;
      start = j + 1;
    }
    frames.push({ j, start, sum, best, bestRange, msg: note });
  });
  frames.push({ j: null, start, sum, best, bestRange, msg: t(`Maximum sum: **${best}**, found in a single pass.`, `Somme maximale : **${best}**, trouvée en un seul passage.`) });
  return frames;
}

export function MaxSubarray({ A, onSolved }: { A: number[]; onSolved?: () => void }) {
  const frames = useMemo(() => kadaneFrames(A), [A]);
  const s = useStepper(frames.length, onSolved, 900);
  const f = frames[s.i];
  const W = 520;
  const H = 180;
  const max = Math.max(...A.map(Math.abs));
  const bw = W / A.length;
  const zero = H / 2;
  return (
    <Panel>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {f.bestRange && (
          <rect x={f.bestRange[0] * bw + 2} y={4} width={(f.bestRange[1] - f.bestRange[0] + 1) * bw - 4} height={H - 8} rx={8} fill="color-mix(in srgb, var(--v-done) 18%, transparent)" stroke="var(--v-done)" strokeDasharray="5 4" />
        )}
        <line x1={0} x2={W} y1={zero} y2={zero} stroke="var(--v-idle-stroke)" />
        {A.map((v, k) => {
          const h = (Math.abs(v) / max) * (H / 2 - 22);
          const inRun = f.j !== null && k >= f.start && k <= f.j;
          return (
            <g key={k}>
              <rect
                x={k * bw + bw * 0.2}
                y={v >= 0 ? zero - h : zero}
                width={bw * 0.6}
                height={h}
                rx={4}
                fill={k === f.j ? 'var(--v-active)' : inRun ? 'var(--v-visit)' : v >= 0 ? 'var(--v-idle-stroke)' : 'var(--bad)'}
                opacity={k === f.j || inRun ? 1 : 0.55}
              />
              <text x={k * bw + bw / 2} y={v >= 0 ? zero - h - 5 : zero + h + 14} textAnchor="middle" fontSize={12} fontWeight={700} fill="var(--text)" fontFamily="var(--font-mono)">
                {v}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="grid grid-cols-2 gap-2">
        <Stat label={t('running sum', 'somme courante')} value={f.sum} tone="brand" />
        <Stat label={t('best so far', 'meilleur jusqu’ici')} value={f.best} tone="ok" />
      </div>
      <Caption>{f.msg}</Caption>
      <Controls s={s} />
    </Panel>
  );
}

/* ======================= Counterfeit coin & balance ======================= */

type Pan = 0 | 1 | 2; // 0 off, 1 left, 2 right

const tiltName = (tilt: number) =>
  tilt === 0 ? t('balanced', 'équilibre') : tilt > 0 ? t('left heavier', 'gauche plus lourd') : t('right heavier', 'droite plus lourd');

export function BalanceScale({ coins = 8, maxWeighings = 2, onSolved }: { coins?: number; maxWeighings?: number; onSolved?: () => void }) {
  const [fake, setFake] = useState(() => Math.floor(Math.random() * coins));
  const [place, setPlace] = useState<Pan[]>(() => Array(coins).fill(0));
  const [log, setLog] = useState<{ l: number[]; r: number[]; tilt: number }[]>([]);
  const [accuse, setAccuse] = useState(false);
  const [verdict, setVerdict] = useState<null | { ok: boolean; who: number }>(null);
  const last = log[log.length - 1];

  useEffect(() => {
    if (verdict?.ok && log.length <= maxWeighings) onSolved?.();
  }, [verdict, log.length, maxWeighings, onSolved]);

  const left = place.flatMap((p, i) => (p === 1 ? [i] : []));
  const right = place.flatMap((p, i) => (p === 2 ? [i] : []));
  const weigh = () => {
    const w = (ids: number[]) => ids.reduce((a, i) => a + (i === fake ? 9 : 10), 0);
    const diff = w(left) - w(right);
    setLog([...log, { l: left, r: right, tilt: Math.sign(diff) }]);
  };
  const reset = () => {
    setFake(Math.floor(Math.random() * coins));
    setPlace(Array(coins).fill(0));
    setLog([]);
    setAccuse(false);
    setVerdict(null);
  };
  const tilt = last ? last.tilt * 9 : 0; // heavier side goes down

  return (
    <Panel>
      <svg viewBox="0 0 420 150" className="mx-auto w-full max-w-md">
        <polygon points="200,140 220,140 210,62" fill="var(--v-idle-stroke)" />
        <motion.g animate={{ rotate: -tilt }} style={{ originX: '210px', originY: '62px' }} transition={{ type: 'spring', stiffness: 80, damping: 12 }}>
          <line x1={60} y1={62} x2={360} y2={62} stroke="var(--v-ink)" strokeWidth={4} strokeLinecap="round" />
          {[60, 360].map((x, side) => (
            <g key={x}>
              <line x1={x} y1={62} x2={x - 40} y2={100} stroke="var(--v-idle-stroke)" />
              <line x1={x} y1={62} x2={x + 40} y2={100} stroke="var(--v-idle-stroke)" />
              <path d={`M${x - 50},100 Q${x},122 ${x + 50},100 Z`} fill="var(--surface-2)" stroke="var(--v-idle-stroke)" />
              {(last ? (side === 0 ? last.l : last.r) : []).map((c, k) => (
                <circle key={c} cx={x - 36 + (k % 6) * 14.5} cy={95 - Math.floor(k / 6) * 12} r={6.5} fill="var(--v-active)" />
              ))}
            </g>
          ))}
        </motion.g>
      </svg>
      <div className="flex flex-wrap justify-center gap-2">
        {place.map((p, i) => {
          const revealed = verdict && (i === fake || i === verdict.who);
          return (
            <button
              key={i}
              onClick={() => {
                if (verdict) return;
                if (accuse) {
                  setVerdict({ ok: i === fake, who: i });
                  return;
                }
                setPlace(place.map((q, k) => (k === i ? (((q + 1) % 3) as Pan) : q)));
              }}
              className="flex flex-col items-center gap-1"
              aria-label={t(`Coin ${i + 1}`, `Pièce ${i + 1}`)}
            >
              <span
                className="flex h-11 w-11 items-center justify-center rounded-full border-2 font-mono text-sm font-bold transition"
                style={{
                  background: revealed ? (i === fake ? 'var(--bad)' : 'var(--v-done)') : 'var(--v-active)',
                  borderColor: accuse ? 'var(--bad)' : 'transparent',
                  color: '#fff',
                }}
              >
                {i + 1}
              </span>
              <span className="h-4 text-[10px] font-bold text-muted">{p === 1 ? t('LEFT', 'GAUCHE') : p === 2 ? t('RIGHT', 'DROITE') : ''}</span>
            </button>
          );
        })}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Stat label={t('weighings', 'pesées')} value={`${log.length} / ${maxWeighings}`} tone={log.length > maxWeighings ? 'warn' : 'brand'} />
        <Stat label={t('last result', 'dernier résultat')} value={last ? tiltName(last.tilt) : '—'} />
      </div>
      {verdict ? (
        <Caption tone={verdict.ok && log.length <= maxWeighings ? 'ok' : 'warn'}>
          {verdict.ok
            ? log.length <= maxWeighings
              ? t(
                  `Correct — coin ${fake + 1} is the light fake, found in ${log.length} weighing${log.length === 1 ? '' : 's'}!`,
                  `Exact — la pièce ${fake + 1} est la fausse, plus légère, trouvée en ${log.length} pesée${log.length > 1 ? 's' : ''} !`,
                )
              : t(`Correct, but it took ${log.length} weighings. Can you do it in ${maxWeighings}?`, `Exact, mais il a fallu ${log.length} pesées. Y arriverez-vous en ${maxWeighings} ?`)
            : t(`No — coin ${verdict.who + 1} is genuine; the fake was coin ${fake + 1}.`, `Non — la pièce ${verdict.who + 1} est vraie ; la fausse était la pièce ${fake + 1}.`)}
        </Caption>
      ) : (
        <Caption>
          {accuse
            ? t('Click the coin you think is the fake.', 'Cliquez sur la pièce que vous pensez fausse.')
            : t(
                'Click a coin to cycle it: left pan → right pan → off. Then weigh. One coin is lighter than the others.',
                'Cliquez sur une pièce pour la déplacer : plateau gauche → plateau droit → hors balance. Puis pesez. Une pièce est plus légère que les autres.',
              )}
        </Caption>
      )}
      <div className="flex flex-wrap gap-2">
        <button className="btn-primary" onClick={weigh} disabled={!!verdict || accuse || (left.length === 0 && right.length === 0)}>
          {t('Weigh', 'Peser')}
        </button>
        <button className={`btn ${accuse ? '!border-bad !text-bad' : ''}`} onClick={() => setAccuse(!accuse)} disabled={!!verdict}>
          {accuse ? t('Cancel', 'Annuler') : t('Name the fake', 'Désigner la fausse')}
        </button>
        <button className="btn ml-auto" onClick={reset}>
          {t('New coins', 'Nouvelles pièces')}
        </button>
      </div>
      {log.length > 0 && (
        <div className="space-y-0.5 font-mono text-xs text-muted">
          {log.map((w, k) => (
            <div key={k}>
              #{k + 1}: [{w.l.map((c) => c + 1).join(' ')}] {t('vs', 'contre')} [{w.r.map((c) => c + 1).join(' ')}] → {tiltName(w.tilt)}
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
