'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamic import with SSR disabled
const CampusEngagementHub = dynamic(
  () => import('../search/CampusEngagementHub'),
  { ssr: false }
);

export default function EngagementHubWrapper() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-solid border-blue-500 border-r-transparent"></div>
      </div>
    }>
      <CampusEngagementHub />
    </Suspense>
  );
}