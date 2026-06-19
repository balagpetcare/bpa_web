import Link from 'next/link';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import type { PetCensusCampaign } from '@/types/bpa.types';
import PetCensusCountdown from './PetCensusCountdown';

interface Props {
  settings?: PetCensusCampaign | null;
}

export default function PetCensusCTASection({ settings }: Props) {
  const defaultSettings: PetCensusCampaign = {
    active: true,
    title: 'BPA Pet Census 2026',
    status: 'registration_open',
    targetSubmissions: 10000,
    currentSubmissions: 2400,
    countdownTargetAt: null,
  };
  const activeSettings = settings || defaultSettings;

  const currentCount = activeSettings.currentSubmissions ?? 2400;
  const targetCount = activeSettings.targetSubmissions ?? 10000;
  const progressPercent = Math.min(100, Math.max(0, Math.round((currentCount / targetCount) * 100)));

  return (
    <section className="py-20 bg-gray-50 border-t border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-gray-100 shadow-xl rounded-3xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 sm:p-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="inline-flex items-center gap-1.5 bg-green-50 text-(--bpa-green) border border-green-100 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider mb-4">
                  <span className="relative flex h-2 w-2">
                    <span className="ping-dot absolute inset-0 rounded-full text-(--bpa-green)" />
                    <span className="relative w-2 h-2 rounded-full bg-(--bpa-green)" />
                  </span>
                  Pet Census 2026
                </span>
                
                <h2 className="text-3xl sm:text-4xl font-extrabold text-(--bpa-navy) tracking-tight">
                  Register Your Pets
                </h2>
              </div>
              
              <p className="text-gray-600 text-base leading-relaxed max-w-xl">
                Help BPA plan community pet clinic capacity, future services, and smarter pet health programs in Dhaka. Registering your pets is quick, secure, and vital for animal welfare planning in your area.
              </p>
              
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700 font-semibold">
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 bg-green-50 border border-green-100 text-(--bpa-green) rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle2 size={13} className="stroke-[2.5]" />
                  </span>
                  Takes less than 2 minutes
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 bg-green-50 border border-green-100 text-(--bpa-green) rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle2 size={13} className="stroke-[2.5]" />
                  </span>
                  Helps plan services in your area
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 bg-green-50 border border-green-100 text-(--bpa-green) rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle2 size={13} className="stroke-[2.5]" />
                  </span>
                  Supports better vaccination planning
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 bg-green-50 border border-green-100 text-(--bpa-green) rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle2 size={13} className="stroke-[2.5]" />
                  </span>
                  Secure & fully confidential
                </li>
              </ul>
              
              <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
                <Link
                  href="/pet-census-2026"
                  className="inline-flex items-center gap-2 bg-(--bpa-green) hover:bg-(--bpa-green-dark) text-white px-8 py-4 rounded-xl font-bold text-base shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-center w-full sm:w-auto justify-center"
                >
                  Register Your Pets <ChevronRight size={18} />
                </Link>
                <span className="text-xs text-gray-500 text-center sm:text-left font-medium">
                  Dhaka Citywide Initiative · Powered by BPA
                </span>
              </div>
            </div>
            
            {/* Right Widget Column */}
            <div className="lg:col-span-5 bg-gray-50 border border-gray-100 rounded-2xl p-6 sm:p-8 space-y-6">
              <PetCensusCountdown
                targetDate={activeSettings.countdownTargetAt}
                registrationEndAt={activeSettings.registrationEndAt}
                status={activeSettings.status}
              />
              
              <div>
                <div className="flex justify-between items-center text-xs font-semibold text-gray-500 mb-2">
                  <span>Census Submission Progress</span>
                  <span>{progressPercent}% Complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-(--bpa-green) h-2.5 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500 mt-2 font-semibold">
                  <span>{currentCount.toLocaleString()} pets registered</span>
                  <span>Goal: {targetCount.toLocaleString()} pets</span>
                </div>
              </div>
              
              <div className="text-[11px] text-gray-500 text-center leading-relaxed font-medium">
                By participating, you help build a data-driven veterinary healthcare map of Bangladesh. Thank you for your support.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
