import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ProgressState = {
  completed: Record<string, boolean>;
  /** Furthest step reached per lesson, so learners resume where they left off. */
  stepOf: Record<string, number>;
  setStep: (lessonId: string, step: number) => void;
  complete: (lessonId: string) => void;
  reset: () => void;
};

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      completed: {},
      stepOf: {},
      setStep: (lessonId, step) => set((s) => ({ stepOf: { ...s.stepOf, [lessonId]: step } })),
      complete: (lessonId) =>
        set((s) => ({
          completed: { ...s.completed, [lessonId]: true },
          stepOf: { ...s.stepOf, [lessonId]: 0 },
        })),
      reset: () => set({ completed: {}, stepOf: {} }),
    }),
    { name: 'algo-visual-progress' },
  ),
);
