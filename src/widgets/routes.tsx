import { useEffect, useState } from 'react';
import { Caption, GraphView, Legend, Panel, type CellTone, type GEdge, type GNode } from './kit';

export type WGraph = { nodes: GNode[]; edges: (GEdge & { w: number })[] };

const fmt = (d: number) => (d === Infinity ? '∞' : Number.isInteger(d) ? String(d) : d.toFixed(1));

export function dijkstra(g: WGraph, source: string) {
  const dist: Record<string, number> = Object.fromEntries(g.nodes.map((n) => [n.id, Infinity]));
  const prev: Record<string, string | null> = Object.fromEntries(g.nodes.map((n) => [n.id, null]));
  const done = new Set<string>();
  dist[source] = 0;
  while (done.size < g.nodes.length) {
    const u = g.nodes.filter((n) => !done.has(n.id)).sort((a, b) => dist[a.id] - dist[b.id])[0].id;
    if (dist[u] === Infinity) break;
    done.add(u);
    for (const e of g.edges) {
      const v = e.u === u ? e.v : !e.directed && e.v === u ? e.u : null;
      if (v && !done.has(v) && dist[u] + e.w < dist[v]) {
        dist[v] = dist[u] + e.w;
        prev[v] = u;
      }
    }
  }
  return { dist, prev };
}

export function DijkstraLab({
  graph,
  source,
  width,
  height,
  rect = false,
  onSolved,
  labels,
}: {
  graph: WGraph;
  source: string;
  width: number;
  height: number;
  rect?: boolean;
  onSolved?: () => void;
  labels?: Record<string, string>;
}) {
  const init = () => ({
    dist: { ...Object.fromEntries(graph.nodes.map((n) => [n.id, Infinity])), [source]: 0 } as Record<string, number>,
    prev: Object.fromEntries(graph.nodes.map((n) => [n.id, null])) as Record<string, string | null>,
    done: [] as string[],
    relaxed: [] as string[],
    msg: `All distances start at ∞, except the source ${labels?.[source] ?? source} at 0. Click the vertex to finalise next.`,
  });
  const [st, setSt] = useState(init);
  const [wrong, setWrong] = useState<string | null>(null);
  const finished = st.done.length === graph.nodes.length;
  useEffect(() => {
    if (finished) onSolved?.();
  }, [finished, onSolved]);
  const name = (id: string) => labels?.[id] ?? id;
  const open = graph.nodes.filter((n) => !st.done.includes(n.id));
  const best = Math.min(...open.map((n) => st.dist[n.id]));

  const pick = (u: string) => {
    if (finished || st.done.includes(u)) return;
    if (st.dist[u] !== best) {
      setWrong(
        st.dist[u] === Infinity
          ? `${name(u)} has not been reached yet (∞).`
          : `${name(u)} has tentative distance ${fmt(st.dist[u])}, but some unfinished vertex has ${fmt(best)}. Rule: always finalise the closest one.`,
      );
      return;
    }
    setWrong(null);
    const dist = { ...st.dist };
    const prev = { ...st.prev };
    const relaxed: string[] = [];
    const notes: string[] = [];
    for (const e of graph.edges) {
      const v = e.u === u ? e.v : !e.directed && e.v === u ? e.u : null;
      if (!v || st.done.includes(v)) continue;
      const cand = dist[u] + e.w;
      if (cand < dist[v]) {
        notes.push(`${name(v)}: ${fmt(dist[v])} → ${fmt(cand)}`);
        dist[v] = cand;
        prev[v] = u;
        relaxed.push(`${u}|${v}`);
      }
    }
    setSt({
      dist,
      prev,
      done: [...st.done, u],
      relaxed,
      msg: `Finalise ${name(u)} at distance ${fmt(dist[u])}. ${notes.length ? 'Relax its edges — ' + notes.join(', ') + '.' : 'No distance improves.'}`,
    });
  };

  const tone = (id: string): CellTone => (st.done.includes(id) ? 'done' : st.dist[id] === best && !finished ? 'active' : st.dist[id] < Infinity ? 'visit' : 'idle');
  const edgeTone = (e: GEdge) => {
    const inTree = st.prev[e.v] === e.u || (!e.directed && st.prev[e.u] === e.v);
    const isRelaxed = st.relaxed.includes(`${e.u}|${e.v}`) || st.relaxed.includes(`${e.v}|${e.u}`);
    return isRelaxed ? 'active' : inTree ? 'tree' : 'idle';
  };

  return (
    <Panel>
      <GraphView nodes={graph.nodes} edges={graph.edges} width={width} height={height} rect={rect} fill={tone} edgeTone={edgeTone} badge={(id) => fmt(st.dist[id])} onNodeClick={pick} />
      <Legend
        items={[
          { tone: 'done', label: 'finalised' },
          { tone: 'active', label: 'smallest tentative distance' },
          { tone: 'visit', label: 'reached (tentative)' },
        ]}
      />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-muted">
              <th className="py-1 pr-2 font-semibold">vertex</th>
              {graph.nodes.map((n) => (
                <th key={n.id} className="px-2 text-center font-semibold normal-case">
                  {name(n.id)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-border">
              <td className="py-1 pr-2 text-xs font-semibold text-muted">distance</td>
              {graph.nodes.map((n) => (
                <td key={n.id} className={`px-2 text-center font-mono font-semibold ${st.done.includes(n.id) ? 'text-ok' : ''}`}>
                  {fmt(st.dist[n.id])}
                </td>
              ))}
            </tr>
            <tr className="border-t border-border">
              <td className="py-1 pr-2 text-xs font-semibold text-muted">via</td>
              {graph.nodes.map((n) => (
                <td key={n.id} className="px-2 text-center font-mono text-muted">
                  {st.prev[n.id] ? name(st.prev[n.id]!) : '—'}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      {wrong ? <Caption tone="warn">{wrong}</Caption> : <Caption tone={finished ? 'ok' : 'neutral'}>{finished ? `${st.msg} All shortest distances are final.` : st.msg}</Caption>}
      <div className="flex gap-2">
        <button
          className="btn"
          onClick={() => {
            setSt(init());
            setWrong(null);
          }}
        >
          Reset
        </button>
        <button className="btn" disabled={finished} onClick={() => pick(open.find((n) => st.dist[n.id] === best)!.id)}>
          Show next move
        </button>
      </div>
    </Panel>
  );
}
