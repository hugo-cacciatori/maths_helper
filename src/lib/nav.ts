import type { MouseEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Back to the lesson list through history rather than pushing a new entry, so the system back
 * gesture (Android) goes lesson → list → exit instead of re-entering the lesson just left.
 */
export function useBackHome() {
  const navigate = useNavigate();
  // 'default' marks the entry the app opened on: nothing in-app to go back to.
  const opened = useLocation().key === 'default';
  return (e?: MouseEvent) => {
    e?.preventDefault();
    if (opened) navigate('/', { replace: true });
    else navigate(-1);
  };
}
