import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Play, CalendarDays, MapPin } from 'lucide-react';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Button from '@/components/ui/Button';
import { getPublicSpayOffer, getPublicOfferVideoDetail } from '@/lib/api/spay-neuter';
import { getLifecycleBadge, buildBookingHref } from '@/lib/spay-neuter/offer-detail';
import { buildMetadata } from '@/lib/seo';

interface Params {
  params: Promise<{
    offerId: string;
    videoId: string;
  }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { offerId, videoId } = await params;
  try {
    const video = await getPublicOfferVideoDetail(offerId, videoId);
    if (!video) return {};

    return buildMetadata({
      title: `${video.title} | BPA Spay & Neuter`,
      description: video.description ?? `Watch this video about our Spay & Neuter campaign.`,
      ogImage: video.thumbnailUrl,
      canonical: `/spay-neuter/${offerId}/videos/${videoId}`,
    });
  } catch (error) {
    return {};
  }
}

export default async function SpayOfferVideoPage({ params }: Params) {
  const { offerId, videoId } = await params;

  let offer, video;
  try {
    [offer, video] = await Promise.all([
      getPublicSpayOffer(offerId, { next: { revalidate: 60 } }),
      getPublicOfferVideoDetail(offerId, videoId, { next: { revalidate: 60 } }),
    ]);
  } catch (error) {
    notFound();
  }

  if (!offer || !video) {
    notFound();
  }

  const badge = getLifecycleBadge(offer.lifecycleState);
  
  // Find related videos
  const relatedVideos = offer.videos?.filter(v => v.id !== video.id) || [];

  return (
    <div className="bg-white min-h-screen">
      {/* ─── Breadcrumbs ─────────────────────────────────────────── */}
      <div className="border-b border-gray-100 bg-gray-50/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumb
            items={[
              { label: 'Spay & Neuter', href: '/spay-neuter' },
              { label: offer.title, href: `/spay-neuter/${offerId}` },
              { label: 'Videos' },
              { label: video.title },
            ]}
          />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid lg:grid-cols-3 gap-10">
          
          {/* Main Video Area */}
          <div className="lg:col-span-2 space-y-8">
            <Link 
              href={`/spay-neuter/${offerId}`}
              className="inline-flex items-center text-sm font-medium text-(--bpa-green) hover:underline"
            >
              <ArrowLeft size={16} className="mr-1" /> Back to Campaign
            </Link>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-(--bpa-navy) mb-4">
                {video.title}
              </h1>

              {/* Responsive 16:9 Player */}
              <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-lg border border-gray-200">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube-nocookie.com/embed/${video.videoId}?rel=0`}
                  title={video.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </div>

              {video.description && (
                <div className="mt-6 prose prose-sm sm:prose-base text-gray-600">
                  <p className="whitespace-pre-line">{video.description}</p>
                </div>
              )}
            </div>

            {/* Related Videos */}
            {relatedVideos.length > 0 && (
              <div className="pt-8 border-t border-gray-100">
                <h2 className="text-xl font-bold text-(--bpa-navy) mb-6">More Videos from this Campaign</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {relatedVideos.slice(0, 4).map(rv => (
                    <Link
                      key={rv.id}
                      href={`/spay-neuter/${offerId}/videos/${rv.id}`}
                      className="group flex gap-4 p-3 rounded-xl border border-gray-100 hover:border-green-100 hover:shadow-md transition-all bg-white"
                    >
                      <div className="relative w-32 aspect-video bg-gray-100 rounded-lg overflow-hidden shrink-0">
                        {rv.thumbnailUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={rv.thumbnailUrl} alt={rv.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full bg-gray-200">
                            <Play size={20} className="text-gray-400" />
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play size={16} className="text-white fill-white" />
                        </div>
                      </div>
                      <div className="flex flex-col justify-center overflow-hidden">
                        <h3 className="text-sm font-bold text-(--bpa-navy) group-hover:text-(--bpa-green) transition-colors line-clamp-2">
                          {rv.title}
                        </h3>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-6">
              <div>
                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${badge.className} mb-3`}>
                  {badge.label}
                </span>
                <h3 className="text-lg font-bold text-(--bpa-navy) leading-tight mb-2">
                  {offer.title}
                </h3>
              </div>
              
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <CalendarDays size={16} className="text-(--bpa-green) mt-0.5 shrink-0" />
                  <span>{offer.startsAt ? new Date(offer.startsAt).toLocaleDateString() : ''} – {offer.endsAt ? new Date(offer.endsAt).toLocaleDateString() : ''}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin size={16} className="text-(--bpa-green) mt-0.5 shrink-0" />
                  <span>{offer.clinics?.length || 0} Participating Clinics</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                {offer.bookable ? (
                  <Link href={buildBookingHref(offer.id)}>
                    <Button
                      variant="primary"
                      className="w-full shadow-md hover:shadow-lg transition-all"
                    >
                      Book Appointment
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" className="w-full" disabled>
                    Not Accepting Bookings
                  </Button>
                )}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
