import { MotionConfig } from 'motion/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Navigate, Route, Routes, useParams } from 'react-router-dom';
import { Home } from './components/Home';
import { LessonPlayer } from './components/LessonPlayer';
import { ReviewPlayer } from './components/ReviewPlayer';
import { allLessons } from './content';
import 'katex/dist/katex.min.css';
import './index.css';

function LessonRoute() {
  const { id } = useParams();
  const k = allLessons.findIndex((l) => l.lesson.id === id);
  if (k < 0) return <Navigate to="/" replace />;
  const { lesson, chapter } = allLessons[k];
  return <LessonPlayer key={lesson.id} lesson={lesson} chapter={chapter} nextLesson={allLessons[k + 1]?.lesson} />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lesson/:id" element={<LessonRoute />} />
        <Route path="/review" element={<ReviewPlayer />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </HashRouter>
    </MotionConfig>
  </StrictMode>,
);
