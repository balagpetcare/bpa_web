import Link from 'next/link';
import { Heart, ChevronRight } from 'lucide-react';
import type { PublicContributor } from '@/types/bpa.types';

interface Props {
  contributors: PublicContributor[];
}

function timeAgo(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    return `${Math.floor(months / 12)}y ago`;
  } catch {
    return '';
  }
}

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase();
}

const AVATAR_COLORS = [
  'from-green-600 to-green-700',
  'from-blue-600 to-blue-700',
  'from-purple-600 to-purple-700',
  'from-amber-500 to-amber-600',
  'from-rose-600 to-rose-700',
  'from-teal-600 to-teal-700',
  'from-indigo-600 to-indigo-700',
  'from-orange-500 to-orange-600',
];

function avatarColor(id: string): string {
  let n = 0;
  for (let i = 0; i < id.length; i++) n += id.charCodeAt(i);
  return AVATAR_COLORS[n % AVATAR_COLORS.length];
}

export default function ContributorWallSection({ contributors }: Props) {
  if (contributors.length === 0) return null;

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
          <div>
            <p className="text-xs font-bold text-(--bpa-green) uppercase tracking-[0.18em] mb-4">
              Care Partner Wall
            </p>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-(--bpa-navy) leading-tight">
              The people behind<br />the programme.
            </h2>
            <p className="text-xl text-gray-400 font-light tracking-wide mt-3">
              আমাদের কেয়ার পার্টনারগণ
            </p>
          </div>
          <Link
            href="/community-pet-care/contribute"
            className="inline-flex items-center gap-2 bg-(--bpa-green) text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#145530] transition-colors shrink-0 self-start sm:self-auto"
          >
            <Heart size={15} fill="currentColor" strokeWidth={0} />
            Join Them
            <ChevronRight size={15} />
          </Link>
        </div>

        {/* Contributor grid */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {contributors.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-3.5 p-4 rounded-2xl border border-gray-100 hover:border-green-200 hover:bg-(--bpa-green-light) transition-all duration-150"
            >
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarColor(c.id)} flex items-center justify-center shrink-0`}>
                {c.isAnonymous ? (
                  <Heart size={14} className="text-white" fill="white" strokeWidth={0} />
                ) : (
                  <span className="text-xs font-black text-white">{initials(c.displayName)}</span>
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="font-bold text-(--bpa-navy) text-sm truncate leading-tight">{c.displayName}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-gray-400 truncate">{c.zoneName}</span>
                  <span className="text-gray-200">·</span>
                  <span className="text-[10px] text-gray-400 shrink-0">{timeAgo(c.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-400 mt-8 text-center">
          Showing recent Care Partners. Anonymised where requested.
        </p>
      </div>
    </section>
  );
}
