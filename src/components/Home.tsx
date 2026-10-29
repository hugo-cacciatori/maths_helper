import { CheckCircle2, ChevronRight, PlayCircle, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { allLessons, chapters } from '../content';
import { useProgress } from '../lib/store';

export function Home() {
  const { completed, stepOf, reset } = useProgress();
  const done = allLessons.filter((l) => completed[l.lesson.id]).length;
  const resume = allLessons.find((l) => !completed[l.lesson.id]);

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20">
      <header className="flex items-center gap-3 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-on-brand">
          <svg viewBox="0 0 32 32" width="26" height="26">
            <path d="M6 23 L13 12 L18 18 L26 8" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <div className="text-lg font-extrabold leading-tight">Algo Visual</div>
          <div className="text-xs font-medium text-muted">Algorithm analysis, one interactive step at a time</div>
        </div>
      </header>

      <section className="rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="flex-1">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">See the maths behind algorithms.</h1>
            <p className="mt-3 max-w-xl text-muted">
              Guided, hands-on lessons: play with growth curves, step
              through sorts, traverse graphs and solve the puzzles yourself — with instant feedback.
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <ProgressRing value={done} total={allLessons.length} />
            {resume && (
              <Link to={`/lesson/${resume.lesson.id}`} className="btn-primary">
                <PlayCircle size={18} /> {done === 0 ? 'Start learning' : 'Continue'}
              </Link>
            )}
          </div>
        </div>
      </section>

      <div className="mt-8 flex items-center gap-2">
        <h2 className="text-sm font-bold uppercase tracking-wide text-muted">Lessons</h2>
        {done > 0 && (
          <button
            className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-bad"
            onClick={() => confirm('Reset all progress?') && reset()}
          >
            <RotateCcw size={13} /> Reset progress
          </button>
        )}
      </div>

      <div className="mt-6 space-y-10">
          {chapters.map((ch, ci) => {
            const chDone = ch.lessons.filter((l) => completed[l.id]).length;
            return (
              <section key={ch.id}>
                <div className="mb-4 flex items-end gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft font-extrabold text-brand">{ci + 1}</div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-extrabold tracking-tight">{ch.title}</h2>
                    <p className="text-sm text-muted">
                      {ch.blurb}
                    </p>
                  </div>
                  <span className="chip shrink-0">
                    {chDone}/{ch.lessons.length}
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {ch.lessons.map((l) => {
                    const isDone = completed[l.id];
                    const inProgress = !isDone && (stepOf[l.id] ?? 0) > 0;
                    return (
                      <Link
                        key={l.id}
                        to={`/lesson/${l.id}`}
                        className="group flex flex-col rounded-2xl border border-border bg-surface p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md"
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex-1 font-bold leading-snug">{l.title}</div>
                          {isDone ? (
                            <CheckCircle2 size={20} className="shrink-0 text-ok" />
                          ) : (
                            <ChevronRight size={20} className="shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-brand" />
                          )}
                        </div>
                        <p className="mt-1.5 line-clamp-2 text-sm text-muted">{l.summary}</p>
                        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-3">
                          <span className="chip">{l.steps.length} steps</span>
                          {inProgress && <span className="chip !bg-brand-soft !text-brand">in progress</span>}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
      </div>
    </div>
  );
}

function ProgressRing({ value, total }: { value: number; total: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const p = total ? value / total : 0;
  return (
    <div className="flex items-center gap-3">
      <svg width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} fill="none" stroke="var(--surface-2)" strokeWidth="7" />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke="var(--ok)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${c * p} ${c}`}
          transform="rotate(-90 32 32)"
          style={{ transition: 'stroke-dasharray 0.6s' }}
        />
        <text x="32" y="37" textAnchor="middle" fontSize="14" fontWeight="800" fill="var(--text)">
          {Math.round(p * 100)}%
        </text>
      </svg>
      <div className="text-sm">
        <div className="font-bold">
          {value} / {total}
        </div>
        <div className="text-muted">lessons done</div>
      </div>
    </div>
  );
}
