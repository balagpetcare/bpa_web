'use client';

import { Dog, Cat, Bird, HelpCircle, Target } from 'lucide-react';
import type { PetCensusCampaign } from '@/types/bpa.types';

interface Props {
  settings: PetCensusCampaign;
}

export default function PetCensusImpact({ settings }: Props) {
  const progress = Math.min(100, Math.round((settings.currentSubmissions / settings.targetSubmissions) * 100));

  const COUNTERS = [
    {
      icon: Cat,
      label: 'Cats Registered',
      value: (settings.currentSubmissions * 0.6).toFixed(0) + '+',
      color: 'text-amber-500',
      bg: 'bg-amber-50',
    },
    {
      icon: Dog,
      label: 'Dogs Registered',
      value: (settings.currentSubmissions * 0.35).toFixed(0) + '+',
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      icon: Bird,
      label: 'Birds & Others',
      value: (settings.currentSubmissions * 0.05).toFixed(0) + '+',
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
    },
    {
      icon: HelpCircle,
      label: 'Planning Signals',
      value: (settings.currentSubmissions * 1.5).toFixed(0) + '+',
      color: 'text-purple-500',
      bg: 'bg-purple-50',
    },
  ];

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="bg-gray-50 rounded-3xl p-8 sm:p-12 border border-gray-100">
          {/* Target Progress Bar */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target size={18} className="text-(--bpa-green)" />
                <span className="font-bold text-(--bpa-navy) uppercase tracking-wider text-xs">Census Participation Target</span>
              </div>
              <span className="text-(--bpa-navy) font-black">{progress}%</span>
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-(--bpa-green) to-[#2a8b50] transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <span>0 Records</span>
              <span>{settings.targetSubmissions.toLocaleString()} Target Records</span>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {COUNTERS.map((item, i) => (
              <div key={i} className="text-center sm:text-left">
                <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center mb-4 mx-auto sm:mx-0`}>
                  <item.icon size={20} className={item.color} />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-(--bpa-navy) tracking-tight">
                  {item.value}
                </div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-1">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
