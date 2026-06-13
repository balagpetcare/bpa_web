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

function Pad({ n }: { n: number }) {
  return <span>{String(n).padStart(2, '0')}</span>;
}

interface Props {
  targetIso: string;
  label: string;
}

export default function CountdownTimer({ targetIso, label }: Props) {
  const target = new Date(targetIso);
  const [time, setTime] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setTime(calc(target));
    const id = setInterval(() => setTime(calc(target)), 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  if (!time) return null;

  const expired = target.getTime() <= Date.now() && time.days === 0 && time.hours === 0 && time.minutes === 0 && time.seconds === 0;
  if (expired) return null;

  return (
    <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
      <Clock size={16} className="text-amber-600 shrink-0" />
      <div className="flex items-center gap-2 text-sm">
        <span className="text-amber-700 font-medium">{label}</span>
        <span className="font-bold text-amber-900 tabular-nums">
          {time.days > 0 && <><Pad n={time.days} />d </>}
          <Pad n={time.hours} />h <Pad n={time.minutes} />m <Pad n={time.seconds} />s
        </span>
      </div>
    </div>
  );
}
