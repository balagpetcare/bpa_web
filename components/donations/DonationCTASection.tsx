import Link from 'next/link';
import { Heart, ArrowRight, ShieldCheck } from 'lucide-react';

interface Props {
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  /** If set, pre-selects this purpose on the donate page */
  purposeId?: string;
  /** If set, pre-selects this campaign on the donate page */
  campaignId?: string;
  theme?: 'green' | 'navy' | 'cream';
  /** Amount to pre-fill */
  amount?: number;
  compact?: boolean;
}

export default function DonationCTASection({
  title = 'Help Us Make a Difference',
  subtitle = 'Every donation — big or small — directly funds veterinary care, rescue operations, food, and vaccines for animals across Bangladesh.',
  ctaLabel = 'Donate Now',
  purposeId,
  campaignId,
  amount,
  theme = 'green',
  compact = false,
}: Props) {
  const params = new URLSearchParams();
  if (purposeId) params.set('purpose', purposeId);
  if (campaignId) params.set('campaign', campaignId);
  if (amount) params.set('amount', String(amount));
  const donateHref = `/donate${params.size ? `?${params}` : ''}#donate-form`;

  const bg =
    theme === 'navy'
      ? 'bg-(--bpa-navy)'
      : theme === 'cream'
        ? 'bg-amber-50 border-t border-b border-amber-100'
        : 'bg-(--bpa-green)';

  const textMain = theme === 'cream' ? 'text-(--bpa-navy)' : 'text-white';
  const textSub = theme === 'cream' ? 'text-amber-800/70' : 'text-white/75';
  const btnPrimary =
    theme === 'cream'
      ? 'bg-(--bpa-green) text-white hover:bg-(--bpa-green-dark)'
      : 'bg-white text-(--bpa-navy) hover:bg-gray-50';
  const btnSecondary =
    theme === 'cream'
      ? 'bg-amber-100 text-(--bpa-navy) hover:bg-amber-200'
      : 'bg-white/15 text-white ring-1 ring-white/25 hover:bg-white/20';

  const borderCol = theme === 'cream' ? 'border-amber-200/60' : 'border-white/10';
  const statsVal = theme === 'cream' ? 'text-(--bpa-navy)' : 'text-white';
  const statsLabel = theme === 'cream' ? 'text-amber-800/70' : 'text-white/60';

  return (
    <section className={`${bg} ${compact ? 'py-12' : 'py-20'}`}>
      <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${compact ? 'max-w-4xl' : 'max-w-5xl'} text-center`}>
        <Heart
          size={compact ? 28 : 36}
          className={`mx-auto mb-4 fill-current ${theme === 'cream' ? 'text-(--bpa-green)' : 'text-white/25'}`}
        />
        <h2 className={`${compact ? 'text-2xl' : 'text-3xl sm:text-4xl'} font-extrabold ${textMain} mb-3 tracking-tight`}>
          {title}
        </h2>
        <p className={`${compact ? 'text-sm' : 'text-base'} ${textSub} max-w-2xl mx-auto mb-8 leading-relaxed font-medium`}>
          {subtitle}
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href={donateHref}
            className={`inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 ${btnPrimary}`}
          >
            <Heart size={16} className="fill-current" />
            {ctaLabel}
          </Link>
          <Link
            href="/donations/transparency"
            className={`inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-bold transition-all duration-200 ${btnSecondary}`}
          >
            See Where It Goes <ArrowRight size={14} />
          </Link>
        </div>

        {!compact && (
          <>
            <p className={`mt-6 text-xs ${textSub} flex items-center justify-center gap-1.5 font-medium`}>
              <ShieldCheck size={14} className="text-current opacity-80" />
              Secure payment · Official BPA receipt · Tracked & reported impact
            </p>

            <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-12 pt-10 border-t ${borderCol}`}>
              <div className="text-center">
                <div className={`text-3xl font-black ${statsVal}`}>10,000+</div>
                <div className={`text-[10px] sm:text-xs font-bold ${statsLabel} uppercase tracking-wider mt-1`}>
                  Vaccines Funded
                </div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-black ${statsVal}`}>25,000+</div>
                <div className={`text-[10px] sm:text-xs font-bold ${statsLabel} uppercase tracking-wider mt-1`}>
                  Meals Delivered
                </div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-black ${statsVal}`}>1,200+</div>
                <div className={`text-[10px] sm:text-xs font-bold ${statsLabel} uppercase tracking-wider mt-1`}>
                  Animals Rescued
                </div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-black ${statsVal}`}>8 / 8</div>
                <div className={`text-[10px] sm:text-xs font-bold ${statsLabel} uppercase tracking-wider mt-1`}>
                  Dhaka Zones
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
