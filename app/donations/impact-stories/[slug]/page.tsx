import type { Metadata } from 'next';
import { getDonationImpactStory } from '@/lib/api/impact-stories';
import { notFound } from 'next/navigation';
import { Heart, Calendar, MapPin, Tag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const story = await getDonationImpactStory(slug);
    return {
      title: `${story.titleEn} | Impact Story | BPA`,
      description: story.shortDescriptionEn || story.fullStoryEn.substring(0, 160),
    };
  } catch {
    return { title: 'Story Not Found' };
  }
}

export const revalidate = 60;

export default async function ImpactStoryPage({ params }: PageProps) {
  const { slug } = await params;
  let story;
  try {
    story = await getDonationImpactStory(slug);
  } catch (e) {
    notFound();
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      
      {/* Hero Image Section */}
      <div className="w-full h-64 md:h-[500px] bg-(--bpa-navy) relative overflow-hidden">
        {story.afterImageUrl || story.beforeImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={story.afterImageUrl || story.beforeImageUrl} alt={story.titleEn} className="w-full h-full object-cover opacity-70" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20">
            <Heart size={120} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
        
        <div className="absolute top-8 left-8 z-20">
          <Link href="/donate#impact" className="inline-flex items-center gap-2 text-white/80 hover:text-white font-bold text-sm bg-black/30 backdrop-blur-md px-4 py-2 rounded-lg transition-colors border border-white/10">
            <ArrowLeft size={16} /> Back to Donate
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 z-10">
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-block px-3 py-1 bg-(--bpa-green) text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-sm">
                {story.storyType}
              </span>
              {story.animalType && (
                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md text-white border border-white/20 text-xs font-bold rounded-full uppercase tracking-wider shadow-sm">
                  {story.animalType}
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-4 drop-shadow-lg">
              {story.titleEn}
            </h1>
            
            <div className="flex flex-wrap gap-4 sm:gap-6 text-gray-300 text-sm font-medium">
              {story.storyDate && (
                <div className="flex items-center gap-1.5 drop-shadow">
                  <Calendar size={16} className="text-(--bpa-green)" />
                  {new Date(story.storyDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              )}
              {story.location && (
                <div className="flex items-center gap-1.5 drop-shadow">
                  <MapPin size={16} className="text-(--bpa-green)" />
                  {story.location}
                </div>
              )}
              {story.costUsed && (
                <div className="flex items-center gap-1.5 drop-shadow">
                  <Tag size={16} className="text-(--bpa-green)" />
                  Funded: ৳{Number(story.costUsed).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-8 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12">
          
          {(story.campaign?.titleEn || story.purpose?.titleEn) && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-8 flex items-start gap-4">
              <div className="bg-blue-600 text-white p-2 rounded-lg shrink-0">
                <Heart size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-(--bpa-navy) mb-1">Made Possible By Your Donations</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  This impact was directly funded by contributions to the 
                  {story.campaign?.titleEn && <Link href={`/donations/campaigns/${story.campaign.slug}`} className="font-bold text-blue-600 hover:underline mx-1">&ldquo;{story.campaign.titleEn}&rdquo;</Link>}
                  {story.campaign?.titleEn && story.purpose?.titleEn ? ' and ' : ' '}
                  {story.purpose?.titleEn && <span className="font-bold text-gray-800 mx-1">{story.purpose.titleEn}</span>}
                  fund.
                </p>
              </div>
            </div>
          )}

          {story.shortDescriptionEn && (
            <p className="text-xl text-gray-600 italic leading-relaxed mb-8 border-l-4 border-(--bpa-green) pl-6">
              {'\u201C'}{story.shortDescriptionEn}{'\u201D'}
            </p>
          )}

          <div className="prose prose-lg prose-blue max-w-none text-gray-700 leading-loose whitespace-pre-wrap">
            {story.fullStoryEn}
          </div>

          <div className="mt-12 pt-8 border-t border-gray-100 text-center">
            <h3 className="text-2xl font-bold text-(--bpa-navy) mb-4">Help Us Create More Happy Endings</h3>
            <p className="text-gray-500 mb-8">Every contribution, no matter the size, helps us rescue, treat, and care for animals in need.</p>
            <Link
              href={story.campaign?.id ? `/donate?campaign=${story.campaign.id}#donate-form` : `/donate#donate-form`}
              className="inline-flex items-center justify-center gap-2 bg-(--bpa-green) hover:bg-(--bpa-green-dark) text-white py-4 px-8 rounded-xl text-lg font-bold transition-all transform hover:-translate-y-1 shadow-lg shadow-(--bpa-green)/20"
            >
              <Heart size={20} className="fill-current" />
              Donate Now
            </Link>
          </div>
          
        </div>
      </div>
    </div>
  );
}
