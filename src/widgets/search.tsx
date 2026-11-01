import { motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { t } from '../lib/i18n';
import { ArrayRow, Caption, Controls, GraphView, Legend, Panel, Stat, useStepper, type CellTone, type GEdge, type GNode } from './kit';

/* ======================= Disk swapper ======================= */

export function DiskSwapper({ n = 3, onSolved }: { n?: number; onSolved?: () => void }) {
  const start = () => Array.from({ length: 2 * n }, (_, i) => ({ id: i, black: i % 2 === 0 }));
  const [disks, setDisks] = useState(start);
  const [moves, setMoves] = useState(0);
  const [auto, setAuto] = useState(false);
  const solved = disks.every((d, i) => d.black === i >= n);
  const best = (n * (n + 1)) / 2;

  useEffect(() => {
    if (solved) onSolved?.();
  }, [solved, onSolved]);

  const swap = (i: number) => {
    setDisks((ds) => {
      const c = [...ds];
      [c[i], c[i + 1]] = [c[i + 1], c[i]];
      return c;
    });
    setMoves((m) => m + 1);
  };

  // "Show me": bubble every black disk one step right, left to right, like the direct solution.
  useEffect(() => {
    if (!auto || solved) {
      setAuto(false);
      return;
    }
    const t = setTimeout(() => {
      const i = disks.findIndex((d, k) => k < disks.length - 1 && d.black && !disks[k + 1].black);
      if (i >= 0) swap(i);
    }, 380);
    return () => clearTimeout(t);
  }, [auto, disks, solved]);

  return (
    <Panel>
      <div className="flex flex-wrap items-center justify-center gap-0.5 py-3">
        {disks.map((d, i) => (
          <div key={d.id} className="flex items-center">
            <motion.div
              layout
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="h-11 w-11 rounded-full border-[3px] sm:h-12 sm:w-12"
              style={{
                background: d.black ? 'var(--v-ink)' : 'var(--surface)',
                borderColor: 'var(--v-ink)',
              }}
            />
            {i < disks.length - 1 && (
              <button
                onClick={() => swap(i)}
                disabled={solved || auto}
                className="mx-0.5 h-8 w-5 rounded text-xs font-bold text-muted transition hover:bg-brand-soft hover:text-brand disabled:opacity-20"
                aria-label={t(`Swap disks ${i + 1} and ${i + 2}`, `Échanger les jetons ${i + 1} et ${i + 2}`)}
                title={t('Swap these two neighbours', 'Échanger ces deux voisins')}
              >
                ⇄
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Stat label={t('moves', 'coups')} value={moves} tone="brand" />
        <Stat label={t('goal', 'but')} value="○○○ ●●●" />
      </div>
      {solved ? (
        <Caption tone={moves === best ? 'ok' : 'warn'}>
          {moves === best
            ? t(`Solved in **${moves}** moves — that's the minimum possible!`, `Résolu en **${moves}** coups — c’est le minimum possible !`)
            : t(
                `Solved in **${moves}** moves. It can be done in ${best}: never swap two disks that are already in the right relative order.`,
                `Résolu en **${moves}** coups. C’est faisable en ${best} : n’échangez jamais deux jetons déjà dans le bon ordre l’un par rapport à l’autre.`,
              )}
        </Caption>
      ) : (
        <Caption>
          {t(
            'Click ⇄ between two neighbours to swap them. Goal: all white disks on the left, all black on the right.',
            'Cliquez sur ⇄ entre deux voisins pour les échanger. But : tous les jetons blancs à gauche, tous les noirs à droite.',
          )}
        </Caption>
      )}
      <div className="flex gap-2">
        <button
          className="btn"
          onClick={() => {
            setDisks(start());
            setMoves(0);
            setAuto(false);
          }}
        >
          {t('Reset', 'Recommencer')}
        </button>
        <button className="btn" onClick={() => setAuto(true)} disabled={solved || auto}>
          {t('Show me', 'Montre-moi')}
        </button>
      </div>
    </Panel>
  );
}

/* ======================= Counting A…B substrings ======================= */

type SubFrame = { i: number | null; j: number | null; count: number; seenA?: number; msg: string; found?: [number, number][] };

function directFrames(text: string): SubFrame[] {
  const f: SubFrame[] = [
    { i: null, j: null, count: 0, msg: t('For every A, scan everything to its right looking for B.', 'Pour chaque A, parcourir tout ce qui est à sa droite à la recherche d’un B.'), found: [] },
  ];
  let count = 0;
  const found: [number, number][] = [];
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== 'A') {
      f.push({ i, j: null, count, msg: t(`Position ${i} is “${text[i]}”, not an A: skip.`, `La position ${i} est « ${text[i]} », pas un A : on passe.`), found: [...found] });
      continue;
    }
    for (let j = i + 1; j < text.length; j++) {
      const hit = text[j] === 'B';
      if (hit) {
        count++;
        found.push([i, j]);
      }
      f.push({
        i,
        j,
        count,
        msg: hit
          ? t(`A at ${i}, B at ${j}: substring found!`, `A en ${i}, B en ${j} : sous-chaîne trouvée !`)
          : t(`A at ${i}, ${text[j]} at ${j}: no.`, `A en ${i}, ${text[j]} en ${j} : non.`),
        found: [...found],
      });
    }
  }
  f.push({
    i: null,
    j: null,
    count,
    msg: t(`Done: **${count}** substrings, after checking every (A, later letter) pair.`, `Terminé : **${count}** sous-chaînes, après avoir vérifié chaque paire (A, lettre suivante).`),
    found,
  });
  return f;
}

function smartFrames(text: string): SubFrame[] {
  const f: SubFrame[] = [
    { i: null, j: null, count: 0, seenA: 0, msg: t('One left-to-right pass. Keep a counter of the A’s seen so far.', 'Un seul passage de gauche à droite. On garde un compteur des A vus jusqu’ici.') },
  ];
  let count = 0;
  let a = 0;
  for (let j = 0; j < text.length; j++) {
    const ch = text[j];
    if (ch === 'A') a++;
    if (ch === 'B') count += a;
    f.push({
      i: null,
      j,
      count,
      seenA: a,
      msg:
        ch === 'A'
          ? t('An A: one more possible start.', 'Un A : un début possible de plus.')
          : ch === 'B'
            ? t(`A B: it ends one substring for each A seen so far (+${a}).`, `Un B : il termine une sous-chaîne pour chaque A vu jusqu’ici (+${a}).`)
            : t('Neither: nothing to do.', 'Ni l’un ni l’autre : rien à faire.'),
    });
  }
  f.push({ i: null, j: null, count, seenA: a, msg: t(`Done: **${count}** substrings in a single pass.`, `Terminé : **${count}** sous-chaînes en un seul passage.`) });
  return f;
}

export function SubstringScanner({ text = 'CABAAXBYA', mode, onSolved }: { text?: string; mode: 'direct' | 'smart'; onSolved?: () => void }) {
  const frames = useMemo(() => (mode === 'direct' ? directFrames(text) : smartFrames(text)), [text, mode]);
  const s = useStepper(frames.length, onSolved, mode === 'direct' ? 450 : 700);
  const f = frames[s.i];
  const tone = (k: number): CellTone => {
    if (mode === 'direct') {
      if (k === f.i) return 'active';
      if (k === f.j) return text[k] === 'B' && f.i !== null && text[f.i] === 'A' ? 'done' : 'visit';
      return 'idle';
    }
    if (k === f.j) return text[k] === 'B' ? 'done' : text[k] === 'A' ? 'active' : 'visit';
    return f.j !== null && k < f.j ? 'dim' : 'idle';
  };
  return (
    <Panel>
      <ArrayRow items={[...text].map((c, k) => ({ id: k, label: c }))} tone={tone} showIndex />
      <div className="grid grid-cols-3 gap-2">
        <Stat label={t('substrings', 'sous-chaînes')} value={f.count} tone="ok" />
        {mode === 'smart' ? (
          <Stat label={t("A's seen", 'A vus')} value={f.seenA ?? 0} tone="brand" />
        ) : (
          <Stat label={t('pairs checked', 'paires vérifiées')} value={Math.max(0, s.i - 1)} tone="brand" />
        )}
        <Stat label={t('step', 'étape')} value={`${s.i + 1}/${frames.length}`} />
      </div>
      <Caption>{f.msg}</Caption>
      <Controls s={s} />
    </Panel>
  );
}

/* ======================= DFS / BFS explorer ======================= */

export type Graph = { nodes: GNode[]; edges: GEdge[] };

function neighbours(g: Graph, id: string) {
  const out: string[] = [];
  for (const e of g.edges) {
    if (e.u === id) out.push(e.v);
    else if (!e.directed && e.v === id) out.push(e.u);
  }
  return out.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

type TravState = {
  visited: string[]; // discovery order (push / enqueue order)
  finished: string[]; // dead-end order (pop / dequeue order)
  frontier: string[]; // stack (top = last) or queue (front = first)
  tree: [string, string][];
  log: string;
};

function settle(g: Graph, mode: 'dfs' | 'bfs', st: TravState): TravState {
  // Remove frontier items with no unvisited neighbour (they become dead ends).
  const s = { ...st, frontier: [...st.frontier], finished: [...st.finished] };
  const popped: string[] = [];
  for (;;) {
    const cur = mode === 'dfs' ? s.frontier[s.frontier.length - 1] : s.frontier[0];
    if (cur === undefined) break;
    if (neighbours(g, cur).some((v) => !s.visited.includes(v))) break;
    if (mode === 'dfs') s.frontier.pop();
    else s.frontier.shift();
    s.finished.push(cur);
    popped.push(cur);
  }
  if (popped.length)
    s.log += t(
      ` ${popped.join(', ')} ${popped.length > 1 ? 'are dead ends' : 'is a dead end'} → ${mode === 'dfs' ? 'popped' : 'dequeued'}.`,
      ` ${popped.join(', ')} ${popped.length > 1 ? 'sont des impasses' : 'est une impasse'} → ${mode === 'dfs' ? 'dépilé' : 'défilé'}${popped.length > 1 ? 's' : ''}.`,
    );
  return s;
}

export function TraversalExplorer({ graph, start, mode, onSolved, width = 420, height = 220 }: { graph: Graph; start: string; mode: 'dfs' | 'bfs'; onSolved?: () => void; width?: number; height?: number }) {
  const init = (): TravState => settle(graph, mode, { visited: [start], finished: [], frontier: [start], tree: [], log: t(`Start at ${start}.`, `Départ en ${start}.`) });
  const [st, setSt] = useState(init);
  const [wrong, setWrong] = useState<string | null>(null);
  const done = st.frontier.length === 0;

  useEffect(() => {
    if (done) onSolved?.();
  }, [done, onSolved]);

  const current = mode === 'dfs' ? st.frontier[st.frontier.length - 1] : st.frontier[0];
  const expected = current ? neighbours(graph, current).find((v) => !st.visited.includes(v)) : undefined;

  const choose = (id: string) => {
    if (done) return;
    if (id !== expected) {
      setWrong(
        st.visited.includes(id)
          ? t(`${id} has already been visited.`, `${id} a déjà été visité.`)
          : t(
              `Not yet: we are exploring from ${current}. Pick its first unvisited neighbour in alphabetical order.`,
              `Pas encore : on explore depuis ${current}. Choisissez son premier voisin non visité dans l’ordre alphabétique.`,
            ),
      );
      return;
    }
    setWrong(null);
    setSt((s) =>
      settle(graph, mode, {
        ...s,
        visited: [...s.visited, id],
        frontier: [...s.frontier, id],
        tree: [...s.tree, [current!, id]],
        log: t(
          `From ${current}, visit ${id} (${mode === 'dfs' ? 'push' : 'enqueue'}).`,
          `Depuis ${current}, on visite ${id} (${mode === 'dfs' ? 'empilé' : 'enfilé'}).`,
        ),
      }),
    );
  };

  const tone = (id: string): CellTone => {
    if (id === current) return 'active';
    if (st.finished.includes(id)) return 'done';
    if (st.visited.includes(id)) return 'visit';
    return 'idle';
  };
  const isTree = (e: GEdge) => st.tree.some(([a, b]) => (a === e.u && b === e.v) || (!e.directed && a === e.v && b === e.u));

  return (
    <Panel>
      <GraphView nodes={graph.nodes} edges={graph.edges} width={width} height={height} fill={tone} edgeTone={(e) => (isTree(e) ? 'tree' : 'idle')} onNodeClick={choose} />
      <Legend
        items={[
          {
            tone: 'active',
            label: mode === 'dfs' ? t('top of stack (exploring)', 'haut de la pile (en exploration)') : t('front of queue (exploring)', 'tête de file (en exploration)'),
          },
          {
            tone: 'visit',
            label: mode === 'dfs' ? t('visited, still in stack', 'visité, encore dans la pile') : t('visited, still in queue', 'visité, encore dans la file'),
          },
          { tone: 'done', label: t('dead end', 'impasse') },
        ]}
      />
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl bg-surface-2 px-3 py-2">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">{mode === 'dfs' ? t('Stack (top →)', 'Pile (haut →)') : t('Queue (front →)', 'File (tête →)')}</div>
          <div className="mt-1 flex min-h-8 flex-wrap gap-1">
            {(mode === 'dfs' ? st.frontier : st.frontier).map((x) => (
              <motion.span layout key={x} className="rounded-md bg-v-visit px-2 py-0.5 font-mono text-sm font-bold text-white">
                {x}
              </motion.span>
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-surface-2 px-3 py-2 font-mono text-sm">
          <div>
            <span className="text-xs font-semibold text-muted">{t('visited: ', 'visités : ')}</span>
            {st.visited.join(' ')}
          </div>
          <div>
            <span className="text-xs font-semibold text-muted">{t('dead ends: ', 'impasses : ')}</span>
            {st.finished.join(' ')}
          </div>
        </div>
      </div>
      {wrong ? (
        <Caption tone="warn">{wrong}</Caption>
      ) : (
        <Caption tone={done ? 'ok' : 'neutral'}>
          {done
            ? t(`${st.log} All vertices reached — traversal complete!`, `${st.log} Tous les sommets sont atteints — parcours terminé !`)
            : t(`${st.log} Click the next vertex to visit.`, `${st.log} Cliquez sur le prochain sommet à visiter.`)}
        </Caption>
      )}
      <div className="flex gap-2">
        <button
          className="btn"
          onClick={() => {
            setSt(init());
            setWrong(null);
          }}
        >
          {t('Reset', 'Recommencer')}
        </button>
        <button className="btn" disabled={done} onClick={() => expected && choose(expected)}>
          {t('Show next move', 'Montrer le coup suivant')}
        </button>
      </div>
    </Panel>
  );
}

/* ======================= Jug pouring ======================= */

const CAPS = [8, 5, 3];

export function jugBfs(start = [8, 0, 0], target = 4) {
  const key = (s: number[]) => s.join(',');
  const dist = new Map<string, number>([[key(start), 0]]);
  const prev = new Map<string, string>();
  const q = [start];
  while (q.length) {
    const s = q.shift()!;
    if (s.includes(target)) {
      const path = [key(s)];
      while (prev.has(path[0])) path.unshift(prev.get(path[0])!);
      return { moves: dist.get(key(s))!, path, explored: dist.size };
    }
    for (let a = 0; a < 3; a++)
      for (let b = 0; b < 3; b++) {
        if (a === b || s[a] === 0 || s[b] === CAPS[b]) continue;
        const t = [...s];
        const m = Math.min(s[a], CAPS[b] - s[b]);
        t[a] -= m;
        t[b] += m;
        if (!dist.has(key(t))) {
          dist.set(key(t), dist.get(key(s))! + 1);
          prev.set(key(t), key(s));
          q.push(t);
        }
      }
  }
  return { moves: -1, path: [], explored: dist.size };
}

export function JugPuzzle({ onSolved }: { onSolved?: () => void }) {
  const [hist, setHist] = useState<number[][]>([[8, 0, 0]]);
  const [sel, setSel] = useState<number | null>(null);
  const cur = hist[hist.length - 1];
  const solved = cur.includes(4);
  const best = useMemo(() => jugBfs(), []);

  useEffect(() => {
    if (solved) onSolved?.();
  }, [solved, onSolved]);

  const click = (k: number) => {
    if (solved) return;
    if (sel === null) {
      if (cur[k] > 0) setSel(k);
      return;
    }
    if (sel === k) return setSel(null);
    const m = Math.min(cur[sel], CAPS[k] - cur[k]);
    if (m > 0) {
      const t = [...cur];
      t[sel] -= m;
      t[k] += m;
      setHist([...hist, t]);
    }
    setSel(null);
  };

  const H = 150;
  return (
    <Panel>
      <div className="flex items-end justify-center gap-6 pt-2">
        {CAPS.map((cap, k) => {
          const h = (cap / 8) * H;
          return (
            <button key={k} onClick={() => click(k)} className="flex flex-col items-center gap-2" aria-label={t(`Jug ${cap} litres`, `Récipient de ${cap} litres`)}>
              <div
                className="relative w-20 overflow-hidden rounded-b-2xl rounded-t-md border-[3px] transition-all"
                style={{ height: h, borderColor: sel === k ? 'var(--v-active)' : 'var(--v-idle-stroke)', boxShadow: sel === k ? '0 0 0 4px color-mix(in srgb, var(--v-active) 30%, transparent)' : undefined }}
              >
                {Array.from({ length: cap - 1 }, (_, i) => (
                  <div key={i} className="absolute left-0 w-2.5 border-t border-[var(--v-idle-stroke)]" style={{ bottom: ((i + 1) / cap) * 100 + '%' }} />
                ))}
                <motion.div
                  className="absolute inset-x-0 bottom-0"
                  style={{ background: cur[k] === 4 ? 'var(--v-done)' : '#3b82f6', opacity: 0.85 }}
                  animate={{ height: `${(cur[k] / cap) * 100}%` }}
                  transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                />
                <div className="absolute inset-0 flex items-center justify-center font-mono text-xl font-extrabold" style={{ color: 'var(--text)' }}>
                  {cur[k]}
                </div>
              </div>
              <span className="text-xs font-bold text-muted">{cap} L</span>
            </button>
          );
        })}
      </div>
      <Caption tone={solved ? (hist.length - 1 === best.moves ? 'ok' : 'warn') : 'neutral'}>
        {solved
          ? hist.length - 1 === best.moves
            ? t(`You measured 4 litres in **${hist.length - 1}** pours — the minimum!`, `Vous avez mesuré 4 litres en **${hist.length - 1}** versements — le minimum !`)
            : t(
                `4 litres in **${hist.length - 1}** pours. Breadth-first search finds a solution with only ${best.moves}.`,
                `4 litres en **${hist.length - 1}** versements. Le parcours en largeur trouve une solution avec seulement ${best.moves}.`,
              )
          : sel === null
            ? t('Click a jug to pour **from**…', 'Cliquez sur le récipient **à vider**…')
            : t(
                `…now click the jug to pour **into**. (You pour until the source is empty or the target is full.)`,
                `…puis cliquez sur le récipient **à remplir**. (On verse jusqu’à ce que la source soit vide ou la cible pleine.)`,
              )}
      </Caption>
      <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
        {hist.map((h, i) => (
          <span key={i} className={`rounded-md px-1.5 py-0.5 ${i === hist.length - 1 ? 'bg-brand-soft text-brand' : 'bg-surface-2 text-muted'}`}>
            ({h.join(',')})
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <button className="btn" onClick={() => setHist(hist.slice(0, -1))} disabled={hist.length < 2}>
          {t('Undo', 'Annuler')}
        </button>
        <button
          className="btn"
          onClick={() => {
            setHist([[8, 0, 0]]);
            setSel(null);
          }}
        >
          {t('Reset', 'Recommencer')}
        </button>
      </div>
    </Panel>
  );
}

/** BFS layers of the jug state space, to show how a systematic search finds the shortest solution. */
export function JugBfsLayers() {
  const layers = useMemo(() => {
    const key = (s: number[]) => s.join(',');
    const seen = new Set([key([8, 0, 0])]);
    let frontier = [[8, 0, 0]];
    const out: number[][][] = [frontier];
    while (frontier.length && !frontier.some((s) => s.includes(4))) {
      const next: number[][] = [];
      for (const s of frontier)
        for (let a = 0; a < 3; a++)
          for (let b = 0; b < 3; b++) {
            if (a === b || s[a] === 0 || s[b] === CAPS[b]) continue;
            const t = [...s];
            const m = Math.min(s[a], CAPS[b] - s[b]);
            t[a] -= m;
            t[b] += m;
            if (!seen.has(key(t))) {
              seen.add(key(t));
              next.push(t);
            }
          }
      out.push(next);
      frontier = next;
    }
    return out;
  }, []);
  const s = useStepper(layers.length);
  return (
    <Panel>
      <div className="space-y-1.5">
        {layers.slice(0, s.i + 1).map((layer, d) => (
          <motion.div key={d} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex flex-wrap items-center gap-1.5">
            <span className="w-16 shrink-0 text-xs font-semibold text-muted">{d} {t(`pour${d === 1 ? '' : 's'}`, `versement${d > 1 ? 's' : ''}`)}</span>
            {layer.map((st) => (
              <span
                key={st.join()}
                className={`rounded-md px-1.5 py-0.5 font-mono text-xs font-semibold ${st.includes(4) ? 'bg-v-done text-white' : 'bg-surface-2'}`}
              >
                ({st.join(',')})
              </span>
            ))}
          </motion.div>
        ))}
      </div>
      <Controls s={s} />
    </Panel>
  );
}
