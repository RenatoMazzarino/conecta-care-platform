import { Suspense } from 'react';
import { GedOriginalClient } from './GedOriginalClient';

export default function GedOriginalPage() {
  return (
    <Suspense fallback={<div style={{ padding: '24px' }}>Carregando link seguro...</div>}>
      <GedOriginalClient />
    </Suspense>
  );
}
