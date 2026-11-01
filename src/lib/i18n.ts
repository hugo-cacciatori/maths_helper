export type Lang = 'en' | 'fr';

const KEY = 'algo-visual-lang';

function detect(): Lang {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'en' || saved === 'fr') return saved;
  } catch {
    // Storage blocked: fall back to the system language.
  }
  return typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('fr') ? 'fr' : 'en';
}

/** Fixed for the page's lifetime: content is built once, so switching reloads the page. */
export const lang: Lang = detect();
if (typeof document !== 'undefined') document.documentElement.lang = lang;

/** Picks the text (or node, or list) for the current language. */
export const t = <T>(en: T, fr: T): T => (lang === 'fr' ? fr : en);

/** Whole number for running text: 1,000,000 or 1 000 000. */
export const num = (n: number) => n.toLocaleString(t('en-US', 'fr-FR'));
/** Fixed decimals for running text: 3.14 or 3,14. */
export const dec = (v: number, digits: number) => t(v.toFixed(digits), v.toFixed(digits).replace('.', ','));
/** Fixed decimals inside TeX, where a French comma needs braces to avoid extra spacing. */
export const texDec = (v: number, digits: number) => t(v.toFixed(digits), v.toFixed(digits).replace('.', '{,}'));

export function setLang(l: Lang) {
  try {
    localStorage.setItem(KEY, l);
  } catch {
    return;
  }
  location.reload();
}
