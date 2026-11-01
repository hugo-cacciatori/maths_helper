import { CheckCircle2, ChevronRight, History, PlayCircle, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { allLessons, chapters } from '../content';
import { setLang, t } from '../lib/i18n';
import { useProgress } from '../lib/store';

export function Home() {
  const { completed, stepOf, missed, reset } = useProgress();
  const toReview = Object.values(missed).reduce((a, m) => a + m.length, 0);
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
          <div className="text-xs font-medium text-muted">{t('Algorithm analysis, one interactive step at a time', 'L’analyse d’algorithmes, une étape interactive à la fois')}</div>
        </div>
        <button
          lang={t('fr', 'en')}
          className="ml-auto self-start pt-1 text-xs font-semibold text-muted hover:text-brand"
          onClick={() => setLang(t('fr', 'en'))}
        >
          {t('Français', 'English')}
        </button>
      </header>

      <section className="rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="flex-1">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t('See the maths behind algorithms.', 'Voir les maths derrière les algorithmes.')}</h1>
            <p className="mt-3 max-w-xl text-muted">
              {t(
                'Guided, hands-on lessons: play with growth curves, step through sorts, traverse graphs and solve the puzzles yourself — with instant feedback.',
                'Des leçons guidées et pratiques : jouez avec des courbes de croissance, suivez des tris pas à pas, parcourez des graphes et résolvez les énigmes vous-même — avec un retour immédiat.',
              )}
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <ProgressRing value={done} total={allLessons.length} />
            {resume && (
              <Link to={`/lesson/${resume.lesson.id}`} className="btn-primary">
                <PlayCircle size={18} /> {done === 0 ? t('Start learning', 'Commencer') : t('Continue', 'Continuer')}
              </Link>
            )}
            {toReview > 0 && (
              <Link to="/review" className="btn !py-2">
                <History size={16} /> {t('Review mistakes', 'Revoir mes erreurs')} ({toReview})
              </Link>
            )}
          </div>
        </div>
      </section>

      <div className="mt-8 flex items-center gap-2">
        <h2 className="text-sm font-bold uppercase tracking-wide text-muted">{t('Lessons', 'Leçons')}</h2>
        {done > 0 && (
          <button
            className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-bad"
            onClick={() => confirm(t('Reset all progress?', 'Effacer toute la progression ?')) && reset()}
          >
            <RotateCcw size={13} /> {t('Reset progress', 'Réinitialiser')}
          </button>
        )}
      </div>

      <div className="mt-6 space-y-10">
          {chapters.map((ch, ci) => {
            const chDone = ch.lessons.filter((l) => completed[l.id]).length;
            return (
              <section key={ch.id}>
                <div className="mb-4 flex items-end gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft font-extrabold text-brand">{ci}</div>
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
                          {l.warmup && <span className="chip !bg-ok-soft !text-ok">{t('warm-up', 'échauffement')}</span>}
                          <span className="chip">{l.steps.length} {t('steps', 'étapes')}</span>
                          {inProgress && <span className="chip !bg-brand-soft !text-brand">{t('in progress', 'en cours')}</span>}
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
        <div className="text-muted">{t('lessons done', 'leçons terminées')}</div>
      </div>
    </div>
  );
}
