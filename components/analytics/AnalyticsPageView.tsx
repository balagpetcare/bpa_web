'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView } from '@/lib/analytics';

/**
 * Fires a page_view event in GA4 and Meta Pixel on every client-side
 * route change in Next.js App Router.
 *
 * Must be a Client Component because usePathname() is a client-only hook.
 * Returns null — no visible output.
 */
export default function AnalyticsPageView() {
  const pathname = usePathname();

  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);

  return null;
}
