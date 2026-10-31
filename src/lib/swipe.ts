import { useEffect, useRef, type RefObject } from 'react';

/** Strip along each screen edge left to the OS back gesture. */
const EDGE = 28;
/** Movement before the gesture commits to an axis. */
const SLOP = 10;
const DISTANCE = 80;
const FLING_DISTANCE = 40;
const FLING_SPEED = 0.45; // px per ms

type SwipeOptions = {
  /** Finger moved left: go forward. Undefined when there is nothing ahead. */
  onLeft?: () => void;
  /** Finger moved right: go back. Undefined when there is nothing behind. */
  onRight?: () => void;
  /** Element nudged along with the finger as feedback. */
  follow?: RefObject<HTMLElement | null>;
};

/** Swipes must not steal drags from sliders, fields or selections. */
function swipeIgnored(target: EventTarget | null, x: number) {
  if (x < EDGE || x > window.innerWidth - EDGE) return true;
  if (window.getSelection?.()?.toString()) return true;
  return !!(target as HTMLElement | null)?.closest?.('input, textarea, select, [contenteditable="true"]');
}

/** A sideways scroller under the finger that can still scroll that way keeps the gesture, as in native apps. */
function scrollerTakes(target: EventTarget | null, dx: number) {
  for (let el = target as HTMLElement | null; el && el !== document.body; el = el.parentElement) {
    if (el.scrollWidth - el.clientWidth <= 1 || !/auto|scroll/.test(getComputedStyle(el).overflowX)) continue;
    if (dx > 0 ? el.scrollLeft > 0 : el.scrollLeft + el.clientWidth < el.scrollWidth - 1) return true;
  }
  return false;
}

/** Horizontal swipe navigation on `ref`, leaving vertical scrolling untouched. */
export function useSwipe(ref: RefObject<HTMLElement | null>, options: SwipeOptions) {
  const opts = useRef(options);
  opts.current = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let start: { x: number; y: number; t: number; target: EventTarget | null } | null = null;
    let axis: 'x' | 'y' | null = null;
    let dx = 0;

    const setOffset = (px: number, animate: boolean) => {
      const f = opts.current.follow?.current;
      if (!f) return;
      // `left`, not a transform: a transformed ancestor would drag the fixed action bar along.
      f.style.position = 'relative';
      f.style.transition = animate ? 'left 0.2s ease-out' : '';
      f.style.left = px ? `${px}px` : '';
    };

    const down = (e: TouchEvent) => {
      const t = e.touches[0];
      start = e.touches.length === 1 && t && !swipeIgnored(e.target, t.clientX) ? { x: t.clientX, y: t.clientY, t: e.timeStamp, target: e.target } : null;
      axis = null;
      dx = 0;
    };
    const move = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!start || !t || axis === 'y') return;
      dx = t.clientX - start.x;
      const dy = t.clientY - start.y;
      if (!axis) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) < SLOP) return;
        axis = Math.abs(dx) > Math.abs(dy) * 1.5 && !scrollerTakes(start.target, dx) ? 'x' : 'y';
        if (axis === 'y') return;
      }
      // Rubber-band harder when there is nowhere to go that way.
      const can = dx < 0 ? opts.current.onLeft : opts.current.onRight;
      setOffset(dx * (can ? 0.25 : 0.06), false);
    };
    const up = (e: TouchEvent) => {
      if (start && axis === 'x') {
        const speed = Math.abs(dx) / Math.max(e.timeStamp - start.t, 1);
        const far = Math.abs(dx) > DISTANCE || (Math.abs(dx) > FLING_DISTANCE && speed > FLING_SPEED);
        setOffset(0, true);
        if (far) (dx < 0 ? opts.current.onLeft : opts.current.onRight)?.();
      }
      start = null;
      axis = null;
    };
    const cancel = () => {
      if (axis === 'x') setOffset(0, true);
      start = null;
      axis = null;
    };

    el.addEventListener('touchstart', down, { passive: true });
    el.addEventListener('touchmove', move, { passive: true });
    el.addEventListener('touchend', up);
    el.addEventListener('touchcancel', cancel);
    return () => {
      el.removeEventListener('touchstart', down);
      el.removeEventListener('touchmove', move);
      el.removeEventListener('touchend', up);
      el.removeEventListener('touchcancel', cancel);
    };
  }, [ref]);
}
