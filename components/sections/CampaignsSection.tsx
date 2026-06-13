import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CalendarDays, Syringe, ChevronRight } from 'lucide-react';
import type { CampaignListItem, CampaignType, HomepageSection } from '@/types/bpa.types';

const TYPE_LABELS: Record<CampaignType, string> = {
  vaccination: 'Vaccination',
  deworming: 'Deworming',
  microchip: 'Microchipping',
  health_camp: 'Health Camp',
  spay_neuter: 'Spay & Neuter',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function FeaturedCard({ campaign }: { campaign: CampaignListItem }) {
  const isFree = Number(campaign.basePriceBdt) === 0;
  return (
    <Link href={`/campaigns/${campaign.slug}`} className="group block">
      <div className="relative rounded-2xl overflow-hidden bg-(--bpa-navy) aspect-[16/7] md:aspect-[16/6]">
        {campaign.coverImage ? (
          <Image
            src={campaign.coverImage.url}
            alt={campaign.coverImage.altText ?? campaign.title}
            fill
            sizes="(max-width: 1024px) 100vw, 70vw"
            className="object-cover opacity-50 group-hover:opacity-60 transition-opacity duration-500"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-(--bpa-navy)/10 to-(--bpa-navy)" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-(--bpa-green) text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              {campaign.status === 'registration_open' ? 'Register Now' : 'Featured'}
            </span>
            <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
              {TYPE_LABELS[campaign.campaignType] ?? campaign.campaignType}
            </span>
            {isFree && (
              <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2.5 py-1 rounded-full">Free</span>
            )}
          </div>
          <h3 className="text-white font-bold text-xl md:text-2xl mb-2 line-clamp-2 group-hover:text-(--bpa-green) transition-colors">
            {campaign.title}
          </h3>
          {campaign.description && (
            <p className="text-white/70 text-sm line-clamp-2 mb-3 max-w-xl">{campaign.description}</p>
          )}
          <div className="flex items-center gap-1.5 text-white/60 text-sm">
            <CalendarDays size={14} />
            <span>{formatDate(campaign.startDate)}</span>
            {campaign._count.sessions > 0 && (
              <span className="ml-2 text-white/50">· {campaign._count.sessions} session{campaign._count.sessions !== 1 ? 's' : ''}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function MiniCard({ campaign }: { campaign: CampaignListItem }) {
  const isFree = Number(campaign.basePriceBdt) === 0;
  const isOpen = campaign.status === 'registration_open';
  return (
    <Link href={`/campaigns/${campaign.slug}`} className="group flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-(--bpa-green)/30 hover:shadow-sm transition-all">
      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
        {campaign.coverImage ? (
          <Image src={campaign.coverImage.url} alt={campaign.title} fill sizes="64px" className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-(--bpa-navy)/10 to-(--bpa-navy)/10 flex items-center justify-center">
            <Syringe size={20} className="text-(--bpa-green)" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          {isOpen && <span className="text-[10px] font-bold text-(--bpa-green) bg-(--bpa-green) px-2 py-0.5 rounded-full">Open</span>}
          {isFree && <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">Free</span>}
        </div>
        <h4 className="font-semibold text-(--bpa-navy) text-sm line-clamp-2 group-hover:text-(--bpa-green) transition-colors leading-snug">
          {campaign.title}
        </h4>
        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
          <CalendarDays size={10} />
          {formatDate(campaign.startDate)}
        </p>
      </div>
      <ChevronRight size={14} className="text-gray-300 group-hover:text-(--bpa-green) mt-1 flex-shrink-0 transition-colors" />
    </Link>
  );
}

interface Props {
  featured: CampaignListItem[];
  registrationOpen: CampaignListItem[];
  upcoming: CampaignListItem[];
  section?: HomepageSection | null;
}

const HOMEPAGE_VISIBLE_STATUSES = new Set(['published', 'registration_open', 'registration_closed']);

export default function CampaignsSection({ featured, registrationOpen, upcoming, section }: Props) {
  // Enforce visibility rules: never show draft, cancelled, or archived
  const openCampaigns = registrationOpen.filter(c => HOMEPAGE_VISIBLE_STATUSES.has(c.status)).slice(0, 4);
  const upcomingCampaigns = upcoming.filter(c => HOMEPAGE_VISIBLE_STATUSES.has(c.status)).slice(0, 4);
  const primaryFeatured = featured[0] ?? registrationOpen[0] ?? upcoming[0];
  const hasAny = primaryFeatured || openCampaigns.length > 0 || upcomingCampaigns.length > 0;

  if (!hasAny) return null;

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-sm font-semibold text-(--bpa-green) uppercase tracking-wider mb-1">{section?.eyebrow || 'Campaigns'}</p>
            <h2 className="text-3xl font-bold text-(--bpa-green)">{section?.title || 'Vaccination Campaigns'}</h2>
            <p className="text-gray-500 mt-1.5 text-sm">{section?.subtitle || 'Keep your pets healthy with BPA-organized vaccination drives'}</p>
          </div>
          <Link
            href="/campaigns"
            className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-(--bpa-navy) hover:text-(--bpa-green) transition-colors"
          >
            All campaigns <ArrowRight size={15} />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Featured hero card */}
          {primaryFeatured && (
            <div className="lg:col-span-2">
              <FeaturedCard campaign={primaryFeatured} />
            </div>
          )}

          {/* Registration open / upcoming sidebar */}
          <div className="flex flex-col gap-3">
            {openCampaigns.length > 0 && (
              <>
                <p className="text-xs font-bold text-(--bpa-green) uppercase tracking-widest">Open for Registration</p>
                {openCampaigns.filter(c => c.id !== primaryFeatured?.id).slice(0, 2).map(c => (
                  <MiniCard key={c.id} campaign={c} />
                ))}
              </>
            )}
            {upcomingCampaigns.length > 0 && (
              <>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">Coming Soon</p>
                {upcomingCampaigns.filter(c => c.id !== primaryFeatured?.id).slice(0, 2).map(c => (
                  <MiniCard key={c.id} campaign={c} />
                ))}
              </>
            )}
          </div>
        </div>

        <div className="mt-6 text-center md:hidden">
          <Link href="/campaigns" className="inline-flex items-center gap-1.5 text-sm font-semibold text-(--bpa-navy)">
            View all campaigns <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
