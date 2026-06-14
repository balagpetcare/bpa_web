import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Users, Heart, ChevronRight, Building2, Clock, TrendingUp, CreditCard } from 'lucide-react';
import { buildMetadata } from '@/lib/seo';
import { getPublicZones, getCareFundOverview } from '@/lib/api/community-care';
import { getZoneDemand } from '@/lib/api/community-membership';
import { getSeoData } from '@/lib/api/seo';
import type { CommunityZonePublic } from '@/types/bpa.types';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoData('/community-pet-care/zones').catch(() => null);
  return buildMetadata(
    {
      title: 'Community Pet Care Zones — 8 Dhaka Zones',
      description:
        'Browse all 8 BPA Community Pet Care zones in Dhaka. Each zone needs 10,000 contributors to establish a 24/7 Community Pet Clinic.',
      canonical: '/community-pet-care/zones',
      keywords: ['pet care zones', 'Dhaka', 'community pet clinic', 'BPA zones'],
    },
    seo,
  );
}

function clinicStatus(pct: number): {
  label: string;
  labelBn: string;
  badgeClass: string;
  dotClass: string;
  barClass: string;
} {
  if (pct >= 100) return {
    label: 'Clinic Ready',
    labelBn: 'ক্লিনিক প্রস্তুত',
    badgeClass: 'bg-green-100 text-green-700 border border-green-200',
    dotClass: 'bg-green-500',
    barClass: 'bg-(--bpa-green)',
  };
  if (pct >= 70) return {
    label: 'Approaching Goal',
    labelBn: 'লক্ষ্যের কাছাকাছি',
    badgeClass: 'bg-blue-100 text-blue-700 border border-blue-200',
    dotClass: 'bg-blue-500',
    barClass: 'bg-blue-500',
  };
  if (pct >= 30) return {
    label: 'Fundraising Active',
    labelBn: 'তহবিল সংগ্রহ চলছে',
    badgeClass: 'bg-amber-100 text-amber-700 border border-amber-200',
    dotClass: 'bg-amber-500',
    barClass: 'bg-amber-400',
  };
  return {
    label: 'Early Stage',
    labelBn: 'প্রাথমিক পর্যায়',
    badgeClass: 'bg-gray-100 text-gray-500 border border-gray-200',
    dotClass: 'bg-gray-400',
    barClass: 'bg-gray-300',
  };
}

function ZoneStatusBadge({ status }: { status: string }) {
  if (status === 'active')
    return (
      <span className="text-[11px] bg-green-100 text-green-700 border border-green-200 px-2.5 py-1 rounded-full font-bold uppercase tracking-wide">
        Active
      </span>
    );
  if (status === 'coming_soon')
    return (
      <span className="text-[11px] bg-amber-100 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full font-bold uppercase tracking-wide">
        Coming Soon
      </span>
    );
  return (
    <span className="text-[11px] bg-gray-100 text-gray-500 border border-gray-200 px-2.5 py-1 rounded-full font-bold uppercase tracking-wide">
      Inactive
    </span>
  );
}

export default async function ZonesPage() {
  const [zonesResult, overviewResult, demandResult] = await Promise.allSettled([
    getPublicZones({ next: { revalidate: 300, tags: ['community-zones'] } } as RequestInit),
    getCareFundOverview({ next: { revalidate: 300, tags: ['care-fund-overview'] } } as RequestInit),
    getZoneDemand({ next: { revalidate: 300, tags: ['zone-demand'] } } as RequestInit),
  ]);

  const zones: CommunityZonePublic[] = zonesResult.status === 'fulfilled' ? zonesResult.value : [];
  const overview = overviewResult.status === 'fulfilled' ? overviewResult.value : null;
  const demandRanking = demandResult.status === 'fulfilled' ? demandResult.value : [];

  const totalContributors = overview?.totalContributors ?? 0;
  const totalActiveCards = overview?.totalActiveCards ?? 0;
  const totalRaised = Number(overview?.totalAmountBdt ?? 0);

  return (
    <>
      {/* ─── Hero header ──────────────────────────────────────────── */}
      <section className="relative bg-(--bpa-navy) text-white overflow-hidden">
        {/* Grid texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }}
        />
        {/* Ambient green glow */}
        <div
          className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(26,107,60,0.18) 0%, transparent 70%)' }}
        />

        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20">
          {/* Breadcrumb */}
          <nav className="text-xs text-white/30 mb-8 flex gap-2 items-center">
            <Link href="/" className="hover:text-white/70 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/community-pet-care" className="hover:text-white/70 transition-colors">Community Pet Care</Link>
            <span>/</span>
            <span className="text-white/50">Zones</span>
          </nav>

          <p className="text-xs font-bold text-(--bpa-green) uppercase tracking-[0.18em] mb-5">
            Zone Progress
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.0] mb-4">
            8 Dhaka Zones
          </h1>
          <p className="text-2xl text-white/25 font-light tracking-wide mb-6">
            ৮টি ঢাকা জোন — কমিউনিটি ক্লিনিক অগ্রগতি
          </p>
          <p className="text-lg text-white/50 max-w-2xl leading-relaxed mb-14">
            Each zone is independently raising funds to establish a 24/7 BPA Community Pet Clinic.
            Zone target:{' '}
            <strong className="text-white font-bold">10,000 contributors × ৳3,000</strong>.
          </p>

          {/* Overview stats — instrument panel */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/[0.07] rounded-2xl overflow-hidden border border-white/[0.08] max-w-2xl">
            {[
              {
                icon: Users,
                value: totalContributors > 0 ? totalContributors.toLocaleString() : '—',
                label: 'Total Contributors',
                labelBn: 'মোট অবদানকারী',
              },
              {
                icon: CreditCard,
                value: totalActiveCards > 0 ? totalActiveCards.toLocaleString() : '—',
                label: 'Active Cards',
                labelBn: 'সক্রিয় কার্ড',
              },
              {
                icon: TrendingUp,
                value: totalRaised > 0 ? `৳${(totalRaised / 1000).toFixed(0)}K` : '৳0',
                label: 'Collected',
                labelBn: 'সংগৃহীত',
              },
            ].map(({ icon: Icon, value, label, labelBn }) => (
              <div key={label} className="bg-(--bpa-navy) hover:bg-[#1f2d50] transition-colors p-6 flex flex-col">
                <Icon size={15} className="text-(--bpa-green) mb-3 opacity-60" />
                <div className="text-3xl font-black text-white tracking-tight leading-none mb-2">
                  {value}
                </div>
                <div className="text-sm font-medium text-white/50">{label}</div>
                <div className="text-xs text-white/25 mt-0.5">{labelBn}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      </section>

      {/* ─── Zone cards grid ──────────────────────────────────────── */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">

          {zones.length === 0 ? (
            <div className="text-center py-28 text-gray-400">
              <Building2 size={52} className="mx-auto mb-5 opacity-25" />
              <p className="text-xl font-bold text-gray-500 mb-2">Zones are being set up.</p>
              <p className="text-base text-gray-400">কমিউনিটি জোন প্রস্তুত হচ্ছে। শীঘ্রই আসছে।</p>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {zones.map((zone: CommunityZonePublic, zoneIdx: number) => {
                  const current = zone.currentContributors ?? 0;
                  const target = zone.targetContributors ?? 0;
                  const pct = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;
                  const amountCollected = Number(zone.currentAmountBdt ?? 0);
                  const amountTarget = Number(zone.targetAmountBdt ?? 0);
                  const amountPct = amountTarget > 0 ? Math.min(Math.round((amountCollected / amountTarget) * 100), 100) : 0;
                  const clinic = clinicStatus(pct);
                  const remaining = Math.max(0, target - current);

                  return (
                    <article
                      key={zone.id}
                      className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
                    >
                      {/* Cover image */}
                      {zone.coverImage && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={zone.coverImage.url}
                          alt={zone.coverImage.altText ?? zone.name}
                          className="w-full h-36 object-cover"
                        />
                      )}

                      <div className="p-6 flex flex-col flex-1">
                        {/* Zone number + name row */}
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <div className="flex items-center gap-2.5">
                            <span className="w-7 h-7 rounded-lg bg-(--bpa-navy) text-white text-[11px] font-black flex items-center justify-center shrink-0">
                              {String(zoneIdx + 1).padStart(2, '0')}
                            </span>
                            <h2 className="text-lg font-black text-(--bpa-navy) leading-tight">
                              {zone.name}
                            </h2>
                          </div>
                          <ZoneStatusBadge status={zone.status} />
                        </div>

                        {/* Location */}
                        <p className="text-sm text-gray-400 flex items-center gap-1.5 mb-4 ml-9">
                          <MapPin size={12} className="shrink-0" />
                          {zone.city}, {zone.district}
                        </p>

                        {/* Clinic status */}
                        <div className="flex items-center gap-2 mb-5">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${clinic.badgeClass}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${clinic.dotClass}`} />
                            {clinic.label}
                          </span>
                          <span className="text-sm text-gray-400">{clinic.labelBn}</span>
                        </div>

                        {/* Contributors progress */}
                        <div className="mb-4">
                          <div className="flex justify-between items-baseline mb-2">
                            <span className="text-sm text-gray-500 flex items-center gap-1.5">
                              <Users size={12} />
                              <span>Contributors</span>
                              <span className="text-gray-300 text-xs">অবদানকারী</span>
                            </span>
                            <span className="text-2xl font-black text-(--bpa-navy) leading-none">
                              {pct}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${clinic.barClass}`}
                              style={{ width: `${Math.max(pct, 2)}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-gray-400 mt-1.5">
                            <span className="font-medium text-(--bpa-navy)">{current.toLocaleString()} joined</span>
                            <span>{target.toLocaleString()} goal</span>
                          </div>
                        </div>

                        {/* Amount progress */}
                        <div className="mb-4">
                          <div className="flex justify-between items-baseline mb-2">
                            <span className="text-sm text-gray-500">
                              Amount <span className="text-gray-300 text-xs">সংগৃহীত</span>
                            </span>
                            <span className="text-lg font-black text-(--bpa-navy) leading-none">
                              {amountPct}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-blue-400 transition-all"
                              style={{ width: `${Math.max(amountPct, 2)}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-gray-400 mt-1.5">
                            <span className="font-medium text-(--bpa-navy)">৳{amountCollected.toLocaleString()}</span>
                            <span>৳{amountTarget.toLocaleString()} target</span>
                          </div>
                        </div>

                        {/* Remaining note */}
                        {remaining > 0 && (
                          <p className="text-sm text-gray-400 mb-4 flex items-center gap-1.5">
                            <Clock size={13} className="shrink-0 text-gray-300" />
                            <span>
                              <strong className="text-gray-600 font-semibold">
                                {remaining.toLocaleString()}
                              </strong>{' '}
                              more contributors needed
                            </span>
                          </p>
                        )}

                        {/* Clinic address */}
                        {zone.clinicAddress && (
                          <p className="text-sm text-gray-400 mb-4 flex items-start gap-1.5 leading-relaxed">
                            <Building2 size={13} className="shrink-0 mt-0.5 text-gray-300" />
                            {zone.clinicAddress}
                          </p>
                        )}

                        {/* Description */}
                        {zone.description && (
                          <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2">
                            {zone.description}
                          </p>
                        )}

                        {/* CTA */}
                        <div className="mt-auto pt-2">
                          {zone.status === 'active' ? (
                            <Link
                              href={`/community-pet-care/contribute?zone=${zone.id}`}
                              className="flex items-center justify-center gap-2 w-full bg-(--bpa-green) text-white py-3.5 rounded-xl text-sm font-bold hover:bg-[#145530] transition-colors"
                            >
                              <Heart size={15} fill="currentColor" strokeWidth={0} />
                              Contribute to this Zone
                              <ChevronRight size={15} />
                            </Link>
                          ) : zone.status === 'coming_soon' ? (
                            <div className="flex items-center justify-center gap-2 w-full bg-amber-50 border border-amber-200 text-amber-700 py-3.5 rounded-xl text-sm font-semibold">
                              <Clock size={14} />
                              Opening Soon
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2 w-full bg-gray-50 border border-gray-200 text-gray-400 py-3.5 rounded-xl text-sm font-semibold">
                              Not Yet Active
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Prominent bottom CTA */}
              <div className="mt-14 text-center">
                <p className="text-base text-gray-500 mb-6">
                  Ready to contribute? Choose any active zone and make an impact.
                </p>
                <Link
                  href="/community-pet-care/contribute"
                  className="inline-flex items-center gap-2.5 bg-(--bpa-green) text-white px-10 py-4 rounded-xl font-bold text-base hover:bg-[#145530] transition-colors shadow-lg shadow-green-900/20"
                >
                  <Heart size={17} fill="currentColor" strokeWidth={0} />
                  Contribute ৳3,000 to a Zone
                  <ChevronRight size={16} />
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ─── Zone Priority Ranking ─────────────────────────────────── */}
      {demandRanking.length > 0 && (
        <div className="py-16 bg-white border-t border-gray-100">
          <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="mb-8">
              <p className="text-xs font-bold text-(--bpa-green) uppercase tracking-[0.18em] mb-2">
                Care Partner Card Members
              </p>
              <h2 className="text-2xl font-black text-(--bpa-navy) mb-2">Zone Priority Ranking</h2>
              <p className="text-sm text-gray-500">
                Zones are ranked by the number of paid Care Partner Card members who chose them as their preferred clinic location.
                The highest-ranked zone gets BPA&apos;s first clinic.
              </p>
            </div>

            <div className="space-y-3">
              {demandRanking.map((zone) => {
                const maxScore = demandRanking[0]?.demandScore ?? 1;
                const pct = maxScore > 0 ? Math.min(100, Math.round((zone.demandScore / maxScore) * 100)) : 0;
                const isTop = zone.rank === 1;
                return (
                  <div
                    key={zone.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border ${isTop ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'}`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-black shrink-0 ${isTop ? 'bg-(--bpa-green) text-white' : 'bg-white border border-gray-200 text-gray-500'}`}>
                      #{zone.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <p className="font-semibold text-(--bpa-navy) text-sm truncate">{zone.name}</p>
                        <p className="text-xs text-gray-500 shrink-0">{zone.paidPurchases} paid member{zone.paidPurchases !== 1 ? 's' : ''}</p>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${isTop ? 'bg-(--bpa-green)' : 'bg-gray-400'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    {isTop && (
                      <span className="text-[10px] bg-(--bpa-green) text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wide shrink-0">
                        #1 Priority
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-gray-400 mt-6 text-center">
              Ranking updates in real-time as Care Partner Cards are purchased.
            </p>
          </div>
        </div>
      )}

      {/* Back link strip */}
      <div className="py-8 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <Link
            href="/community-pet-care"
            className="inline-flex items-center gap-1.5 text-(--bpa-green) font-semibold text-sm hover:underline"
          >
            ← Back to Community Pet Care
          </Link>
        </div>
      </div>
    </>
  );
}
