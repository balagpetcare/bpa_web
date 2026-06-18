'use client';
import { Printer } from 'lucide-react';

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-gray-50 transition-colors"
    >
      <Printer size={16} /> Print
    </button>
  );
}
