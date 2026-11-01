import { motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { t } from '../lib/i18n';
import { Caption, Controls, Panel, Slider, Stat, TreeView, useStepper, type CellTone, type TNode } from './kit';

/* ======================= River crossing ======================= */

type Bank = { kids: number; soldiers: number };
type RiverState = { left: Bank; right: Bank; boat: 'left' | 'right'; crossings: number };
type Load = 'kids2' | 'kid1' | 'soldier';

export function riverMove(s: RiverState, load: Load): RiverState | null {
  const from = s.boat === 'left' ? s.left : s.right;
  const need = load === 'kids2' ? { kids: 2, soldiers: 0 } : load === 'kid1' ? { kids: 1, soldiers: 0 } : { kids: 0, soldiers: 1 };
  if (from.kids < need.kids || from.soldiers < need.soldiers) return null;
  const take = (b: Bank, sign: number): Bank => ({ kids: b.kids + sign * need.kids, soldiers: b.soldiers + sign * need.soldiers });
  return s.boat === 'left'
    ? { left: take(s.left, -1), right: take(s.right, 1), boat: 'right', crossings: s.crossings + 1 }
    : { left: take(s.left, 1), right: take(s.right, -1), boat: 'left', crossings: s.crossings + 1 };
}

const riverStart = (n: number): RiverState => ({ left: { kids: 2, soldiers: n }, right: { kids: 0, soldiers: 0 }, boat: 'left', crossings: 0 });
export const riverDone = (s: RiverState, n: number) => s.right.soldiers === n && s.left.kids === 2 && s.boat === 'left';

function People({ bank }: { bank: Bank }) {
  return (
    <div className="flex min-h-24 flex-wrap content-start justify-center gap-1.5">
      {Array.from({ length: bank.soldiers }, (_, i) => (
        <motion.span layout key={`s${i}`} className="flex h-10 w-8 items-end justify-center rounded-t-full rounded-b-md bg-[#4d7c0f] pb-0.5 text-[10px] font-bold text-white">
          S
        </motion.span>
      ))}
      {Array.from({ length: bank.kids }, (_, i) => (
        <motion.span layout key={`k${i}`} className="mt-3 flex h-7 w-6 items-end justify-center rounded-t-full rounded-b-md bg-v-active pb-0.5 text-[10px] font-bold text-white">
          {t('k', 'e')}
        </motion.span>
      ))}
    </div>
  );
}

export function RiverCrossing({ initialN = 2, onSolved }: { initialN?: number; onSolved?: () => void }) {
  const [n, setN] = useState(initialN);
  const [hist, setHist] = useState<RiverState[]>([riverStart(initialN)]);
  const s = hist[hist.length - 1];
  const done = riverDone(s, n);
  useEffect(() => {
    if (done) onSolved?.();
  }, [done, onSolved]);
  const go = (l: Load) => {
    const t = riverMove(s, l);
    if (t) setHist([...hist, t]);
  };
  const reset = (m = n) => {
    setN(m);
    setHist([riverStart(m)]);
  };
  const loads: { l: Load; label: string }[] = [
    { l: 'kids2', label: t('two kids', 'deux enfants') },
    { l: 'kid1', label: t('one kid', 'un enfant') },
    { l: 'soldier', label: t('one soldier', 'un soldat') },
  ];
  return (
    <Panel>
      <div className="grid grid-cols-[1fr_72px_1fr] items-stretch gap-2" role="img" aria-label={t(
          `Left bank: ${s.left.soldiers} soldiers, ${s.left.kids} kids. Right bank: ${s.right.soldiers} soldiers, ${s.right.kids} kids. Boat on the ${s.boat}.`,
          `Rive gauche : ${s.left.soldiers} soldats, ${s.left.kids} enfants. Rive droite : ${s.right.soldiers} soldats, ${s.right.kids} enfants. Barque à ${s.boat === 'left' ? 'gauche' : 'droite'}.`,
        )}>
        <div className="rounded-xl bg-surface-2 p-2">
          <div className="mb-1 text-center text-[11px] font-bold uppercase tracking-wide text-muted">{t('start bank', 'rive de départ')}</div>
          <People bank={s.left} />
        </div>
        <div className="relative rounded-xl" style={{ background: 'color-mix(in srgb, #3b82f6 30%, transparent)' }}>
          <motion.div
            initial={false}
            animate={{ left: s.boat === 'left' ? '6%' : '50%' }}
            transition={{ type: 'spring', stiffness: 120, damping: 18 }}
            className="absolute top-[42%] h-5 w-[44%] rounded-b-full bg-[#7c4a2d]"
            title={s.boat === 'left' ? t('boat on the start bank', 'barque sur la rive de départ') : t('boat on the far bank', 'barque sur l’autre rive')}
          />
          <div className="absolute inset-x-0 bottom-1 text-center text-[10px] font-bold text-muted">
            {s.boat === 'left' ? t('← boat', '← barque') : t('boat →', 'barque →')}
          </div>
        </div>
        <div className="rounded-xl bg-surface-2 p-2">
          <div className="mb-1 text-center text-[11px] font-bold uppercase tracking-wide text-muted">{t('far bank', 'autre rive')}</div>
          <People bank={s.right} />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {loads.map(({ l, label }) => (
          <button key={l} className="btn-primary !px-3" disabled={done || !riverMove(s, l)} onClick={() => go(l)}>
            {t('Row', 'Faire passer')} {label} {s.boat === 'left' ? '→' : '←'}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Stat label={t('crossings', 'traversées')} value={s.crossings} tone="brand" />
        <Stat label={t('soldiers across', 'soldats passés')} value={`${s.right.soldiers} / ${n}`} />
      </div>
      <Caption tone={done ? (s.crossings === 4 * n ? 'ok' : 'warn') : 'neutral'}>
        {done
          ? s.crossings === 4 * n
            ? t(
                `Everyone across in **${s.crossings}** crossings, and the kids still have their boat.`,
                `Tout le monde a traversé en **${s.crossings}** traversées, et les enfants ont toujours leur barque.`,
              )
            : t(`Done in ${s.crossings} crossings — it can be done in ${4 * n}.`, `Fait en ${s.crossings} traversées — c’est faisable en ${4 * n}.`)
          : t(
              'The boat carries two kids, or one kid, or one soldier. Goal: all soldiers on the far bank, both kids back home with the boat.',
              'La barque porte deux enfants, ou un enfant, ou un soldat. But : tous les soldats sur l’autre rive, les deux enfants revenus chez eux avec la barque.',
            )}
      </Caption>
      <div className="flex flex-wrap items-center gap-2">
        <button className="btn" onClick={() => setHist(hist.slice(0, -1))} disabled={hist.length < 2}>
          {t('Undo', 'Annuler')}
        </button>
        <button className="btn" onClick={() => reset()}>
          {t('Reset', 'Recommencer')}
        </button>
        <div className="min-w-48 flex-1">
          <Slider label={t('soldiers', 'soldats')} value={n} min={1} max={5} onChange={(v) => reset(v)} />
        </div>
      </div>
    </Panel>
  );
}

/* ======================= Glasses ======================= */

export const glassTarget = (len: number) => Array.from({ length: len }, (_, i) => i % 2 === 0);

export function GlassRow({ initial, onSolved }: { initial: boolean[]; onSolved?: () => void }) {
  const [glasses, setGlasses] = useState(initial.map((full, id) => ({ id, full })));
  const [sel, setSel] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const target = glassTarget(initial.length);
  const done = glasses.every((g, i) => g.full === target[i]);
  const best = initial.reduce((a, full, i) => a + (full && !target[i] ? 1 : 0), 0);
  useEffect(() => {
    if (done) onSolved?.();
  }, [done, onSolved]);
  const click = (i: number) => {
    if (done) return;
    if (sel === null) return setSel(i);
    if (sel !== i) {
      const g = [...glasses];
      [g[sel], g[i]] = [g[i], g[sel]];
      setGlasses(g);
      setMoves((m) => m + 1);
    }
    setSel(null);
  };
  return (
    <Panel>
      <div className="flex flex-wrap justify-center gap-1.5 py-2">
        {glasses.map((g, i) => (
          <motion.button
            layout
            key={g.id}
            onClick={() => click(i)}
            aria-label={g.full ? t(`Glass ${i + 1}, full`, `Verre ${i + 1}, plein`) : t(`Glass ${i + 1}, empty`, `Verre ${i + 1}, vide`)}
            className="relative h-14 w-10 overflow-hidden rounded-b-lg border-[3px]"
            style={{
              borderColor: sel === i ? 'var(--v-active)' : target[i] === g.full ? 'var(--v-done)' : 'var(--v-idle-stroke)',
              clipPath: 'polygon(0 0, 100% 0, 88% 100%, 12% 100%)',
            }}
          >
            {g.full && <div className="absolute inset-x-0 bottom-0 h-4/5" style={{ background: '#b45309', opacity: 0.85 }} />}
          </motion.button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Stat label={t('swaps', 'échanges')} value={moves} tone="brand" />
        <Stat label={t('goal', 'but')} value={t('full, empty, full, …', 'plein, vide, plein, …')} />
      </div>
      <Caption tone={done ? (moves === best ? 'ok' : 'warn') : 'neutral'}>
        {done
          ? moves === best
            ? t(`Alternating in **${moves}** swap${moves === 1 ? '' : 's'} — the minimum.`, `Alternés en **${moves}** échange${moves > 1 ? 's' : ''} — le minimum.`)
            : t(`Alternating in ${moves} swaps. ${best} would have been enough.`, `Alternés en ${moves} échanges. ${best} auraient suffi.`)
          : t(
              'Click two glasses to swap them. Green rim = already right for its position.',
              'Cliquez sur deux verres pour les échanger. Bord vert = déjà correct pour sa position.',
            )}
      </Caption>
      <button
        className="btn self-start"
        onClick={() => {
          setGlasses(initial.map((full, id) => ({ id, full })));
          setMoves(0);
          setSel(null);
        }}
      >
        {t('Reset', 'Recommencer')}
      </button>
    </Panel>
  );
}

/* ======================= Cutting a strand into 1 cm pieces ======================= */

export const halveAll = (pieces: number[]) => pieces.flatMap((p) => (p > 1 ? [Math.ceil(p / 2), Math.floor(p / 2)] : [p]));

export function HairCutter({ onSolved }: { onSolved?: () => void }) {
  const [n, setN] = useState(10);
  const [pieces, setPieces] = useState<number[]>([10]);
  const [cuts, setCuts] = useState(0);
  const done = pieces.every((p) => p === 1);
  const best = Math.ceil(Math.log2(n));
  useEffect(() => {
    if (done && cuts === best) onSolved?.();
  }, [done, cuts, best, onSolved]);
  const reset = (m = n) => {
    setN(m);
    setPieces([m]);
    setCuts(0);
  };
  const longest = Math.max(...pieces);
  return (
    <Panel>
      <div className="space-y-1" role="img" aria-label={t(`${pieces.length} pieces`, `${pieces.length} morceaux`)}>
        {[...pieces]
          .sort((a, b) => b - a)
          .map((p, i) => (
            <motion.div layout key={`${i}-${p}`} className="h-2.5 rounded-full bg-[#78350f]" style={{ width: `${(p / n) * 100}%`, minWidth: 6 }} />
          ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Stat label={t('cuts', 'coupes')} value={cuts} tone="brand" />
        <Stat label={t('pieces', 'morceaux')} value={`${pieces.length} / ${n}`} />
      </div>
      <Caption tone={done ? (cuts === best ? 'ok' : 'warn') : 'neutral'}>
        {done
          ? cuts === best
            ? t(`${n} pieces with **${cuts}** cuts — the minimum.`, `${n} morceaux en **${cuts}** coupes — le minimum.`)
            : t(`${n} pieces with ${cuts} cuts. ${best} is possible.`, `${n} morceaux en ${cuts} coupes. ${best} est possible.`)
          : t(
              'Each cut is one stroke of the scissors. You may cut several pieces at once by laying them side by side.',
              'Chaque coupe est un coup de ciseaux. On peut couper plusieurs morceaux à la fois en les posant côte à côte.',
            )}
      </Caption>
      <div className="flex flex-wrap gap-2">
        <button
          className="btn-primary"
          disabled={done}
          onClick={() => {
            setPieces(halveAll(pieces));
            setCuts(cuts + 1);
          }}
        >
          {t('Line up all pieces, cut them in half', 'Aligner tous les morceaux, les couper en deux')}
        </button>
        <button
          className="btn"
          disabled={done}
          onClick={() => {
            const i = pieces.indexOf(longest);
            setPieces([...pieces.slice(0, i), 1, longest - 1, ...pieces.slice(i + 1)]);
            setCuts(cuts + 1);
          }}
        >
          {t('Cut 1 cm off the longest', 'Couper 1 cm du plus long')}
        </button>
        <button className="btn" onClick={() => reset()}>
          {t('Reset', 'Recommencer')}
        </button>
      </div>
      <Slider label={t('length (cm)', 'longueur (cm)')} value={n} min={2} max={32} onChange={(v) => reset(v)} />
    </Panel>
  );
}

/* ======================= Walks in a search tree ======================= */

export function bstFrom(keys: number[]): TNode | null {
  let root: TNode | null = null;
  const insert = (t: TNode | null, k: number): TNode => {
    if (!t) return { id: String(k), label: String(k) };
    if (k < Number(t.id)) return { ...t, left: insert(t.left ?? null, k) };
    return { ...t, right: insert(t.right ?? null, k) };
  };
  for (const k of keys) root = insert(root, k);
  return root;
}

export const inorder = (t: TNode | null | undefined): string[] => (t ? [...inorder(t.left), t.id, ...inorder(t.right)] : []);
const reverseInorder = (t: TNode | null | undefined): string[] => (t ? [...reverseInorder(t.right), t.id, ...reverseInorder(t.left)] : []);

export function maxPath(t: TNode | null): string[] {
  const path: string[] = [];
  for (let cur = t; cur; cur = cur.right ?? null) path.push(cur.id);
  return path;
}

export function BstWalk({ keys, mode, onSolved }: { keys: number[]; mode: 'max' | 'descending'; onSolved?: () => void }) {
  const tree = useMemo(() => bstFrom(keys), [keys]);
  const order = useMemo(() => (mode === 'max' ? maxPath(tree) : reverseInorder(tree)), [tree, mode]);
  const s = useStepper(order.length + 1, onSolved, 700);
  const seen = order.slice(0, s.i);
  const cur = seen[seen.length - 1];
  const tone = (id: string): CellTone => (id === cur ? 'active' : seen.includes(id) ? (mode === 'max' ? 'visit' : 'done') : 'idle');
  const finished = s.i === order.length;
  return (
    <Panel>
      <TreeView root={tree} fill={tone} colW={44} rowH={58} minWidth={320} />
      <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-xl bg-surface-2 px-3 py-2 font-mono text-sm">
        <span className="font-sans text-xs font-semibold text-muted">{mode === 'max' ? t('path:', 'chemin :') : t('printed:', 'affichées :')}</span>
        {seen.map((k) => (
          <span key={k} className="rounded-md bg-v-visit px-1.5 py-0.5 font-bold text-white">
            {k}
          </span>
        ))}
      </div>
      <Caption tone={finished ? 'ok' : 'neutral'}>
        {mode === 'max'
          ? finished
            ? t(
                `${cur} has no right child: it is the largest key. ${order.length} nodes visited — the height of the tree plus one at most.`,
                `${cur} n’a pas d’enfant droit : c’est la plus grande clé. ${order.length} nœuds visités — au plus la hauteur de l’arbre plus un.`,
              )
            : s.i === 0
              ? t('Start at the root and keep going right: larger keys are always on the right.', 'Partez de la racine et allez toujours à droite : les clés plus grandes sont toujours à droite.')
              : t(`${cur}: anything larger is in its right subtree.`, `${cur} : tout ce qui est plus grand est dans son sous-arbre droit.`)
          : finished
            ? t('Every key printed in decreasing order: right subtree, node, left subtree.', 'Toutes les clés affichées par ordre décroissant : sous-arbre droit, nœud, sous-arbre gauche.')
            : s.i === 0
              ? t(
                  'Print the right subtree first (larger keys), then the node, then the left subtree.',
                  'Affichez d’abord le sous-arbre droit (clés plus grandes), puis le nœud, puis le sous-arbre gauche.',
                )
              : t(`Print ${cur}.`, `On affiche ${cur}.`)}
      </Caption>
      <Controls s={s} />
    </Panel>
  );
}

export function BstCompare({ a, b }: { a: number[]; b: number[] }) {
  const ta = bstFrom(a);
  const tb = bstFrom(b);
  const ia = inorder(ta);
  const ib = inorder(tb);
  const same = ia.join() === ib.join();
  return (
    <Panel>
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          { t: ta, keys: a, io: ia },
          { t: tb, keys: b, io: ib },
        ].map((x, i) => (
          <div key={i} className="rounded-xl bg-surface-2 p-2">
            <div className="text-center text-xs font-semibold text-muted">
              {t('inserted in order', 'insérées dans l’ordre')} {x.keys.join(' ')}
            </div>
            <TreeView root={x.t} r={15} colW={34} rowH={48} />
            <div className="text-center font-mono text-sm">
              <span className="font-sans text-xs text-muted">{t('in-order: ', 'infixe : ')}</span>
              {x.io.join(' ')}
            </div>
          </div>
        ))}
      </div>
      <Caption tone={same ? 'ok' : 'warn'}>
        {same
          ? t('Different shapes, same in-order sequence: they hold exactly the same keys.', 'Formes différentes, même suite infixe : ils contiennent exactement les mêmes clés.')
          : t('The in-order sequences differ: the trees hold different keys.', 'Les suites infixes diffèrent : les arbres contiennent des clés différentes.')}
      </Caption>
    </Panel>
  );
}
