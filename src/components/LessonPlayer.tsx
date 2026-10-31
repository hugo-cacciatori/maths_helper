import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, Check, Dices, Lightbulb, Sparkles, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBackHome } from '../lib/nav';
import { useProgress } from '../lib/store';
import { freshSeed, rng } from '../lib/random';
import { useSwipe } from '../lib/swipe';
import type { Chapter, Lesson, ShownStep, Step } from '../lib/types';
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
  const { stepOf, completed, setStep, complete, addMissed, removeMissed } = useProgress();
  const [idx, setIdx] = useState(() => Math.min(stepOf[lesson.id] ?? 0, lesson.steps.length - 1));
  const [finished, setFinished] = useState(false);
  /** How the current step was reached: 0 = Continue, 1 = forward, -1 = back (swipe, keys or step bar). */
  const [dir, setDir] = useState(0);
  const navigate = useNavigate();
  const backHome = useBackHome();
  const root = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const furthest = completed[lesson.id] ? lesson.steps.length - 1 : (stepOf[lesson.id] ?? 0);

  useEffect(() => {
    setIdx(Math.min(useProgress.getState().stepOf[lesson.id] ?? 0, lesson.steps.length - 1));
    setFinished(false);
  }, [lesson.id, lesson.steps.length]);

  const step = lesson.steps[idx];
  const scrollTop = () => window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });

  const advance = () => {
    setDir(0);
    if (idx + 1 >= lesson.steps.length) {
      complete(lesson.id);
      setFinished(true);
    } else {
      setIdx(idx + 1);
      setStep(lesson.id, idx + 1);
    }
    scrollTop();
  };

  const goTo = (i: number) => {
    if (finished || i === idx || i < 0 || i > furthest || i >= lesson.steps.length) return;
    setDir(Math.sign(i - idx));
    setIdx(i);
    scrollTop();
  };
  // Back to any earlier step; forward only to steps already reached, so nothing unanswered is skipped.
  const prev = !finished && idx > 0 ? () => goTo(idx - 1) : undefined;
  const next = !finished && idx < Math.min(furthest, lesson.steps.length - 1) ? () => goTo(idx + 1) : undefined;
  useSwipe(root, { onLeft: next, onRight: prev, follow: content });

  const arrows = useRef<(e: KeyboardEvent) => void>(() => {});
  arrows.current = (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey || !keyTargetIsFree(e.target)) return;
    const go = e.key === 'ArrowLeft' ? prev : e.key === 'ArrowRight' ? next : undefined;
    if (!go) return;
    e.preventDefault();
    go();
  };
  useEffect(() => {
    const h = (e: KeyboardEvent) => arrows.current(e);
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  return (
    <div ref={root} className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 border-b border-border bg-bg/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
          <Link to="/" onClick={backHome} className="btn !px-2" aria-label="Back to lessons">
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
              onClick={() => goTo(i)}
              aria-label={`Step ${i + 1}`}
              aria-current={!finished && i === idx ? 'step' : undefined}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                finished || i < idx ? 'bg-ok' : i === idx ? 'bg-brand' : 'bg-border'
              }`}
            />
          ))}
        </div>
      </header>

      <main ref={content} className="mx-auto w-full max-w-4xl flex-1 px-4 pb-40 pt-6">
        <AnimatePresence mode="wait" custom={dir}>
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
                <Link to="/" onClick={backHome} className="btn !py-2.5">
                  Back to all lessons
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={`${lesson.id}-${idx}`}
              custom={dir}
              variants={stepMotion}
              initial="enter"
              animate="shown"
              exit="leave"
              transition={{ duration: 0.22 }}
            >
              <StepView
                step={step}
                seed={idx + lesson.id.length}
                onAdvance={advance}
                onResult={(r) => (r === 'missed' ? addMissed(lesson.id, idx) : removeMissed(lesson.id, idx))}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

/** Continue rises into place; stepping back and forth slides sideways, following the swipe. */
const stepMotion = {
  enter: (d: number) => (d ? { opacity: 0, x: 32 * d } : { opacity: 0, y: 12 }),
  shown: { opacity: 1, x: 0, y: 0 },
  leave: (d: number) => (d ? { opacity: 0, x: -32 * d } : { opacity: 0, y: -8 }),
};

export const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Enter / number keys must not hijack typing or the controls inside an interactive widget. */
function keyTargetIsFree(t: EventTarget | null) {
  const el = t as HTMLElement | null;
  if (!el || !el.closest) return true;
  if (el.closest('input, textarea, select, [contenteditable="true"]')) return false;
  return !el.closest('[data-widget]');
}

export const resolveStep = (step: Step, variant: number): ShownStep => (step.kind === 'generated' ? step.make(rng(variant)) : step);

type StepViewProps = {
  step: Step;
  seed: number;
  /** Seed for a generated step's values; a fresh one is drawn when omitted. */
  variant?: number;
  onAdvance: () => void;
  /** Called once per question: 'missed' after a wrong try or a reveal, 'clean' when right at the first try. */
  onResult?: (r: 'missed' | 'clean') => void;
};

export function StepView({ step, variant: initialVariant, ...rest }: StepViewProps) {
  const [variant, setVariant] = useState(() => initialVariant ?? freshSeed());
  const shown = useMemo(() => resolveStep(step, variant), [step, variant]);
  const newNumbers = step.kind === 'generated' ? () => setVariant(freshSeed()) : undefined;
  return <ShownStepView key={variant} step={shown} onNewNumbers={newNumbers} {...rest} />;
}

function ShownStepView({
  step,
  seed,
  onAdvance,
  onResult,
  onNewNumbers,
}: Omit<StepViewProps, 'step' | 'variant'> & { step: ShownStep; onNewNumbers?: () => void }) {
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
    if (!ok && tries === 0) onResult?.('missed');
    if (ok && tries === 0) onResult?.('clean');
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
  const canContinue = !isQuestion ? step.kind !== 'task' || solved : locked;

  // Keyboard: Enter = main button, 1–9 / A–F = pick a choice.
  const keys = useRef<(e: KeyboardEvent) => void>(() => {});
  keys.current = (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || !keyTargetIsFree(e.target)) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      if (isQuestion && !locked) {
        if (verdict === 'wrong') retry();
        else if (canCheck) check();
      } else if (canContinue) onAdvance();
      return;
    }
    if (step.kind === 'choice' && !locked) {
      const k = /^[1-9]$/.test(e.key) ? Number(e.key) - 1 : /^[a-f]$/i.test(e.key) ? e.key.toLowerCase().charCodeAt(0) - 97 : -1;
      if (k >= 0 && k < step.options.length) {
        setChoice(k);
        if (verdict === 'wrong') setVerdict(null);
      }
    }
  };
  useEffect(() => {
    const h = (e: KeyboardEvent) => keys.current(e);
    window.addEventListener('keydown', h, true);
    return () => window.removeEventListener('keydown', h, true);
  }, []);

  const explain = 'explain' in step ? step.explain : step.kind === 'task' ? step.success : '';

  return (
    <div>
      {step.title && <h1 className="mb-3 text-2xl font-extrabold tracking-tight sm:text-[28px]">{step.title}</h1>}
      <Prose text={step.body} className="text-[16.5px]" />

      {step.widget && (
        <div data-widget className="mt-5 rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5">
          {step.widget({ onSolved })}
        </div>
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
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return;
              if (verdict === 'wrong') retry();
              else if (canCheck && !locked) check();
              else if (locked) onAdvance();
            }}
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
            {onNewNumbers && locked && (
              <button className="btn !py-2.5" onClick={onNewNumbers}>
                <Dices size={16} /> New numbers
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
                  Try again <Kbd />
                </button>
              ) : (
                <button className="btn-primary min-w-32" disabled={!canCheck} onClick={check}>
                  Check <Kbd />
                </button>
              )
            ) : (
              <button className="btn-primary min-w-32" disabled={!canContinue} onClick={onAdvance}>
                Continue <Kbd />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Kbd() {
  return (
    <kbd aria-hidden className="hidden rounded border border-current/30 px-1 font-sans text-[11px] font-semibold opacity-60 sm:inline">
      ↵
    </kbd>
  );
}
