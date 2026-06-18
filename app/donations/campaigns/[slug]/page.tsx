import type { Metadata } from 'next';
import { getDonationCampaign, getDonationPageData } from '@/lib/api/donations';
import { notFound } from 'next/navigation';
import { Target, TrendingUp, Heart } from 'lucide-react';
import Link from 'next/link';
import ImpactStoryGrid from '@/components/donations/ImpactStoryGrid';
import DonorWall from '@/components/donations/DonorWall';
import DonationCTASection from '@/components/donations/DonationCTASection';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const campaign = await getDonationCampaign(params.slug);
    return {
      title: `${campaign.titleEn} | BPA Campaign`,
      description: campaign.descriptionEn,
    };
  } catch {
    return { title: 'Campaign Not Found' };
  }
}

export const revalidate = 60;

export default async function CampaignDetailPage({ params }: { params: { slug: string } }) {
  let campaign;
  try {
    campaign = await getDonationCampaign(params.slug);
  } catch (e) {
    notFound();
  }

  const pageData = await getDonationPageData({ next: { revalidate: 60 } } as RequestInit).catch(() => null);
  const stories = pageData?.stories ?? [];
  const donors = pageData?.donors ?? [];

  const goal = Number(campaign.goalAmount);
  const current = Number(campaign.raisedAmount);
  const progress = goal > 0 ? Math.min(Math.round((current / goal) * 100), 100) : 0;

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      
      {/* Campaign Hero Image */}
      <div className="w-full h-64 md:h-96 bg-(--bpa-navy) relative overflow-hidden">
        {campaign.featuredImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={campaign.featuredImageUrl} alt={campaign.titleEn} className="w-full h-full object-cover opacity-80" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20">
            <Target size={120} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-12">
          <div className="max-w-4xl mx-auto">
            <span className="inline-block px-3 py-1 bg-(--bpa-green) text-white text-xs font-bold rounded-full uppercase tracking-wider mb-4">
              Active Campaign
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-2">
              {campaign.titleEn}
            </h1>
            {campaign.purpose?.titleEn && (
              <p className="text-gray-300 flex items-center gap-2">
                <Heart size={16} className="text-(--bpa-green)" /> Supports: {campaign.purpose.titleEn}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-10 relative z-10">
        
        {/* Progress Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            
            <div>
              <div className="flex justify-between items-end mb-4">
                <div className="flex items-center gap-2 text-(--bpa-green) font-bold">
                  <TrendingUp size={24} />
                  <span className="text-4xl">৳{current.toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-500 font-bold uppercase tracking-wider block">Goal</span>
                  <span className="text-xl font-bold text-gray-400">৳{goal.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden mb-3 shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-(--bpa-green) to-green-400 rounded-full transition-all duration-1000 relative"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 w-full animate-pulse"></div>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-(--bpa-navy)">{progress}% Funded</span>
              </div>
            </div>

            <div>
              <Link
                href={`/donate?campaign=${campaign.id}#donate-form`}
                className="w-full flex items-center justify-center gap-2 bg-(--bpa-navy) hover:bg-black text-white py-5 rounded-xl text-xl font-bold transition-all transform hover:-translate-y-1 shadow-lg"
              >
                <Heart size={24} className="fill-current text-(--bpa-green)" />
                Donate to this Campaign
              </Link>
            </div>

          </div>
        </div>

        {/* Story / Description */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 prose prose-lg prose-blue max-w-none">
          <h2 className="text-2xl font-bold text-(--bpa-navy) mb-6 flex items-center gap-3">
            <Target className="text-(--bpa-green)" />
            Campaign Overview
          </h2>
          
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {campaign.descriptionEn || "No description provided for this campaign."}
          </div>

          {campaign.videoUrl && (
            <div className="mt-12 aspect-video bg-gray-900 rounded-xl overflow-hidden">
              <iframe 
                src={campaign.videoUrl} 
                className="w-full h-full" 
                allowFullScreen
                title="Campaign Video"
              ></iframe>
            </div>
          )}
        </div>

      </div>

      {/* Impact stories related to this campaign */}
      {stories.length > 0 && (
        <section className="py-16 border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-4">
            <ImpactStoryGrid
              stories={stories}
              title="Impact Stories"
              subtitle="See how past donations to campaigns like this one have changed lives."
              limit={3}
            />
          </div>
        </section>
      )}

      {/* Recent donors */}
      {donors.length > 0 && (
        <section className="py-12 bg-white border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-4">
            <DonorWall
              donors={donors}
              title="Recent Donors"
              limit={5}
              compact
            />
          </div>
        </section>
      )}

      <DonationCTASection
        title={`Help Fund: ${campaign.titleEn}`}
        subtitle="Your donation goes directly to animals in need. Make a secure contribution now and receive an official BPA receipt."
        campaignId={campaign.id}
        theme="green"
        compact
      />
    </div>
  );
}
