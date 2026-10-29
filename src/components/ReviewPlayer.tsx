import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, RotateCcw, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { allLessons } from '../content';
import { useProgress } from '../lib/store';
import { prefersReducedMotion, StepView } from './LessonPlayer';

/** Replays only the questions the learner missed; a question right at the first try leaves the list. */
export function ReviewPlayer() {
  const { missed, addMissed, removeMissed } = useProgress();
  // Snapshot at start so the queue doesn't shift while answering.
  const [queue] = useState(() =>
    allLessons.flatMap(({ lesson, chapter }) => (missed[lesson.id] ?? []).filter((i) => i < lesson.steps.length).map((idx) => ({ lesson, chapter, idx }))),
  );
  const [pos, setPos] = useState(0);
  const [cleared, setCleared] = useState(0);
  const item = queue[pos];
  const finished = pos >= queue.length;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 border-b border-border bg-bg/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
          <Link to="/" className="btn !px-2" aria-label="Back to lessons">
            <ArrowLeft size={18} />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-semibold text-muted">Review mistakes{item ? ` · ${item.lesson.title}` : ''}</div>
            <div className="font-bold">
              {finished ? 'Done' : `Question ${pos + 1} of ${queue.length}`}
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-4xl px-4 pb-3">
          <div className="h-1.5 overflow-hidden rounded-full bg-border">
            <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${(Math.min(pos, queue.length) / Math.max(queue.length, 1)) * 100}%` }} />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 pb-40 pt-6">
        <AnimatePresence mode="wait">
          {finished ? (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="mx-auto mt-10 max-w-md text-center">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-ok-soft text-ok">
                <Sparkles size={38} />
              </div>
              <h2 className="text-2xl font-extrabold">{queue.length === 0 ? 'Nothing to review' : 'Review finished'}</h2>
              <p className="mt-2 text-muted">
                {queue.length === 0
                  ? 'Questions you get wrong in a lesson will show up here.'
                  : `${cleared} of ${queue.length} answered right at the first try${cleared < queue.length ? ' — the others stay on your list.' : '.'}`}
              </p>
              <div className="mt-8 flex flex-col gap-3">
                {Object.keys(useProgress.getState().missed).length > 0 && (
                  <button className="btn-primary" onClick={() => location.reload()}>
                    <RotateCcw size={16} /> Review again
                  </button>
                )}
                <Link to="/" className="btn !py-2.5">
                  Back to all lessons
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div key={pos} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
              <StepView
                step={item.lesson.steps[item.idx]}
                seed={item.idx + item.lesson.id.length}
                onResult={(r) => {
                  if (r === 'clean') {
                    removeMissed(item.lesson.id, item.idx);
                    setCleared((c) => c + 1);
                  } else addMissed(item.lesson.id, item.idx);
                }}
                onAdvance={() => {
                  setPos(pos + 1);
                  window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
