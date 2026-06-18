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
        ? 'bg-amber-50 border-t border-amber-100'
        : 'bg-(--bpa-green)';

  const textMain = theme === 'cream' ? 'text-(--bpa-navy)' : 'text-white';
  const textSub = theme === 'cream' ? 'text-amber-800/70' : 'text-white/75';
  const btnPrimary =
    theme === 'cream'
      ? 'bg-(--bpa-green) text-white hover:opacity-90'
      : 'bg-white text-(--bpa-navy) hover:opacity-90';
  const btnSecondary =
    theme === 'cream'
      ? 'bg-amber-100 text-(--bpa-navy) hover:bg-amber-200'
      : 'bg-white/15 text-white ring-1 ring-white/25 hover:bg-white/20';

  return (
    <section className={`${bg} ${compact ? 'py-12' : 'py-20'}`}>
      <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${compact ? 'max-w-4xl' : 'max-w-5xl'} text-center`}>
        <Heart
          size={compact ? 28 : 36}
          className={`mx-auto mb-4 fill-current ${theme === 'cream' ? 'text-(--bpa-green)' : 'text-white/25'}`}
        />
        <h2 className={`${compact ? 'text-2xl' : 'text-3xl sm:text-4xl'} font-extrabold ${textMain} mb-3`}>
          {title}
        </h2>
        <p className={`${compact ? 'text-sm' : 'text-base'} ${textSub} max-w-2xl mx-auto mb-8 leading-relaxed`}>
          {subtitle}
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href={donateHref}
            className={`inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-bold shadow-lg transition ${btnPrimary}`}
          >
            <Heart size={16} className="fill-current" />
            {ctaLabel}
          </Link>
          <Link
            href="/donations/transparency"
            className={`inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-bold transition ${btnSecondary}`}
          >
            See Where It Goes <ArrowRight size={14} />
          </Link>
        </div>

        {!compact && (
          <p className={`mt-6 text-xs ${textSub} flex items-center justify-center gap-1.5`}>
            <ShieldCheck size={12} />
            Secure EPS payment · Official BPA receipt · QR-verifiable
          </p>
        )}
      </div>
    </section>
  );
}
