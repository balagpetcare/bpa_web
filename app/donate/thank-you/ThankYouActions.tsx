'use client';

import { RefreshCw } from 'lucide-react';

export default function ThankYouActions({ isPending }: { isPending?: boolean }) {
  if (isPending) {
    return (
      <button
        onClick={() => window.location.reload()}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors text-sm"
      >
        <RefreshCw size={16} />
        Refresh Status
      </button>
    );
  }
  return null;
}
