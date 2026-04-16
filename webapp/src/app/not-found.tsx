'use client';

import { NotFoundFallback } from '@/components/animations';

export default function NotFound() {
  return (
    <NotFoundFallback
      title="הדף לא נמצא"
      description="הדף שחיפשתם לא קיים או שהוסר. נסו לחפש שוב או חזרו לדף הבית."
      backLink="/"
      backLabel="חזרה לדף הבית"
    />
  );
}
