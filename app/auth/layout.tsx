import React from 'react';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-gray-50">
      {/* Left Column: Brand Panel */}
      <div className="hidden md:flex md:w-1/2 lg:w-5/12 bg-gradient-to-br from-(--bpa-navy) to-(--bpa-navy-light) text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-5"></div>
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 rounded-full bg-(--bpa-green) opacity-20"></div>
        
        <div className="relative z-10">
          <Link href="/" className="inline-block mb-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-(--bpa-green) flex items-center justify-center">
                <span className="text-white text-sm font-bold tracking-wider">BPA</span>
              </div>
              <span className="font-bold text-xl tracking-tight leading-none">
                Bangladesh<br />Pet Association
              </span>
            </div>
          </Link>

          <h2 className="text-4xl font-bold mb-6 leading-tight">
            Join the Largest Pet Community in Bangladesh
          </h2>
          <p className="text-blue-100 text-lg mb-10 max-w-md">
            Connect with pet lovers, access exclusive veterinary services, and be part of our mission to improve animal welfare.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <CheckCircle className="text-(--bpa-green)" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Community Pet Care</h3>
                <p className="text-blue-100 text-sm">Access subsidized vaccinations and treatments at partner clinics.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <CheckCircle className="text-(--bpa-green)" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Digital Pet Census</h3>
                <p className="text-blue-100 text-sm">Help us build the first national database for better resource allocation.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <CheckCircle className="text-(--bpa-green)" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Secure Identity</h3>
                <p className="text-blue-100 text-sm">Your data is protected by BPA secure authentication.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-blue-200 mt-12">
          &copy; {new Date().getFullYear()} Bangladesh Pet Association. All rights reserved.
        </div>
      </div>

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
