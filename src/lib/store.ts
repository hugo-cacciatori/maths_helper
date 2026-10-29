import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ProgressState = {
  completed: Record<string, boolean>;
  /** Furthest step reached per lesson, so learners resume where they left off. */
  stepOf: Record<string, number>;
  /** Question steps the learner got wrong (or revealed), per lesson, for the review mode. */
  missed: Record<string, number[]>;
  addMissed: (lessonId: string, step: number) => void;
  removeMissed: (lessonId: string, step: number) => void;
  setStep: (lessonId: string, step: number) => void;
  complete: (lessonId: string) => void;
  reset: () => void;
};

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      completed: {},
      stepOf: {},
      missed: {},
      addMissed: (lessonId, step) =>
        set((s) => {
          const cur = s.missed[lessonId] ?? [];
          return cur.includes(step) ? s : { missed: { ...s.missed, [lessonId]: [...cur, step].sort((a, b) => a - b) } };
        }),
      removeMissed: (lessonId, step) =>
        set((s) => {
          const cur = (s.missed[lessonId] ?? []).filter((x) => x !== step);
          const missed = { ...s.missed };
          if (cur.length) missed[lessonId] = cur;
          else delete missed[lessonId];
          return { missed };
        }),
      setStep: (lessonId, step) => set((s) => ({ stepOf: { ...s.stepOf, [lessonId]: step } })),
      complete: (lessonId) =>
        set((s) => ({
          completed: { ...s.completed, [lessonId]: true },
          stepOf: { ...s.stepOf, [lessonId]: 0 },
        })),
      reset: () => set({ completed: {}, stepOf: {}, missed: {} }),
    }),
    { name: 'algo-visual-progress' },
  ),
);
