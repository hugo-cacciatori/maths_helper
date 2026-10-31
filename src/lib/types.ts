import type { ReactNode } from 'react';
import type { Rng } from './random';

/** Widgets receive this so a "task" step can unlock once the learner reaches the goal. */
export type WidgetApi = { onSolved: () => void };
export type WidgetRender = (api: WidgetApi) => ReactNode;

type StepBase = {
  title?: string;
  /** Mini-markdown: paragraphs, **bold**, `code`, $inline$ and $$block$$ maths. */
  body: string;
  widget?: WidgetRender;
  hint?: string;
};

export type QuestionStep =
  | (StepBase & { kind: 'choice'; options: string[]; answer: number; explain: string })
  | (StepBase & {
      kind: 'number';
      answer: number;
      tolerance?: number;
      suffix?: string;
      explain: string;
    })
  | (StepBase & {
      kind: 'sequence';
      /** Tokens offered to the learner (shown shuffled unless `keepOrder`). */
      tokens: string[];
      answer: string[];
      keepOrder?: boolean;
      explain: string;
    });

export type Step =
  | (StepBase & { kind: 'read' })
  | (StepBase & { kind: 'task'; widget: WidgetRender; success: string })
  | QuestionStep
  /** Draws new values on every visit; `make` must be deterministic for a given random source. */
  | { kind: 'generated'; make: (r: Rng) => QuestionStep };

/** A step as shown: generated steps are already resolved to a concrete question. */
export type ShownStep = Exclude<Step, { kind: 'generated' }>;

export type Lesson = {
  id: string;
  title: string;
  summary: string;
  /** Teaches background for the exercise lessons that follow; shown with a chip. */
  warmup?: boolean;
  steps: Step[];
};

export type Chapter = {
  id: string;
  title: string;
  blurb: string;
  lessons: Lesson[];
};
