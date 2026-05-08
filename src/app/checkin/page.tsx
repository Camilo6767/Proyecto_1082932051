import { Suspense } from 'react';
import CheckInClient from './CheckInClient';

export const dynamic = 'force-dynamic';

export default function CheckinPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckInClient />
    </Suspense>
  );
}
