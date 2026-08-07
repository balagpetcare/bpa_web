import React from 'react';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-gray-50">
      {/* Left Column: Brand Panel */}


      {/* Right Column: Auth Content */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 py-12 md:py-16">
        <div className="mx-auto w-full max-w-sm lg:max-w-md">
          {children}
          
          <div className="mt-8 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
            <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>
              Protected by BPA secure authentication<br/>
              <span className="opacity-75">BPA নিরাপদ লগইন সিস্টেম দ্বারা সুরক্ষিত</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
