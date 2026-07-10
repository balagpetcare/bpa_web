import type { Metadata } from 'next';
import Breadcrumb from '@/components/ui/Breadcrumb';
import SectionHeader from '@/components/ui/SectionHeader';
import FindACampWrapper from '@/components/campaigns/FindACampWrapper';

export const metadata: Metadata = {
  title: 'Find a Vaccination Camp Near You | Bangladesh Pet Association',
  description: 'Browse by Dhaka City or Outside Dhaka, then Division, District and Upazila/Zone to find an upcoming BPA vaccination camp near you.',
};

export default function FindACampPage() {
  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <Breadcrumb items={[{ label: 'Campaigns', href: '/campaigns' }, { label: 'Find a Camp' }]} />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-4">
        <SectionHeader
          eyebrow="Location Finder"
          title="Find a Vaccination Camp Near You"
          subtitle="Tell us your area — we'll show you the nearest active BPA campaign venues."
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8">
        <FindACampWrapper />
      </div>
    </div>
  );
}
