'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface Props {
  targetDate?: string | null;
  registrationEndAt?: string | null;
  status?: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function PetCensusCountdown({ targetDate, registrationEndAt, status }: Props) {
  const [timeLeft, setTimeLeft] = useState<TimeRemaining | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Determine the target date to count down to
    let dateStr = targetDate || registrationEndAt;
    
    // If no target date is provided, generate a fallback (14 days from now)
    if (!dateStr) {
      const fallbackDate = new Date();
      fallbackDate.setDate(fallbackDate.getDate() + 14);
      dateStr = fallbackDate.toISOString();
    }

    const targetTime = new Date(dateStr).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = targetTime - now;

      if (distance <= 0 || status === 'registration_closed' || status === 'completed') {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    };

    updateTimer();
    const intervalId = setInterval(updateTimer, 1000);

    return () => clearInterval(intervalId);
  }, [targetDate, registrationEndAt, status]);

  if (!mounted) {
    return (
      <div className="w-full bg-gray-50 rounded-2xl h-24 animate-pulse flex items-center justify-center border border-gray-100">
        <span className="text-gray-400 text-xs">Loading countdown...</span>
      </div>
    );
  }

  const isClosed = status === 'registration_closed' || status === 'completed';

  if (isClosed) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-2xl p-5 text-center">
        <span className="text-red-700 font-bold text-sm block">Registration Closed</span>
        <span className="text-red-600 text-xs mt-1 block">The Pet Census campaign has concluded.</span>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-150 rounded-2xl p-5 sm:p-6 shadow-sm">
      <div className="flex items-center gap-2 text-amber-600 mb-3">
        <Clock size={16} className="animate-pulse" />
        <span className="text-xs font-black uppercase tracking-wider">Registration Closes In</span>
      </div>
      <div className="flex justify-between items-center gap-2 sm:gap-3">
        {[
          { label: 'Days', value: timeLeft?.days ?? 0 },
          { label: 'Hours', value: timeLeft?.hours ?? 0 },
          { label: 'Min', value: timeLeft?.minutes ?? 0 },
          { label: 'Sec', value: timeLeft?.seconds ?? 0 },
        ].map((unit) => (
          <div key={unit.label} className="flex-1 text-center">
            <div className="bg-bpa-navy text-white rounded-xl py-2.5 sm:py-3 px-1 text-xl sm:text-2xl font-black tabular-nums shadow-sm border border-bpa-navy-light/10">
              {String(unit.value).padStart(2, '0')}
            </div>
            <div className="text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase mt-1.5 tracking-wider">
              {unit.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
