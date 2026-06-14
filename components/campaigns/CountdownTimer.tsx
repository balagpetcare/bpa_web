'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calc(target: Date): TimeLeft {
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center min-w-[44px]">
      <div className="w-full bg-amber-100 border border-amber-200 rounded-lg px-2 py-1.5 text-center">
        <span className="text-lg font-extrabold text-amber-900 tabular-nums leading-none">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide mt-1">{label}</span>
    </div>
  );
}

interface Props {
  targetIso: string;
  label: string;
}

export default function CountdownTimer({ targetIso, label }: Props) {
  const [time, setTime] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const target = new Date(targetIso);
    const update = () => setTime(calc(target));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  if (!time) return null;

  const isExpired =
    time.days === 0 && time.hours === 0 && time.minutes === 0 && time.seconds === 0;

  if (isExpired) {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
        <div className="flex items-center gap-2 text-orange-700">
          <Clock size={15} className="shrink-0" />
          <span className="text-sm font-bold">Registration Closed</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
      <div className="flex items-center gap-1.5 mb-3">
        <Clock size={14} className="text-amber-600 shrink-0" />
        <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">{label}</span>
      </div>
      <div className="flex items-start gap-2">
        <Unit value={time.days} label="Days" />
        <span className="text-amber-400 font-bold text-lg mt-1">:</span>
        <Unit value={time.hours} label="Hours" />
        <span className="text-amber-400 font-bold text-lg mt-1">:</span>
        <Unit value={time.minutes} label="Min" />
        <span className="text-amber-400 font-bold text-lg mt-1">:</span>
        <Unit value={time.seconds} label="Sec" />
      </div>
    </div>
  );
}
