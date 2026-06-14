import { Syringe, Stethoscope, Store, HeartHandshake } from 'lucide-react';

const BENEFITS = [
  {
    icon: Stethoscope,
    titleEn: 'Clinic Capacity Planning',
    titleBn: 'ক্লিনিক সক্ষমতা পরিকল্পনা',
    descEn: 'Data helps us decide where to open next and how many staff members are needed per zone.',
  },
  {
    icon: Syringe,
    titleEn: 'Vaccination Priority',
    titleBn: 'টিকাদান অগ্রাধিকার',
    descEn: 'Participating households receive priority notifications for free or subsidized vaccination drives.',
  },
  {
    icon: Store,
    titleEn: 'Community Pet Shops',
    titleBn: 'কমিউনিটি পেট শপ',
    descEn: 'Help us stock the right supplies for your specific breed and pet type in local shops.',
  },
  {
    icon: HeartHandshake,
    titleEn: 'Care Partner Onboarding',
    titleBn: 'কেয়ার পার্টনার অনবোর্ডিং',
    descEn: 'Signals from the census help us identify potential Care Partners to sustain the clinic network.',
  },
];

export default function PetCensusBenefits() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="max-w-2xl mb-16">
          <p className="text-xs font-bold text-(--bpa-green) uppercase tracking-[0.18em] mb-4">
            Why Participate?
          </p>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-(--bpa-navy) leading-tight mb-4">
            Building a better<br />future for pets.
          </h2>
          <p className="text-base text-gray-500 leading-relaxed">
            আপনার তথ্য কেন গুরুত্বপূর্ণ —{' '}
            <span className="text-gray-400">
              The 2026 Pet Census is the foundation for BPA&apos;s community-driven infrastructure.
            </span>
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BENEFITS.map((item, i) => (
            <div
              key={i}
              className="group p-8 rounded-2xl border border-gray-100 hover:border-green-100 hover:shadow-lg hover:shadow-green-900/5 transition-all duration-300 bg-white"
            >
              <div className="w-12 h-12 bg-(--bpa-green-light) rounded-xl flex items-center justify-center mb-6 group-hover:bg-(--bpa-green) transition-colors">
                <item.icon size={24} className="text-(--bpa-green) group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-bold text-(--bpa-navy) text-lg mb-2">{item.titleEn}</h3>
              <p className="text-xs text-gray-400 mb-4">{item.titleBn}</p>
              <p className="text-sm text-gray-600 leading-relaxed">{item.descEn}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
