import { getSystemMode } from '@/lib/dataService';

export async function GET() {
  const mode = await getSystemMode();
  return new Response(JSON.stringify({ mode }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}
