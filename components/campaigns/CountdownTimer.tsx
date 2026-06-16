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

function Unit({ value, label, dark }: { value: number; label: string; dark?: boolean }) {
  return (
    <div className="flex flex-col items-center min-w-[44px]">
      <div className={`w-full rounded-lg px-2 py-1.5 text-center border ${
        dark
          ? 'bg-white/10 border-white/20'
          : 'bg-amber-100 border-amber-200'
      }`}>
        <span className={`text-lg font-extrabold tabular-nums leading-none ${dark ? 'text-white' : 'text-amber-900'}`}>
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className={`text-[10px] font-semibold uppercase tracking-wide mt-1 ${dark ? 'text-white/50' : 'text-amber-700'}`}>
        {label}
      </span>
    </div>
  );
}

interface Props {
  targetIso: string;
  label: string;
  /** Use dark/glass styles for placement on dark card backgrounds */
  dark?: boolean;
  /** Compact variant: smaller label and tighter layout */
  compact?: boolean;
}

export default function CountdownTimer({ targetIso, label, dark, compact }: Props) {
  const [time, setTime] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const target = new Date(targetIso);
    const update = () => setTime(calc(target));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  // SSR placeholder — avoids hydration mismatch
  if (!time) {
    if (compact && dark) {
      return (
        <div className="rounded-xl border border-white/15 bg-white/5 p-3 animate-pulse">
          <div className="h-4 bg-white/10 rounded mb-2 w-32" />
          <div className="flex gap-2">
            {[0, 1, 2, 3].map((i) => <div key={i} className="flex-1 h-10 bg-white/10 rounded-lg" />)}
          </div>
        </div>
      );
    }
    return null;
  }

  const isExpired =
    time.days === 0 && time.hours === 0 && time.minutes === 0 && time.seconds === 0;

  if (isExpired) {
    if (dark) {
      return (
        <div className="rounded-xl border border-white/15 bg-white/5 p-3">
          <div className="flex items-center gap-2 text-white/50">
            <Clock size={14} className="shrink-0" />
            <span className="text-xs font-semibold">Registration Closed</span>
          </div>
        </div>
      );
    }
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
        <div className="flex items-center gap-2 text-orange-700">
          <Clock size={15} className="shrink-0" />
          <span className="text-sm font-bold">Registration Closed</span>
        </div>
      </div>
    );
  }

  const wrapCls = compact && dark
    ? 'rounded-xl border border-white/15 bg-white/5 p-3'
    : dark
    ? 'rounded-xl border border-white/15 bg-white/5 p-4'
    : 'bg-amber-50 border border-amber-200 rounded-xl p-4';

  const labelCls = dark ? 'text-white/50' : 'text-amber-700';
  const sepCls   = dark ? 'text-white/30' : 'text-amber-400';

  return (
    <div className={wrapCls}>
      <div className="flex items-center gap-1.5 mb-2.5">
        <Clock size={13} className={`shrink-0 ${dark ? 'text-white/40' : 'text-amber-600'}`} />
        <span className={`text-[11px] font-semibold uppercase tracking-wide ${labelCls}`}>{label}</span>
      </div>
      <div className="flex items-start gap-1.5">
        <Unit value={time.days} label="Days" dark={dark} />
        <span className={`font-bold text-base mt-1 ${sepCls}`}>:</span>
        <Unit value={time.hours} label="Hrs" dark={dark} />
        <span className={`font-bold text-base mt-1 ${sepCls}`}>:</span>
        <Unit value={time.minutes} label="Min" dark={dark} />
        <span className={`font-bold text-base mt-1 ${sepCls}`}>:</span>
        <Unit value={time.seconds} label="Sec" dark={dark} />
      </div>
    </div>
  );
}
