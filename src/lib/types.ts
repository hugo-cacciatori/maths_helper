import type { ReactNode } from 'react';

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

export type Step =
  | (StepBase & { kind: 'read' })
  | (StepBase & { kind: 'task'; widget: WidgetRender; success: string })
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

export type Lesson = {
  id: string;
  title: string;
  summary: string;
  steps: Step[];
};

export type Chapter = {
  id: string;
  title: string;
  blurb: string;
  lessons: Lesson[];
};
