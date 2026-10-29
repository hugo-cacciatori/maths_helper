import katex from 'katex';
import { Fragment, type ReactNode } from 'react';

export function TeX({ children, block = false }: { children: string; block?: boolean }) {
  const html = katex.renderToString(children, { throwOnError: false, displayMode: block });
  return block ? (
    <div className="my-3 overflow-x-auto" dangerouslySetInnerHTML={{ __html: html }} />
  ) : (
    <span dangerouslySetInnerHTML={{ __html: html }} />
  );
}

/** Inline formatting: $math$, **bold**, *italic*, `code`. */
function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\$[^$]+\$|\*\*[^*]+\*\*|\*(?=\S)[^*]+?(?<=\S)\*|`[^`]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith('$')) out.push(<TeX key={k++}>{tok.slice(1, -1)}</TeX>);
    else if (tok.startsWith('**')) out.push(<strong key={k++} className="font-semibold">{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith('*')) out.push(<em key={k++}>{tok.slice(1, -1)}</em>);
    else
      out.push(
        <code key={k++} className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[0.88em]">
          {tok.slice(1, -1)}
        </code>,
      );
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** Mini-markdown renderer: blank lines split paragraphs, `- ` starts a list item, $$…$$ is display maths. */
export function Prose({ text, className = '' }: { text: string; className?: string }) {
  // Display maths ($$…$$) always gets its own block, even when written mid-paragraph.
  const blocks = text
    .trim()
    .split(/(\$\$[\s\S]+?\$\$)/)
    .flatMap((part) => (part.startsWith('$$') ? [part] : part.split(/\n\s*\n/)))
    .filter((b) => b.trim() !== '');
  return (
    <div className={`space-y-3 leading-relaxed ${className}`}>
      {blocks.map((b, i) => {
        const t = b.trim();
        if (t.startsWith('$$') && t.endsWith('$$')) return <TeX key={i} block>{t.slice(2, -2)}</TeX>;
        const lines = t.split('\n');
        if (lines.every((l) => l.trim().startsWith('- ')))
          return (
            <ul key={i} className="list-disc space-y-1 pl-5">
              {lines.map((l, j) => (
                <li key={j}>{inline(l.trim().slice(2))}</li>
              ))}
            </ul>
          );
        return (
          <p key={i}>
            {lines.map((l, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                {inline(l)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}

export { inline as renderInline };
