import type { Metadata } from 'next';
import Link from 'next/link';
import { Heart, Calendar, MapPin, ArrowLeft, Search } from 'lucide-react';
import { getImpactStories } from '@/lib/api/impact-stories';

export const metadata: Metadata = {
  title: 'Impact Stories | BPA',
  description: 'Read real stories of animals rescued, healed, and given a second chance — made possible by your donations.',
};

export const revalidate = 60;

const STORY_TYPE_LABELS: Record<string, string> = {
  RESCUE: 'Rescue',
  VACCINATION: 'Vaccination',
  FOOD: 'Food',
  TREATMENT: 'Treatment',
  ADOPTION: 'Adoption',
  AWARENESS: 'Awareness',
};

const STORY_TYPE_COLORS: Record<string, string> = {
  RESCUE: 'bg-rose-100 text-rose-700',
  VACCINATION: 'bg-blue-100 text-blue-700',
  FOOD: 'bg-amber-100 text-amber-700',
  TREATMENT: 'bg-emerald-100 text-emerald-700',
  ADOPTION: 'bg-violet-100 text-violet-700',
  AWARENESS: 'bg-cyan-100 text-cyan-700',
};

export default async function ImpactStoriesPage() {
  let stories;
  try {
    stories = await getImpactStories();
  } catch {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <Heart size={64} className="mx-auto text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Unable to load stories</h1>
          <p className="text-gray-500 mb-6">Please try again later.</p>
          <Link href="/donate" className="inline-flex items-center gap-2 text-(--bpa-green) font-bold hover:underline">
            <ArrowLeft size={16} /> Back to Donate
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-(--bpa-navy) py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10"><Heart size={80} /></div>
          <div className="absolute bottom-10 right-10"><Heart size={120} /></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"><Heart size={200} /></div>
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <span className="inline-block px-4 py-1.5 bg-(--bpa-green)/20 text-(--bpa-green) text-xs font-bold uppercase tracking-wider rounded-full mb-4">
            Real Impact
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-4">
            Stories of Survival
          </h1>
          <p className="text-gray-300 text-base md:text-lg max-w-2xl mx-auto">
            Every donation tells a story. Here are just a few of the lives you&apos;ve helped save, heal, and transform.
          </p>
        </div>
      </div>

      {/* Stories Grid */}
      <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
        {stories.length === 0 ? (
          <div className="text-center py-20">
            <Heart size={48} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-bold text-gray-700 mb-2">No stories yet</h2>
            <p className="text-gray-500 mb-6">Impact stories will appear here as we rescue and treat more animals.</p>
            <Link href="/donate" className="inline-flex items-center gap-2 bg-(--bpa-green) text-white py-3 px-6 rounded-xl font-bold hover:brightness-110 transition-all">
              <Heart size={18} className="fill-current" /> Support Our Work
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {stories.map((story) => (
              <Link
                key={story.id}
                href={`/donations/impact-stories/${story.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1"
              >
                {story.afterImageUrl || story.beforeImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={story.afterImageUrl || story.beforeImageUrl || ''}
                    alt={story.titleEn}
                    className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="aspect-[16/9] flex items-center justify-center bg-(--bpa-green-light)">
                    <Heart size={48} className="text-(--bpa-green)/20" />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-5 md:p-6">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${STORY_TYPE_COLORS[story.storyType] || 'bg-gray-100 text-gray-600'}`}>
                      {STORY_TYPE_LABELS[story.storyType] || story.storyType}
                    </span>
                    {story.animalType && (
                      <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-gray-100 text-gray-600">
                        {story.animalType}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-(--bpa-navy) leading-snug mb-2 line-clamp-2 group-hover:text-(--bpa-green) transition-colors">
                    {story.titleEn}
                  </h3>
                  {story.shortDescriptionEn && (
                    <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-1">
                      {story.shortDescriptionEn}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 pt-3 border-t border-gray-50">
                    {story.storyDate && (
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> {new Date(story.storyDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                    {story.location && (
                      <span className="flex items-center gap-1">
                        <MapPin size={12} /> {story.location}
                      </span>
                    )}
                    {story.costUsed && (
                      <span className="flex items-center gap-1 font-bold text-(--bpa-green)">
                        ৳{Number(story.costUsed).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      {stories.length > 0 && (
        <div className="bg-(--bpa-navy) py-16">
          <div className="mx-auto max-w-2xl px-4 text-center">
            <Heart size={40} className="mx-auto text-(--bpa-green) mb-4" />
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4">Want to Help Write the Next Story?</h2>
            <p className="text-gray-300 mb-8">Your donation directly funds rescue operations, medical treatment, vaccination drives, and community outreach programs.</p>
            <Link
              href="/donate"
              className="inline-flex items-center gap-2 bg-(--bpa-green) hover:brightness-110 text-white py-4 px-8 rounded-xl text-lg font-bold transition-all shadow-lg shadow-(--bpa-green)/20"
            >
              <Heart size={20} className="fill-current" /> Donate Now
            </Link>
          </div>
        </div>
      )}

      {/* Breadcrumb Footer */}
      <div className="bg-white border-t border-gray-100 py-4">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Link href="/" className="hover:text-(--bpa-green) transition-colors">Home</Link>
            <span>/</span>
            <span className="text-(--bpa-navy)">Impact Stories</span>
          </div>
        </div>
      </div>
    </div>
  );
}
