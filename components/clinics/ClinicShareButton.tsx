'use client';

import { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

interface Props {
  url: string;
  title: string;
  className?: string;
}

/**
 * Uses the native Web Share API when available (mobile browsers, most
 * desktop browsers now); falls back to copying the link to the clipboard
 * with a brief confirmation — never a dead button on unsupported browsers.
 */
export default function ClinicShareButton({ url, title, className }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    trackEvent('clinic_share', {});
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // User cancelled the share sheet — not an error, do nothing.
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access denied — nothing more we can safely do here.
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={`Share ${title}`}
      className={
        className ??
        'inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-(--bpa-green) hover:text-(--bpa-green) transition-colors'
      }
    >
      {copied ? <Check size={13} /> : <Share2 size={13} />}
      {copied ? 'Copied' : 'Share'}
    </button>
  );
}
