'use client';

import { useEffect } from 'react';

interface Props {
  url: string;
  filename?: string;
  storageKey: string;
  delayMs?: number;
}

export function AutoDownloadFile({ url, filename, storageKey, delayMs = 700 }: Props) {
  useEffect(() => {
    if (!url || !storageKey) return;
    try {
      if (sessionStorage.getItem(storageKey)) return;
      sessionStorage.setItem(storageKey, '1');
      const timer = window.setTimeout(() => {
        const link = document.createElement('a');
        link.href = url;
        if (filename) link.download = filename;
        link.rel = 'noopener';
        document.body.appendChild(link);
        link.click();
        link.remove();
      }, delayMs);
      return () => window.clearTimeout(timer);
    } catch {
      // sessionStorage unavailable (private browsing etc.) — fail silently
    }
  }, [url, filename, storageKey, delayMs]);

  return null;
}
