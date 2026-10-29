import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, Check, Lightbulb, Sparkles, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProgress } from '../lib/store';
import type { Chapter, Lesson, Step } from '../lib/types';
import { Prose, renderInline } from './Prose';

type Verdict = null | 'right' | 'wrong';

function shuffled<T>(arr: T[], seed: number) {
  // Deterministic shuffle so tokens don't jump around on re-render.
  const a = [...arr];
  let s = seed || 1;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function LessonPlayer({ lesson, chapter, nextLesson }: { lesson: Lesson; chapter: Chapter; nextLesson?: Lesson }) {
  const { stepOf, setStep, complete } = useProgress();
  const [idx, setIdx] = useState(() => Math.min(stepOf[lesson.id] ?? 0, lesson.steps.length - 1));
  const [finished, setFinished] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIdx(Math.min(useProgress.getState().stepOf[lesson.id] ?? 0, lesson.steps.length - 1));
    setFinished(false);
  }, [lesson.id, lesson.steps.length]);

  const step = lesson.steps[idx];

  const advance = () => {
    if (idx + 1 >= lesson.steps.length) {
      complete(lesson.id);
      setFinished(true);
    } else {
      setIdx(idx + 1);
      setStep(lesson.id, idx + 1);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 border-b border-border bg-bg/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
          <Link to="/" className="btn !px-2" aria-label="Back to lessons">
            <ArrowLeft size={18} />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-semibold text-muted">
              {chapter.title}
            </div>
            <div className="truncate font-bold">{lesson.title}</div>
          </div>
        </div>
        <div className="mx-auto flex max-w-4xl gap-1 px-4 pb-3">
          {lesson.steps.map((_, i) => (
            <button
              key={i}
              onClick={() => i <= (stepOf[lesson.id] ?? 0) && !finished && setIdx(i)}
              aria-label={`Step ${i + 1}`}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                finished || i < idx ? 'bg-ok' : i === idx ? 'bg-brand' : 'bg-border'
              }`}
            />
          ))}
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 pb-40 pt-6">
        <AnimatePresence mode="wait">
          {finished ? (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="mx-auto mt-10 max-w-md text-center">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-ok-soft text-ok">
                <Sparkles size={38} />
              </div>
              <h2 className="text-2xl font-extrabold">Lesson complete!</h2>
              <p className="mt-2 text-muted">{lesson.summary}</p>
              <div className="mt-8 flex flex-col gap-3">
                {nextLesson && (
                  <button className="btn-primary" onClick={() => navigate(`/lesson/${nextLesson.id}`)}>
                    Next: {nextLesson.title}
                  </button>
                )}
                <Link to="/" className="btn !py-2.5">
                  Back to all lessons
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={`${lesson.id}-${idx}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >
              <StepView step={step} seed={idx + lesson.id.length} onAdvance={advance} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export function StepView({ step, seed, onAdvance }: { step: Step; seed: number; onAdvance: () => void }) {
  const [solved, setSolved] = useState(false);
  const [verdict, setVerdict] = useState<Verdict>(null);
  const [tries, setTries] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [choice, setChoice] = useState<number | null>(null);
  const [num, setNum] = useState('');
  const [seq, setSeq] = useState<number[]>([]);
  const onSolved = useCallback(() => setSolved(true), []);

  const tokens = useMemo(
    () => (step.kind === 'sequence' ? (step.keepOrder ? step.tokens : shuffled(step.tokens, seed)) : []),
    [step, seed],
  );

  const isQuestion = step.kind === 'choice' || step.kind === 'number' || step.kind === 'sequence';
  const canCheck =
    (step.kind === 'choice' && choice !== null) ||
    (step.kind === 'number' && num.trim() !== '' && !Number.isNaN(Number(num.replace(',', '.')))) ||
    (step.kind === 'sequence' && seq.length === step.answer.length);

  const check = () => {
    let ok = false;
    if (step.kind === 'choice') ok = choice === step.answer;
    if (step.kind === 'number') ok = Math.abs(Number(num.replace(',', '.')) - step.answer) <= (step.tolerance ?? 1e-9);
    if (step.kind === 'sequence') ok = seq.map((k) => tokens[k]).join('|') === step.answer.join('|');
    setVerdict(ok ? 'right' : 'wrong');
    setTries((t) => t + 1);
  };

  const reveal = () => {
    if (step.kind === 'choice') setChoice(step.answer);
    if (step.kind === 'number') setNum(String(step.answer));
    if (step.kind === 'sequence') {
      const used = new Set<number>();
      setSeq(
        step.answer.map((a) => {
          const k = tokens.findIndex((t, j) => t === a && !used.has(j));
          used.add(k);
          return k;
        }),
      );
    }
    setVerdict('right');
  };

  const retry = () => {
    setVerdict(null);
    if (step.kind === 'sequence') setSeq([]);
  };

  const locked = verdict === 'right';
  const explain = 'explain' in step ? step.explain : step.kind === 'task' ? step.success : '';

  return (
    <div>
      {step.title && <h1 className="mb-3 text-2xl font-extrabold tracking-tight sm:text-[28px]">{step.title}</h1>}
      <Prose text={step.body} className="text-[16.5px]" />

      {step.widget && (
        <div className="mt-5 rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5">{step.widget({ onSolved })}</div>
      )}

      {step.hint && !locked && (
        <div className="mt-4">
          {showHint ? (
            <div className="flex gap-2 rounded-xl bg-warn-soft px-4 py-3 text-sm">
              <Lightbulb size={18} className="mt-0.5 shrink-0 text-warn" />
              <div>{renderInline(step.hint)}</div>
            </div>
          ) : (
            <button className="inline-flex items-center gap-1.5 text-sm font-semibold text-warn hover:underline" onClick={() => setShowHint(true)}>
              <Lightbulb size={16} /> Need a hint?
            </button>
          )}
        </div>
      )}

      {/* answer area */}
      {step.kind === 'choice' && (
        <div className="mt-5 grid gap-2.5">
          {step.options.map((o, i) => {
            const picked = choice === i;
            const state = locked && i === step.answer ? 'right' : verdict === 'wrong' && picked ? 'wrong' : picked ? 'picked' : 'none';
            return (
              <button
                key={i}
                disabled={locked}
                onClick={() => {
                  setChoice(i);
                  if (verdict === 'wrong') setVerdict(null);
                }}
                className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition ${
                  state === 'right'
                    ? 'border-ok bg-ok-soft'
                    : state === 'wrong'
                      ? 'border-bad bg-bad-soft'
                      : state === 'picked'
                        ? 'border-brand bg-brand-soft'
                        : 'border-border bg-surface hover:border-brand/50'
                }`}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-xs font-bold text-muted">
                  {String.fromCharCode(65 + i)}
                </span>
                <span>{renderInline(o)}</span>
              </button>
            );
          })}
        </div>
      )}

      {step.kind === 'number' && (
        <div className="mt-5 flex items-center gap-3">
          <input
            inputMode="decimal"
            value={num}
            disabled={locked}
            onChange={(e) => {
              setNum(e.target.value);
              if (verdict === 'wrong') setVerdict(null);
            }}
            onKeyDown={(e) => e.key === 'Enter' && canCheck && !locked && check()}
            placeholder="Your answer"
            className={`w-48 rounded-xl border-2 bg-surface px-4 py-2.5 font-mono text-lg outline-none transition focus:border-brand ${
              verdict === 'right' ? 'border-ok' : verdict === 'wrong' ? 'border-bad' : 'border-border'
            }`}
          />
          {step.suffix && <span className="text-muted">{renderInline(step.suffix)}</span>}
        </div>
      )}

      {step.kind === 'sequence' && (
        <div className="mt-5 space-y-3">
          <div
            className={`flex min-h-14 flex-wrap items-center gap-2 rounded-xl border-2 border-dashed p-2.5 ${
              verdict === 'right' ? 'border-ok bg-ok-soft' : verdict === 'wrong' ? 'border-bad bg-bad-soft' : 'border-border'
            }`}
          >
            {seq.length === 0 && <span className="px-2 text-sm text-muted">Tap the items below in order…</span>}
            {seq.map((k, i) => (
              <button
                key={i}
                disabled={locked}
                onClick={() => {
                  setSeq(seq.slice(0, i));
                  setVerdict(null);
                }}
                className="rounded-lg bg-brand px-3 py-1.5 font-mono text-sm font-bold text-on-brand"
                title="Remove this and everything after it"
              >
                {tokens[k]}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {tokens.map((t, k) => (
              <button
                key={k}
                disabled={seq.includes(k) || locked}
                onClick={() => {
                  setSeq([...seq, k]);
                  setVerdict(null);
                }}
                className="rounded-lg border-2 border-border bg-surface px-3 py-1.5 font-mono text-sm font-bold transition hover:border-brand disabled:opacity-25"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* bottom action bar */}
      <div className="fixed inset-x-0 bottom-0 z-30">
        <AnimatePresence>
          {(verdict || (step.kind === 'task' && solved)) && (
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className={`border-t ${verdict === 'wrong' ? 'border-bad/30 bg-bad-soft' : 'border-ok/30 bg-ok-soft'}`}
            >
              <div className="mx-auto flex max-w-4xl gap-3 px-4 pt-4">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${verdict === 'wrong' ? 'bg-bad' : 'bg-ok'} text-white`}
                >
                  {verdict === 'wrong' ? <X size={18} /> : <Check size={18} />}
                </div>
                <div className="max-h-[38vh] min-w-0 flex-1 overflow-y-auto pb-1 text-sm">
                  <div className={`font-bold ${verdict === 'wrong' ? 'text-bad' : 'text-ok'}`}>
                    {verdict === 'wrong' ? 'Not quite — have another go.' : 'Nice!'}
                  </div>
                  {verdict !== 'wrong' && explain && <Prose text={explain} className="mt-1 text-text" />}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div
          className={`border-t border-border ${verdict === 'wrong' ? 'bg-bad-soft' : verdict === 'right' || (step.kind === 'task' && solved) ? 'bg-ok-soft' : 'bg-surface'}`}
        >
          <div className="mx-auto flex max-w-4xl items-center justify-end gap-3 px-4 py-3">
            {isQuestion && verdict === 'wrong' && tries >= 2 && (
              <button className="btn !py-2.5" onClick={reveal}>
                Show answer
              </button>
            )}
            {step.kind === 'task' && !solved && <span className="mr-auto text-sm text-muted">Complete the activity to continue</span>}
            {step.kind === 'task' && !solved && (
              <button className="btn !py-2.5" onClick={() => setSolved(true)}>
                Skip
              </button>
            )}
            {isQuestion && !locked ? (
              verdict === 'wrong' ? (
                <button className="btn-primary min-w-32" onClick={retry}>
                  Try again
                </button>
              ) : (
                <button className="btn-primary min-w-32" disabled={!canCheck} onClick={check}>
                  Check
                </button>
              )
            ) : (
              <button className="btn-primary min-w-32" disabled={step.kind === 'task' && !solved} onClick={onAdvance}>
                Continue
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
