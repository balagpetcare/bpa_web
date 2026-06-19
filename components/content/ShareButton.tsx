'use client';

import { useState } from 'react';
import { Share2, Link as LinkIcon, Check } from 'lucide-react';

interface Props {
  title: string;
  slug: string;
  type: string;
}

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="text-[#1877F2]">
    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z" />
  </svg>
);

export default function ShareButton({ title, slug, type }: Props) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/${type === 'VIDEO' ? 'videos' : 'community'}/${slug}` : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url: shareUrl,
        });
      } catch (err) {
        console.error('Native share failed:', err);
      }
    } else {
      setOpen(!open);
    }
  };

  const shareWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(title)}%20${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={handleNativeShare}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 bg-white text-sm font-bold hover:bg-gray-50 transition-all duration-200"
        aria-label="Share post"
      >
        <Share2 size={18} />
        <span>Share</span>
      </button>

      {open && (
        <div className="absolute right-0 bottom-full mb-2 w-48 bg-white border border-gray-150 rounded-2xl shadow-xl p-2.5 z-10 flex flex-col gap-1.5 animate-fade-in">
          <button
            onClick={shareFacebook}
            className="flex items-center gap-3 w-full px-3 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50 rounded-xl transition"
          >
            <FacebookIcon />
            <span>Facebook</span>
          </button>
          
          <button
            onClick={shareWhatsApp}
            className="flex items-center gap-3 w-full px-3 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50 rounded-xl transition"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="text-[#25D366]">
              <path d="M17.472 14.382c-.022-.08-.078-.146-.145-.184l-2.91-1.637c-.126-.072-.284-.047-.384.06l-.994 1.077c-.822-.44-1.503-1.12-1.942-1.94l1.077-.996c.107-.099.132-.257.06-.384L10.6 6.815a.252.252 0 0 0-.184-.145c-.145-.034-.294.01-.393.118l-.946.945c-.868.868-1.078 2.146-.532 3.228 1.48 2.94 3.86 5.32 6.8 6.8 1.082.546 2.36.336 3.228-.532l.945-.946a.286.286 0 0 0 .118-.393zm.655-9.873A11.93 11.93 0 0 0 12.002 1c-6.617 0-12 5.383-12 12a11.93 11.93 0 0 0 3.06 8.04l-1.58 4.73 4.84-1.55a11.91 11.91 0 0 0 5.68 1.44c6.617 0 12-5.383 12-12a11.93 11.93 0 0 0-3.53-8.47z" />
            </svg>
            <span>WhatsApp</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-3 w-full px-3 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50 rounded-xl transition border-t border-gray-100 pt-2"
          >
            {copied ? (
              <>
                <Check size={16} className="text-green-600" />
                <span className="text-green-600">Copied!</span>
              </>
            ) : (
              <>
                <LinkIcon size={16} className="text-gray-500" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
