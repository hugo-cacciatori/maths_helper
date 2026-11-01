import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

// Runs before the imports below, so every module is built in French.
vi.hoisted(() => localStorage.setItem('algo-visual-lang', 'fr'));

import { Home } from '../src/components/Home';
import { StepView } from '../src/components/LessonPlayer';
import { allLessons, chapters } from '../src/content';
import { lang } from '../src/lib/i18n';

afterEach(cleanup);

/** Words that only appear in English text; pseudo-code, maths and variable names are skipped. */
const ENGLISH =
  /\b(the|and|with|from|this|that|which|what|how|is|are|was|of|to|in|step|steps|next|previous|start|done|found|insert|swap|swaps|move|moves|left|right|node|nodes|tree|array|pick|reset|show|hide|play|try|again|largest|smallest|until|each|every|value|values|click|press|weigh|weighing|drop|drops|floor|floors|coin|coins|round|rounds|comparisons?|searches|sorted|then|when|win|lose|loses|your|you)\b/i;

/** Visible text and labels outside maths, code and pseudo-code. */
function words(root: HTMLElement) {
  const copy = root.cloneNode(true) as HTMLElement;
  copy.querySelectorAll('.katex, code, pre, svg text[data-code]').forEach((el) => el.remove());
  const labels = [...copy.querySelectorAll('[aria-label], [title], [placeholder]')].map(
    (el) => `${el.getAttribute('aria-label') ?? ''} ${el.getAttribute('title') ?? ''} ${el.getAttribute('placeholder') ?? ''}`,
  );
  return `${copy.textContent ?? ''} ${labels.join(' ')}`;
}

function english(text: string) {
  const m = text.match(new RegExp(ENGLISH.source, 'gi'));
  return m ? [...new Set(m.map((w) => w.toLowerCase()))] : [];
}

describe('French', () => {
  it('is active', () => {
    expect(lang).toBe('fr');
    expect(chapters[1].title).toBe('Mesurer le coût');
  });

  it('home has no English left', () => {
    const { container } = render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );
    expect(english(words(container))).toEqual([]);
    // The only language control: one link in the Home header, written in the other language.
    expect(container.querySelector('header button[lang="en"]')?.textContent).toBe('English');
  });

  for (const { lesson } of allLessons)
    it(`${lesson.id} has no English left, widgets stepped through`, () => {
      const found: string[] = [];
      lesson.steps.forEach((step, i) => {
        const { unmount, container } = render(
          <MemoryRouter>
            <StepView step={step} seed={i} variant={i} onAdvance={() => {}} />
          </MemoryRouter>,
        );
        const seen = new Set<string>();
        const look = () => english(words(container)).forEach((w) => seen.add(w));
        look();
        // Walk precomputed frames so every caption is checked, not only the first one.
        for (let k = 0; k < 80; k++) {
          const next = container.querySelector<HTMLButtonElement>('button[aria-label="Étape suivante"]:not([disabled])');
          if (!next) break;
          act(() => {
            fireEvent.click(next);
          });
          look();
        }
        if (seen.size) found.push(`step ${i}: ${[...seen].join(', ')}`);
        unmount();
      });
      expect(found).toEqual([]);
    });
});
